/* =========================================================
   Gill AI Ultimate v8
   api/video.js
   FAL.AI WAN 2.2 5B VIDEO GENERATOR
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
           FAL API KEY
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
           READ REQUEST BODY
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
                body.duration || 5
            );


        /* -------------------------------------------------
           PROMPT VALIDATION
        ------------------------------------------------- */

        if (!prompt) {

            return res.status(400).json({
                success: false,
                error:
                    "Video prompt is required."
            });

        }


        /* -------------------------------------------------
           ASPECT RATIO VALIDATION
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
           DURATION
           
           Wan 2.2 5B supports up to 5 seconds.
           
           If Gill AI sends 10 or 20 seconds,
           we generate a supported 5-second clip
           for the first working test.
        ------------------------------------------------- */

        if (
            duration < 1
        ) {

            duration = 5;

        }


        const requestedDuration =
            duration;


        const generatedDuration =
            5;


        /* -------------------------------------------------
           FAL MODEL
        ------------------------------------------------- */

        const model =
            "fal-ai/wan/v2.2-5b/text-to-video";


        const endpoint =
            "https://queue.fal.run/" +
            model;


        /* -------------------------------------------------
           FAL INPUT
           
           IMPORTANT:
           Raw queue REST API expects the model
           parameters directly in JSON.
           
           NOT:
           { input: { ... } }
           
           Instead:
           { prompt, aspect_ratio, ... }
        ------------------------------------------------- */

        const falInput = {

            prompt:
                prompt,

            aspect_ratio:
                aspectRatio,

            resolution:
                "720p",

            num_frames:
                121,

            frames_per_second:
                24

        };


        /* -------------------------------------------------
           SEND REQUEST TO FAL
        ------------------------------------------------- */

        const falResponse =
            await fetch(
                endpoint,
                {

                    method:
                        "POST",

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


        /* -------------------------------------------------
           READ RAW RESPONSE
        ------------------------------------------------- */

        const raw =
            await falResponse.text();


        console.log(
            "FAL RESPONSE STATUS:",
            falResponse.status
        );


        console.log(
            "FAL RESPONSE:",
            raw.substring(
                0,
                2000
            )
        );


        /* -------------------------------------------------
           PARSE JSON
        ------------------------------------------------- */

        let data = {};


        try {

            data =
                raw
                    ? JSON.parse(
                        raw
                    )
                    : {};

        } catch (error) {

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


        /* -------------------------------------------------
           FAL API ERROR
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
                    data?.message ||
                    "fal.ai video request failed.",

                fal_response:
                    data

            });

        }


        /* -------------------------------------------------
           QUEUE DATA
        ------------------------------------------------- */

        const requestId =
            data?.request_id ||
            null;


        const statusUrl =
            data?.status_url ||
            null;


        const responseUrl =
            data?.response_url ||
            null;


        /* -------------------------------------------------
           CHECK QUEUE RESPONSE
        ------------------------------------------------- */

        if (
            !requestId ||
            !statusUrl
        ) {

            return res.status(502).json({

                success: false,

                error:
                    "fal.ai ने queue request स्वीकार किया लेकिन request/status URL नहीं मिला।",

                request_id:
                    requestId,

                fal_response:
                    data

            });

        }


        /* -------------------------------------------------
           SUCCESS
        ------------------------------------------------- */

        return res.status(200).json({

            success:
                true,

            message:
                "Video generation request submitted successfully.",

            request_id:
                requestId,

            status_url:
                statusUrl,

            response_url:
                responseUrl,

            aspectRatio:
                aspectRatio,

            requested_duration:
                requestedDuration,

            generated_duration:
                generatedDuration

        });


    } catch (error) {

        console.error(
            "Gill AI FAL Video Error:",
            error
        );


        return res.status(500).json({

            success:
                false,

            error:
                error?.message ||
                "Internal video server error."

        });

    }

}