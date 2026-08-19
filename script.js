/* =========================================================
   Gill AI Ultimate v8
   SCRIPT.JS — PART 1/5
   CORE + CHAT + VOICE + HISTORY
========================================================= */

"use strict";

/* =========================================================
   ELEMENTS
========================================================= */

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");
const imageBtn = document.getElementById("imageBtn");
const videoBtn = document.getElementById("videoBtn");
const editorBtn = document.getElementById("editorBtn");
const historyBtn = document.getElementById("historyBtn");
const settingsBtn = document.getElementById("settingsBtn");
const imageUploadBtn = document.getElementById("imageUploadBtn");

/* =========================================================
   APP CONFIG
========================================================= */

const APP_NAME = "Gill AI Ultimate";
const APP_VERSION = "v8";

const FREE_CHAT_LIMIT = 20;
const FREE_CHAT_PERIOD = 48 * 60 * 60 * 1000;

/* =========================================================
   CHAT USAGE
========================================================= */

let chatUsage = null;

try {
    chatUsage = JSON.parse(
        localStorage.getItem("gillChatUsage") || "null"
    );
} catch (error) {
    console.error("Chat usage load error:", error);
    chatUsage = null;
}

/* =========================================================
   GET CHAT USAGE
========================================================= */

function getChatUsage() {

    const now = Date.now();

    if (
        !chatUsage ||
        !chatUsage.startedAt ||
        now - chatUsage.startedAt >= FREE_CHAT_PERIOD
    ) {

        chatUsage = {
            count: 0,
            startedAt: now
        };

        localStorage.setItem(
            "gillChatUsage",
            JSON.stringify(chatUsage)
        );
    }

    return chatUsage;
}

/* =========================================================
   REMAINING CHATS
========================================================= */

function getRemainingChats() {

    return Math.max(
        0,
        FREE_CHAT_LIMIT - getChatUsage().count
    );
}

/* =========================================================
   USE CHAT CREDIT
========================================================= */

function useChatCredit() {

    const usage = getChatUsage();

    usage.count++;

    localStorage.setItem(
        "gillChatUsage",
        JSON.stringify(usage)
    );

    updateCreditUI();
}

/* =========================================================
   CAN SEND CHAT
========================================================= */

function canSendChat() {

    if (getRemainingChats() <= 0) {

        addMessage(
            "⏳ <b>Free Chat Limit पूरी हो गई</b><br><br>" +
            "आपके " +
            FREE_CHAT_LIMIT +
            " free chats इस्तेमाल हो चुके हैं।<br><br>" +
            "🔓 48 घंटे बाद credits reset होंगे।",
            "ai"
        );

        return false;
    }

    return true;
}

/* =========================================================
   CREDIT UI
========================================================= */

function updateCreditUI() {

    const remaining = getRemainingChats();

    const creditDisplay =
        document.getElementById("creditDisplay");

    const freeCredits =
        document.getElementById("freeCredits");

    if (creditDisplay) {
        creditDisplay.textContent =
            "💎 Free Credits: " + remaining;
    }

    if (freeCredits) {
        freeCredits.textContent = remaining;
    }
}

/* =========================================================
   HTML SECURITY
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =========================================================
   ADD MESSAGE
========================================================= */

function addMessage(text, type = "ai") {

    if (!chatBox) {

        console.error(
            "chatBox element नहीं मिला।"
        );

        return;
    }

    const div =
        document.createElement("div");

    div.className =
        "message " + type;

    div.innerHTML =
        String(text).replace(
            /\n/g,
            "<br>"
        );

    chatBox.appendChild(div);

    chatBox.scrollTop =
        chatBox.scrollHeight;
}

/* =========================================================
   TYPING INDICATOR
========================================================= */

function showTyping() {

    if (!chatBox) {
        return;
    }

    if (document.getElementById("typing")) {
        return;
    }

    const typing =
        document.createElement("div");

    typing.id = "typing";
    typing.className = "message ai";
    typing.innerHTML = "🤖 Typing...";

    chatBox.appendChild(typing);

    chatBox.scrollTop =
        chatBox.scrollHeight;
}

/* =========================================================
   HIDE TYPING
========================================================= */

function hideTyping() {

    const typing =
        document.getElementById("typing");

    if (typing) {
        typing.remove();
    }
}

/* =========================================================
   CHAT HISTORY
========================================================= */

let chatHistory = [];

try {

    chatHistory = JSON.parse(
        localStorage.getItem("gillHistory") || "[]"
    );

    if (!Array.isArray(chatHistory)) {
        chatHistory = [];
    }

} catch (error) {

    console.error(
        "History load error:",
        error
    );

    chatHistory = [];
}

/* =========================================================
   SAVE HISTORY
========================================================= */

function saveHistory(user, ai) {

    chatHistory.push({

        user: String(user),

        ai: String(ai),

        time:
            new Date().toLocaleString()

    });

    if (chatHistory.length > 100) {

        chatHistory =
            chatHistory.slice(-100);
    }

    localStorage.setItem(
        "gillHistory",
        JSON.stringify(chatHistory)
    );
}

/* =========================================================
   SHOW HISTORY
========================================================= */

function showHistory() {

    if (!chatBox) {
        return;
    }

    if (chatHistory.length === 0) {

        addMessage(
            "📂 <b>कोई Chat History नहीं है।</b>",
            "ai"
        );

        return;
    }

    addMessage(
        "📚 <b>Chat History</b>",
        "ai"
    );

    chatHistory
        .slice()
        .reverse()
        .forEach(function(item) {

            addMessage(

                "<b>👤 You:</b><br>" +
                escapeHTML(item.user) +
                "<br><br>" +
                "<b>🤖 Gill AI:</b><br>" +
                escapeHTML(item.ai) +
                "<br><br>" +
                "🕒 " +
                escapeHTML(item.time),

                "ai"
            );
        });
}

/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.showHistory = showHistory;
window.addMessage = addMessage;

/* =========================================================
   AI CHAT API
========================================================= */

async function aiReply(text) {

    const response =
        await fetch(
            "/api/chat",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    message: text
                })
            }
        );

    const raw =
        await response.text();

    let data;

    try {

        data = JSON.parse(raw);

    } catch (error) {

        console.error(
            "AI API raw response:",
            raw
        );

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

    if (!data.reply) {

        throw new Error(
            "AI ने कोई reply नहीं दिया।"
        );
    }

    return data.reply;
}

/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage() {

    if (!userInput) {

        console.error(
            "userInput element नहीं मिला।"
        );

        return;
    }

    const text =
        userInput.value.trim();

    if (!text) {
        return;
    }

    if (!canSendChat()) {
        return;
    }

    useChatCredit();

    addMessage(
        escapeHTML(text),
        "user"
    );

    userInput.value = "";

    showTyping();

    try {

        const reply =
            await aiReply(text);

        hideTyping();

        addMessage(
            reply,
            "ai"
        );

        saveHistory(
            text,
            reply
        );

        addMessage(
            "ℹ️ Free Chats बाकी: <b>" +
            getRemainingChats() +
            "/" +
            FREE_CHAT_LIMIT +
            "</b>",
            "ai"
        );

    } catch (error) {

        hideTyping();

        addMessage(
            "❌ AI Error: " +
            escapeHTML(error.message),
            "ai"
        );

        console.error(
            "Gill AI Chat Error:",
            error
        );
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
        function(event) {

            if (event.key === "Enter") {

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
        function() {

            const SpeechRecognition =
                window.SpeechRecognition ||
                window.webkitSpeechRecognition;

            if (!SpeechRecognition) {

                alert(
                    "❌ इस browser में Voice Recognition available नहीं है।"
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

            recognition.onstart =
                function() {

                    addMessage(
                        "🎤 सुन रहा हूँ...",
                        "ai"
                    );
                };

            recognition.onresult =
                function(event) {

                    const transcript =
                        event.results[0][0]
                            .transcript;

                    if (userInput) {

                        userInput.value =
                            transcript;

                        userInput.focus();
                    }
                };

            recognition.onerror =
                function(event) {

                    console.error(
                        "Voice Error:",
                        event.error
                    );

                    addMessage(
                        "❌ Voice input में समस्या हुई।",
                        "ai"
                    );
                };

            recognition.onend =
                function() {

                    console.log(
                        "Voice recognition ended."
                    );
                };

            try {

                recognition.start();

            } catch (error) {

                console.error(
                    "Voice Start Error:",
                    error
                );
            }
        }
    );
}

/* =========================================================
   INITIALIZE
========================================================= */

getChatUsage();
updateCreditUI();

console.log(
    APP_NAME +
    " " +
    APP_VERSION +
    " loaded successfully."
);

/* =========================================================
   END OF PART 1
========================================================= */
/* =========================================================
   Gill AI Ultimate v8
   SCRIPT.JS — PART 2/5
   VIDEO GENERATOR + VIDEO HISTORY
========================================================= */

/* =========================================================
   VIDEO ELEMENTS
========================================================= */

const videoPreview =
    document.getElementById("videoPreview");

const generateVideoBtn =
    document.getElementById("generateVideoBtn");

const videoPrompt =
    document.getElementById("videoPrompt");

const videoAspectRatio =
    document.getElementById("videoAspectRatio");

/* =========================================================
   VIDEO HISTORY
========================================================= */

let videoHistory = [];

try {

    videoHistory =
        JSON.parse(
            localStorage.getItem(
                "gillVideoHistory"
            ) || "[]"
        );

    if (
        !Array.isArray(
            videoHistory
        )
    ) {

        videoHistory = [];

    }

} catch (error) {

    console.error(
        "Video history load error:",
        error
    );

    videoHistory = [];

}

/* =========================================================
   SAVE VIDEO HISTORY
========================================================= */

function saveVideoHistory(
    prompt
) {

    videoHistory.push({

        prompt:
            String(prompt),

        time:
            new Date()
                .toLocaleString()

    });

    if (
        videoHistory.length > 50
    ) {

        videoHistory =
            videoHistory.slice(
                -50
            );

    }

    localStorage.setItem(

        "gillVideoHistory",

        JSON.stringify(
            videoHistory
        )

    );

}

/* =========================================================
   SHOW VIDEO HISTORY
========================================================= */

function showVideoHistory() {

    if (!chatBox) {

        return;
    }

    if (
        videoHistory.length === 0
    ) {

        addMessage(

            "🎬 <b>अभी कोई Video History नहीं है।</b>",

            "ai"

        );

        return;
    }

    addMessage(

        "🎬 <b>Video History</b>",

        "ai"

    );

    videoHistory
        .slice()
        .reverse()
        .forEach(
            function(item) {

                addMessage(

                    "<b>📝 Video Prompt:</b><br>" +

                    escapeHTML(
                        item.prompt
                    ) +

                    "<br><br>🕒 " +

                    escapeHTML(
                        item.time
                    ),

                    "ai"

                );

            }
        );

}

window.showVideoHistory =
    showVideoHistory;

/* =========================================================
   COPY VIDEO PROMPT
========================================================= */

window.copyVideoPrompt =
    async function(prompt) {

        try {

            await navigator.clipboard.writeText(
                String(prompt)
            );

            addMessage(

                "✅ Video Prompt copy हो गया।",

                "ai"

            );

        } catch (error) {

            console.error(

                "Copy Prompt Error:",

                error

            );

            addMessage(

                "❌ Prompt copy नहीं हो पाया।",

                "ai"

            );

        }

    };

/* =========================================================
   FREE VIDEO WORKFLOW
========================================================= */

async function generateVideo(
    prompt,
    aspectRatio = "9:16"
) {

    const cleanPrompt =
        String(
            prompt || ""
        ).trim();

    if (!cleanPrompt) {

        addMessage(

            "❌ Video prompt खाली है।",

            "ai"

        );

        return;
    }

    const finalPrompt =

        cleanPrompt +

        ". Cinematic realistic video, smooth camera movement, natural lighting, high detail, " +

        "vertical " +

        aspectRatio +

        " format.";

    saveVideoHistory(
        finalPrompt
    );

    addMessage(

        "🎬 <b>Free AI Video Workflow</b><br><br>" +

        "📝 <b>Your Video Prompt:</b><br><br>" +

        escapeHTML(
            finalPrompt
        ) +

        "<br><br>" +

        '<button onclick="copyVideoPrompt(' +

        JSON.stringify(
            finalPrompt
        ).replace(
            /"/g,
            "&quot;"
        ) +

        ')">' +

        "📋 Prompt Copy करें" +

        "</button>",

        "ai"

    );

    addMessage(

        "👇 <b>अब Free Video Generator खोलें:</b><br><br>" +

        '<a href="https://huggingface.co/spaces?category=video-generation" ' +

        'target="_blank" rel="noopener noreferrer">' +

        "🎬 Free AI Video Generator खोलें" +

        "</a>",

        "ai"

    );

}

/* =========================================================
   GLOBAL VIDEO FUNCTION
========================================================= */

window.generateVideo =
    generateVideo;

/* =========================================================
   VIDEO BUTTON
========================================================= */

if (videoBtn) {

    videoBtn.addEventListener(

        "click",

        function() {

            const prompt =

                window.prompt(

                    "🎬 Video बनाने के लिए Prompt लिखें:"

                );

            if (
                !prompt ||
                !prompt.trim()
            ) {

                return;
            }

            generateVideo(

                prompt.trim(),

                "9:16"

            );

        }

    );

}

/* =========================================================
   GENERATE VIDEO BUTTON
========================================================= */

if (generateVideoBtn) {

    generateVideoBtn.addEventListener(

        "click",

        function() {

            const prompt =

                videoPrompt
                    ? videoPrompt.value.trim()
                    : "";

            const aspectRatio =

                videoAspectRatio
                    ? videoAspectRatio.value
                    : "9:16";

            generateVideo(

                prompt,

                aspectRatio

            );

        }

    );

}

/* =========================================================
   VIDEO PROMPT ENTER KEY
========================================================= */

if (videoPrompt) {

    videoPrompt.addEventListener(

        "keydown",

        function(event) {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                const aspectRatio =

                    videoAspectRatio
                        ? videoAspectRatio.value
                        : "9:16";

                generateVideo(

                    videoPrompt.value.trim(),

                    aspectRatio

                );

            }

        }

    );

}

/* =========================================================
   VIDEO PREVIEW CLEAR
========================================================= */

function clearVideoPreview() {

    if (!videoPreview) {

        return;
    }

    videoPreview.innerHTML =
        "";
}

window.clearVideoPreview =
    clearVideoPreview;

/* =========================================================
   END OF PART 2
========================================================= */
/* =========================================================
   Gill AI Ultimate v8
   SCRIPT.JS — PART 3/5
   IMAGE GENERATOR + IMAGE UPLOAD + IMAGE HISTORY
========================================================= */

/* =========================================================
   IMAGE ELEMENTS
========================================================= */

const imagePreview =
    document.getElementById("imagePreview");

const imagePrompt =
    document.getElementById("imagePrompt");

const generateImageBtn =
    document.getElementById("generateImageBtn");

const imageAspectRatio =
    document.getElementById("imageAspectRatio");

const imageStyle =
    document.getElementById("imageStyle");

const imageUpload =
    document.getElementById("imageUpload");

/* =========================================================
   IMAGE HISTORY
========================================================= */

let imageHistory = [];

try {

    imageHistory =
        JSON.parse(
            localStorage.getItem(
                "gillImageHistory"
            ) || "[]"
        );

    if (
        !Array.isArray(
            imageHistory
        )
    ) {

        imageHistory = [];

    }

} catch (error) {

    console.error(
        "Image history load error:",
        error
    );

    imageHistory = [];

}

/* =========================================================
   SAVE IMAGE HISTORY
========================================================= */

function saveImageHistory(
    prompt,
    style,
    aspectRatio
) {

    imageHistory.push({

        prompt:
            String(prompt),

        style:
            String(style),

        aspectRatio:
            String(aspectRatio),

        time:
            new Date()
                .toLocaleString()

    });

    if (
        imageHistory.length > 50
    ) {

        imageHistory =
            imageHistory.slice(
                -50
            );

    }

    localStorage.setItem(

        "gillImageHistory",

        JSON.stringify(
            imageHistory
        )

    );

}

/* =========================================================
   SHOW IMAGE HISTORY
========================================================= */

function showImageHistory() {

    if (!chatBox) {

        return;
    }

    if (
        imageHistory.length === 0
    ) {

        addMessage(

            "🖼️ <b>अभी कोई Image History नहीं है।</b>",

            "ai"

        );

        return;
    }

    addMessage(

        "🖼️ <b>Image History</b>",

        "ai"

    );

    imageHistory
        .slice()
        .reverse()
        .forEach(
            function(item) {

                addMessage(

                    "<b>📝 Prompt:</b><br>" +

                    escapeHTML(
                        item.prompt
                    ) +

                    "<br><br>" +

                    "🎨 Style: " +

                    escapeHTML(
                        item.style
                    ) +

                    "<br>" +

                    "📐 Ratio: " +

                    escapeHTML(
                        item.aspectRatio
                    ) +

                    "<br><br>🕒 " +

                    escapeHTML(
                        item.time
                    ),

                    "ai"

                );

            }
        );

}

window.showImageHistory =
    showImageHistory;

/* =========================================================
   COPY IMAGE PROMPT
========================================================= */

window.copyImagePrompt =
    async function(prompt) {

        try {

            await navigator.clipboard.writeText(
                String(prompt)
            );

            addMessage(

                "✅ Image Prompt copy हो गया।",

                "ai"

            );

        } catch (error) {

            console.error(

                "Copy Image Prompt Error:",

                error

            );

            addMessage(

                "❌ Image Prompt copy नहीं हो पाया।",

                "ai"

            );

        }

    };

/* =========================================================
   FREE IMAGE WORKFLOW
========================================================= */

async function generateImage(
    prompt,
    style = "Realistic",
    aspectRatio = "1:1"
) {

    const cleanPrompt =
        String(
            prompt || ""
        ).trim();

    if (!cleanPrompt) {

        addMessage(

            "❌ Image prompt खाली है।",

            "ai"

        );

        return;
    }

    const finalPrompt =

        cleanPrompt +

        ". " +

        String(style) +

        " style, high quality, detailed image, " +

        String(aspectRatio) +

        " aspect ratio.";

    saveImageHistory(

        finalPrompt,

        style,

        aspectRatio

    );

    addMessage(

        "🖼️ <b>Free AI Image Workflow</b><br><br>" +

        "📝 <b>Your Image Prompt:</b><br><br>" +

        escapeHTML(
            finalPrompt
        ) +

        "<br><br>" +

        '<button onclick="copyImagePrompt(' +

        JSON.stringify(
            finalPrompt
        ).replace(
            /"/g,
            "&quot;"
        ) +

        ')">' +

        "📋 Prompt Copy करें" +

        "</button>",

        "ai"

    );

    addMessage(

        "👇 <b>Free Image Generator खोलें:</b><br><br>" +

        '<a href="https://huggingface.co/spaces?category=image-generation" ' +

        'target="_blank" rel="noopener noreferrer">' +

        "🎨 Free AI Image Generator खोलें" +

        "</a>",

        "ai"

    );

}

window.generateImage =
    generateImage;

/* =========================================================
   IMAGE GENERATOR BUTTON
========================================================= */

if (generateImageBtn) {

    generateImageBtn.addEventListener(

        "click",

        function() {

            const prompt =

                imagePrompt
                    ? imagePrompt.value.trim()
                    : "";

            const style =

                imageStyle
                    ? imageStyle.value
                    : "Realistic";

            const aspectRatio =

                imageAspectRatio
                    ? imageAspectRatio.value
                    : "1:1";

            generateImage(

                prompt,

                style,

                aspectRatio

            );

        }

    );

}

/* =========================================================
   IMAGE PROMPT ENTER
========================================================= */

if (imagePrompt) {

    imagePrompt.addEventListener(

        "keydown",

        function(event) {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                const style =

                    imageStyle
                        ? imageStyle.value
                        : "Realistic";

                const aspectRatio =

                    imageAspectRatio
                        ? imageAspectRatio.value
                        : "1:1";

                generateImage(

                    imagePrompt.value.trim(),

                    style,

                    aspectRatio

                );

            }

        }

    );

}

/* =========================================================
   IMAGE UPLOAD
========================================================= */

if (imageUpload) {

    imageUpload.addEventListener(

        "change",

        function(event) {

            const file =
                event.target.files &&
                event.target.files[0];

            if (!file) {

                return;
            }

            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                addMessage(

                    "❌ केवल image file upload करें।",

                    "ai"

                );

                return;
            }

            const reader =
                new FileReader();

            reader.onload =
                function(e) {

                    if (imagePreview) {

                        imagePreview.innerHTML =

                            '<img src="' +
                            e.target.result +
                            '" alt="Uploaded Image" ' +
                            'style="max-width:100%;border-radius:12px;">';

                    }

                    addMessage(

                        "✅ Image successfully upload हो गई।",

                        "ai"

                    );

                };

            reader.onerror =
                function(error) {

                    console.error(
                        "Image Read Error:",
                        error
                    );

                    addMessage(

                        "❌ Image पढ़ने में समस्या हुई।",

                        "ai"

                    );

                };

            reader.readAsDataURL(
                file
            );

        }

    );

}

/* =========================================================
   IMAGE UPLOAD BUTTON
========================================================= */

if (imageUploadBtn) {

    imageUploadBtn.addEventListener(

        "click",

        function() {

            if (imageUpload) {

                imageUpload.click();

            } else {

                addMessage(

                    "❌ Image upload input नहीं मिला।",

                    "ai"

                );

            }

        }

    );

}

/* =========================================================
   IMAGE BUTTON
========================================================= */

if (imageBtn) {

    imageBtn.addEventListener(

        "click",

        function() {

            const prompt =

                window.prompt(

                    "🖼️ Image बनाने के लिए Prompt लिखें:"

                );

            if (
                !prompt ||
                !prompt.trim()
            ) {

                return;
            }

            generateImage(

                prompt.trim(),

                "Realistic",

                "1:1"

            );

        }

    );

}

/* =========================================================
   CLEAR IMAGE PREVIEW
========================================================= */

function clearImagePreview() {

    if (!imagePreview) {

        return;
    }

    imagePreview.innerHTML =
        "";

}

window.clearImagePreview =
    clearImagePreview;

/* =========================================================
   END OF PART 3
========================================================= */
/* =========================================================
   Gill AI Ultimate v8
   SCRIPT.JS — PART 4/5
   AI EDITOR + SETTINGS + UI CONTROLS
========================================================= */

/* =========================================================
   EDITOR ELEMENTS
========================================================= */

const editorPanel =
    document.getElementById("editorPanel");

const editorInput =
    document.getElementById("editorInput");

const editorOutput =
    document.getElementById("editorOutput");

const editorAction =
    document.getElementById("editorAction");

const editorRunBtn =
    document.getElementById("editorRunBtn");

const editorCopyBtn =
    document.getElementById("editorCopyBtn");

/* =========================================================
   EDITOR ACTIONS
========================================================= */

async function runEditorAI() {

    if (!editorInput) {

        addMessage(
            "❌ Editor input नहीं मिला।",
            "ai"
        );

        return;
    }

    const text =
        editorInput.value.trim();

    if (!text) {

        addMessage(
            "❌ Editor में text लिखें।",
            "ai"
        );

        return;
    }

    const action =
        editorAction
            ? editorAction.value
            : "Improve";

    showTyping();

    try {

        const prompt =

            "You are an AI code and text editor. " +

            "Action: " +

            action +

            ".\n\n" +

            "User content:\n" +

            text;

        const result =
            await aiReply(
                prompt
            );

        hideTyping();

        if (editorOutput) {

            editorOutput.value =
                result;

        }

        addMessage(

            "✅ Editor task complete हो गया।",

            "ai"

        );

    } catch (error) {

        hideTyping();

        addMessage(

            "❌ Editor Error: " +

            escapeHTML(
                error.message
            ),

            "ai"

        );

        console.error(
            "Editor Error:",
            error
        );

    }

}


/* =========================================================
   EDITOR RUN BUTTON
========================================================= */

if (editorRunBtn) {

    editorRunBtn.addEventListener(

        "click",

        runEditorAI

    );

}


/* =========================================================
   EDITOR COPY BUTTON
========================================================= */

if (editorCopyBtn) {

    editorCopyBtn.addEventListener(

        "click",

        async function() {

            if (!editorOutput) {

                return;
            }

            try {

                await navigator.clipboard.writeText(

                    editorOutput.value

                );

                addMessage(

                    "✅ Editor output copy हो गया।",

                    "ai"

                );

            } catch (error) {

                console.error(
                    "Editor Copy Error:",
                    error
                );

                addMessage(

                    "❌ Copy नहीं हो पाया।",

                    "ai"

                );

            }

        }

    );

}


/* =========================================================
   EDITOR BUTTON
========================================================= */

if (editorBtn) {

    editorBtn.addEventListener(

        "click",

        function() {

            if (!editorPanel) {

                addMessage(

                    "❌ Editor panel नहीं मिला।",

                    "ai"

                );

                return;

            }

            editorPanel.classList.toggle(
                "active"
            );

        }

    );

}


/* =========================================================
   SETTINGS ELEMENTS
========================================================= */

const settingsPanel =
    document.getElementById("settingsPanel");

const closeSettingsBtn =
    document.getElementById("closeSettingsBtn");

const darkModeToggle =
    document.getElementById("darkModeToggle");

const clearHistoryBtn =
    document.getElementById("clearHistoryBtn");

const clearAllDataBtn =
    document.getElementById("clearAllDataBtn");


/* =========================================================
   SETTINGS OPEN
========================================================= */

if (settingsBtn) {

    settingsBtn.addEventListener(

        "click",

        function() {

            if (!settingsPanel) {

                addMessage(

                    "❌ Settings panel नहीं मिला।",

                    "ai"

                );

                return;

            }

            settingsPanel.classList.add(
                "active"
            );

        }

    );

}


/* =========================================================
   SETTINGS CLOSE
========================================================= */

if (closeSettingsBtn) {

    closeSettingsBtn.addEventListener(

        "click",

        function() {

            if (settingsPanel) {

                settingsPanel.classList.remove(
                    "active"
                );

            }

        }

    );

}


/* =========================================================
   DARK MODE
========================================================= */

function applyDarkMode(
    enabled
) {

    document.body.classList.toggle(
        "dark-mode",
        enabled
    );

    localStorage.setItem(

        "gillDarkMode",

        enabled
            ? "1"
            : "0"

    );

}


/* =========================================================
   LOAD DARK MODE
========================================================= */

const savedDarkMode =
    localStorage.getItem(
        "gillDarkMode"
    );


if (
    savedDarkMode !== null
) {

    applyDarkMode(
        savedDarkMode === "1"
    );

}


/* =========================================================
   DARK MODE TOGGLE
========================================================= */

if (darkModeToggle) {

    darkModeToggle.checked =
        savedDarkMode === "1";

    darkModeToggle.addEventListener(

        "change",

        function() {

            applyDarkMode(
                darkModeToggle.checked
            );

        }

    );

}


/* =========================================================
   CLEAR CHAT HISTORY
========================================================= */

if (clearHistoryBtn) {

    clearHistoryBtn.addEventListener(

        "click",

        function() {

            const confirmed =
                confirm(
                    "क्या आप Chat History delete करना चाहते हैं?"
                );

            if (!confirmed) {

                return;
            }

            chatHistory = [];

            localStorage.removeItem(
                "gillHistory"
            );

            addMessage(

                "🗑️ Chat History delete हो गई।",

                "ai"

            );

        }

    );

}


/* =========================================================
   CLEAR ALL DATA
========================================================= */

if (clearAllDataBtn) {

    clearAllDataBtn.addEventListener(

        "click",

        function() {

            const confirmed =
                confirm(

                    "⚠️ इससे Gill AI का पूरा local data delete हो जाएगा। Continue?"

                );

            if (!confirmed) {

                return;
            }

            localStorage.removeItem(
                "gillHistory"
            );

            localStorage.removeItem(
                "gillVideoHistory"
            );

            localStorage.removeItem(
                "gillImageHistory"
            );

            localStorage.removeItem(
                "gillChatUsage"
            );

            localStorage.removeItem(
                "gillDarkMode"
            );

            chatHistory = [];
            videoHistory = [];
            imageHistory = [];

            addMessage(

                "✅ सभी local data clear हो गया।",

                "ai"

            );

            updateCreditUI();

        }

    );

}


/* =========================================================
   HISTORY BUTTON
========================================================= */

if (historyBtn) {

    historyBtn.addEventListener(

        "click",

        function() {

            showHistory();

        }

    );

}


/* =========================================================
   IMAGE HISTORY BUTTON
========================================================= */

const imageHistoryBtn =
    document.getElementById(
        "imageHistoryBtn"
    );


if (imageHistoryBtn) {

    imageHistoryBtn.addEventListener(

        "click",

        function() {

            showImageHistory();

        }

    );

}


/* =========================================================
   VIDEO HISTORY BUTTON
========================================================= */

const videoHistoryBtn =
    document.getElementById(
        "videoHistoryBtn"
    );


if (videoHistoryBtn) {

    videoHistoryBtn.addEventListener(

        "click",

        function() {

            showVideoHistory();

        }

    );

}


/* =========================================================
   CLOSE PANELS
========================================================= */

window.closePanel =
    function(id) {

        const panel =
            document.getElementById(
                id
            );

        if (panel) {

            panel.classList.remove(
                "active"
            );

        }

    };


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(

    "keydown",

    function(event) {

        if (
            event.key === "Escape"
        ) {

            if (settingsPanel) {

                settingsPanel.classList.remove(
                    "active"
                );

            }

            if (editorPanel) {

                editorPanel.classList.remove(
                    "active"
                );

            }

        }

    }

);


/* =========================================================
   BODY READY
========================================================= */

document.body.classList.add(
    "gill-ai-ready"
);


/* =========================================================
   END OF PART 4
========================================================= */
/* =========================================================
   Gill AI Ultimate v8
   SCRIPT.JS — PART 5/5
   EXTRA UI + IMAGE PREVIEW + APP STARTUP
========================================================= */

"use strict";

/* =========================================================
   IMAGE PREVIEW HELPER
========================================================= */

function showImagePreview(src) {

    const preview =
        document.getElementById("imagePreview");

    if (!preview) {
        return;
    }

    preview.innerHTML =
        "";

    const img =
        document.createElement("img");

    img.src =
        String(src);

    img.alt =
        "Gill AI Image Preview";

    img.style.maxWidth =
        "100%";

    img.style.borderRadius =
        "12px";

    img.style.display =
        "block";

    preview.appendChild(
        img
    );
}

window.showImagePreview =
    showImagePreview;


/* =========================================================
   IMAGE UPLOAD PREVIEW
========================================================= */

if (imageUpload) {

    imageUpload.addEventListener(
        "change",
        function(event) {

            const file =
                event.target.files &&
                event.target.files[0];

            if (!file) {
                return;
            }

            if (
                !file.type ||
                !file.type.startsWith("image/")
            ) {

                addMessage(
                    "❌ केवल image file upload करें।",
                    "ai"
                );

                event.target.value =
                    "";

                return;
            }

            const reader =
                new FileReader();

            reader.onload =
                function(e) {

                    showImagePreview(
                        e.target.result
                    );

                    addMessage(
                        "✅ Image preview तैयार है।",
                        "ai"
                    );

                };

            reader.onerror =
                function() {

                    addMessage(
                        "❌ Image पढ़ने में समस्या हुई।",
                        "ai"
                    );

                };

            reader.readAsDataURL(
                file
            );

        }
    );

}


/* =========================================================
   SAFE COPY FUNCTION
========================================================= */

window.gillCopy =
    async function(text) {

        try {

            await navigator.clipboard.writeText(
                String(text)
            );

            addMessage(
                "✅ Copy हो गया।",
                "ai"
            );

        } catch (error) {

            console.error(
                "Copy Error:",
                error
            );

            addMessage(
                "❌ Copy नहीं हो पाया।",
                "ai"
            );

        }

    };


/* =========================================================
   CLEAR CHAT SCREEN
========================================================= */

function clearChatScreen() {

    if (!chatBox) {
        return;
    }

    chatBox.innerHTML =
        "";

}

window.clearChatScreen =
    clearChatScreen;


/* =========================================================
   WELCOME MESSAGE
========================================================= */

function showWelcomeMessage() {

    if (!chatBox) {
        return;
    }

    if (
        chatBox.children.length > 0
    ) {
        return;
    }

    addMessage(

        "👋 <b>Welcome to Gill AI Ultimate!</b><br><br>" +

        "🤖 Chat • 🎤 Voice • 🖼️ Image • 🎬 Video • 💻 Editor<br><br>" +

        "आप कुछ भी पूछ सकते हैं।",

        "ai"

    );

}


/* =========================================================
   ONLINE STATUS
========================================================= */

function updateOnlineStatus() {

    const status =
        document.getElementById(
            "onlineStatus"
        );

    if (!status) {
        return;
    }

    if (navigator.onLine) {

        status.textContent =
            "🟢 Online";

    } else {

        status.textContent =
            "🔴 Offline";

    }

}

window.addEventListener(
    "online",
    updateOnlineStatus
);

window.addEventListener(
    "offline",
    updateOnlineStatus
);


/* =========================================================
   INITIAL APP START
========================================================= */

function initializeGillAI() {

    try {

        getChatUsage();

        updateCreditUI();

        updateOnlineStatus();

        showWelcomeMessage();

        console.log(
            "✅ Gill AI Ultimate v8 initialized successfully."
        );

    } catch (error) {

        console.error(
            "Gill AI initialization error:",
            error
        );

    }

}


/* =========================================================
   DOM READY
========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeGillAI
    );

} else {

    initializeGillAI();

}


/* =========================================================
   GLOBAL APP INFO
========================================================= */

window.GillAI = {

    name:
        APP_NAME,

    version:
        APP_VERSION,

    getRemainingChats:
        getRemainingChats,

    sendMessage:
        sendMessage,

    generateImage:
        generateImage,

    generateVideo:
        generateVideo,

    showHistory:
        showHistory,

    showImageHistory:
        showImageHistory,

    showVideoHistory:
        showVideoHistory,

    clearChat:
        clearChatScreen

};


/* =========================================================
   FINAL LOG
========================================================= */

console.log(
    "🚀 " +
    APP_NAME +
    " " +
    APP_VERSION +
    " — PART 5/5 loaded."
);


/* =========================================================
   END OF PART 5
========================================================= */