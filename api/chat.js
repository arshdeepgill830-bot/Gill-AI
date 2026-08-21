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
    const cost = 1;

    let creditDeducted = false;

    try {
        const { messages } = req.body || {};

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Messages are required"
            });
        }

        // Make sure the guest user exists.
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

        // Atomically reserve one credit.
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
                success: false,
                error: "Insufficient credits",
                message: "आपके credits खत्म हो गए हैं।"
            });
        }

        creditDeducted = true;

        // OpenRouter API call.
        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "HTTP-Referer": "https://gill-ai.vercel.app",
                    "X-Title": "Gill AI Ultimate v9"
                },
                body: JSON.stringify({
                    model: "openrouter/free",
                    messages
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

        // Refund the credit if OpenRouter failed.
        if (!response.ok || !data) {
            if (creditDeducted) {
                await sql`
                    UPDATE users
                    SET
                        credits = credits + ${cost},
                        chat_used = GREATEST(chat_used - 1, 0),
                        updated_at = NOW()
                    WHERE id = ${userId}
                `;
            }

            return res.status(502).json({
                success: false,
                error: "AI server error",
                details: data?.error?.message || text.slice(0, 500)
            });
        }

        const assistantMessage =
            data?.choices?.[0]?.message?.content;

        if (!assistantMessage) {
            if (creditDeducted) {
                await sql`
                    UPDATE users
                    SET
                        credits = credits + ${cost},
                        chat_used = GREATEST(chat_used - 1, 0),
                        updated_at = NOW()
                    WHERE id = ${userId}
                `;
            }

            return res.status(502).json({
                success: false,
                error: "AI returned an empty response"
            });
        }

        // Return the same useful OpenAI-compatible response structure.
        return res.status(200).json({
            success: true,
            choices: [
                {
                    message: {
                        role: "assistant",
                        content: assistantMessage
                    }
                }
            ],
            usage: {
                creditsRemaining: reserved[0].credits
            }
        });

    } catch (error) {
        console.error("Gill AI Chat Error:", error);

        // Refund if an unexpected error happened after deduction.
        if (creditDeducted) {
            try {
                await sql`
                    UPDATE users
                    SET
                        credits = credits + ${cost},
                        chat_used = GREATEST(chat_used - 1, 0),
                        updated_at = NOW()
                    WHERE id = ${userId}
                `;
            } catch (refundError) {
                console.error(
                    "Gill AI Credit Refund Error:",
                    refundError
                );
            }
        }

        return res.status(500).json({
            success: false,
            error: "Chat request failed"
        });
    }
}

अब ध्यान से

1. GitHub में "api/chat.js" खोलो।
2. पूरा पुराना code हटाओ।
3. ऊपर वाला पूरा code paste करो।
4. Commit changes दबाओ।
5. Vercel में नया deployment Ready होने दो।
6. फिर Gill AI में एक chat भेजो।

अगर सब सही हुआ तो:

100 credits → 99 credits
Chat used: 0 → 1

और "/api/usage" खोलने पर नया balance दिखेगा।

⚠️ एक महत्वपूर्ण सीमा: अभी सभी users "guest" ID इस्तेमाल कर रहे हैं। इसलिए बाद में authentication जोड़ना जरूरी होगा, वरना सभी users एक ही credits balance share करेंगे।