// ---------- Elements ----------
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


// ---------- App ----------
const APP_NAME = "Gill AI Ultimate";
const APP_VERSION = "v8";


// ---------- History ----------
let chatHistory = JSON.parse(
    localStorage.getItem("gillHistory") || "[]"
);


// ---------- Add Message ----------
function addMessage(text, type) {

    if (!chatBox) return;

    const div = document.createElement("div");

    div.className = "message " + type;

    div.innerHTML = String(text).replace(/\n/g, "<br>");

    chatBox.appendChild(div);

    chatBox.scrollTop = chatBox.scrollHeight;
}


// ---------- Welcome ----------
window.addEventListener("load", function () {

    addMessage(
        "👋 Welcome to <b>" +
        APP_NAME +
        " " +
        APP_VERSION +
        "</b><br><br>मैं आपकी AI Assistant हूँ।",
        "ai"
    );

});


// ---------- AI API ----------
async function aiReply(text) {

    const response = await fetch("/api/chat", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            message: text
        })

    });

    const data = await response.json();

    if (!response.ok) {

        throw new Error(
            data.error || "AI request failed"
        );

    }

    return data.reply;
}


// ---------- Save History ----------
function saveHistory(user, ai) {

    chatHistory.push({

        user: user,
        ai: ai,
        time: new Date().toLocaleString()

    });

    localStorage.setItem(
        "gillHistory",
        JSON.stringify(chatHistory)
    );
}


// ---------- Typing ----------
function showTyping() {

    if (!chatBox) return;

    if (document.getElementById("typing")) return;

    const typing =
        document.createElement("div");

    typing.id = "typing";

    typing.className = "message ai";

    typing.innerHTML = "🤖 Typing...";

    chatBox.appendChild(typing);

    chatBox.scrollTop =
        chatBox.scrollHeight;
}


function hideTyping() {

    const typing =
        document.getElementById("typing");

    if (typing) {
        typing.remove();
    }
}


// ---------- Send ----------
async function sendMessage() {

    if (!userInput) return;

    const text =
        userInput.value.trim();

    if (text === "") return;

    addMessage(
        text,
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

    } catch (error) {

        hideTyping();

        addMessage(
            "❌ AI Error: " +
            error.message,
            "ai"
        );

        console.error(
            "Gill AI Error:",
            error
        );

    }
}


// ---------- Send Button ----------
if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        sendMessage
    );

}


// ---------- Enter ----------
if (userInput) {

    userInput.addEventListener(
        "keydown",
        function (e) {

            if (e.key === "Enter") {

                e.preventDefault();

                sendMessage();

            }

        }
    );

}


// ---------- Voice ----------
if (voiceBtn) {

    voiceBtn.addEventListener(
        "click",
        function () {

            if (
                !("webkitSpeechRecognition" in window)
            ) {

                alert(
                    "❌ Voice Recognition Support नहीं है।"
                );

                return;
            }

            const recognition =
                new webkitSpeechRecognition();

            recognition.lang =
                "hi-IN";

            recognition.interimResults =
                false;

            recognition.maxAlternatives =
                1;

            recognition.onresult =
                function (e) {

                    if (userInput) {

                        userInput.value =
                            e.results[0][0]
                            .transcript;

                    }

                };

            recognition.onerror =
                function (e) {

                    console.error(
                        "Voice Error:",
                        e.error
                    );

                };

            recognition.start();

        }
    );

}


// ---------- AI Image ----------
if (imageBtn) {

    imageBtn.addEventListener(
        "click",
        function () {

            const imagePrompt =
                window.prompt(
                    "🎨 कौन-सी Image बनानी है?"
                );

            if (!imagePrompt) return;

            addMessage(
                "🎨 " + imagePrompt,
                "user"
            );

            showTyping();

            setTimeout(
                function () {

                    hideTyping();

                    addMessage(
                        "🖼️ Image Request तैयार है।<br><br>" +
                        "Prompt:<br>" +
                        imagePrompt +
                        "<br><br>⚠️ अभी Image API Connect नहीं है।",
                        "ai"
                    );

                    saveHistory(
                        imagePrompt,
                        "Image Request"
                    );

                },
                800
            );

        }
    );

}


// ---------- AI Video ----------
if (videoBtn) {

    videoBtn.addEventListener(
        "click",
        function () {

            const videoPrompt =
                window.prompt(
                    "🎬 कौन-सी Video बनानी है?"
                );

            if (!videoPrompt) return;

            addMessage(
                "🎬 " + videoPrompt,
                "user"
            );

            showTyping();

            setTimeout(
                function () {

                    hideTyping();

                    addMessage(
                        "🎥 Video Request तैयार है।<br><br>" +
                        "Prompt:<br>" +
                        videoPrompt +
                        "<br><br>⚠️ अभी Video API Connect नहीं है।",
                        "ai"
                    );

                    saveHistory(
                        videoPrompt,
                        "Video Request"
                    );

                },
                1000
            );

        }
    );

}


// ---------- Video Editor ----------
if (editorBtn) {

    editorBtn.addEventListener(
        "click",
        function () {

            addMessage(
                "✂️ <b>Video Editor</b><br><br>" +
                "• Trim<br>" +
                "• Crop<br>" +
                "• Merge<br>" +
                "• Add Music<br>" +
                "• Filters<br><br>" +
                "जल्द उपलब्ध होगा।",
                "ai"
            );

        }
    );

}


// ---------- Image Upload ----------
if (imageUploadBtn) {

    imageUploadBtn.addEventListener(
        "click",
        function () {

            alert(
                "🖼️ Image Upload Feature जल्द उपलब्ध होगा।"
            );

        }
    );

}


// ---------- History ----------
if (historyBtn) {

    historyBtn.addEventListener(
        "click",
        function () {

            if (chatHistory.length === 0) {

                alert(
                    "📂 कोई Chat History नहीं मिली।"
                );

                return;
            }

            let historyText = "";

            chatHistory.forEach(
                function (item, index) {

                    historyText +=
                        "----------------------\n" +
                        (index + 1) + ".\n" +
                        "👤 " + item.user + "\n" +
                        "🤖 " + item.ai + "\n" +
                        "🕒 " + item.time + "\n\n";

                }
            );

            alert(historyText);

        }
    );

}


// ---------- Settings ----------
if (settingsBtn) {

    settingsBtn.addEventListener(
        "click",
        function () {

            const option =
                window.prompt(
`⚙️ Gill AI Settings

1 = App Info
2 = Clear History
3 = Clear Chat`
                );

            if (option === "1") {

                alert(
`🤖 Gill AI Ultimate v8

Status : Ready
Theme : Dark
History : Enabled
Voice : Enabled`
                );

            }

            else if (option === "2") {

                localStorage.removeItem(
                    "gillHistory"
                );

                chatHistory = [];

                alert(
                    "✅ History Delete हो गई।"
                );

            }

            else if (option === "3") {

                if (chatBox) {

                    chatBox.innerHTML = "";

                    addMessage(
                        "👋 Chat Clear हो गई।",
                        "ai"
                    );

                }

            }

        }
    );

}


// ---------- Theme ----------
let currentTheme =
    localStorage.getItem("gillTheme") || "dark";


function applyTheme() {

    if (
        currentTheme === "light"
    ) {

        document.body.classList.add(
            "light"
        );

    } else {

        document.body.classList.remove(
            "light"
        );

    }

}

applyTheme();


// ---------- Internet ----------
window.addEventListener(
    "online",
    function () {

        addMessage(
            "🟢 Internet Connected",
            "ai"
        );

    }
);


window.addEventListener(
    "offline",
    function () {

        addMessage(
            "🔴 Internet Disconnected",
            "ai"
        );

    }
);


// ---------- Export History ----------
window.exportHistory =
    function () {

        if (chatHistory.length === 0) {

            alert(
                "📂 No History Found"
            );

            return;
        }

        const data =
            JSON.stringify(
                chatHistory,
                null,
                2
            );

        const blob =
            new Blob(
                [data],
                {
                    type:
                        "application/json"
                }
            );

        const url =
            URL.createObjectURL(blob);

        const a =
            document.createElement("a");

        a.href = url;

        a.download =
            "GillAI_History.json";

        document.body.appendChild(a);

        a.click();

        document.body.removeChild(a);

        URL.revokeObjectURL(url);

    };


// ---------- Restart ----------
window.restartApp =
    function () {

        if (
            confirm(
                "♻️ Gill AI Restart करें?"
            )
        ) {

            location.reload();

        }

    };


// ---------- Auto Focus ----------
window.addEventListener(
    "load",
    function () {

        if (userInput) {

            userInput.focus();

        }

    }
);


// ---------- Final ----------
console.log(
    "Gill AI Ultimate v8 Loaded Successfully"
);
