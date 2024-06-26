function setError(error, hideGemini = false) {
    const errorElement = document.getElementById("gemini-error");
    const geminiElements = document.getElementsByClassName("gemini-nano-error-catch");
    if (errorElement) {
        errorElement.dataset.error = error;
    }
    if (hideGemini == true) {
        for (let i = 0; i < geminiElements.length; i++) {
            geminiElements[i].style.display = "none";
        }
    }
}

function escapeHtml(html) {
    return html.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&#039;');
}

function createCodeBlock(code, language) {
    const codeBlock = document.createElement('div');
    codeBlock.classList.add('code-block');
    codeBlock.innerHTML = `
        <div class="code-header">
            <span class="code-language">${language}</span>
        </div>
        <pre><code class="language-${language}">${escapeHtml(code)}</code></pre>
    `;

    Prism.highlightElement(codeBlock.querySelector('code'));

    return codeBlock;
}

function extractCodeBlocks(response) {
    const codeBlockPattern = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    const parts = [];
    let lastIndex = 0;

    while ((match = codeBlockPattern.exec(response)) !== null) {
        const language = match[1] || 'text';
        const code = match[2];

        if (match.index > lastIndex) {
            parts.push({ type: 'text', content: response.slice(lastIndex, match.index) });
        }

        parts.push({ type: 'code', content: code, language });

        lastIndex = codeBlockPattern.lastIndex;
    }

    if (lastIndex < response.length) {
        parts.push({ type: 'text', content: response.slice(lastIndex) });
    }

    return parts;
}

function renderResponse(response, container) {
    const parts = extractCodeBlocks(response);
    const chatBubble = document.createElement('div');
    chatBubble.classList.add('chat-bubble');

    parts.forEach(part => {
        if (part.type === 'text') {
            chatBubble.innerHTML += escapeHtml(part.content);
        } else if (part.type === 'code') {
            const codeBlock = createCodeBlock(part.content, part.language);
            chatBubble.appendChild(codeBlock);
        }
    });

    container.appendChild(chatBubble);
}

function showToast(message) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.classList.add('toast', 'show');
    toast.role = 'alert';
    toast.ariaLive = 'assertive';
    toast.ariaAtomic = 'true';
    toast.innerHTML = `
        <div class="toast-header">
            <strong class="me-auto">Notification</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
}

document.addEventListener("DOMContentLoaded", async function () {
    try {
        const hasAI = window.ai != null;
        const hasGemini = (hasAI && (await window.ai.canCreateTextSession())) === "readily";

        if (!hasGemini) {
            setError(!hasAI ? "Gemini Nano is not supported by this browser..." : "Your browser supports Gemini Nano but you still have to turn on a few features. Please see the Projects page for more information.", true);
            const howToElement = document.getElementById('how-to');
            if (howToElement) {
                howToElement.dataset.help = true;
            }
            return;
        }

        const session = await window.ai.createTextSession();

        const askElement = document.getElementById('ask-button');
        const questionElement = document.getElementById('ask-question');
        const chatContainer = document.getElementById('chat-container');

        if (!askElement || !questionElement || !chatContainer) {
            setError("Required elements are missing from the page.");
            return;
        }

        let asking = false;

        async function ask() {
            if (asking) {
                return;
            }
        
            const prompt = questionElement.value.trim() === "" ? "Hi there" : questionElement.value.trim();
            const userMessage = document.createElement('div');
            userMessage.classList.add('chat-message', 'user-message');
            userMessage.innerHTML = `<div class="chat-bubble">${escapeHtml(prompt)}</div><i class="bi bi-person-fill icon"></i>`;
            chatContainer.appendChild(userMessage);
        
            try {
                asking = true;
                setError('');
                questionElement.value = '';
        
                const response = await session.prompt(prompt);
                const responseElement = document.createElement('div');
                responseElement.classList.add('chat-message', 'ai-message');
                responseElement.innerHTML = `<i class="bi bi-robot icon"></i>`;
                
                renderResponse(response, responseElement);
        
                chatContainer.appendChild(responseElement);
                chatContainer.scrollTop = chatContainer.scrollHeight;
            } catch (err) {
                setError(err.message);
            }
        
            asking = false;
        }

        askElement.addEventListener('click', () => {
            ask();
        });

        document.addEventListener('keydown', (event) => {
            if (!asking && event.shiftKey && event.key === "Enter") {
                askElement.focus();
                event.preventDefault();
                ask();
            }
        });

        document.body.setAttribute("data-ready", "true");
    } catch (err) {
        setError(err.message);
    }
});