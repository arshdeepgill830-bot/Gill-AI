/* =========================================================
   Gill AI Ultimate v9
   api/usage.js
   USAGE + CREDITS MONITORING
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

        /*
         * Demo/default user.
         *
         * IMPORTANT:
         * This is only a temporary foundation.
         * Real user credits will later use a database
         * and authenticated user ID.
         */

        const usage = {

            plan: "Free",

            credits: 100,

            chat: {
                used: 0,
                limit: 20
            },

            image: {
                used: 0,
                limit: 5
            },

            video: {
                used: 0,
                limit: 1
            }

        };

        /* -------------------------------------------------
           RESPONSE
        ------------------------------------------------- */

        return res.status(200).json({

            success: true,

            app: "Gill AI Ultimate v9",

            usage: usage

        });

    } catch (error) {

        console.error(
            "Gill AI Usage Error:",
            error
        );

        return res.status(500).json({

            success: false,

            error:
                error?.message ||
                "Usage service failed."

        });

    }

}