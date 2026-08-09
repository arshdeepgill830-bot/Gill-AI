export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Only POST method is allowed."
        });
    }

    try {
        const { prompt, duration, aspectRatio } = req.body || {};

        if (!prompt || !String(prompt).trim()) {
            return res.status(400).json({
                error: "Video prompt is required."
            });
        }

        const token = process.env.REPLICATE_API_TOKEN;

        if (!token) {
            return res.status(500).json({
                error: "REPLICATE_API_TOKEN is missing in Vercel."
            });
        }

        const model = process.env.REPLICATE_VIDEO_MODEL;

        if (!model) {
            return res.status(500).json({
                error: "REPLICATE_VIDEO_MODEL is missing in Vercel."
            });
        }

        const response = await fetch(
            "https://api.replicate.com/v1/predictions",
            {
                method: "POST",

                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    version: model,

                    input: {
                        prompt: String(prompt).trim(),
                        duration: Number(duration) || 20,
                        aspect_ratio: aspectRatio || "9:16"
                    }
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Replicate Error:", data);

            return res.status(response.status).json({
                error:
                    data?.detail ||
                    data?.error ||
                    "Replicate video generation failed."
            });
        }

        let videoUrl = null;

        if (
            data.status === "succeeded" &&
            data.output
        ) {
            videoUrl = Array.isArray(data.output)
                ? data.output[0]
                : data.output;
        }

        return res.status(200).json({
            success: true,
            predictionId: data.id,
            status: data.status,
            videoUrl: videoUrl
        });

    } catch (error) {

        console.error(
            "Gill AI Video Error:",
            error
        );

        return res.status(500).json({
            error:
                error.message ||
                "Internal video server error."
        });
    }
                      }
