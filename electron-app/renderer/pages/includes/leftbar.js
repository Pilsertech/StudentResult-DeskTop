// Modern Leftbar with Floating Submenus

(function() {
    'use strict';
    
    console.log('🚀 Loading Modern Leftbar System...');
    
    // State management
    let sessionStartTime = new Date();
    let currentSubmenu = null;
    let isExpanded = false;
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initializeLeftbar, 100);
    });
    
    function initializeLeftbar() {
        console.log('🎯 Initializing Modern Leftbar...');
        
        setupEventListeners();
        setActiveMenuItem();
        updateFooterDate();
        updateSessionDuration();
        addTooltips();
        
        // Start timers
        setInterval(updateSessionDuration, 1000);
        setInterval(updateFooterDate, 60000);
        
        console.log('✅ Modern Leftbar initialized successfully');
    }
    
    function setupEventListeners() {
        // Click outside to close submenus
        document.addEventListener('click', function(e) {
            const clickedInsideSidebar = e.target.closest('.left-sidebar');
            const clickedOnSubmenu = e.target.closest('.submenu');
            const clickedOnToggle = e.target.closest('.sidebar-toggle');
            
            if (!clickedInsideSidebar && !clickedOnSubmenu && !clickedOnToggle) {
                closeAllSubmenus();
            }
        });
        
        // ESC key to close submenus
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeAllSubmenus();
            }
        });
        
        // Prevent scroll propagation
        const sidebarNav = document.querySelector('.sidebar-nav');
        if (sidebarNav) {
            sidebarNav.addEventListener('wheel', function(e) {
                e.stopPropagation();
            });
        }
        
        console.log('🎯 Event listeners setup complete');
    }
    
    function updateSessionDuration() {
        const now = new Date();
        const duration = now - sessionStartTime;
        
        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((duration % (1000 * 60)) / 1000);
        
        const durationString = 
            String(hours).padStart(2, '0') + ':' + 
            String(minutes).padStart(2, '0') + ':' + 
            String(seconds).padStart(2, '0');
        
        const durationElement = document.getElementById('sessionDuration');
        if (durationElement) {
            durationElement.textContent = durationString;
        }
    }
    
    function updateFooterDate() {
        const now = new Date();
        const dateString = now.getFullYear() + '-' + 
                          String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                          String(now.getDate()).padStart(2, '0');
        
        const footerElement = document.getElementById('footerDate');
        if (footerElement) {
            footerElement.textContent = dateString;
        }
    }
    
    function setActiveMenuItem() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop().replace('.html', '');
        
        // Clear all active classes
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelectorAll('.submenu-content a').forEach(link => {
            link.classList.remove('active');
        });
        
        // Set active based on current page
        const navItems = document.querySelectorAll('[data-page]');
        const submenuLinks = document.querySelectorAll('.submenu-content a[data-page]');
        
        navItems.forEach(item => {
            if (item.dataset.page === currentPage) {
                item.classList.add('active');
            }
        });
        
        submenuLinks.forEach(link => {
            if (link.dataset.page === currentPage) {
                link.classList.add('active');
                
                // Auto-expand sidebar and show submenu
                const submenuId = link.closest('.submenu').id.replace('submenu-', '');
                const parentNavItem = document.querySelector(`[data-menu="${submenuId}"]`);
                
                if (parentNavItem) {
                    parentNavItem.classList.add('active');
                    
                    // Auto-expand if needed
                    setTimeout(() => {
                        expandSidebar();
                        showSubmenu(submenuId);
                    }, 100);
                }
            }
        });
        
        console.log('📍 Active menu set for page:', currentPage);
    }
    
    function addTooltips() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            const link = item.querySelector('a');
            const textSpan = link?.querySelector('.nav-text');
            
            if (textSpan && textSpan.textContent) {
                item.setAttribute('data-tooltip', textSpan.textContent.trim());
            }
        });
        
        console.log('📌 Tooltips initialized');
    }
    
    function expandSidebar() {
        const sidebar = document.getElementById('leftSidebar');
        const icon = document.getElementById('toggleIcon');
        
        if (sidebar && !sidebar.classList.contains('expanded')) {
            sidebar.classList.add('expanded');
            document.body.classList.add('sidebar-expanded');
            if (icon) icon.className = 'fa fa-indent';
            isExpanded = true;
            console.log('📖 Sidebar expanded');
        }
    }
    
    function collapseSidebar() {
        const sidebar = document.getElementById('leftSidebar');
        const icon = document.getElementById('toggleIcon');
        
        if (sidebar && sidebar.classList.contains('expanded')) {
            sidebar.classList.remove('expanded');
            document.body.classList.remove('sidebar-expanded');
            if (icon) icon.className = 'fa fa-bars';
            isExpanded = false;
            closeAllSubmenus();
            console.log('📕 Sidebar collapsed');
        }
    }
    
    function showSubmenu(menuId) {
        // Close other submenus first
        closeAllSubmenus();
        
        const submenu = document.getElementById(`submenu-${menuId}`);
        const navItem = document.querySelector(`[data-menu="${menuId}"]`);
        
        if (submenu && navItem) {
            submenu.classList.add('active');
            navItem.classList.add('active');
            currentSubmenu = menuId;
            console.log('🔓 Submenu opened:', menuId);
        }
    }
    
    function closeAllSubmenus() {
        document.querySelectorAll('.submenu').forEach(submenu => {
            submenu.classList.remove('active');
        });
        
        document.querySelectorAll('.nav-item.has-submenu').forEach(item => {
            item.classList.remove('active');
        });
        
        currentSubmenu = null;
        console.log('🔒 All submenus closed');
    }
    
    // Export initialization function
    window.initializeLeftbar = initializeLeftbar;
    
    console.log('✅ Modern Leftbar script loaded');
})();

// Global Functions for onclick handlers

function toggleSidebar() {
    const sidebar = document.getElementById('leftSidebar');
    
    if (!sidebar) {
        console.error('❌ Sidebar element not found');
        return;
    }
    
    if (sidebar.classList.contains('expanded')) {
        // Collapse
        sidebar.classList.remove('expanded');
        document.body.classList.remove('sidebar-expanded');
        const icon = document.getElementById('toggleIcon');
        if (icon) icon.className = 'fa fa-bars';
        closeAllSubmenus();
        console.log('📕 Sidebar collapsed');
    } else {
        // Expand
        sidebar.classList.add('expanded');
        document.body.classList.add('sidebar-expanded');
        const icon = document.getElementById('toggleIcon');
        if (icon) icon.className = 'fa fa-indent';
        console.log('📖 Sidebar expanded');
    }
}

function toggleSubmenu(menuId) {
    const sidebar = document.getElementById('leftSidebar');
    
    if (!sidebar) {
        console.error('❌ Sidebar element not found');
        return;
    }
    
    // Always expand sidebar first if collapsed
    if (!sidebar.classList.contains('expanded')) {
        sidebar.classList.add('expanded');
        document.body.classList.add('sidebar-expanded');
        const icon = document.getElementById('toggleIcon');
        if (icon) icon.className = 'fa fa-indent';
        
        setTimeout(() => {
            showSubmenu(menuId);
        }, 300);
        return;
    }
    
    // If sidebar is expanded, toggle submenu
    const submenu = document.getElementById(`submenu-${menuId}`);
    const navItem = document.querySelector(`[data-menu="${menuId}"]`);
    
    if (!submenu || !navItem) {
        console.error('❌ Submenu not found:', menuId);
        return;
    }
    
    if (submenu.classList.contains('active')) {
        // Close current submenu
        submenu.classList.remove('active');
        navItem.classList.remove('active');
        console.log('🔒 Submenu closed:', menuId);
    } else {
        // Close all other submenus and open this one
        closeAllSubmenus();
        submenu.classList.add('active');
        navItem.classList.add('active');
        console.log('🔓 Submenu opened:', menuId);
    }
}

function closeSubmenu() {
    document.querySelectorAll('.submenu').forEach(submenu => {
        submenu.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-item.has-submenu').forEach(item => {
        item.classList.remove('active');
    });
    
    console.log('✅ Submenu closed via close button');
}

function showSubmenu(menuId) {
    closeAllSubmenus();
    
    const submenu = document.getElementById(`submenu-${menuId}`);
    const navItem = document.querySelector(`[data-menu="${menuId}"]`);
    
    if (submenu && navItem) {
        submenu.classList.add('active');
        navItem.classList.add('active');
        console.log('🔓 Submenu shown:', menuId);
    }
}

function closeAllSubmenus() {
    document.querySelectorAll('.submenu').forEach(submenu => {
        submenu.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-item.has-submenu').forEach(item => {
        item.classList.remove('active');
    });
    
    console.log('🔒 All submenus closed');
}

function confirmLogout() {
    const sessionDuration = document.getElementById('sessionDuration');
    const duration = sessionDuration ? sessionDuration.textContent : '00:00:00';
    
    const confirmMessage = `Are you sure you want to logout?\n\n` +
                          `User: Administrator\n` +
                          `System: SRMS Dashboard\n` +
                          `Session Duration: ${duration}\n` +
                          `Current Time: ${new Date().toLocaleString()}`;
    
    if (confirm(confirmMessage)) {
        console.log('🚪 Logout confirmed - Session:', duration);
        
        try {
            localStorage.clear();
            sessionStorage.clear();
            console.log('🧹 Session data cleared');
        } catch (error) {
            console.warn('⚠️ Could not clear storage:', error);
        }
        
        return true;
    } else {
        console.log('🚫 Logout cancelled by user');
        return false;
    }
}

// Settings functions - Updated to open actual pages with anchors
function openDatabaseBackup() {
    window.location.href = '../settings/settings.html';
    // Auto-trigger backup after page loads
    setTimeout(() => {
        if (window.settingsManager && window.settingsManager.createBackup) {
            window.settingsManager.createBackup();
        }
    }, 1000);
    console.log('💾 Opening database backup page');
}

function openDatabaseRestore() {
    window.location.href = '../settings/settings.html';
    // Auto-trigger restore dialog after page loads
    setTimeout(() => {
        if (window.settingsManager && window.settingsManager.showRestoreDialog) {
            window.settingsManager.showRestoreDialog();
        }
    }, 1000);
    console.log('📥 Opening database restore page');
}

function openSystemSettings() {
    window.location.href = '../settings/settings.html';
    console.log('⚙️ Opening system settings page');
}

// Export functions to global scope
window.toggleSidebar = toggleSidebar;
window.toggleSubmenu = toggleSubmenu;
window.closeSubmenu = closeSubmenu;
window.showSubmenu = showSubmenu;
window.closeAllSubmenus = closeAllSubmenus;
window.confirmLogout = confirmLogout;
window.openDatabaseBackup = openDatabaseBackup;
window.openDatabaseRestore = openDatabaseRestore;
window.openSystemSettings = openSystemSettings;

console.log('🌐 All leftbar functions available globally');