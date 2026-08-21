
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
                    model: "google/gemini-2.5-flash-image",
                    prompt: prompt,
                    n: 1,
                    aspect_ratio: "1:1",
                    resolution: "1K",
                    output_format: "png"
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

        const imageData = data?.data?.[0]?.b64_json;
        const mediaType =
            data?.data?.[0]?.media_type || "image/png";

        if (!imageData) {
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
            image: `data:${mediaType};base64,${imageData}`,
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