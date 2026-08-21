export default async function handler(req, res) {

    if (req.method !== "GET") {
        return res.status(405).json({
            success: false,
            error: "Method Not Allowed"
        });
    }

    try {

        const predictionId =
            String(req.query?.id || "").trim();

        if (!predictionId) {
            return res.status(400).json({
                success: false,
                error: "Prediction ID is required."
            });
        }

        const token =
            process.env.REPLICATE_API_TOKEN;

        if (!token) {
            return res.status(500).json({
                success: false,
                error:
                    "REPLICATE_API_TOKEN is missing in Vercel."
            });
        }

        const response =
            await fetch(
                "https://api.replicate.com/v1/predictions/" +
                encodeURIComponent(predictionId),
                {
                    method: "GET",
                    headers: {
                        "Authorization":
                            "Bearer " + token,
                        "Content-Type":
                            "application/json"
                    }
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            console.error(
                "Replicate Status Error:",
                data
            );

            return res.status(response.status).json({
                success: false,
                error:
                    data?.detail ||
                    data?.error ||
                    "Replicate status request failed."
            });
        }

        const currentStatus =
            String(
                data?.status || ""
            ).toLowerCase();

        let videoUrl = "";

        if (data?.output) {

            if (
                Array.isArray(data.output)
            ) {
                videoUrl =
                    data.output[0] || "";
            } else {
                videoUrl =
                    String(data.output);
            }
        }

        if (
            currentStatus === "succeeded"
        ) {

            if (!videoUrl) {
                return res.status(502).json({
                    success: false,
                    error:
                        "Video completed but no video URL was returned."
                });
            }

            return res.status(200).json({
                success: true,
                status: "succeeded",
                video_url: videoUrl,
                videoUrl: videoUrl,
                output: data.output
            });
        }

        if (
            currentStatus === "failed" ||
            currentStatus === "canceled" ||
            currentStatus === "cancelled"
        ) {

            return res.status(200).json({
                success: false,
                status: currentStatus,
                error:
                    data?.error ||
                    "Replicate video generation failed."
            });
        }

        return res.status(200).json({
            success: true,
            status:
                currentStatus || "processing",
            video_url: "",
            videoUrl: "",
            message:
                "Video अभी तैयार हो रही है।"
        });

    } catch (error) {

        console.error(
            "Gill AI Video Status Error:",
            error
        );

        return res.status(500).json({
            success: false,
            error:
                error?.message ||
                "Internal video status error."
        });
    }
}