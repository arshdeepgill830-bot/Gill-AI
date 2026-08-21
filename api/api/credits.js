import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            error: "Method Not Allowed"
        });
    }

    try {

        const sql = neon(process.env.DATABASE_URL);

        const {
            userId = "guest",
            type = "chat"
        } = req.body || {};

        const allowedTypes = [
            "chat",
            "image",
            "video"
        ];

        if (!allowedTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                error: "Invalid usage type"
            });
        }

        const costs = {
            chat: 1,
            image: 5,
            video: 20
        };

        const cost = costs[type];

        /*
         * Atomic credit deduction.
         * Credits कभी negative नहीं होंगे।
         */

        const rows = await sql`
            UPDATE users
            SET
                credits = credits - ${cost},
                chat_used = chat_used +
                    CASE
                        WHEN ${type} = 'chat' THEN 1
                        ELSE 0
                    END,
                image_used = image_used +
                    CASE
                        WHEN ${type} = 'image' THEN 1
                        ELSE 0
                    END,
                video_used = video_used +
                    CASE
                        WHEN ${type} = 'video' THEN 1
                        ELSE 0
                    END,
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
                video_used,
                updated_at
        `;

        if (!rows.length) {

            return res.status(402).json({
                success: false,
                error: "Insufficient credits",
                message: "आपके credits खत्म हो गए हैं।"
            });

        }

        const user = rows[0];

        return res.status(200).json({

            success: true,

            message:
                `${type} usage recorded successfully.`,

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

                updatedAt:
                    user.updated_at

            }

        });

    } catch (error) {

        console.error(
            "Gill AI Credits Error:",
            error
        );

        return res.status(500).json({

            success: false,

            error:
                "Credits database update failed."

        });

    }

}