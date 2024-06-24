function setError(error) {
    document.getElementById("gemini-error").dataset.error = error;
}

window.addEventListener("load", async function () {
    try {
        const hasAI = window.ai != null;
        const hasGemini = (hasAI && (await window.ai.canCreateTextSession())) === "readily";

        if (!hasGemini) {
            setError(!hasAI ? "not supported in this browser" : "not ready yet");
            document.getElementById('how-to').dataset.help = true;
            return;
        }

        const session = await window.ai.createTextSession();

        const askElement = document.getElementById('ask-button');
        const questionElement = document.getElementById('ask-question');
        const chatContainer = document.getElementById('chat-container');

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

            const stream = session.promptStreaming(prompt);
            const responseElement = document.createElement('div');
            responseElement.classList.add('chat-message', 'ai-message');
            chatContainer.appendChild(responseElement);

            try {
                asking = true;
                askElement.disabled = true;
                setError('');
                questionElement.value = '';

                let aiMessageContent = '';
                for await (const chunk of stream) {
                    aiMessageContent += chunk;
                    responseElement.innerHTML = `<i class="bi bi-robot icon"></i><div class="chat-bubble">${aiMessageContent}</div>`;
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }
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