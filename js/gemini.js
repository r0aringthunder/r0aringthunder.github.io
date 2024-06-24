document.addEventListener("DOMContentLoaded", async () => {
    const session = await window.ai.createTextSession();
    const textarea = document.getElementById("promptTextArea");
    const promptResponseText = document.getElementById("promptResponseText");

    textarea.addEventListener("keydown", async () => {
        let promptText = textarea.value.trim() === "" ? "Hi there" : textarea.value.trim();
        const response = await session.prompt(promptText);
        promptResponseText.textContent = response;
    });
});