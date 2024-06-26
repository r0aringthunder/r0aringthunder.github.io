function setError(error) {
    const errorElement = document.getElementById("nano-error");
    if (errorElement) {
        errorElement.dataset.error = error;
    }
}

function escapeHtml(html) {
    return html.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&#039;');
}

window.addEventListener("load", async function () {
    try {
        const hasAI = window.ai != null;

        const hasNano = (hasAI && (await window.ai.canCreateTextSession())) === "readily";

        if (!hasNano) {
            setError(!hasAI ? "not supported in this browser" : "not ready yet");
            document.getElementById('how-to').dataset.help = true;
            return;
        }

        const session = await window.ai.createTextSession();

        const questionElement = document.getElementById('promptTextArea');
        const chatContainer = document.getElementById('chat-container');

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
                responseElement.innerHTML = `<i class="bi bi-robot icon"></i><div class="chat-bubble">${escapeHtml(response)}</div>`;
                chatContainer.appendChild(responseElement);
                chatContainer.scrollTop = chatContainer.scrollHeight;
            } catch (err) {
                setError(err.message);
            }

            asking = false;
        }

        questionElement.addEventListener('keydown', (event) => {
            if (!asking && event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                ask();
            }
        });

        document.body.setAttribute("data-ready", "true");
    } catch (err) {
        setError(err.message);
    }
});