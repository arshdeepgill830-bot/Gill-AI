/* =========================================================
   Gill AI Ultimate v8
   api/video.js
   FAL.AI WAN 2.2 5B TEXT TO VIDEO
   MAX 5 SECOND
========================================================= */

export default async function handler(req, res) {

    /* ONLY POST */
    if (req.method !== "POST") {

        return res.status(405).json({
            success: false,
            error: "Method Not Allowed"
        });

    }

    try {

        /* FAL KEY */
        const apiKey =
            process.env.FAL_KEY;

        if (!apiKey) {

            return res.status(500).json({
                success: false,
                error:
                    "FAL_KEY is missing in Vercel Environment Variables."
            });

        }

        /* BODY */
        let body = req.body || {};

        if (typeof body === "string") {

            try {
                body = JSON.parse(body);
            } catch {
                body = {};
            }

        }

        const prompt =
            String(
                body.prompt || ""
            ).trim();

        let aspectRatio =
            String(
                body.aspectRatio || "9:16"
            );

        /* PROMPT CHECK */
        if (!prompt) {

            return res.status(400).json({
                success: false,
                error: "Video prompt is required."
            });

        }

        /* RATIO CHECK */
        const allowedRatios = [
            "16:9",
            "9:16",
            "1:1"
        ];

        if (
            !allowedRatios.includes(
                aspectRatio
            )
        ) {

            aspectRatio = "9:16";

        }

        /*
           Wan 2.2 5B:
           Maximum 5 seconds.
           121 frames at 24 FPS is about 5 seconds.
        */

        const model =
            "fal-ai/wan/v2.2-5b/text-to-video";

        const endpoint =
            "https://queue.fal.run/" +
            model;

        /* FAL INPUT */
        const falInput = {

            prompt: prompt,

            num_frames: 121,

            frames_per_second: 24,

            resolution: "720p",

            aspect_ratio: aspectRatio,

            enable_safety_checker: true,

            enable_output_safety_checker: true

        };

        console.log(
            "Sending video request to fal.ai..."
        );

        /* FAL REQUEST */
        const falResponse =
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
                        JSON.stringify(
                            falInput
                        )
                }
            );

        /* RAW RESPONSE */
        const raw =
            await falResponse.text();

        console.log(
            "FAL STATUS:",
            falResponse.status
        );

        console.log(
            "FAL RESPONSE:",
            raw.substring(
                0,
                3000
            )
        );

        /* JSON */
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

                fal_status:
                    falResponse.status,

                details:
                    raw.substring(
                        0,
                        1000
                    )

            });

        }

        /* FAL ERROR */
        if (!falResponse.ok) {

            return res.status(
                falResponse.status
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

        /* QUEUE DATA */
        const requestId =
            data?.request_id || "";

        const statusUrl =
            data?.status_url || "";

        const responseUrl =
            data?.response_url || "";

        /* CHECK */
        if (
            !requestId ||
            !statusUrl
        ) {

            return res.status(502).json({

                success: false,

                error:
                    "fal.ai ने request स्वीकार की लेकिन status URL नहीं मिला।",

                fal_response:
                    data

            });

        }

        /* SUCCESS */
        return res.status(200).json({

            success: true,

            message:
                "Video generation request submitted.",

            request_id:
                requestId,

            status_url:
                statusUrl,

            response_url:
                responseUrl,

            aspectRatio:
                aspectRatio,

            duration:
                5

        });

    } catch (error) {

        console.error(
            "Gill AI Video Error:",
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