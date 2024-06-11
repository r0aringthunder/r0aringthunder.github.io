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

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('main-header')) {
        const items = document.querySelectorAll('.ticker-item');
        let currentIndex = 0;

        function showNextItem() {
            items[currentIndex].classList.remove('show');
            setTimeout(() => {
                items[currentIndex].classList.add('d-none');
                currentIndex = (currentIndex + 1) % items.length;
                items[currentIndex].classList.remove('d-none');
                setTimeout(() => {
                    items[currentIndex].classList.add('show');
                }, 15);
            }, 500);
        }

        setInterval(showNextItem, 3200);
    }
});