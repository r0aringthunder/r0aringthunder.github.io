function setError(e, t = !1) {
    const n = document.getElementById("gemini-error"),
          a = document.getElementsByClassName("gemini-nano-error-catch");
    if (n) n.dataset.error = e;
    if (t) for (let r = 0; r < a.length; r++) a[r].style.display = "none";
}

function escapeHtml(e) {
    return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function createCodeBlock(e, t) {
    const n = document.createElement("div");
    n.classList.add("code-block");
    n.innerHTML = `<div class="code-header"><span class="code-language">${t}</span></div><pre><code class="language-${t}">${escapeHtml(e)}</code></pre>`;
    Prism.highlightElement(n.querySelector("code"));
    return n;
}

function extractCodeBlocks(e) {
    const t = /```(\w+)?\n([\s\S]*?)```/g;
    let n, a = [], r = 0;
    while (null !== (n = t.exec(e))) {
        const s = n[1] || "text", l = n[2];
        if (n.index > r) a.push({ type: "text", content: e.slice(r, n.index) });
        a.push({ type: "code", content: l, language: s });
        r = t.lastIndex;
    }
    if (r < e.length) a.push({ type: "text", content: e.slice(r) });
    return a;
}

function renderResponse(e, t) {
    const n = extractCodeBlocks(e);
    const fragment = document.createDocumentFragment();
    n.forEach((e, index) => {
        if (e.type === "text") {
            const span = document.createElement("span");
            span.innerHTML = escapeHtml(e.content);
            fragment.appendChild(span);
        } else if (e.type === "code") {
            const codeBlock = createCodeBlock(e.content, e.language);
            fragment.appendChild(codeBlock);
        }
        if (index < n.length - 1) {
            fragment.appendChild(document.createElement("br"));
        }
    });
    t.appendChild(fragment);
}

document.addEventListener("DOMContentLoaded", async function () {
    try {
        const aiAvailable = window.ai !== null;
        const textSessionAvailable = aiAvailable && (await window.ai.canCreateTextSession()) === "readily";
        if (!textSessionAvailable) {
            setError(aiAvailable ? "Your browser supports Gemini Nano but you still have to turn on a few features. Please see the Projects page for more information." : "Gemini Nano is not supported by this browser...", true);
            const helpElement = document.getElementById("how-to");
            if (helpElement) helpElement.dataset.help = true;
            return;
        }
        const session = await window.ai.createTextSession();
        const askButton = document.getElementById("ask-button");
        const askQuestion = document.getElementById("ask-question");
        const chatContainer = document.getElementById("chat-container");
        if (!askButton || !askQuestion || !chatContainer) {
            setError("Required elements are missing from the page.");
            return;
        }
        let isProcessing = false;
        async function handleQuestion() {
            if (isProcessing) return;
            const question = askQuestion.value.trim() || "Hi there";
            const userMessage = document.createElement("div");
            userMessage.classList.add("chat-message", "user-message");
            userMessage.innerHTML = `<div class="chat-bubble">${escapeHtml(question)}</div><i class="bi bi-person-fill icon"></i>`;
            chatContainer.appendChild(userMessage);
            try {
                isProcessing = true;
                setError("");
                askQuestion.value = "";
                const response = await session.prompt(question);
                const aiMessage = document.createElement("div");
                aiMessage.classList.add("chat-message", "ai-message");
                aiMessage.innerHTML = '<i class="bi bi-robot icon"></i>';
                renderResponse(response, aiMessage);
                chatContainer.appendChild(aiMessage);
                chatContainer.scrollTop = chatContainer.scrollHeight;
            } catch (error) {
                setError(error.message);
            }
            isProcessing = false;
        }
        askButton.addEventListener("click", handleQuestion);
        document.addEventListener("keydown", (e) => {
            if (!isProcessing && e.shiftKey && e.key === "Enter") {
                askButton.focus();
                e.preventDefault();
                handleQuestion();
            }
        });
        document.body.setAttribute("data-ready", "true");
    } catch (error) {
        setError(error.message);
    }
});
