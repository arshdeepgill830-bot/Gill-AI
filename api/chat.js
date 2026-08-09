export default async function handler(req, res) {

    // Only POST
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method Not Allowed"
        });
    }

    try {

        // Get Gemini API key from Vercel
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "GEMINI_API_KEY is missing in Vercel."
            });
        }

        // Get user message
        const { message } = req.body || {};

        if (!message) {
            return res.status(400).json({
                error: "Message required"
            });
        }

        // Gemini 3.5 Flash
        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": apiKey
                },

                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [
                                {
                                    text:
                                        "You are Gill AI, a helpful AI assistant. Reply clearly in Hindi or English.\n\nUser: " +
                                        message
                                }
                            ]
                        }
                    ]
                })
            }
        );

        // Read response
        const data = await response.json();

        // Gemini API error
        if (!response.ok) {

            console.error(
                "Gemini API Error:",
                data
            );

            return res.status(response.status).json({
                error:
                    data?.error?.message ||
                    "Gemini API request failed"
            });
        }

        // Get AI reply
        const reply =
            data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!reply) {

            console.error(
                "Gemini response:",
                data
            );

            return res.status(500).json({
                error: "AI response unavailable"
            });
        }

        // Success
        return res.status(200).json({
            reply: reply
        });

    } catch (error) {

        console.error(
            "Gill AI Gemini Server Error:",
            error
        );

        return res.status(500).json({
            error:
                error?.message ||
                "Server Error"
        });
    }
}
