/* =========================================================
   Gill AI Ultimate
   api/video.js
   FAL.AI + PIXVERSE V6
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
            process.env.FAL_KEY;

        if (!apiKey) {
            return res.status(500).json({
                success: false,
                error:
                    "FAL_KEY is missing in Vercel Environment Variables."
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

        let aspectRatio =
            String(
                body.aspectRatio ||
                "9:16"
            );

        let duration =
            Number(
                body.duration || 5
            );

        if (!prompt) {
            return res.status(400).json({
                success: false,
                error: "Video prompt is required."
            });
        }

        const allowedRatios = [
            "9:16",
            "16:9",
            "1:1",
            "4:3",
            "3:4",
            "2:3",
            "3:2",
            "21:9"
        ];

        if (!allowedRatios.includes(aspectRatio)) {
            aspectRatio = "9:16";
        }

        if (
            !Number.isFinite(duration) ||
            duration < 1 ||
            duration > 15
        ) {
            duration = 5;
        }

        duration = Math.round(duration);

        /* -------------------------------------------------
           FAL.AI PIXVERSE V6
        ------------------------------------------------- */

        const endpoint =
            "https://queue.fal.run/" +
            "fal-ai/pixverse/v6/text-to-video";

        const input = {
            prompt: prompt,
            aspect_ratio: aspectRatio,
            resolution: "360p",
            duration: duration,
            generate_audio_switch: false
        };

        console.log(
            "FAL VIDEO REQUEST:",
            {
                endpoint,
                input
            }
        );

        const response =
            await fetch(
                endpoint,
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            "Key " + apiKey,

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body:
                        JSON.stringify(input)
                }
            );

        const raw =
            await response.text();

        console.log(
            "FAL VIDEO STATUS:",
            response.status
        );

        console.log(
            "FAL VIDEO RESPONSE:",
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
                    "fal.ai ने valid JSON response नहीं भेजा।",
                status:
                    response.status,
                details:
                    raw.substring(0, 1000)
            });

        }

        if (!response.ok) {

            return res.status(
                response.status
            ).json({
                success: false,
                error:
                    data?.detail ||
                    data?.error ||
                    data?.message ||
                    "fal.ai video request failed.",
                fal_response:
                    data
            });

        }

        /*
         * fal.ai queue response normally contains:
         * request_id
         * status_url
         * response_url
         */

        const requestId =
            data?.request_id ||
            data?.requestId ||
            "";

        const statusUrl =
            data?.status_url ||
            data?.statusUrl ||
            "";

        const responseUrl =
            data?.response_url ||
            data?.responseUrl ||
            "";

        if (!requestId) {

            return res.status(502).json({
                success: false,
                error:
                    "fal.ai request ID नहीं मिला।",
                fal_response:
                    data
            });

        }

        return res.status(200).json({

            success: true,

            status:
                "processing",

            request_id:
                requestId,

            requestId:
                requestId,

            status_url:
                statusUrl,

            statusUrl:
                statusUrl,

            response_url:
                responseUrl,

            responseUrl:
                responseUrl,

            aspectRatio:
                aspectRatio,

            duration:
                duration,

            resolution:
                "360p",

            model:
                "fal-ai/pixverse/v6/text-to-video"

        });

    } catch (error) {

        console.error(
            "Gill AI FAL Video Error:",
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