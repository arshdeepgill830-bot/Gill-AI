
module.exports = async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method Not Allowed"
        });
    }

    try {

        const token =
            process.env.REPLICATE_API_TOKEN;

        if (!token) {
            return res.status(500).json({
                error:
                    "REPLICATE_API_TOKEN is missing in Vercel."
            });
        }

        const {
            prompt,
            aspectRatio
        } = req.body || {};

        if (!prompt || !String(prompt).trim()) {
            return res.status(400).json({
                error: "Video prompt is required."
            });
        }

        const model =
            process.env.REPLICATE_VIDEO_MODEL;

        if (!model) {
            return res.status(500).json({
                error:
                    "REPLICATE_VIDEO_MODEL is missing in Vercel."
            });
        }

        /*
         * REPLICATE_VIDEO_MODEL should be:
         *
         * owner/model-name
         *
         * Example:
         * minimax/video-01
         */

        const modelParts =
            String(model)
                .trim()
                .split("/");

        if (modelParts.length !== 2) {
            return res.status(500).json({
                error:
                    "REPLICATE_VIDEO_MODEL गलत है। इसे owner/model-name format में रखें।"
            });
        }

        const owner =
            modelParts[0];

        const modelName =
            modelParts[1];

        const endpoint =
            "https://api.replicate.com/v1/models/" +
            encodeURIComponent(owner) +
            "/" +
            encodeURIComponent(modelName) +
            "/predictions";

        const input = {
            prompt:
                String(prompt).trim()
        };

        /*
         * केवल वही fields भेजें जिन्हें
         * selected model accept करता है।
         */

        if (aspectRatio) {
            input.aspect_ratio =
                String(aspectRatio);
        }

        const response =
            await fetch(
                endpoint,
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            "Bearer " + token,

                        "Content-Type":
                            "application/json",

                        "Prefer":
                            "wait"
                    },

                    body:
                        JSON.stringify({
                            input: input
                        })
                }
            );

        const raw =
            await response.text();

        let data;

        try {

            data =
                JSON.parse(raw);

        } catch (error) {

            console.error(
                "Replicate raw response:",
                raw
            );

            return res.status(502).json({
                error:
                    "Replicate ने valid JSON नहीं भेजा।"
            });
        }

        if (!response.ok) {

            console.error(
                "Replicate API Error:",
                data
            );

            return res.status(
                response.status
            ).json({
                error:
                    data?.detail ||
                    data?.error ||
                    "Replicate video generation failed."
            });
        }

        let videoUrl = null;

        if (
            data.status === "succeeded" &&
            data.output
        ) {

            if (
                Array.isArray(
                    data.output
                )
            ) {

                videoUrl =
                    data.output[0];

            } else {

                videoUrl =
                    data.output;
            }
        }

        return res.status(200).json({

            success: true,

            predictionId:
                data.id || null,

            status:
                data.status || null,

            videoUrl:
                videoUrl

        });

    } catch (error) {

        console.error(
            "Gill AI Video Error:",
            error
        );

        return res.status(500).json({
            error:
                error?.message ||
                "Internal video server error."
        });
    }
};