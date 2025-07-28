/**
 * Professional UI Manager - Interface State Management
 * Handles view switching, side toggle, responsive design, and overall UI coordination
 * Implements professional template editor interface as per master plan
 */

class UIManager {
    constructor(core) {
        this.core = core;
        this.currentView = 'templates'; // 'templates' or 'editor'
        this.currentSide = 'front';
        this.isResponsiveMode = false;
        this.breakpoints = {
            mobile: 768,
            tablet: 1024,
            desktop: 1200
        };
        
        this.init();
        console.log('🎨 UI Manager initialized with professional interface');
    }
    
    init() {
        this.setupResponsiveHandlers();
        this.setupSideToggleHandlers();
        this.setupViewTransitions();
        this.setupKeyboardShortcuts();
        this.checkResponsiveMode();
        
        console.log('✅ Professional UI Manager setup complete');
    }
    
    // Setup responsive design handlers
    setupResponsiveHandlers() {
        const mediaQueries = [
            window.matchMedia(`(max-width: ${this.breakpoints.mobile}px)`),
            window.matchMedia(`(max-width: ${this.breakpoints.tablet}px)`),
            window.matchMedia(`(min-width: ${this.breakpoints.desktop}px)`)
        ];
        
        mediaQueries.forEach(mq => {
            mq.addListener(() => this.handleResponsiveChange());
        });
        
        // Initial check
        this.handleResponsiveChange();
        
        // Window resize handler for canvas adjustments
        window.addEventListener('resize', () => {
            this.debounce(() => {
                this.handleWindowResize();
            }, 250)();
        });
    }
    
    // Handle responsive design changes
    handleResponsiveChange() {
        const width = window.innerWidth;
        
        if (width <= this.breakpoints.mobile) {
            this.setResponsiveMode('mobile');
        } else if (width <= this.breakpoints.tablet) {
            this.setResponsiveMode('tablet');
        } else {
            this.setResponsiveMode('desktop');
        }
    }
    
    // Set responsive mode and adjust UI accordingly
    setResponsiveMode(mode) {
        const body = document.body;
        
        // Remove previous responsive classes
        body.classList.remove('mobile-mode', 'tablet-mode', 'desktop-mode');
        body.classList.add(`${mode}-mode`);
        
        this.isResponsiveMode = mode !== 'desktop';
        
        console.log(`📱 Responsive mode: ${mode}`);
        
        // Adjust editor layout for responsive modes
        if (this.currentView === 'editor') {
            this.adjustEditorLayout(mode);
        }
        
        // Trigger canvas resize if needed
        if (this.core.modules.canvas) {
            setTimeout(() => {
                this.core.modules.canvas.resizeCanvas(
                    this.core.modules.canvas.templateDimensions.width,
                    this.core.modules.canvas.templateDimensions.height
                );
            }, 100);
        }
    }
    
    // Adjust editor layout for different screen sizes
    adjustEditorLayout(mode) {
        const editorWorkspace = document.querySelector('.editor-workspace');
        const elementsPanel = document.querySelector('.elements-panel');
        const propertiesPanel = document.querySelector('.properties-panel');
        const canvasArea = document.querySelector('.canvas-area');
        
        if (!editorWorkspace) return;
        
        switch (mode) {
            case 'mobile':
                // Stack panels vertically on mobile
                editorWorkspace.style.gridTemplateColumns = '1fr';
                editorWorkspace.style.gridTemplateRows = 'auto auto 1fr';
                editorWorkspace.style.height = 'auto';
                
                // Collapse panels to accordion style
                this.setupMobileAccordion();
                break;
                
            case 'tablet':
                // Two-column layout for tablet
                editorWorkspace.style.gridTemplateColumns = '250px 1fr';
                editorWorkspace.style.gridTemplateRows = '1fr auto';
                editorWorkspace.style.height = '600px';
                
                // Properties panel moves below canvas
                if (propertiesPanel && canvasArea) {
                    editorWorkspace.appendChild(canvasArea);
                    editorWorkspace.appendChild(propertiesPanel);
                }
                break;
                
            case 'desktop':
                // Three-column layout for desktop
                editorWorkspace.style.gridTemplateColumns = '280px 1fr 320px';
                editorWorkspace.style.gridTemplateRows = '1fr';
                editorWorkspace.style.height = '600px';
                break;
        }
    }
    
    // Setup mobile accordion for panels
    setupMobileAccordion() {
        const panels = [
            { selector: '.elements-panel', title: 'Elements Library', icon: 'fa-puzzle-piece' },
            { selector: '.properties-panel', title: 'Element Properties', icon: 'fa-sliders' }
        ];
        
        panels.forEach(panelInfo => {
            const panel = document.querySelector(panelInfo.selector);
            if (!panel) return;
            
            // Add accordion header if not exists
            let header = panel.querySelector('.accordion-header');
            if (!header) {
                header = document.createElement('div');
                header.className = 'accordion-header';
                header.innerHTML = `
                    <h4><i class="fa ${panelInfo.icon}"></i> ${panelInfo.title}</h4>
                    <button class="accordion-toggle">
                        <i class="fa fa-chevron-down"></i>
                    </button>
                `;
                panel.insertBefore(header, panel.firstChild);
                
                // Add click handler
                header.addEventListener('click', () => {
                    panel.classList.toggle('collapsed');
                    const icon = header.querySelector('.accordion-toggle i');
                    icon.className = panel.classList.contains('collapsed') ? 
                        'fa fa-chevron-right' : 'fa fa-chevron-down';
                });
                
                // Start collapsed on mobile
                panel.classList.add('collapsed');
            }
        });
    }
    
    // Setup side toggle handlers (Front/Back)
    setupSideToggleHandlers() {
        // Handle main side toggle
        document.addEventListener('change', (e) => {
            if (e.target.name === 'cardSide') {
                this.switchSide(e.target.value);
            }
        });
        
        // Handle popup side toggle
        document.addEventListener('change', (e) => {
            if (e.target.name === 'popupCardSide') {
                this.switchSide(e.target.value);
            }
        });
        
        // Handle click on toggle labels (for styling)
        document.addEventListener('click', (e) => {
            const toggleSwitch = e.target.closest('.toggle-switch');
            if (toggleSwitch) {
                const input = toggleSwitch.querySelector('input[type="radio"]');
                if (input && input.name.includes('cardSide')) {
                    // Update active styling
                    this.updateToggleStyling(input.name, input.value);
                }
            }
        });
    }
    
    // Switch between front and back sides
    switchSide(side) {
        if (this.currentSide === side) return;
        
        console.log(`🔄 UI switching to ${side} side`);
        
        this.currentSide = side;
        
        // Update toggle styling
        this.updateToggleStyling('cardSide', side);
        this.updateToggleStyling('popupCardSide', side);
        
        // Update canvas manager
        if (this.core.modules.canvas) {
            this.core.modules.canvas.switchSide(side);
        }
        
        // Update core state
        this.core.setCurrentSide(side);
        
        // Clear element selection when switching sides
        if (this.core.modules.elements) {
            this.core.modules.elements.clearProperties();
        }
        
        // Update visual indicators
        this.updateSideIndicators(side);
        
        console.log(`✅ UI switched to ${side} side`);
    }
    
    // Update toggle switch styling
    updateToggleStyling(toggleName, activeSide) {
        const toggles = document.querySelectorAll(`input[name="${toggleName}"]`);
        
        toggles.forEach(toggle => {
            const label = toggle.closest('.toggle-switch');
            if (!label) return;
            
            if (toggle.value === activeSide) {
                toggle.checked = true;
                label.classList.add('active');
            } else {
                toggle.checked = false;
                label.classList.remove('active');
            }
        });
    }
    
    // Update side indicators throughout the UI
    updateSideIndicators(side) {
        // Update any side-specific UI elements
        const sideIndicators = document.querySelectorAll('.side-indicator');
        sideIndicators.forEach(indicator => {
            indicator.textContent = side.charAt(0).toUpperCase() + side.slice(1);
            indicator.className = `side-indicator ${side}-side`;
        });
        
        // Update canvas header if exists
        const canvasHeader = document.querySelector('.canvas-header');
        if (canvasHeader) {
            const sideInfo = canvasHeader.querySelector('.canvas-side-info');
            if (sideInfo) {
                sideInfo.textContent = `Editing: ${side.charAt(0).toUpperCase() + side.slice(1)} Side`;
            }
        }
    }
    
    // Setup view transitions between templates list and editor
    setupViewTransitions() {
        // Monitor for view changes
        this.core.on('viewChanged', (view) => {
            this.transitionToView(view);
        });
    }
    
    // Transition to templates view
    showTemplatesView() {
        this.transitionToView('templates');
    }
    
    // Transition to editor view
    showEditorView() {
        this.transitionToView('editor');
    }
    
    // Handle view transitions with animations
    transitionToView(view) {
        if (this.currentView === view) return;
        
        console.log(`🔄 Transitioning to ${view} view`);
        
        const templatesSection = document.getElementById('templatesSection');
        const editorSection = document.getElementById('editorSection');
        
        if (!templatesSection || !editorSection) {
            console.warn('⚠️ View sections not found');
            return;
        }
        
        // Add transition classes
        document.body.classList.add('view-transitioning');
        
        if (view === 'templates') {
            // Show templates, hide editor
            editorSection.style.opacity = '0';
            setTimeout(() => {
                editorSection.style.display = 'none';
                templatesSection.style.display = 'block';
                templatesSection.style.opacity = '0';
                
                // Trigger reflow
                templatesSection.offsetHeight;
                
                templatesSection.style.opacity = '1';
                this.completeViewTransition();
            }, 200);
            
        } else if (view === 'editor') {
            // Show editor, hide templates
            templatesSection.style.opacity = '0';
            setTimeout(() => {
                templatesSection.style.display = 'none';
                editorSection.style.display = 'block';
                editorSection.style.opacity = '0';
                
                // Trigger reflow
                editorSection.offsetHeight;
                
                editorSection.style.opacity = '1';
                
                // Initialize editor components
                this.initializeEditorView();
                this.completeViewTransition();
            }, 200);
        }
        
        this.currentView = view;
        this.core.emit('viewTransitionComplete', view);
    }
    
    // Complete view transition
    completeViewTransition() {
        setTimeout(() => {
            document.body.classList.remove('view-transitioning');
        }, 300);
    }
    
    // Initialize editor view components
    initializeEditorView() {
        // Ensure all editor components are ready
        if (this.core.modules.canvas) {
            // Refresh canvas if needed
            setTimeout(() => {
                if (this.core.modules.canvas.canvas) {
                    this.core.modules.canvas.canvas.renderAll();
                }
            }, 100);
        }
        
        if (this.core.modules.elements) {
            // Refresh elements panel
            this.core.modules.elements.populateElementsPanel();
        }
        
        // Adjust layout for current responsive mode
        this.adjustEditorLayout(this.getCurrentResponsiveMode());
    }
    
    // Get current responsive mode
    getCurrentResponsiveMode() {
        const width = window.innerWidth;
        
        if (width <= this.breakpoints.mobile) return 'mobile';
        if (width <= this.breakpoints.tablet) return 'tablet';
        return 'desktop';
    }
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Skip if user is typing in input fields
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
                return;
            }
            
            // Tab: Switch sides (only in editor view)
            if (e.key === 'Tab' && this.currentView === 'editor') {
                e.preventDefault();
                const newSide = this.currentSide === 'front' ? 'back' : 'front';
                this.switchSide(newSide);
            }
            
            // Escape: Go back to templates view
            if (e.key === 'Escape' && this.currentView === 'editor') {
                if (this.core.hasUnsavedChanges()) {
                    if (confirm('You have unsaved changes. Are you sure you want to go back?')) {
                        this.showTemplatesView();
                    }
                } else {
                    this.showTemplatesView();
                }
            }
            
            // F11: Toggle full-screen editor (if available)
            if (e.key === 'F11' && this.currentView === 'editor') {
                e.preventDefault();
                if (this.core.modules.canvas) {
                    this.core.modules.canvas.openPopupEditor();
                }
            }
        });
    }
    
    // Handle window resize events
    handleWindowResize() {
        // Update responsive mode
        this.handleResponsiveChange();
        
        // Notify modules of resize
        this.core.emit('windowResize', {
            width: window.innerWidth,
            height: window.innerHeight
        });
        
        // Adjust canvas if needed
        if (this.core.modules.canvas && this.currentView === 'editor') {
            // Recalculate canvas container dimensions
            const canvasContainer = document.querySelector('.canvas-container');
            if (canvasContainer) {
                // Update canvas display
                setTimeout(() => {
                    if (this.core.modules.canvas.canvas) {
                        this.core.modules.canvas.canvas.renderAll();
                    }
                }, 100);
            }
        }
    }
    
    // Check and update responsive mode
    checkResponsiveMode() {
        this.handleResponsiveChange();
    }
    
    // Show loading state
    showLoading(message = 'Loading...') {
        const loadingOverlay = this.createLoadingOverlay(message);
        document.body.appendChild(loadingOverlay);
        
        setTimeout(() => {
            loadingOverlay.classList.add('visible');
        }, 10);
    }
    
    // Hide loading state
    hideLoading() {
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('visible');
            setTimeout(() => {
                loadingOverlay.remove();
            }, 300);
        }
    }
    
    // Create loading overlay
    createLoadingOverlay(message) {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner">
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                </div>
                <p class="loading-message">${message}</p>
            </div>
        `;
        
        return overlay;
    }
    
    // Update UI based on template state
    updateTemplateState(hasTemplate, hasImages) {
        const editorPanel = document.getElementById('editorPanel');
        const canvasExpandBtn = document.querySelector('.canvas-expand-btn');
        
        if (editorPanel) {
            editorPanel.style.display = hasImages ? 'block' : 'none';
        }
        
        if (canvasExpandBtn) {
            canvasExpandBtn.style.display = hasImages ? 'flex' : 'none';
        }
        
        // Update any template-dependent UI elements
        this.updateTemplateIndicators(hasTemplate, hasImages);
    }
    
    // Update template indicators
    updateTemplateIndicators(hasTemplate, hasImages) {
        const indicators = document.querySelectorAll('.template-indicator');
        indicators.forEach(indicator => {
            if (hasTemplate) {
                indicator.classList.add('has-template');
                indicator.classList.toggle('has-images', hasImages);
            } else {
                indicator.classList.remove('has-template', 'has-images');
            }
        });
    }
    
    // Show confirmation dialog
    showConfirmDialog(message, callback) {
        const confirmed = confirm(message);
        if (callback) {
            callback(confirmed);
        }
        return confirmed;
    }
    
    // Show custom modal dialog
    showModal(title, content, actions = []) {
        const modal = this.createModal(title, content, actions);
        document.body.appendChild(modal);
        
        setTimeout(() => {
            modal.classList.add('visible');
        }, 10);
        
        return modal;
    }
    
    // Create modal dialog
    createModal(title, content, actions) {
        const modal = document.createElement('div');
        modal.className = 'custom-modal-overlay';
        
        const actionsHTML = actions.map(action => 
            `<button class="btn ${action.class || 'btn-secondary'}" onclick="${action.onclick || ''}">${action.label}</button>`
        ).join('');
        
        modal.innerHTML = `
            <div class="custom-modal-container">
                <div class="custom-modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="this.closest('.custom-modal-overlay').remove()">&times;</button>
                </div>
                <div class="custom-modal-body">
                    ${content}
                </div>
                <div class="custom-modal-footer">
                    ${actionsHTML}
                </div>
            </div>
        `;
        
        return modal;
    }
    
    // Utility: Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Get current view
    getCurrentView() {
        return this.currentView;
    }
    
    // Get current side
    getCurrentSide() {
        return this.currentSide;
    }
    
    // Check if in responsive mode
    isInResponsiveMode() {
        return this.isResponsiveMode;
    }
}

// Register module with core when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.templateEditorCore) {
        const uiManager = new UIManager(window.templateEditorCore);
        window.templateEditorCore.registerModule('ui', uiManager);
    }
});

console.log('🎨 Professional UI Manager module loaded');
