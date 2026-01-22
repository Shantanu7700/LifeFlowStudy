// Main JavaScript - Home Page
document.addEventListener('DOMContentLoaded', function() {
    // Timer Elements
    const timerDisplay = document.getElementById('timerDisplay');
    const timerHours = document.getElementById('timerHours');
    const timerMinutes = document.getElementById('timerMinutes');
    const timerSeconds = document.getElementById('timerSeconds');
    const startBtn = document.getElementById('startTimerBtn');
    const pauseBtn = document.getElementById('pauseTimerBtn');
    const stopBtn = document.getElementById('stopTimerBtn');
    const resetBtn = document.getElementById('resetTimerBtn');
    const todayStudyTime = document.getElementById('todayStudyTime');
    const sessionStudyTime = document.getElementById('sessionStudyTime');
    const totalStudyTimeHome = document.getElementById('totalStudyTimeHome');
    
    // Level Elements
    const currentLevel = document.getElementById('currentLevel');
    const levelProgressFill = document.getElementById('levelProgressFill');
    const currentXP = document.getElementById('currentXP');
    const requiredXP = document.getElementById('requiredXP');
    const levelHint = document.getElementById('levelHint');
    
    // Stats Elements
    const folderCount = document.getElementById('folderCount');
    const videoCount = document.getElementById('videoCount');
    const noteCount = document.getElementById('noteCount');
    const xpCount = document.getElementById('xpCount');
    const recentActivityList = document.getElementById('recentActivityList');
    
    // Timer Variables
    let timer = {
        startTime: 0,
        elapsedTime: 0,
        timerInterval: null,
        isRunning: false,
        isPaused: false
    };
    
    // User Data
    let userData = {
        level: 'Seed',
        xp: 0,
        totalStudyTime: 0,
        todayStudyTime: 0,
        lastStudyDate: null
    };
    
    // Initialize
    initApp();
    
    // Timer Functions
    function initApp() {
        loadUserData();
        updateStats();
        updateLevelDisplay();
        updateRecentActivities();
        updateTimerButtons();
    }
    
    function loadUserData() {
        const saved = localStorage.getItem('userData');
        if (saved) {
            userData = JSON.parse(saved);
        }
        
        // Check if today is new day
        const today = new Date().toDateString();
        if (userData.lastStudyDate !== today) {
            userData.todayStudyTime = 0;
            userData.lastStudyDate = today;
            saveUserData();
        }
        
        // Update displays
        updateTimeDisplays();
    }
    
    function saveUserData() {
        localStorage.setItem('userData', JSON.stringify(userData));
    }
    
    function updateTimeDisplays() {
        // Format time displays
        const formatTime = (seconds) => {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            
            if (hours > 0) {
                return `${hours}h ${minutes}m`;
            }
            return `${minutes}m`;
        };
        
        todayStudyTime.textContent = formatTime(userData.todayStudyTime);
        totalStudyTimeHome.textContent = formatTime(userData.totalStudyTime);
        sessionStudyTime.textContent = '0m';
    }
    
    // Timer Controls
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    stopBtn.addEventListener('click', stopTimer);
    resetBtn.addEventListener('click', resetTimer);
    
    function startTimer() {
        if (!timer.isRunning) {
            timer.startTime = Date.now() - timer.elapsedTime;
            timer.isRunning = true;
            timer.isPaused = false;
            
            timer.timerInterval = setInterval(updateTimer, 1000);
            updateTimerButtons();
            
            // Add activity
            addActivity('Started study timer');
        }
    }
    
    function pauseTimer() {
        if (timer.isRunning && !timer.isPaused) {
            clearInterval(timer.timerInterval);
            timer.isPaused = true;
            updateTimerButtons();
            
            // Add activity
            addActivity('Paused study timer');
        }
    }
    
    function stopTimer() {
        if (timer.isRunning) {
            clearInterval(timer.timerInterval);
            
            // Calculate session time
            const sessionSeconds = Math.floor(timer.elapsedTime / 1000);
            
            // Update user data
            userData.todayStudyTime += sessionSeconds;
            userData.totalStudyTime += sessionSeconds;
            
            // Award XP
            awardXP(sessionSeconds);
            
            // Save and update
            saveUserData();
            updateTimeDisplays();
            updateStats();
            
            // Reset timer
            timer.elapsedTime = 0;
            timer.isRunning = false;
            timer.isPaused = false;
            updateTimerDisplay();
            updateTimerButtons();
            
            // Add activity
            addActivity(`Studied for ${Math.floor(sessionSeconds / 60)} minutes`);
            
            // Show notification
            showNotification(`Study completed! +${Math.floor(sessionSeconds / 60)} XP earned`);
        }
    }
    
    function resetTimer() {
        clearInterval(timer.timerInterval);
        timer.elapsedTime = 0;
        timer.isRunning = false;
        timer.isPaused = false;
        updateTimerDisplay();
        updateTimerButtons();
        sessionStudyTime.textContent = '0m';
    }
    
    function updateTimer() {
        timer.elapsedTime = Date.now() - timer.startTime;
        updateTimerDisplay();
        
        // Update session time
        const sessionSeconds = Math.floor(timer.elapsedTime / 1000);
        const minutes = Math.floor(sessionSeconds / 60);
        sessionStudyTime.textContent = `${minutes}m`;
    }
    
    function updateTimerDisplay() {
        const totalSeconds = Math.floor(timer.elapsedTime / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        timerHours.textContent = hours.toString().padStart(2, '0');
        timerMinutes.textContent = minutes.toString().padStart(2, '0');
        timerSeconds.textContent = seconds.toString().padStart(2, '0');
    }
    
    function updateTimerButtons() {
        startBtn.disabled = timer.isRunning && !timer.isPaused;
        pauseBtn.disabled = !timer.isRunning || timer.isPaused;
        stopBtn.disabled = !timer.isRunning;
        
        // Update button states
        startBtn.style.opacity = startBtn.disabled ? '0.5' : '1';
        pauseBtn.style.opacity = pauseBtn.disabled ? '0.5' : '1';
        stopBtn.style.opacity = stopBtn.disabled ? '0.5' : '1';
        
        startBtn.style.cursor = startBtn.disabled ? 'not-allowed' : 'pointer';
        pauseBtn.style.cursor = pauseBtn.disabled ? 'not-allowed' : 'pointer';
        stopBtn.style.cursor = stopBtn.disabled ? 'not-allowed' : 'pointer';
    }
    
    // XP and Level System
    function awardXP(seconds) {
        const xpEarned = Math.floor(seconds / 60); // 1 XP per minute
        userData.xp += xpEarned;
        
        // Check level up
        checkLevelUp();
        
        // Update displays
        updateLevelDisplay();
        saveUserData();
    }
    
    function checkLevelUp() {
        const levels = [
            { name: 'Seed', xpRequired: 0 },
            { name: 'Sprout', xpRequired: 100 },
            { name: 'Plant', xpRequired: 500 },
            { name: 'Tree', xpRequired: 2000 }
        ];
        
        let newLevel = userData.level;
        for (let i = levels.length - 1; i >= 0; i--) {
            if (userData.xp >= levels[i].xpRequired) {
                newLevel = levels[i].name;
                break;
            }
        }
        
        // Level up notification
        if (newLevel !== userData.level) {
            userData.level = newLevel;
            showNotification(`🎉 Level Up! You are now ${newLevel}`);
            
            // Add activity
            addActivity(`Reached ${newLevel} level`);
        }
    }
    
    function updateLevelDisplay() {
        const levels = {
            'Seed': { xpRequired: 100, next: 'Sprout' },
            'Sprout': { xpRequired: 500, next: 'Plant' },
            'Plant': { xpRequired: 2000, next: 'Tree' },
            'Tree': { xpRequired: 0, next: 'Master' }
        };
        
        currentLevel.textContent = userData.level;
        xpCount.textContent = userData.xp;
        
        const levelInfo = levels[userData.level];
        if (levelInfo.xpRequired > 0) {
            const progress = Math.min((userData.xp / levelInfo.xpRequired) * 100, 100);
            levelProgressFill.style.width = `${progress}%`;
            currentXP.textContent = userData.xp;
            requiredXP.textContent = levelInfo.xpRequired;
            levelHint.textContent = `Earn ${levelInfo.xpRequired - userData.xp} more XP to reach ${levelInfo.next} level`;
        } else {
            levelProgressFill.style.width = '100%';
            currentXP.textContent = userData.xp;
            requiredXP.textContent = '∞';
            levelHint.textContent = 'You have reached the highest level!';
        }
    }
    
    // Stats Functions
    function updateStats() {
        // Load data from storage
        const folders = JSON.parse(localStorage.getItem('studyFolders') || '[]');
        const videos = JSON.parse(localStorage.getItem('videos') || '[]');
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        
        // Update counts
        folderCount.textContent = folders.length;
        videoCount.textContent = videos.length;
        noteCount.textContent = notes.length;
        xpCount.textContent = userData.xp;
    }
    
    function addActivity(text) {
        const activities = JSON.parse(localStorage.getItem('activities') || '[]');
        
        activities.unshift({
            text: text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString(),
            icon: getActivityIcon(text)
        });
        
        // Keep only last 10 activities
        if (activities.length > 10) {
            activities.pop();
        }
        
        localStorage.setItem('activities', JSON.stringify(activities));
        updateRecentActivities();
    }
    
    function getActivityIcon(text) {
        if (text.includes('timer')) return 'fas fa-clock';
        if (text.includes('Studied')) return 'fas fa-graduation-cap';
        if (text.includes('Level')) return 'fas fa-trophy';
        if (text.includes('upload')) return 'fas fa-upload';
        if (text.includes('folder')) return 'fas fa-folder-plus';
        return 'fas fa-check-circle';
    }
    
    function updateRecentActivities() {
        const activities = JSON.parse(localStorage.getItem('activities') || '[]');
        
        if (activities.length === 0) {
            recentActivityList.innerHTML = `
                <div class="empty-activity">
                    <i class="fas fa-calendar-plus"></i>
                    <p>Start studying to see your activities here!</p>
                </div>
            `;
            return;
        }
        
        recentActivityList.innerHTML = activities.slice(0, 3).map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-details">
                    <p>${activity.text}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }
    
    function showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 1rem;
            right: 1rem;
            background: var(--surface);
            color: var(--text-primary);
            padding: 1rem 1.25rem;
            border-radius: var(--radius);
            box-shadow: var(--shadow-lg);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            z-index: 10000;
            border: 1px solid var(--border);
            animation: slideIn 0.3s ease;
            max-width: 20rem;
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Initialize timer buttons
    updateTimerButtons();
    
    // Update stats every minute
    setInterval(updateStats, 60000);
});