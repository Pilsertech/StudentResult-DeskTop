// Enhanced Leftbar JavaScript - Improved Functionality & Organization
(function() {
    'use strict';
    
    console.log('🚀 Loading optimized leftbar system...');
    
    let sessionStartTime = new Date();
    let activeMenu = null;
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initializeLeftbar, 50);
        setupScrollIsolation();
        setupKeyboardNavigation();
    });
    
    function initializeLeftbar() {
        console.log('🎯 Initializing enhanced leftbar...');
        
        // Core initialization
        setActiveMenuItem();
        updateFooterDate();
        updateSessionDuration();
        addTooltips();
        handleAvatarLoad();
        setupMenuClickHandlers();
        
        // Start intervals
        setInterval(updateSessionDuration, 1000);
        setInterval(updateFooterDate, 60000);
        
        console.log('✅ Enhanced leftbar initialized successfully');
    }
    
    // Setup click handlers for better performance
    function setupMenuClickHandlers() {
        document.querySelectorAll('.nav-item.has-children > a').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const menuTitle = this.querySelector('.nav-text').textContent;
                toggleMenu(this, menuTitle);
            });
        });
        
        console.log('🎯 Menu click handlers setup complete');
    }
    
    // Setup keyboard navigation and click-outside detection
    function setupKeyboardNavigation() {
        document.addEventListener('keydown', function(e) {
            // ESC key closes all submenus
            if (e.key === 'Escape') {
                closeAllSubmenus();
            }
            
            // Ctrl + Shift + M toggles sidebar
            if (e.ctrlKey && e.shiftKey && e.key === 'M') {
                e.preventDefault();
                toggleSidebar();
            }
        });
        
        // Click outside to close submenus
        document.addEventListener('click', function(e) {
            const clickedInsideSidebar = e.target.closest('.left-sidebar');
            const clickedOnSubmenu = e.target.closest('.child-nav');
            const clickedOnToggle = e.target.closest('.sidebar-toggle');
            const clickedOnCloseBtn = e.target.classList.contains('submenu-close-btn');
            
            if (!clickedInsideSidebar && !clickedOnSubmenu && !clickedOnToggle && !clickedOnCloseBtn) {
                closeAllSubmenus();
            }
        });
        
        console.log('⌨️ Enhanced keyboard navigation and click-outside detection setup complete');
    }
    
    // FIXED: Prevent scroll propagation to dashboard
    function setupScrollIsolation() {
        const sidebarNav = document.querySelector('.sidebar-nav');
        const childNavs = document.querySelectorAll('.child-nav');
        
        // Isolate main sidebar scroll
        if (sidebarNav) {
            sidebarNav.addEventListener('wheel', function(e) {
                const isScrollable = sidebarNav.scrollHeight > sidebarNav.clientHeight;
                if (isScrollable) {
                    e.stopPropagation();
                }
            });
        }
        
        // Isolate submenu scroll
        childNavs.forEach(nav => {
            nav.addEventListener('wheel', function(e) {
                const isScrollable = nav.scrollHeight > nav.clientHeight;
                if (isScrollable) {
                    e.stopPropagation();
                }
            });
        });
        
        console.log('🔒 Scroll isolation setup complete');
    }
    
    // Handle avatar loading with fallback
    function handleAvatarLoad() {
        const img = document.querySelector('.profile-img');
        const fallback = document.querySelector('.avatar-fallback');
        
        if (img && fallback) {
            img.addEventListener('error', function() {
                console.log('🖼️ Avatar image failed, showing fallback');
                img.style.display = 'none';
                fallback.style.display = 'flex';
            });
            
            img.addEventListener('load', function() {
                console.log('✅ Avatar image loaded successfully');
                fallback.style.display = 'none';
                img.style.display = 'block';
            });
        }
    }
    
    // Update session duration display
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
    
    // Update footer date
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
    
    // Set active menu item based on current page
    function setActiveMenuItem() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop().replace('.html', '');
        
        // Clear all active classes
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelectorAll('.child-nav a').forEach(link => {
            link.classList.remove('active');
        });
        
        // Find and set active menu
        const allLinks = document.querySelectorAll('.nav-item a, .child-nav a');
        
        allLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            if (href && href !== '#') {
                const linkPage = href.split('/').pop().replace('.html', '');
                
                if (linkPage === currentPage || 
                    (currentPage === 'dashboard' && href.includes('dashboard'))) {
                    
                    // Add active class to link
                    link.classList.add('active');
                    
                    // Add active to parent nav-item
                    const parentNavItem = link.closest('.nav-item');
                    if (parentNavItem) {
                        parentNavItem.classList.add('active');
                    }
                    
                    // If it's a child menu, open parent and expand sidebar
                    const parentHasChildren = link.closest('.has-children');
                    if (parentHasChildren && parentHasChildren !== parentNavItem) {
                        const sidebar = document.getElementById('leftSidebar');
                        sidebar.classList.add('expanded');
                        
                        // Update toggle icon
                        const icon = document.getElementById('toggleIcon');
                        if (icon) icon.className = 'fa fa-indent';
                        
                        setTimeout(() => {
                            parentHasChildren.classList.add('open');
                            console.log('📂 Auto-opened submenu for active page:', currentPage);
                        }, 150);
                    }
                }
            }
        });
        
        console.log('📍 Active menu set for page:', currentPage);
    }
    
    // Add tooltips for collapsed state
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
    
    // Handle mobile responsive behavior
    function initializeMobileNavigation() {
        const sidebar = document.getElementById('leftSidebar');
        
        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                sidebar?.classList.remove('mobile-open');
            }
        });
        
        console.log('📱 Mobile navigation initialized');
    }
    
    // Initialize mobile navigation
    setTimeout(initializeMobileNavigation, 100);
    
    console.log('✅ Leftbar script loaded');
})();

// GLOBAL FUNCTIONS - Available to onclick handlers

// IMPROVED: Toggle main sidebar with proper body class management
function toggleSidebar() {
    const sidebar = document.getElementById('leftSidebar');
    const icon = document.getElementById('toggleIcon');
    
    if (!sidebar) {
        console.error('❌ Sidebar element not found');
        return;
    }
    
    const isExpanded = sidebar.classList.contains('expanded');
    
    if (isExpanded) {
        // Collapse sidebar
        sidebar.classList.remove('expanded');
        document.body.classList.remove('sidebar-expanded');
        if (icon) icon.className = 'fa fa-bars';
        closeAllSubmenus();
        console.log('📕 Sidebar collapsed - Dashboard expanded');
    } else {
        // Expand sidebar
        sidebar.classList.add('expanded');
        document.body.classList.add('sidebar-expanded');
        if (icon) icon.className = 'fa fa-indent';
        console.log('📖 Sidebar expanded - Dashboard pushed');
    }
    
    // Update activeMenu tracking
    if (!isExpanded) {
        activeMenu = null;
    }
}

// IMPROVED: Smart menu toggle with state tracking
function toggleMenu(element, menuTitle) {
    const sidebar = document.getElementById('leftSidebar');
    
    if (!sidebar) {
        console.error('❌ Sidebar element not found');
        return;
    }
    
    // Always expand sidebar first if collapsed
    if (!sidebar.classList.contains('expanded')) {
        sidebar.classList.add('expanded');
        const icon = document.getElementById('toggleIcon');
        if (icon) icon.className = 'fa fa-indent';
        
        console.log('📖 Auto-expanding sidebar for menu access...');
        
        // Wait for sidebar expansion animation, then open menu
        setTimeout(() => {
            toggleMenuHelper(element, menuTitle);
        }, 300);
        return;
    }
    
    // Sidebar is already expanded, toggle menu immediately
    toggleMenuHelper(element, menuTitle);
}

// IMPROVED: Close all submenus function
function closeAllSubmenus() {
    document.querySelectorAll('.has-children.open').forEach(menu => {
        menu.classList.remove('open');
    });
    if (typeof activeMenu !== 'undefined') {
        activeMenu = null;
    }
    console.log('🔒 All submenus closed');
}

// IMPROVED: Helper function with better state management
function toggleMenuHelper(element, menuTitle) {
    const parentLi = element.closest('.has-children');
    
    if (!parentLi) {
        console.warn('❌ No parent menu found for:', menuTitle);
        return;
    }
    
    const isCurrentlyOpen = parentLi.classList.contains('open');
    const isSameAsActive = activeMenu === parentLi;
    
    // Close other open menus first
    if (!isSameAsActive) {
        closeAllSubmenus();
    }
    
    // Toggle current menu
    if (isCurrentlyOpen && isSameAsActive) {
        // Close current menu
        parentLi.classList.remove('open');
        activeMenu = null;
        console.log('🔒 Menu closed:', menuTitle);
    } else {
        // Open current menu
        setTimeout(() => {
            parentLi.classList.add('open');
            activeMenu = parentLi;
            console.log('🔓 Menu opened:', menuTitle);
        }, 50);
    }
}

// PRODUCTION FIX: Robust close button functionality
function closeSubmenu(closeBtn) {
    console.log('🎯 Close button clicked');
    
    if (!closeBtn) {
        console.error('❌ Close button element not provided');
        return false;
    }
    
    // Find the parent menu container
    const parentMenu = closeBtn.closest('.has-children');
    const childNav = closeBtn.closest('.child-nav');
    
    if (parentMenu) {
        // Immediately remove the open class
        parentMenu.classList.remove('open');
        activeMenu = null;
        
        console.log('✅ Submenu closed via close button');
        
        // Verify closure after animation
        setTimeout(() => {
            const isStillOpen = parentMenu.classList.contains('open');
            if (isStillOpen) {
                // Force close if still open
                parentMenu.classList.remove('open');
                console.warn('⚠️ Force-closed stubborn submenu');
            } else {
                console.log('✅ Submenu closure confirmed');
            }
        }, 50);
        
        return true;
    } else {
        console.warn('❌ Could not find parent menu container');
        
        // Fallback: try to close any open menus
        closeAllSubmenus();
        return false;
    }
}

// Add event delegation for close buttons
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('submenu-close-btn')) {
        e.preventDefault();
        e.stopPropagation();
        closeSubmenu(e.target);
    }
});

// Enhanced logout confirmation
function confirmLogout() {
    const sessionDuration = document.getElementById('sessionDuration');
    const duration = sessionDuration ? sessionDuration.textContent : '00:00:00';
    
    const currentTime = new Date().toLocaleString();
    const confirmMessage = `Are you sure you want to logout?\n\n` +
                          `User: Pilsertech\n` +
                          `System: SRMS Dashboard\n` +
                          `Session Duration: ${duration}\n` +
                          `Current Time: ${currentTime}`;
    
    if (confirm(confirmMessage)) {
        console.log('🚪 Logout confirmed - Session:', duration);
        
        // Clear all stored data
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

// Mobile toggle function (if needed)
function toggleMobileMenu() {
    const sidebar = document.getElementById('leftSidebar');
    if (sidebar) {
        sidebar.classList.toggle('mobile-open');
        console.log('📱 Mobile menu toggled');
    }
}

// Utility function to manually refresh menu states
function refreshMenuStates() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop().replace('.html', '');
    
    console.log('🔄 Refreshing menu states for:', currentPage);
    
    // Re-run active menu detection
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-item a, .child-nav a').forEach(link => {
        const href = link.getAttribute('href');
        
        if (href && href !== '#') {
            const linkPage = href.split('/').pop().replace('.html', '');
            
            if (linkPage === currentPage) {
                link.classList.add('active');
                const parentItem = link.closest('.nav-item');
                if (parentItem) {
                    parentItem.classList.add('active');
                }
            }
        }
    });
    
    console.log('✅ Menu states refreshed');
}

// Export functions to global scope for debugging
window.toggleSidebar = toggleSidebar;
window.toggleMenu = toggleMenu;
window.closeSubmenu = closeSubmenu;
window.confirmLogout = confirmLogout;
window.toggleMobileMenu = toggleMobileMenu;
window.refreshMenuStates = refreshMenuStates;

console.log('🌐 All leftbar functions available globally');
console.log('🎯 Click-based submenu system ready');
console.log('📅 Current session started:', new Date().toLocaleString());