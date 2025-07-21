// Enhanced Navigation with Futuristic Features
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
});

function initializeNavigation() {
    console.log('Initializing futuristic navigation...');
    
    // Initialize sidebar
    initializeSidebar();
    
    // Initialize topbar
    initializeTopbar();
    
    // Initialize search
    initializeSearch();
    
    // Initialize notifications
    initializeNotifications();
    
    // Load navigation data
    loadNavigationData();
    
    // Initialize responsive behavior
    initializeResponsive();
    
    console.log('Navigation initialized successfully');
}

function initializeSidebar() {
    const sidebar = document.querySelector('.futuristic-sidebar');
    const sidebarItems = document.querySelectorAll('.nav-item.has-children');
    const collapseBtn = document.getElementById('collapseSidebar');
    const refreshBtn = document.getElementById('refreshSidebar');
    
    if (!sidebar) return;
    
    // Handle menu item clicks
    sidebarItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        const childNav = item.querySelector('.child-nav');
        
        if (link && childNav) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Close other open items
                sidebarItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('open');
                        const otherChildNav = otherItem.querySelector('.child-nav');
                        if (otherChildNav) {
                            otherChildNav.style.maxHeight = '0';
                        }
                    }
                });
                
                // Toggle current item
                item.classList.toggle('open');
                
                if (item.classList.contains('open')) {
                    childNav.style.maxHeight = childNav.scrollHeight + 'px';
                } else {
                    childNav.style.maxHeight = '0';
                }
            });
        }
    });
    
    // Handle sidebar collapse
    if (collapseBtn) {
        collapseBtn.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            
            const icon = this.querySelector('i');
            if (sidebar.classList.contains('collapsed')) {
                icon.className = 'fa fa-angle-right';
            } else {
                icon.className = 'fa fa-angle-left';
            }
        });
    }
    
    // Handle refresh
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            this.style.animation = 'spin 1s linear';
            loadNavigationData();
            setTimeout(() => {
                this.style.animation = '';
            }, 1000);
        });
    }
    
    // Set active menu item based on current page
    setActiveMenuItem();
}

function setActiveMenuItem() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link, .child-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.includes(href.replace('.html', ''))) {
            link.classList.add('active');
            
            // If it's a child link, open parent menu
            const parentItem = link.closest('.nav-item.has-children');
            if (parentItem) {
                parentItem.classList.add('open');
                const childNav = parentItem.querySelector('.child-nav');
                if (childNav) {
                    childNav.style.maxHeight = childNav.scrollHeight + 'px';
                }
            }
        }
    });
}

function initializeTopbar() {
    const fullscreenBtn = document.querySelector('.fullscreen-btn');
    const userToggle = document.querySelector('.user-toggle');
    const notificationToggle = document.querySelector('.notifications-dropdown .dropdown-toggle');
    
    // Handle fullscreen toggle
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleFullscreen();
        });
    }
    
    // Handle dropdown toggles
    if (userToggle) {
        userToggle.addEventListener('click', function(e) {
            e.preventDefault();
            toggleDropdown(this.closest('.dropdown'));
        });
    }
    
    if (notificationToggle) {
        notificationToggle.addEventListener('click', function(e) {
            e.preventDefault();
            toggleDropdown(this.closest('.dropdown'));
        });
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        const dropdowns = document.querySelectorAll('.dropdown.open');
        dropdowns.forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('open');
            }
        });
    });
}

function toggleDropdown(dropdown) {
    if (!dropdown) return;
    
    // Close other dropdowns
    document.querySelectorAll('.dropdown.open').forEach(otherDropdown => {
        if (otherDropdown !== dropdown) {
            otherDropdown.classList.remove('open');
        }
    });
    
    // Toggle current dropdown
    dropdown.classList.toggle('open');
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();
        
        if (query.length >= 2) {
            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 300);
        }
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch(this.value.trim());
        }
    });
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            performSearch(searchInput.value.trim());
        });
    }
}

function performSearch(query) {
    if (!query) return;
    
    console.log('Performing search for:', query);
    
    // Implement search functionality here
    // This could search through students, classes, results, etc.
    
    // Example: highlight matching menu items
    highlightSearchResults(query);
}

function highlightSearchResults(query) {
    const navTexts = document.querySelectorAll('.nav-text, .child-text');
    
    navTexts.forEach(text => {
        const textContent = text.textContent.toLowerCase();
        const queryLower = query.toLowerCase();
        
        if (textContent.includes(queryLower)) {
            text.style.background = 'rgba(255, 255, 0, 0.3)';
            text.style.borderRadius = '4px';
            text.style.padding = '2px 4px';
        } else {
            text.style.background = '';
            text.style.borderRadius = '';
            text.style.padding = '';
        }
    });
    
    // Clear highlights after 3 seconds
    setTimeout(() => {
        navTexts.forEach(text => {
            text.style.background = '';
            text.style.borderRadius = '';
            text.style.padding = '';
        });
    }, 3000);
}

function initializeNotifications() {
    // Load notifications
    loadNotifications();
    
    // Mark notifications as read when dropdown is opened
    const notificationDropdown = document.querySelector('.notifications-dropdown');
    if (notificationDropdown) {
        notificationDropdown.addEventListener('click', function() {
            setTimeout(() => {
                markNotificationsAsRead();
            }, 500);
        });
    }
}

function loadNotifications() {
    // This would typically fetch from an API
    // For now, we'll use sample data
    const sampleNotifications = [
        {
            id: 1,
            type: 'success',
            title: 'New Student Registered',
            message: 'John Smith joined Class 10-A',
            time: '2 minutes ago',
            read: false
        },
        {
            id: 2,
            type: 'warning',
            title: 'Result Pending',
            message: '5 results awaiting approval',
            time: '1 hour ago',
            read: false
        },
        {
            id: 3,
            type: 'info',
            title: 'System Update',
            message: 'New features available',
            time: '3 hours ago',
            read: true
        }
    ];
    
    updateNotificationBadge(sampleNotifications);
}

function updateNotificationBadge(notifications) {
    const badge = document.querySelector('.notification-badge');
    if (!badge) return;
    
    const unreadCount = notifications.filter(n => !n.read).length;
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

function markNotificationsAsRead() {
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        badge.style.display = 'none';
    }
}

async function loadNavigationData() {
    try {
        // Load student count
        const studentCountElement = document.getElementById('studentCount');
        const resultCountElement = document.getElementById('resultCount');
        const totalUsersElement = document.getElementById('totalUsers');
        const activeClassesElement = document.getElementById('activeClasses');
        
        // Fetch data from your API
        const response = await fetch('http://localhost:9000/dashboard/stats');
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                const data = result.data;
                
                if (studentCountElement) {
                    animateCounter(studentCountElement, data.totalStudents || 0);
                }
                
                if (resultCountElement) {
                    animateCounter(resultCountElement, data.totalResults || 0);
                }
                
                if (totalUsersElement) {
                    animateCounter(totalUsersElement, data.totalStudents || 0);
                }
                
                if (activeClassesElement) {
                    animateCounter(activeClassesElement, data.totalClasses || 0);
                }
            }
        }
    } catch (error) {
        console.warn('Could not load navigation data:', error);
        
        // Set default values
        setDefaultCounts();
    }
}

function setDefaultCounts() {
    const elements = [
        'studentCount',
        'resultCount', 
        'totalUsers',
        'activeClasses'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = '0';
        }
    });
}

function animateCounter(element, targetValue) {
    if (!element) return;
    
    const startValue = parseInt(element.textContent) || 0;
    const duration = 1000;
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentValue = Math.round(startValue + (targetValue - startValue) * progress);
        
        element.textContent = currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    animate();
}

function initializeResponsive() {
    const sidebar = document.querySelector('.futuristic-sidebar');
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    
    if (!sidebar || !mobileToggle) return;
    
    // Create overlay for mobile
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
    
    // Handle mobile toggle
    mobileToggle.addEventListener('click', function() {
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('active');
    });
    
    // Close sidebar when overlay is clicked
    overlay.addEventListener('click', function() {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('mobile-open');
            overlay.classList.remove('active');
        }
    });
}

// Logout functionality
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear any stored session data
        localStorage.removeItem('adminUsername');
        localStorage.removeItem('isLoggedIn');
        sessionStorage.clear();
        
        // Redirect to login
        window.location.href = '../login/index.html';
    }
}

// Attach logout handler to logout links
document.addEventListener('click', function(e) {
    if (e.target.closest('.logout-link')) {
        e.preventDefault();
        handleLogout();
    }
});

// Add CSS animation for spin
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);