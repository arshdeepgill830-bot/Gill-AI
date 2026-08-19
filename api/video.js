export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const { prompt, aspectRatio = "9:16" } = req.body || {};

        if (!prompt || !String(prompt).trim()) {
            return res.status(400).json({
                error: "Video prompt is required."
            });
        }

        const apiKey = process.env.FAL_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "FAL_KEY is not configured."
            });
        }

        const response = await fetch(
            "https://queue.fal.run/fal-ai/wan/v2.2-a14b/text-to-video",
            {
                method: "POST",

                headers: {
                    "Authorization": `Key ${apiKey}`,
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    prompt: String(prompt).trim(),
                    aspect_ratio: String(aspectRatio)
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("fal.ai error:", data);

            return res.status(response.status).json({
                error:
                    data?.detail ||
                    data?.error ||
                    "fal.ai video request failed."
            });
        }

        return res.status(200).json({
            success: true,
            request_id: data.request_id || null,
            status_url: data.status_url || null,
            response_url: data.response_url || null
        });

    } catch (error) {

        console.error("Video API Error:", error);

        return res.status(500).json({
            error: error.message || "Video generation failed."
        });
    }
}