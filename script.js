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

    if (!chatBox) return;

    const message =
        document.createElement("div");

    message.className =
        "message " +
        (type === "user" ? "user" : "ai");

    message.innerHTML = text;

    chatBox.appendChild(message);

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

    buttons.forEach(button => {

        if (!button) return;

        button.classList.remove(
            "active"
        );

    });

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

    setActiveButton(homeBtn);

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

    setActiveButton(chatBtn);

    removeVideoPanel();

    if (userInput) {

        userInput.focus();

    }

}


/* =========================================================
   IMAGE PAGE
========================================================= */

function showImage() {

    setActiveButton(imageBtn);

    removeVideoPanel();

    addMessage(

        "🎨 <b>AI Image</b><br><br>" +

        "AI Image Generator selected.",

        "ai"

    );

}


/* =========================================================
   VIDEO EDITOR
========================================================= */

function showEditor() {

    setActiveButton(editorBtn);

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

    setActiveButton(historyBtn);

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
        .forEach(item => {

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

        });

    addMessage(
        html,
        "ai"
    );

}


/* =========================================================
   SETTINGS
========================================================= */

function showSettings() {

    setActiveButton(settingsBtn);

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
   MENU BUTTON
========================================================= */

if (menuBtn) {

    menuBtn.addEventListener(
        "click",
        function () {

            const nav =
                document.querySelector("nav");

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
        createVideoPanel
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
   CHAT FUNCTION
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

    userInput.value = "";

    const loading =
        addMessage(
            "⏳ सोच रहा हूँ...",
            "ai"
        );

    try {

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
                                text

                        })

                }
            );

        const raw =
            await response.text();

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

        const reply =
            data?.reply ||
            data?.message ||
            data?.choices?.[0]?.message?.content ||
            "";

        if (!reply) {

            throw new Error(

                "AI response में reply नहीं मिला।"

            );

        }

        if (loading) {

            loading.innerHTML =
                escapeHTML(reply)
                    .replace(
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
            "Chat Error:",
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
                "Enter"
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

            recognition.start();

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
   Gill AI Ultimate v8
   COMPLETE script.js
   PART 2/3
   AI VIDEO GENERATOR
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

        <h2 style="margin-top:0;">
            🎬 AI Video Generator
        </h2>

        <p style="opacity:.75;">
            अपना video prompt लिखें और Generate दबाएँ।
        </p>

        <textarea
            id="gillVideoPrompt"
            placeholder="Example: Create a cinematic video of India Gate at sunset..."
            style="
                width:100%;
                min-height:130px;
                padding:14px;
                box-sizing:border-box;
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
                <option value="5">
                    5 seconds
                </option>

                <option value="10">
                    10 seconds
                </option>
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

                <option value="9:16">
                    9:16 Vertical
                </option>

                <option value="16:9">
                    16:9 Landscape
                </option>

                <option value="1:1">
                    1:1 Square
                </option>

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


    /*
       Try to place panel inside main content
    */

    const main =
        document.querySelector("main") ||
        document.querySelector(
            ".main-content"
        ) ||
        document.body;


    main.appendChild(
        videoPanel
    );


    /*
       Get newly created elements
    */

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


    /*
       Generate button
    */

    if (generateVideoBtn) {

        generateVideoBtn.addEventListener(
            "click",
            generateVideo
        );

    }


    /*
       Example prompt
    */

    if (videoPrompt) {

        videoPrompt.focus();

    }

}


/* =========================================================
   REMOVE VIDEO PANEL
========================================================= */

function removeVideoPanel() {

    const existing =
        document.getElementById(
            "gillVideoPanel"
        );

    if (existing) {

        existing.remove();

    }

    videoPanel = null;

    videoPrompt = null;

    videoDuration = null;

    videoAspectRatio = null;

    generateVideoBtn = null;

    videoPreview = null;

}


/* =========================================================
   VIDEO GENERATION
========================================================= */

async function generateVideo() {

    if (!videoPrompt) {

        createVideoPanel();

        return;

    }


    const prompt =
        videoPrompt.value.trim();


    if (!prompt) {

        alert(
            "पहले video prompt लिखें।"
        );

        videoPrompt.focus();

        return;

    }


    const duration =
        Number(
            videoDuration?.value ||
            5
        );


    const aspectRatio =
        String(
            videoAspectRatio?.value ||
            "9:16"
        );


    if (generateVideoBtn) {

        generateVideoBtn.disabled =
            true;

        generateVideoBtn.textContent =
            "⏳ Generating...";

    }


    if (videoPreview) {

        videoPreview.innerHTML = "";

    }


    const status =
        document.getElementById(
            "gillVideoStatus"
        );


    if (status) {

        status.innerHTML =

            "🎬 <b>AI Video Generation शुरू...</b>\n\n" +

            "📝 Prompt:\n" +

            escapeHTML(prompt) +

            "\n\n" +

            "⏱️ Requested Duration: " +

            duration +

            " seconds\n" +

            "📐 Ratio: " +

            aspectRatio +

            "\n\n" +

            "⏳ Video request भेजी जा रही है...";

    }


    try {

        /*
           STEP 1
           Submit video generation request
        */

        const response =
            await fetch(
                "/api/video",
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

                            aspectRatio:
                                aspectRatio,

                            duration:
                                duration

                        })

                }
            );


        /*
           IMPORTANT:
           Read text first.
           This prevents:
           "valid JSON नहीं भेजा"
           from hiding the actual server error.
        */

        const raw =
            await response.text();


        console.log(
            "VIDEO SERVER STATUS:",
            response.status
        );


        console.log(
            "VIDEO SERVER RESPONSE:",
            raw
        );


        let data = {};


        try {

            data =
                raw
                    ? JSON.parse(raw)
                    : {};

        } catch (jsonError) {

            throw new Error(

                "Video server ने valid JSON नहीं भेजा। HTTP " +

                response.status +

                "\n\nServer response:\n" +

                raw.substring(
                    0,
                    1000
                )

            );

        }


        /*
           API ERROR
        */

        if (!response.ok) {

            throw new Error(

                data?.error ||

                data?.message ||

                "Video API request failed. HTTP " +

                response.status

            );

        }


        /*
           API SUCCESS CHECK
        */

        if (
            data.success !== true
        ) {

            throw new Error(

                data?.error ||

                "Video request failed."

            );

        }


        /*
           Request ID
        */

        const requestId =
            data?.request_id ||
            "";


        const statusUrl =
            data?.status_url ||
            "";


        const responseUrl =
            data?.response_url ||
            "";


        if (!requestId) {

            throw new Error(

                "Video server ने request_id नहीं दिया।"

            );

        }


        if (status) {

            status.innerHTML =

                "✅ <b>Video request accepted!</b>\n\n" +

                "🆔 Request ID:\n" +

                escapeHTML(
                    requestId
                ) +

                "\n\n" +

                "⏳ fal.ai video तैयार कर रहा है...\n" +

                "यह process कुछ समय ले सकता है।";

        }


        /*
           STEP 2
           Poll video status
        */

        await pollVideoStatus(

            statusUrl,

            responseUrl,

            requestId

        );


    } catch (error) {

        console.error(
            "Video Generation Error:",
            error
        );


        if (status) {

            status.innerHTML =

                "❌ <b>Video Error:</b>\n\n" +

                escapeHTML(

                    error?.message ||

                    "Video generation failed."

                );

        }

    } finally {

        if (generateVideoBtn) {

            generateVideoBtn.disabled =
                false;

            generateVideoBtn.textContent =
                "🎬 Generate Video";

        }

    }

}


/* =========================================================
   VIDEO STATUS POLLING
========================================================= */

async function pollVideoStatus(
    statusUrl,
    responseUrl,
    requestId
) {

    const status =
        document.getElementById(
            "gillVideoStatus"
        );


    /*
       If server does not provide status URL,
       use our own API endpoint.
    */

    let targetUrl =
        statusUrl || "";


    /*
       Poll maximum 60 times.
       5 seconds interval.
       Total approximately 5 minutes.
    */

    const maxAttempts =
        60;


    for (
        let attempt = 1;
        attempt <= maxAttempts;
        attempt++
    ) {

        try {

            if (status) {

                status.innerHTML =

                    "🎬 <b>Video तैयार हो रही है...</b>\n\n" +

                    "⏳ Checking status... " +

                    attempt +

                    "/" +

                    maxAttempts;

            }


            /*
               Our secure proxy endpoint.
            */

            let proxyUrl =
                "/api/video-status?";


            if (targetUrl) {

                proxyUrl +=
                    "url=" +
                    encodeURIComponent(
                        targetUrl
                    );

            } else {

                proxyUrl +=
                    "request_id=" +
                    encodeURIComponent(
                        requestId
                    );

            }


            const response =
                await fetch(
                    proxyUrl,
                    {

                        method:
                            "GET",

                        headers: {

                            "Accept":
                                "application/json"

                        }

                    }
                );


            const raw =
                await response.text();


            console.log(
                "VIDEO STATUS:",
                response.status,
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

                    "Video status server ने valid JSON नहीं भेजा।\n\n" +

                    raw.substring(
                        0,
                        500
                    )

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


            /*
               VIDEO COMPLETED
            */

            if (
                data?.success === true &&
                data?.video_url
            ) {

                showGeneratedVideo(
                    data.video_url
                );

                return;

            }


            /*
               Some API responses can return
               video URL under different keys.
            */

            const videoUrl =
                data?.video?.url ||
                data?.output?.video?.url ||
                data?.output?.url ||
                data?.url ||
                "";


            if (
                currentStatus ===
                    "COMPLETED" &&
                videoUrl
            ) {

                showGeneratedVideo(
                    videoUrl
                );

                return;

            }


            /*
               FAILED
            */

            if (
                currentStatus ===
                    "FAILED" ||
                currentStatus ===
                    "ERROR"
            ) {

                throw new Error(

                    data?.error ||

                    "fal.ai video generation failed."

                );

            }


        } catch (error) {

            console.error(
                "Video Status Error:",
                error
            );


            /*
               Don't immediately fail on a
               temporary polling error.
            */

            if (
                attempt >= maxAttempts
            ) {

                throw error;

            }

        }


        /*
           Wait 5 seconds before next check.
        */

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    5000
                )
        );

    }


    throw new Error(

        "Video generation timeout. कृपया फिर से try करें।"

    );

}


/* =========================================================
   SHOW GENERATED VIDEO
========================================================= */

function showGeneratedVideo(
    videoUrl
) {

    const status =
        document.getElementById(
            "gillVideoStatus"
        );


    if (status) {

        status.innerHTML =

            "✅ <b>Video तैयार है!</b>";

    }


    if (!videoPreview) {

        videoPreview =
            document.getElementById(
                "gillVideoPreview"
            );

    }


    if (!videoPreview) return;


    videoPreview.innerHTML = `

        <div style="
            margin-top:15px;
            padding:12px;
            border-radius:15px;
            background:#020617;
        ">

            <video
                controls
                playsinline
                style="
                    width:100%;
                    max-height:600px;
                    border-radius:12px;
                    display:block;
                "
            >

                <source
                    src="${escapeHTML(videoUrl)}"
                    type="video/mp4"
                >

                आपका browser video playback
                support नहीं करता।

            </video>


            <a
                href="${escapeHTML(videoUrl)}"
                target="_blank"
                rel="noopener noreferrer"
                style="
                    display:block;
                    margin-top:12px;
                    padding:12px;
                    text-align:center;
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
   PAGE LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Gill AI Ultimate v8 loaded successfully."
        );

    }
);
/* =========================================================
   Gill AI Ultimate v8
   COMPLETE script.js
   PART 3/3
   BUTTON COMPATIBILITY + INITIALIZATION
========================================================= */


/* =========================================================
   FIND ELEMENT BY MULTIPLE POSSIBLE IDs
========================================================= */

function findElement(...ids) {

    for (const id of ids) {

        const element =
            document.getElementById(id);

        if (element) {

            return element;

        }

    }

    return null;

}


/* =========================================================
   EXTRA BUTTON COMPATIBILITY
========================================================= */

function connectExtraButtons() {

    /*
       If original HTML uses different IDs,
       connect them automatically.
    */

    const home =
        findElement(
            "home",
            "homeButton",
            "homeNav",
            "btnHome"
        );

    const chat =
        findElement(
            "chat",
            "chatButton",
            "chatNav",
            "btnChat"
        );

    const image =
        findElement(
            "image",
            "imageButton",
            "imageNav",
            "btnImage"
        );

    const video =
        findElement(
            "video",
            "videoButton",
            "videoNav",
            "btnVideo"
        );

    const editor =
        findElement(
            "editor",
            "editorButton",
            "editorNav",
            "btnEditor"
        );

    const history =
        findElement(
            "history",
            "historyButton",
            "historyNav",
            "btnHistory"
        );

    const settings =
        findElement(
            "settings",
            "settingsButton",
            "settingsNav",
            "btnSettings"
        );


    /*
       Home
    */

    if (
        home &&
        home !== homeBtn
    ) {

        home.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                showHome();

            }
        );

    }


    /*
       Chat
    */

    if (
        chat &&
        chat !== chatBtn
    ) {

        chat.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                showChat();

            }
        );

    }


    /*
       Image
    */

    if (
        image &&
        image !== imageBtn
    ) {

        image.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                showImage();

            }
        );

    }


    /*
       Video
    */

    if (
        video &&
        video !== videoBtn
    ) {

        video.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                createVideoPanel();

            }
        );

    }


    /*
       Editor
    */

    if (
        editor &&
        editor !== editorBtn
    ) {

        editor.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                showEditor();

            }
        );

    }


    /*
       History
    */

    if (
        history &&
        history !== historyBtn
    ) {

        history.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                showHistory();

            }
        );

    }


    /*
       Settings
    */

    if (
        settings &&
        settings !== settingsBtn
    ) {

        settings.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                showSettings();

            }
        );

    }

}


/* =========================================================
   GLOBAL BUTTON HANDLER
========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const target =
            event.target.closest(
                "[data-action]"
            );

        if (!target) return;


        const action =
            target.dataset.action;


        if (
            action ===
            "home"
        ) {

            event.preventDefault();

            showHome();

        }


        else if (
            action ===
            "chat"
        ) {

            event.preventDefault();

            showChat();

        }


        else if (
            action ===
            "image"
        ) {

            event.preventDefault();

            showImage();

        }


        else if (
            action ===
            "video"
        ) {

            event.preventDefault();

            createVideoPanel();

        }


        else if (
            action ===
            "editor"
        ) {

            event.preventDefault();

            showEditor();

        }


        else if (
            action ===
            "history"
        ) {

            event.preventDefault();

            showHistory();

        }


        else if (
            action ===
            "settings"
        ) {

            event.preventDefault();

            showSettings();

        }

    }
);


/* =========================================================
   CHAT FALLBACK BUTTON
========================================================= */

function connectChatFallback() {

    const possibleSendButtons = [

        "send",
        "sendButton",
        "btnSend",
        "chatSend",
        "sendMessageBtn"

    ];


    let button = null;


    for (
        const id of possibleSendButtons
    ) {

        const found =
            document.getElementById(id);

        if (found) {

            button = found;

            break;

        }

    }


    if (
        button &&
        button !== sendBtn
    ) {

        button.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                sendMessage();

            }
        );

    }


    /*
       Find textarea/input fallback
    */

    const possibleInputs = [

        "messageInput",
        "chatInput",
        "promptInput",
        "message",
        "inputMessage"

    ];


    let input = null;


    for (
        const id of possibleInputs
    ) {

        const found =
            document.getElementById(id);

        if (found) {

            input = found;

            break;

        }

    }


    if (
        input &&
        input !== userInput
    ) {

        input.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    /*
                       Copy into main input
                    */

                    if (userInput) {

                        userInput.value =
                            input.value;

                    }

                    sendMessage();

                }

            }
        );

    }

}


/* =========================================================
   VIDEO BUTTON FALLBACK
========================================================= */

function connectVideoFallback() {

    const possibleVideoButtons = [

        "aiVideoBtn",
        "videoGeneratorBtn",
        "generateVideoPage",
        "openVideo",
        "videoGenerator"

    ];


    possibleVideoButtons.forEach(
        function (id) {

            const button =
                document.getElementById(id);

            if (!button) return;

            if (
                button ===
                generateVideoBtn
            ) {

                return;

            }

            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    createVideoPanel();

                }
            );

        }
    );

}


/* =========================================================
   VOICE FALLBACK
========================================================= */

function connectVoiceFallback() {

    const possibleVoiceButtons = [

        "micBtn",
        "microphoneBtn",
        "voiceInputBtn",
        "speechBtn"

    ];


    possibleVoiceButtons.forEach(
        function (id) {

            const button =
                document.getElementById(id);

            if (!button) return;


            if (
                button ===
                voiceBtn
            ) {

                return;

            }


            button.addEventListener(
                "click",
                function () {

                    if (voiceBtn) {

                        voiceBtn.click();

                    }

                }
            );

        }
    );

}


/* =========================================================
   IMAGE UPLOAD FALLBACK
========================================================= */

function connectImageUploadFallback() {

    const possibleButtons = [

        "uploadImageBtn",
        "imageBtnUpload",
        "attachImageBtn",
        "photoBtn"

    ];


    possibleButtons.forEach(
        function (id) {

            const button =
                document.getElementById(id);

            if (!button) return;


            if (
                button ===
                imageUploadBtn
            ) {

                return;

            }


            button.addEventListener(
                "click",
                function () {

                    if (
                        imageUploadBtn
                    ) {

                        imageUploadBtn.click();

                    }

                }
            );

        }
    );

}


/* =========================================================
   PREVENT BROKEN # LINKS
========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const link =
            event.target.closest(
                "a"
            );

        if (!link) return;


        const href =
            link.getAttribute(
                "href"
            );


        if (
            href ===
            "#" ||
            href ===
            "javascript:void(0)"
        ) {

            event.preventDefault();

        }

    }
);


/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

window.addEventListener(
    "error",
    function (event) {

        console.error(
            "Gill AI JavaScript Error:",
            event.error ||
            event.message
        );

    }
);


/* =========================================================
   UNHANDLED PROMISE ERROR
========================================================= */

window.addEventListener(
    "unhandledrejection",
    function (event) {

        console.error(
            "Gill AI Promise Error:",
            event.reason
        );

    }
);


/* =========================================================
   INITIALIZATION
========================================================= */

function initializeGillAI() {

    console.log(
        "================================="
    );

    console.log(
        "Gill AI Ultimate v8"
    );

    console.log(
        "Initializing..."
    );


    connectExtraButtons();

    connectChatFallback();

    connectVideoFallback();

    connectVoiceFallback();

    connectImageUploadFallback();


    console.log(
        "Chat connected:",
        !!userInput,
        !!sendBtn
    );


    console.log(
        "Video button connected:",
        !!videoBtn
    );


    console.log(
        "Gill AI initialization complete."
    );

    console.log(
        "================================="
    );

}


/* =========================================================
   START
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeGillAI
    );

} else {

    initializeGillAI();

}


/* =========================================================
   FINAL VERSION CHECK
========================================================= */

window.GillAI = {

    version:
        "Ultimate v8",

    sendMessage:
        sendMessage,

    generateVideo:
        generateVideo,

    createVideoPanel:
        createVideoPanel,

    showHome:
        showHome,

    showChat:
        showChat,

    showImage:
        showImage,

    showHistory:
        showHistory,

    showSettings:
        showSettings

};


console.log(
    "✅ Gill AI Ultimate v8 script.js loaded."
);
