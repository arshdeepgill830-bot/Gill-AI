/* =========================================================
   Gill AI Ultimate v8
   api/video.js
   FAL.AI VIDEO GENERATOR
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
           READ API KEY
        ------------------------------------------------- */

        const apiKey =
            process.env.FAL_KEY;


        if (!apiKey) {

            return res.status(500).json({

                success: false,

                error:
                    "FAL_KEY is missing in Vercel Environment Variables."

            });

        }


        /* -------------------------------------------------
           READ REQUEST
        ------------------------------------------------- */

        const body =
            req.body || {};


        const prompt =
            String(
                body.prompt || ""
            ).trim();


        let aspectRatio =
            String(
                body.aspectRatio || "9:16"
            );


        let duration =
            Number(
                body.duration || 35
            );


        /* -------------------------------------------------
           VALIDATE PROMPT
        ------------------------------------------------- */

        if (!prompt) {

            return res.status(400).json({

                success: false,

                error:
                    "Video prompt is required."

            });

        }


        /* -------------------------------------------------
           VALIDATE RATIO
        ------------------------------------------------- */

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

            aspectRatio =
                "9:16";

        }


        /* -------------------------------------------------
           VALIDATE DURATION
           
           IMPORTANT:
           Wan 2.2 does not natively create
           35/40 seconds in one request.

           We accept 35/40 from Gill AI,
           but generate a supported clip.
        ------------------------------------------------- */

        if (
            duration !== 35 &&
            duration !== 40
        ) {

            duration = 35;

        }


        /* -------------------------------------------------
           FAL.AI MODEL
        ------------------------------------------------- */

        const endpoint =
            "https://queue.fal.run/" +
            "fal-ai/wan/v2.2-5b/text-to-video";


        /* -------------------------------------------------
           REQUEST TO FAL.AI
        ------------------------------------------------- */

        const falResponse =
            await fetch(
                endpoint,
                {

                    method: "POST",

                    headers: {

                        "Authorization":
                            "Key " + apiKey,

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            prompt:
                                prompt,

                            aspect_ratio:
                                aspectRatio,

                            resolution:
                                "720p"

                        })

                }
            );


        /* -------------------------------------------------
           READ RESPONSE SAFELY
        ------------------------------------------------- */

        const raw =
            await falResponse.text();


        let data;


        try {

            data =
                raw
                    ? JSON.parse(raw)
                    : {};

        } catch (parseError) {

            console.error(
                "FAL RAW RESPONSE:",
                raw
            );


            return res.status(502).json({

                success: false,

                error:
                    "fal.ai ने valid JSON response नहीं भेजा।",

                details:
                    raw.substring(
                        0,
                        500
                    )

            });

        }


        /* -------------------------------------------------
           FAL ERROR
        ------------------------------------------------- */

        if (
            !falResponse.ok
        ) {

            console.error(
                "FAL API ERROR:",
                data
            );


            return res.status(
                falResponse.status
            ).json({

                success: false,

                error:
                    data?.detail ||
                    data?.error ||
                    "fal.ai video request failed."

            });

        }


        /* -------------------------------------------------
           RETURN QUEUE INFORMATION
        ------------------------------------------------- */

        return res.status(200).json({

            success: true,

            message:
                "Video generation request submitted.",

            request_id:
                data?.request_id ||
                null,

            status_url:
                data?.status_url ||
                null,

            response_url:
                data?.response_url ||
                null,

            duration:
                duration,

            requested_duration:
                duration,

            aspectRatio:
                aspectRatio

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