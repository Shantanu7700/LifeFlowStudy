// Study Hub Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const addFolderBtn = document.getElementById('addFolderBtn');
    const createFirstFolderBtn = document.getElementById('createFirstFolder');
    const folderModal = document.getElementById('folderModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const createFolderBtn = document.getElementById('createFolderBtn');
    const foldersContainer = document.getElementById('foldersContainer');
    const emptyState = document.getElementById('emptyState');
    const folderTemplate = document.getElementById('folderTemplate');
    const uploadModal = document.getElementById('uploadModal');
    const videoModal = document.getElementById('videoModal');
    const pdfModal = document.getElementById('pdfModal');
    
    // Upload elements
    const tabBtns = document.querySelectorAll('.tab-btn');
    const uploadContents = document.querySelectorAll('.upload-content');
    const videoUploadArea = document.getElementById('videoUploadArea');
    const pdfUploadArea = document.getElementById('pdfUploadArea');
    const videoFileInput = document.getElementById('videoFile');
    const pdfFileInput = document.getElementById('pdfFile');
    const cancelUploadBtn = document.getElementById('cancelUpload');
    const confirmUploadBtn = document.getElementById('confirmUpload');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressFill = uploadProgress.querySelector('.progress-fill');
    const progressPercent = document.getElementById('progressPercent');
    const progressSpeed = document.getElementById('progressSpeed');
    const availableStorage = document.getElementById('availableStorage');
    
    // Video elements
    const closeVideoBtn = document.getElementById('closeVideoBtn');
    const studyVideo = document.getElementById('studyVideo');
    
    // State
    let folders = JSON.parse(localStorage.getItem('studyFolders') || '[]');
    let videos = JSON.parse(localStorage.getItem('videos') || '[]');
    let notes = JSON.parse(localStorage.getItem('notes') || '[]');
    let currentUploadType = 'video';
    let currentFile = null;
    
    // Constants
    const STORAGE_LIMIT = 100 * 1024 * 1024 * 1024; // 100GB
    const MAX_VIDEO_SIZE = 100 * 1024 * 1024 * 1024; // 100GB per video
    const MAX_PDF_SIZE = 100 * 1024 * 1024; // 100MB per PDF
    
    // Initialize
    initApp();
    
    // Event Listeners
    addFolderBtn?.addEventListener('click', () => showModal(folderModal));
    createFirstFolderBtn?.addEventListener('click', () => showModal(folderModal));
    cancelBtn?.addEventListener('click', () => hideModal(folderModal));
    createFolderBtn?.addEventListener('click', createNewFolder);
    cancelUploadBtn?.addEventListener('click', () => hideModal(uploadModal));
    confirmUploadBtn?.addEventListener('click', uploadFile);
    
    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            switchUploadTab(type);
        });
    });
    
    // Upload area clicks
    videoUploadArea?.addEventListener('click', () => videoFileInput.click());
    pdfUploadArea?.addEventListener('click', () => pdfFileInput.click());
    
    // File input changes
    videoFileInput?.addEventListener('change', (e) => handleFileSelect(e, 'video'));
    pdfFileInput?.addEventListener('change', (e) => handleFileSelect(e, 'pdf'));
    
    // Video modal close
    closeVideoBtn?.addEventListener('click', () => hideModal(videoModal));
    
    // Functions
    function initApp() {
        renderFolders();
        updateEmptyState();
        updateStorageInfo();
        checkStorageWarning();
    }
    
    function showModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function hideModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        resetUploadForm();
    }
    
    function switchUploadTab(type) {
        currentUploadType = type;
        
        // Update tabs
        tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });
        
        // Update content
        uploadContents.forEach(content => {
            content.classList.toggle('active', content.id === `${type}Upload`);
        });
        
        // Update button text
        confirmUploadBtn.innerHTML = `
            <i class="fas fa-upload"></i>
            Upload ${type === 'video' ? 'Video' : 'PDF'}
        `;
        
        // Reset file selection
        currentFile = null;
        updateFileInfo();
    }
    
    function handleFileSelect(event, type) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validate file
        if (type === 'video') {
            if (!file.type.startsWith('video/')) {
                alert('Please select a video file (MP4, MOV, AVI, MKV, WEBM)');
                return;
            }
            if (file.size > MAX_VIDEO_SIZE) {
                alert(`Video must be less than 100GB. Current: ${formatFileSize(file.size)}`);
                return;
            }
        } else if (type === 'pdf') {
            if (!file.name.toLowerCase().endsWith('.pdf')) {
                alert('Please select a PDF file');
                return;
            }
            if (file.size > MAX_PDF_SIZE) {
                alert(`PDF must be less than 100MB. Current: ${formatFileSize(file.size)}`);
                return;
            }
        }
        
        currentFile = file;
        updateFileInfo();
    }
    
    function updateFileInfo() {
        const fileInfo = currentUploadType === 'video' 
            ? document.getElementById('videoFileInfo')
            : document.getElementById('pdfFileInfo');
        
        const fileName = currentUploadType === 'video'
            ? document.getElementById('videoFileName')
            : document.getElementById('pdfFileName');
        
        const fileSize = currentUploadType === 'video'
            ? document.getElementById('videoFileSize')
            : document.getElementById('pdfFileSize');
        
        if (currentFile) {
            fileInfo.style.display = 'block';
            fileName.textContent = currentFile.name;
            fileSize.textContent = formatFileSize(currentFile.size);
        } else {
            fileInfo.style.display = 'none';
        }
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function createNewFolder() {
        const chapterName = document.getElementById('chapterName').value.trim();
        const chapterNo = document.getElementById('chapterNo').value.trim();
        const subjectTitle = document.getElementById('subjectTitle').value.trim();
        
        if (!chapterName || !chapterNo || !subjectTitle) {
            alert('Please fill in all required fields');
            return;
        }
        
        const newFolder = {
            id: Date.now().toString(),
            chapterName,
            chapterNo,
            subjectTitle,
            createdAt: new Date().toISOString(),
            studyTime: 0
        };
        
        folders.push(newFolder);
        saveData();
        renderFolders();
        updateEmptyState();
        hideModal(folderModal);
        
        // Add activity
        addActivity(`Created folder: ${chapterName}`);
        
        // Show notification
        showNotification('Folder created successfully!');
    }
    
    function renderFolders() {
        foldersContainer.innerHTML = '';
        
        if (folders.length === 0) {
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        
        folders.forEach(folder => {
            const folderCard = folderTemplate.content.cloneNode(true);
            
            // Set folder info
            folderCard.querySelector('.folder-title').textContent = folder.chapterName;
            folderCard.querySelector('.folder-subtitle').textContent = `${folder.chapterNo} • ${folder.subjectTitle}`;
            folderCard.querySelector('.folder-date').textContent = `Created: ${new Date(folder.createdAt).toLocaleDateString()}`;
            
            // Count videos and notes for this folder
            const videoCount = videos.filter(v => v.folderId === folder.id).length;
            const noteCount = notes.filter(n => n.folderId === folder.id).length;
            
            folderCard.querySelector('.video-count').textContent = videoCount;
            folderCard.querySelector('.note-count').textContent = noteCount;
            folderCard.querySelector('.study-time').textContent = `${Math.floor(folder.studyTime / 60)}h`;
            
            // Set folder ID for reference
            const folderElement = folderCard.querySelector('.folder-card');
            folderElement.dataset.folderId = folder.id;
            
            // Button events
            folderCard.querySelector('.edit-folder').addEventListener('click', (e) => {
                e.stopPropagation();
                editFolder(folder.id);
            });
            
            folderCard.querySelector('.delete-folder').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteFolder(folder.id);
            });
            
            foldersContainer.appendChild(folderCard);
        });
    }
    
    function updateEmptyState() {
        emptyState.style.display = folders.length === 0 ? 'block' : 'none';
    }
    
    function editFolder(folderId) {
        const folder = folders.find(f => f.id === folderId);
        if (!folder) return;
        
        document.getElementById('chapterName').value = folder.chapterName;
        document.getElementById('chapterNo').value = folder.chapterNo;
        document.getElementById('subjectTitle').value = folder.subjectTitle;
        
        // Change button to update
        createFolderBtn.textContent = 'Update Folder';
        const originalHandler = createFolderBtn.onclick;
        createFolderBtn.onclick = () => updateFolder(folderId);
        
        showModal(folderModal);
        
        // Restore original handler after modal closes
        folderModal.addEventListener('hidden', () => {
            createFolderBtn.textContent = 'Create Folder';
            createFolderBtn.onclick = originalHandler;
        }, { once: true });
    }
    
    function updateFolder(folderId) {
        const folderIndex = folders.findIndex(f => f.id === folderId);
        if (folderIndex === -1) return;
        
        folders[folderIndex].chapterName = document.getElementById('chapterName').value.trim();
        folders[folderIndex].chapterNo = document.getElementById('chapterNo').value.trim();
        folders[folderIndex].subjectTitle = document.getElementById('subjectTitle').value.trim();
        
        saveData();
        renderFolders();
        hideModal(folderModal);
        
        showNotification('Folder updated successfully!');
    }
    
    function deleteFolder(folderId) {
        if (!confirm('Are you sure you want to delete this folder? This will also delete all videos and notes in it.')) {
            return;
        }
        
        // Delete associated videos and notes
        videos = videos.filter(v => v.folderId !== folderId);
        notes = notes.filter(n => n.folderId !== folderId);
        
        // Delete folder
        folders = folders.filter(f => f.id !== folderId);
        saveData();
        renderFolders();
        updateEmptyState();
        
        showNotification('Folder deleted successfully!');
    }
    
    function uploadFile() {
        if (!currentFile) {
            alert(`Please select a ${currentUploadType} file`);
            return;
        }
        
        const titleInput = currentUploadType === 'video' 
            ? document.getElementById('videoTitle')
            : document.getElementById('pdfTitle');
        
        const title = titleInput.value.trim();
        if (!title) {
            alert(`Please enter a ${currentUploadType} title`);
            return;
        }
        
        // Check if we're in a folder context
        const currentFolder = window.folderSystem?.currentFolder();
        if (!currentFolder) {
            alert('Please open a folder first before uploading files.');
            return;
        }
        
        // Check storage
        const storageCheck = checkStorageAvailable(currentFile.size);
        if (!storageCheck.available) {
            alert(`Not enough storage space. Available: ${formatFileSize(storageCheck.free)}, Required: ${formatFileSize(currentFile.size)}`);
            return;
        }
        
        // Show progress
        uploadProgress.style.display = 'block';
        progressFill.style.width = '0%';
        progressPercent.textContent = '0%';
        
        // Simulate upload with progress
        let progress = 0;
        const startTime = Date.now();
        
        const uploadInterval = setInterval(() => {
            progress += 2;
            
            // Calculate upload speed
            const elapsedTime = (Date.now() - startTime) / 1000;
            const uploadedBytes = (currentFile.size * progress) / 100;
            const speed = uploadedBytes / elapsedTime;
            
            progressFill.style.width = `${progress}%`;
            progressPercent.textContent = `${progress}%`;
            progressSpeed.textContent = `Speed: ${formatFileSize(speed)}/s`;
            
            if (progress >= 100) {
                clearInterval(uploadInterval);
                
                // Create file object
                const fileId = Date.now().toString();
                const fileObject = {
                    id: fileId,
                    title: title,
                    fileName: currentFile.name,
                    size: currentFile.size,
                    type: currentFile.type,
                    folderId: currentFolder.id,
                    uploadedAt: new Date().toISOString(),
                    url: URL.createObjectURL(currentFile)
                };
                
                // Add to appropriate array
                if (currentUploadType === 'video') {
                    videos.push(fileObject);
                } else {
                    notes.push(fileObject);
                }
                
                // Save data
                saveData();
                
                // Update UI through folder system
                if (window.folderSystem) {
                    if (currentUploadType === 'video') {
                        window.folderSystem.addVideo(fileObject);
                    } else {
                        window.folderSystem.addNote(fileObject);
                    }
                    window.folderSystem.updateFolderContent();
                }
                
                // Update storage info
                updateStorageInfo();
                
                // Hide modal and reset
                setTimeout(() => {
                    hideModal(uploadModal);
                    showNotification(`${currentUploadType === 'video' ? 'Video' : 'PDF'} uploaded successfully!`);
                    
                    // Add activity
                    addActivity(`Uploaded ${currentUploadType}: ${title}`);
                }, 500);
            }
        }, 50);
    }
    
    function checkStorageAvailable(fileSize) {
        // Calculate total storage used
        let totalUsed = 0;
        videos.forEach(video => totalUsed += video.size);
        notes.forEach(note => totalUsed += note.size);
        
        const freeStorage = STORAGE_LIMIT - totalUsed;
        
        return {
            available: fileSize <= freeStorage,
            free: freeStorage,
            used: totalUsed,
            total: STORAGE_LIMIT,
            percent: (totalUsed / STORAGE_LIMIT) * 100
        };
    }
    
    function updateStorageInfo() {
        const storageInfo = checkStorageAvailable(0);
        const freeGB = (storageInfo.free / (1024 * 1024 * 1024)).toFixed(1);
        
        availableStorage.textContent = `${freeGB} GB free`;
        
        // Update storage warning
        checkStorageWarning(storageInfo.percent);
    }
    
    function checkStorageWarning(percent) {
        const warningElement = document.getElementById('storageWarning');
        const warningText = document.getElementById('warningText');
        
        if (percent > 90) {
            warningElement.style.display = 'flex';
            warningText.textContent = 'Critical: Less than 10% storage remaining';
        } else if (percent > 75) {
            warningElement.style.display = 'flex';
            warningText.textContent = 'Warning: Less than 25% storage remaining';
        } else {
            warningElement.style.display = 'none';
        }
    }
    
    function resetUploadForm() {
        // Reset inputs
        document.getElementById('videoTitle').value = '';
        document.getElementById('pdfTitle').value = '';
        
        // Reset file inputs
        videoFileInput.value = '';
        pdfFileInput.value = '';
        
        // Hide file info
        document.getElementById('videoFileInfo').style.display = 'none';
        document.getElementById('pdfFileInfo').style.display = 'none';
        
        // Hide progress
        uploadProgress.style.display = 'none';
        
        // Reset current file
        currentFile = null;
    }
    
    function saveData() {
        localStorage.setItem('studyFolders', JSON.stringify(folders));
        localStorage.setItem('videos', JSON.stringify(videos));
        localStorage.setItem('notes', JSON.stringify(notes));
        
        // Update home page stats
        updateHomeStats();
    }
    
    function updateHomeStats() {
        // Update home page if it exists
        const folderCountElement = document.getElementById('folderCount');
        const videoCountElement = document.getElementById('videoCount');
        const noteCountElement = document.getElementById('noteCount');
        
        if (folderCountElement) folderCountElement.textContent = folders.length;
        if (videoCountElement) videoCountElement.textContent = videos.length;
        if (noteCountElement) noteCountElement.textContent = notes.length;
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
    }
    
    function getActivityIcon(text) {
        if (text.includes('video') || text.includes('Video')) return 'fas fa-video';
        if (text.includes('PDF') || text.includes('pdf')) return 'fas fa-file-pdf';
        if (text.includes('folder') || text.includes('Folder')) return 'fas fa-folder-plus';
        return 'fas fa-upload';
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
});