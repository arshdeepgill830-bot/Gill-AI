/* =========================================================
   Gill AI Ultimate v8
   api/credits.js
   SIMPLE VIDEO CREDITS SYSTEM
========================================================= */

export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            error: "Method Not Allowed"
        });
    }

    try {

        const body = req.body || {};

        const action =
            String(body.action || "").trim();

        const amount =
            Math.max(
                0,
                Number(body.amount || 0)
            );

        if (!action) {
            return res.status(400).json({
                success: false,
                error: "Action is required."
            });
        }

        /*
           IMPORTANT:
           This is only a simple demo response.
           Real credits must be stored in a database.
        */

        if (action === "video_charge") {

            return res.status(200).json({
                success: true,
                charged: true,
                amount: amount,
                message:
                    "Video credits charge approved."
            });

        }

        if (action === "video_refund") {

            return res.status(200).json({
                success: true,
                refunded: true,
                amount: amount,
                message:
                    "Video credits refund approved."
            });

        }

        return res.status(400).json({
            success: false,
            error: "Unknown credit action."
        });

    } catch (error) {

        console.error(
            "Credits API Error:",
            error
        );

        return res.status(500).json({
            success: false,
            error:
                error?.message ||
                "Credits server error."
        });

    }

}