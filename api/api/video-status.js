/* =========================================================
   Gill AI Ultimate v8
   api/video-status.js
   FAL.AI VIDEO STATUS CHECK
========================================================= */

export default async function handler(req, res) {

    /* -----------------------------------------------------
       ONLY GET
    ----------------------------------------------------- */

    if (req.method !== "GET") {

        return res.status(405).json({
            success: false,
            error: "Method Not Allowed"
        });

    }


    try {

        /* -------------------------------------------------
           API KEY
        ------------------------------------------------- */

        const apiKey =
            process.env.FAL_KEY;


        if (!apiKey) {

            return res.status(500).json({

                success: false,

                error:
                    "FAL_KEY is missing in Vercel."

            });

        }


        /* -------------------------------------------------
           STATUS URL
        ------------------------------------------------- */

        const statusUrl =
            req.query &&
            req.query.url
                ? String(req.query.url)
                : "";


        if (!statusUrl) {

            return res.status(400).json({

                success: false,

                error:
                    "Status URL is required."

            });

        }


        /* -------------------------------------------------
           SECURITY CHECK
           Only allow fal.ai URLs
        ------------------------------------------------- */

        let parsedUrl;

        try {

            parsedUrl =
                new URL(statusUrl);

        } catch (error) {

            return res.status(400).json({

                success: false,

                error:
                    "Invalid status URL."

            });

        }


        if (
            parsedUrl.hostname !==
            "queue.fal.run"
        ) {

            return res.status(400).json({

                success: false,

                error:
                    "Invalid fal.ai status URL."

            });

        }


        /* -------------------------------------------------
           CALL FAL.AI
        ------------------------------------------------- */

        const response =
            await fetch(
                statusUrl,
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            "Key " + apiKey

                    }

                }
            );


        /* -------------------------------------------------
           READ RESPONSE
        ------------------------------------------------- */

        const raw =
            await response.text();


        let data;


        try {

            data =
                raw
                    ? JSON.parse(raw)
                    : {};

        } catch (error) {

            console.error(
                "FAL STATUS RAW:",
                raw
            );


            return res.status(502).json({

                success: false,

                error:
                    "fal.ai status response valid JSON नहीं है."

            });

        }


        /* -------------------------------------------------
           FAL ERROR
        ------------------------------------------------- */

        if (!response.ok) {

            console.error(
                "FAL STATUS ERROR:",
                data
            );


            return res.status(
                response.status
            ).json({

                success: false,

                error:
                    data?.detail ||
                    data?.error ||
                    "fal.ai status request failed."

            });

        }


        /* -------------------------------------------------
           RETURN STATUS
        ------------------------------------------------- */

        return res.status(200).json({

            success: true,

            status:
                data?.status ||
                null,

            video:
                data?.video ||
                null,

            output:
                data?.output ||
                null,

            request_id:
                data?.request_id ||
                null

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