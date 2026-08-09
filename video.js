// api/video.js

export default async function handler(req, res) {

    // Only POST
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Only POST method is allowed."
        });
    }

    try {

        const {
            prompt,
            duration,
            aspectRatio
        } = req.body || {};

        // Check prompt
        if (
            !prompt ||
            !String(prompt).trim()
        ) {
            return res.status(400).json({
                error: "Video prompt is required."
            });
        }

        // Check Replicate token
        const token =
            process.env.REPLICATE_API_TOKEN;

        if (!token) {

            return res.status(500).json({
                error:
                    "REPLICATE_API_TOKEN Vercel Environment Variables में नहीं मिला।"
            });
        }

        /*
         * IMPORTANT
         *
         * Vercel Environment Variables में
         * REPLICATE_VIDEO_MODEL नाम से
         * अपना Replicate model/version डालो।
         */

        const model =
            process.env.REPLICATE_VIDEO_MODEL;

        if (!model) {

            return res.status(500).json({
                error:
                    "REPLICATE_VIDEO_MODEL Vercel Environment Variables में नहीं मिला।"
            });
        }

        // Video settings
        const videoDuration =
            Number(duration) || 20;

        const ratio =
            aspectRatio || "9:16";


        // ------------------------------------------
        // START REPLICATE PREDICTION
        // ------------------------------------------

        const response =
            await fetch(
                "https://api.replicate.com/v1/predictions",
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            "Bearer " + token,

                        "Content-Type":
                            "application/json",

                        "Prefer":
                            "wait=1"
                    },

                    body: JSON.stringify({

                        version: model,

                        input: {

                            prompt:
                                String(prompt).trim(),

                            duration:
                                videoDuration,

                            aspect_ratio:
                                ratio
                        }
                    })
                }
            );


        const data =
            await response.json();


        // ------------------------------------------
        // REPLICATE ERROR
        // ------------------------------------------

        if (!response.ok) {

            console.error(
                "Replicate API Error:",
                data
            );

            return res.status(
                response.status
            ).json({

                error:
                    data?.detail ||
                    data?.error ||
                    "Replicate video request failed."

            });
        }


        // ------------------------------------------
        // VIDEO ALREADY READY
        // ------------------------------------------

        if (
            data.status === "succeeded" &&
            data.output
        ) {

            let videoUrl =
                data.output;

            // Some models return an array
            if (
                Array.isArray(videoUrl)
            ) {

                videoUrl =
                    videoUrl[0];
            }

            return res.status(200).json({

                success: true,

                status:
                    data.status,

                predictionId:
                    data.id,

                videoUrl:
                    videoUrl

            });
        }


        // ------------------------------------------
        // GENERATION STILL RUNNING
        // ------------------------------------------

        return res.status(202).json({

            success: true,

            predictionId:
                data.id,

            status:
                data.status,

            videoUrl:
                null,

            message:
                "Video generation started."

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
