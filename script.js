/* =========================================================
   Gill AI Ultimate v8
   COMPLETE script.js
   PART 1/3
   Chat + Navigation + Voice + Upload
========================================================= */

"use strict";

/* =========================================================
   ELEMENTS
========================================================= */

const $ = (id) => document.getElementById(id);

const menuBtn        = $("menuBtn");
const homeBtn        = $("homeBtn");
const chatBtn        = $("chatBtn");
const imageBtn       = $("imageBtn");
const videoBtn       = $("videoBtn");
const editorBtn      = $("editorBtn");
const historyBtn     = $("historyBtn");
const settingsBtn    = $("settingsBtn");

const voiceBtn       = $("voiceBtn");
const imageUploadBtn = $("imageUploadBtn");
const sendBtn        = $("sendBtn");
const userInput      = $("userInput");
const chatBox        = $("chatBox");

let videoPanel = null;
let videoPrompt = null;
let videoDuration = null;
let videoAspectRatio = null;
let generateVideoBtn = null;
let videoPreview = null;


/* =========================================================
   BASIC HELPERS
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function addMessage(text, type = "ai") {

    if (!chatBox) return null;

    const message =
        document.createElement("div");

    message.className =
        "message " +
        (type === "user" ? "user" : "ai");

    message.innerHTML =
        text;

    chatBox.appendChild(
        message
    );

    chatBox.scrollTop =
        chatBox.scrollHeight;

    return message;

}


function showMessage(text) {

    addMessage(
        escapeHTML(text),
        "ai"
    );

}


/* =========================================================
   HISTORY
========================================================= */

function saveHistory(userText, aiText) {

    try {

        const history =
            JSON.parse(
                localStorage.getItem(
                    "gillAIHistory"
                ) || "[]"
            );

        history.push({

            user:
                String(userText),

            ai:
                String(aiText),

            time:
                new Date().toLocaleString()

        });

        localStorage.setItem(
            "gillAIHistory",
            JSON.stringify(
                history.slice(-100)
            )
        );

    } catch (error) {

        console.error(
            "History save error:",
            error
        );

    }

}


/* =========================================================
   NAVIGATION
========================================================= */

function setActiveButton(activeButton) {

    const buttons = [

        homeBtn,
        chatBtn,
        imageBtn,
        videoBtn,
        editorBtn,
        historyBtn,
        settingsBtn

    ];

    buttons.forEach(
        (button) => {

            if (!button) return;

            button.classList.remove(
                "active"
            );

        }
    );

    if (activeButton) {

        activeButton.classList.add(
            "active"
        );

    }

}


/* =========================================================
   HOME
========================================================= */

function showHome() {

    setActiveButton(
        homeBtn
    );

    removeVideoPanel();

    addMessage(

        "🏠 <b>Home</b><br><br>" +

        "👋 नमस्ते! मैं Gill AI Ultimate v8 हूँ।<br><br>" +

        "💬 Chat के लिए Chat दबाएँ।<br>" +

        "🎨 AI Image के लिए AI Image दबाएँ।<br>" +

        "🎬 AI Video के लिए AI Video दबाएँ।",

        "ai"

    );

}


/* =========================================================
   CHAT PAGE
========================================================= */

function showChat() {

    setActiveButton(
        chatBtn
    );

    removeVideoPanel();

    if (userInput) {

        userInput.focus();

    }

}

function showImage() {

    setActiveButton(imageBtn);

    removeVideoPanel();

    addMessage(`
        <div style="width:100%;">
            <h3>🎨 AI Image Generator</h3>

            <p>
                अपनी image का description लिखें:
            </p>

            <textarea
                id="gillImagePrompt"
                placeholder="Example: A black sports bike on a rainy road at night, cinematic lighting..."
                style="
                    width:100%;
                    min-height:110px;
                    padding:12px;
                    border-radius:12px;
                    resize:vertical;
                    box-sizing:border-box;
                "
            ></textarea>

            <button
                id="gillGenerateImage"
                onclick="generateGillImage()"
                style="
                    margin-top:10px;
                    padding:12px 18px;
                    border-radius:12px;
                    border:none;
                    cursor:pointer;
                    font-weight:bold;
                "
            >
                🎨 Generate Image
            </button>

            <div
                id="gillImageResult"
                style="
                    margin-top:15px;
                    text-align:center;
                "
            ></div>
        </div>
    `, "ai");
}


async function generateGillImage() {

    const promptElement =
        document.getElementById("gillImagePrompt");

    const button =
        document.getElementById("gillGenerateImage");

    const result =
        document.getElementById("gillImageResult");

    if (!promptElement || !button || !result) {
        return;
    }

    const prompt =
        promptElement.value.trim();

    if (!prompt) {
        result.innerHTML =
            "⚠️ पहले image का description लिखें।";
        return;
    }

    button.disabled = true;
    button.innerText = "⏳ Generating...";

    result.innerHTML =
        "🎨 आपकी image बनाई जा रही है...";

    try {

        const response = await fetch(
            "/api/image",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    prompt: prompt
                })
            }
        );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            result.innerHTML =
    "❌ " +
    (data.error || "Image generation failed.") +
    "<br><br>" +
    (data.status ? "Status: " + data.status + "<br>" : "") +
    (data.details ? "Details: " + data.details : "");

            return;
        }

        result.innerHTML = `
            <img
                src="${data.image}"
                alt="Gill AI Generated Image"
                style="
                    max-width:100%;
                    border-radius:16px;
                    display:block;
                    margin:10px auto;
                "
            >

            <p>
                💰 Credits remaining:
                <b>${data.credits}</b>
            </p>

            <a
                href="${data.image}"
                download="gill-ai-image.png"
                style="
                    display:inline-block;
                    margin-top:8px;
                    padding:10px 16px;
                    border-radius:10px;
                    text-decoration:none;
                    font-weight:bold;
                "
            >
                ⬇️ Save Image
            </a>
        `;

    } catch (error) {

        console.error(
            "Gill AI Image Error:",
            error
        );

        result.innerHTML =
            "❌ Server error. Please try again.";

    } finally {

        button.disabled = false;
        button.innerText =
            "🎨 Generate Image";
    }
}

/* =========================================================
   VIDEO EDITOR
========================================================= */

function showEditor() {

    setActiveButton(
        editorBtn
    );

    removeVideoPanel();

    addMessage(

        "✂️ <b>Video Editor</b><br><br>" +

        "Video Editor selected.",

        "ai"

    );

}


/* =========================================================
   HISTORY PAGE
========================================================= */

function showHistory() {

    setActiveButton(
        historyBtn
    );

    removeVideoPanel();

    let history = [];

    try {

        history =
            JSON.parse(
                localStorage.getItem(
                    "gillAIHistory"
                ) || "[]"
            );

    } catch (error) {

        history = [];

    }

    if (!history.length) {

        addMessage(

            "🕒 <b>History</b><br><br>" +

            "अभी कोई chat history नहीं है।",

            "ai"

        );

        return;

    }

    let html =
        "🕒 <b>Chat History</b><br><br>";

    history
        .slice()
        .reverse()
        .slice(0, 20)
        .forEach(
            (item) => {

                html +=

                    "<div style=\"" +

                    "padding:10px;" +
                    "margin:6px 0;" +
                    "border-radius:12px;" +
                    "background:#1e293b;" +

                    "\">" +

                    "<b>👤 " +

                    escapeHTML(
                        item.user
                    ) +

                    "</b><br>" +

                    "<span>" +

                    escapeHTML(
                        item.ai
                    ) +

                    "</span><br>" +

                    "<small style=\"opacity:.6\">" +

                    escapeHTML(
                        item.time
                    ) +

                    "</small>" +

                    "</div>";

            }
        );

    addMessage(
        html,
        "ai"
    );

}


/* =========================================================
   SETTINGS
========================================================= */

function showSettings() {

    setActiveButton(
        settingsBtn
    );

    removeVideoPanel();

    addMessage(

        "⚙️ <b>Settings</b><br><br>" +

        "🤖 Gill AI Ultimate v8<br>" +

        "🌐 API: Vercel<br>" +

        "💬 Chat: OpenRouter<br>" +

        "🎬 Video: fal.ai",

        "ai"

    );

}


/* =========================================================
   MENU
========================================================= */

if (menuBtn) {

    menuBtn.addEventListener(
        "click",
        function () {

            const nav =
                document.querySelector(
                    "nav"
                );

            if (!nav) return;

            if (
                nav.style.display ===
                "none"
            ) {

                nav.style.display =
                    "flex";

            } else {

                nav.style.display =
                    "none";

            }

        }
    );

}


/* =========================================================
   NAVIGATION BUTTONS
========================================================= */

if (homeBtn) {

    homeBtn.addEventListener(
        "click",
        showHome
    );

}

if (chatBtn) {

    chatBtn.addEventListener(
        "click",
        showChat
    );

}

if (imageBtn) {

    imageBtn.addEventListener(
        "click",
        showImage
    );

}

if (videoBtn) {

    videoBtn.addEventListener(
        "click",
        function () {

            createVideoPanel();

        }
    );

}

if (editorBtn) {

    editorBtn.addEventListener(
        "click",
        showEditor
    );

}

if (historyBtn) {

    historyBtn.addEventListener(
        "click",
        showHistory
    );

}

if (settingsBtn) {

    settingsBtn.addEventListener(
        "click",
        showSettings
    );

}


/* =========================================================
   CHAT API
========================================================= */

async function aiReply(message) {

    const response =
        await fetch(
            "/api/chat",
            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Accept":
                        "application/json"

                },

                body:
                    JSON.stringify({

                        message:
                            message

                    })

            }
        );


    const raw =
        await response.text();


    console.log(
        "Gill AI API STATUS:",
        response.status
    );


    console.log(
        "Gill AI API RESPONSE:",
        raw
    );


    let data = {};

    try {

        data =
            raw
                ? JSON.parse(raw)
                : {};

    } catch (error) {

        throw new Error(
            "AI server ने valid JSON नहीं भेजा। /api/chat check करें।"
        );

    }


    if (!response.ok) {

        throw new Error(
            data?.error ||
            "AI request failed."
        );

    }


    /*
       Main response format:
       { success:true, reply:"..." }
    */

    let reply =
        data?.reply;


    /*
       Compatibility
    */

    if (!reply) {

        reply =
            data?.message;

    }


    if (!reply) {

        reply =
            data?.choices?.[0]?.message?.content;

    }


    if (!reply) {

        reply =
            data?.output?.text;

    }


    if (!reply) {

        reply =
            data?.output;

    }


    /*
       Safety-style response compatibility
    */

    if (
        data?.result &&
        typeof data.result ===
        "string"
    ) {

        reply =
            data.result;

    }


    if (
        reply &&
        typeof reply ===
        "object"
    ) {

        reply =
            reply.text ||
            reply.content ||
            reply.message ||
            JSON.stringify(
                reply
            );

    }


    reply =
        String(
            reply || ""
        ).trim();


    if (!reply) {

        throw new Error(
            "AI response में reply नहीं मिला।"
        );

    }


    return reply;

}


/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage() {

    if (!userInput) return;


    const text =
        userInput.value.trim();


    if (!text) return;


    addMessage(
        escapeHTML(text),
        "user"
    );


    userInput.value =
        "";


    const loading =
        addMessage(
            "⏳ Gill AI सोच रहा है...",
            "ai"
        );


    try {

        const reply =
            await aiReply(
                text
            );


        if (loading) {

            loading.innerHTML =
                escapeHTML(
                    reply
                ).replace(
                    /\n/g,
                    "<br>"
                );

        }


        saveHistory(
            text,
            reply
        );


    } catch (error) {

        console.error(
            "Gill AI Chat Error:",
            error
        );


        if (loading) {

            loading.innerHTML =

                "❌ <b>AI Error:</b><br><br>" +

                escapeHTML(
                    error?.message ||
                    "AI request failed."
                );

        }

    }

}


/* =========================================================
   SEND BUTTON
========================================================= */

if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        sendMessage
    );

}


/* =========================================================
   ENTER KEY
========================================================= */

if (userInput) {

    userInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );

}


/* =========================================================
   VOICE INPUT
========================================================= */

if (voiceBtn) {

    voiceBtn.addEventListener(
        "click",
        function () {

            const SpeechRecognition =
                window.SpeechRecognition ||
                window.webkitSpeechRecognition;


            if (!SpeechRecognition) {

                showMessage(
                    "❌ इस browser में voice input supported नहीं है।"
                );

                return;

            }


            const recognition =
                new SpeechRecognition();


            recognition.lang =
                "hi-IN";


            recognition.interimResults =
                false;


            recognition.maxAlternatives =
                1;


            voiceBtn.textContent =
                "🔴";


            try {

                recognition.start();

            } catch (error) {

                console.error(
                    "Voice start error:",
                    error
                );

            }


            recognition.onresult =
                function (event) {

                    const transcript =
                        event
                            .results[0][0]
                            .transcript;


                    if (userInput) {

                        userInput.value =
                            transcript;

                    }

                };


            recognition.onerror =
                function (event) {

                    console.error(
                        "Voice error:",
                        event
                    );

                    showMessage(
                        "❌ Voice input error."
                    );

                };


            recognition.onend =
                function () {

                    voiceBtn.textContent =
                        "🎤";

                };

        }
    );

}


/* =========================================================
   IMAGE UPLOAD
========================================================= */

if (imageUploadBtn) {

    imageUploadBtn.addEventListener(
        "click",
        function () {

            const input =
                document.createElement(
                    "input"
                );


            input.type =
                "file";


            input.accept =
                "image/*";


            input.click();


            input.onchange =
                function () {

                    const file =
                        input.files?.[0];


                    if (!file) return;


                    addMessage(

                        "🖼️ Image selected: <b>" +

                        escapeHTML(
                            file.name
                        ) +

                        "</b>",

                        "user"

                    );

                };

        }
    );

}


/* =========================================================
   PART 1 READY
   PART 2 MUST START AFTER THIS LINE
========================================================= */

console.log(
    "✅ Gill AI Ultimate v8 Part 1/3 loaded."
);
/* =========================================================
   Gill AI Ultimate v8
   PART 2/3
   AI VIDEO GENERATOR
   /api/video + /api/video-status
========================================================= */


/* =========================================================
   CREATE VIDEO PANEL
========================================================= */

function createVideoPanel() {

    setActiveButton(videoBtn);

    removeVideoPanel();

    videoPanel =
        document.createElement("div");

    videoPanel.id =
        "gillVideoPanel";

    videoPanel.style.cssText = `
        width:100%;
        max-width:900px;
        margin:20px auto;
        padding:20px;
        box-sizing:border-box;
        border-radius:20px;
        background:#0f172a;
        color:white;
        border:1px solid #334155;
    `;

    videoPanel.innerHTML = `

        <h2>🎬 AI Video Generator</h2>

        <p style="opacity:.75;">
            अपना prompt लिखें और Generate Video दबाएँ।
        </p>

        <textarea
            id="gillVideoPrompt"
            placeholder="Create a cinematic video of India Gate at sunset..."
            style="
                width:100%;
                min-height:130px;
                box-sizing:border-box;
                padding:14px;
                border-radius:12px;
                border:1px solid #475569;
                background:#020617;
                color:white;
                resize:vertical;
            "
        ></textarea>

        <div style="
            display:flex;
            gap:10px;
            flex-wrap:wrap;
            margin-top:15px;
        ">

            <select
                id="gillVideoDuration"
                style="
                    padding:12px;
                    border-radius:10px;
                    background:#020617;
                    color:white;
                    border:1px solid #475569;
                "
            >
                <option value="5">5 seconds</option>
                <option value="10">10 seconds</option>
            </select>

            <select
                id="gillVideoAspectRatio"
                style="
                    padding:12px;
                    border-radius:10px;
                    background:#020617;
                    color:white;
                    border:1px solid #475569;
                "
            >
                <option value="9:16">9:16 Vertical</option>
                <option value="16:9">16:9 Landscape</option>
                <option value="1:1">1:1 Square</option>
            </select>

        </div>

        <button
            id="gillGenerateVideo"
            type="button"
            style="
                width:100%;
                margin-top:15px;
                padding:14px;
                border:0;
                border-radius:12px;
                background:#2563eb;
                color:white;
                font-size:16px;
                font-weight:bold;
                cursor:pointer;
            "
        >
            🎬 Generate Video
        </button>

        <div
            id="gillVideoStatus"
            style="
                margin-top:15px;
                line-height:1.6;
                white-space:pre-wrap;
            "
        ></div>

        <div
            id="gillVideoPreview"
            style="
                margin-top:15px;
            "
        ></div>
    `;

    const main =
        document.querySelector("main") ||
        document.querySelector(".main-content") ||
        document.body;

    main.appendChild(videoPanel);

    videoPrompt =
        document.getElementById(
            "gillVideoPrompt"
        );

    videoDuration =
        document.getElementById(
            "gillVideoDuration"
        );

    videoAspectRatio =
        document.getElementById(
            "gillVideoAspectRatio"
        );

    generateVideoBtn =
        document.getElementById(
            "gillGenerateVideo"
        );

    videoPreview =
        document.getElementById(
            "gillVideoPreview"
        );

    if (generateVideoBtn) {

        generateVideoBtn.addEventListener(
            "click",
            generateVideo
        );

    }

    if (videoPrompt) {

        videoPrompt.focus();

    }

}


/* =========================================================
   REMOVE VIDEO PANEL
========================================================= */

function removeVideoPanel() {

    const panel =
        document.getElementById(
            "gillVideoPanel"
        );

    if (panel) {

        panel.remove();

    }

    videoPanel = null;
    videoPrompt = null;
    videoDuration = null;
    videoAspectRatio = null;
    generateVideoBtn = null;
    videoPreview = null;

}
/* =========================================================
   GENERATE VIDEO — REPLICATE
========================================================= */

async function generateVideo() {

    if (!videoPrompt) {
        createVideoPanel();
        return;
    }

    const prompt =
        videoPrompt.value.trim();

    if (!prompt) {
        alert("पहले video prompt लिखें।");
        videoPrompt.focus();
        return;
    }

    const duration =
        Number(videoDuration?.value || 5);

    const aspectRatio =
        String(videoAspectRatio?.value || "9:16");

    const status =
        document.getElementById(
            "gillVideoStatus"
        );

    if (status) {
        status.innerHTML =
            "🎬 <b>AI Video Generation शुरू...</b><br><br>" +
            "📝 Prompt:<br>" +
            escapeHTML(prompt) +
            "<br><br>" +
            "⏱️ Duration: " +
            duration +
            " seconds<br>" +
            "📐 Ratio: " +
            escapeHTML(aspectRatio) +
            "<br><br>" +
            "⏳ Replicate को request भेजी जा रही है...";
    }

    if (generateVideoBtn) {
        generateVideoBtn.disabled = true;
        generateVideoBtn.textContent =
            "⏳ Generating...";
    }

    try {

        const response =
            await fetch(
                "/api/video",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                        "Accept":
                            "application/json"
                    },

                    body: JSON.stringify({
                        prompt: prompt,
                        duration: duration,
                        aspectRatio: aspectRatio
                    })
                }
            );

        const raw =
            await response.text();

        console.log(
            "VIDEO API STATUS:",
            response.status
        );

        console.log(
            "VIDEO API RESPONSE:",
            raw
        );

        let data = {};

        try {
            data =
                raw
                    ? JSON.parse(raw)
                    : {};
        } catch {
            throw new Error(
                "Video server ने valid JSON नहीं भेजा।"
            );
        }

        if (!response.ok) {
            throw new Error(
                data?.error ||
                data?.details ||
                "Video API request failed."
            );
        }

        if (data?.success !== true) {
            throw new Error(
                data?.error ||
                "Video request failed."
            );
        }

        /*
         * Replicate prediction ID
         */

        const predictionId =
            data?.id ||
            data?.prediction_id ||
            data?.predictionId ||
            "";

        if (!predictionId) {
            throw new Error(
                "Replicate prediction ID नहीं मिला।"
            );
        }

        if (status) {
            status.innerHTML =
                "✅ <b>Video request submitted.</b><br><br>" +
                "🆔 Prediction ID:<br>" +
                escapeHTML(predictionId) +
                "<br><br>" +
                "⏳ Video generate हो रही है...";
        }

        await checkVideoResult(
            predictionId
        );

    } catch (error) {

        console.error(
            "AI Video Error:",
            error
        );

        if (status) {
            status.innerHTML =
                "❌ <b>Video Error:</b><br><br>" +
                escapeHTML(
                    error?.message ||
                    "Video generation failed."
                );
        }

    } finally {

        if (generateVideoBtn) {
            generateVideoBtn.disabled = false;
            generateVideoBtn.textContent =
                "🎬 Generate Video";
        }
    }
}


/* =========================================================
   CHECK REPLICATE VIDEO RESULT
========================================================= */

async function checkVideoResult(
    predictionId
) {

    const status =
        document.getElementById(
            "gillVideoStatus"
        );

    const maxAttempts = 60;
    const waitTime = 5000;

    for (
        let attempt = 1;
        attempt <= maxAttempts;
        attempt++
    ) {

        try {

            if (status) {
                status.innerHTML =
                    "🎬 <b>Video generate हो रही है...</b><br><br>" +
                    "⏳ Status check: " +
                    attempt +
                    "/" +
                    maxAttempts;
            }

            /*
             * Our Vercel endpoint checks
             * the Replicate prediction.
             */

            const response =
                await fetch(
                    "/api/video-status?id=" +
                    encodeURIComponent(
                        predictionId
                    ),
                    {
                        method: "GET",

                        headers: {
                            "Accept":
                                "application/json"
                        }
                    }
                );

            const raw =
                await response.text();

            console.log(
                "VIDEO STATUS HTTP:",
                response.status
            );

            console.log(
                "VIDEO STATUS RAW:",
                raw
            );

            let data = {};

            try {
                data =
                    raw
                        ? JSON.parse(raw)
                        : {};
            } catch {
                throw new Error(
                    "Video status server ने valid JSON नहीं भेजा।"
                );
            }

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                    data?.details ||
                    "Video status request failed."
                );
            }

            const currentStatus =
                String(
                    data?.status ||
                    ""
                ).toLowerCase();

            /*
             * Replicate completed
             */

            if (
                currentStatus === "succeeded" ||
                data?.video_url ||
                data?.videoUrl
            ) {

                const videoUrl =
                    data?.video_url ||
                    data?.videoUrl ||
                    data?.output?.url ||
                    data?.output ||
                    "";

                if (!videoUrl) {
                    throw new Error(
                        "Video complete हुई लेकिन URL नहीं मिला।"
                    );
                }

                showGeneratedVideo(
                    videoUrl
                );

                return;
            }

            /*
             * Replicate failed
             */

            if (
                currentStatus === "failed" ||
                currentStatus === "canceled" ||
                currentStatus === "cancelled"
            ) {

                throw new Error(
                    data?.error ||
                    data?.message ||
                    "Replicate video generation failed."
                );
            }

        } catch (error) {

            console.error(
                "Video status error:",
                error
            );

            if (
                attempt >= maxAttempts
            ) {
                throw error;
            }
        }

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    waitTime
                )
        );
    }

    throw new Error(
        "Video generation timeout."
    );
}

    statusUrl,
    requestId
) {

    const status =
        document.getElementById(
            "gillVideoStatus"
        );


    let url =
        statusUrl;


    /*
       Fallback status URL.
       Normally /api/video already returns
       status_url, so this is only a fallback.
    */

    if (!url) {

        throw new Error(
            "Video status URL नहीं मिला।"
        );

    }


    const maxAttempts =
        60;


    const waitTime =
        5000;


    for (
        let attempt = 1;
        attempt <= maxAttempts;
        attempt++
    ) {

        try {

            if (status) {

                status.innerHTML =
                    "🎬 <b>Video generate हो रही है...</b>\n\n" +
                    "⏳ Status check: " +
                    attempt +
                    "/" +
                    maxAttempts;

            }


            /*
             * Send fal.ai status URL through our
             * Vercel endpoint.
             */

            const response =
                await fetch(
                    "/api/video-status?url=" +
                    encodeURIComponent(url),
                    {
                        method: "GET",

                        headers: {
                            "Accept":
                                "application/json"
                        }
                    }
                );


            const raw =
                await response.text();


            console.log(
                "VIDEO STATUS HTTP:",
                response.status
            );

            console.log(
                "VIDEO STATUS RAW:",
                raw
            );


            let data = {};

            try {

                data =
                    raw
                        ? JSON.parse(raw)
                        : {};

            } catch (error) {

                throw new Error(
                    "Video status server ने valid JSON नहीं भेजा।"
                );

            }


            if (!response.ok) {

                throw new Error(
                    data?.error ||
                    "Video status request failed."
                );

            }


            const currentStatus =
                String(
                    data?.status ||
                    ""
                ).toUpperCase();


            /* -------------------------------------------------
               VIDEO COMPLETE
            ------------------------------------------------- */

            const videoUrl =
                data?.video_url ||
                data?.videoUrl ||
                data?.video?.url ||
                data?.output?.video?.url ||
                data?.output?.url ||
                "";


            if (
                currentStatus === "COMPLETED" ||
                videoUrl
            ) {

                if (!videoUrl) {

                    throw new Error(
                        "Video complete हुई लेकिन URL नहीं मिला।"
                    );

                }

                showGeneratedVideo(
                    videoUrl
                );

                return;

            }


            /* -------------------------------------------------
               VIDEO FAILED
            ------------------------------------------------- */

            if (
                currentStatus === "FAILED" ||
                currentStatus === "ERROR" ||
                currentStatus === "CANCELLED"
            ) {

                throw new Error(
                    data?.error ||
                    data?.message ||
                    "fal.ai video generation failed."
                );

            }

        } catch (error) {

            console.error(
                "Video status error:",
                error
            );


            /*
             * Retry temporary errors until
             * maximum attempts are reached.
             */

            if (
                attempt >= maxAttempts
            ) {

                throw error;

            }

        }


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    waitTime
                )
        );

    }


    throw new Error(
        "Video generation timeout."
    );

}


/* =========================================================
   DISPLAY GENERATED VIDEO
========================================================= */

function showGeneratedVideo(
    videoUrl
) {

    const status =
        document.getElementById(
            "gillVideoStatus"
        );

    const preview =
        document.getElementById(
            "gillVideoPreview"
        );


    if (status) {

        status.innerHTML =
            "✅ <b>Video तैयार है!</b>";

    }


    if (!preview) return;


    preview.innerHTML = `

        <div style="
            margin-top:15px;
            padding:12px;
            border-radius:14px;
            background:#020617;
            border:1px solid #334155;
        ">

            <video
                controls
                playsinline
                preload="metadata"
                style="
                    width:100%;
                    max-height:600px;
                    border-radius:12px;
                    display:block;
                "
                src="${escapeHTML(videoUrl)}"
            ></video>

            <a
                href="${escapeHTML(videoUrl)}"
                target="_blank"
                rel="noopener noreferrer"
                style="
                    display:block;
                    margin-top:12px;
                    text-align:center;
                    padding:12px;
                    border-radius:10px;
                    background:#2563eb;
                    color:white;
                    text-decoration:none;
                    font-weight:bold;
                "
            >
                ▶️ Open Generated Video
            </a>

        </div>

    `;

}


/* =========================================================
   PART 2 READY
========================================================= */

console.log(
    "✅ Gill AI Ultimate v8 Part 2/3 loaded."
);

/* =========================================================
   Gill AI Ultimate v8
   COMPLETE script.js
   PART 3/3
   AI VIDEO API + STATUS + RESULT
========================================================= */

"use strict";


/* =========================================================
   VIDEO API SETTINGS
========================================================= */

const VIDEO_API_URL =
    "/api/video";

const VIDEO_STATUS_API_URL =
    "/api/video-status";


/* =========================================================
   SAFE JSON RESPONSE READER
========================================================= */

async function readJSONResponse(response) {

    const raw =
        await response.text();

    let data = {};

    try {

        data =
            raw
                ? JSON.parse(raw)
                : {};

    } catch (error) {

        console.error(
            "Invalid JSON response:",
            raw.substring(0, 2000)
        );

        throw new Error(
            "Video server ने valid JSON नहीं भेजा।"
        );

    }

    return {
        response,
        data,
        raw
    };

}


/* =========================================================
   UPDATE VIDEO STATUS
========================================================= */

function updateVideoStatus(text) {

    const status =
        document.getElementById(
            "gillVideoStatus"
        );

    if (status) {

        status.textContent =
            String(text || "");

    }

}


/* =========================================================
   SHOW VIDEO RESULT
========================================================= */

function showVideoResult(videoUrl) {

    const preview =
        document.getElementById(
            "gillVideoPreview"
        );

    if (!preview) return;

    if (!videoUrl) {

        preview.innerHTML =
            "<p>❌ Video URL नहीं मिला।</p>";

        return;

    }


    /*
       Video URL को safely encode करें
    */

    const safeUrl =
        String(videoUrl)
            .replace(/"/g, "&quot;");


    preview.innerHTML = `

        <div style="
            margin-top:15px;
            padding:15px;
            border-radius:15px;
            background:#020617;
            border:1px solid #334155;
        ">

            <h3 style="margin-top:0;">
                ✅ Video तैयार है
            </h3>

            <video
                controls
                playsinline
                style="
                    width:100%;
                    max-width:720px;
                    border-radius:14px;
                    display:block;
                    background:#000;
                "
                src="${safeUrl}"
            ></video>

            <a
                href="${safeUrl}"
                target="_blank"
                rel="noopener noreferrer"
                style="
                    display:inline-block;
                    margin-top:12px;
                    padding:12px 16px;
                    border-radius:10px;
                    background:#2563eb;
                    color:white;
                    text-decoration:none;
                    font-weight:bold;
                "
            >
                ▶️ Open Video
            </a>

        </div>

    `;

}


/* =========================================================
   FIND VIDEO URL FROM FAL RESPONSE
========================================================= */

function extractVideoURL(data) {

    if (!data) return "";


    /*
       Direct video
    */

    if (data.video?.url) {

        return String(
            data.video.url
        );

    }


    /*
       output.video.url
    */

    if (data.output?.video?.url) {

        return String(
            data.output.video.url
        );

    }


    /*
       output.url
    */

    if (data.output?.url) {

        return String(
            data.output.url
        );

    }


    /*
       output as string
    */

    if (
        typeof data.output ===
        "string"
    ) {

        return String(
            data.output
        );

    }


    /*
       output array
    */

    if (
        Array.isArray(
            data.output
        )
    ) {

        const first =
            data.output[0];

        if (
            typeof first ===
            "string"
        ) {

            return first;

        }

        if (first?.url) {

            return String(
                first.url
            );

        }

    }


    /*
       result.video.url
    */

    if (data.result?.video?.url) {

        return String(
            data.result.video.url
        );

    }


    /*
       result.url
    */

    if (data.result?.url) {

        return String(
            data.result.url
        );

    }


    return "";

}


/* =========================================================
   CHECK VIDEO STATUS
========================================================= */

async function checkVideoStatus(
    statusUrl,
    attempt = 0
) {

    /*
       Maximum polling attempts
       लगभग 5 minutes
    */

    const MAX_ATTEMPTS =
        60;


    if (
        !statusUrl
    ) {

        throw new Error(
            "Video status URL नहीं मिला।"
        );

    }


    if (
        attempt >=
        MAX_ATTEMPTS
    ) {

        throw new Error(
            "Video generation में बहुत समय लग रहा है। बाद में status फिर check करें।"
        );

    }


    updateVideoStatus(
        "⏳ Video तैयार हो रही है...\n\n" +
        "🔄 Status check " +
        (attempt + 1) +
        "/" +
        MAX_ATTEMPTS
    );


    /*
       Encode status URL
    */

    const requestURL =
        VIDEO_STATUS_API_URL +
        "?url=" +
        encodeURIComponent(
            statusUrl
        );


    const response =
        await fetch(
            requestURL,
            {

                method:
                    "GET",

                headers: {

                    "Accept":
                        "application/json"

                }

            }
        );


    const result =
        await readJSONResponse(
            response
        );


    const data =
        result.data;


    /*
       Server error
    */

    if (
        !result.response.ok
    ) {

        throw new Error(

            data?.error ||
            "Video status request failed."

        );

    }


    /*
       Video URL खोजें
    */

    const videoUrl =
        extractVideoURL(
            data
        );


    /*
       अगर video मिल गई
    */

    if (videoUrl) {

        updateVideoStatus(
            "✅ Video successfully generated!"
        );

        showVideoResult(
            videoUrl
        );

        return {
            success: true,
            videoUrl: videoUrl,
            data: data
        };

    }


    /*
       Status पढ़ें
    */

    const status =
        String(
            data?.status ||
            data?.state ||
            ""
        ).toUpperCase();


    /*
       Completed लेकिन URL नहीं
    */

    if (
        status ===
            "COMPLETED" ||
        status ===
            "SUCCEEDED" ||
        status ===
            "SUCCESS"
    ) {

        updateVideoStatus(
            "⚠️ Video complete है लेकिन video URL अभी नहीं मिला।"
        );

        /*
           एक बार फिर check
        */

        setTimeout(
            function () {

                checkVideoStatus(
                    statusUrl,
                    attempt + 1
                ).catch(
                    handleVideoError
                );

            },
            2000
        );

        return;

    }


    /*
       Failed states
    */

    if (
        status === "FAILED" ||
        status === "ERROR" ||
        status === "CANCELLED"
    ) {

        throw new Error(

            data?.error ||
            data?.detail ||
            data?.message ||
            "Video generation failed."

        );

    }


    /*
       अभी processing में है
    */

    updateVideoStatus(

        "⏳ Video तैयार हो रही है...\n\n" +

        "📊 Status: " +

        (
            status ||
            "IN_QUEUE"
        ) +

        "\n\n" +

        "🔄 अगला check कुछ seconds में..."

    );


    /*
       Poll again
    */

    setTimeout(
        function () {

            checkVideoStatus(
                statusUrl,
                attempt + 1
            ).catch(
                handleVideoError
            );

        },
        5000
    );

}


/* =========================================================
   ERROR HANDLER
========================================================= */

function handleVideoError(error) {

    console.error(
        "Gill AI Video Error:",
        error
    );


    updateVideoStatus(

        "❌ Video Error:\n\n" +

        (
            error?.message ||
            "Video generation failed."
        )

    );

}


/* =========================================================
   GENERATE VIDEO
========================================================= */

async function generateVideo() {

    const promptElement =
        document.getElementById(
            "gillVideoPrompt"
        );

    const durationElement =
        document.getElementById(
            "gillVideoDuration"
        );

    const ratioElement =
        document.getElementById(
            "gillVideoAspectRatio"
        );

    const button =
        document.getElementById(
            "gillGenerateVideo"
        );


    if (!promptElement) {

        console.error(
            "Video prompt element not found."
        );

        return;

    }


    const prompt =
        String(
            promptElement.value ||
            ""
        ).trim();


    if (!prompt) {

        alert(
            "पहले video prompt लिखें।"
        );

        promptElement.focus();

        return;

    }


    const duration =
        Number(
            durationElement?.value ||
            5
        );


    const aspectRatio =
        String(
            ratioElement?.value ||
            "9:16"
        );


    /*
       Button disable
    */

    if (button) {

        button.disabled =
            true;

        button.textContent =
            "⏳ Generating...";

        button.style.opacity =
            "0.7";

        button.style.cursor =
            "not-allowed";

    }


    const preview =
        document.getElementById(
            "gillVideoPreview"
        );

    if (preview) {

        preview.innerHTML =
            "";

    }


    updateVideoStatus(

        "🎬 AI Video Generation शुरू...\n\n" +

        "📝 Prompt:\n" +

        prompt +

        "\n\n" +

        "⏱️ Duration: " +

        duration +

        " seconds\n" +

        "📐 Ratio: " +

        aspectRatio +

        "\n\n" +

        "📡 Server से connection हो रहा है..."

    );


    try {

        /*
           Send request to Vercel
           /api/video
        */

        const response =
            await fetch(
                VIDEO_API_URL,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            prompt:
                                prompt,

                            duration:
                                duration,

                            aspectRatio:
                                aspectRatio

                        })

                }
            );


        /*
           Read JSON safely
        */

        const result =
            await readJSONResponse(
                response
            );


        const data =
            result.data;


        /*
           HTTP error
        */

        if (
            !result.response.ok
        ) {

            throw new Error(

                data?.error ||

                "Video server request failed. HTTP " +
                result.response.status

            );

        }


        /*
           API success check
        */

        if (
            data?.success !== true
        ) {

            throw new Error(

                data?.error ||
                "Video request successful नहीं हुआ।"

            );

        }


        /*
           Status URL
        */

        const statusUrl =
            data?.status_url ||
            data?.statusUrl ||
            "";


        /*
           Direct video URL भी हो सकती है
        */

        const directVideoURL =
            extractVideoURL(
                data
            );


        if (
            directVideoURL
        ) {

            updateVideoStatus(
                "✅ Video तैयार है!"
            );

            showVideoResult(
                directVideoURL
            );

            return;

        }


        /*
           Status URL नहीं मिला
        */

        if (!statusUrl) {

            throw new Error(

                "Video request accepted हुई लेकिन status URL नहीं मिला।"

            );

        }


        /*
           Queue request accepted
        */

        updateVideoStatus(

            "✅ Video request server को भेज दी गई।\n\n" +

            "🆔 Request ID: " +

            (
                data?.request_id ||
                "Available"
            ) +

            "\n\n" +

            "⏳ अब video status check हो रहा है..."

        );


        /*
           Start polling
        */

        await checkVideoStatus(
            statusUrl,
            0
        );


    } catch (error) {

        handleVideoError(
            error
        );

    } finally {

        /*
           Button फिर enable
           करें
        */

        if (button) {

            button.disabled =
                false;

            button.textContent =
                "🎬 Generate Video";

            button.style.opacity =
                "1";

            button.style.cursor =
                "pointer";

        }

    }

}


/* =========================================================
   CONNECT GENERATE BUTTON
========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const target =
            event.target;

        if (!target) return;


        /*
           Main generated button
        */

        if (
            target.id ===
            "gillGenerateVideo"
        ) {

            /*
               Prevent duplicate listeners
            */

            if (
                !target.dataset
                    .gillConnected
            ) {

                target.dataset
                    .gillConnected =
                    "true";

            }

        }

    }
);


/* =========================================================
   GLOBAL VIDEO FUNCTIONS
========================================================= */

window.generateVideo =
    generateVideo;

window.checkVideoStatus =
    checkVideoStatus;

window.showVideoResult =
    showVideoResult;


/* =========================================================
   STARTUP MESSAGE
========================================================= */

console.log(
    "Gill AI Ultimate v8 — Video API connected ✅"
);

console.log(
    "POST:",
    VIDEO_API_URL
);

console.log(
    "STATUS:",
    VIDEO_STATUS_API_URL
);