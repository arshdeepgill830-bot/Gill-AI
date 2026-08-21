/* =========================================================
   Gill AI Ultimate v8
   api/chat.js
   OPENROUTER CHAT API
========================================================= */

export default async function handler(req, res) {

    // ONLY POST
    if (req.method !== "POST") {

        return res.status(405).json({
            success: false,
            error: "Method Not Allowed"
        });

    }

    try {

        // -------------------------------------------------
        // OPENROUTER API KEY
        // -------------------------------------------------

        const apiKey =
            process.env.OPENROUTER_API_KEY;

        if (!apiKey) {

            return res.status(500).json({
                success: false,
                error:
                    "OPENROUTER_API_KEY is missing in Vercel Environment Variables."
            });

        }

        // -------------------------------------------------
        // READ BODY
        // -------------------------------------------------

        let body = req.body || {};

        if (typeof body === "string") {

            try {

                body = JSON.parse(body);

            } catch {

                return res.status(400).json({
                    success: false,
                    error: "Invalid JSON body."
                });

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

        // -------------------------------------------------
        // OPENROUTER REQUEST
        // -------------------------------------------------

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",

                headers: {

                    "Authorization":
                        "Bearer " + apiKey,

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
                                "You are Gill AI Ultimate v8, a helpful and friendly AI assistant. Reply in the same language as the user. Give clear and useful answers."
                        },

                        {
                            role: "user",

                            content:
                                message
                        }

                    ]

                })

            }
        );

        // -------------------------------------------------
        // READ RESPONSE
        // -------------------------------------------------

        const raw =
            await response.text();

        console.log(
            "OPENROUTER STATUS:",
            response.status
        );

        console.log(
            "OPENROUTER RESPONSE:",
            raw.substring(
                0,
                3000
            )
        );

        // -------------------------------------------------
        // PARSE JSON
        // -------------------------------------------------

        let data = {};

        try {

            data =
                raw
                    ? JSON.parse(raw)
                    : {};

        } catch {

            return res.status(502).json({

                success: false,

                error:
                    "OpenRouter ने valid JSON response नहीं भेजा।",

                status:
                    response.status,

                details:
                    raw.substring(
                        0,
                        1000
                    )

            });

        }

        // -------------------------------------------------
        // OPENROUTER ERROR
        // -------------------------------------------------

        if (!response.ok) {

            console.error(
                "OPENROUTER ERROR:",
                data
            );

            return res.status(
                response.status
            ).json({

                success: false,

                error:
                    data?.error?.message ||
                    data?.error ||
                    data?.message ||
                    "OpenRouter request failed.",

                status:
                    response.status,

                details:
                    data

            });

        }

        // -------------------------------------------------
        // GET AI REPLY
        // -------------------------------------------------

        let reply =
            data?.choices?.[0]?.message?.content;

        if (
            typeof reply !== "string"
        ) {

            reply = "";

        }

        reply =
            reply.trim();

        if (!reply) {

            return res.status(502).json({

                success: false,

                error:
                    "AI response में reply नहीं मिला।",

                response:
                    data

            });

        }

        // -------------------------------------------------
        // SUCCESS
        // -------------------------------------------------

        return res.status(200).json({

            success:
                true,

            reply:
                reply

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
                "Internal chat server error."

        });

    }

}