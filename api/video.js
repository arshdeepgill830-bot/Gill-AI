/* =========================================================
   Gill AI Ultimate
   api/video.js
   MAGIC HOUR TEXT-TO-VIDEO
========================================================= */

export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            error: "Method Not Allowed"
        });
    }

    try {

        const apiKey =
            process.env.MAGIC_HOUR_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                success: false,
                error:
                    "MAGIC_HOUR_API_KEY is missing in Vercel."
            });
        }

        let body = req.body || {};

        if (typeof body === "string") {
            try {
                body = JSON.parse(body);
            } catch {
                body = {};
            }
        }

        const prompt =
            String(body.prompt || "").trim();

        let duration =
            Number(body.duration || 5);

        let aspectRatio =
            String(
                body.aspectRatio || "9:16"
            );

        if (!prompt) {
            return res.status(400).json({
                success: false,
                error:
                    "Video prompt is required."
            });
        }

        /* -------------------------------------------------
           SAFE SETTINGS
        ------------------------------------------------- */

        if (
            !Number.isFinite(duration) ||
            duration < 1 ||
            duration > 30
        ) {
            duration = 5;
        }

        duration = Math.round(duration);

        const allowedRatios = [
            "9:16",
            "16:9",
            "1:1"
        ];

        if (
            !allowedRatios.includes(
                aspectRatio
            )
        ) {
            aspectRatio = "9:16";
        }

        /* -------------------------------------------------
           MAGIC HOUR API
        ------------------------------------------------- */

        const response =
            await fetch(
                "https://api.magichour.ai/v1/text-to-video",
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            "Bearer " + apiKey,

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            name:
                                "Gill AI Video",

                            end_seconds:
                                duration,

                            aspect_ratio:
                                aspectRatio,

                            resolution:
                                "480p",

                            model:
                                "ltx-2.3",

                            audio:
                                false,

                            style: {
                                prompt:
                                    prompt
                            }

                        })
                }
            );

        const raw =
            await response.text();

        console.log(
            "MAGIC HOUR STATUS:",
            response.status
        );

        console.log(
            "MAGIC HOUR RESPONSE:",
            raw.substring(0, 3000)
        );

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
                    "Magic Hour ने valid JSON response नहीं भेजा।",
                status:
                    response.status,
                details:
                    raw.substring(0, 1000)
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
                    data?.message ||
                    data?.error ||
                    data?.detail ||
                    "Magic Hour video request failed.",

                magic_hour_response:
                    data

            });

        }

        /* -------------------------------------------------
           VIDEO PROJECT ID
        ------------------------------------------------- */

        const projectId =
            data?.id ||
            data?.video_id ||
            data?.videoId ||
            "";

        if (!projectId) {

            return res.status(502).json({

                success: false,

                error:
                    "Magic Hour video project ID नहीं मिला।",

                magic_hour_response:
                    data

            });

        }

        return res.status(200).json({

            success: true,

            status:
                "processing",

            request_id:
                projectId,

            requestId:
                projectId,

            project_id:
                projectId,

            projectId:
                projectId,

            aspectRatio:
                aspectRatio,

            duration:
                duration,

            resolution:
                "480p",

            model:
                "ltx-2.3"

        });

    } catch (error) {

        console.error(
            "Gill AI Magic Hour Video Error:",
            error
        );

        return res.status(500).json({

            success: false,

            error:
                error?.message ||
                "Internal video server error."

        });

    }

}