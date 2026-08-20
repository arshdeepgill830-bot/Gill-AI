/* =========================================================
   Gill AI Ultimate v8
   api/chat.js
   OPENROUTER CHAT API
========================================================= */

export default async function handler(req, res) {

    // Allow only POST
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            error: "Method Not Allowed"
        });
    }

    try {

        // OpenRouter API Key
        const apiKey =
            process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                success: false,
                error:
                    "OPENROUTER_API_KEY is missing in Vercel Environment Variables."
            });
        }

        // Read request body
        let body = req.body || {};

        // Some setups may send body as string
        if (typeof body === "string") {
            try {
                body = JSON.parse(body);
            } catch {
                body = {};
            }
        }

        const message =
            String(
                body.message ||
                body.prompt ||
                ""
            ).trim();

        if (!message) {
            return res.status(400).json({
                success: false,
                error: "Message is required."
            });
        }

        // OpenRouter request
        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Authorization":
                        `Bearer ${apiKey}`,

                    "Content-Type":
                        "application/json",

                    "Accept":
                        "application/json",

                    "HTTP-Referer":
                        "https://gill-ai.vercel.app",

                    "X-Title":
                        "Gill AI Ultimate v8"
                },

                body: JSON.stringify({

                    model:
                        "openrouter/free",

                    messages: [

                        {
                            role: "system",

                            content:
                                "You are Gill AI Ultimate v8, a helpful AI assistant. Answer clearly, naturally and accurately."
                        },

                        {
                            role: "user",

                            content: message
                        }

                    ]

                })
            }
        );

        // Read raw response first
        const raw =
            await response.text();

        console.log(
            "OPENROUTER STATUS:",
            response.status
        );

        console.log(
            "OPENROUTER RESPONSE:",
            raw.substring(0, 2000)
        );

        // Parse JSON
        let data = {};

        try {

            data =
                raw
                    ? JSON.parse(raw)
                    : {};

        } catch (error) {

            return res.status(502).json({

                success: false,

                error:
                    "OpenRouter ने valid JSON response नहीं भेजा।",

                status:
                    response.status,

                details:
                    raw.substring(0, 1000)

            });
        }

        // OpenRouter error
        if (!response.ok) {

            return res.status(
                response.status
            ).json({

                success: false,

                error:
                    data?.error?.message ||
                    data?.error ||
                    "OpenRouter request failed.",

                status:
                    response.status

            });
        }

        // Get AI reply
        const reply =
            data?.choices?.[0]?.message?.content ||
            data?.choices?.[0]?.text ||
            "";

        if (!reply) {

            return res.status(502).json({

                success: false,

                error:
                    "AI response में reply नहीं मिला।",

                details:
                    data

            });
        }

        // Success
        return res.status(200).json({

            success: true,

            reply: String(reply)

        });

    } catch (error) {

        console.error(
            "Gill AI Chat Error:",
            error
        );

        return res.status(500).json({

            success: false,

            error:
                error?.message ||
                "Internal AI server error."

        });
    }
}