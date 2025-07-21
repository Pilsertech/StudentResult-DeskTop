// Simple Professional Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard loading...');
    
    // Initialize dashboard
    initializeDashboard();
    
    // Update clock
    updateClock();
    setInterval(updateClock, 1000);
});

// Toggle sidebar menu
function toggleMenu(element) {
    const parentLi = element.closest('li');
    const childNav = parentLi.querySelector('.child-nav');
    
    // Close other open menus
    document.querySelectorAll('.has-children.open').forEach(item => {
        if (item !== parentLi) {
            item.classList.remove('open');
            const otherChild = item.querySelector('.child-nav');
            if (otherChild) {
                otherChild.style.maxHeight = '0';
            }
        }
    });
    
    // Toggle current menu
    if (parentLi.classList.contains('open')) {
        parentLi.classList.remove('open');
        childNav.style.maxHeight = '0';
    } else {
        parentLi.classList.add('open');
        childNav.style.maxHeight = childNav.scrollHeight + 'px';
    }
}

// Update real-time clock
function updateClock() {
    const now = new Date();
    const formatted = now.getFullYear() + '-' + 
                     String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(now.getDate()).padStart(2, '0') + ' ' +
                     String(now.getHours()).padStart(2, '0') + ':' + 
                     String(now.getMinutes()).padStart(2, '0') + ':' + 
                     String(now.getSeconds()).padStart(2, '0');
    
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = formatted;
    }
}

// Initialize dashboard
async function initializeDashboard() {
    try {
        await loadDashboardStats();
        initializeCounters();
        console.log('Dashboard initialized successfully');
    } catch (error) {
        console.error('Dashboard error:', error);
        // Show default values
        updateCounters({
            totalStudents: 0,
            totalSubjects: 0,
            totalClasses: 0,
            totalResults: 0
        });
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const response = await fetch('http://localhost:9000/dashboard/stats');
        const result = await response.json();
        
        if (result.success) {
            updateCounters(result.data);
        } else {
            throw new Error('Failed to load stats');
        }
    } catch (error) {
        console.warn('Using offline data:', error.message);
        // Use default values when server is not available
        updateCounters({
            totalStudents: 0,
            totalSubjects: 0,
            totalClasses: 0,
            totalResults: 0
        });
    }
}

// Update counter values
function updateCounters(data) {
    updateCounter('totalStudents', data.totalStudents || 0);
    updateCounter('totalSubjects', data.totalSubjects || 0);
    updateCounter('totalClasses', data.totalClasses || 0);
    updateCounter('totalResults', data.totalResults || 0);
}

// Animate counter
function updateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
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

// Initialize counters
function initializeCounters() {
    document.querySelectorAll('.counter').forEach(counter => {
        counter.textContent = '0';
    });
}

// Refresh dashboard
function refreshDashboard() {
    const button = event.target.closest('button');
    const icon = button.querySelector('i');
    
    // Add spinning animation
    icon.style.animation = 'spin 1s linear infinite';
    
    // Reload data
    loadDashboardStats().finally(() => {
        // Remove spinning animation
        setTimeout(() => {
            icon.style.animation = '';
        }, 1000);
    });
}

// Mobile sidebar toggle
document.addEventListener('click', function(e) {
    if (e.target.closest('.mobile-nav-toggle')) {
        const sidebar = document.querySelector('.left-sidebar');
        sidebar.classList.toggle('mobile-open');
    }
});

// Fullscreen toggle
document.addEventListener('click', function(e) {
    if (e.target.closest('.full-screen-handle')) {
        e.preventDefault();
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
});

// Add CSS for spin animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

console.log('Dashboard script loaded successfully');