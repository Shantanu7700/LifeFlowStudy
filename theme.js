// Theme Management
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or use system preference
    let savedTheme = localStorage.getItem('theme');
    
    // If no saved theme, check system preference
    if (!savedTheme) {
        savedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    // Apply theme
    setTheme(savedTheme);
    
    // Update toggle button states
    if (darkModeToggle) {
        darkModeToggle.checked = savedTheme === 'dark';
    }
    
    // Theme toggle button
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Settings toggle
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', function() {
            const newTheme = this.checked ? 'dark' : 'light';
            setTheme(newTheme);
        });
    }
    
    function toggleTheme() {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        
        // Animation
        themeToggle.style.transform = 'rotate(180deg)';
        setTimeout(() => {
            themeToggle.style.transform = 'rotate(0)';
        }, 300);
    }
    
    function setTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update toggle if exists
        if (darkModeToggle) {
            darkModeToggle.checked = theme === 'dark';
        }
        
        // Update settings if modal is open
        updateSettingsModal(theme);
        
        // Dispatch event for other components
        document.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme } 
        }));
    }
    
    function updateSettingsModal(theme) {
        // Update dark mode toggle in settings modal
        const settingsDarkModeToggle = document.getElementById('darkModeToggle');
        if (settingsDarkModeToggle) {
            settingsDarkModeToggle.checked = theme === 'dark';
        }
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only change if user hasn't set a preference
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
    
    // Load settings
    loadThemeSettings();
    
    function loadThemeSettings() {
        const settings = JSON.parse(localStorage.getItem('settings') || '{}');
        
        // Apply dark mode from settings
        if (settings.darkMode) {
            setTheme('dark');
        }
    }
});