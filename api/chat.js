/* =========================================================
   Gill AI Ultimate v8
   api/chat.js
   SIMPLE OPENROUTER CHAT API
========================================================= */

export default async function handler(req, res) {

    /* -----------------------------------------------------
       ONLY POST
    ----------------------------------------------------- */

    if (req.method !== "POST") {

        return res.status(405).json({
            success: false,
            error: "Method Not Allowed"
        });

    }

    try {

        /* -------------------------------------------------
           API KEY
        ------------------------------------------------- */

        const apiKey =
            process.env.OPENROUTER_API_KEY;

        if (!apiKey) {

            return res.status(500).json({
                success: false,
                error:
                    "OPENROUTER_API_KEY is missing in Vercel Environment Variables."
            });

        }

        /* -------------------------------------------------
           BODY
        ------------------------------------------------- */

        let body =
            req.body || {};

        if (typeof body === "string") {

            try {

                body =
                    JSON.parse(body);

            } catch {

                return res.status(400).json({
                    success: false,
                    error: "Invalid JSON body."
                });

            }

        }

        const message =
            String(
                body.message || ""
            ).trim();

        if (!message) {

            return res.status(400).json({
                success: false,
                error:
                    "Message is required."
            });

        }

        /* -------------------------------------------------
           OPENROUTER
        ------------------------------------------------- */

        const response =
            await fetch(
                "https://openrouter.ai/api/v1/chat/completions",
                {

                    method: "POST",

                    headers: {

                        "Authorization":
                            "Bearer " +
                            apiKey,

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json",

                        "HTTP-Referer":
                            "https://gill-ai.vercel.app",

                        "X-Title":
                            "Gill AI Ultimate v8"

                    },

                    body:
                        JSON.stringify({

                            model:
                                "openrouter/free",

                            messages: [

                                {
                                    role:
                                        "system",

                                    content:
                                        "You are Gill AI Ultimate v8, a helpful AI assistant. Reply in the same language as the user. Be clear, friendly and concise."
                                },

                                {
                                    role:
                                        "user",

                                    content:
                                        message
                                }

                            ]

                        })

                }
            );

        /* -------------------------------------------------
           READ RESPONSE
        ------------------------------------------------- */

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

        /* -------------------------------------------------
           JSON PARSE
        ------------------------------------------------- */

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

        /* -------------------------------------------------
           API ERROR
        ------------------------------------------------- */

        if (!response.ok) {

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
                    response.status

            });

        }

        /* -------------------------------------------------
           GET REPLY
        ------------------------------------------------- */

        const reply =
            data?.choices?.[0]?.message?.content;

        if (!reply) {

            return res.status(502).json({

                success: false,

                error:
                    "OpenRouter response में AI reply नहीं मिला."

            });

        }

        /* -------------------------------------------------
           SUCCESS
        ------------------------------------------------- */

        return res.status(200).json({

            success:
                true,

            reply:
                String(reply).trim()

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