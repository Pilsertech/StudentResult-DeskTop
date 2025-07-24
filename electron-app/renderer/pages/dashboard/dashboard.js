// HIGH-PERFORMANCE DASHBOARD JAVASCRIPT

class Dashboard {
    constructor() {
        this.cache = new Map();
        this.updateInterval = null;
        this.isLoading = false;
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Dashboard initializing...');
        
        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        // Start time updates
        this.updateTime();
        this.updateInterval = setInterval(() => this.updateTime(), 1000);
        
        // Load dashboard data
        this.loadDashboardData();
        
        // Set up refresh interval (every 30 seconds)
        setInterval(() => this.loadDashboardData(), 30000);
        
        console.log('✅ Dashboard ready');
    }
    
    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const timeElements = ['currentTime', 'lastUpdate'];
        timeElements.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = timeString;
        });
    }
    
    async loadDashboardData() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        const statsGrid = document.getElementById('statsGrid');
        
        if (statsGrid) {
            statsGrid.classList.add('loading');
        }
        
        try {
            const stats = await this.fetchStats();
            this.renderStats(stats);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.showError('Failed to load dashboard data');
        } finally {
            this.isLoading = false;
            if (statsGrid) {
                statsGrid.classList.remove('loading');
            }
        }
    }
    
    async fetchStats() {
        try {
            const response = await fetch('http://localhost:9000/dashboard/stats');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            // Fallback to demo data if API fails
            console.warn('API unavailable, using demo data');
            return this.getDemoData();
        }
    }
    
    getDemoData() {
        return {
            totalStudents: Math.floor(Math.random() * 1000) + 500,
            totalSubjects: Math.floor(Math.random() * 50) + 20,
            totalClasses: Math.floor(Math.random() * 30) + 10,
            totalResults: Math.floor(Math.random() * 800) + 200,
            activeStudents: Math.floor(Math.random() * 900) + 400,
            completionRate: Math.floor(Math.random() * 40) + 60
        };
    }
    
    renderStats(data) {
        const statsConfig = [
            {
                id: 'students',
                icon: 'fa-users',
                color: 'blue',
                label: 'Students',
                value: data.totalStudents || 0,
                link: '../students/manage-students.html'
            },
            {
                id: 'subjects',
                icon: 'fa-book',
                color: 'green',
                label: 'Subjects',
                value: data.totalSubjects || 0,
                link: '../subjects/manage-subjects.html'
            },
            {
                id: 'classes',
                icon: 'fa-graduation-cap',
                color: 'orange',
                label: 'Classes',
                value: data.totalClasses || 0,
                link: '../classes/manage-classes.html'
            },
            {
                id: 'results',
                icon: 'fa-file-text',
                color: 'purple',
                label: 'Results',
                value: data.totalResults || 0,
                link: '../results/manage-results.html'
            },
            {
                id: 'active',
                icon: 'fa-user-check',
                color: 'teal',
                label: 'Active Students',
                value: data.activeStudents || 0
            },
            {
                id: 'completion',
                icon: 'fa-percent',
                color: 'red',
                label: 'Completion Rate',
                value: (data.completionRate || 0) + '%'
            }
        ];
        
        const statsGrid = document.getElementById('statsGrid');
        if (!statsGrid) return;
        
        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        
        statsConfig.forEach(stat => {
            const card = this.createStatCard(stat);
            fragment.appendChild(card);
        });
        
        // Single DOM update
        statsGrid.innerHTML = '';
        statsGrid.appendChild(fragment);
        
        // Animate cards
        this.animateCards();
    }
    
    createStatCard(config) {
        const card = document.createElement(config.link ? 'a' : 'div');
        card.className = `stat-card ${config.color}`;
        if (config.link) card.href = config.link;
        
        card.innerHTML = `
            <div class="stat-header">
                <div class="stat-icon ${config.color}">
                    <i class="fa ${config.icon}"></i>
                </div>
            </div>
            <div class="stat-number" data-target="${config.value}">${config.value}</div>
            <div class="stat-label">${config.label}</div>
        `;
        
        return card;
    }
    
    animateCards() {
        // Animate numbers counting up
        const numbers = document.querySelectorAll('.stat-number[data-target]');
        
        numbers.forEach(el => {
            const target = parseInt(el.dataset.target) || 0;
            this.animateNumber(el, 0, target, 1000);
        });
    }
    
    animateNumber(element, start, end, duration) {
        const startTime = performance.now();
        const isPercentage = element.textContent.includes('%');
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (end - start) * easeOut);
            
            element.textContent = current + (isPercentage ? '%' : '');
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    showError(message) {
        const statsGrid = document.getElementById('statsGrid');
        if (statsGrid) {
            statsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #e74c3c;">
                    <i class="fa fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px;"></i>
                    <p>${message}</p>
                    <button onclick="dashboard.loadDashboardData()" style="margin-top: 10px; padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Try Again
                    </button>
                </div>
            `;
        }
    }
    
    // Cleanup
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.cache.clear();
    }
}

// Initialize dashboard
let dashboard;

document.addEventListener('DOMContentLoaded', () => {
    dashboard = new Dashboard();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (dashboard) {
        dashboard.destroy();
    }
});

// Export for debugging
window.dashboard = dashboard;