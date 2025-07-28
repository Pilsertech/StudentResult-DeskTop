/**
 * Professional Elements Manager - Drag & Drop Element Library
 * Handles element positioning, properties, and drag-drop functionality as per master plan
 * Implements 10px grid snapping and professional element management
 */

class ElementsManager {
    constructor(core) {
        this.core = core;
        this.selectedElement = null;
        this.draggedElementData = null;
        this.gridSize = 10; // 10px grid as per master plan
        this.nextElementId = 1;
        
        // Element categories from master plan
        this.elementCategories = {
            student: {
                label: 'Student Data',
                icon: 'fa-user',
                color: '#3498db'
            },
            codes: {
                label: 'QR & Barcodes', 
                icon: 'fa-qrcode',
                color: '#9b59b6'
            },
            custom: {
                label: 'Custom Elements',
                icon: 'fa-paint-brush',
                color: '#e67e22'
            }
        };
        
        console.log('🧩 Elements Manager initialized with professional features');
    }
    
    // Initialize elements panel and drag-drop functionality
    initializeElementsPanel() {
        try {
            console.log('🎨 Setting up professional elements panel...');
            
            // Populate main elements panel
            this.populateElementsPanel();
            
            // Setup drag and drop with 10px grid snapping
            this.setupDragAndDrop();
            
            // Setup click-to-add functionality for mobile/accessibility
            this.setupClickToAdd();
            
            console.log('✅ Professional elements panel initialized');
            
        } catch (error) {
            console.error('❌ Error initializing elements panel:', error);
            this.core.showMessage('Failed to initialize elements panel: ' + error.message, 'error');
        }
    }
    
    // Populate main elements panel with categories
    populateElementsPanel() {
        const categoriesContainer = document.getElementById('elementCategories') || 
                                  document.querySelector('.element-categories');
        
        if (!categoriesContainer) {
            console.warn('⚠️ Element categories container not found');
            return;
        }
        
        categoriesContainer.innerHTML = '';
        
        Object.entries(this.elementCategories).forEach(([categoryKey, category]) => {
            const categoryDiv = this.createCategorySection(categoryKey, category);
            categoriesContainer.appendChild(categoryDiv);
        });
    }
    
    // Create individual category section
    createCategorySection(categoryKey, category) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = `category ${categoryKey === 'student' ? 'active' : ''}`;
        categoryDiv.setAttribute('data-category', categoryKey);
        
        const elementTypes = Object.entries(this.core.getElementTypes())
            .filter(([key, data]) => data.category === categoryKey);
        
        categoryDiv.innerHTML = `
            <h5 style="color: ${category.color};">
                <i class="fa ${category.icon}"></i>
                ${category.label}
            </h5>
            <div class="elements-list">
                ${elementTypes.map(([elementType, elementData]) => `
                    <div class="element-item" 
                         data-type="${elementType}"
                         data-label="${elementData.label}"
                         data-icon="${elementData.icon}"
                         draggable="true"
                         title="Drag to canvas or click to add to center">
                        <i class="fa ${elementData.icon}"></i>
                        <span>${elementData.label}</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        return categoryDiv;
    }
    
    // Setup drag and drop with professional grid snapping
    setupDragAndDrop() {
        console.log('🎯 Setting up professional drag & drop with 10px grid snapping...');
        
        // Setup drag start for elements
        this.setupElementDragStart();
        
        // Setup canvas drop zones
        this.setupCanvasDropZones();
        
        // Setup visual feedback
        this.setupVisualFeedback();
    }
    
    // Setup drag start events for element items
    setupElementDragStart() {
        document.addEventListener('dragstart', (e) => {
            const elementItem = e.target.closest('.element-item');
            if (!elementItem) return;
            
            const elementType = elementItem.dataset.type;
            const elementData = this.core.getElementTypes()[elementType];
            
            if (!elementData) {
                console.warn('⚠️ Unknown element type:', elementType);
                return;
            }
            
            // Store drag data
            this.draggedElementData = {
                type: elementType,
                label: elementData.label,
                icon: elementData.icon,
                category: elementData.category,
                defaultProps: elementData.defaultProps
            };
            
            // Set drag data for browser
            e.dataTransfer.setData('text/plain', JSON.stringify(this.draggedElementData));
            e.dataTransfer.effectAllowed = 'copy';
            
            // Visual feedback
            elementItem.classList.add('dragging');
            
            console.log('🚀 Drag started:', elementType);
        });
        
        // Clean up drag styling
        document.addEventListener('dragend', (e) => {
            const elementItem = e.target.closest('.element-item');
            if (elementItem) {
                elementItem.classList.remove('dragging');
            }
            this.draggedElementData = null;
        });
    }
    
    // Setup canvas drop zones with professional snapping
    setupCanvasDropZones() {
        const canvases = [
            document.getElementById('templateCanvas'),
            document.getElementById('popupTemplateCanvas')
        ].filter(Boolean);
        
        canvases.forEach(canvas => {
            if (!canvas) return;
            
            // Prevent default drag over
            canvas.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                
                // Visual feedback - highlight drop zone
                canvas.classList.add('drag-over');
                
                // Show snap guides
                this.showSnapGuides(e, canvas);
            });
            
            // Clean up drag over styling
            canvas.addEventListener('dragleave', (e) => {
                // Only remove if actually leaving canvas
                if (!canvas.contains(e.relatedTarget)) {
                    canvas.classList.remove('drag-over');
                    this.hideSnapGuides();
                }
            });
            
            // Handle drop with professional snapping
            canvas.addEventListener('drop', (e) => {
                e.preventDefault();
                canvas.classList.remove('drag-over');
                this.hideSnapGuides();
                
                try {
                    const dragData = e.dataTransfer.getData('text/plain');
                    const elementData = dragData ? JSON.parse(dragData) : this.draggedElementData;
                    
                    if (!elementData) {
                        console.warn('⚠️ No element data for drop');
                        return;
                    }
                    
                    // Calculate drop position with grid snapping
                    const dropPosition = this.calculateDropPosition(e, canvas);
                    
                    // Add element to canvas
                    this.addElementToCanvas(elementData, dropPosition, canvas);
                    
                    console.log('📦 Element dropped:', elementData.type, 'at', dropPosition);
                    
                } catch (error) {
                    console.error('❌ Error handling drop:', error);
                    this.core.showMessage('Failed to add element: ' + error.message, 'error');
                }
            });
        });
    }
    
    // Calculate drop position with 10px grid snapping
    calculateDropPosition(event, canvas) {
        const rect = canvas.getBoundingClientRect();
        const fabricCanvas = canvas.id === 'popupTemplateCanvas' ? 
            this.core.modules.canvas?.popupCanvas : 
            this.core.modules.canvas?.canvas;
        
        if (!fabricCanvas) {
            console.warn('⚠️ Fabric canvas not available for position calculation');
            return { x: 100, y: 100 };
        }
        
        // Get raw coordinates
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        
        // Account for canvas scaling/zoom
        const zoom = fabricCanvas.getZoom();
        x = x / zoom;
        y = y / zoom;
        
        // Apply 10px grid snapping
        x = Math.round(x / this.gridSize) * this.gridSize;
        y = Math.round(y / this.gridSize) * this.gridSize;
        
        // Ensure element stays within canvas bounds
        const canvasWidth = fabricCanvas.width;
        const canvasHeight = fabricCanvas.height;
        
        x = Math.max(this.gridSize, Math.min(x, canvasWidth - 100));
        y = Math.max(this.gridSize, Math.min(y, canvasHeight - 50));
        
        return { x, y };
    }
    
    // Add element to canvas with professional styling
    addElementToCanvas(elementData, position, canvasElement) {
        const fabricCanvas = canvasElement.id === 'popupTemplateCanvas' ? 
            this.core.modules.canvas?.popupCanvas : 
            this.core.modules.canvas?.canvas;
        
        if (!fabricCanvas) {
            console.error('❌ Fabric canvas not available');
            return;
        }
        
        const elementId = `element_${this.nextElementId++}`;
        const currentSide = this.core.getCurrentSide();
        
        // Create element based on type
        let fabricObject = null;
        
        switch (elementData.type) {
            case 'studentName':
            case 'rollId':
            case 'className':
            case 'studentId':
            case 'customText':
                fabricObject = this.createTextElement(elementData, position, elementId);
                break;
                
            case 'photo':
            case 'logo':
                fabricObject = this.createImagePlaceholder(elementData, position, elementId);
                break;
                
            case 'qrCode':
            case 'barcode':
                fabricObject = this.createCodePlaceholder(elementData, position, elementId);
                break;
                
            default:
                console.warn('⚠️ Unknown element type for canvas:', elementData.type);
                return;
        }
        
        if (!fabricObject) {
            console.error('❌ Failed to create fabric object');
            return;
        }
        
        // Set common properties
        fabricObject.set({
            id: elementId,
            elementType: elementData.type,
            side: currentSide,
            selectable: true,
            hasControls: true,
            hasBorders: true,
            transparentCorners: false,
            cornerColor: '#9b59b6',
            cornerStyle: 'circle',
            borderColor: '#9b59b6',
            borderDashArray: [5, 5]
        });
        
        // Add to canvas
        fabricCanvas.add(fabricObject);
        fabricCanvas.setActiveObject(fabricObject);
        fabricCanvas.renderAll();
        
        // Mark unsaved changes
        this.core.markUnsavedChanges();
        
        // Show element properties
        this.showElementProperties(fabricObject);
        
        console.log(`✅ Added ${elementData.type} element at (${position.x}, ${position.y})`);
    }
    
    // Create text element with professional defaults
    createTextElement(elementData, position, elementId) {
        const defaultProps = elementData.defaultProps || {};
        
        const text = new fabric.Text(this.getElementDisplayText(elementData.type), {
            left: position.x,
            top: position.y,
            fontSize: defaultProps.fontSize || 18,
            fontFamily: defaultProps.fontFamily || 'Arial',
            fill: defaultProps.color || '#000000',
            textAlign: 'left',
            originX: 'left',
            originY: 'top'
        });
        
        return text;
    }
    
    // Create image placeholder
    createImagePlaceholder(elementData, position, elementId) {
        const defaultProps = elementData.defaultProps || {};
        
        const rect = new fabric.Rect({
            left: position.x,
            top: position.y,
            width: defaultProps.width || 120,
            height: defaultProps.height || 150,
            fill: '#f8f9fa',
            stroke: '#9b59b6',
            strokeWidth: 2,
            strokeDashArray: [5, 5],
            rx: defaultProps.borderRadius || 5,
            ry: defaultProps.borderRadius || 5
        });
        
        const text = new fabric.Text(elementData.label, {
            left: position.x + (defaultProps.width || 120) / 2,
            top: position.y + (defaultProps.height || 150) / 2,
            fontSize: 12,
            fontFamily: 'Arial',
            fill: '#7f8c8d',
            textAlign: 'center',
            originX: 'center',
            originY: 'center'
        });
        
        const group = new fabric.Group([rect, text], {
            left: position.x,
            top: position.y,
            selectable: true
        });
        
        return group;
    }
    
    // Create code placeholder (QR/Barcode)
    createCodePlaceholder(elementData, position, elementId) {
        const defaultProps = elementData.defaultProps || {};
        
        const rect = new fabric.Rect({
            left: position.x,
            top: position.y,
            width: defaultProps.width || 80,
            height: defaultProps.height || 80,
            fill: defaultProps.backgroundColor || '#ffffff',
            stroke: '#9b59b6',
            strokeWidth: 2,
            rx: 4,
            ry: 4
        });
        
        const icon = new fabric.Text(elementData.type === 'qrCode' ? '⬜' : '||||', {
            left: position.x + (defaultProps.width || 80) / 2,
            top: position.y + (defaultProps.height || 80) / 2,
            fontSize: elementData.type === 'qrCode' ? 24 : 16,
            fontFamily: 'Arial',
            fill: '#2c3e50',
            textAlign: 'center',
            originX: 'center',
            originY: 'center'
        });
        
        const group = new fabric.Group([rect, icon], {
            left: position.x,
            top: position.y,
            selectable: true
        });
        
        return group;
    }
    
    // Get display text for element types
    getElementDisplayText(elementType) {
        const displayTexts = {
            'studentName': 'Student Name',
            'rollId': 'Roll ID',
            'className': 'Class Name',
            'studentId': 'Student ID',
            'customText': 'Custom Text'
        };
        
        return displayTexts[elementType] || 'Text Element';
    }
    
    // Setup click-to-add functionality for accessibility
    setupClickToAdd() {
        document.addEventListener('click', (e) => {
            const elementItem = e.target.closest('.element-item');
            if (!elementItem) return;
            
            // Only trigger if not dragging
            if (elementItem.classList.contains('dragging')) return;
            
            const elementType = elementItem.dataset.type;
            const elementData = this.core.getElementTypes()[elementType];
            
            if (!elementData) return;
            
            // Add to center of canvas
            this.addElementToCenter(elementType);
        });
    }
    
    // Add element to center of canvas (accessibility method)
    addElementToCenter(elementType) {
        const canvas = this.core.modules.canvas?.getActiveCanvas();
        if (!canvas) {
            console.warn('⚠️ No active canvas available');
            return;
        }
        
        const elementData = this.core.getElementTypes()[elementType];
        if (!elementData) {
            console.warn('⚠️ Unknown element type:', elementType);
            return;
        }
        
        // Calculate center position with grid snapping
        const centerX = Math.round((canvas.width / 2) / this.gridSize) * this.gridSize;
        const centerY = Math.round((canvas.height / 2) / this.gridSize) * this.gridSize;
        
        const position = { x: centerX, y: centerY };
        
        // Add to canvas
        const canvasElement = canvas.lowerCanvasEl;
        this.addElementToCanvas({
            type: elementType,
            label: elementData.label,
            icon: elementData.icon,
            category: elementData.category,
            defaultProps: elementData.defaultProps
        }, position, canvasElement);
        
        console.log(`✅ Added ${elementType} to canvas center`);
    }
    
    // Setup visual feedback for drag operations
    setupVisualFeedback() {
        // Drag over effects
        document.addEventListener('dragover', (e) => {
            const elementItem = e.target.closest('.element-item');
            if (elementItem && this.draggedElementData) {
                elementItem.classList.add('drag-target');
            }
        });
        
        // Drag leave effects  
        document.addEventListener('dragleave', (e) => {
            const elementItem = e.target.closest('.element-item');
            if (elementItem) {
                elementItem.classList.remove('drag-target');
            }
        });
    }
    
    // Show snap guides during drag over canvas
    showSnapGuides(event, canvas) {
        // Implementation for visual snap guides
        // This would show 10px grid lines during drag
        console.log('📏 Showing snap guides at', event.clientX, event.clientY);
    }
    
    // Hide snap guides
    hideSnapGuides() {
        // Clear any visual snap guides
        console.log('🧹 Hiding snap guides');
    }
    
    // Show element properties panel
    showElementProperties(element) {
        if (!element) return;
        
        this.selectedElement = element;
        
        const propertiesContent = document.getElementById('propertiesContent');
        if (!propertiesContent) return;
        
        const properties = this.generatePropertiesPanel(element);
        propertiesContent.innerHTML = properties;
        
        // Setup property change handlers
        this.setupPropertyHandlers(element);
    }
    
    // Show properties in popup mode
    showPopupElementProperties(element) {
        if (!element) return;
        
        this.selectedElement = element;
        
        const propertiesContent = document.getElementById('popupPropertiesContent');
        if (!propertiesContent) return;
        
        const properties = this.generatePropertiesPanel(element, true);
        propertiesContent.innerHTML = properties;
        
        // Setup property change handlers for popup
        this.setupPropertyHandlers(element, true);
    }
    
    // Generate properties panel HTML
    generatePropertiesPanel(element, isPopup = false) {
        const elementType = element.elementType || 'unknown';
        const isTextElement = ['studentName', 'rollId', 'className', 'studentId', 'customText'].includes(elementType);
        const isImageElement = ['photo', 'logo'].includes(elementType);
        const isCodeElement = ['qrCode', 'barcode'].includes(elementType);
        
        let propertiesHTML = `
            <div class="property-group">
                <h5><i class="fa fa-info-circle"></i> Element Info</h5>
                <div class="form-group">
                    <label>Type</label>
                    <input type="text" value="${elementType}" class="form-control" readonly>
                </div>
                <div class="form-group">
                    <label>Layer</label>
                    <input type="text" value="${element.side || 'front'}" class="form-control" readonly>
                </div>
            </div>
            
            <div class="property-group">
                <h5><i class="fa fa-arrows"></i> Position</h5>
                <div class="form-group">
                    <label>X Position</label>
                    <input type="number" id="elementLeft" value="${Math.round(element.left || 0)}" class="form-control" step="${this.gridSize}">
                </div>
                <div class="form-group">
                    <label>Y Position</label>
                    <input type="number" id="elementTop" value="${Math.round(element.top || 0)}" class="form-control" step="${this.gridSize}">
                </div>
            </div>
        `;
        
        if (isTextElement) {
            propertiesHTML += `
                <div class="property-group">
                    <h5><i class="fa fa-font"></i> Text Properties</h5>
                    <div class="form-group">
                        <label>Text Content</label>
                        <input type="text" id="elementText" value="${element.text || ''}" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Font Size</label>
                        <input type="number" id="elementFontSize" value="${element.fontSize || 18}" class="form-control" min="8" max="72">
                    </div>
                    <div class="form-group">
                        <label>Font Family</label>
                        <select id="elementFontFamily" class="form-control">
                            <option value="Arial" ${element.fontFamily === 'Arial' ? 'selected' : ''}>Arial</option>
                            <option value="Times New Roman" ${element.fontFamily === 'Times New Roman' ? 'selected' : ''}>Times New Roman</option>
                            <option value="Courier New" ${element.fontFamily === 'Courier New' ? 'selected' : ''}>Courier New</option>
                            <option value="Verdana" ${element.fontFamily === 'Verdana' ? 'selected' : ''}>Verdana</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Text Color</label>
                        <input type="color" id="elementColor" value="${element.fill || '#000000'}" class="form-control">
                    </div>
                </div>
            `;
        }
        
        if (isImageElement || isCodeElement) {
            propertiesHTML += `
                <div class="property-group">
                    <h5><i class="fa fa-expand-arrows-alt"></i> Size</h5>
                    <div class="form-group">
                        <label>Width</label>
                        <input type="number" id="elementWidth" value="${Math.round(element.width * (element.scaleX || 1))}" class="form-control" min="10" step="${this.gridSize}">
                    </div>
                    <div class="form-group">
                        <label>Height</label>
                        <input type="number" id="elementHeight" value="${Math.round(element.height * (element.scaleY || 1))}" class="form-control" min="10" step="${this.gridSize}">
                    </div>
                </div>
            `;
        }
        
        propertiesHTML += `
            <div class="property-group">
                <h5><i class="fa fa-cogs"></i> Actions</h5>
                <button class="btn btn-outline btn-block" onclick="templateEditorCore.modules.elements.deleteSelectedElement()">
                    <i class="fa fa-trash"></i> Delete Element
                </button>
                <button class="btn btn-outline btn-block" onclick="templateEditorCore.modules.elements.duplicateSelectedElement()">
                    <i class="fa fa-copy"></i> Duplicate Element
                </button>
            </div>
        `;
        
        return propertiesHTML;
    }
    
    // Setup property change handlers
    setupPropertyHandlers(element, isPopup = false) {
        const prefix = isPopup ? 'popup' : '';
        
        // Position handlers
        const leftInput = document.getElementById(`${prefix}elementLeft`);
        const topInput = document.getElementById(`${prefix}elementTop`);
        
        if (leftInput) {
            leftInput.addEventListener('change', (e) => {
                const newLeft = parseInt(e.target.value);
                element.set('left', newLeft);
                element.setCoords();
                this.core.modules.canvas?.getActiveCanvas()?.renderAll();
                this.core.markUnsavedChanges();
            });
        }
        
        if (topInput) {
            topInput.addEventListener('change', (e) => {
                const newTop = parseInt(e.target.value);
                element.set('top', newTop);
                element.setCoords();
                this.core.modules.canvas?.getActiveCanvas()?.renderAll();
                this.core.markUnsavedChanges();
            });
        }
        
        // Text properties handlers
        const textInput = document.getElementById(`${prefix}elementText`);
        const fontSizeInput = document.getElementById(`${prefix}elementFontSize`);
        const fontFamilySelect = document.getElementById(`${prefix}elementFontFamily`);
        const colorInput = document.getElementById(`${prefix}elementColor`);
        
        if (textInput) {
            textInput.addEventListener('change', (e) => {
                element.set('text', e.target.value);
                this.core.modules.canvas?.getActiveCanvas()?.renderAll();
                this.core.markUnsavedChanges();
            });
        }
        
        if (fontSizeInput) {
            fontSizeInput.addEventListener('change', (e) => {
                element.set('fontSize', parseInt(e.target.value));
                this.core.modules.canvas?.getActiveCanvas()?.renderAll();
                this.core.markUnsavedChanges();
            });
        }
        
        if (fontFamilySelect) {
            fontFamilySelect.addEventListener('change', (e) => {
                element.set('fontFamily', e.target.value);
                this.core.modules.canvas?.getActiveCanvas()?.renderAll();
                this.core.markUnsavedChanges();
            });
        }
        
        if (colorInput) {
            colorInput.addEventListener('change', (e) => {
                element.set('fill', e.target.value);
                this.core.modules.canvas?.getActiveCanvas()?.renderAll();
                this.core.markUnsavedChanges();
            });
        }
        
        // Size handlers
        const widthInput = document.getElementById(`${prefix}elementWidth`);
        const heightInput = document.getElementById(`${prefix}elementHeight`);
        
        if (widthInput) {
            widthInput.addEventListener('change', (e) => {
                const newWidth = parseInt(e.target.value);
                const currentWidth = element.width * (element.scaleX || 1);
                const scaleX = newWidth / element.width;
                element.set('scaleX', scaleX);
                element.setCoords();
                this.core.modules.canvas?.getActiveCanvas()?.renderAll();
                this.core.markUnsavedChanges();
            });
        }
        
        if (heightInput) {
            heightInput.addEventListener('change', (e) => {
                const newHeight = parseInt(e.target.value);
                const currentHeight = element.height * (element.scaleY || 1);
                const scaleY = newHeight / element.height;
                element.set('scaleY', scaleY);
                element.setCoords();
                this.core.modules.canvas?.getActiveCanvas()?.renderAll();
                this.core.markUnsavedChanges();
            });
        }
    }
    
    // Clear properties panel
    clearProperties() {
        this.selectedElement = null;
        
        const propertiesContent = document.getElementById('propertiesContent');
        if (propertiesContent) {
            propertiesContent.innerHTML = `
                <div class="no-selection">
                    <i class="fa fa-mouse-pointer"></i>
                    <p>Select an element to edit properties</p>
                </div>
            `;
        }
    }
    
    // Delete selected element
    deleteSelectedElement() {
        if (!this.selectedElement) {
            this.core.showMessage('No element selected', 'warning');
            return;
        }
        
        const canvas = this.core.modules.canvas?.getActiveCanvas();
        if (!canvas) return;
        
        canvas.remove(this.selectedElement);
        canvas.renderAll();
        
        this.clearProperties();
        this.core.markUnsavedChanges();
        
        console.log('🗑️ Element deleted');
    }
    
    // Duplicate selected element
    duplicateSelectedElement() {
        if (!this.selectedElement) {
            this.core.showMessage('No element selected', 'warning');
            return;
        }
        
        const canvas = this.core.modules.canvas?.getActiveCanvas();
        if (!canvas) return;
        
        this.selectedElement.clone((cloned) => {
            // Offset the clone with grid snapping
            cloned.set({
                left: this.selectedElement.left + this.gridSize * 2,
                top: this.selectedElement.top + this.gridSize * 2,
                id: `element_${this.nextElementId++}`
            });
            
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.renderAll();
            
            this.showElementProperties(cloned);
            this.core.markUnsavedChanges();
            
            console.log('📄 Element duplicated');
        });
    }
    
    // Populate popup elements panel
    populatePopupElementsPanel() {
        const container = document.getElementById('popupElementCategories');
        if (!container) return;
        
        container.innerHTML = '';
        
        Object.entries(this.elementCategories).forEach(([categoryKey, category]) => {
            const categoryDiv = this.createPopupCategorySection(categoryKey, category);
            container.appendChild(categoryDiv);
        });
    }
    
    // Create popup category section
    createPopupCategorySection(categoryKey, category) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = `category-popup ${categoryKey === 'student' ? 'active' : ''}`;
        
        const elementTypes = Object.entries(this.core.getElementTypes())
            .filter(([key, data]) => data.category === categoryKey);
        
        categoryDiv.innerHTML = `
            <h5 style="color: ${category.color};">
                <i class="fa ${category.icon}"></i>
                ${category.label}
            </h5>
            <div class="elements-list-popup">
                ${elementTypes.map(([elementType, elementData]) => `
                    <div class="element-item-popup" 
                         data-type="${elementType}"
                         data-label="${elementData.label}"
                         data-icon="${elementData.icon}"
                         draggable="true"
                         title="Drag to canvas or click to add">
                        <i class="fa ${elementData.icon}"></i>
                        <span>${elementData.label}</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        return categoryDiv;
    }
    
    // Recreate element from saved data
    recreateElement(elementData) {
        // Implementation for recreating elements when loading templates
        console.log('🔄 Recreating element:', elementData);
        
        // This would be called when loading a saved template
        // to recreate all positioned elements
    }
    
    // Get all canvas elements for saving
    getCanvasElements() {
        const canvas = this.core.modules.canvas?.getActiveCanvas();
        if (!canvas) return [];
        
        return canvas.getObjects().map(obj => ({
            id: obj.id,
            type: obj.elementType,
            side: obj.side || this.core.getCurrentSide(),
            position: {
                x: obj.left,
                y: obj.top,
                width: obj.width * (obj.scaleX || 1),
                height: obj.height * (obj.scaleY || 1)
            },
            properties: this.extractElementProperties(obj)
        }));
    }
    
    // Extract element properties for saving
    extractElementProperties(obj) {
        const props = {
            visible: obj.visible,
            selectable: obj.selectable
        };
        
        // Text properties
        if (obj.text !== undefined) {
            props.text = obj.text;
            props.fontSize = obj.fontSize;
            props.fontFamily = obj.fontFamily;
            props.fill = obj.fill;
            props.textAlign = obj.textAlign;
        }
        
        // Group properties
        if (obj.type === 'group') {
            props.groupType = obj.elementType;
        }
        
        return props;
    }
}

// Register module with core when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.templateEditorCore) {
        const elementsManager = new ElementsManager(window.templateEditorCore);
        window.templateEditorCore.registerModule('elements', elementsManager);
        
        // Initialize elements panel when canvas is ready
        window.templateEditorCore.on('canvasReady', () => {
            elementsManager.initializeElementsPanel();
        });
        
        // Auto-initialize if canvas already ready
        setTimeout(() => {
            if (window.templateEditorCore.canvasReady) {
                elementsManager.initializeElementsPanel();
            }
        }, 500);
    }
});

console.log('🧩 Professional Elements Manager module loaded');
