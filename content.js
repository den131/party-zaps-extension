console.log("NWC Transaction Notifier content script loaded");

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("Message received in content script:", request);
    if (request.action === "triggerConfetti") {
        console.log("Triggering confetti for amount:", request.amount);
        triggerConfetti(request.amount);
        sendResponse({success: true});
    }
    return true;  // Indicates that we will send a response asynchronously
});

function triggerConfetti(amount) {
    console.log("Inside triggerConfetti function");
    const brightColors = ['#FF1493', '#00FF00', '#1E90FF', '#FFD700', '#FF4500', '#8A2BE2'];

    // Set the threshold for confetti and notification (e.g., 1000 sats)
    const threshold = 0;

    if (amount >= threshold) {
        if (typeof confetti === 'function') {
            console.log("Executing confetti for amount above threshold");
            confetti({
                particleCount: 250,
                spread: 90,
                origin: { x: 0.25, y: 1 },
                colors: brightColors,
                scalar: 1.5,
                gravity: 1,
                drift: 0,
                ticks: 400
            });
            confetti({
                particleCount: 250,
                spread: 90,
                origin: { x: 0.75, y: 1 },
                colors: brightColors,
                scalar: 1.5,
                gravity: 1,
                drift: 0,
                ticks: 400
            });
        } else {
            console.error("Confetti function not available, using fallback");
            fallbackConfetti();
        }
        showNotification(amount);
    } else {
        console.log(`Amount ${amount} is below threshold ${threshold}. No confetti or notification shown.`);
    }
}

function fallbackConfetti() {
    console.log("Using fallback confetti function");
    for (let i = 0; i < 100; i++) {
        createConfettiParticle();
    }
}

function createConfettiParticle() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.width = '10px';
    particle.style.height = '10px';
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    particle.style.left = Math.random() * window.innerWidth + 'px';
    particle.style.top = window.innerHeight + 'px';
    particle.style.zIndex = '10000';
    document.body.appendChild(particle);

    const animation = particle.animate([
        { transform: 'translate3d(0, 0, 0)', opacity: 1 },
        { transform: `translate3d(${Math.random() * 200 - 100}px, -${window.innerHeight}px, 0)`, opacity: 0 }
    ], {
        duration: Math.random() * 1000 + 1000,
        easing: 'cubic-bezier(0, .9, .57, 1)',
        delay: Math.random() * 1000
    });

    animation.onfinish = () => particle.remove();
}

function showNotification(amount) {
    console.log("Showing notification for amount:", amount);
    const notification = document.createElement('div');
    notification.textContent = `Received: ${amount.toLocaleString(undefined, {maximumFractionDigits: 0})} sats`;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#F8C455';
    notification.style.borderColor = 'black';
    notification.style.color = 'black';
    notification.style.padding = '10px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '9999';
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
        console.log("Notification removed");
    }, 5000);
}

// Add key listener for simulating receive transaction
// document.addEventListener('keydown', function(event) {
//     if (event.key === 'r' || event.key === 'R') {
//         console.log("Simulating receive transaction from content script");
//         chrome.runtime.sendMessage({action: "simulateReceive"}, function(response) {
//             console.log("Simulation response in content script:", response);
//         });
//     }
// });

console.log("NWC Transaction Notifier content script fully loaded");