function pingSite(domain, interval, elementId) {
    const statusBubble = document.getElementById(elementId);

    function checkStatus() {
        fetch(domain, { mode: 'no-cors' })
            .then(response => {
                console.log('Site responded', response.status, 'at', domain);
                statusBubble.className = 'rounded-circle bg-success';
                statusBubble.title = 'Last successful check: ' + new Date().toLocaleTimeString();
            })
            .catch(error => {
                console.log('Site did not respond', error, 'at', domain);
                statusBubble.className = 'rounded-circle bg-danger';
                statusBubble.title = 'Last failed check: ' + new Date().toLocaleTimeString();
            });
    }

    setInterval(checkStatus, interval);

    checkStatus();
}