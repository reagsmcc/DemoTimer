// script.js (Replace ALL content with this code)

const TOPICS = [
    // ... (Your Topic list remains the same)
    "Inbound Voice", "Chat", "SMS 1:1", "Email", "Whatsapp", "Other",
    "Navigator", "Identity", "Guardian", "Workspace Designer", "Copilot",
    "Knowledge Management", "Autopilot", "Multi-Agent Orchestration",
    "Video/ Cobrowse", "Cases", "Integrations", "Client 360", "Online Banking",
    "CRM", "UCaaS", "Other (please specify)", "Builder Automations",
    "Outbound: Automated Notifications", "Proactive Notifications",
    "Native Preview Dialer", "Talkdesk Dialer for Salesforce",
    "Noetica Advanced Dialer", "Quality Management", "Feedback",
    "Performance Management", "WFM", "Live", "Explore", "Studio", "Admin"
];

// Helper variables
let demoQueue = []; 
let currentTopicIndex = -1;
let countdownInterval = null;
let totalTimeSeconds = 0;
let remainingTimeSeconds = 0;

// --- DOM ELEMENT REFERENCES ---
const startButton = document.getElementById('start-demo-btn');
const resetButton = document.getElementById('reset-times-btn');
const topicForm = document.getElementById('topic-form');
const topicNameDisplay = document.getElementById('current-topic-name');
const totalMinutesDisplay = document.getElementById('total-minutes');
const embeddedTimeDisplay = document.getElementById('embedded-time');

// For the Full-Screen Display in the second tab
const fullScreenIndicator = document.getElementById('visual-indicator');
const screenTimerText = document.getElementById('screen-timer-text');
const screenTopicText = document.getElementById('screen-topic-text');
const timerScreenDiv = document.getElementById('timer-screen'); // The full-screen background div

// --- INITIAL SETUP AND UTILITIES ---

function calculateTotalTime() {
    let totalMinutes = 0;
    const timeInputs = document.querySelectorAll('.time-input');
    timeInputs.forEach(input => {
        const duration = parseInt(input.value) || 0;
        const isChecked = input.parentElement.querySelector('input[type="checkbox"]').checked;
        if (isChecked && duration > 0) {
            totalMinutes += duration;
        }
    });
    totalMinutesDisplay.textContent = totalMinutes;
}

function generateTopicChecklist() {
    TOPICS.forEach(topic => {
        const div = document.createElement('div');
        div.classList.add('topic-item');
        div.innerHTML = `
            <div class="topic-name-wrap">
                <input type="checkbox" id="check-${topic}" name="topic-check" value="${topic}">
                <label for="check-${topic}">${topic}</label>
            </div>
            <input type="number" id="time-${topic}" class="time-input" value="0" min="0" required>
            <span>min</span>
        `;
        topicForm.appendChild(div);
    });

    topicForm.addEventListener('change', calculateTotalTime);
    topicForm.addEventListener('input', calculateTotalTime);
}

function resetAllTimes() {
    const timeInputs = document.querySelectorAll('.time-input');
    timeInputs.forEach(input => {
        input.value = "0";
        input.parentElement.querySelector('input[type="checkbox"]').checked = false;
    });
    calculateTotalTime();
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// --- TIMER LOGIC ---

// NEW COLOR THRESHOLDS: Green (> 60s), Yellow (10s to 60s), Red (< 10s)
function updateVisualIndicator(remaining) {
    timerScreenDiv.className = 'full-screen-display'; // Reset base class

    if (remaining <= 10) {
        return 'red';      // RED: 10 seconds or less
    } else if (remaining <= 60) {
        return 'yellow';   // YELLOW: 1 minute (60 seconds) or less
    } else {
        return 'green';    // GREEN: More than 1 minute
    }
}

function updateDisplays(topicName, timeString, colorClass) {
    // 1. Embedded Control Panel Display
    topicNameDisplay.textContent = topicName;
    embeddedTimeDisplay.textContent = timeString;

    // 2. Full-Screen Timer Display (updates only if the second screen is viewing this page)
    fullScreenIndicator.className = colorClass;
    screenTimerText.textContent = timeString;
    screenTopicText.textContent = topicName;
}

function runCountdown() {
    remainingTimeSeconds--;

    const timeString = formatTime(Math.max(0, remainingTimeSeconds));
    const colorClass = updateVisualIndicator(remainingTimeSeconds);
    
    updateDisplays(demoQueue[currentTopicIndex].name, timeString, colorClass);

    if (remainingTimeSeconds <= 0) {
        clearInterval(countdownInterval);
        
        // ** MOVE TO NEXT TOPIC **
        currentTopicIndex++;
        if (currentTopicIndex < demoQueue.length) {
            startTimer(demoQueue[currentTopicIndex].name, demoQueue[currentTopicIndex].duration);
        } else {
            // Demo sequence finished
            updateDisplays("DEMO SEQUENCE COMPLETE!", "00:00", 'time-up');
        }
    }
}

function startTimer(topicName, durationMinutes) {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    totalTimeSeconds = durationMinutes * 60;
    remainingTimeSeconds = totalTimeSeconds;
    
    // Safety check (shouldn't be needed with queue logic, but good practice)
    if (totalTimeSeconds <= 0) {
        currentTopicIndex++; 
        if (currentTopicIndex < demoQueue.length) {
             startTimer(demoQueue[currentTopicIndex].name, demoQueue[currentTopicIndex].duration);
        }
        return;
    }

    const currentTopicName = `${currentTopicIndex + 1}/${demoQueue.length}: ${topicName}`;
    const initialTimeString = formatTime(remainingTimeSeconds);
    
    updateDisplays(currentTopicName, initialTimeString, updateVisualIndicator(remainingTimeSeconds));

    countdownInterval = setInterval(runCountdown, 1000);
}

function startDemoSequence() {
    demoQueue = []; // Clear the old queue

    // 1. Build the queue from checked topics with time > 0
    const checkedTopics = Array.from(document.querySelectorAll('input[name="topic-check"]:checked'));
    checkedTopics.forEach(checkbox => {
        const topicName = checkbox.value;
        const timeInputId = `time-${topicName}`;
        const duration = parseInt(document.getElementById(timeInputId).value) || 0;
        
        if (duration > 0) {
            demoQueue.push({ name: topicName, duration: duration });
        }
    });

    if (demoQueue.length === 0) {
        alert("Please check topics and ensure they have a time greater than 0 minutes to start the sequence.");
        return;
    }

    // 2. Start the first topic
    currentTopicIndex = 0;
    startTimer(demoQueue[currentTopicIndex].name, demoQueue[currentTopicIndex].duration);
}

// --- EVENT LISTENERS ---

startButton.addEventListener('click', startDemoSequence);
resetButton.addEventListener('click', resetAllTimes);
document.getElementById('open-display-btn').addEventListener('click', () => {
    alert("Open your repository's live URL in a second, maximized browser window (F11) to use the full-screen timer display.");
});

// Run this when the page loads
generateTopicChecklist();
calculateTotalTime(); 

// *** NEW: Check if this is the dedicated display window and hide the control panel ***
if (window.location.search.includes('display=true')) {
    document.getElementById('control-panel').classList.add('hidden');
    timerScreenDiv.classList.remove('hidden');
    // Ensure the body background is black/clean for the display mode
    document.body.style.backgroundColor = 'black'; 
} else {
    timerScreenDiv.classList.add('hidden');
}