let currentMode = 'clock'; // clock, timer, alarm
let timerInterval = null;
let timerSeconds = 0;
let alarmSeconds = 0;
let timerIsRunning = false;
let alarmIsRunning = false;
let isAlarmGoingOff = false;

const displayElements = {
    d1: document.getElementById('digit-1'),
    d2: document.getElementById('digit-2'),
    d3: document.getElementById('digit-3'),
    d4: document.getElementById('digit-4'),
    d5: document.getElementById('digit-5'),
    d6: document.getElementById('digit-6'),
    needle: document.getElementById('seconds-needle'),
    action: document.getElementById('btn-action'),
    reset: document.getElementById('btn-reset'),
    led: document.querySelector('.status-led'),
    separators: document.querySelectorAll('.digit-sep'),
    inputOverlay: document.getElementById('screen-input-overlay'),
    alarmInput: document.getElementById('alarm-input'),
    iconTimer: document.getElementById('icon-timer'),
    iconAlarm: document.getElementById('icon-alarm'),
    display: document.getElementById('display')
};

function updateStatusLED() {
    if (!displayElements.led) return;

    let shouldBeOn = false;
    if (currentMode === 'clock') {
        shouldBeOn = true;
    } else if (currentMode === 'timer') {
        shouldBeOn = timerIsRunning;
    } else if (currentMode === 'alarm') {
        shouldBeOn = alarmIsRunning || isAlarmGoingOff;
    }

    if (shouldBeOn) {
        displayElements.led.classList.add('active');
    } else {
        displayElements.led.classList.remove('active');
    }
}

function updateStatusIcons() {
    if (timerIsRunning) {
        displayElements.iconTimer.classList.remove('hidden');
    } else {
        displayElements.iconTimer.classList.add('hidden');
    }

    if (alarmIsRunning || isAlarmGoingOff) {
        displayElements.iconAlarm.classList.remove('hidden');
        if (isAlarmGoingOff) {
            displayElements.iconAlarm.classList.add('blinking');
        } else {
            displayElements.iconAlarm.classList.remove('blinking');
        }
    } else {
        displayElements.iconAlarm.classList.add('hidden');
        displayElements.iconAlarm.classList.remove('blinking');
    }
}

function updateInfoBar() {
    const now = new Date();
    if (displayElements.info) {
        const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
        const dayStr = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
        displayElements.info.textContent = `${dateStr}, ${dayStr}`;
    }
}

function updateDisplay(val1, val2, val3, val4, val5, val6) {
    displayElements.d1.textContent = val1;
    displayElements.d2.textContent = val2;
    displayElements.d3.textContent = val3;
    displayElements.d4.textContent = val4;
    displayElements.d5.textContent = val5;
    displayElements.d6.textContent = val6;
}

function updateNeedle(seconds) {
    if (!displayElements.needle) return;
    // Map 0-60 seconds to -45% to 45% of the slider area (roughly centered)
    // Or just 0% to 100% for the full width
    const percentage = (seconds % 60) * (100 / 60);
    displayElements.needle.style.left = `${percentage}%`;
}

function formatTwoDigits(num) {
    const s = num.toString().padStart(2, '0');
    return [s[0], s[1]];
}

function tick() {
    const now = new Date();

    // 1. Process Logic (Background)
    if (timerIsRunning) {
        timerSeconds++;
    }

    if (alarmIsRunning) {
        if (alarmSeconds > 0) {
            alarmSeconds--;
        } else {
            alarmIsRunning = false;
            isAlarmGoingOff = true;
        }
    }

    // 2. Update Current Mode Display
    if (currentMode === 'clock') {
        const h = formatTwoDigits(now.getHours());
        const m = formatTwoDigits(now.getMinutes());
        const s = formatTwoDigits(now.getSeconds());
        updateDisplay(h[0], h[1], m[0], m[1], s[0], s[1]);
        updateNeedle(now.getSeconds());
        if (now.getSeconds() === 0) updateInfoBar();
    } else if (currentMode === 'timer') {
        const hours = Math.floor(timerSeconds / 3600);
        const mins = Math.floor((timerSeconds % 3600) / 60);
        const secs = timerSeconds % 60;
        const h = formatTwoDigits(hours % 100);
        const m = formatTwoDigits(mins);
        const s = formatTwoDigits(secs);
        updateDisplay(h[0], h[1], m[0], m[1], s[0], s[1]);
        updateNeedle(secs);
    } else if (currentMode === 'alarm') {
        const hours = Math.floor(alarmSeconds / 3600);
        const mins = Math.floor((alarmSeconds % 3600) / 60);
        const secs = alarmSeconds % 60;
        const h = formatTwoDigits(hours % 100);
        const m = formatTwoDigits(mins);
        const s = formatTwoDigits(secs);
        updateDisplay(h[0], h[1], m[0], m[1], s[0], s[1]);
        updateNeedle(secs);
    }

    // Main display blinking should ONLY happen if we are currently looking at the alarm mode
    if (currentMode === 'alarm' && isAlarmGoingOff) {
        displayElements.display.classList.add('blink');
    } else {
        displayElements.display.classList.remove('blink');
    }

    // 3. Global UI
    updateStatusLED();
    updateStatusIcons();
}

function setMode(mode) {
    currentMode = mode;

    // UI Update
    document.querySelectorAll('.mode-link').forEach(link => link.classList.remove('active'));
    document.getElementById(`mode-${mode}`).classList.add('active');

    if (mode === 'clock') {
        tick();
    } else if (mode === 'timer') {
        const hours = Math.floor(timerSeconds / 3600);
        const mins = Math.floor((timerSeconds % 3600) / 60);
        const secs = timerSeconds % 60;
        const h = formatTwoDigits(hours % 100);
        const m = formatTwoDigits(mins);
        const s = formatTwoDigits(secs);
        updateDisplay(h[0], h[1], m[0], m[1], s[0], s[1]);
        updateNeedle(secs);
    } else if (mode === 'alarm') {
        const hours = Math.floor(alarmSeconds / 3600);
        const mins = Math.floor((alarmSeconds % 3600) / 60);
        const secs = alarmSeconds % 60;
        const h = formatTwoDigits(hours % 100);
        const m = formatTwoDigits(mins);
        const s = formatTwoDigits(secs);
        updateDisplay(h[0], h[1], m[0], m[1], s[0], s[1]);
        updateNeedle(secs);
    }
    updateStatusLED();
    updateStatusIcons();
}

function handleAction() {
    if (currentMode === 'clock') return;

    if (currentMode === 'timer') {
        timerIsRunning = !timerIsRunning;
    } else if (currentMode === 'alarm') {
        if (isAlarmGoingOff) {
            stopAlarm();
        } else if (alarmSeconds === 0) {
            showInputDialog();
        } else {
            alarmIsRunning = !alarmIsRunning;
        }
    }
    updateStatusLED();
    updateStatusIcons();
}

function handleReset() {
    if (currentMode === 'clock') return;

    if (currentMode === 'alarm') {
        if (isAlarmGoingOff) {
            stopAlarm();
            alarmSeconds = 0;
            updateDisplay('0', '0', '0', '0', '0', '0');
            updateNeedle(0);
        } else if (alarmSeconds > 0) {
            alarmIsRunning = false;
            alarmSeconds = 0;
            updateDisplay('0', '0', '0', '0', '0', '0');
            updateNeedle(0);
        } else {
            showInputDialog();
        }
    } else if (currentMode === 'timer') {
        timerIsRunning = false;
        timerSeconds = 0;
        updateDisplay('0', '0', '0', '0', '0', '0');
        updateNeedle(0);
    }
    updateStatusLED();
    updateStatusIcons();
}

function stopAlarm() {
    alarmIsRunning = false;
    isAlarmGoingOff = false;
    displayElements.display.classList.remove('blink');
    updateStatusLED();
    updateStatusIcons();
}

function showInputDialog() {
    if (displayElements.inputOverlay) {
        displayElements.inputOverlay.classList.remove('hidden');
        displayElements.alarmInput.focus();
        displayElements.alarmInput.value = ""; // Reset input
    }
}

function hideInputDialog() {
    if (displayElements.inputOverlay) {
        displayElements.inputOverlay.classList.add('hidden');
    }
}

function submitAlarmTime() {
    const mins = parseInt(displayElements.alarmInput.value);
    if (!isNaN(mins) && mins > 0) {
        alarmSeconds = mins * 60;
        const h = formatTwoDigits(Math.floor(mins / 60));
        const m = formatTwoDigits(mins % 60);
        updateDisplay(h[0], h[1], m[0], m[1], '0', '0');
        hideInputDialog();
        updateStatusLED();
        updateStatusIcons();
    } else {
        // Simple shake or visual feedback could go here
        displayElements.alarmInput.style.border = "2px solid red";
        setTimeout(() => {
            displayElements.alarmInput.style.border = "none";
        }, 500);
    }
}

// Initial setup
setInterval(tick, 1000);
setMode('clock');
updateInfoBar();

// Theme Toggle Logic
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

const sunIcon = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
const moonIcon = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';

function applyTheme(isDark) {
    if (isDark) {
        document.body.setAttribute('data-theme', 'dark');
        themeIcon.innerHTML = sunIcon;
    } else {
        document.body.removeAttribute('data-theme');
        themeIcon.innerHTML = moonIcon;
    }
}

// Media query to check system preference
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Apply the initial theme based on the system preference
applyTheme(prefersDarkScheme.matches);

// Listen for subsequent changes in the system theme
prefersDarkScheme.addEventListener('change', (e) => {
    applyTheme(e.matches);
});

// Manual manual toggling
themeToggleBtn.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    applyTheme(!isDark);
});
