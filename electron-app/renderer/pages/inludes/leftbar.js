// Enhanced Navigation JavaScript for Original Sidebar Structure
document.addEventListener('DOMContentLoaded', function() {
    initializeSidebar();
});

function initializeSidebar() {
    console.log('Initializing enhanced sidebar with original structure...');
    
    // Get all collapsible menu items
    const hasChildrenItems = document.querySelectorAll('.has-children');
    
    // Initialize each collapsible item
    hasChildrenItems.forEach(item => {
        const link = item.querySelector('a');
        const childNav = item.querySelector('.child-nav');
        
        if (link && childNav) {
            // Add click handler
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Close other open menus
                hasChildrenItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('open')) {
                        otherItem.classList.remove('open');
                        const otherChildNav = otherItem.querySelector('.child-nav');
                        if (otherChildNav) {
                            otherChildNav.style.maxHeight = '0';
                        }
                    }
                });
                
                // Toggle current menu
                const isOpen = item.classList.contains('open');
                
                if (isOpen) {
                    // Close menu
                    item.classList.remove('open');
                    childNav.style.maxHeight = '0';
                } else {
                    // Open menu
                    item.classList.add('open');
                    childNav.style.maxHeight = childNav.scrollHeight + 'px';
                }
            });
        }
    });
    
    // Set active menu item based on current page
    setActiveMenuItem();
    
    // Add hover effects
    addHoverEffects();
    
    console.log('Sidebar initialized successfully');
}

function setActiveMenuItem() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop().replace('.html', '');
    
    // Remove any existing active classes
    document.querySelectorAll('.side-nav li').forEach(li => {
        li.classList.remove('active');
    });
    
    document.querySelectorAll('.child-nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Set active states
    const allLinks = document.querySelectorAll('.side-nav a');
    
    allLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        if (href && href !== '#') {
            const linkPage = href.split('/').pop().replace('.html', '');
            
            if (linkPage === currentPage || 
                (currentPage === 'dashboard' && href.includes('dashboard')) ||
                href.includes(currentPage)) {
                
                // Add active class to the link
                link.classList.add('active');
                
                // Add active class to parent li
                const parentLi = link.closest('li');
                if (parentLi) {
                    parentLi.classList.add('active');
                }
                
                // If it's a child menu item, open the parent
                const parentHasChildren = link.closest('.has-children');
                if (parentHasChildren) {
                    parentHasChildren.classList.add('open');
                    const childNav = parentHasChildren.querySelector('.child-nav');
                    if (childNav) {
                        childNav.style.maxHeight = childNav.scrollHeight + 'px';
                    }
                }
            }
        }
    });
}

function addHoverEffects() {
    // Add ripple effect on click
    const allLinks = document.querySelectorAll('.side-nav a');
    
    allLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            createRipple(e, this);
        });
    });
}

function createRipple(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Handle mobile responsive behavior
function initializeMobileNavigation() {
    const sidebar = document.querySelector('.left-sidebar');
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    
    if (!sidebar || !mobileToggle) return;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 998;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    `;
    document.body.appendChild(overlay);
    
    // Toggle mobile menu
    mobileToggle.addEventListener('click', function() {
        sidebar.classList.toggle('mobile-open');
        overlay.style.opacity = sidebar.classList.contains('mobile-open') ? '1' : '0';
        overlay.style.visibility = sidebar.classList.contains('mobile-open') ? 'visible' : 'hidden';
    });
    
    // Close on overlay click
    overlay.addEventListener('click', function() {
        sidebar.classList.remove('mobile-open');
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('mobile-open');
            overlay.style.opacity = '0';
            overlay.style.visibility = 'hidden';
        }
    });
}

// Initialize mobile navigation
initializeMobileNavigation();

// Add ripple effect CSS
const rippleCSS = `
.ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(102, 126, 234, 0.3);
    transform: scale(0);
    animation: ripple-animation 0.6s linear;
    pointer-events: none;
}

@keyframes ripple-animation {
    to {
        transform: scale(2);
        opacity: 0;
    }
}
`;

const style = document.createElement('style');
style.textContent = rippleCSS;
document.head.appendChild(style);