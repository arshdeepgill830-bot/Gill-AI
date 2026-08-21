import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method Not Allowed"
        });
    }

    const sql = neon(process.env.DATABASE_URL);
    const userId = "guest";
    const cost = 1;

    let creditDeducted = false;

    try {
        const { message } = req.body || {};

        if (!message || typeof message !== "string") {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        // Create guest user if it doesn't exist
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

        // Deduct 1 credit atomically
        const reserved = await sql`
            UPDATE users
            SET
                credits = credits - ${cost},
                chat_used = chat_used + 1,
                updated_at = NOW()
            WHERE
                id = ${userId}
                AND credits >= ${cost}
            RETURNING credits
        `;

        if (!reserved.length) {
            return res.status(402).json({
                error: "Insufficient credits",
                message: "आपके credits खत्म हो गए हैं।"
            });
        }

        creditDeducted = true;

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
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
                    model: "openrouter/free",
                    messages: [
                        {
                            role: "user",
                            content: message
                        }
                    ]
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

        // Refund if OpenRouter fails
        if (!response.ok || !data) {

            if (creditDeducted) {
                await sql`
                    UPDATE users
                    SET
                        credits = credits + ${cost},
                        chat_used =
                            GREATEST(chat_used - 1, 0),
                        updated_at = NOW()
                    WHERE id = ${userId}
                `;
            }

            return res.status(502).json({
                error: "AI server error",
                details:
                    data?.error?.message ||
                    text.slice(0, 500)
            });
        }

        const reply =
            data?.choices?.[0]?.message?.content;

        if (!reply) {

            if (creditDeducted) {
                await sql`
                    UPDATE users
                    SET
                        credits = credits + ${cost},
                        chat_used =
                            GREATEST(chat_used - 1, 0),
                        updated_at = NOW()
                    WHERE id = ${userId}
                `;
            }

            return res.status(502).json({
                error: "AI returned an empty response"
            });
        }

        // Keep the response format compatible
        // with your existing frontend.
        return res.status(200).json({
            reply: reply,
            credits: reserved[0].credits
        });

    } catch (error) {

        console.error(
            "Gill AI Chat Error:",
            error
        );

        // Refund credit on unexpected failure
        if (creditDeducted) {
            try {
                await sql`
                    UPDATE users
                    SET
                        credits = credits + ${cost},
                        chat_used =
                            GREATEST(chat_used - 1, 0),
                        updated_at = NOW()
                    WHERE id = ${userId}
                `;
            } catch (refundError) {
                console.error(
                    "Credit Refund Error:",
                    refundError
                );
            }
        }

        return res.status(500).json({
            error: "Chat request failed"
        });
    }
}