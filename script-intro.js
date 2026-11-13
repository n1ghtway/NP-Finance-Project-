// ==========================================
// 1. CONFIGURATION DES DESTINATIONS
// ==========================================
const routes = {
    destination1: "financial-analysis.html",
    destination2: "stock-portfolio.html",
    destination3: "quantitative-python.html"
};

// ==========================================
// 2. SYNTHÉTISEUR DE SON RÉTRO (ANNÉES 80)
// ==========================================
function playRetroBeep(frequency = 440, duration = 0.05) {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start();
        oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
        // Ignore si le navigateur bloque l'audio
    }
}

// ==========================================
// 3. ANIMATION D'ÉCRITURE (ATTENTE DU CLIC)
// ==========================================
const message = 
`WELCOME TO THE SYSTEM.

TERMINAL ACCESS CONFIRMED
PLEASE SELECT YOUR CHOICE BETWEEN THE AVAILABLE OPTIONS.

CHOOSE YOUR DESTINATION :`;

const typingSpeed = 45;
const typingElement = document.getElementById("typing-text");
const typingCursor = document.getElementById("typing-cursor");
const choices = document.getElementById("choices");
const footerStatus = document.getElementById("footer-status");
const footerCursor = document.getElementById("footer-cursor");

// Masquer le curseur du footer au démarrage
footerCursor.style.display = "none";

// Trouve la position exacte où commence "CHOOSE YOUR DESTINATION :"
const stopBeepIndex = message.indexOf("CHOOSE YOUR DESTINATION :");

let index = 0;
let hasStarted = false;

// Indiquer dans le footer qu'il faut cliquer pour démarrer
footerStatus.textContent = "SYSTEM READY // CLICK ANYWHERE TO START";

// Écouteur de clic pour démarrer
window.addEventListener("click", function() {
    if (hasStarted) return;
    hasStarted = true;

    playRetroBeep(440, 0.1);
    footerStatus.textContent = "SYSTEM INITIALIZING...";

    setTimeout(typeText, 500);
}, { once: true });

function typeText() {
    if (index < message.length) {
        const char = message.charAt(index);
        typingElement.appendChild(document.createTextNode(char));
        
        // Joue les bips uniquement jusqu'à l'index souhaité
        if (index < stopBeepIndex + 0) {
            if (index % 3 === 0 && char.trim() !== "") {
                playRetroBeep(800, 0.03);
            }
        }

        index++;
        setTimeout(typeText, typingSpeed);
    } else {
        // Fin de l'animation d'écriture
        typingCursor.style.display = "none";
        choices.classList.add("visible");
        
        footerStatus.textContent = "SYSTEM READY // WAITING FOR USER INPUT";
        // Affiche enfin le curseur du footer proprement ici
        footerCursor.style.display = "inline-block";
        
        playRetroBeep(300, 0.15);
    }
}

// ==========================================
// 4. GESTION DE L'ÉCRAN DE CHARGEMENT
// ==========================================
function startLoading(destinationKey) {
    playRetroBeep(150, 0.1);

    const introSection = document.getElementById("intro-section");
    const loadingScreen = document.getElementById("loading-screen");
    const loadingBar = document.getElementById("loading-bar");
    const loadingPercent = document.getElementById("loading-percent");
    const loadingMessage = document.getElementById("loading-message");

    // Masquer le curseur du footer pendant le chargement
    footerCursor.style.display = "none";

    introSection.style.display = "none";
    choices.style.display = "none";

    loadingScreen.style.display = "block";
    footerStatus.textContent = "SYSTEM BUSY // LOADING MODULE...";

    let progress = 0;

    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 14) + 5;

        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            loadingMessage.textContent = "ACCESS GRANTED. REDIRECTING...";

            setTimeout(() => {
                const targetUrl = routes[destinationKey];
                if (targetUrl) {
                     window.location.href = targetUrl;
                    console.log("Redirection vers : " + targetUrl);
                }
            }, 500);
        } else if (progress > 65) {
            loadingMessage.textContent = "DECRYPTING FINANCIAL DATA...";
        } else if (progress > 30) {
            loadingMessage.textContent = "ESTABLISHING SECURE HANDSHAKE...";
        }

        loadingBar.style.width = progress + "%";
        loadingPercent.textContent = progress + "%";

    }, 180);
}
