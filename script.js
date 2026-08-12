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

const imageUploadBtn =
    document.getElementById("imageUploadBtn");


/* =========================================================
   APP CONFIG
========================================================= */

const APP_NAME = "Gill AI Ultimate";
const APP_VERSION = "v8";

const FREE_CHAT_LIMIT = 20;

const FREE_CHAT_PERIOD =
    48 * 60 * 60 * 1000;


/* =========================================================
   CHAT USAGE
========================================================= */

let chatUsage = null;

try {

    chatUsage = JSON.parse(
        localStorage.getItem(
            "gillChatUsage"
        ) || "null"
    );

} catch (error) {

    console.error(
        "Chat usage load error:",
        error
    );

    chatUsage = null;
}


/* =========================================================
   GET CHAT USAGE
========================================================= */

function getChatUsage() {

    const now =
        Date.now();


    if (
        !chatUsage ||
        !chatUsage.startedAt ||
        now - chatUsage.startedAt >=
        FREE_CHAT_PERIOD
    ) {

        chatUsage = {

            count: 0,

            startedAt:
                now

        };


        localStorage.setItem(

            "gillChatUsage",

            JSON.stringify(
                chatUsage
            )

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

        FREE_CHAT_LIMIT -
        getChatUsage().count

    );
}


/* =========================================================
   USE CHAT CREDIT
========================================================= */

function useChatCredit() {

    const usage =
        getChatUsage();


    usage.count++;


    localStorage.setItem(

        "gillChatUsage",

        JSON.stringify(
            usage
        )

    );


    updateCreditUI();
}


/* =========================================================
   CAN SEND CHAT
========================================================= */

function canSendChat() {

    if (
        getRemainingChats() <= 0
    ) {

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

    const remaining =
        getRemainingChats();


    const creditDisplay =
        document.getElementById(
            "creditDisplay"
        );


    const freeCredits =
        document.getElementById(
            "freeCredits"
        );


    if (
        creditDisplay
    ) {

        creditDisplay.textContent =

            "💎 Free Credits: " +
            remaining;

    }


    if (
        freeCredits
    ) {

        freeCredits.textContent =
            remaining;

    }
}


/* =========================================================
   HTML SECURITY
========================================================= */

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   ADD MESSAGE
========================================================= */

function addMessage(
    text,
    type = "ai"
) {

    if (!chatBox) {

        console.error(
            "chatBox element नहीं मिला।"
        );

        return;
    }


    const div =
        document.createElement(
            "div"
        );


    div.className =
        "message " +
        type;


    div.innerHTML =
        String(text).replace(
            /\n/g,
            "<br>"
        );


    chatBox.appendChild(
        div
    );


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


    if (
        document.getElementById(
            "typing"
        )
    ) {

        return;
    }


    const typing =
        document.createElement(
            "div"
        );


    typing.id =
        "typing";


    typing.className =
        "message ai";


    typing.innerHTML =
        "🤖 Typing...";


    chatBox.appendChild(
        typing
    );


    chatBox.scrollTop =
        chatBox.scrollHeight;

}


/* =========================================================
   HIDE TYPING
========================================================= */

function hideTyping() {

    const typing =
        document.getElementById(
            "typing"
        );


    if (typing) {

        typing.remove();

    }

}


/* =========================================================
   CHAT HISTORY
========================================================= */

let chatHistory = [];


try {

    chatHistory =
        JSON.parse(

            localStorage.getItem(
                "gillHistory"
            ) || "[]"

        );


    if (
        !Array.isArray(
            chatHistory
        )
    ) {

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

function saveHistory(
    user,
    ai
) {

    chatHistory.push({

        user:
            String(user),

        ai:
            String(ai),

        time:
            new Date()
                .toLocaleString()

    });


    if (
        chatHistory.length > 100
    ) {

        chatHistory =
            chatHistory.slice(
                -100
            );

    }


    localStorage.setItem(

        "gillHistory",

        JSON.stringify(
            chatHistory
        )

    );

}


/* =========================================================
   SHOW HISTORY
========================================================= */

function showHistory() {

    if (!chatBox) {
        return;
    }


    if (
        chatHistory.length === 0
    ) {

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
        .forEach(
            function(item) {

                addMessage(

                    "<b>👤 You:</b><br>" +

                    escapeHTML(
                        item.user
                    ) +

                    "<br><br>" +

                    "<b>🤖 Gill AI:</b><br>" +

                    escapeHTML(
                        item.ai
                    ) +

                    "<br><br>" +

                    "🕒 " +

                    escapeHTML(
                        item.time
                    ),

                    "ai"

                );

            }
        );

}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.showHistory =
    showHistory;


window.addMessage =
    addMessage;


/* =========================================================
   AI CHAT API
========================================================= */

async function aiReply(
    text
) {

    const response =
        await fetch(

            "/api/chat",

            {

                method:
                    "POST",


                headers: {

                    "Content-Type":
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


    let data;


    try {

        data =
            JSON.parse(
                raw
            );

    } catch (error) {

        console.error(
            "AI API raw response:",
            raw
        );


        throw new Error(

            "AI server ने valid JSON नहीं भेजा। /api/chat check करें।"

        );

    }


    if (
        !response.ok
    ) {

        throw new Error(

            data?.error ||
            "AI request failed."

        );

    }


    if (
        !data.reply
    ) {

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


    if (
        !canSendChat()
    ) {

        return;
    }


    useChatCredit();


    addMessage(

        escapeHTML(
            text
        ),

        "user"

    );


    userInput.value =
        "";


    showTyping();


    try {

        const reply =
            await aiReply(
                text
            );


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

            escapeHTML(
                error.message
            ),

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

            if (
                event.key === "Enter"
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
   PART 1/5 END
========================================================= */
/* =========================================================
   Gill AI Ultimate v8
   SCRIPT.JS — PART 2/5
   AI VIDEO + VIDEO HISTORY + VIDEO STATUS
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

    videoHistory = JSON.parse(
        localStorage.getItem(
            "gillVideoHistory"
        ) || "[]"
    );

    if (!Array.isArray(videoHistory)) {
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
    prompt,
    videoUrl
) {

    videoHistory.push({

        prompt: String(prompt),

        videoUrl: String(videoUrl),

        time:
            new Date().toLocaleString()

    });

    if (videoHistory.length > 50) {

        videoHistory =
            videoHistory.slice(-50);
    }

    localStorage.setItem(
        "gillVideoHistory",
        JSON.stringify(videoHistory)
    );
}


/* =========================================================
   SHOW VIDEO HISTORY
========================================================= */

function showVideoHistory() {

    if (!chatBox) {
        return;
    }

    if (videoHistory.length === 0) {

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
        .forEach(function(item) {

            const safePrompt =
                escapeHTML(item.prompt);

            const safeUrl =
                escapeHTML(item.videoUrl);

            addMessage(

                "<b>📝 Prompt:</b><br>" +
                safePrompt +

                "<br><br>🕒 " +
                escapeHTML(item.time) +

                "<br><br>" +

                '<a href="' +
                safeUrl +
                '" target="_blank" rel="noopener">' +

                "▶️ Video Open करें" +

                "</a>",

                "ai"
            );

        });
}


window.showVideoHistory =
    showVideoHistory;


/* =========================================================
   GENERATE VIDEO
========================================================= */

async function generateVideo(
    prompt,
    aspectRatio = "9:16"
) {

    const cleanPrompt =
        String(prompt || "").trim();

    if (!cleanPrompt) {

        addMessage(
            "❌ Video prompt खाली है।",
            "ai"
        );

        return;
    }

    showTyping();

    try {

        const response =
            await fetch(
                "/api/video",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            prompt:
                                cleanPrompt,

                            aspectRatio:
                                aspectRatio

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
                "Video API Raw Response:",
                raw
            );

            throw new Error(
                "Video server ने valid JSON नहीं भेजा। /api/video check करें।"
            );
        }

        hideTyping();

        if (!response.ok) {

            throw new Error(
                data?.error ||
                "Video generation failed."
            );
        }


        /* =================================================
           DIRECT VIDEO URL
        ================================================= */

        if (data.videoUrl) {

            showGeneratedVideo(
                data.videoUrl,
                cleanPrompt
            );

            return;
        }


        /* =================================================
           PREDICTION ID
        ================================================= */

        if (data.predictionId) {

            addMessage(

                "⏳ <b>Video Generate हो रही है...</b><br><br>" +
                "Video तैयार होने तक कृपया इंतज़ार करें।",

                "ai"
            );

            await checkVideoStatus(
                data.predictionId,
               