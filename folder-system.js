// Folder System Management for Study Hub
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const folderContentModal = document.getElementById('folderContentModal');
    const backToFoldersBtn = document.getElementById('backToFoldersBtn');
    const closeFolderContentBtn = document.getElementById('closeFolderContentBtn');
    const currentFolderTitle = document.getElementById('currentFolderTitle');
    const contentNavBtns = document.querySelectorAll('.content-nav-btn');
    const contentTabs = document.querySelectorAll('.content-tab');
    const videosList = document.getElementById('videosList');
    const pdfsList = document.getElementById('pdfsList');
    const subfoldersList = document.getElementById('subfoldersList');
    const addVideoBtn = document.getElementById('addVideoBtn');
    const addPdfBtn = document.getElementById('addPdfBtn');
    const addSubfolderBtn = document.getElementById('addSubfolderBtn');
    const videoCountBadge = document.getElementById('videoCountBadge');
    const pdfCountBadge = document.getElementById('pdfCountBadge');
    const subfolderCountBadge = document.getElementById('subfolderCountBadge');
    const uploadToFolderName = document.getElementById('uploadToFolderName');
    
    // State
    let currentFolder = null;
    let currentTab = 'videos';
    
    // Load data
    let folders = JSON.parse(localStorage.getItem('studyFolders') || '[]');
    let videos = JSON.parse(localStorage.getItem('videos') || '[]');
    let notes = JSON.parse(localStorage.getItem('notes') || '[]');
    let subfolders = JSON.parse(localStorage.getItem('subfolders') || '[]');
    
    // Initialize
    initFolderSystem();
    
    // Event Listeners
    backToFoldersBtn?.addEventListener('click', showMainFolders);
    closeFolderContentBtn?.addEventListener('click', () => hideModal(folderContentModal));
    
    contentNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });
    
    addVideoBtn?.addEventListener('click', () => openUploadModal('video'));
    addPdfBtn?.addEventListener('click', () => openUploadModal('pdf'));
    addSubfolderBtn?.addEventListener('click', () => showSubfolderModal());
    
    // Functions
    function initFolderSystem() {
        // Bind open folder event to folder cards
        document.addEventListener('click', function(e) {
            if (e.target.closest('.open-folder-btn')) {
                const folderCard = e.target.closest('.folder-card');
                const folderId = folderCard?.dataset.folderId;
                if (folderId) {
                    openFolder(folderId);
                }
            }
        });
    }
    
    function openFolder(folderId) {
        currentFolder = folders.find(f => f.id === folderId);
        if (!currentFolder) return;
        
        // Update modal title
        currentFolderTitle.textContent = currentFolder.chapterName;
        uploadToFolderName.textContent = currentFolder.chapterName;
        
        // Load folder content
        loadFolderContent();
        
        // Show modal
        showModal(folderContentModal);
    }
    
    function loadFolderContent() {
        if (!currentFolder) return;
        
        // Filter videos and notes for this folder
        const folderVideos = videos.filter(v => v.folderId === currentFolder.id);
        const folderNotes = notes.filter(n => n.folderId === currentFolder.id);
        const folderSubfolders = subfolders.filter(s => s.parentFolderId === currentFolder.id);
        
        // Update badges
        videoCountBadge.textContent = folderVideos.length;
        pdfCountBadge.textContent = folderNotes.length;
        subfolderCountBadge.textContent = folderSubfolders.length;
        
        // Load content based on current tab
        if (currentTab === 'videos') {
            loadVideosList(folderVideos);
        } else if (currentTab === 'pdfs') {
            loadPdfsList(folderNotes);
        } else if (currentTab === 'subfolders') {
            loadSubfoldersList(folderSubfolders);
        }
    }
    
    function loadVideosList(videoList) {
        videosList.innerHTML = '';
        
        if (videoList.length === 0) {
            videosList.innerHTML = `
                <div class="empty-content">
                    <i class="fas fa-video-slash"></i>
                    <p>No videos in this folder</p>
                    <button class="btn-secondary" id="addFirstVideoBtn">
                        <i class="fas fa-plus"></i> Add Your First Video
                    </button>
                </div>
            `;
            document.getElementById('addFirstVideoBtn')?.addEventListener('click', () => openUploadModal('video'));
            return;
        }
        
        videoList.forEach(video => {
            const videoElement = document.createElement('div');
            videoElement.className = 'content-item-card';
            videoElement.innerHTML = `
                <div class="content-item-icon">
                    <i class="fas fa-video"></i>
                </div>
                <div class="content-item-title">${video.title}</div>
                <div class="content-item-meta">
                    <span>${formatFileSize(video.size)}</span>
                    <span>${new Date(video.uploadedAt).toLocaleDateString()}</span>
                </div>
                <div class="content-item-actions">
                    <button class="view-btn play-video-btn" data-video-id="${video.id}">
                        <i class="fas fa-play"></i> Play
                    </button>
                    <button class="delete-btn delete-video-btn" data-video-id="${video.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            videosList.appendChild(videoElement);
        });
        
        // Add event listeners
        document.querySelectorAll('.play-video-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const videoId = e.target.closest('button').dataset.videoId;
                playVideo(videoId);
            });
        });
        
        document.querySelectorAll('.delete-video-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const videoId = e.target.closest('button').dataset.videoId;
                deleteVideoFromFolder(videoId);
            });
        });
    }
    
    function loadPdfsList(pdfList) {
        pdfsList.innerHTML = '';
        
        if (pdfList.length === 0) {
            pdfsList.innerHTML = `
                <div class="empty-content">
                    <i class="fas fa-file-pdf"></i>
                    <p>No PDF notes in this folder</p>
                    <button class="btn-secondary" id="addFirstPdfBtn">
                        <i class="fas fa-plus"></i> Add Your First PDF
                    </button>
                </div>
            `;
            document.getElementById('addFirstPdfBtn')?.addEventListener('click', () => openUploadModal('pdf'));
            return;
        }
        
        pdfList.forEach(note => {
            const pdfElement = document.createElement('div');
            pdfElement.className = 'content-item-card';
            pdfElement.innerHTML = `
                <div class="content-item-icon">
                    <i class="fas fa-file-pdf"></i>
                </div>
                <div class="content-item-title">${note.title}</div>
                <div class="content-item-meta">
                    <span>${formatFileSize(note.size)}</span>
                    <span>${new Date(note.uploadedAt).toLocaleDateString()}</span>
                </div>
                <div class="content-item-actions">
                    <button class="view-btn view-pdf-btn" data-pdf-id="${note.id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="delete-btn delete-pdf-btn" data-pdf-id="${note.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            pdfsList.appendChild(pdfElement);
        });
        
        // Add event listeners
        document.querySelectorAll('.view-pdf-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pdfId = e.target.closest('button').dataset.pdfId;
                viewPdf(pdfId);
            });
        });
        
        document.querySelectorAll('.delete-pdf-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pdfId = e.target.closest('button').dataset.pdfId;
                deletePdfFromFolder(pdfId);
            });
        });
    }
    
    function loadSubfoldersList(subfolderList) {
        subfoldersList.innerHTML = '';
        
        if (subfolderList.length === 0) {
            subfoldersList.innerHTML = `
                <div class="empty-content">
                    <i class="fas fa-folder"></i>
                    <p>No sub-folders created yet</p>
                    <button class="btn-secondary" id="addFirstSubfolderBtn">
                        <i class="fas fa-plus"></i> Create Sub-folder
                    </button>
                </div>
            `;
            document.getElementById('addFirstSubfolderBtn')?.addEventListener('click', () => showSubfolderModal());
            return;
        }
        
        subfolderList.forEach(subfolder => {
            // Count items in subfolder
            const subfolderVideos = videos.filter(v => v.folderId === subfolder.id);
            const subfolderNotes = notes.filter(n => n.folderId === subfolder.id);
            
            const subfolderElement = document.createElement('div');
            subfolderElement.className = 'subfolder-item';
            subfolderElement.innerHTML = `
                <div class="subfolder-icon">
                    <i class="fas fa-folder"></i>
                </div>
                <div class="subfolder-info">
                    <div class="subfolder-name">${subfolder.name}</div>
                    <div class="subfolder-count">
                        ${subfolderVideos.length} videos • ${subfolderNotes.length} notes
                    </div>
                </div>
                <div class="subfolder-actions">
                    <button class="icon-btn open-subfolder-btn" data-subfolder-id="${subfolder.id}">
                        <i class="fas fa-folder-open"></i>
                    </button>
                    <button class="icon-btn delete-subfolder-btn" data-subfolder-id="${subfolder.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            subfoldersList.appendChild(subfolderElement);
        });
        
        // Add event listeners
        document.querySelectorAll('.open-subfolder-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const subfolderId = e.target.closest('button').dataset.subfolderId;
                openSubfolder(subfolderId);
            });
        });
        
        document.querySelectorAll('.delete-subfolder-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const subfolderId = e.target.closest('button').dataset.subfolderId;
                deleteSubfolder(subfolderId);
            });
        });
    }
    
    function switchTab(tab) {
        currentTab = tab;
        
        // Update nav buttons
        contentNavBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        
        // Update tabs
        contentTabs.forEach(tabElement => {
            tabElement.classList.toggle('active', tabElement.id === `${tab}Tab`);
        });
        
        // Load content for the tab
        loadFolderContent();
    }
    
    function openUploadModal(type) {
        if (!currentFolder) return;
        
        // Show upload modal
        const uploadModal = document.getElementById('uploadModal');
        showModal(uploadModal);
        
        // Switch to correct tab
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });
        
        const uploadContents = document.querySelectorAll('.upload-content');
        uploadContents.forEach(content => {
            content.classList.toggle('active', content.id === `${type}Upload`);
        });
        
        // Update button text
        const confirmUploadBtn = document.getElementById('confirmUpload');
        if (confirmUploadBtn) {
            confirmUploadBtn.innerHTML = `
                <i class="fas fa-upload"></i>
                Upload ${type === 'video' ? 'Video' : 'PDF'}
            `;
        }
    }
    
    function showSubfolderModal() {
        const subfolderName = prompt('Enter sub-folder name:');
        if (!subfolderName || !subfolderName.trim()) return;
        
        const newSubfolder = {
            id: Date.now().toString(),
            name: subfolderName.trim(),
            parentFolderId: currentFolder.id,
            createdAt: new Date().toISOString()
        };
        
        subfolders.push(newSubfolder);
        saveData();
        loadFolderContent();
        
        showNotification('Sub-folder created successfully!');
    }
    
    function playVideo(videoId) {
        const video = videos.find(v => v.id === videoId);
        if (!video) return;
        
        // Update modal
        document.getElementById('videoModalTitle').textContent = video.title;
        document.getElementById('videoSize').textContent = formatFileSize(video.size);
        document.getElementById('videoDate').textContent = new Date(video.uploadedAt).toLocaleDateString();
        
        // Set video source
        const studyVideo = document.getElementById('studyVideo');
        studyVideo.src = video.url;
        
        // Show video modal
        const videoModal = document.getElementById('videoModal');
        showModal(videoModal);
        
        // Set up delete button
        const deleteVideoBtn = document.getElementById('deleteVideoBtn');
        deleteVideoBtn.onclick = () => {
            if (confirm('Are you sure you want to delete this video?')) {
                deleteVideoFromFolder(videoId);
                hideModal(videoModal);
            }
        };
        
        // Set up download button
        const downloadVideoBtn = document.getElementById('downloadVideoBtn');
        downloadVideoBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = video.url;
            a.download = video.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showNotification('Video download started!');
        };
    }
    
    function viewPdf(pdfId) {
        const note = notes.find(n => n.id === pdfId);
        if (!note) return;
        
        // Update modal
        document.getElementById('pdfModalTitle').textContent = note.title;
        
        // Set PDF source
        const pdfViewer = document.getElementById('pdfViewer');
        pdfViewer.src = note.url;
        
        // Show PDF modal
        const pdfModal = document.getElementById('pdfModal');
        showModal(pdfModal);
        
        // Set up delete button
        const deletePdfBtn = document.getElementById('deletePdfBtn');
        deletePdfBtn.onclick = () => {
            if (confirm('Are you sure you want to delete this PDF?')) {
                deletePdfFromFolder(pdfId);
                hideModal(pdfModal);
            }
        };
        
        // Set up download button
        const downloadPdfBtn = document.getElementById('downloadPdfBtn');
        downloadPdfBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = note.url;
            a.download = note.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showNotification('PDF download started!');
        };
    }
    
    function openSubfolder(subfolderId) {
        // For now, show a message since we're not implementing nested subfolders fully
        const subfolder = subfolders.find(s => s.id === subfolderId);
        if (subfolder) {
            alert(`Sub-folder: ${subfolder.name}\n\nIn a full implementation, this would open to show nested content.`);
        }
    }
    
    function deleteVideoFromFolder(videoId) {
        if (!confirm('Are you sure you want to delete this video?')) return;
        
        // Remove from videos array
        const videoIndex = videos.findIndex(v => v.id === videoId);
        if (videoIndex !== -1) {
            // Revoke blob URL
            if (videos[videoIndex].url && videos[videoIndex].url.startsWith('blob:')) {
                URL.revokeObjectURL(videos[videoIndex].url);
            }
            
            videos.splice(videoIndex, 1);
        }
        
        saveData();
        loadFolderContent();
        showNotification('Video deleted successfully!');
    }
    
    function deletePdfFromFolder(pdfId) {
        if (!confirm('Are you sure you want to delete this PDF?')) return;
        
        // Remove from notes array
        const noteIndex = notes.findIndex(n => n.id === pdfId);
        if (noteIndex !== -1) {
            // Revoke blob URL
            if (notes[noteIndex].url && notes[noteIndex].url.startsWith('blob:')) {
                URL.revokeObjectURL(notes[noteIndex].url);
            }
            
            notes.splice(noteIndex, 1);
        }
        
        saveData();
        loadFolderContent();
        showNotification('PDF deleted successfully!');
    }
    
    function deleteSubfolder(subfolderId) {
        if (!confirm('Delete this sub-folder? All contents will be moved to the parent folder.')) return;
        
        // Move videos and notes to parent folder
        videos.forEach(video => {
            if (video.folderId === subfolderId) {
                video.folderId = currentFolder.id;
            }
        });
        
        notes.forEach(note => {
            if (note.folderId === subfolderId) {
                note.folderId = currentFolder.id;
            }
        });
        
        // Remove subfolder
        subfolders = subfolders.filter(s => s.id !== subfolderId);
        
        saveData();
        loadFolderContent();
        showNotification('Sub-folder deleted! Contents moved to parent folder.');
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function saveData() {
        localStorage.setItem('videos', JSON.stringify(videos));
        localStorage.setItem('notes', JSON.stringify(notes));
        localStorage.setItem('subfolders', JSON.stringify(subfolders));
        
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
    
    function showMainFolders() {
        hideModal(folderContentModal);
        currentFolder = null;
    }
    
    function showModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function hideModal(modal) {
        modal.classList.remove('active');
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
    
    // Make functions available globally for study-hub.js
    window.folderSystem = {
        openFolder,
        currentFolder: () => currentFolder,
        updateFolderContent: loadFolderContent,
        addVideo: function(videoData) {
            videos.push(videoData);
            saveData();
            loadFolderContent();
        },
        addNote: function(noteData) {
            notes.push(noteData);
            saveData();
            loadFolderContent();
        }
    };
});