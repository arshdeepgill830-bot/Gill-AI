import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {

    if (req.method !== "GET") {
        return res.status(405).json({
            success: false,
            error: "Use GET"
        });
    }

    try {

        const sql = neon(process.env.DATABASE_URL);

        const userId = "guest";
        const cost = 1;

        const rows = await sql`
            UPDATE users
            SET
                credits = credits - ${cost},
                chat_used = chat_used + 1,
                updated_at = NOW()
            WHERE
                id = ${userId}
                AND credits >= ${cost}
            RETURNING
                id,
                plan,
                credits,
                chat_used,
                image_used,
                video_used
        `;

        if (!rows.length) {

            return res.status(402).json({
                success: false,
                error: "Insufficient credits"
            });

        }

        return res.status(200).json({

            success: true,

            message:
                "Test successful — 1 credit deducted.",

            usage: rows[0]

        });

    } catch (error) {

        console.error(
            "Test Credits Error:",
            error
        );

        return res.status(500).json({

            success: false,

            error:
                "Database test failed."

        });

    }

}