/**
 * Professional Template Editor Core Manager
 * Version: 2.0 - Complete rewrite for professional canvas editor
 * Manages all modules and provides centralized state management
 */

class TemplateEditorCore {
    constructor() {
        console.log('🚀 Professional Template Editor Core v2.0 Initializing...');
        
        // Core state
        this.version = '2.0.0';
        this.initialized = false;
        this.currentTemplate = null;
        this.currentSide = 'front';
        this.unsavedChanges = false;
        
        // Images and canvas
        this.frontImage = null;
        this.backImage = null;
        this.canvas = null;
        this.canvasReady = false;
        
        // Template data structure following master plan
        this.templateData = {
            elements: [],
            canvas: {
                front: { width: 0, height: 0 },
                back: { width: 0, height: 0 }
            },
            customAssets: [],
            undoHistory: [],
            gridSettings: {
                enabled: true,
                size: 10,
                snapEnabled: true,
                snapThreshold: 10,
                snapToElements: true,
                snapToEdges: true
            },
            layerSettings: {
                autoNaming: true,
                namingPattern: "{type} {number}"
            }
        };
        
        // Module references
        this.modules = {
            canvas: null,
            templates: null,
            upload: null,
            elements: null,
            ui: null,
            history: null,
            library: null,
            alignment: null,
            export: null,
            assets: null,
            validation: null
        };
        
        // Element types library (enhanced from master plan)
        this.elementTypes = {
            // Student Data Elements
            'studentName': { 
                label: 'Student Name', 
                icon: 'fa-user', 
                category: 'student',
                defaultProps: { fontSize: 20, fontFamily: 'Arial', color: '#000000' }
            },
            'rollId': { 
                label: 'Roll ID', 
                icon: 'fa-id-badge', 
                category: 'student',
                defaultProps: { fontSize: 16, fontFamily: 'Arial', color: '#000000' }
            },
            'className': { 
                label: 'Class Name', 
                icon: 'fa-graduation-cap', 
                category: 'student',
                defaultProps: { fontSize: 16, fontFamily: 'Arial', color: '#000000' }
            },
            'studentId': { 
                label: 'Student ID', 
                icon: 'fa-hashtag', 
                category: 'student',
                defaultProps: { fontSize: 14, fontFamily: 'Arial', color: '#000000' }
            },
            'photo': { 
                label: 'Student Photo', 
                icon: 'fa-camera', 
                category: 'student',
                defaultProps: { width: 120, height: 150, borderRadius: 5 }
            },
            
            // QR/Barcode Elements
            'qrCode': { 
                label: 'QR Code', 
                icon: 'fa-qrcode', 
                category: 'codes',
                defaultProps: { width: 80, height: 80, backgroundColor: '#ffffff' }
            },
            'barcode': { 
                label: 'Barcode', 
                icon: 'fa-barcode', 
                category: 'codes',
                defaultProps: { width: 120, height: 40, backgroundColor: '#ffffff' }
            },
            
            // Custom Elements
            'customText': { 
                label: 'Custom Text', 
                icon: 'fa-font', 
                category: 'custom',
                defaultProps: { fontSize: 16, fontFamily: 'Arial', color: '#000000' }
            },
            'logo': { 
                label: 'Logo/Image', 
                icon: 'fa-image', 
                category: 'custom',
                defaultProps: { width: 100, height: 100 }
            }
        };
        
        // API endpoints
        this.endpoints = {
            templates: 'http://localhost:9000/idcards/templates',
            upload: 'http://localhost:9000/idcards/templates/upload',
            classes: 'http://localhost:9000/idcards/classes',
            assets: 'http://localhost:9000/idcards/assets'
        };
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🔧 Setting up Professional Template Editor...');
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setup());
            } else {
                await this.setup();
            }
        } catch (error) {
            console.error('❌ Core initialization failed:', error);
            this.showMessage('Failed to initialize template editor: ' + error.message, 'error');
        }
    }
    
    async setup() {
        console.log('🎨 Professional Canvas Editor Setup Starting...');
        
        // Setup DOM references
        this.setupDOMReferences();
        
        // Setup auto-backup system (3-minute intervals as per master plan)
        this.setupAutoBackup();
        
        // Setup save confirmation for unsaved changes
        this.setupSaveConfirmation();
        
        // Setup keyboard shortcuts
        this.setupGlobalKeyboardShortcuts();
        
        // Wait for modules to register themselves
        await this.waitForModules();
        
        console.log('✅ Professional Template Editor Core initialized successfully');
        this.initialized = true;
        this.showMessage('Professional Template Editor Ready', 'success', 3000);
    }
    
    setupDOMReferences() {
        this.dom = {
            messageArea: document.getElementById('messageArea'),
            templatesSection: document.getElementById('templatesSection'),
            editorSection: document.getElementById('editorSection'),
            templatesGrid: document.getElementById('templatesGrid'),
            canvas: document.getElementById('templateCanvas')
        };
    }
    
    setupAutoBackup() {
        // Auto-backup every 3 minutes as specified in master plan
        setInterval(() => {
            if (this.unsavedChanges && this.currentTemplate) {
                this.createAutoBackup();
            }
        }, 3 * 60 * 1000); // 3 minutes
        
        console.log('💾 Auto-backup system enabled (3-minute intervals)');
    }
    
    setupSaveConfirmation() {
        // Browser close detection with save prompt
        window.addEventListener('beforeunload', (e) => {
            if (this.unsavedChanges) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        });
        
        // Page navigation detection
        window.addEventListener('pagehide', () => {
            if (this.unsavedChanges) {
                this.createAutoBackup();
            }
        });
    }
    
    setupGlobalKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Skip if user is typing in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            // Ctrl+S: Save
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveTemplate();
            }
            
            // Ctrl+Z: Undo
            if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
            }
            
            // Ctrl+Y or Ctrl+Shift+Z: Redo
            if (e.ctrlKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                this.redo();
            }
            
            // Delete: Remove selected element
            if (e.key === 'Delete') {
                this.deleteSelectedElement();
            }
            
            // Tab: Switch sides
            if (e.key === 'Tab') {
                e.preventDefault();
                this.switchSide(this.currentSide === 'front' ? 'back' : 'front');
            }
        });
    }
    
    async waitForModules() {
        console.log('⏳ Waiting for modules to register...');
        
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds
        
        while (attempts < maxAttempts) {
            // Check if critical modules are registered
            if (this.modules.canvas && this.modules.elements && this.modules.ui) {
                console.log('✅ Critical modules registered');
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        console.warn('⚠️ Some modules may not have registered properly');
    }
    
    // Module Registration System
    registerModule(name, instance) {
        this.modules[name] = instance;
        console.log(`📦 Module registered: ${name}`);
        
        // Auto-initialize if this is a critical module
        if (['canvas', 'elements', 'ui'].includes(name) && this.initialized) {
            this.onCriticalModuleReady();
        }
    }
    
    onCriticalModuleReady() {
        console.log('🎯 Critical modules ready - initializing editor');
        
        // Load templates if available
        if (this.modules.templates) {
            this.modules.templates.loadTemplates();
        }
    }
    
    // Core State Management
    setTemplate(template) {
        this.currentTemplate = template;
        this.markUnsavedChanges();
    }
    
    getTemplate() {
        return this.currentTemplate;
    }
    
    setCurrentSide(side) {
        this.currentSide = side;
        this.emit('sideChanged', side);
    }
    
    getCurrentSide() {
        return this.currentSide;
    }
    
    switchSide(side) {
        if (this.modules.ui) {
            this.modules.ui.switchSide(side);
        }
    }
    
    setCanvas(canvas) {
        this.canvas = canvas;
        this.canvasReady = true;
        this.emit('canvasReady', canvas);
    }
    
    getCanvas() {
        return this.canvas;
    }
    
    // Image Management
    setFrontImage(image) {
        this.frontImage = image;
        this.markUnsavedChanges();
        this.emit('frontImageChanged', image);
    }
    
    getFrontImage() {
        return this.frontImage;
    }
    
    setBackImage(image) {
        this.backImage = image;
        this.markUnsavedChanges();
        this.emit('backImageChanged', image);
    }
    
    getBackImage() {
        return this.backImage;
    }
    
    // Template Data Management (following master plan structure)
    updateTemplateData(data) {
        this.templateData = { ...this.templateData, ...data };
        this.markUnsavedChanges();
        this.emit('templateDataChanged', this.templateData);
    }
    
    getTemplateData() {
        return this.templateData;
    }
    
    // Unsaved Changes Management
    markUnsavedChanges() {
        this.unsavedChanges = true;
        this.emit('unsavedChanges', true);
    }
    
    markSaved() {
        this.unsavedChanges = false;
        this.emit('unsavedChanges', false);
    }
    
    hasUnsavedChanges() {
        return this.unsavedChanges;
    }
    
    // Auto-backup System
    createAutoBackup() {
        try {
            const backupData = {
                template: this.currentTemplate,
                templateData: this.templateData,
                frontImage: this.frontImage ? 'stored' : null,
                backImage: this.backImage ? 'stored' : null,
                timestamp: new Date().toISOString()
            };
            
            // Store in localStorage (permanent as per master plan)
            localStorage.setItem('templateEditor_autoBackup', JSON.stringify(backupData));
            localStorage.setItem('templateEditor_autoBackup_timestamp', backupData.timestamp);
            
            console.log('💾 Auto-backup created:', backupData.timestamp);
        } catch (error) {
            console.error('❌ Auto-backup failed:', error);
        }
    }
    
    restoreAutoBackup() {
        try {
            const backupData = localStorage.getItem('templateEditor_autoBackup');
            if (backupData) {
                const data = JSON.parse(backupData);
                console.log('🔄 Auto-backup found:', data.timestamp);
                return data;
            }
        } catch (error) {
            console.error('❌ Failed to restore auto-backup:', error);
        }
        return null;
    }
    
    // Template Operations
    async saveTemplate() {
        if (!this.currentTemplate) {
            this.showMessage('No template to save', 'warning');
            return;
        }
        
        if (this.modules.templates) {
            await this.modules.templates.saveCurrentTemplate();
        }
    }
    
    deleteSelectedElement() {
        if (this.modules.elements) {
            this.modules.elements.deleteSelectedElement();
        }
    }
    
    // Undo/Redo System (10-step history as per master plan)
    undo() {
        if (this.modules.history) {
            this.modules.history.undo();
        } else {
            console.log('🔄 Undo system not available yet');
        }
    }
    
    redo() {
        if (this.modules.history) {
            this.modules.history.redo();
        } else {
            console.log('🔄 Redo system not available yet');
        }
    }
    
    // Message System
    showMessage(message, type = 'info', duration = 5000) {
        if (!this.dom.messageArea) return;
        
        const alertClass = {
            'error': 'alert-error',
            'success': 'alert-success', 
            'warning': 'alert-warning',
            'info': 'alert-info'
        }[type] || 'alert-info';
        
        const alertHTML = `
            <div class="alert ${alertClass}">
                <i class="fa fa-${type === 'error' ? 'exclamation-triangle' : 
                                  type === 'success' ? 'check' : 
                                  type === 'warning' ? 'warning' : 'info'}"></i>
                ${message}
                <button class="alert-close" onclick="this.parentElement.remove()">&times;</button>
            </div>
        `;
        
        this.dom.messageArea.innerHTML = alertHTML;
        this.dom.messageArea.style.display = 'block';
        
        if (duration > 0) {
            setTimeout(() => {
                if (this.dom.messageArea) {
                    this.dom.messageArea.style.display = 'none';
                }
            }, duration);
        }
    }
    
    // Event System
    on(event, callback) {
        if (!this.eventListeners) this.eventListeners = {};
        if (!this.eventListeners[event]) this.eventListeners[event] = [];
        this.eventListeners[event].push(callback);
    }
    
    emit(event, data) {
        if (!this.eventListeners || !this.eventListeners[event]) return;
        this.eventListeners[event].forEach(callback => callback(data));
    }
    
    // Utility Methods
    getElementTypes() {
        return this.elementTypes;
    }
    
    getEndpoint(name) {
        return this.endpoints[name];
    }
    
    isInitialized() {
        return this.initialized;
    }
    
    getVersion() {
        return this.version;
    }
    
    // Debug and Development Tools
    getDebugInfo() {
        return {
            version: this.version,
            initialized: this.initialized,
            currentTemplate: this.currentTemplate?.id || null,
            currentSide: this.currentSide,
            unsavedChanges: this.unsavedChanges,
            canvasReady: this.canvasReady,
            modules: Object.keys(this.modules).reduce((acc, key) => {
                acc[key] = this.modules[key] !== null;
                return acc;
            }, {}),
            templateData: this.templateData
        };
    }
}

// Global instance initialization
console.log('🎨 Initializing Professional Template Editor Core...');
window.templateEditorCore = new TemplateEditorCore();

// Legacy compatibility
window.TemplateEditor = window.templateEditorCore;

// Development helper
if (typeof window !== 'undefined') {
    window.debugTemplateEditor = () => console.table(window.templateEditorCore.getDebugInfo());
}

console.log('✅ Professional Template Editor Core v2.0 Ready');
