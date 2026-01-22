// Profile Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const clearCacheBtn = document.getElementById('clearCacheBtn');
    const deleteAllDataBtn = document.getElementById('deleteAllDataBtn');
    const exportDataBtn = document.getElementById('exportDataBtn');
    const clearActivityBtn = document.getElementById('clearActivityBtn');
    const activityList = document.getElementById('activityList');
    
    // Settings elements
    const darkModeToggle = document.getElementById('darkModeToggle');
    const autoPlayToggle = document.getElementById('autoPlayToggle');
    const remindersToggle = document.getElementById('remindersToggle');
    const videoQuality = document.getElementById('videoQuality');
    const downloadLocation = document.getElementById('downloadLocation');
    const cacheAutoDelete = document.getElementById('cacheAutoDelete');
    
    // Profile elements
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userXP = document.getElementById('userXP');
    const userLevelProgress = document.getElementById('userLevelProgress');
    const avatarLevel = document.getElementById('avatarLevel');
    const levelText = document.getElementById('levelText');
    
    // Storage elements
    const totalStorage = document.getElementById('totalStorage');
    const storageUsed = document.getElementById('storageUsed');
    const storageFree = document.getElementById('storageFree');
    const storageUsedFill = document.getElementById('storageUsedFill');
    const videoStorage = document.getElementById('videoStorage');
    const pdfStorage = document.getElementById('pdfStorage');
    const appStorage = document.getElementById('appStorage');
    const videoPercent = document.getElementById('videoPercent');
    const pdfPercent = document.getElementById('pdfPercent');
    const appPercent = document.getElementById('appPercent');
    
    // Stats elements
    const totalStudyTime = document.getElementById('totalStudyTime');
    const todayStudyChange = document.getElementById('todayStudyChange');
    const totalFolders = document.getElementById('totalFolders');
    const activeFolders = document.getElementById('activeFolders');
    const totalVideos = document.getElementById('totalVideos');
    const totalVideoSize = document.getElementById('totalVideoSize');
    const totalNotes = document.getElementById('totalNotes');
    const totalNoteSize = document.getElementById('totalNoteSize');
    
    // Goals elements
    const goalsList = document.getElementById('goalsList');
    
    // Profile Edit Modal Elements
    let profileEditModal = null;
    let avatarUpload = null;
    let nameInput = null;
    let emailInput = null;
    
    // Initialize
    initProfile();
    
    // Event Listeners
    settingsBtn?.addEventListener('click', openSettings);
    closeSettingsBtn?.addEventListener('click', () => hideModal(settingsModal));
    saveSettingsBtn?.addEventListener('click', saveSettings);
    clearCacheBtn?.addEventListener('click', clearCache);
    deleteAllDataBtn?.addEventListener('click', deleteAllData);
    exportDataBtn?.addEventListener('click', exportData);
    clearActivityBtn?.addEventListener('click', clearActivities);
    
    // Profile edit listeners
    userAvatar?.addEventListener('click', createProfileEditModal);
    userName?.addEventListener('click', createProfileEditModal);
    userEmail?.addEventListener('click', createProfileEditModal);
    
    // Settings modal close on outside click
    settingsModal?.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            hideModal(settingsModal);
        }
    });
    
    // Functions
    function initProfile() {
        loadUserData();
        loadSettings();
        updateProfileInfo();
        updateStorageInfo();
        updateStats();
        loadActivities();
        loadGoals();
    }
    
    function loadUserData() {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const profile = JSON.parse(localStorage.getItem('profile') || '{}');
        
        // Set user info
        userName.textContent = profile.name || 'Study Learner';
        userEmail.textContent = profile.email || 'student@lifeflow.com';
        userXP.textContent = userData.xp || 0;
        
        // Set avatar level
        avatarLevel.textContent = userData.level || 'Seed';
        
        // Update level progress
        updateLevelProgress(userData.xp || 0, userData.level || 'Seed');
    }
    
    function updateLevelProgress(xp, level) {
        const levels = {
            'Seed': { xpRequired: 0, next: 'Sprout' },
            'Sprout': { xpRequired: 100, next: 'Plant' },
            'Plant': { xpRequired: 500, next: 'Tree' },
            'Tree': { xpRequired: 2000, next: 'Master' }
        };
        
        const levelInfo = levels[level];
        if (levelInfo.xpRequired > 0) {
            const progress = Math.min((xp / levelInfo.xpRequired) * 100, 100);
            userLevelProgress.style.width = `${progress}%`;
            levelText.textContent = `${Math.round(progress)}% to ${levelInfo.next}`;
        } else {
            userLevelProgress.style.width = '100%';
            levelText.textContent = 'Maximum level reached!';
        }
    }
    
    function updateProfileInfo() {
        // Load profile picture if exists
        const profilePic = localStorage.getItem('profilePic');
        if (profilePic) {
            userAvatar.innerHTML = `<img src="${profilePic}" alt="Profile">`;
        }
    }
    
    function updateStorageInfo() {
        // Load data
        const videos = JSON.parse(localStorage.getItem('videos') || '[]');
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        const folders = JSON.parse(localStorage.getItem('studyFolders') || '[]');
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const activities = JSON.parse(localStorage.getItem('activities') || '[]');
        const profile = JSON.parse(localStorage.getItem('profile') || '{}');
        const settings = JSON.parse(localStorage.getItem('settings') || '{}');
        
        // Calculate storage
        let videoSize = 0;
        videos.forEach(video => videoSize += video.size);
        
        let pdfSize = 0;
        notes.forEach(note => pdfSize += note.size);
        
        // Calculate app data size (approximate)
        const appDataSize = 
            JSON.stringify(folders).length +
            JSON.stringify(userData).length +
            JSON.stringify(activities).length +
            JSON.stringify(profile).length +
            JSON.stringify(settings).length;
        
        const totalUsed = videoSize + pdfSize + appDataSize;
        const TOTAL_STORAGE = 100 * 1024 * 1024 * 1024; // 100GB
        
        // Update display
        totalStorage.textContent = '100 GB';
        storageUsed.textContent = formatFileSize(totalUsed);
        storageFree.textContent = formatFileSize(TOTAL_STORAGE - totalUsed);
        
        const usedPercentage = (totalUsed / TOTAL_STORAGE) * 100;
        storageUsedFill.style.width = `${Math.min(usedPercentage, 100)}%`;
        
        videoStorage.textContent = formatFileSize(videoSize);
        pdfStorage.textContent = formatFileSize(pdfSize);
        appStorage.textContent = formatFileSize(appDataSize);
        
        // Calculate percentages
        if (totalUsed > 0) {
            videoPercent.textContent = `${Math.round((videoSize / totalUsed) * 100)}%`;
            pdfPercent.textContent = `${Math.round((pdfSize / totalUsed) * 100)}%`;
            appPercent.textContent = `${Math.round((appDataSize / totalUsed) * 100)}%`;
        } else {
            videoPercent.textContent = '0%';
            pdfPercent.textContent = '0%';
            appPercent.textContent = '0%';
        }
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function updateStats() {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const folders = JSON.parse(localStorage.getItem('studyFolders') || '[]');
        const videos = JSON.parse(localStorage.getItem('videos') || '[]');
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        
        // Study time
        const totalSeconds = userData.totalStudyTime || 0;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        totalStudyTime.textContent = `${hours}h ${minutes}m`;
        
        const todaySeconds = userData.todayStudyTime || 0;
        todayStudyChange.textContent = `Today: ${Math.floor(todaySeconds / 60)}m`;
        
        // Folders
        totalFolders.textContent = folders.length;
        const activeFolderCount = folders.filter(f => {
            const folderVideos = videos.filter(v => v.folderId === f.id);
            const folderNotes = notes.filter(n => n.folderId === f.id);
            return folderVideos.length > 0 || folderNotes.length > 0;
        }).length;
        activeFolders.textContent = `Active: ${activeFolderCount}`;
        
        // Videos
        totalVideos.textContent = videos.length;
        let videoSize = 0;
        videos.forEach(video => videoSize += video.size);
        totalVideoSize.textContent = `Size: ${formatFileSize(videoSize)}`;
        
        // Notes
        totalNotes.textContent = notes.length;
        let noteSize = 0;
        notes.forEach(note => noteSize += note.size);
        totalNoteSize.textContent = `Size: ${formatFileSize(noteSize)}`;
    }
    
    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('settings') || '{}');
        
        // Apply settings
        if (darkModeToggle) darkModeToggle.checked = settings.darkMode || false;
        if (autoPlayToggle) autoPlayToggle.checked = settings.autoPlay !== false;
        if (remindersToggle) remindersToggle.checked = settings.reminders || false;
        if (videoQuality) videoQuality.value = settings.videoQuality || 'auto';
        if (downloadLocation) downloadLocation.value = settings.downloadLocation || 'device';
        if (cacheAutoDelete) cacheAutoDelete.value = settings.cacheAutoDelete || '30';
    }
    
    function saveSettings() {
        const settings = {
            darkMode: darkModeToggle?.checked || false,
            autoPlay: autoPlayToggle?.checked !== false,
            reminders: remindersToggle?.checked || false,
            videoQuality: videoQuality?.value || 'auto',
            downloadLocation: downloadLocation?.value || 'device',
            cacheAutoDelete: cacheAutoDelete?.value || '30',
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('settings', JSON.stringify(settings));
        
        // Apply dark mode if changed
        if (settings.darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }
        
        hideModal(settingsModal);
        showNotification('Settings saved successfully!');
    }
    
    function clearCache() {
        if (!confirm('Clear cache? This will remove temporary files but keep your study data.')) {
            return;
        }
        
        // Clear blob URLs
        const videos = JSON.parse(localStorage.getItem('videos') || '[]');
        videos.forEach(video => {
            if (video.url && video.url.startsWith('blob:')) {
                URL.revokeObjectURL(video.url);
            }
        });
        
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        notes.forEach(note => {
            if (note.url && note.url.startsWith('blob:')) {
                URL.revokeObjectURL(note.url);
            }
        });
        
        // Clear localStorage cache (keep main data)
        const keysToKeep = [
            'studyFolders', 'videos', 'notes', 'userData', 
            'activities', 'profile', 'settings', 'theme'
        ];
        
        Object.keys(localStorage).forEach(key => {
            if (!keysToKeep.includes(key)) {
                localStorage.removeItem(key);
            }
        });
        
        showNotification('Cache cleared successfully!');
        updateStorageInfo();
    }
    
    function deleteAllData() {
        if (!confirm('⚠️ DANGER: This will delete ALL your data including folders, videos, notes, and progress. This cannot be undone!')) {
            return;
        }
        
        if (!confirm('Are you absolutely sure? Type "DELETE" to confirm.')) {
            return;
        }
        
        const confirmation = prompt('Type DELETE to confirm:');
        if (confirmation !== 'DELETE') {
            alert('Cancelled. Your data is safe.');
            return;
        }
        
        // Clear all localStorage
        localStorage.clear();
        
        // Clear sessionStorage
        sessionStorage.clear();
        
        // Reload the page
        alert('All data has been deleted. The app will now reload.');
        window.location.href = 'index.html';
    }
    
    function exportData() {
        // Collect all data
        const exportData = {
            studyFolders: JSON.parse(localStorage.getItem('studyFolders') || '[]'),
            videos: JSON.parse(localStorage.getItem('videos') || '[]'),
            notes: JSON.parse(localStorage.getItem('notes') || '[]'),
            userData: JSON.parse(localStorage.getItem('userData') || '{}'),
            activities: JSON.parse(localStorage.getItem('activities') || '[]'),
            profile: JSON.parse(localStorage.getItem('profile') || '{}'),
            settings: JSON.parse(localStorage.getItem('settings') || '{}'),
            exportDate: new Date().toISOString()
        };
        
        // Create download
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `life-flow-backup-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        showNotification('Data exported successfully!');
    }
    
    function loadActivities() {
        const activities = JSON.parse(localStorage.getItem('activities') || '[]');
        
        if (activities.length === 0) {
            activityList.innerHTML = `
                <div class="empty-activity">
                    <i class="fas fa-calendar-plus"></i>
                    <p>No activities yet. Start studying!</p>
                </div>
            `;
            return;
        }
        
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon || 'fas fa-check-circle'}"></i>
                </div>
                <div class="activity-details">
                    <p>${activity.text}</p>
                    <span class="activity-time">${activity.time} • ${activity.date}</span>
                </div>
            </div>
        `).join('');
    }
    
    function clearActivities() {
        if (!confirm('Clear all activities?')) return;
        
        localStorage.setItem('activities', JSON.stringify([]));
        loadActivities();
        showNotification('Activities cleared!');
    }
    
    function loadGoals() {
        if (!goalsList) return;
        
        // Clear existing goals
        goalsList.innerHTML = '';
        
        // Get user data
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const folders = JSON.parse(localStorage.getItem('studyFolders') || '[]');
        const videos = JSON.parse(localStorage.getItem('videos') || '[]');
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        
        // Check if user has any data
        const hasData = userData.xp > 0 || folders.length > 0 || videos.length > 0 || notes.length > 0;
        
        if (!hasData) {
            goalsList.innerHTML = `
                <div class="empty-goals">
                    <i class="fas fa-bullseye"></i>
                    <p>Start studying to see your personalized goals!</p>
                </div>
            `;
            return;
        }
        
        // Goal 1: Next level progress
        const levels = [
            { name: 'Seed', xpRequired: 0, next: 'Sprout' },
            { name: 'Sprout', xpRequired: 100, next: 'Plant' },
            { name: 'Plant', xpRequired: 500, next: 'Tree' },
            { name: 'Tree', xpRequired: 2000, next: 'Master' }
        ];
        
        const currentXP = userData.xp || 0;
        let currentLevel = userData.level || 'Seed';
        let nextLevel = null;
        let nextLevelXP = 0;
        let levelProgress = 0;
        
        for (let i = 0; i < levels.length; i++) {
            if (levels[i].name === currentLevel && i < levels.length - 1) {
                nextLevel = levels[i + 1];
                nextLevelXP = nextLevel.xpRequired;
                levelProgress = (currentXP / nextLevelXP) * 100;
                break;
            }
        }
        
        if (nextLevel) {
            const goal1 = createGoalElement(
                `Reach ${nextLevel.name} Level`,
                Math.min(levelProgress, 100),
                'fas fa-trophy',
                `${currentXP}/${nextLevelXP} XP`
            );
            goalsList.appendChild(goal1);
        }
        
        // Goal 2: Study time goal
        const totalStudySeconds = userData.totalStudyTime || 0;
        const studyHours = totalStudySeconds / 3600;
        const studyTargetHours = Math.ceil(studyHours + 5); // Next milestone
        const studyProgress = Math.min((studyHours / studyTargetHours) * 100, 100);
        
        const goal2 = createGoalElement(
            `Study ${studyTargetHours} hours`,
            studyProgress,
            'fas fa-clock',
            `${studyHours.toFixed(1)}/${studyTargetHours} hours`
        );
        goalsList.appendChild(goal2);
        
        // Goal 3: Folder goal
        const folderCount = folders.length;
        if (folderCount > 0) {
            const folderTarget = Math.max(5, folderCount + 2);
            const folderProgress = Math.min((folderCount / folderTarget) * 100, 100);
            
            const goal3 = createGoalElement(
                `Create ${folderTarget} folders`,
                folderProgress,
                'fas fa-folder',
                `${folderCount}/${folderTarget} folders`
            );
            goalsList.appendChild(goal3);
        }
        
        // Goal 4: Video goal
        const videoCount = videos.length;
        if (videoCount > 0) {
            const videoTarget = Math.max(10, videoCount + 5);
            const videoProgress = Math.min((videoCount / videoTarget) * 100, 100);
            
            const goal4 = createGoalElement(
                `Upload ${videoTarget} videos`,
                videoProgress,
                'fas fa-video',
                `${videoCount}/${videoTarget} videos`
            );
            goalsList.appendChild(goal4);
        }
        
        // Goal 5: PDF goal
        const pdfCount = notes.length;
        if (pdfCount > 0) {
            const pdfTarget = Math.max(5, pdfCount + 3);
            const pdfProgress = Math.min((pdfCount / pdfTarget) * 100, 100);
            
            const goal5 = createGoalElement(
                `Create ${pdfTarget} PDF notes`,
                pdfProgress,
                'fas fa-file-pdf',
                `${pdfCount}/${pdfTarget} notes`
            );
            goalsList.appendChild(goal5);
        }
        
        // If no goals created (shouldn't happen), show empty state
        if (goalsList.children.length === 0) {
            goalsList.innerHTML = `
                <div class="empty-goals">
                    <i class="fas fa-bullseye"></i>
                    <p>Complete your first study session to see goals!</p>
                </div>
            `;
        }
    }
    
    function createGoalElement(name, progress, icon, subtitle = '') {
        const goalItem = document.createElement('div');
        goalItem.className = 'goal-item';
        goalItem.innerHTML = `
            <div class="goal-icon">
                <i class="${icon}"></i>
            </div>
            <div class="goal-info">
                <div class="goal-name">${name}</div>
                ${subtitle ? `<div class="goal-subtitle">${subtitle}</div>` : ''}
                <div class="goal-progress">
                    <div class="progress-bar small">
                        <div class="progress-fill" style="width: ${progress}%;"></div>
                    </div>
                    <span class="goal-percent">${Math.round(progress)}%</span>
                </div>
            </div>
        `;
        return goalItem;
    }
    
    function createProfileEditModal() {
        // Create modal if it doesn't exist
        if (!profileEditModal) {
            profileEditModal = document.getElementById('profileEditModal');
            
            // Get elements
            avatarUpload = document.getElementById('avatarUpload');
            const avatarPreview = document.getElementById('avatarPreview');
            const changeAvatarBtn = document.getElementById('changeAvatarBtn');
            const removeAvatarBtn = document.getElementById('removeAvatarBtn');
            nameInput = document.getElementById('nameInput');
            emailInput = document.getElementById('emailInput');
            const closeProfileEditBtn = document.getElementById('closeProfileEditBtn');
            const cancelProfileEdit = document.getElementById('cancelProfileEdit');
            const saveProfileChanges = document.getElementById('saveProfileChanges');
            
            // Load current data
            const profile = JSON.parse(localStorage.getItem('profile') || '{}');
            nameInput.value = profile.name || '';
            emailInput.value = profile.email || '';
            
            // Load avatar if exists
            const profilePic = localStorage.getItem('profilePic');
            if (profilePic) {
                avatarPreview.innerHTML = `<img src="${profilePic}" alt="Profile">`;
            }
            
            // Event listeners
            changeAvatarBtn.addEventListener('click', () => avatarUpload.click());
            avatarUpload.addEventListener('change', handleAvatarUpload);
            removeAvatarBtn.addEventListener('click', removeAvatar);
            closeProfileEditBtn.addEventListener('click', () => hideModal(profileEditModal));
            cancelProfileEdit.addEventListener('click', () => hideModal(profileEditModal));
            saveProfileChanges.addEventListener('click', saveProfileChangesHandler);
            
            // Close on outside click
            profileEditModal.addEventListener('click', (e) => {
                if (e.target === profileEditModal) {
                    hideModal(profileEditModal);
                }
            });
        }
        
        // Load current data
        const profile = JSON.parse(localStorage.getItem('profile') || '{}');
        nameInput.value = profile.name || '';
        emailInput.value = profile.email || '';
        
        // Show modal
        showModal(profileEditModal);
    }
    
    function handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validate image
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB
            alert('Image must be less than 5MB');
            return;
        }
        
        // Create preview
        const reader = new FileReader();
        reader.onload = function(e) {
            const avatarPreview = document.getElementById('avatarPreview');
            avatarPreview.innerHTML = `<img src="${e.target.result}" alt="Profile">`;
            
            // Save to localStorage temporarily
            localStorage.setItem('profilePic', e.target.result);
        };
        reader.readAsDataURL(file);
    }
    
    function removeAvatar() {
        localStorage.removeItem('profilePic');
        const avatarPreview = document.getElementById('avatarPreview');
        avatarPreview.innerHTML = '<i class="fas fa-user"></i>';
        showNotification('Profile photo removed');
    }
    
    function saveProfileChangesHandler() {
        const profile = {
            name: nameInput.value.trim() || 'Study Learner',
            email: emailInput.value.trim() || 'student@lifeflow.com',
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem('profile', JSON.stringify(profile));
        
        // Update profile display
        userName.textContent = profile.name;
        userEmail.textContent = profile.email;
        
        // Update avatar if changed
        updateProfileInfo();
        
        hideModal(profileEditModal);
        showNotification('Profile updated successfully!');
    }
    
    function openSettings() {
        loadSettings();
        showModal(settingsModal);
    }
    
    function showModal(modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        document.body.style.overflow = 'hidden';
    }
    
    function hideModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        document.body.style.overflow = 'auto';
    }
    
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
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
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Initialize goals
    loadGoals();
});