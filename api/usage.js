import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            success: false,
            error: "Method Not Allowed"
        });
    }

    try {
        const sql = neon(process.env.DATABASE_URL);

        // Temporary user ID.
        // बाद में इसे real login/authentication से जोड़ेंगे।
        const userId =
            typeof req.query.userId === "string" &&
            req.query.userId.trim()
                ? req.query.userId.trim().slice(0, 100)
                : "guest";

        // User मौजूद नहीं है तो Free account बनाओ
        await sql`
            INSERT INTO users (
                id,
                plan,
                credits,
                chat_used,
                image_used,
                video_used
            )
            VALUES (
                ${userId},
                'Free',
                100,
                0,
                0,
                0
            )
            ON CONFLICT (id) DO NOTHING
        `;

        // Database से current usage निकालो
        const rows = await sql`
            SELECT
                id,
                plan,
                credits,
                chat_used,
                image_used,
                video_used,
                created_at,
                updated_at
            FROM users
            WHERE id = ${userId}
            LIMIT 1
        `;

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        const user = rows[0];

        return res.status(200).json({
            success: true,
            app: "Gill AI Ultimate v9",
            usage: {
                userId: user.id,
                plan: user.plan,
                credits: user.credits,
                chat: {
                    used: user.chat_used,
                    limit: 20
                },
                image: {
                    used: user.image_used,
                    limit: 5
                },
                video: {
                    used: user.video_used,
                    limit: 1
                },
                createdAt: user.created_at,
                updatedAt: user.updated_at
            }
        });

    } catch (error) {
        console.error("Gill AI Usage Error:", error);

        return res.status(500).json({
            success: false,
            error: "Database connection failed"
        });
    }
}