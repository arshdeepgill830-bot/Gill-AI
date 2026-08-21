import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            error: "Method Not Allowed"
        });
    }

    const sql = neon(process.env.DATABASE_URL);
    const userId = "guest";
    const cost = 5;

    let creditDeducted = false;

    try {
        const { prompt } = req.body || {};

        if (!prompt || typeof prompt !== "string") {
            return res.status(400).json({
                success: false,
                error: "Prompt is required"
            });
        }

        // Create user if needed
        await sql`
            INSERT INTO users (
                id,
                plan,
                credits,
                chat_used,
                image_used,
                video_used
            )
            VALUES (
                ${userId},
                'Free',
                100,
                0,
                0,
                0
            )
            ON CONFLICT (id) DO NOTHING
        `;

        // Deduct 5 credits atomically
        const reserved = await sql`
            UPDATE users
            SET
                credits = credits - ${cost},
                image_used = image_used + 1,
                updated_at = NOW()
            WHERE
                id = ${userId}
                AND credits >= ${cost}
                AND image_used < 5
            RETURNING credits
        `;

        if (!reserved.length) {
            return res.status(402).json({
                success: false,
                error: "Image limit or credits reached"
            });
        }

        creditDeducted = true;

        const response = await fetch(
            "https://openrouter.ai/api/v1/images",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "HTTP-Referer":
                        "https://gill-ai.vercel.app",
                    "X-Title":
                        "Gill AI Ultimate v9"
                },
                body: JSON.stringify({
                    model: "qwen/qwen-image-3",
                    prompt: prompt
                })
            }
        );

        const text = await response.text();

        let data;

        try {
            data = JSON.parse(text);
        } catch {
            data = null;
        }

        if (!response.ok || !data) {

            await sql`
                UPDATE users
                SET
                    credits = credits + ${cost},
                    image_used =
                        GREATEST(image_used - 1, 0),
                    updated_at = NOW()
                WHERE id = ${userId}
            `;

            return res.status(502).json({
                success: false,
                error: "Image generation failed",
                details:
                    data?.error?.message ||
                    text.slice(0, 500)
            });
        }

        const image =
            data?.data?.[0]?.url ||
            data?.data?.[0]?.b64_json;

        if (!image) {

            await sql`
                UPDATE users
                SET
                    credits = credits + ${cost},
                    image_used =
                        GREATEST(image_used - 1, 0),
                    updated_at = NOW()
                WHERE id = ${userId}
            `;

            return res.status(502).json({
                success: false,
                error: "No image returned"
            });
        }

        return res.status(200).json({
            success: true,
            image: image,
            credits: reserved[0].credits
        });

    } catch (error) {

        console.error(
            "Gill AI Image Error:",
            error
        );

        if (creditDeducted) {
            try {
                await sql`
                    UPDATE users
                    SET
                        credits = credits + ${cost},
                        image_used =
                            GREATEST(image_used - 1, 0),
                        updated_at = NOW()
                    WHERE id = ${userId}
                `;
            } catch (refundError) {
                console.error(
                    "Image credit refund error:",
                    refundError
                );
            }
        }

        return res.status(500).json({
            success: false,
            error: "Image request failed"
        });
    }
}