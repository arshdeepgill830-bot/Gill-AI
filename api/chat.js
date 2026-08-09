
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method Not Allowed"
        });
    }

    try {
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "OPENROUTER_API_KEY is missing in Vercel."
            });
        }

        const { message } = req.body || {};

        if (!message) {
            return res.status(400).json({
                error: "Message required"
            });
        }

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://gill-ai.vercel.app",
                    "X-Title": "Gill AI Ultimate"
                },
                body: JSON.stringify({
                    model: "openai/gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content:
                                "You are Gill AI Ultimate, a helpful AI assistant. Reply clearly in Hindi or English."
                        },
                        {
                            role: "user",
                            content: message
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("OpenRouter API Error:", data);

            return res.status(response.status).json({
                error:
                    data?.error?.message ||
                    "OpenRouter API request failed"
            });
        }

        const reply =
            data?.choices?.[0]?.message?.content;

        if (!reply) {
            return res.status(500).json({
                error: "AI response unavailable"
            });
        }

        return res.status(200).json({
            reply: reply
        });

    } catch (error) {
        console.error("Gill AI Server Error:", error);

        return res.status(500).json({
            error:
                error?.message ||
                "Server Error"
        });
    }
}
