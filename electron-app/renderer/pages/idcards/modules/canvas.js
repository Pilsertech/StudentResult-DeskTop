/**
 * Professional Canvas Manager - Fabric.js Integration
 * Implements full-screen popup canvas with 10px grid snapping, edge snapping, and professional controls
 * Based on fabricjs-image-editor patterns for better canvas handling
 */

class CanvasManager {
    constructor(core) {
        this.core = core;
        this.canvas = null;
        this.popupCanvas = null;
        this.currentSide = 'front';
        this.isPopupMode = false;
        this.zoom = 1.0;
        this.snapGrid = 10; // 10px grid as per master plan
        this.snapThreshold = 10;
        this.snapEnabled = true;
        this.ctrlPressed = false;
        
        // Template images
        this.frontImage = null;
        this.backImage = null;
        this.templateDimensions = { width: 1050, height: 650 };
        
        // Grid and snapping settings from master plan
        this.gridSettings = {
            enabled: true,
            size: 10,
            snapEnabled: true,
            snapThreshold: 10,
            snapToElements: true,
            snapToEdges: true
        };
        
        console.log('🎨 Canvas Manager initialized with professional features');
    }
    
    // Initialize canvas with professional features
    async initializeCanvas() {
        try {
            console.log('🎯 Initializing professional canvas...');
            
            // Initialize main canvas (compact mode)
            await this.setupMainCanvas();
            
            // Setup keyboard handlers for CTRL override
            this.setupKeyboardHandlers();
            
            // Setup canvas event handlers
            this.setupCanvasEvents();
            
            console.log('✅ Professional canvas initialized successfully');
            
        } catch (error) {
            console.error('❌ Canvas initialization failed:', error);
            this.core.showMessage('Canvas initialization failed: ' + error.message, 'error');
        }
    }
    
    // Setup main canvas (compact embedded mode)
    async setupMainCanvas() {
        const canvasElement = document.getElementById('templateCanvas');
        if (!canvasElement) {
            throw new Error('Canvas element not found');
        }
        
        // Initialize Fabric.js canvas with professional settings
        this.canvas = new fabric.Canvas('templateCanvas', {
            width: this.templateDimensions.width,
            height: this.templateDimensions.height,
            backgroundColor: 'transparent',
            preserveObjectStacking: true,
            enableRetinaScaling: true,
            selection: true,
            
            // Professional canvas settings
            uniformScaling: false,
            uniScaleTransform: false,
            centeredScaling: false,
            centeredRotation: false,
            
            // Performance optimizations
            renderOnAddRemove: true,
            skipTargetFind: false,
            allowTouchScrolling: false
        });
        
        // Set initial canvas size to match template dimensions
        this.resizeCanvas(this.templateDimensions.width, this.templateDimensions.height);
        
        // Register with core
        this.core.setCanvas(this.canvas);
        
        console.log('📐 Main canvas setup complete:', this.templateDimensions);
    }
    
    // Open full-screen popup canvas editor
    async openPopupEditor() {
        try {
            console.log('🚀 Opening full-screen canvas editor...');
            
            if (this.isPopupMode) {
                console.warn('⚠️ Popup already open');
                return;
            }
            
            // Create popup overlay
            this.createPopupOverlay();
            
            // Initialize popup canvas
            await this.setupPopupCanvas();
            
            // Transfer current canvas state to popup
            await this.transferCanvasToPopup();
            
            // Show popup
            this.showPopup();
            
            console.log('✅ Full-screen editor opened successfully');
            
        } catch (error) {
            console.error('❌ Failed to open popup editor:', error);
            this.core.showMessage('Failed to open full-screen editor: ' + error.message, 'error');
        }
    }
    
    // Create popup overlay HTML structure
    createPopupOverlay() {
        // Remove existing popup if any
        const existingPopup = document.getElementById('canvasPopupOverlay');
        if (existingPopup) {
            existingPopup.remove();
        }
        
        const popupHTML = `
            <div class="canvas-popup-overlay" id="canvasPopupOverlay">
                <div class="canvas-popup-container">
                    <!-- Enhanced Header -->
                    <div class="popup-header">
                        <div class="popup-title">
                            <i class="fa fa-paint-brush"></i>
                            <span>Professional Template Editor</span>
                            <small>Full-Screen Mode</small>
                        </div>
                        
                        <div class="popup-controls">
                            <!-- Side Toggle -->
                            <div class="side-toggle-popup">
                                <label class="toggle-switch">
                                    <input type="radio" name="popupCardSide" value="front" checked>
                                    <span><i class="fa fa-id-card"></i> Front</span>
                                </label>
                                <label class="toggle-switch">
                                    <input type="radio" name="popupCardSide" value="back">
                                    <span><i class="fa fa-id-card-o"></i> Back</span>
                                </label>
                            </div>
                            
                            <!-- Zoom Controls -->
                            <div class="zoom-controls-popup">
                                <button class="btn" onclick="templateEditorCore.canvasManager.zoomPopup(0.8)" title="Zoom Out">
                                    <i class="fa fa-search-minus"></i>
                                </button>
                                <span class="zoom-level-popup" id="popupZoomLevel">100%</span>
                                <button class="btn" onclick="templateEditorCore.canvasManager.zoomPopup(1.2)" title="Zoom In">
                                    <i class="fa fa-search-plus"></i>
                                </button>
                                <button class="btn" onclick="templateEditorCore.canvasManager.resetPopupZoom()" title="Reset Zoom">
                                    <i class="fa fa-expand"></i>
                                </button>
                            </div>
                            
                            <!-- Grid Toggle -->
                            <button class="btn" onclick="templateEditorCore.canvasManager.toggleGrid()" title="Toggle Grid" id="gridToggleBtn">
                                <i class="fa fa-th"></i> Grid
                            </button>
                        </div>
                        
                        <div class="popup-actions">
                            <button class="btn btn-success" onclick="templateEditorCore.canvasManager.saveAndClosePopup()">
                                <i class="fa fa-save"></i> Save & Close
                            </button>
                            <button class="btn btn-secondary" onclick="templateEditorCore.canvasManager.closePopup()">
                                <i class="fa fa-times"></i> Close
                            </button>
                        </div>
                    </div>
                    
                    <!-- Enhanced Workspace -->
                    <div class="popup-workspace">
                        <!-- Left Sidebar - Elements -->
                        <div class="popup-sidebar-left">
                            <h4><i class="fa fa-puzzle-piece"></i> Elements Library</h4>
                            <div class="element-categories-popup" id="popupElementCategories">
                                <!-- Will be populated by elements manager -->
                            </div>
                        </div>
                        
                        <!-- Center Canvas Area -->
                        <div class="popup-canvas-area">
                            <canvas id="popupTemplateCanvas"></canvas>
                        </div>
                        
                        <!-- Right Sidebar - Properties -->
                        <div class="popup-sidebar-right">
                            <h4><i class="fa fa-sliders"></i> Element Properties</h4>
                            <div class="popup-properties-content" id="popupPropertiesContent">
                                <div class="no-selection">
                                    <i class="fa fa-mouse-pointer"></i>
                                    <p>Select an element to edit properties</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', popupHTML);
    }
    
    // Setup popup canvas with enhanced features
    async setupPopupCanvas() {
        const popupCanvasElement = document.getElementById('popupTemplateCanvas');
        if (!popupCanvasElement) {
            throw new Error('Popup canvas element not found');
        }
        
        // Calculate optimal canvas size for popup
        const { width, height } = this.calculatePopupCanvasSize();
        
        // Initialize popup canvas with professional settings
        this.popupCanvas = new fabric.Canvas('popupTemplateCanvas', {
            width: width,
            height: height,
            backgroundColor: 'transparent',
            preserveObjectStacking: true,
            enableRetinaScaling: true,
            selection: true,
            
            // Enhanced settings for popup mode
            uniformScaling: false,
            uniScaleTransform: false,
            centeredScaling: false,
            centeredRotation: false,
            
            // Professional interaction settings
            targetFindTolerance: 10,
            perPixelTargetFind: true,
            enableGLFiltering: true,
            
            // Performance optimizations for large canvas
            renderOnAddRemove: true,
            skipTargetFind: false,
            allowTouchScrolling: false
        });
        
        // Setup grid snapping for popup canvas
        this.setupGridSnapping(this.popupCanvas);
        
        // Setup edge snapping for popup canvas
        this.setupEdgeSnapping(this.popupCanvas);
        
        // Setup element snapping for popup canvas
        this.setupElementSnapping(this.popupCanvas);
        
        // Setup popup canvas events
        this.setupPopupCanvasEvents();
        
        console.log('🎯 Popup canvas setup complete:', { width, height });
    }
    
    // Calculate optimal canvas size for popup mode
    calculatePopupCanvasSize() {
        const workspace = document.querySelector('.popup-canvas-area');
        if (!workspace) {
            return this.templateDimensions;
        }
        
        const workspaceRect = workspace.getBoundingClientRect();
        const padding = 80; // Padding around canvas
        
        const maxWidth = workspaceRect.width - padding;
        const maxHeight = workspaceRect.height - padding;
        
        // Scale template to fit while maintaining aspect ratio
        const scaleX = maxWidth / this.templateDimensions.width;
        const scaleY = maxHeight / this.templateDimensions.height;
        const scale = Math.min(scaleX, scaleY, 1); // Don't scale up
        
        return {
            width: this.templateDimensions.width * scale,
            height: this.templateDimensions.height * scale,
            scale: scale
        };
    }
    
    // Setup 10px grid snapping system (master plan requirement)
    setupGridSnapping(canvas) {
        if (!canvas) return;
        
        canvas.on('object:moving', (e) => {
            if (!this.snapEnabled || this.ctrlPressed) return;
            
            const obj = e.target;
            const snapGrid = this.gridSettings.size;
            
            // Snap to grid
            const snappedLeft = Math.round(obj.left / snapGrid) * snapGrid;
            const snappedTop = Math.round(obj.top / snapGrid) * snapGrid;
            
            // Check if within snap threshold
            if (Math.abs(obj.left - snappedLeft) < this.snapThreshold) {
                obj.set('left', snappedLeft);
            }
            
            if (Math.abs(obj.top - snappedTop) < this.snapThreshold) {
                obj.set('top', snappedTop);
            }
            
            obj.setCoords();
        });
        
        console.log('📐 Grid snapping enabled (10px grid)');
    }
    
    // Setup edge snapping to template boundaries
    setupEdgeSnapping(canvas) {
        if (!canvas) return;
        
        canvas.on('object:moving', (e) => {
            if (!this.snapEnabled || this.ctrlPressed) return;
            
            const obj = e.target;
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const threshold = this.snapThreshold;
            
            // Snap to left edge
            if (Math.abs(obj.left) < threshold) {
                obj.set('left', 0);
            }
            
            // Snap to top edge
            if (Math.abs(obj.top) < threshold) {
                obj.set('top', 0);
            }
            
            // Snap to right edge
            const rightEdge = canvasWidth - (obj.width * obj.scaleX);
            if (Math.abs(obj.left - rightEdge) < threshold) {
                obj.set('left', rightEdge);
            }
            
            // Snap to bottom edge
            const bottomEdge = canvasHeight - (obj.height * obj.scaleY);
            if (Math.abs(obj.top - bottomEdge) < threshold) {
                obj.set('top', bottomEdge);
            }
            
            obj.setCoords();
        });
        
        console.log('🔗 Edge snapping enabled');
    }
    
    // Setup element-to-element snapping
    setupElementSnapping(canvas) {
        if (!canvas) return;
        
        canvas.on('object:moving', (e) => {
            if (!this.snapEnabled || this.ctrlPressed) return;
            
            const movingObj = e.target;
            const objects = canvas.getObjects().filter(obj => obj !== movingObj);
            const threshold = this.snapThreshold;
            
            objects.forEach(obj => {
                // Horizontal alignment snapping
                if (Math.abs(movingObj.left - obj.left) < threshold) {
                    movingObj.set('left', obj.left);
                    this.showAlignmentGuide('vertical', obj.left);
                }
                
                if (Math.abs(movingObj.left - (obj.left + obj.width * obj.scaleX)) < threshold) {
                    movingObj.set('left', obj.left + obj.width * obj.scaleX);
                }
                
                // Vertical alignment snapping
                if (Math.abs(movingObj.top - obj.top) < threshold) {
                    movingObj.set('top', obj.top);
                    this.showAlignmentGuide('horizontal', obj.top);
                }
                
                if (Math.abs(movingObj.top - (obj.top + obj.height * obj.scaleY)) < threshold) {
                    movingObj.set('top', obj.top + obj.height * obj.scaleY);
                }
            });
            
            movingObj.setCoords();
        });
        
        // Clear guides when movement stops
        canvas.on('object:modified', () => {
            this.clearAlignmentGuides();
        });
        
        console.log('🧲 Element snapping enabled');
    }
    
    // Show alignment guides during snapping
    showAlignmentGuide(type, position) {
        // Implementation for visual alignment guides
        // This would draw temporary lines to show alignment
        console.log(`📏 Showing ${type} alignment guide at ${position}`);
    }
    
    // Clear alignment guides
    clearAlignmentGuides() {
        // Clear any temporary alignment guide lines
        console.log('🧹 Clearing alignment guides');
    }
    
    // Setup keyboard handlers for CTRL override
    setupKeyboardHandlers() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Control') {
                this.ctrlPressed = true;
                console.log('🔓 Snapping disabled (CTRL pressed)');
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.key === 'Control') {
                this.ctrlPressed = false;
                console.log('🔒 Snapping enabled (CTRL released)');
            }
        });
        
        console.log('⌨️ Keyboard handlers setup (CTRL override)');
    }
    
    // Setup canvas event handlers
    setupCanvasEvents() {
        if (!this.canvas) return;
        
        // Selection events
        this.canvas.on('selection:created', (e) => {
            this.handleElementSelection(e.selected[0]);
        });
        
        this.canvas.on('selection:updated', (e) => {
            this.handleElementSelection(e.selected[0]);
        });
        
        this.canvas.on('selection:cleared', () => {
            this.handleElementDeselection();
        });
        
        // Object modification events
        this.canvas.on('object:modified', () => {
            this.core.markUnsavedChanges();
        });
        
        console.log('🎯 Canvas events setup complete');
    }
    
    // Setup popup canvas events
    setupPopupCanvasEvents() {
        if (!this.popupCanvas) return;
        
        // Selection events for popup
        this.popupCanvas.on('selection:created', (e) => {
            this.handlePopupElementSelection(e.selected[0]);
        });
        
        this.popupCanvas.on('selection:updated', (e) => {
            this.handlePopupElementSelection(e.selected[0]);
        });
        
        this.popupCanvas.on('selection:cleared', () => {
            this.handlePopupElementDeselection();
        });
        
        // Object modification events
        this.popupCanvas.on('object:modified', () => {
            this.core.markUnsavedChanges();
        });
        
        // Boundary validation for popup
        this.popupCanvas.on('object:moving', (e) => {
            this.enforceCanvasBoundaries(e.target, this.popupCanvas);
        });
        
        console.log('🎯 Popup canvas events setup complete');
    }
    
    // Enforce canvas boundaries (prevent elements from going outside)
    enforceCanvasBoundaries(obj, canvas) {
        const objBounds = obj.getBoundingRect();
        
        // Left boundary
        if (objBounds.left < 0) {
            obj.set('left', obj.left - objBounds.left);
        }
        
        // Top boundary
        if (objBounds.top < 0) {
            obj.set('top', obj.top - objBounds.top);
        }
        
        // Right boundary
        if (objBounds.left + objBounds.width > canvas.width) {
            obj.set('left', obj.left - (objBounds.left + objBounds.width - canvas.width));
        }
        
        // Bottom boundary
        if (objBounds.top + objBounds.height > canvas.height) {
            obj.set('top', obj.top - (objBounds.top + objBounds.height - canvas.height));
        }
        
        obj.setCoords();
    }
    
    // Handle element selection
    handleElementSelection(element) {
        if (this.core.modules.elements) {
            this.core.modules.elements.showElementProperties(element);
        }
        console.log('🎯 Element selected:', element.type);
    }
    
    // Handle element deselection
    handleElementDeselection() {
        if (this.core.modules.elements) {
            this.core.modules.elements.clearProperties();
        }
        console.log('📝 Element deselected');
    }
    
    // Handle popup element selection
    handlePopupElementSelection(element) {
        if (this.core.modules.elements) {
            this.core.modules.elements.showPopupElementProperties(element);
        }
        console.log('🎯 Popup element selected:', element.type);
    }
    
    // Handle popup element deselection
    handlePopupElementDeselection() {
        const propertiesContent = document.getElementById('popupPropertiesContent');
        if (propertiesContent) {
            propertiesContent.innerHTML = `
                <div class="no-selection">
                    <i class="fa fa-mouse-pointer"></i>
                    <p>Select an element to edit properties</p>
                </div>
            `;
        }
        console.log('📝 Popup element deselected');
    }
    
    // Transfer canvas state from main to popup
    async transferCanvasToPopup() {
        if (!this.canvas || !this.popupCanvas) return;
        
        try {
            console.log('🔄 Transferring canvas state to popup...');
            
            // Get current canvas state
            const canvasData = this.canvas.toJSON(['id', 'type', 'elementType']);
            
            // Load background image if available
            if (this.currentSide === 'front' && this.frontImage) {
                await this.setPopupBackground(this.frontImage);
            } else if (this.currentSide === 'back' && this.backImage) {
                await this.setPopupBackground(this.backImage);
            }
            
            // Load objects
            this.popupCanvas.loadFromJSON(canvasData, () => {
                this.popupCanvas.renderAll();
                console.log('✅ Canvas state transferred successfully');
            });
            
        } catch (error) {
            console.error('❌ Failed to transfer canvas state:', error);
        }
    }
    
    // Set background image for popup canvas
    async setPopupBackground(imageUrl) {
        return new Promise((resolve, reject) => {
            fabric.Image.fromURL(imageUrl, (img) => {
                // Scale image to fit canvas
                const scaleX = this.popupCanvas.width / img.width;
                const scaleY = this.popupCanvas.height / img.height;
                const scale = Math.min(scaleX, scaleY);
                
                img.scale(scale);
                img.set({
                    left: (this.popupCanvas.width - img.width * scale) / 2,
                    top: (this.popupCanvas.height - img.height * scale) / 2,
                    selectable: false,
                    evented: false
                });
                
                this.popupCanvas.setBackgroundImage(img, () => {
                    this.popupCanvas.renderAll();
                    resolve();
                });
            }, {
                crossOrigin: 'anonymous'
            });
        });
    }
    
    // Show popup with animation
    showPopup() {
        const popup = document.getElementById('canvasPopupOverlay');
        if (popup) {
            popup.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            this.isPopupMode = true;
            
            // Trigger elements and properties panels update for popup
            if (this.core.modules.elements) {
                this.core.modules.elements.populatePopupElementsPanel();
            }
            
            console.log('🚀 Popup displayed');
        }
    }
    
    // Close popup editor
    closePopup() {
        const popup = document.getElementById('canvasPopupOverlay');
        if (popup) {
            popup.style.display = 'none';
            document.body.style.overflow = '';
            this.isPopupMode = false;
            
            // Clean up popup canvas
            if (this.popupCanvas) {
                this.popupCanvas.dispose();
                this.popupCanvas = null;
            }
            
            console.log('❌ Popup closed');
        }
    }
    
    // Save and close popup
    async saveAndClosePopup() {
        try {
            console.log('💾 Saving popup changes...');
            
            if (this.popupCanvas && this.canvas) {
                // Transfer popup state back to main canvas
                const popupData = this.popupCanvas.toJSON(['id', 'type', 'elementType']);
                
                this.canvas.loadFromJSON(popupData, () => {
                    this.canvas.renderAll();
                    this.core.markUnsavedChanges();
                    console.log('✅ Popup changes saved');
                });
            }
            
            this.closePopup();
            this.core.showMessage('Changes saved successfully', 'success');
            
        } catch (error) {
            console.error('❌ Failed to save popup changes:', error);
            this.core.showMessage('Failed to save changes: ' + error.message, 'error');
        }
    }
    
    // Zoom functionality for popup
    zoomPopup(factor) {
        if (!this.popupCanvas) return;
        
        const currentZoom = this.popupCanvas.getZoom();
        const newZoom = Math.max(0.1, Math.min(5, currentZoom * factor));
        
        this.popupCanvas.setZoom(newZoom);
        this.updatePopupZoomDisplay(newZoom);
        
        console.log(`🔍 Popup zoom: ${Math.round(newZoom * 100)}%`);
    }
    
    // Reset popup zoom
    resetPopupZoom() {
        if (!this.popupCanvas) return;
        
        this.popupCanvas.setZoom(1);
        this.updatePopupZoomDisplay(1);
        
        console.log('🔍 Popup zoom reset to 100%');
    }
    
    // Update popup zoom display
    updatePopupZoomDisplay(zoom) {
        const zoomDisplay = document.getElementById('popupZoomLevel');
        if (zoomDisplay) {
            zoomDisplay.textContent = Math.round(zoom * 100) + '%';
        }
    }
    
    // Toggle grid visibility
    toggleGrid() {
        this.gridSettings.enabled = !this.gridSettings.enabled;
        
        const gridBtn = document.getElementById('gridToggleBtn');
        if (gridBtn) {
            gridBtn.classList.toggle('active', this.gridSettings.enabled);
        }
        
        console.log(`📐 Grid ${this.gridSettings.enabled ? 'enabled' : 'disabled'}`);
    }
    
    // Resize canvas to match template dimensions
    resizeCanvas(width, height) {
        if (this.canvas) {
            this.canvas.setDimensions({ width, height });
            this.templateDimensions = { width, height };
            
            // Update canvas container size for scrolling
            const container = document.querySelector('.canvas-container');
            if (container) {
                container.scrollLeft = 0;
                container.scrollTop = 0;
            }
            
            console.log('📐 Canvas resized:', { width, height });
        }
    }
    
    // Switch between front and back sides
    switchSide(side) {
        if (this.currentSide === side) return;
        
        console.log(`🔄 Switching to ${side} side`);
        this.currentSide = side;
        
        // Clear current canvas
        if (this.canvas) {
            this.canvas.clear();
        }
        
        // Load side-specific content
        this.loadSideContent(side);
        
        // Update UI
        this.updateSideToggle(side);
        
        this.core.setCurrentSide(side);
    }
    
    // Load content for specific side
    loadSideContent(side) {
        const templateData = this.core.getTemplateData();
        
        if (templateData && templateData.elements) {
            const sideElements = templateData.elements.filter(el => el.side === side);
            
            sideElements.forEach(elementData => {
                // Recreate elements for this side
                if (this.core.modules.elements) {
                    this.core.modules.elements.recreateElement(elementData);
                }
            });
        }
        
        // Load background image
        const imageUrl = side === 'front' ? this.frontImage : this.backImage;
        if (imageUrl && this.canvas) {
            this.setCanvasBackground(imageUrl);
        }
    }
    
    // Set canvas background image
    setCanvasBackground(imageUrl) {
        if (!this.canvas) return;
        
        fabric.Image.fromURL(imageUrl, (img) => {
            // Scale image to fit canvas exactly
            const scaleX = this.canvas.width / img.width;
            const scaleY = this.canvas.height / img.height;
            
            img.scale(Math.min(scaleX, scaleY));
            img.set({
                left: 0,
                top: 0,
                selectable: false,
                evented: false
            });
            
            this.canvas.setBackgroundImage(img, () => {
                this.canvas.renderAll();
            });
        });
    }
    
    // Update side toggle UI
    updateSideToggle(side) {
        const toggles = document.querySelectorAll('input[name="cardSide"]');
        toggles.forEach(toggle => {
            toggle.checked = toggle.value === side;
            
            // Update parent label styling
            const label = toggle.closest('.toggle-switch');
            if (label) {
                label.classList.toggle('active', toggle.checked);
            }
        });
    }
    
    // Set template images
    setFrontImage(imageUrl) {
        this.frontImage = imageUrl;
        if (this.currentSide === 'front') {
            this.setCanvasBackground(imageUrl);
        }
    }
    
    setBackImage(imageUrl) {
        this.backImage = imageUrl;
        if (this.currentSide === 'back') {
            this.setCanvasBackground(imageUrl);
        }
    }
    
    // Get canvas data
    getCanvasData() {
        if (!this.canvas) return null;
        
        return this.canvas.toJSON(['id', 'type', 'elementType', 'side']);
    }
    
    // Load canvas data
    loadCanvasData(data) {
        if (!this.canvas || !data) return;
        
        this.canvas.loadFromJSON(data, () => {
            this.canvas.renderAll();
            console.log('📂 Canvas data loaded');
        });
    }
    
    // Clear canvas
    clearCanvas() {
        if (this.canvas) {
            this.canvas.clear();
            console.log('🧹 Canvas cleared');
        }
    }
    
    // Get active canvas (main or popup)
    getActiveCanvas() {
        return this.isPopupMode ? this.popupCanvas : this.canvas;
    }
    
    // Professional zoom functionality for main canvas
    zoomCanvas(factor) {
        if (!this.canvas) return;
        
        this.zoom = Math.max(0.1, Math.min(5, this.zoom * factor));
        this.canvas.setZoom(this.zoom);
        
        // Update zoom display
        const zoomDisplay = document.querySelector('.zoom-level');
        if (zoomDisplay) {
            zoomDisplay.textContent = Math.round(this.zoom * 100) + '%';
        }
        
        console.log(`🔍 Canvas zoom: ${Math.round(this.zoom * 100)}%`);
    }
    
    // Reset main canvas zoom
    resetZoom() {
        if (!this.canvas) return;
        
        this.zoom = 1.0;
        this.canvas.setZoom(this.zoom);
        
        // Update zoom display
        const zoomDisplay = document.querySelector('.zoom-level');
        if (zoomDisplay) {
            zoomDisplay.textContent = '100%';
        }
        
        console.log('🔍 Canvas zoom reset to 100%');
    }
}

// Register module with core when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.templateEditorCore) {
        const canvasManager = new CanvasManager(window.templateEditorCore);
        window.templateEditorCore.registerModule('canvas', canvasManager);
        
        // Initialize canvas when core is ready
        setTimeout(() => {
            canvasManager.initializeCanvas();
        }, 100);
    }
});

console.log('🎨 Professional Canvas Manager module loaded');
