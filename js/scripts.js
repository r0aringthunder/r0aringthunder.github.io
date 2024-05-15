function pingSite(domain, interval, elementId) {
    const statusBubble = document.getElementById(elementId);

    function checkStatus() {
        fetch(domain, { mode: 'no-cors' })
            .then(response => {
                if (statusBubble) {
                    statusBubble.className = 'rounded-circle bg-success status-bubble';
                    statusBubble.title = 'Last successful check: ' + new Date().toLocaleTimeString();
                }
            })
            .catch(error => {
                if (statusBubble) {
                    statusBubble.className = 'rounded-circle bg-danger status-bubble';
                    statusBubble.title = 'Last failed check: ' + new Date().toLocaleTimeString();
                }
            });
    }

    setInterval(checkStatus, interval);

    checkStatus();
}
