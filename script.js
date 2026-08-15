/* =========================================================
   Gill AI Ultimate v8
   SCRIPT.JS — PART 1/5
   CORE + CHAT + VOICE + HISTORY
========================================================= */

"use strict";

/* =========================================================
   ELEMENTS
========================================================= */

const chatBox =
    document.getElementById("chatBox");

const userInput =
    document.getElementById("userInput");

const sendBtn =
    document.getElementById("sendBtn");

const voiceBtn =
    document.getElementById("voiceBtn");

const imageBtn =
    document.getElementById("imageBtn");

const videoBtn =
    document.getElementById("videoBtn");

const editorBtn =
    document.getElementById("editorBtn");

const historyBtn =
    document.getElementById("historyBtn");

const settingsBtn =
    document.getElementById("settingsBtn");

const imageUploadBtn =
    document.getElementById("imageUploadBtn");

/* =========================================================
   APP CONFIG
========================================================= */

const APP_NAME =
    "Gill AI Ultimate";

const APP_VERSION =
    "v8";

const FREE_CHAT_LIMIT =
    20;

const FREE_CHAT_PERIOD =
    48 * 60 * 60 * 1000;

/* =========================================================
   CHAT USAGE
========================================================= */

let chatUsage = null;

try {

    chatUsage =
        JSON.parse(
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
        now -
            chatUsage.startedAt >=
            FREE_CHAT_PERIOD
    ) {

        chatUsage = {

            count:
                0,

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
 =========================================================
   Gill AI Ultimate v8
   SCRIPT.JS — PART 3/5
   VIDEO STATUS + BUTTONS + IMAGE UPLOAD
========================================================= */
/* =========================================================
   CHECK VIDEO STATUS
========================================================= */

async function checkVideoStatus(
    predictionId,
    originalPrompt
) {

    if (!predictionId) {

        addMessage(
            "❌ Video Prediction ID नहीं मिली।",
            "ai"
        );

        return;
    }

    let attempts = 0;
    const maxAttempts = 60;

    const check = async function () {

        attempts++;

        try {

            const response =
                await fetch(
                    "/api/video-status?id=" +
                    encodeURIComponent(
                        predictionId
                    )
                );

            const raw =
                await response.text();

            let data;

            try {

                data =
                    JSON.parse(raw);

            } catch (error) {

                console.error(
                    "Video Status Raw:",
                    raw
                );

                throw new Error(
                    "Video status server ने valid JSON नहीं भेजा।"
                );
            }


            if (!response.ok) {

                throw new Error(
                    data?.error ||
                    "Video status check failed."
                );
            }


            /* =================================================
               VIDEO READY
            ================================================= */

            if (data.videoUrl) {

                showGeneratedVideo(
                    data.videoUrl,
                    originalPrompt
                );

                return;
            }


            /* =================================================
               STATUS
            ================================================= */

            const status =
                String(
                    data.status || ""
                ).toLowerCase();


            if (
                status === "succeeded" ||
                status === "completed" ||
                status === "complete"
            ) {

                const finalUrl =
                    data.videoUrl ||
                    data.output;

                if (finalUrl) {

                    showGeneratedVideo(
                        finalUrl,
                        originalPrompt
                    );

                    return;
                }
            }


            /* =================================================
               FAILED
            ================================================= */

            if (
                status === "failed" ||
                status === "error" ||
                status === "canceled" ||
                status === "cancelled"
            ) {

                addMessage(

                    "❌ <b>Video Generate नहीं हो पाई।</b><br><br>" +

                    escapeHTML(
                        data.error ||
                        "Unknown video error."
                    ),

                    "ai"
                );

                return;
            }


            /* =================================================
               PROCESSING
            ================================================= */

            if (
                attempts >= maxAttempts
            ) {

                addMessage(

                    "⏳ Video अभी तैयार नहीं हुई।<br><br>" +
                    "बाद में फिर से check करें।",

                    "ai"
                );

                return;
            }


            console.log(
                "Video processing:",
                attempts,
                "/",
                maxAttempts
            );


            setTimeout(
                check,
                5000
            );


        } catch (error) {

            console.error(
                "Video Status Error:",
                error
            );


            if (
                attempts < maxAttempts
            ) {

                setTimeout(
                    check,
                    5000
                );

            } else {

                addMessage(

                    "❌ Video Status Error: " +

                    escapeHTML(
                        error.message
                    ),

                    "ai"
                );

            }
        }
    };


    check();
}


/* =========================================================
   GLOBAL VIDEO STATUS
========================================================= */

window.checkVideoStatus =
    checkVideoStatus;


/* =========================================================
   VIDEO BUTTON
========================================================= */

if (videoBtn) {

    videoBtn.addEventListener(
        "click",
        function () {

            const prompt =
                window.prompt(
                    "🎬 अपनी Video Prompt लिखें:"
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
   VIDEO STUDIO GENERATE BUTTON
========================================================= */

if (generateVideoBtn) {

    generateVideoBtn.addEventListener(
        "click",
        function () {

            const promptInput =
                document.getElementById(
                    "videoPrompt"
                );


            const ratioInput =
                document.getElementById(
                    "videoAspectRatio"
                );


            if (
                !promptInput ||
                !promptInput.value.trim()
            ) {

                addMessage(
                    "❌ पहले Video Prompt लिखें।",
                    "ai"
                );

                return;
            }


            const ratio =
                ratioInput
                    ? ratioInput.value
                    : "9:16";


            generateVideo(
                promptInput.value.trim(),
                ratio
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
        function () {

            let fileInput =
                document.getElementById(
                    "gillImageInput"
                );


            if (!fileInput) {

                fileInput =
                    document.createElement(
                        "input"
                    );


                fileInput.type =
                    "file";


                fileInput.id =
                    "gillImageInput";


                fileInput.accept =
                    "image/*";


                fileInput.style.display =
                    "none";


                document.body.appendChild(
                    fileInput
                );


                fileInput.addEventListener(
                    "change",
                    handleImageUpload
                );
            }


            fileInput.click();

        }
    );
}


/* =========================================================
   HANDLE IMAGE UPLOAD
========================================================= */

function handleImageUpload(event) {

    const file =
        event.target.files &&
        event.target.files[0];


    if (!file) {
        return;
    }


    if (
        !file.type.startsWith("image/")
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
        function () {

            const imageUrl =
                reader.result;


            const safeImage =
                escapeHTML(
                    String(imageUrl)
                );


            addMessage(

                "🖼️ <b>Image Selected</b><br><br>" +

                '<img src="' +
                safeImage +
                '" ' +
                'style="width:100%;max-width:400px;border-radius:16px;" ' +
                'alt="Uploaded image">',

                "user"
            );


            addMessage(

                "🤖 Image upload हो गई है।<br><br>" +

                "अब आप इसके बारे में सवाल पूछ सकते हैं।",

                "ai"
            );

        };


    reader.onerror =
        function () {

            addMessage(
                "❌ Image पढ़ने में समस्या हुई।",
                "ai"
            );

        };


    reader.readAsDataURL(file);


    event.target.value = "";

}


/* =========================================================
   IMAGE BUTTON
========================================================= */

if (imageBtn) {

    imageBtn.addEventListener(
        "click",
        function () {

            addMessage(

                "🎨 <b>AI Image</b><br><br>" +

                "अपना image prompt लिखें।",

                "ai"
            );


            if (userInput) {

                userInput.focus();

            }

        }
    );
}


/* =========================================================
   VIDEO HISTORY BUTTON HELPER
========================================================= */

window.showVideoHistory =
    showVideoHistory;


/* =========================================================
   EDITOR BUTTON
========================================================= */

if (editorBtn) {

    editorBtn.addEventListener(
        "click",
        function () {

            addMessage(

                "✂️ <b>Gill AI Video Editor</b><br><br>" +

                "Video Editor module तैयार है।<br><br>" +

                "🎬 Video upload और editing features यहाँ जोड़े जा सकते हैं।",

                "ai"
            );

        }
    );
}


/* =========================================================
   HISTORY BUTTON
========================================================= */

if (historyBtn) {

    historyBtn.addEventListener(
        "click",
        function () {

            showHistory();

        }
    );
}


/* =========================================================
   SETTINGS BUTTON
========================================================= */

if (settingsBtn) {

    settingsBtn.addEventListener(
        "click",
        function () {

            addMessage(

                "⚙️ <b>Gill AI Settings</b><br><br>" +

                "💎 Free Chat Limit: " +
                FREE_CHAT_LIMIT +

                "<br>⏱️ Reset Period: 48 Hours" +

                "<br>🤖 App Version: " +
                APP_VERSION,

                "ai"
            );

        }
    );
}


/* =========================================================
   PART 3/5 END
========================================================= */
/* =========================================================
   Gill AI Ultimate v8
   SCRIPT.JS — PART 4/5
   NAVIGATION + IMAGE + UI HELPERS
========================================================= */

"use strict";

/* =========================================================
   HOME BUTTON
========================================================= */

const homeBtn =
    document.getElementById("homeBtn");

if (homeBtn) {

    homeBtn.addEventListener(
        "click",
        function () {

            if (chatBox) {

                chatBox.innerHTML =
                    '<div class="message ai">' +

                    '👋 नमस्ते! मैं <b>Gill AI Ultimate v8</b> हूँ।<br><br>' +

                    '🤖 AI Chat<br>' +
                    '🎤 Voice Chat<br>' +
                    '🎨 AI Image<br>' +
                    '🎬 AI Video<br>' +
                    '✂️ Video Editor<br>' +
                    '🕒 Chat History<br>' +
                    '⚙️ Settings<br><br>' +

                    'आप क्या करना चाहते हैं?';

                chatBox.scrollTop =
                    chatBox.scrollHeight;
            }

        }
    );
}


/* =========================================================
   STUDIO BUTTON
========================================================= */

const studioBtn =
    document.getElementById("studioBtn");

if (studioBtn) {

    studioBtn.addEventListener(
        "click",
        function () {

            addMessage(

                "🎨 <b>Gill AI Studio</b><br><br>" +

                "यहाँ आप AI Image और AI Video features इस्तेमाल कर सकते हैं।",

                "ai"

            );

        }
    );
}


/* =========================================================
   IMAGE GENERATOR
========================================================= */

function openImageGenerator() {

    const prompt =
        window.prompt(
            "🎨 AI Image बनाने के लिए Prompt लिखें:"
        );

    if (
        !prompt ||
        !prompt.trim()
    ) {
        return;
    }

    addMessage(

        "🎨 <b>Image Prompt</b><br><br>" +

        escapeHTML(
            prompt.trim()
        ) +

        "<br><br>" +

        "⏳ Image Generator API connect होने पर यहाँ image generate होगी।",

        "ai"

    );
}


window.openImageGenerator =
    openImageGenerator;


/* =========================================================
   IMAGE BUTTON
========================================================= */

if (imageBtn) {

    imageBtn.addEventListener(
        "click",
        function () {

            openImageGenerator();

        }
    );
}


/* =========================================================
   IMAGE UPLOAD BUTTON
========================================================= */

if (imageUploadBtn) {

    imageUploadBtn.addEventListener(
        "click",
        function () {

            let input =
                document.getElementById(
                    "gillImageInput"
                );

            if (!input) {

                input =
                    document.createElement(
                        "input"
                    );

                input.type =
                    "file";

                input.id =
                    "gillImageInput";

                input.accept =
                    "image/*";

                input.style.display =
                    "none";

                document.body.appendChild(
                    input
                );

                input.addEventListener(
                    "change",
                    handleImageUpload
                );
            }

            input.click();

        }
    );
}


/* =========================================================
   HANDLE IMAGE UPLOAD
========================================================= */

function handleImageUpload(event) {

    const file =
        event.target.files &&
        event.target.files[0];

    if (!file) {
        return;
    }

    if (
        !file.type.startsWith("image/")
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
        function () {

            const imageUrl =
                reader.result;

            const safeImage =
                escapeHTML(
                    String(imageUrl)
                );


            addMessage(

                "🖼️ <b>Image Uploaded</b><br><br>" +

                '<img src="' +
                safeImage +
                '" ' +
                'style="width:100%;max-width:400px;border-radius:16px;" ' +
                'alt="Uploaded image">',

                "user"

            );


            addMessage(

                "🤖 Image upload हो गई है।<br><br>" +

                "अब आप इस image के बारे में सवाल पूछ सकते हैं।",

                "ai"

            );

        };


    reader.onerror =
        function () {

            addMessage(

                "❌ Image पढ़ने में समस्या हुई।",

                "ai"

            );

        };


    reader.readAsDataURL(file);


    event.target.value = "";

}


/* =========================================================
   HISTORY BUTTON
========================================================= */

if (historyBtn) {

    historyBtn.addEventListener(
        "click",
        function () {

            showHistory();

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
        function () {

            showVideoHistory();

        }
    );
}


/* =========================================================
   SETTINGS BUTTON
========================================================= */

if (settingsBtn) {

    settingsBtn.addEventListener(
        "click",
        function () {

            addMessage(

                "⚙️ <b>Gill AI Settings</b><br><br>" +

                "💎 Free Chats: " +
                getRemainingChats() +
                "/" +
                FREE_CHAT_LIMIT +

                "<br><br>" +

                "⏱️ Reset: 48 Hours" +

                "<br><br>" +

                "📱 Version: " +
                APP_VERSION,

                "ai"

            );

        }
    );
}


/* =========================================================
   EDITOR BUTTON
========================================================= */

if (editorBtn) {

    editorBtn.addEventListener(
        "click",
        function () {

            addMessage(

                "✂️ <b>Gill AI Video Editor</b><br><br>" +

                "Video Editor module तैयार है।<br><br>" +

                "🎬 Video upload करके editing features आगे जोड़े जा सकते हैं।",

                "ai"

            );

        }
    );
}


/* =========================================================
   CLEAR CHAT
========================================================= */

const clearChatBtn =
    document.getElementById(
        "clearChatBtn"
    );

if (clearChatBtn) {

    clearChatBtn.addEventListener(
        "click",
        function () {

            if (!chatBox) {
                return;
            }

            chatBox.innerHTML = "";

            addMessage(

                "🧹 Chat साफ कर दी गई।",

                "ai"

            );

        }
    );
}


/* =========================================================
   NEW CHAT
========================================================= */

const newChatBtn =
    document.getElementById(
        "newChatBtn"
    );

if (newChatBtn) {

    newChatBtn.addEventListener(
        "click",
        function () {

            if (chatBox) {

                chatBox.innerHTML =

                    '<div class="message ai">' +

                    '👋 नया Chat शुरू हो गया।<br><br>' +

                    'मैं Gill AI Ultimate हूँ। आप अपना सवाल पूछ सकते हैं।' +

                    '</div>';

            }

            if (userInput) {
                userInput.value = "";
                userInput.focus();
            }

        }
    );
}


/* =========================================================
   INSTALL PWA
========================================================= */

let deferredInstallPrompt = null;


window.addEventListener(
    "beforeinstallprompt",
    function (event) {

        event.preventDefault();

        deferredInstallPrompt =
            event;

        console.log(
            "PWA install prompt ready."
        );

    }
);


const installBtn =
    document.getElementById(
        "installBtn"
    );


if (installBtn) {

    installBtn.addEventListener(
        "click",
        async function () {

            if (!deferredInstallPrompt) {

                addMessage(

                    "📱 App पहले से installed हो सकती है या browser install prompt उपलब्ध नहीं है।",

                    "ai"

                );

                return;
            }


            deferredInstallPrompt.prompt();


            const result =
                await deferredInstallPrompt.userChoice;


            console.log(
                "Install result:",
                result.outcome
            );


            deferredInstallPrompt =
                null;

        }
    );
}


/* =========================================================
   BACK TO TOP / SCROLL
========================================================= */

const scrollTopBtn =
    document.getElementById(
        "scrollTopBtn"
    );


if (scrollTopBtn) {

    scrollTopBtn.addEventListener(
        "click",
        function () {

            if (chatBox) {

                chatBox.scrollTo({

                    top: 0,

                    behavior: "smooth"

                });

            }

        }
    );
}


/* =========================================================
   GLOBAL UI FUNCTIONS
========================================================= */

window.handleImageUpload =
    handleImageUpload;


window.openImageGenerator =
    openImageGenerator;


/* =========================================================
   PART 4/5 END
========================================================= */
/* =========================================================
   Gill AI Ultimate v8
   SCRIPT.JS — PART 5/5
   DARK MODE + MENU + APP INITIALIZATION
========================================================= */

"use strict";

/* =========================================================
   DARK MODE
========================================================= */

const darkModeBtn =
    document.getElementById("darkModeBtn");

function toggleDarkMode() {

    document.body.classList.toggle(
        "dark-mode"
    );

    const isDark =
        document.body.classList.contains(
            "dark-mode"
        );

    localStorage.setItem(
        "gillDarkMode",
        isDark ? "true" : "false"
    );

    addMessage(

        isDark
            ? "🌙 Dark Mode ON"
            : "☀️ Light Mode ON",

        "ai"

    );
}


if (darkModeBtn) {

    darkModeBtn.addEventListener(
        "click",
        toggleDarkMode
    );

}


/* =========================================================
   LOAD DARK MODE
========================================================= */

try {

    const savedDarkMode =
        localStorage.getItem(
            "gillDarkMode"
        );

    if (
        savedDarkMode === "true"
    ) {

        document.body.classList.add(
            "dark-mode"
        );

    }

} catch (error) {

    console.error(
        "Dark mode load error:",
        error
    );

}


/* =========================================================
   MENU TOGGLE
========================================================= */

const menuBtn =
    document.getElementById(
        "menuBtn"
    );

const sideMenu =
    document.getElementById(
        "sideMenu"
    );


if (
    menuBtn &&
    sideMenu
) {

    menuBtn.addEventListener(
        "click",
        function () {

            sideMenu.classList.toggle(
                "open"
            );

        }
    );

}


/* =========================================================
   CLOSE MENU
========================================================= */

const closeMenuBtn =
    document.getElementById(
        "closeMenuBtn"
    );


if (
    closeMenuBtn &&
    sideMenu
) {

    closeMenuBtn.addEventListener(
        "click",
        function () {

            sideMenu.classList.remove(
                "open"
            );

        }
    );

}


/* =========================================================
   OUTSIDE MENU CLICK
========================================================= */

document.addEventListener(
    "click",
    function (event) {

        if (
            !sideMenu ||
            !menuBtn
        ) {

            return;

        }


        if (
            sideMenu.classList.contains(
                "open"
            ) &&
            !sideMenu.contains(
                event.target
            ) &&
            !menuBtn.contains(
                event.target
            )
        ) {

            sideMenu.classList.remove(
                "open"
            );

        }

    }
);


/* =========================================================
   LOGOUT / ACCOUNT BUTTON
========================================================= */

const accountBtn =
    document.getElementById(
        "accountBtn"
    );


if (accountBtn) {

    accountBtn.addEventListener(
        "click",
        function () {

            addMessage(

                "👤 <b>Gill AI Account</b><br><br>" +

                "Account system अभी local mode में है।<br><br>" +

                "🔐 Login / Create Account feature आगे जोड़ा जा सकता है।",

                "ai"

            );

        }
    );

}


/* =========================================================
   RESTART APP
========================================================= */

const restartBtn =
    document.getElementById(
        "restartBtn"
    );


if (restartBtn) {

    restartBtn.addEventListener(
        "click",
        function () {

            location.reload();

        }
    );

}


/* =========================================================
   PROFILE BUTTON
========================================================= */

const profileBtn =
    document.getElementById(
        "profileBtn"
    );


if (profileBtn) {

    profileBtn.addEventListener(
        "click",
        function () {

            addMessage(

                "👤 <b>Gill AI Profile</b><br><br>" +

                "🤖 Gill AI Ultimate v8<br>" +

                "💎 Free Plan<br>" +

                "💬 Free Chats: " +

                getRemainingChats() +

                "/" +

                FREE_CHAT_LIMIT,

                "ai"

            );

        }
    );

}


/* =========================================================
   HELP BUTTON
========================================================= */

const helpBtn =
    document.getElementById(
        "helpBtn"
    );


if (helpBtn) {

    helpBtn.addEventListener(
        "click",
        function () {

            addMessage(

                "❓ <b>Gill AI Help</b><br><br>" +

                "💬 Chat — AI से बात करें<br>" +

                "🎤 Voice — बोलकर message भेजें<br>" +

                "🎨 Image — AI Image feature<br>" +

                "🎬 Video — AI Video feature<br>" +

                "🕒 History — पुराने chats देखें<br>" +

                "⚙️ Settings — App settings देखें",

                "ai"

            );

        }
    );

}


/* =========================================================
   PREVENT FORM RELOAD
========================================================= */

document.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

    }
);


/* =========================================================
   APP READY MESSAGE
========================================================= */

console.log(
    "======================================"
);

console.log(
    "🤖 Gill AI Ultimate v8"
);

console.log(
    "✅ Script loaded successfully"
);

console.log(
    "💬 Chat system ready"
);

console.log(
    "🎤 Voice system ready"
);

console.log(
    "🎬 Video system ready"
);

console.log(
    "🎨 Image system ready"
);

console.log(
    "======================================"
);


/* =========================================================
   FINAL INITIALIZATION
========================================================= */

try {

    getChatUsage();

    updateCreditUI();

} catch (error) {

    console.error(
        "Final initialization error:",
        error
    );

}


/* =========================================================
   PART 5/5 END
========================================================= */