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

            const prompt = questionElement.value;
            if (!prompt.trim()) {
                return;
            }

            const userMessage = document.createElement('div');
            userMessage.classList.add('chat-message', 'user-message');
            userMessage.innerHTML = `<div class="chat-bubble">${prompt}</div><i class="bi bi-person-fill icon"></i>`;
            chatContainer.appendChild(userMessage);

            try {
                asking = true;
                askElement.disabled = true;
                setError('');
                questionElement.value = '';

                const response = await session.prompt(prompt);
                const responseElement = document.createElement('div');
                responseElement.classList.add('chat-message', 'ai-message');
                responseElement.innerHTML = `<i class="bi bi-robot icon"></i><div class="chat-bubble">${response}</div>`;
                chatContainer.appendChild(responseElement);
                chatContainer.scrollTop = chatContainer.scrollHeight;
            } catch (err) {
                setError(err.message);
            }

            asking = false;
            askElement.disabled = false;
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