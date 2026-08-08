export default async function handler(req, res) {

    // Only POST Request
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method Not Allowed"
        });
    }

    try {

        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                error: "Message required"
            });
        }

        const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        `Bearer ${process.env.OPENAI_API_KEY}`
                },

                body: JSON.stringify({
                    model: "gpt-4.1-mini",

                    messages: [
                        {
                            role: "system",
                            content:
                                "You are Gill AI, a helpful AI assistant."
                        },
                        {
                            role: "user",
                            content: message
                        }
                    ],

                    temperature: 0.7
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error:
                    data.error?.message ||
                    "OpenAI API request failed"
            });
        }

        const reply =
            data.choices?.[0]?.message?.content ||
            "AI response unavailable";

        return res.status(200).json({
            reply: reply
        });

    } catch (error) {

        console.error("Gill AI API Error:", error);

        return res.status(500).json({
            error: "Server Error"
        });
    }
              }
