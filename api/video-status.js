/* =========================================================
   Gill AI Ultimate
   api/video-status.js
   FAL.AI + PIXVERSE V6 STATUS
========================================================= */

export default async function handler(req, res) {

    if (req.method !== "GET") {
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

        const requestId =
            String(
                req.query?.id ||
                req.query?.request_id ||
                ""
            ).trim();

        if (!requestId) {
            return res.status(400).json({
                success: false,
                error:
                    "FAL request ID is required."
            });
        }

        /* -------------------------------------------------
           FAL STATUS URL
        ------------------------------------------------- */

        const statusUrl =
            "https://queue.fal.run/" +
            "fal-ai/pixverse/v6/text-to-video/requests/" +
            encodeURIComponent(requestId) +
            "/status";

        const statusResponse =
            await fetch(
                statusUrl,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Key " + apiKey,

                        "Accept":
                            "application/json"
                    }
                }
            );

        const statusRaw =
            await statusResponse.text();

        console.log(
            "FAL STATUS HTTP:",
            statusResponse.status
        );

        console.log(
            "FAL STATUS RESPONSE:",
            statusRaw.substring(0, 3000)
        );

        let statusData = {};

        try {
            statusData =
                statusRaw
                    ? JSON.parse(statusRaw)
                    : {};
        } catch {

            return res.status(502).json({
                success: false,
                error:
                    "fal.ai status ने valid JSON नहीं भेजा।",
                details:
                    statusRaw.substring(0, 1000)
            });

        }

        if (!statusResponse.ok) {

            return res.status(
                statusResponse.status
            ).json({
                success: false,
                error:
                    statusData?.detail ||
                    statusData?.error ||
                    statusData?.message ||
                    "fal.ai status request failed."
            });

        }

        const currentStatus =
            String(
                statusData?.status ||
                ""
            ).toUpperCase();

        /* -------------------------------------------------
           STILL PROCESSING
        ------------------------------------------------- */

        if (
            currentStatus !== "COMPLETED" &&
            currentStatus !== "SUCCEEDED"
        ) {

            if (
                currentStatus === "FAILED" ||
                currentStatus === "ERROR" ||
                currentStatus === "CANCELLED"
            ) {

                return res.status(200).json({

                    success: false,

                    status:
                        currentStatus,

                    error:
                        statusData?.error ||
                        statusData?.detail ||
                        "Video generation failed."

                });

            }

            return res.status(200).json({

                success: true,

                status:
                    currentStatus ||
                    "PROCESSING",

                video_url:
                    "",

                videoUrl:
                    "",

                message:
                    "Video अभी तैयार हो रही है।"

            });

        }

        /* -------------------------------------------------
           GET FINAL RESULT
        ------------------------------------------------- */

        const responseUrl =
            "https://queue.fal.run/" +
            "fal-ai/pixverse/v6/text-to-video/requests/" +
            encodeURIComponent(requestId);

        const resultResponse =
            await fetch(
                responseUrl,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Key " + apiKey,

                        "Accept":
                            "application/json"
                    }
                }
            );

        const resultRaw =
            await resultResponse.text();

        console.log(
            "FAL RESULT HTTP:",
            resultResponse.status
        );

        console.log(
            "FAL RESULT:",
            resultRaw.substring(0, 3000)
        );

        let resultData = {};

        try {
            resultData =
                resultRaw
                    ? JSON.parse(resultRaw)
                    : {};
        } catch {

            return res.status(502).json({
                success: false,
                error:
                    "fal.ai result ने valid JSON नहीं भेजा।"
            });

        }

        if (!resultResponse.ok) {

            return res.status(
                resultResponse.status
            ).json({
                success: false,
                error:
                    resultData?.detail ||
                    resultData?.error ||
                    resultData?.message ||
                    "fal.ai result request failed."
            });

        }

        const videoUrl =
            resultData?.video?.url ||
            resultData?.output?.video?.url ||
            resultData?.output?.url ||
            "";

        if (!videoUrl) {

            return res.status(502).json({

                success: false,

                error:
                    "Video complete हुई लेकिन video URL नहीं मिला।",

                fal_response:
                    resultData

            });

        }

        return res.status(200).json({

            success: true,

            status:
                "COMPLETED",

            video_url:
                String(videoUrl),

            videoUrl:
                String(videoUrl),

            output:
                resultData?.video ||
                resultData?.output ||
                null

        });

    } catch (error) {

        console.error(
            "Gill AI FAL Video Status Error:",
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