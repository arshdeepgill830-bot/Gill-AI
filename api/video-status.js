/* =========================================================
   Gill AI Ultimate
   api/video-status.js
   MAGIC HOUR VIDEO STATUS
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
            process.env.MAGIC_HOUR_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                success: false,
                error:
                    "MAGIC_HOUR_API_KEY is missing in Vercel."
            });
        }

        const projectId =
            String(
                req.query?.id ||
                req.query?.request_id ||
                ""
            ).trim();

        if (!projectId) {
            return res.status(400).json({
                success: false,
                error:
                    "Magic Hour project ID is required."
            });
        }

        const response =
            await fetch(
                "https://api.magichour.ai/v1/video-projects/" +
                encodeURIComponent(projectId),
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " + apiKey,

                        "Accept":
                            "application/json"
                    }
                }
            );

        const raw =
            await response.text();

        console.log(
            "MAGIC HOUR VIDEO STATUS:",
            response.status
        );

        console.log(
            "MAGIC HOUR STATUS RESPONSE:",
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
                    "Magic Hour status ने valid JSON नहीं भेजा।",
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
                    data?.message ||
                    data?.error ||
                    "Magic Hour status request failed.",

                magic_hour_response:
                    data

            });

        }

        const currentStatus =
            String(
                data?.status || ""
            ).toLowerCase();

        /* -------------------------------------------------
           VIDEO COMPLETE
        ------------------------------------------------- */

        if (
            currentStatus ===
            "complete"
        ) {

            let videoUrl = "";

            if (
                Array.isArray(
                    data?.downloads
                ) &&
                data.downloads.length > 0
            ) {

                videoUrl =
                    data.downloads[0]?.url ||
                    "";

            }

            if (
                !videoUrl &&
                data?.download?.url
            ) {

                videoUrl =
                    data.download.url;

            }

            if (!videoUrl) {

                return res.status(502).json({

                    success: false,

                    error:
                        "Video complete हुई लेकिन download URL नहीं मिला.",

                    magic_hour_response:
                        data

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
                    data?.downloads ||
                    data?.download ||
                    null

            });

        }

        /* -------------------------------------------------
           FAILED
        ------------------------------------------------- */

        if (
            currentStatus === "error" ||
            currentStatus === "canceled"
        ) {

            return res.status(200).json({

                success: false,

                status:
                    currentStatus,

                error:
                    data?.error?.message ||
                    data?.error ||
                    "Magic Hour video generation failed."

            });

        }

        /* -------------------------------------------------
           PROCESSING
        ------------------------------------------------- */

        return res.status(200).json({

            success: true,

            status:
                currentStatus ||
                "processing",

            video_url:
                "",

            videoUrl:
                "",

            message:
                "Video अभी तैयार हो रही है।"

        });

    } catch (error) {

        console.error(
            "Gill AI Magic Hour Status Error:",
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