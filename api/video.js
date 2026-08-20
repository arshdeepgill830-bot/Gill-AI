/* =========================================================
   Gill AI Ultimate v8
   api/video.js
   HUGGING FACE INFERENCE PROVIDERS
   TEXT TO VIDEO
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
           HUGGING FACE TOKEN
        ------------------------------------------------- */

        const apiKey =
            process.env.HF_TOKEN;

        if (!apiKey) {

            return res.status(500).json({
                success: false,
                error:
                    "HF_TOKEN is missing in Vercel Environment Variables."
            });

        }

        /* -------------------------------------------------
           READ BODY
        ------------------------------------------------- */

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
           RATIO CHECK
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

            aspectRatio = "9:16";

        }

        /* -------------------------------------------------
           MODEL
           
           Hugging Face currently documents this model
           for text-to-video through Inference Providers.
        ------------------------------------------------- */

        const model =
            "Wan-AI/Wan2.2-TI2V-5B";

        const endpoint =
            "https://router.huggingface.co/hf-inference/models/" +
            model;

        /* -------------------------------------------------
           REQUEST
        ------------------------------------------------- */

        const hfResponse =
            await fetch(
                endpoint,
                {

                    method: "POST",

                    headers: {

                        "Authorization":
                            "Bearer " + apiKey,

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "video/mp4"

                    },

                    body:
                        JSON.stringify({

                            inputs:
                                prompt,

                            parameters: {

                                num_frames:
                                    121,

                                num_inference_steps:
                                    25,

                                guidance_scale:
                                    5

                            }

                        })

                }
            );

        /* -------------------------------------------------
           READ RESPONSE
        ------------------------------------------------- */

        const contentType =
            hfResponse.headers.get(
                "content-type"
            ) || "";

        const buffer =
            await hfResponse.arrayBuffer();

        console.log(
            "HUGGING FACE STATUS:",
            hfResponse.status
        );

        console.log(
            "HUGGING FACE CONTENT TYPE:",
            contentType
        );

        /* -------------------------------------------------
           ERROR RESPONSE
        ------------------------------------------------- */

        if (!hfResponse.ok) {

            let errorText = "";

            try {

                errorText =
                    new TextDecoder()
                        .decode(buffer);

            } catch {

                errorText =
                    "Unknown Hugging Face error.";

            }

            let errorData = {};

            try {

                errorData =
                    JSON.parse(
                        errorText
                    );

            } catch {

                errorData = {};

            }

            return res.status(
                hfResponse.status
            ).json({

                success: false,

                error:
                    errorData?.error ||
                    errorData?.message ||
                    errorText.substring(
                        0,
                        1000
                    ) ||
                    "Hugging Face video generation failed.",

                status:
                    hfResponse.status

            });

        }

        /* -------------------------------------------------
           CHECK VIDEO RESPONSE
        ------------------------------------------------- */

        if (
            !contentType.includes(
                "video"
            )
        ) {

            let text = "";

            try {

                text =
                    new TextDecoder()
                        .decode(buffer);

            } catch {

                text =
                    "";

            }

            return res.status(502).json({

                success: false,

                error:
                    "Hugging Face ने video response नहीं दिया।",

                content_type:
                    contentType,

                details:
                    text.substring(
                        0,
                        1000
                    )

            });

        }

        /* -------------------------------------------------
           CONVERT VIDEO TO DATA URL
        ------------------------------------------------- */

        const bytes =
            new Uint8Array(
                buffer
            );

        let binary = "";

        const chunkSize =
            0x8000;

        for (
            let i = 0;
            i < bytes.length;
            i += chunkSize
        ) {

            binary += String.fromCharCode(
                ...bytes.subarray(
                    i,
                    Math.min(
                        i + chunkSize,
                        bytes.length
                    )
                )
            );

        }

        const base64 =
            Buffer
                .from(
                    binary,
                    "binary"
                )
                .toString(
                    "base64"
                );

        const videoUrl =
            "data:video/mp4;base64," +
            base64;

        /* -------------------------------------------------
           SUCCESS
        ------------------------------------------------- */

        return res.status(200).json({

            success: true,

            message:
                "Video generated successfully.",

            video_url:
                videoUrl,

            videoUrl:
                videoUrl,

            aspectRatio:
                aspectRatio,

            duration:
                5,

            model:
                model

        });

    } catch (error) {

        console.error(
            "Gill AI Hugging Face Video Error:",
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