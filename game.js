// Game state
let state = {
    clicks: 0,
    misses: 0,
    language: 'en',
    darkMode: false
};

// Cheese evolution stages
const CHEESE_STAGES = [
    { threshold: 0, url: 'https://listonic.com/phimageproxy/listonic/products/cheddar_cheese.webp' },
    { threshold: 100, url: 'https://cdn.sanity.io/images/5dqbssss/production-v3/75615e15312e422a64b38fa4108d382f415fd0e5-1415x2000.png' },
    { threshold: 250, url: 'https://www.sargento.com/assets/40059_SH_Prmsn_5oz_Fn_5504642_QrtrRght.png' },
    { threshold: 500, url: 'https://frankandsal.com/cdn/shop/products/italian-cheese-buy-grana-padano-aged-over-18-months-shipped-free-4_2000x.png?v=1551200458' }
];

// DOM Elements
const cheese = document.getElementById('cheese');
const cheeseContainer = document.querySelector('.cheese-container');
const missMessage = document.getElementById('missMessage');
const clickCounter = document.getElementById('clickCounter');
const missCounter = document.getElementById('missCounter');
const resetBtn = document.getElementById('resetBtn');
const darkModeBtn = document.getElementById('darkModeBtn');
const languageBtn = document.getElementById('languageBtn');

// Load saved state
function loadState() {
    const savedState = localStorage.getItem('cheeseClickerState');
    if (savedState) {
        state = { ...state, ...JSON.parse(savedState) };
    }
    updateUI();
    updateCheeseStage();
    updateDarkMode();
    darkModeBtn.textContent = state.darkMode ? '☀️' : '🌙';
    languageBtn.textContent = state.language === 'en' ? '🇬🇧' : '🇮🇹';
}

// Save state
function saveState() {
    localStorage.setItem('cheeseClickerState', JSON.stringify(state));
}

// Update UI text based on language
function updateUI() {
    resetBtn.textContent = translations[state.language].reset;
    darkModeBtn.textContent = translations[state.language].darkMode;
    languageBtn.textContent = translations[state.language].language;
    clickCounter.textContent = `${translations[state.language].clicks}${state.clicks}`;
    missCounter.textContent = `${translations[state.language].misses}${state.misses}`;
}

// Update cheese image based on clicks
function updateCheeseStage() {
    for (let i = CHEESE_STAGES.length - 1; i >= 0; i--) {
        if (state.clicks >= CHEESE_STAGES[i].threshold) {
            cheese.src = CHEESE_STAGES[i].url;
            break;
        }
    }
}

// Parallax effect
function handleParallax(e) {
    const rect = cheeseContainer.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const moveX = (e.clientX - centerX) / 30;
    const moveY = (e.clientY - centerY) / 30;
    
    cheeseContainer.style.transform = `translate(${moveX}px, ${moveY}px)`;
}

// Create and animate click message
function showClickMessage(x, y) {
    const message = document.createElement('div');
    message.className = 'click-message';
    message.style.left = `${x}px`;
    message.style.top = `${y}px`;
    message.textContent = clickMessages[state.language][Math.floor(Math.random() * clickMessages[state.language].length)];
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 500);
}

// Show miss message
function showMissMessage() {
    const message = missMessages[state.language][Math.floor(Math.random() * missMessages[state.language].length)];
    missMessage.textContent = message;
    missMessage.style.opacity = '1';
    setTimeout(() => {
        missMessage.style.opacity = '0';
    }, 2000);
}

// Handle cheese click
function handleCheeseClick(e) {
    e.stopPropagation();
    state.clicks++;
    
    // Add click animation
    cheese.classList.add('cheese-clicked');
    setTimeout(() => cheese.classList.remove('cheese-clicked'), 100);
    
    showClickMessage(e.pageX, e.pageY);
    updateCheeseStage();
    updateUI();
    saveState();
}

// Handle miss click
function handleMissClick() {
    state.misses++;
    showMissMessage();
    updateUI();
    saveState();
}

// Create modal
function createModal(message, scale = 1) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.transform = `scale(${scale})`;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'modal-message';
    messageDiv.textContent = message;
    
    const buttons = document.createElement('div');
    buttons.className = 'modal-buttons';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'modal-btn cancel';
    cancelBtn.textContent = state.language === 'en' ? 'No' : 'No';
    
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'modal-btn confirm';
    confirmBtn.textContent = state.language === 'en' ? 'Yes' : 'Sì';
    
    buttons.appendChild(cancelBtn);
    buttons.appendChild(confirmBtn);
    content.appendChild(messageDiv);
    content.appendChild(buttons);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    
    // Activate modal with slight delay for animation
    setTimeout(() => overlay.classList.add('active'), 10);
    
    return new Promise((resolve) => {
        cancelBtn.addEventListener('click', () => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
            resolve(false);
        });
        
        confirmBtn.addEventListener('click', () => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
            resolve(true);
        });
    });
}

// Reset progress with multiple confirmations
async function resetProgress() {
    let scale = 1;
    for (const message of translations[state.language].resetConfirm) {
        const confirmed = await createModal(message, scale);
        if (!confirmed) return;
        scale += 0.15; // Increase size with each confirmation
    }
    
    state.clicks = 0;
    state.misses = 0;
    updateCheeseStage();
    updateUI();
    saveState();
}

// Toggle dark mode
function toggleDarkMode() {
    state.darkMode = !state.darkMode;
    document.body.classList.toggle('dark-mode');
    darkModeBtn.textContent = state.darkMode ? '☀️' : '🌙';
    saveState();
}

// Toggle language
function toggleLanguage() {
    state.language = state.language === 'en' ? 'it' : 'en';
    languageBtn.textContent = state.language === 'en' ? '🇬🇧' : '🇮🇹';
    updateUI();
    saveState();
}

// Event listeners
window.addEventListener('mousemove', handleParallax);
cheese.addEventListener('click', handleCheeseClick);
document.addEventListener('click', handleMissClick);
resetBtn.addEventListener('click', resetProgress);
darkModeBtn.addEventListener('click', toggleDarkMode);
languageBtn.addEventListener('click', toggleLanguage);

// Initialize game
function updateDarkMode() {
    if (state.darkMode) {
        document.body.classList.add('dark-mode');
    }
}

// Start the game
loadState(); 