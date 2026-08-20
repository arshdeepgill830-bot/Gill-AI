/* =========================================================
   Gill AI Ultimate v8
   api/video.js
   REPLICATE VIDEO GENERATOR
   WAN 2.1 - 1.3B
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
           REPLICATE TOKEN
        ------------------------------------------------- */

        const apiToken =
            process.env.REPLICATE_API_TOKEN;

        if (!apiToken) {

            return res.status(500).json({
                success: false,
                error:
                    "REPLICATE_API_TOKEN is missing in Vercel Environment Variables."
            });

        }

        /* -------------------------------------------------
           READ BODY
        ------------------------------------------------- */

        let body =
            req.body || {};

        if (typeof body === "string") {

            try {

                body =
                    JSON.parse(body);

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
                body.aspectRatio ||
                "9:16"
            );

        /* -------------------------------------------------
           PROMPT CHECK
        ------------------------------------------------- */

        if (!prompt) {

            return res.status(400).json({
                success: false,
                error:
                    "Video prompt is required."
            });

        }

        /* -------------------------------------------------
           ASPECT RATIO
           WAN MODEL SUPPORTS:
           16:9
           9:16
           1:1
        ------------------------------------------------- */

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

            aspectRatio =
                "9:16";

        }

        /* -------------------------------------------------
           REPLICATE MODEL
        ------------------------------------------------- */

        const model =
            "wan-video/wan-2.1-1.3b";

        const endpoint =
            "https://api.replicate.com/v1/models/" +
            model +
            "/predictions";

        /* -------------------------------------------------
           VIDEO INPUT
        -------------------------------------------------

           81 frames at 16fps ≈ 5 seconds
        ------------------------------------------------- */

        const input = {

            prompt:
                prompt,

            frame_num:
                81,

            resolution:
                "480p",

            aspect_ratio:
                aspectRatio,

            sample_steps:
                30,

            sample_guide_scale:
                6

        };

        console.log(
            "REPLICATE VIDEO REQUEST:",
            {
                model,
                aspectRatio,
                prompt
            }
        );

        /* -------------------------------------------------
           CREATE PREDICTION
        ------------------------------------------------- */

        const replicateResponse =
            await fetch(
                endpoint,
                {

                    method: "POST",

                    headers: {

                        "Authorization":
                            "Bearer " +
                            apiToken,

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json",

                        /*
                           Wait up to 60 seconds.
                           If video is not finished,
                           Replicate returns a prediction
                           that can be checked later.
                        */

                        "Prefer":
                            "wait=60"

                    },

                    body:
                        JSON.stringify({
                            input
                        })

                }
            );

        /* -------------------------------------------------
           READ RESPONSE
        ------------------------------------------------- */

        const raw =
            await replicateResponse.text();

        console.log(
            "REPLICATE STATUS:",
            replicateResponse.status
        );

        console.log(
            "REPLICATE RESPONSE:",
            raw.substring(
                0,
                3000
            )
        );

        /* -------------------------------------------------
           PARSE JSON
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
                    "Replicate ने valid JSON response नहीं भेजा।",

                status:
                    replicateResponse.status,

                details:
                    raw.substring(
                        0,
                        1000
                    )

            });

        }

        /* -------------------------------------------------
           REPLICATE API ERROR
        ------------------------------------------------- */

        if (
            !replicateResponse.ok
        ) {

            console.error(
                "REPLICATE ERROR:",
                data
            );

            return res.status(
                replicateResponse.status
            ).json({

                success: false,

                error:
                    data?.detail ||
                    data?.error ||
                    data?.message ||
                    "Replicate video request failed.",

                status:
                    replicateResponse.status,

                replicate_response:
                    data

            });

        }

        /* -------------------------------------------------
           PREDICTION STATUS
        ------------------------------------------------- */

        const status =
            String(
                data?.status ||
                ""
            ).toLowerCase();

        const predictionId =
            data?.id ||
            "";

        const getUrl =
            data?.urls?.get ||
            "";

        /* -------------------------------------------------
           FAILED
        ------------------------------------------------- */

        if (
            status ===
            "failed"
        ) {

            return res.status(502).json({

                success: false,

                error:
                    data?.error ||
                    "Replicate video generation failed.",

                prediction_id:
                    predictionId

            });

        }

        /* -------------------------------------------------
           CANCELED
        ------------------------------------------------- */

        if (
            status ===
            "canceled"
        ) {

            return res.status(502).json({

                success: false,

                error:
                    "Replicate video generation was canceled.",

                prediction_id:
                    predictionId

            });

        }

        /* -------------------------------------------------
           GET VIDEO OUTPUT
        ------------------------------------------------- */

        let videoUrl = "";

        const output =
            data?.output;

        if (
            typeof output ===
            "string"
        ) {

            videoUrl =
                output;

        }

        else if (
            Array.isArray(output)
        ) {

            const first =
                output[0];

            if (
                typeof first ===
                "string"
            ) {

                videoUrl =
                    first;

            }

            else if (
                first?.url
            ) {

                videoUrl =
                    String(
                        first.url
                    );

            }

        }

        else if (
            output?.url
        ) {

            videoUrl =
                String(
                    output.url
                );

        }

        /* -------------------------------------------------
           COMPLETED WITH VIDEO
        ------------------------------------------------- */

        if (
            videoUrl &&
            (
                status ===
                "succeeded" ||
                status ===
                "successful" ||
                !status
            )
        ) {

            return res.status(200).json({

                success:
                    true,

                status:
                    "COMPLETED",

                message:
                    "Video generated successfully.",

                video_url:
                    videoUrl,

                videoUrl:
                    videoUrl,

                prediction_id:
                    predictionId,

                aspectRatio:
                    aspectRatio,

                duration:
                    5,

                model:
                    model

            });

        }

        /* -------------------------------------------------
           STILL PROCESSING
        ------------------------------------------------- */

        return res.status(200).json({

            success:
                true,

            status:
                status ||
                "processing",

            message:
                "Video generation started.",

            prediction_id:
                predictionId,

            status_url:
                getUrl,

            response_url:
                getUrl,

            aspectRatio:
                aspectRatio,

            duration:
                5,

            model:
                model

        });

    } catch (error) {

        console.error(
            "Gill AI Replicate Video Error:",
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