/**
 * Professional Template Editor - Main Orchestrator
 * Coordinates all modules and provides legacy compatibility
 * Version: 2.0 - Complete rewrite for professional canvas editor
 */

// Wait for core to be ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Professional Template Editor - Main orchestrator starting...');
    
    // Wait for template editor core to initialize
    const waitForCore = setInterval(() => {
        if (window.templateEditorCore && window.templateEditorCore.isInitialized()) {
            clearInterval(waitForCore);
            initializeTemplateEditor();
        }
    }, 100);
    
    // Timeout after 10 seconds
    setTimeout(() => {
        clearInterval(waitForCore);
        if (!window.templateEditorCore?.isInitialized()) {
            console.error('❌ Template Editor Core failed to initialize within 10 seconds');
            showFallbackMessage();
        }
    }, 10000);
});

// Initialize the professional template editor
function initializeTemplateEditor() {
    try {
        console.log('🎯 Initializing Professional Template Editor...');
        
        // Verify all modules are loaded
        const requiredModules = ['canvas', 'templates', 'upload', 'elements', 'ui'];
        const loadedModules = Object.keys(window.templateEditorCore.modules).filter(
            key => window.templateEditorCore.modules[key] !== null
        );
        
        console.log('📦 Loaded modules:', loadedModules);
        
        const missingModules = requiredModules.filter(module => !loadedModules.includes(module));
        
        if (missingModules.length > 0) {
            console.warn('⚠️ Missing modules:', missingModules);
            // Continue anyway - modules might load later
        }
        
        // Set up template editor coordination
        setupEditorCoordination();
        
        // Initialize upload handlers
        setupUploadIntegration();
        
        // Set up canvas integration
        setupCanvasIntegration();
        
        // Initialize responsive design
        setupResponsiveDesign();
        
        // Set up auto-save (3-minute intervals as per master plan)
        setupAutoSave();
        
        // Initialize debugging tools
        setupDebuggingTools();
        
        console.log('✅ Professional Template Editor initialized successfully');
        
        // Show success message
        window.templateEditorCore.showMessage(
            'Professional Template Editor Ready! 🎨', 
            'success', 
            3000
        );
        
    } catch (error) {
        console.error('❌ Error initializing template editor:', error);
        window.templateEditorCore?.showMessage(
            'Failed to initialize template editor: ' + error.message, 
            'error'
        );
    }
}

// Setup editor coordination between modules
function setupEditorCoordination() {
    console.log('🔗 Setting up module coordination...');
    
    // Listen for template events
    window.templateEditorCore.on('templateDataChanged', (data) => {
        console.log('📝 Template data changed:', data);
        updateEditorState();
    });
    
    // Listen for canvas events
    window.templateEditorCore.on('canvasReady', () => {
        console.log('🎨 Canvas ready - enabling drag/drop');
        if (window.templateEditorCore.modules.elements) {
            window.templateEditorCore.modules.elements.initializeElementsPanel();
        }
    });
    
    // Listen for side changes
    window.templateEditorCore.on('sideChanged', (side) => {
        console.log(`🔄 Side changed to: ${side}`);
        updateSideIndicators(side);
    });
    
    // Listen for unsaved changes
    window.templateEditorCore.on('unsavedChanges', (hasChanges) => {
        updateSaveIndicator(hasChanges);
    });
}

// Setup upload integration
function setupUploadIntegration() {
    console.log('📤 Setting up upload integration...');
    
    // Monitor for image uploads
    window.templateEditorCore.on('frontImageChanged', (imageUrl) => {
        console.log('🖼️ Front image changed:', imageUrl);
        updateEditorVisibility();
    });
    
    window.templateEditorCore.on('backImageChanged', (imageUrl) => {
        console.log('🖼️ Back image changed:', imageUrl);
        updateEditorVisibility();
    });
}

// Setup canvas integration
function setupCanvasIntegration() {
    console.log('🎨 Setting up canvas integration...');
    
    // Enhance canvas with professional features
    if (window.templateEditorCore.modules.canvas) {
        const canvas = window.templateEditorCore.modules.canvas.canvas;
        
        if (canvas) {
            // Add professional canvas event handlers
            canvas.on('object:added', (e) => {
                console.log('➕ Object added to canvas:', e.target.type);
                window.templateEditorCore.markUnsavedChanges();
            });
            
            canvas.on('object:removed', (e) => {
                console.log('➖ Object removed from canvas:', e.target.type);
                window.templateEditorCore.markUnsavedChanges();
            });
            
            canvas.on('object:modified', (e) => {
                console.log('✏️ Object modified on canvas:', e.target.type);
                window.templateEditorCore.markUnsavedChanges();
            });
        }
    }
}

// Setup responsive design coordination
function setupResponsiveDesign() {
    console.log('📱 Setting up responsive design...');
    
    // Monitor window resize for canvas adjustments
    window.addEventListener('resize', debounce(() => {
        if (window.templateEditorCore.modules.canvas) {
            console.log('📐 Window resized - adjusting canvas...');
            // Canvas module handles its own responsive adjustments
        }
    }, 250));
}

// Setup auto-save functionality (3-minute intervals as per master plan)
function setupAutoSave() {
    console.log('💾 Setting up auto-save...');
    
    // Auto-save every 3 minutes as per master plan
    setInterval(() => {
        if (window.templateEditorCore.hasUnsavedChanges()) {
            console.log('💾 Auto-saving template...');
            window.templateEditorCore.createAutoBackup();
        }
    }, 3 * 60 * 1000); // 3 minutes
    
    // Save on page unload
    window.addEventListener('beforeunload', (e) => {
        if (window.templateEditorCore.hasUnsavedChanges()) {
            window.templateEditorCore.createAutoBackup();
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            return e.returnValue;
        }
    });
}

// Setup debugging tools for development
function setupDebuggingTools() {
    if (typeof window !== 'undefined') {
        // Global debugging functions
        window.debugTemplateEditor = () => console.table(window.templateEditorCore.getDebugInfo());
        window.debugCanvas = () => {
            if (window.templateEditorCore.modules.canvas) {
                console.log('🎨 Canvas Debug Info:', {
                    canvasReady: window.templateEditorCore.modules.canvas.canvasReady,
                    dimensions: window.templateEditorCore.modules.canvas.templateDimensions,
                    currentSide: window.templateEditorCore.modules.canvas.currentSide,
                    zoom: window.templateEditorCore.modules.canvas.zoom,
                    objectCount: window.templateEditorCore.modules.canvas.canvas?.getObjects()?.length || 0
                });
            }
        };
        
        window.debugModules = () => {
            console.log('📦 Module Status:', 
                Object.keys(window.templateEditorCore.modules).reduce((acc, key) => {
                    acc[key] = window.templateEditorCore.modules[key] !== null;
                    return acc;
                }, {})
            );
        };
        
        console.log('🛠️ Debug tools ready: debugTemplateEditor(), debugCanvas(), debugModules()');
    }
}

// Update editor state based on template changes
function updateEditorState() {
    const hasTemplate = window.templateEditorCore.getCurrentTemplate() !== null;
    const hasImages = (window.templateEditorCore.getFrontImage() !== null) || 
                     (window.templateEditorCore.getBackImage() !== null);
    
    // Update UI elements based on state
    if (window.templateEditorCore.modules.ui) {
        window.templateEditorCore.modules.ui.updateTemplateState(hasTemplate, hasImages);
    }
}

// Update side indicators
function updateSideIndicators(side) {
    const indicators = document.querySelectorAll('.side-indicator');
    indicators.forEach(indicator => {
        indicator.textContent = side.charAt(0).toUpperCase() + side.slice(1);
        indicator.className = `side-indicator ${side}-side`;
    });
}

// Update save indicator
function updateSaveIndicator(hasChanges) {
    const saveBtn = document.querySelector('button[onclick="saveTemplate()"]');
    if (saveBtn) {
        if (hasChanges) {
            saveBtn.classList.add('has-changes');
            saveBtn.innerHTML = '<i class="fa fa-save"></i> Save Changes';
        } else {
            saveBtn.classList.remove('has-changes');
            saveBtn.innerHTML = '<i class="fa fa-save"></i> Save Template';
        }
    }
    
    // Update page title with unsaved indicator
    const title = document.title;
    if (hasChanges && !title.startsWith('* ')) {
        document.title = '* ' + title;
    } else if (!hasChanges && title.startsWith('* ')) {
        document.title = title.substring(2);
    }
}

// Update editor visibility based on upload state
function updateEditorVisibility() {
    const frontImage = window.templateEditorCore.getFrontImage();
    const backImage = window.templateEditorCore.getBackImage();
    
    // Show editor panel only when at least front image is uploaded
    if (frontImage) {
        const editorPanel = document.getElementById('editorPanel');
        if (editorPanel) {
            editorPanel.style.display = 'block';
        }
        
        // Show canvas expand button
        const expandBtn = document.querySelector('.canvas-expand-btn');
        if (expandBtn) {
            expandBtn.style.display = 'flex';
        }
    }
}

// Show fallback message if core fails to load
function showFallbackMessage() {
    const messageArea = document.getElementById('messageArea');
    if (messageArea) {
        messageArea.innerHTML = `
            <div class="alert alert-error">
                <i class="fa fa-exclamation-triangle"></i>
                Failed to initialize professional template editor. Please refresh the page and try again.
                <div style="margin-top: 10px;">
                    <button class="btn btn-primary" onclick="window.location.reload()">
                        <i class="fa fa-refresh"></i> Refresh Page
                    </button>
                </div>
            </div>
        `;
        messageArea.style.display = 'block';
    }
}

// Utility: Debounce function
function debounce(func, wait) {
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

// ==============================================
// GLOBAL ONCLICK FUNCTIONS (Legacy Compatibility)
// ==============================================

// Template management functions
window.createNewTemplate = function() {
    if (window.templateEditorCore?.modules?.templates) {
        window.templateEditorCore.modules.templates.createNewTemplate();
    }
};

window.editTemplate = function(templateId) {
    if (window.templateEditorCore?.modules?.templates) {
        window.templateEditorCore.modules.templates.editTemplate(templateId);
    }
};

window.deleteTemplate = function(templateId) {
    if (window.templateEditorCore?.modules?.templates) {
        window.templateEditorCore.modules.templates.deleteTemplate(templateId);
    }
};

window.refreshTemplates = function() {
    if (window.templateEditorCore?.modules?.templates) {
        window.templateEditorCore.modules.templates.loadTemplates();
    }
};

window.saveTemplate = function() {
    if (window.templateEditorCore?.modules?.templates) {
        window.templateEditorCore.modules.templates.saveCurrentTemplate();
    }
};

window.cancelEdit = function() {
    if (window.templateEditorCore?.modules?.templates) {
        if (window.templateEditorCore.hasUnsavedChanges()) {
            if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                window.templateEditorCore.modules.templates.showTemplatesView();
            }
        } else {
            window.templateEditorCore.modules.templates.showTemplatesView();
        }
    }
};

// Canvas management functions
window.openPopupCanvas = function() {
    if (window.templateEditorCore?.modules?.canvas) {
        window.templateEditorCore.modules.canvas.openPopupEditor();
    }
};

window.zoomIn = function() {
    if (window.templateEditorCore?.modules?.canvas) {
        window.templateEditorCore.modules.canvas.zoomCanvas(1.2);
    }
};

window.zoomOut = function() {
    if (window.templateEditorCore?.modules?.canvas) {
        window.templateEditorCore.modules.canvas.zoomCanvas(0.8);
    }
};

window.resetZoom = function() {
    if (window.templateEditorCore?.modules?.canvas) {
        window.templateEditorCore.modules.canvas.resetZoom();
    }
};

// Upload management functions
window.removeFrontImage = function() {
    if (window.templateEditorCore?.modules?.upload) {
        window.templateEditorCore.modules.upload.removeFrontImage();
    }
};

window.removeBackImage = function() {
    if (window.templateEditorCore?.modules?.upload) {
        window.templateEditorCore.modules.upload.removeBackImage();
    }
};

// Preview functions
window.previewTemplate = function() {
    if (window.templateEditorCore?.modules?.canvas) {
        // Generate preview
        console.log('🔍 Generating template preview...');
        showPreviewModal();
    }
};

window.showPreviewSide = function(side) {
    const frontCard = document.getElementById('frontPreviewCard');
    const backCard = document.getElementById('backPreviewCard');
    const tabs = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    if (side === 'front') {
        if (frontCard) frontCard.style.display = 'block';
        if (backCard) backCard.style.display = 'none';
    } else {
        if (frontCard) frontCard.style.display = 'none';
        if (backCard) backCard.style.display = 'block';
    }
};

window.closePreviewModal = function() {
    const modal = document.getElementById('previewModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

window.saveTemplateFromPreview = function() {
    closePreviewModal();
    saveTemplate();
};

// Show preview modal
function showPreviewModal() {
    const modal = document.getElementById('previewModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Generate preview canvases
        generatePreviewCanvases();
    }
}

// Generate preview canvases
function generatePreviewCanvases() {
    const frontCanvas = document.getElementById('frontPreviewCanvas');
    const backCanvas = document.getElementById('backPreviewCanvas');
    
    if (frontCanvas && window.templateEditorCore?.modules?.canvas?.canvas) {
        // Create preview from main canvas
        const mainCanvas = window.templateEditorCore.modules.canvas.canvas;
        
        // Set preview canvas size
        frontCanvas.width = 400;
        frontCanvas.height = 250;
        
        // Draw scaled version of main canvas
        const ctx = frontCanvas.getContext('2d');
        const scale = Math.min(400 / mainCanvas.width, 250 / mainCanvas.height);
        
        ctx.clearRect(0, 0, 400, 250);
        ctx.save();
        ctx.scale(scale, scale);
        
        // Draw template background if available
        const frontImage = window.templateEditorCore.getFrontImage();
        if (frontImage) {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
                // Draw canvas objects on top
                drawCanvasObjects(ctx, mainCanvas, scale);
            };
            img.src = frontImage;
        } else {
            drawCanvasObjects(ctx, mainCanvas, scale);
        }
        
        ctx.restore();
    }
}

// Draw canvas objects on preview
function drawCanvasObjects(ctx, canvas, scale) {
    // This is a simplified preview - in real implementation,
    // you'd iterate through canvas objects and draw them
    console.log('🎨 Drawing preview with', canvas.getObjects().length, 'objects');
}

// ==============================================
// INITIALIZATION COMPLETE
// ==============================================

console.log('✅ Professional Template Editor - Main orchestrator loaded');
console.log('🎯 Waiting for core modules to initialize...');

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeTemplateEditor,
        setupEditorCoordination,
        updateEditorState
    };
}
