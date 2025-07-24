// Simple, Reliable Topbar Functions
(function() {
    'use strict';
    document.addEventListener('DOMContentLoaded', function() {
        initializeTopbar();
    });
    function initializeTopbar() {
        updateClock();
        setInterval(updateClock, 1000);
        setActiveMenuItem();
    }
    function updateClock() {
        const timeElement = document.querySelector('#currentTime .time-value');
        if (timeElement) {
            const now = new Date();
            const timeString = now.getFullYear() + '-' +
                String(now.getMonth() + 1).padStart(2, '0') + '-' +
                String(now.getDate()).padStart(2, '0') + ' ' +
                String(now.getHours()).padStart(2, '0') + ':' +
                String(now.getMinutes()).padStart(2, '0') + ':' +
                String(now.getSeconds()).padStart(2, '0');
            timeElement.textContent = timeString;
        }
    }
    function setActiveMenuItem() {
        const currentPath = window.location.pathname;
        const quickActionLinks = document.querySelectorAll('.quick-actions a');
        quickActionLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && currentPath.includes(href.replace('.html', ''))) {
                link.classList.add('active');
            }
        });
    }
    window.toggleMobileMenu = function() {
        const navbar = document.querySelector('.futuristic-topbar');
        if (navbar) {
            navbar.classList.toggle('mobile-open');
        }
    };
    window.confirmLogout = function(event) {
        if (!confirm('Are you sure you want to logout?')) {
            event.preventDefault();
            return false;
        }
        localStorage.clear();
        sessionStorage.clear();
        return true;
    };
})();