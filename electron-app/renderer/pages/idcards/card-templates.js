// Enhanced ID Card Template Editor with Complete Database Integration

class TemplateEditorManager {
    constructor() {
        this.canvas = null;
        this.templates = [];
        this.classes = [];
        this.currentTemplate = null;
        this.currentSide = 'front';
        this.frontImage = null;
        this.backImage = null;
        this.positionData = { front: {}, back: {} };
        this.isLoading = false;
        
        // Element types that can be placed on templates
        this.elementTypes = {
            'student-name': { label: 'Student Name', icon: 'fa-user', category: 'student-info' },
            'roll-id': { label: 'Roll ID', icon: 'fa-id-badge', category: 'student-info' },
            'class-name': { label: 'Class & Section', icon: 'fa-graduation-cap', category: 'student-info' },
            'student-email': { label: 'Email Address', icon: 'fa-envelope', category: 'student-info' },
            'gender': { label: 'Gender', icon: 'fa-venus-mars', category: 'student-info' },
            'dob': { label: 'Date of Birth', icon: 'fa-calendar', category: 'student-info' },
            'photo': { label: 'Student Photo', icon: 'fa-camera', category: 'photo' },
            'qr-code': { label: 'QR Code', icon: 'fa-qrcode', category: 'codes' },
            'barcode': { label: 'Barcode', icon: 'fa-barcode', category: 'codes' },
            'school-logo': { label: 'School Logo', icon: 'fa-shield', category: 'branding' },
            'issue-date': { label: 'Issue Date', icon: 'fa-calendar-check-o', category: 'admin' },
            'valid-until': { label: 'Valid Until', icon: 'fa-calendar-times-o', category: 'admin' }
        };
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Enhanced Template Editor initializing...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    async setup() {
        console.log('🔧 Setting up Template Editor...');
        
        this.messageArea = document.getElementById('messageArea');
        this.templatesGrid = document.getElementById('templatesGrid');
        this.editorSection = document.getElementById('editorSection');
        
        console.log('📋 DOM elements found:', {
            messageArea: !!this.messageArea,
            templatesGrid: !!this.templatesGrid,
            editorSection: !!this.editorSection
        });
        
        // Load data first
        await this.loadClasses();
        this.loadTemplates();
        
        // Setup UI components in proper order
        this.setupCanvas();
        this.setupEventListeners();
        
        // Always ensure side toggle buttons are visible
        setTimeout(() => {
            this.ensureSideToggleAlwaysVisible();
        }, 1000);
        
        // Render element palette after canvas is ready
        setTimeout(() => {
            this.renderElementPalette();
        }, 200);
        
        console.log('✅ Enhanced Template Editor initialized');
    }
    
    async loadClasses() {
        try {
            console.log('📚 Loading classes...');
            
            const response = await fetch('http://localhost:9000/classes');
            const result = await response.json();
            
            if (result.success) {
                this.classes = result.classes || [];
                this.populateClassDropdown();
                console.log(`✅ Loaded ${this.classes.length} classes`);
            } else {
                throw new Error(result.message || 'Failed to load classes');
            }
            
        } catch (error) {
            console.error('❌ Error loading classes:', error);
            this.showMessage('Failed to load classes: ' + error.message, 'error');
            this.classes = [];
        }
    }
    
    populateClassDropdown() {
        const assignedClassesSelect = document.getElementById('assignedClasses');
        if (!assignedClassesSelect) return;
        
        assignedClassesSelect.innerHTML = '<option value="">Select Classes (Optional)</option>';
        
        this.classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = `${cls.ClassName} - ${cls.Section}`;
            assignedClassesSelect.appendChild(option);
        });
    }
    
    renderElementPalette() {
        // The HTML already has elements-list structures, we just need to make them interactive
        const elementItems = document.querySelectorAll('.element-item');
        
        if (elementItems.length === 0) {
            console.warn('No element items found in HTML');
            return;
        }

        // Make all element items draggable and clickable
        elementItems.forEach(item => {
            const elementType = item.dataset.type;
            if (!elementType) return;

            // Make draggable
            item.draggable = true;
            
            // Add drag start event
            item.addEventListener('dragstart', (e) => {
                const dragData = {
                    type: elementType,
                    label: item.querySelector('span').textContent,
                    icon: item.querySelector('i').className
                };
                e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
                e.dataTransfer.effectAllowed = 'copy';
                console.log('🚀 Drag started for:', elementType, 'Data:', dragData);
            });

            // Add click event for adding element to center
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.addElementToCenter(elementType);
                console.log('Element clicked:', elementType);
            });

            // Add hover effects
            item.style.cursor = 'pointer';
            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = '#e8f4fd';
            });
            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = '';
            });
        });

        console.log('Element palette made interactive with', elementItems.length, 'items');
        
        // Setup canvas drop zone immediately after element setup
        this.setupCanvasDropZone();
    }
    
    setupCanvasDropZone() {
        const canvasContainer = document.querySelector('.canvas-container');
        const canvasElement = document.getElementById('templateCanvas');
        
        if (!canvasContainer || !canvasElement || !this.canvas) {
            console.warn('⚠️ Canvas setup incomplete for drop zone:', {
                container: !!canvasContainer,
                element: !!canvasElement, 
                fabric: !!this.canvas
            });
            return;
        }
        
        // Remove existing listeners to avoid duplicates
        if (this.canvasDragOver) {
            canvasContainer.removeEventListener('dragover', this.canvasDragOver);
            canvasElement.removeEventListener('dragover', this.canvasDragOver);
        }
        if (this.canvasDrop) {
            canvasContainer.removeEventListener('drop', this.canvasDrop);
            canvasElement.removeEventListener('drop', this.canvasDrop);
        }
        
        // Create bound functions
        this.canvasDragOver = (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'copy';
            console.log('🎯 Drag over canvas');
        };
        
        this.canvasDrop = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            try {
                const dragData = e.dataTransfer.getData('text/plain');
                console.log('🎯 Drop event - Raw data:', dragData);
                
                let elementType;
                
                // Check if it's JSON (from drag event) or plain string
                if (dragData.startsWith('{')) {
                    const elementData = JSON.parse(dragData);
                    elementType = elementData.type;
                    console.log('📦 Parsed element data:', elementData);
                } else {
                    elementType = dragData;
                }
                
                if (elementType) {
                    console.log('✅ Adding element to canvas:', elementType);
                    this.addElementToCanvas(elementType, e);
                } else {
                    console.error('❌ No element type found in drop data');
                }
            } catch (error) {
                console.error('❌ Error processing drop:', error);
                this.showMessage('Error adding element to canvas', 'error');
            }
        };
        
        // Add event listeners to both container and canvas
        canvasContainer.addEventListener('dragover', this.canvasDragOver);
        canvasContainer.addEventListener('drop', this.canvasDrop);
        canvasElement.addEventListener('dragover', this.canvasDragOver);  
        canvasElement.addEventListener('drop', this.canvasDrop);
        
        console.log('🎯 Canvas drop zone setup complete');
    }
    
    showTemplatesError() {
        if (!this.templatesGrid) return;
        
        this.templatesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <i class="fa fa-exclamation-triangle" style="font-size: 2rem; color: #e74c3c; margin-bottom: 10px; display: block;"></i>
                <p style="color: #e74c3c; margin-bottom: 15px;">Failed to load templates</p>
                <button class="btn btn-primary" onclick="templateEditorManager.loadTemplates()">
                    <i class="fa fa-refresh"></i> Retry
                </button>
            </div>
        `;
    }
    
    async editTemplate(templateId) {
        try {
            this.setLoading(true);
            
            const response = await fetch(`http://localhost:9000/idcards/templates/${templateId}`);
            const result = await response.json();
            
            if (result.success) {
                this.currentTemplate = result.template;
                this.loadTemplateForEditing(result.template);
                this.showMessage('Template loaded for editing', 'info');
            } else {
                throw new Error(result.message || 'Failed to load template');
            }
            
        } catch (error) {
            console.error('❌ Error loading template:', error);
            this.showMessage('Failed to load template: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
    loadTemplateForEditing(template) {
        // Show editor section
        const editorSection = document.getElementById('editorSection');
        if (editorSection) {
            editorSection.style.display = 'block';
        }
        
        // Load template data
        document.getElementById('templateName').value = template.TemplateName;
        
        // Parse position data
        if (template.PositionData) {
            try {
                this.positionData = JSON.parse(template.PositionData);
            } catch (e) {
                console.error('Error parsing position data:', e);
                this.positionData = { front: {}, back: {} };
            }
        }
        
        // Load images if available
        if (template.FrontImagePath) {
            this.loadTemplateImage(template.FrontImagePath, 'front');
        }
        
        if (template.BackImagePath) {
            this.loadTemplateImage(template.BackImagePath, 'back');
        }
    }
    
    loadTemplateImage(imagePath, side) {
        const imageUrl = `http://localhost:9000/idcards/templates/${imagePath.split('/').pop()}`;
        
        // Update UI
        const preview = document.getElementById(`${side}Preview`);
        const previewImg = document.getElementById(`${side}PreviewImg`);
        const uploadZone = document.getElementById(`${side}UploadZone`);
        
        if (preview && previewImg && uploadZone) {
            previewImg.src = imageUrl;
            preview.style.display = 'block';
            uploadZone.style.display = 'none';
        }
        
        // Load to canvas if current side
        if (side === this.currentSide) {
            this.loadImageToCanvas(imageUrl);
        }
    }
    
    async deleteTemplate(templateId) {
        if (!confirm('Are you sure you want to delete this template?')) {
            return;
        }
        
        try {
            this.setLoading(true);
            
            const response = await fetch(`http://localhost:9000/idcards/templates/${templateId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showMessage('Template deleted successfully', 'success');
                this.loadTemplates();
            } else {
                throw new Error(result.message || 'Failed to delete template');
            }
            
        } catch (error) {
            console.error('❌ Error deleting template:', error);
            this.showMessage('Failed to delete template: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
    cancelEdit() {
        // Hide editor section
        const editorSection = document.getElementById('editorSection');
        if (editorSection) {
            editorSection.style.display = 'none';
        }
        
        // Clear form
        this.resetForm();
        this.currentTemplate = null;
        
        this.showMessage('Edit cancelled', 'info');
    }
    
    setupEventListeners() {
        // Upload zones
        this.setupUploadZones();
        
        // Template configuration
        const templateNameInput = document.getElementById('templateName');
        if (templateNameInput) {
            templateNameInput.addEventListener('input', () => this.validateForm());
        }
        
        // Side toggle - set up after a delay to ensure DOM is ready
        setTimeout(() => {
            const radioButtons = document.querySelectorAll('input[name="cardSide"]');
            radioButtons.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    console.log('Radio button changed to:', e.target.value);
                    this.switchSide(e.target.value);
                });
                
                // Set initial visual state
                const label = radio.closest('.toggle-switch');
                if (label && radio.checked) {
                    label.classList.add('active');
                }
            });
            console.log(`🎯 Set up ${radioButtons.length} radio button listeners`);
        }, 500);
        
        // Canvas controls
        this.setupCanvasControls();
        
        // Delete key for selected elements
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' && this.canvas && this.canvas.getActiveObject()) {
                this.deleteSelectedElement();
            }
        });
        
        console.log('🎯 Event listeners setup');
    }
    
    setupUploadZones() {
        const frontZone = document.getElementById('frontUploadZone');
        const backZone = document.getElementById('backUploadZone');
        const frontInput = document.getElementById('frontImageInput');
        const backInput = document.getElementById('backImageInput');
        
        // Front image upload
        frontZone.addEventListener('click', () => frontInput.click());
        frontInput.addEventListener('change', (e) => this.handleImageUpload(e, 'front'));
        this.setupDragAndDrop(frontZone, 'front');
        
        // Back image upload
        backZone.addEventListener('click', () => backInput.click());
        backInput.addEventListener('change', (e) => this.handleImageUpload(e, 'back'));
        this.setupDragAndDrop(backZone, 'back');
    }
    
    setupDragAndDrop(zone, side) {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('dragover');
        });
        
        zone.addEventListener('dragleave', () => {
            zone.classList.remove('dragover');
        });
        
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.processImageFile(files[0], side);
            }
        });
    }
    
    setupCanvas() {
        const canvasElement = document.getElementById('templateCanvas');
        if (!canvasElement) {
            console.error('❌ Canvas element not found!');
            return;
        }
        
        console.log('🎨 Initializing Fabric.js canvas...');
        
        // Start with default dimensions - will be adjusted when image is loaded
        this.canvas = new fabric.Canvas('templateCanvas', {
            width: 1050,
            height: 650,
            backgroundColor: '#ffffff',
            preserveObjectStacking: true
        });
        
        // Canvas events - including position tracking for accurate coordinates
        this.canvas.on('selection:created', (e) => this.onObjectSelected(e.selected[0]));
        this.canvas.on('selection:updated', (e) => this.onObjectSelected(e.selected[0]));
        this.canvas.on('selection:cleared', () => this.clearProperties());
        this.canvas.on('object:modified', () => {
            this.updatePositionData();
            console.log('📊 Position data updated after modification');
        });
        this.canvas.on('object:moving', () => {
            this.updatePositionData();
            console.log('📍 Position data updated during movement');
        });
        this.canvas.on('object:scaling', () => {
            this.updatePositionData();
            console.log('📏 Position data updated during scaling');
        });
        this.canvas.on('object:rotating', () => {
            this.updatePositionData();
            console.log('🔄 Position data updated during rotation');
        });
        
        // Store original canvas dimensions for reference
        this.originalCanvasWidth = 1050;
        this.originalCanvasHeight = 650;
        
        // Ensure canvas is rendered
        this.canvas.renderAll();
        
        console.log('🎨 Fabric.js canvas initialized successfully');
        console.log('Canvas dimensions:', this.canvas.width, 'x', this.canvas.height);
    }
    
    setupCanvasControls() {
        // Zoom controls
        document.getElementById('zoomIn')?.addEventListener('click', () => this.zoomCanvas(1.1));
        document.getElementById('zoomOut')?.addEventListener('click', () => this.zoomCanvas(0.9));
        document.getElementById('resetZoom')?.addEventListener('click', () => this.resetZoom());
    }
    
    async loadTemplates() {
        try {
            console.log('📚 Loading templates...');
            
            const response = await fetch('http://localhost:9000/idcards/templates');
            const result = await response.json();
            
            if (result.success) {
                this.templates = result.templates || [];
                this.renderTemplatesGrid();
                console.log(`✅ Loaded ${this.templates.length} templates`);
            } else {
                throw new Error(result.message || 'Failed to load templates');
            }
            
        } catch (error) {
            console.error('❌ Error loading templates:', error);
            this.showMessage('Failed to load templates: ' + error.message, 'error');
            this.showTemplatesError();
        }
    }
    
    renderTemplatesGrid() {
        if (!this.templatesGrid) return;
        
        this.templatesGrid.innerHTML = '';
        
        if (this.templates.length === 0) {
            this.templatesGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #7f8c8d;">
                    <i class="fa fa-paint-brush" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                    <p>No templates found. Create your first template!</p>
                </div>
            `;
            return;
        }
        
        this.templates.forEach(template => {
            const templateCard = this.createTemplateCard(template);
            this.templatesGrid.appendChild(templateCard);
        });
    }
    
    createTemplateCard(template) {
        const card = document.createElement('div');
        card.className = 'template-card fade-in';
        card.dataset.templateId = template.id;
        
        const preview = template.FrontImagePath ? 
            `<img src="http://localhost:9000/idcards/templates/${template.FrontImagePath.split('/').pop()}" alt="${template.TemplateName}">` :
            `<i class="fa fa-image" style="font-size: 2rem; color: #bdc3c7;"></i>`;
        
        card.innerHTML = `
            <div class="template-header">
                <h4>${template.TemplateName}</h4>
                <div class="template-actions">
                    <button class="action-btn edit" onclick="templateEditorManager.editTemplate(${template.id})" title="Edit">
                        <i class="fa fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="templateEditorManager.deleteTemplate(${template.id})" title="Delete">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="template-preview">
                ${preview}
            </div>
            <div class="template-info">
                <span class="template-status ${template.IsActive ? 'active' : 'inactive'}">
                    ${template.IsActive ? 'Active' : 'Inactive'}
                </span>
                <small>${template.CardsGenerated || 0} cards generated</small>
            </div>
        `;
        
        return card;
    }
    
    handleImageUpload(e, side) {
        const file = e.target.files[0];
        if (file) {
            this.processImageFile(file, side);
        }
    }
    
    processImageFile(file, side) {
        // Validate file
        if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
            this.showMessage('Please select an image file (JPG, PNG) or PDF', 'error');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
            this.showMessage('File too large. Maximum size is 10MB', 'error');
            return;
        }
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById(`${side}Preview`);
            const previewImg = document.getElementById(`${side}PreviewImg`);
            const uploadZone = document.getElementById(`${side}UploadZone`);
            
            previewImg.src = e.target.result;
            preview.style.display = 'block';
            uploadZone.style.display = 'none';
            
            // Store file
            if (side === 'front') {
                this.frontImage = file;
            } else {
                this.backImage = file;
            }
            
            // Load image to canvas if it's the current side
            if (side === this.currentSide) {
                this.loadImageToCanvas(e.target.result);
            }
            
            // Show editor panel
            document.getElementById('editorPanel').style.display = 'block';
        };
        reader.readAsDataURL(file);
        
        console.log(`📸 ${side} image processed:`, file.name);
    }
    
    loadImageToCanvas(imageSrc) {
        if (!this.canvas) return;
        
        fabric.Image.fromURL(imageSrc, (img) => {
            console.log(`📸 Original image dimensions: ${img.width}x${img.height}`);
            
            // Store original image dimensions for accurate coordinate mapping
            this.originalImageWidth = img.width;
            this.originalImageHeight = img.height;
            
            // Calculate canvas size to match image while fitting in available space
            const maxCanvasWidth = 1050;  // Maximum canvas width for UI
            const maxCanvasHeight = 650;  // Maximum canvas height for UI
            
            let canvasWidth = img.width;
            let canvasHeight = img.height;
            
            // Scale down if image is larger than max canvas size, but keep aspect ratio
            if (canvasWidth > maxCanvasWidth || canvasHeight > maxCanvasHeight) {
                const scaleX = maxCanvasWidth / canvasWidth;
                const scaleY = maxCanvasHeight / canvasHeight;
                const scale = Math.min(scaleX, scaleY);
                
                canvasWidth = Math.round(img.width * scale);
                canvasHeight = Math.round(img.height * scale);
                
                console.log(`📏 Canvas scaled to fit UI: ${canvasWidth}x${canvasHeight} (scale: ${scale})`);
            }
            
            // Resize canvas to match image proportions
            this.canvas.setDimensions({
                width: canvasWidth,
                height: canvasHeight
            });
            
            // Calculate image scaling for the new canvas size
            const imageScaleX = canvasWidth / img.width;
            const imageScaleY = canvasHeight / img.height;
            const imageScale = Math.min(imageScaleX, imageScaleY);
            
            // Position image to fill the canvas exactly
            const scaledImageWidth = img.width * imageScale;
            const scaledImageHeight = img.height * imageScale;
            const left = (canvasWidth - scaledImageWidth) / 2;
            const top = (canvasHeight - scaledImageHeight) / 2;
            
            img.set({
                left: left,
                top: top,
                scaleX: imageScale,
                scaleY: imageScale,
                selectable: false,
                evented: false,
                originX: 'left',
                originY: 'top'
            });
            
            // Store scaling information for coordinate conversion
            this.canvasToImageScale = {
                scaleX: this.originalImageWidth / canvasWidth,
                scaleY: this.originalImageHeight / canvasHeight,
                canvasWidth: canvasWidth,
                canvasHeight: canvasHeight,
                imageWidth: this.originalImageWidth,
                imageHeight: this.originalImageHeight
            };
            
            // Clear canvas and add background image
            this.canvas.clear();
            this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas));
            
            // Reset zoom to fit
            this.canvas.setZoom(1);
            this.updateZoomDisplay();
            
            // Restore positioned elements for this side
            this.loadPositionedElements();
            
            console.log(`📸 Canvas resized to: ${canvasWidth}x${canvasHeight}`);
            console.log(`📊 Coordinate scale factors: ${this.canvasToImageScale.scaleX.toFixed(3)}x, ${this.canvasToImageScale.scaleY.toFixed(3)}y`);
            console.log(`📸 Image loaded to canvas with scale ${imageScale}`);
        });
    }
    
    addElementToCanvas(elementType, dropEvent) {
        if (!this.canvas) {
            console.error('❌ Canvas not initialized');
            this.showMessage('Canvas not ready. Please try again.', 'error');
            return;
        }
        
        let x, y;
        
        if (dropEvent && dropEvent.type === 'drop') {
            // Get canvas coordinates from drop event
            try {
                const pointer = this.canvas.getPointer(dropEvent);
                x = Math.max(10, Math.min(pointer.x, this.canvas.width - 100));
                y = Math.max(10, Math.min(pointer.y, this.canvas.height - 50));
                console.log('📍 Drop coordinates:', { x, y, pointer });
            } catch (error) {
                console.warn('⚠️ Error getting pointer coordinates, using center:', error);
                x = this.canvas.width / 2;
                y = this.canvas.height / 2;
            }
        } else {
            // Default to center if no drop event
            x = this.canvas.width / 2;
            y = this.canvas.height / 2;
        }
        
        this.createElementAtPosition(elementType, x, y);
    }
    
    addElementToCenter(elementType) {
        if (!this.canvas) {
            console.error('❌ Canvas not initialized');
            this.showMessage('Canvas not ready. Please try again.', 'error');
            return;
        }
        
        // Add element to center of canvas
        const x = this.canvas.width / 2;
        const y = this.canvas.height / 2;
        
        this.createElementAtPosition(elementType, x, y);
    }
    
    createElementAtPosition(elementType, x, y) {
        let element;
        
        switch (elementType) {
            case 'studentName':
                element = this.createTextElement('John Doe', x, y, { fontSize: 24, fontWeight: 'bold' });
                break;
            case 'rollId':
                element = this.createTextElement('001', x, y, { fontSize: 18, fontFamily: 'Courier New' });
                break;
            case 'className':
                element = this.createTextElement('Class 10-A', x, y, { fontSize: 16 });
                break;
            case 'studentId':
                element = this.createTextElement('ST001', x, y, { fontSize: 14 });
                break;
            case 'photo':
                element = this.createPhotoPlaceholder(x, y);
                break;
            case 'qrCode':
                element = this.createQRPlaceholder(x, y);
                break;
            case 'barcode':
                element = this.createBarcodePlaceholder(x, y);
                break;
            default:
                console.warn('Unknown element type:', elementType);
                element = this.createTextElement('Text Element', x, y);
        }
        
        if (element) {
            element.set({
                elementType: elementType,
                selectable: true,
                evented: true
            });
            
            this.canvas.add(element);
            this.canvas.setActiveObject(element);
            this.canvas.renderAll();
            
            console.log('✅ Added element:', elementType, 'at position:', x, y);
            this.showMessage(`Added ${elementType} to canvas`, 'success');
        }
    }

    // Debug method to test element addition
    testElementAddition() {
        console.log('🧪 Testing element addition...');
        if (!this.canvas) {
            console.error('❌ Canvas not available for testing');
            return;
        }
        
        console.log('✅ Canvas is available, testing studentName element');
        this.addElementToCenter('studentName');
    }

    createTextElement(text, x, y, options = {}) {
        return new fabric.Text(text, {
            left: x,
            top: y,
            fontSize: options.fontSize || 16,
            fontFamily: options.fontFamily || 'Arial',
            fontWeight: options.fontWeight || 'normal',
            fill: options.color || '#000000',
            ...options
        });
    }
    
    createPhotoPlaceholder(x, y) {
        return new fabric.Rect({
            left: x,
            top: y,
            width: 150,
            height: 200,
            fill: '#f0f0f0',
            stroke: '#cccccc',
            strokeWidth: 2,
            rx: 10,
            ry: 10
        });
    }
    
    createQRPlaceholder(x, y) {
        return new fabric.Rect({
            left: x,
            top: y,
            width: 100,
            height: 100,
            fill: '#000000',
            stroke: '#cccccc',
            strokeWidth: 1
        });
    }
    
    createBarcodePlaceholder(x, y) {
        return new fabric.Rect({
            left: x,
            top: y,
            width: 200,
            height: 50,
            fill: '#000000',
            stroke: '#cccccc',
            strokeWidth: 1
        });
    }
    
    createLogoPlaceholder(x, y) {
        return new fabric.Circle({
            left: x,
            top: y,
            radius: 50,
            fill: '#3498db',
            stroke: '#2980b9',
            strokeWidth: 2
        });
    }
    
    onObjectSelected(obj) {
        if (!obj) return;
        
        this.showObjectProperties(obj);
    }
    
    showObjectProperties(obj) {
        const propertiesContent = document.getElementById('propertiesContent');
        
        // Calculate actual image coordinates for display
        const canvasX = Math.round(obj.left);
        const canvasY = Math.round(obj.top);
        const canvasWidth = Math.round(obj.width * (obj.scaleX || 1));
        const canvasHeight = Math.round(obj.height * (obj.scaleY || 1));
        
        let actualX = canvasX;
        let actualY = canvasY;
        
        if (this.canvasToImageScale) {
            actualX = Math.round(canvasX * this.canvasToImageScale.scaleX);
            actualY = Math.round(canvasY * this.canvasToImageScale.scaleY);
        }
        
        let propertiesHTML = `
            <div class="property-group">
                <h5>Element Actions</h5>
                <div class="form-group">
                    <button class="btn btn-danger btn-sm" onclick="templateEditorManager.deleteSelectedElement()">
                        <i class="fa fa-trash"></i> Delete Element
                    </button>
                </div>
            </div>
            <div class="property-group">
                <h5>Position & Size (Canvas)</h5>
                <div class="form-group">
                    <label>X Position</label>
                    <input type="number" id="propX" value="${canvasX}" onchange="templateEditorManager.updateObjectProperty('left', this.value)">
                </div>
                <div class="form-group">
                    <label>Y Position</label>
                    <input type="number" id="propY" value="${canvasY}" onchange="templateEditorManager.updateObjectProperty('top', this.value)">
                </div>
                <div class="form-group">
                    <label>Width</label>
                    <input type="number" id="propWidth" value="${canvasWidth}" onchange="templateEditorManager.updateObjectSize('width', this.value)">
                </div>
                <div class="form-group">
                    <label>Height</label>
                    <input type="number" id="propHeight" value="${canvasHeight}" onchange="templateEditorManager.updateObjectSize('height', this.value)">
                </div>
            </div>
        `;
        
        // Add actual coordinates section for debugging
        if (this.canvasToImageScale) {
            propertiesHTML += `
                <div class="property-group">
                    <h5>Actual Image Coordinates</h5>
                    <div class="form-group">
                        <small style="color: #7f8c8d;">These coordinates will be used for ID generation</small>
                    </div>
                    <div class="form-group">
                        <label>Actual X</label>
                        <input type="number" value="${actualX}" readonly style="background: #f8f9fa;">
                    </div>
                    <div class="form-group">
                        <label>Actual Y</label>
                        <input type="number" value="${actualY}" readonly style="background: #f8f9fa;">
                    </div>
                    <div class="form-group">
                        <small style="color: #7f8c8d;">Scale: ${this.canvasToImageScale.scaleX.toFixed(3)}x, ${this.canvasToImageScale.scaleY.toFixed(3)}y</small>
                    </div>
                </div>
            `;
        }
        
        if (obj.type === 'text') {
            propertiesHTML += `
                <div class="property-group">
                    <h5>Text Properties</h5>
                    <div class="form-group">
                        <label>Text</label>
                        <input type="text" id="propText" value="${obj.text}" onchange="templateEditorManager.updateObjectProperty('text', this.value)">
                    </div>
                    <div class="form-group">
                        <label>Font Size</label>
                        <input type="number" id="propFontSize" value="${obj.fontSize}" onchange="templateEditorManager.updateObjectProperty('fontSize', this.value)">
                    </div>
                    <div class="form-group">
                        <label>Font Family</label>
                        <select id="propFontFamily" onchange="templateEditorManager.updateObjectProperty('fontFamily', this.value)">
                            <option value="Arial" ${obj.fontFamily === 'Arial' ? 'selected' : ''}>Arial</option>
                            <option value="Times New Roman" ${obj.fontFamily === 'Times New Roman' ? 'selected' : ''}>Times New Roman</option>
                            <option value="Courier New" ${obj.fontFamily === 'Courier New' ? 'selected' : ''}>Courier New</option>
                            <option value="Helvetica" ${obj.fontFamily === 'Helvetica' ? 'selected' : ''}>Helvetica</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Color</label>
                        <input type="color" id="propColor" value="${obj.fill}" onchange="templateEditorManager.updateObjectProperty('fill', this.value)">
                    </div>
                </div>
            `;
        }
        
        propertiesContent.innerHTML = propertiesHTML;
    }
    
    updateObjectProperty(property, value) {
        const activeObject = this.canvas.getActiveObject();
        if (!activeObject) return;
        
        activeObject.set(property, property === 'fontSize' ? parseInt(value) : value);
        this.canvas.renderAll();
        this.updatePositionData();
    }
    
    updateObjectSize(dimension, value) {
        const activeObject = this.canvas.getActiveObject();
        if (!activeObject) return;
        
        const numValue = parseInt(value);
        if (dimension === 'width') {
            const scale = numValue / activeObject.width;
            activeObject.set('scaleX', scale);
        } else {
            const scale = numValue / activeObject.height;
            activeObject.set('scaleY', scale);
        }
        
        this.canvas.renderAll();
        this.updatePositionData();
    }
    
    clearProperties() {
        const propertiesContent = document.getElementById('propertiesContent');
        propertiesContent.innerHTML = `
            <div class="no-selection">
                <i class="fa fa-mouse-pointer"></i>
                <p>Select an element to edit properties</p>
            </div>
        `;
    }
    
    updatePositionData() {
        const objects = this.canvas.getObjects();
        this.positionData[this.currentSide] = {};
        
        objects.forEach(obj => {
            if (obj.elementType) {
                // Get canvas coordinates
                const canvasX = Math.round(obj.left);
                const canvasY = Math.round(obj.top);
                const canvasWidth = Math.round(obj.width * (obj.scaleX || 1));
                const canvasHeight = Math.round(obj.height * (obj.scaleY || 1));
                
                // Convert to original image coordinates for accurate ID generation
                let actualX = canvasX;
                let actualY = canvasY;
                let actualWidth = canvasWidth;
                let actualHeight = canvasHeight;
                
                if (this.canvasToImageScale) {
                    actualX = Math.round(canvasX * this.canvasToImageScale.scaleX);
                    actualY = Math.round(canvasY * this.canvasToImageScale.scaleY);
                    actualWidth = Math.round(canvasWidth * this.canvasToImageScale.scaleX);
                    actualHeight = Math.round(canvasHeight * this.canvasToImageScale.scaleY);
                }
                
                this.positionData[this.currentSide][obj.elementType] = {
                    // Store both canvas and actual image coordinates
                    x: actualX,                    // Actual image coordinates for ID generation
                    y: actualY,
                    width: actualWidth,
                    height: actualHeight,
                    canvasX: canvasX,             // Canvas coordinates for debugging
                    canvasY: canvasY,
                    canvasWidth: canvasWidth,
                    canvasHeight: canvasHeight,
                    fontSize: obj.fontSize || 16,
                    fontFamily: obj.fontFamily || 'Arial',
                    color: obj.fill || '#000000',
                    align: obj.textAlign || 'left'
                };
                
                // Log coordinate information for debugging
                console.log(`📍 ${obj.elementType} coordinates:`, {
                    canvas: `${canvasX}, ${canvasY} (${canvasWidth}x${canvasHeight})`,
                    actual: `${actualX}, ${actualY} (${actualWidth}x${actualHeight})`,
                    scale: this.canvasToImageScale ? `${this.canvasToImageScale.scaleX.toFixed(3)}x, ${this.canvasToImageScale.scaleY.toFixed(3)}y` : 'No scale'
                });
            }
        });
        
        console.log(`📊 Updated position data for ${this.currentSide} side:`, this.positionData[this.currentSide]);
    }
    
    switchSide(side) {
        console.log(`🔄 Switching to ${side} side from ${this.currentSide}`);
        
        // Save current side position data before switching
        if (this.canvas) {
            this.updatePositionData();
        }
        
        this.currentSide = side;
        
        // Update all radio buttons (original and new ones)
        const radioButtons = document.querySelectorAll('input[name="cardSide"]');
        console.log(`Found ${radioButtons.length} radio buttons`);
        radioButtons.forEach(radio => {
            radio.checked = radio.value === side;
            console.log(`Radio ${radio.value} checked: ${radio.checked}`);
            
            // Update visual state for toggle switches
            const label = radio.closest('.toggle-switch');
            if (label) {
                if (radio.checked) {
                    label.classList.add('active');
                    label.style.background = '#9b59b6';
                    label.style.color = 'white';
                } else {
                    label.classList.remove('active');
                    label.style.background = 'white';
                    label.style.color = '#7f8c8d';
                }
            }
        });
        
        // Update the always visible side toggle buttons
        const alwaysVisibleContainer = document.querySelector('.side-toggle-always-visible');
        if (alwaysVisibleContainer) {
            this.updateSideToggleButtons(alwaysVisibleContainer);
        }
        
        // Clear canvas first
        if (this.canvas) {
            this.canvas.clear();
        }
        
        // Load appropriate image
        if (side === 'front' && this.frontImage) {
            console.log('Loading front image...');
            const reader = new FileReader();
            reader.onload = (e) => this.loadImageToCanvas(e.target.result);
            reader.readAsDataURL(this.frontImage);
        } else if (side === 'back' && this.backImage) {
            console.log('Loading back image...');
            const reader = new FileReader();
            reader.onload = (e) => this.loadImageToCanvas(e.target.result);
            reader.readAsDataURL(this.backImage);
        } else {
            console.log(`No image for ${side} side - using white background`);
            // No image for this side - clear canvas and set white background
            if (this.canvas) {
                this.canvas.clear();
                this.canvas.setBackgroundColor('#ffffff');
                this.canvas.renderAll();
                
                // Still load positioned elements even without background image
                this.loadPositionedElements();
            }
        }
        
        console.log(`✅ Successfully switched to ${side} side`);
    }
    
    loadPositionedElements() {
        const positions = this.positionData[this.currentSide];
        
        if (!positions || Object.keys(positions).length === 0) {
            console.log(`No positioned elements for ${this.currentSide} side`);
            return;
        }
        
        console.log(`Loading ${Object.keys(positions).length} positioned elements for ${this.currentSide} side`);
        
        Object.entries(positions).forEach(([elementType, position]) => {
            let element;
            
            // Handle new element type names (studentName, rollId, etc.)
            if (['studentName', 'rollId', 'className', 'studentId', 'student-name', 'roll-id', 'class-name', 'student-email', 'gender', 'dob', 'issue-date', 'valid-until'].includes(elementType)) {
                let defaultText = '';
                switch (elementType) {
                    case 'studentName':
                    case 'student-name': 
                        defaultText = 'John Doe'; 
                        break;
                    case 'rollId':
                    case 'roll-id': 
                        defaultText = '001'; 
                        break;
                    case 'className':
                    case 'class-name': 
                        defaultText = 'Class 10-A'; 
                        break;
                    case 'studentId':
                        defaultText = 'ST001';
                        break;
                    case 'student-email': 
                        defaultText = 'student@school.edu'; 
                        break;
                    case 'gender': 
                        defaultText = 'Male'; 
                        break;
                    case 'dob': 
                        defaultText = '01/01/2000'; 
                        break;
                    case 'issue-date': 
                        defaultText = 'Issue Date: ' + new Date().toLocaleDateString(); 
                        break;
                    case 'valid-until': 
                        defaultText = 'Valid Until: 2025'; 
                        break;
                }
                
                element = this.createTextElement(defaultText, position.x, position.y, position);
                
            } else if (elementType === 'photo') {
                element = this.createPhotoPlaceholder(position.x, position.y);
                element.set({ width: position.width || 150, height: position.height || 200 });
                
            } else if (elementType === 'qrCode' || elementType === 'qr-code') {
                element = this.createQRPlaceholder(position.x, position.y);
                element.set({ width: position.width || 100, height: position.height || 100 });
                
            } else if (elementType === 'barcode') {
                element = this.createBarcodePlaceholder(position.x, position.y);
                element.set({ width: position.width || 200, height: position.height || 50 });
                
            } else if (elementType === 'school-logo') {
                element = this.createLogoPlaceholder(position.x, position.y);
                if (position.width && position.height) {
                    element.set({ radius: Math.min(position.width, position.height) / 2 });
                }
            }
            
            if (element) {
                element.set('elementType', elementType);
                this.canvas.add(element);
                console.log(`✅ Restored ${elementType} element at (${position.x}, ${position.y})`);
            }
        });
        
        this.canvas.renderAll();
        console.log(`✅ Loaded ${Object.keys(positions).length} positioned elements for ${this.currentSide} side`);
    }
    
    validateForm() {
        const templateName = document.getElementById('templateName').value;
        return templateName.trim().length > 0 && (this.frontImage || this.backImage);
    }
    
    async saveTemplate() {
        if (!this.validateForm()) {
            this.showMessage('Please provide a template name and at least one image', 'error');
            return;
        }
        
        this.setLoading(true);
        
        try {
            // Update position data one more time before saving
            this.updatePositionData();
            
            // Prepare template data with image dimensions and scaling info
            const templateData = {
                positionData: this.positionData,
                imageDimensions: {
                    front: this.frontImage ? {
                        width: this.originalImageWidth,
                        height: this.originalImageHeight
                    } : null,
                    back: this.backImage ? {
                        width: this.originalImageWidth, 
                        height: this.originalImageHeight
                    } : null
                },
                canvasInfo: this.canvasToImageScale || null
            };
            
            const formData = new FormData();
            formData.append('templateName', document.getElementById('templateName').value);
            formData.append('positionData', JSON.stringify(templateData));
            
            if (this.frontImage) formData.append('frontImage', this.frontImage);
            if (this.backImage) formData.append('backImage', this.backImage);
            
            const response = await fetch('http://localhost:9000/idcards/templates/upload', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showMessage('Template saved successfully with accurate coordinates!', 'success');
                this.loadTemplates();
                this.cancelEdit();
                console.log('✅ Template saved with image dimensions and scaling data');
            } else {
                this.showMessage(result.message || 'Failed to save template', 'error');
            }
            
        } catch (error) {
            console.error('Error saving template:', error);
            this.showMessage('Error saving template: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
    zoomCanvas(factor) {
        const zoom = this.canvas.getZoom() * factor;
        this.canvas.setZoom(zoom);
        this.updateZoomDisplay();
    }
    
    resetZoom() {
        this.canvas.setZoom(1);
        this.updateZoomDisplay();
    }
    
    updateZoomDisplay() {
        const zoomLevel = document.querySelector('.zoom-level');
        if (zoomLevel) {
            zoomLevel.textContent = Math.round(this.canvas.getZoom() * 100) + '%';
        }
    }
    
    showMessage(message, type = 'info') {
        const alertClass = type === 'error' ? 'alert-error' : 
                          type === 'success' ? 'alert-success' : 'alert-info';
        
        const icon = type === 'error' ? 'fa-exclamation-triangle' : 
                    type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
        
        this.messageArea.innerHTML = `
            <div class="alert ${alertClass} fade-in">
                <i class="fa ${icon}"></i>
                ${message}
            </div>
        `;
        
        if (type === 'success') {
            setTimeout(() => this.clearMessages(), 5000);
        }
    }
    
    clearMessages() {
        this.messageArea.innerHTML = '';
    }
    
    setLoading(loading) {
        this.isLoading = loading;
        // Update UI loading states
    }
    
    createNewTemplate() {
        // Show the editor section
        const editorSection = document.getElementById('editorSection');
        if (editorSection) {
            editorSection.style.display = 'block';
        }
        
        // Show the editor panel immediately so users can see the interface
        const editorPanel = document.getElementById('editorPanel');
        if (editorPanel) {
            editorPanel.style.display = 'block';
            console.log('📊 Editor panel made visible');
        }
        
        // Ensure side toggle buttons are always visible
        this.ensureSideToggleAlwaysVisible();
        
        // Reset form to clean state
        this.resetForm();
        this.showMessage('Ready to create new template - Upload an image to begin or drag elements to the canvas', 'info');
    }
    
    resetForm() {
        // Clear template name
        const templateNameInput = document.getElementById('templateName');
        if (templateNameInput) {
            templateNameInput.value = '';
        }
        
        // Reset images
        this.frontImage = null;
        this.backImage = null;
        this.positionData = { front: {}, back: {} };
        this.currentSide = 'front';
        
        // Reset upload zones
        this.removeImage('front');
        this.removeImage('back');
        
        // Clear canvas
        this.clearCanvas();
        this.clearProperties();
        
        // Reset class selection
        const assignedClassesSelect = document.getElementById('assignedClasses');
        if (assignedClassesSelect) {
            assignedClassesSelect.selectedIndex = 0;
        }
        
        // Enable form
        this.validateForm();
    }
    
    removeImage(side) {
        if (side === 'front') {
            this.frontImage = null;
        } else {
            this.backImage = null;
        }
        
        // Reset the upload zone
        const uploadZone = document.getElementById(`${side}UploadZone`);
        const preview = document.getElementById(`${side}Preview`);
        
        if (uploadZone && preview) {
            uploadZone.innerHTML = `
                <i class="fa fa-cloud-upload"></i>
                <p>Drop ${side} image here or click to browse</p>
                <small>Supports PNG, JPG, PDF • Max 10MB</small>
            `;
            uploadZone.style.display = 'block';
            preview.style.display = 'none';
        }
        
        // Clear canvas if this side is currently displayed
        if (side === this.currentSide) {
            this.clearCanvas();
            this.canvas.setBackgroundColor('#ffffff');
            this.canvas.renderAll();
        }
        
        // Reset the file input
        const fileInput = document.getElementById(`${side}ImageInput`);
        if (fileInput) {
            fileInput.value = '';
        }
        
        this.validateForm();
        this.showMessage(`${side.charAt(0).toUpperCase() + side.slice(1)} image removed`, 'info');
    }
    
    ensureSideToggleAlwaysVisible() {
        console.log('🎯 Ensuring side toggle buttons are always visible...');
        
        try {
            // Find or create a container for the side toggle in the editor header
            const editorHeader = document.querySelector('.editor-header');
            if (!editorHeader) {
                console.warn('⚠️ Editor header not found, trying alternative location');
                this.createSideToggleInConfigPanel();
                return;
            }
            
            // Check if side toggle already exists in a good location
            let existingSideToggle = document.querySelector('.side-toggle-always-visible');
            if (existingSideToggle) {
                console.log('✅ Side toggle already exists in visible location');
                this.updateSideToggleButtons(existingSideToggle);
                return;
            }
            
            // Create new side toggle in the editor header
            const sideToggleContainer = document.createElement('div');
            sideToggleContainer.className = 'side-toggle-always-visible';
            sideToggleContainer.style.cssText = `
                display: flex;
                align-items: center;
                gap: 10px;
                margin-left: auto;
                background: white;
                border-radius: 6px;
                overflow: hidden;
                border: 2px solid #e9ecef;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            `;
            
            // Create the toggle buttons
            sideToggleContainer.innerHTML = `
                <label class="toggle-switch" style="
                    padding: 8px 16px;
                    cursor: pointer;
                    border: none;
                    background: ${this.currentSide === 'front' ? '#9b59b6' : 'white'};
                    color: ${this.currentSide === 'front' ? 'white' : '#7f8c8d'};
                    font-weight: 500;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin: 0;
                    border-radius: 0;
                ">
                    <input type="radio" name="cardSide" value="front" ${this.currentSide === 'front' ? 'checked' : ''} style="display: none;">
                    <span>Front</span>
                </label>
                <label class="toggle-switch" style="
                    padding: 8px 16px;
                    cursor: pointer;
                    border: none;
                    background: ${this.currentSide === 'back' ? '#9b59b6' : 'white'};
                    color: ${this.currentSide === 'back' ? 'white' : '#7f8c8d'};
                    font-weight: 500;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin: 0;
                    border-radius: 0;
                ">
                    <input type="radio" name="cardSide" value="back" ${this.currentSide === 'back' ? 'checked' : ''} style="display: none;">
                    <span>Back</span>
                </label>
            `;
            
            // Add to editor header
            editorHeader.appendChild(sideToggleContainer);
            
            // Setup event listeners for the new buttons
            this.setupSideToggleEventListeners(sideToggleContainer);
            
            console.log('✅ Side toggle buttons created in editor header and always visible');
            
        } catch (error) {
            console.error('❌ Error ensuring side toggle visibility:', error);
            this.createSideToggleInConfigPanel();
        }
    }
    
    createSideToggleInConfigPanel() {
        console.log('🎯 Creating side toggle in config panel as fallback...');
        
        try {
            const configPanel = document.querySelector('.config-panel');
            if (!configPanel) {
                console.warn('⚠️ Config panel not found, creating floating side toggle');
                this.createFloatingSideToggle();
                return;
            }
            
            // Create side toggle section in config panel
            const sideToggleSection = document.createElement('div');
            sideToggleSection.className = 'side-toggle-section';
            sideToggleSection.innerHTML = `
                <h4 style="margin-bottom: 15px; color: #2c3e50; display: flex; align-items: center; gap: 8px;">
                    <i class="fa fa-refresh"></i> Card Side Selection
                </h4>
                <div class="side-toggle-always-visible" style="
                    display: flex;
                    background: white;
                    border-radius: 6px;
                    overflow: hidden;
                    border: 2px solid #e9ecef;
                    margin-bottom: 20px;
                ">
                    <label class="toggle-switch" style="
                        padding: 12px 20px;
                        cursor: pointer;
                        border: none;
                        background: ${this.currentSide === 'front' ? '#9b59b6' : 'white'};
                        color: ${this.currentSide === 'front' ? 'white' : '#7f8c8d'};
                        font-weight: 500;
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        margin: 0;
                        border-radius: 0;
                        flex: 1;
                        justify-content: center;
                    ">
                        <input type="radio" name="cardSide" value="front" ${this.currentSide === 'front' ? 'checked' : ''} style="display: none;">
                        <span>Front Side</span>
                    </label>
                    <label class="toggle-switch" style="
                        padding: 12px 20px;
                        cursor: pointer;
                        border: none;
                        background: ${this.currentSide === 'back' ? '#9b59b6' : 'white'};
                        color: ${this.currentSide === 'back' ? 'white' : '#7f8c8d'};
                        font-weight: 500;
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        margin: 0;
                        border-radius: 0;
                        flex: 1;
                        justify-content: center;
                    ">
                        <input type="radio" name="cardSide" value="back" ${this.currentSide === 'back' ? 'checked' : ''} style="display: none;">
                        <span>Back Side</span>
                    </label>
                </div>
            `;
            
            // Insert at the beginning of config panel
            configPanel.insertBefore(sideToggleSection, configPanel.firstChild);
            
            // Setup event listeners
            const sideToggleContainer = sideToggleSection.querySelector('.side-toggle-always-visible');
            this.setupSideToggleEventListeners(sideToggleContainer);
            
            console.log('✅ Side toggle buttons created in config panel');
            
        } catch (error) {
            console.error('❌ Error creating side toggle in config panel:', error);
            this.createFloatingSideToggle();
        }
    }
    
    createFloatingSideToggle() {
        console.log('🎯 Creating floating side toggle as final fallback...');
        
        try {
            // Remove any existing floating toggle
            const existingFloating = document.querySelector('.floating-side-toggle');
            if (existingFloating) {
                existingFloating.remove();
            }
            
            // Create floating side toggle
            const floatingToggle = document.createElement('div');
            floatingToggle.className = 'floating-side-toggle';
            floatingToggle.style.cssText = `
                position: fixed;
                top: 120px;
                right: 20px;
                z-index: 1000;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                border: 2px solid #e9ecef;
                padding: 10px;
            `;
            
            floatingToggle.innerHTML = `
                <div style="margin-bottom: 8px; font-weight: 600; color: #2c3e50; text-align: center; font-size: 12px;">
                    Card Side
                </div>
                <div class="side-toggle-always-visible" style="
                    display: flex;
                    background: white;
                    border-radius: 6px;
                    overflow: hidden;
                    border: 1px solid #e9ecef;
                ">
                    <label class="toggle-switch" style="
                        padding: 8px 12px;
                        cursor: pointer;
                        border: none;
                        background: ${this.currentSide === 'front' ? '#9b59b6' : 'white'};
                        color: ${this.currentSide === 'front' ? 'white' : '#7f8c8d'};
                        font-weight: 500;
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        margin: 0;
                        border-radius: 0;
                        font-size: 12px;
                    ">
                        <input type="radio" name="cardSide" value="front" ${this.currentSide === 'front' ? 'checked' : ''} style="display: none;">
                        <span>Front</span>
                    </label>
                    <label class="toggle-switch" style="
                        padding: 8px 12px;
                        cursor: pointer;
                        border: none;
                        background: ${this.currentSide === 'back' ? '#9b59b6' : 'white'};
                        color: ${this.currentSide === 'back' ? 'white' : '#7f8c8d'};
                        font-weight: 500;
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        margin: 0;
                        border-radius: 0;
                        font-size: 12px;
                    ">
                        <input type="radio" name="cardSide" value="back" ${this.currentSide === 'back' ? 'checked' : ''} style="display: none;">
                        <span>Back</span>
                    </label>
                </div>
            `;
            
            // Add to body
            document.body.appendChild(floatingToggle);
            
            // Setup event listeners
            const sideToggleContainer = floatingToggle.querySelector('.side-toggle-always-visible');
            this.setupSideToggleEventListeners(sideToggleContainer);
            
            console.log('✅ Floating side toggle created and always visible');
            
        } catch (error) {
            console.error('❌ Critical error creating floating side toggle:', error);
        }
    }
    
    setupSideToggleEventListeners(container) {
        if (!container) return;
        
        const radioButtons = container.querySelectorAll('input[name="cardSide"]');
        console.log(`🎯 Setting up ${radioButtons.length} side toggle event listeners`);
        
        radioButtons.forEach(radio => {
            radio.addEventListener('change', (e) => {
                console.log('🔄 Side toggle clicked:', e.target.value);
                this.switchSide(e.target.value);
                this.updateSideToggleButtons(container);
            });
        });
    }
    
    updateSideToggleButtons(container) {
        if (!container) return;
        
        try {
            const toggles = container.querySelectorAll('.toggle-switch');
            toggles.forEach(toggle => {
                const radio = toggle.querySelector('input[type="radio"]');
                if (radio) {
                    const isActive = radio.value === this.currentSide;
                    radio.checked = isActive;
                    
                    // Update styling
                    toggle.style.background = isActive ? '#9b59b6' : 'white';
                    toggle.style.color = isActive ? 'white' : '#7f8c8d';
                    
                    if (isActive) {
                        toggle.classList.add('active');
                    } else {
                        toggle.classList.remove('active');
                    }
                }
            });
            
            console.log(`✅ Updated side toggle buttons - current side: ${this.currentSide}`);
            
        } catch (error) {
            console.error('❌ Error updating side toggle buttons:', error);
        }
    }
    
    clearProperties() {
        const propertiesContent = document.getElementById('propertiesContent');
        if (propertiesContent) {
            propertiesContent.innerHTML = `
                <div class="no-selection">
                    <i class="fa fa-mouse-pointer"></i>
                    <p>Select an element to edit its properties</p>
                </div>
            `;
        }
    }
    
    validateForm() {
        const templateName = document.getElementById('templateName')?.value;
        const hasImages = this.frontImage !== null;
        
        const isValid = templateName && templateName.trim().length > 0 && hasImages;
        
        const saveBtn = document.getElementById('saveTemplateBtn');
        if (saveBtn) {
            saveBtn.disabled = !isValid;
        }
        
        return isValid;
    }
    
    previewTemplate() {
        if (!this.canvas) {
            this.showMessage('No template to preview', 'error');
            return;
        }
        
        try {
            // For Electron, use a different approach - create an in-page modal
            const canvasDataURL = this.canvas.toDataURL('image/png');
            
            // Create modal overlay
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
            `;
            
            // Create modal content
            modal.innerHTML = `
                <div style="
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    max-width: 90%;
                    max-height: 90%;
                    overflow: auto;
                    text-align: center;
                    position: relative;
                ">
                    <h2 style="margin-top: 0; color: #333;">Template Preview - ${this.currentSide.toUpperCase()} Side</h2>
                    <p style="color: #666; font-size: 14px;">Click anywhere to close</p>
                    <img src="${canvasDataURL}" alt="Template Preview" style="
                        max-width: 100%;
                        height: auto;
                        border: 1px solid #ccc;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        margin-top: 10px;
                    ">
                </div>
            `;
            
            // Close modal on click
            modal.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            // Add to page
            document.body.appendChild(modal);
            
            console.log('✅ Preview modal opened for', this.currentSide, 'side');
            
        } catch (error) {
            console.error('Preview error:', error);
            this.showMessage('Failed to create preview: ' + error.message, 'error');
        }
    }
    
    deleteSelectedElement() {
        const activeObject = this.canvas.getActiveObject();
        if (!activeObject) {
            this.showMessage('Please select an element to delete', 'error');
            return;
        }
        
        if (confirm('Are you sure you want to delete this element?')) {
            this.canvas.remove(activeObject);
            this.canvas.discardActiveObject();
            this.canvas.renderAll();
            this.updatePositionData();
            this.clearProperties();
            this.showMessage('Element deleted successfully', 'success');
        }
    }

    // Debug method to test coordinates and positioning
    debugCoordinates() {
        console.log('🧪 Debug: Canvas and coordinate information');
        console.log('Canvas dimensions:', this.canvas.width, 'x', this.canvas.height);
        console.log('Original image dimensions:', this.originalImageWidth, 'x', this.originalImageHeight);
        console.log('Canvas to image scale:', this.canvasToImageScale);
        console.log('Current position data:', this.positionData[this.currentSide]);
        
        const objects = this.canvas.getObjects();
        objects.forEach((obj, index) => {
            if (obj.elementType) {
                const canvasX = Math.round(obj.left);
                const canvasY = Math.round(obj.top);
                let actualX = canvasX;
                let actualY = canvasY;
                
                if (this.canvasToImageScale) {
                    actualX = Math.round(canvasX * this.canvasToImageScale.scaleX);
                    actualY = Math.round(canvasY * this.canvasToImageScale.scaleY);
                }
                
                console.log(`Element ${index + 1} (${obj.elementType}):`, {
                    canvas: `${canvasX}, ${canvasY}`,
                    actual: `${actualX}, ${actualY}`
                });
            }
        });
    }

    clearCanvas() {
        if (this.canvas) {
            this.canvas.clear();
            this.canvas.setBackgroundColor('#ffffff');
            this.canvas.renderAll();
        }
    }
}

// Test functions for debugging
function testElementAddition() {
    if (window.templateEditorManager) {
        window.templateEditorManager.testElementAddition();
    } else {
        console.error('❌ templateEditorManager not available');
    }
}

function forceSetupDragDrop() {
    console.log('🔧 Force setting up drag/drop...');
    if (window.templateEditorManager) {
        window.templateEditorManager.renderElementPalette();
        console.log('✅ Drag/drop setup forced');
    } else {
        console.error('❌ templateEditorManager not available');
    }
}

function testSideSwitch() {
    console.log('🔄 Testing side switching...');
    const manager = window.templateEditorManager;
    if (!manager) {
        console.error('❌ templateEditorManager not available');
        return;
    }
    
    console.log('Current side:', manager.currentSide);
    
    // Make sure editor panel is visible
    const editorPanel = document.getElementById('editorPanel');
    if (editorPanel) {
        editorPanel.style.display = 'block';
        console.log('📊 Editor panel made visible for testing');
    }
    
    // Test switching to back
    console.log('🎯 Switching to back...');
    manager.switchSide('back');
    
    setTimeout(() => {
        console.log('Current side after switch:', manager.currentSide);
        console.log('Radio buttons state:');
        document.querySelectorAll('input[name="cardSide"]').forEach(radio => {
            const label = radio.closest('.toggle-switch');
            console.log(`  ${radio.value}: ${radio.checked} (label has active: ${label?.classList.contains('active')})`);
        });
        
        // Test switch back to front
        setTimeout(() => {
            console.log('🎯 Switching back to front...');
            manager.switchSide('front');
            
            setTimeout(() => {
                console.log('Final state - Current side:', manager.currentSide);
                console.log('Final radio buttons state:');
                document.querySelectorAll('input[name="cardSide"]').forEach(radio => {
                    const label = radio.closest('.toggle-switch');
                    console.log(`  ${radio.value}: ${radio.checked} (label has active: ${label?.classList.contains('active')})`);
                });
            }, 300);
        }, 1000);
    }, 500);
}

function showSideButtons() {
    console.log('🔍 Making side toggle buttons visible...');
    
    // Force show editor panel
    const editorPanel = document.getElementById('editorPanel');
    if (editorPanel) {
        editorPanel.style.display = 'block';
        console.log('📊 Editor panel forced visible');
    }
    
    // Force show editor section
    const editorSection = document.getElementById('editorSection');
    if (editorSection) {
        editorSection.style.display = 'block';
        console.log('📊 Editor section forced visible');
    }
    
    // Find and highlight the canvas header area
    const canvasHeader = document.querySelector('.canvas-header');
    if (canvasHeader) {
        canvasHeader.style.backgroundColor = '#ffeb3b';
        canvasHeader.style.padding = '20px';
        canvasHeader.style.border = '3px solid #f44336';
        canvasHeader.style.margin = '10px 0';
        console.log('🎯 Canvas header highlighted');
    } else {
        console.warn('⚠️ Canvas header not found');
    }
    
    // Find and style side toggle area
    const sideToggle = document.querySelector('.side-toggle');
    if (sideToggle) {
        sideToggle.style.backgroundColor = '#4caf50';
        sideToggle.style.border = '5px solid #f44336';
        sideToggle.style.padding = '10px';
        sideToggle.style.fontSize = '18px';
        sideToggle.style.fontWeight = 'bold';
        console.log('🎯 Side toggle area highlighted');
    } else {
        console.warn('⚠️ Side toggle not found');
    }
    
    // Log toggle buttons status
    const toggles = document.querySelectorAll('.toggle-switch');
    console.log(`Found ${toggles.length} toggle switches`);
    
    toggles.forEach((toggle, index) => {
        const radio = toggle.querySelector('input[type="radio"]');
        const span = toggle.querySelector('span');
        console.log(`Toggle ${index}:`, {
            text: span?.textContent,
            value: radio?.value,
            checked: radio?.checked,
            visible: toggle.offsetWidth > 0 && toggle.offsetHeight > 0,
            position: {
                top: toggle.offsetTop,
                left: toggle.offsetLeft,
                width: toggle.offsetWidth,
                height: toggle.offsetHeight
            }
        });
        
        // Add extreme visual highlighting for testing
        toggle.style.border = '5px solid #ff0000';
        toggle.style.fontSize = '20px';
        toggle.style.fontWeight = 'bold';
        toggle.style.padding = '15px 25px';
        toggle.style.margin = '5px';
        toggle.style.backgroundColor = radio?.checked ? '#00ff00' : '#ffff00';
        toggle.style.color = '#000000';
        toggle.style.minWidth = '100px';
        toggle.style.minHeight = '50px';
    });
    
    // Check if canvas area exists
    const canvasArea = document.querySelector('.canvas-area');
    if (canvasArea) {
        console.log('📊 Canvas area found and visible');
        canvasArea.style.border = '3px solid blue';
    } else {
        console.warn('⚠️ Canvas area not found');
    }
    
    // Check all parent containers
    const editorWorkspace = document.querySelector('.editor-workspace');
    if (editorWorkspace) {
        console.log('📊 Editor workspace found');
        editorWorkspace.style.border = '2px solid orange';
    }
    
    // Scroll to the canvas header area
    if (canvasHeader) {
        canvasHeader.scrollIntoView({ behavior: 'smooth', block: 'center' });
        console.log('📍 Scrolled to canvas header');
    }
}

function testDragDrop() {
    console.log('🧪 Testing drag/drop setup...');
    const elementItems = document.querySelectorAll('.element-item');
    console.log(`Found ${elementItems.length} element items`);
    
    // Test element setup
    elementItems.forEach((item, index) => {
        console.log(`Item ${index}:`, {
            type: item.dataset.type,
            draggable: item.draggable,
            text: item.querySelector('span')?.textContent,
            hasDataType: !!item.dataset.type
        });
    });
    
    // Test canvas setup
    const canvasContainer = document.querySelector('.canvas-container');
    const canvasElement = document.getElementById('templateCanvas');
    console.log('Canvas container found:', !!canvasContainer);
    console.log('Canvas element found:', !!canvasElement);
    console.log('Fabric canvas initialized:', !!window.templateEditorManager?.canvas);
    
    if (window.templateEditorManager?.canvas) {
        console.log('Canvas dimensions:', {
            width: window.templateEditorManager.canvas.width,
            height: window.templateEditorManager.canvas.height
        });
    }
    
    // Test drag/drop handlers
    const manager = window.templateEditorManager;
    if (manager) {
        console.log('Drop handlers bound:', {
            canvasDragOver: typeof manager.canvasDragOver,
            canvasDrop: typeof manager.canvasDrop
        });
    }
    
    // Simulate drag start on first element
    if (elementItems.length > 0) {
        const firstItem = elementItems[0];
        console.log('🎯 Testing drag start on first element:', firstItem.dataset.type);
        
        // Create a fake drag event
        const fakeEvent = new Event('dragstart');
        fakeEvent.dataTransfer = {
            setData: (type, data) => {
                console.log('📤 Drag data set:', { type, data });
            },
            effectAllowed: null
        };
        
        // Trigger drag start
        firstItem.dispatchEvent(fakeEvent);
    }
}

// Global functions
function createNewTemplate() {
    if (window.templateEditorManager) {
        window.templateEditorManager.createNewTemplate();
    }
}

function refreshTemplates() {
    if (window.templateEditorManager) {
        window.templateEditorManager.loadTemplates();
    }
}

function zoomIn() {
    if (window.templateEditorManager) {
        window.templateEditorManager.zoomCanvas(1.1);
    }
}

function zoomOut() {
    if (window.templateEditorManager) {
        window.templateEditorManager.zoomCanvas(0.9);
    }
}

function resetZoom() {
    if (window.templateEditorManager) {
        window.templateEditorManager.resetZoom();
    }
}

function previewTemplate() {
    if (window.templateEditorManager) {
        window.templateEditorManager.previewTemplate();
    }
}

function deleteSelectedElement() {
    if (window.templateEditorManager) {
        window.templateEditorManager.deleteSelectedElement();
    }
}

function switchSide(side) {
    if (window.templateEditorManager) {
        window.templateEditorManager.switchSide(side);
    }
}

function removeFrontImage() {
    if (window.templateEditorManager) {
        window.templateEditorManager.removeImage('front');
    }
}

function removeBackImage() {
    if (window.templateEditorManager) {
        window.templateEditorManager.removeImage('back');
    }
}

function cancelEdit() {
    if (window.templateEditorManager) {
        window.templateEditorManager.cancelEdit();
    }
}

function saveTemplate() {
    if (window.templateEditorManager) {
        window.templateEditorManager.saveTemplate();
    }
}

// Initialize
const templateEditorManager = new TemplateEditorManager();
window.templateEditorManager = templateEditorManager;

// Debug functions
function debugDOMStructure() {
    console.log('🔍 Debugging DOM structure...');
    
    // Check all levels of containers
    const containers = [
        { name: 'editorSection', selector: '#editorSection' },
        { name: 'editorPanel', selector: '#editorPanel' },
        { name: 'editorWorkspace', selector: '.editor-workspace' },
        { name: 'canvasArea', selector: '.canvas-area' },
        { name: 'canvasHeader', selector: '.canvas-header' },
        { name: 'sideToggle', selector: '.side-toggle' },
        { name: 'toggleSwitches', selector: '.toggle-switch' }
    ];
    
    containers.forEach(container => {
        const element = document.querySelector(container.selector);
        if (element) {
            const styles = window.getComputedStyle(element);
            console.log(`✅ ${container.name}:`, {
                exists: true,
                display: styles.display,
                visibility: styles.visibility,
                position: {
                    top: element.offsetTop,
                    left: element.offsetLeft,
                    width: element.offsetWidth,
                    height: element.offsetHeight
                },
                isVisible: element.offsetWidth > 0 && element.offsetHeight > 0,
                zIndex: styles.zIndex
            });
            
            // Force make visible
            if (styles.display === 'none') {
                element.style.display = 'block';
                console.log(`🔧 Forced ${container.name} display to block`);
            }
            if (styles.visibility === 'hidden') {
                element.style.visibility = 'visible';
                console.log(`🔧 Forced ${container.name} visibility to visible`);
            }
        } else {
            console.error(`❌ ${container.name} not found with selector: ${container.selector}`);
        }
    });
}

function showNormalSideButtons() {
    console.log('🔍 Making side toggle buttons visible with normal styling...');
    
    // Ensure all necessary containers are visible
    const containers = [
        '#editorSection',
        '#editorPanel', 
        '.editor-workspace',
        '.canvas-area',
        '.canvas-header',
        '.side-toggle'
    ];
    
    containers.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.style.display = 'block';
            element.style.visibility = 'visible';
            element.style.opacity = '1';
        }
    });
    
    // Find and ensure side toggle area is properly styled
    const sideToggle = document.querySelector('.side-toggle');
    if (sideToggle) {
        sideToggle.style.display = 'flex';
        sideToggle.style.background = 'white';
        sideToggle.style.borderRadius = '6px';
        sideToggle.style.overflow = 'hidden';
        sideToggle.style.border = '2px solid #e9ecef';
        console.log('🎯 Side toggle area made visible with normal styling');
    } else {
        console.warn('⚠️ Side toggle not found');
    }
    
    // Style toggle switches normally
    const toggles = document.querySelectorAll('.toggle-switch');
    console.log(`Found ${toggles.length} toggle switches`);
    
    toggles.forEach((toggle, index) => {
        const radio = toggle.querySelector('input[type="radio"]');
        const span = toggle.querySelector('span');
        
        // Apply normal toggle switch styling
        toggle.style.padding = '8px 16px';
        toggle.style.cursor = 'pointer';
        toggle.style.border = 'none';
        toggle.style.background = 'white';
        toggle.style.color = '#7f8c8d';
        toggle.style.fontWeight = '500';
        toggle.style.transition = 'all 0.2s';
        toggle.style.display = 'flex';
        toggle.style.alignItems = 'center';
        toggle.style.gap = '8px';
        toggle.style.margin = '0';
        toggle.style.borderRadius = '0';
        
        // Apply active state styling
        if (radio?.checked) {
            toggle.style.background = '#9b59b6';
            toggle.style.color = 'white';
            toggle.classList.add('active');
        } else {
            toggle.style.background = 'white';
            toggle.style.color = '#7f8c8d';
            toggle.classList.remove('active');
        }
        
        // Add hover effect
        toggle.addEventListener('mouseenter', () => {
            if (!radio?.checked) {
                toggle.style.background = '#f8f9fa';
            }
        });
        
        toggle.addEventListener('mouseleave', () => {
            if (!radio?.checked) {
                toggle.style.background = 'white';
            }
        });
        
        console.log(`✅ Toggle ${index} (${span?.textContent}): checked=${radio?.checked}, visible=${toggle.offsetWidth > 0}`);
    });
    
    // Scroll to make sure buttons are in view
    const canvasHeader = document.querySelector('.canvas-header');
    if (canvasHeader) {
        canvasHeader.scrollIntoView({ behavior: 'smooth', block: 'center' });
        console.log('📍 Scrolled to canvas header area');
    }
    
    console.log('✅ Side toggle buttons are now visible with proper styling!');
}

function resetSideButtonStyling() {
    console.log('🔧 Resetting side button styling to normal...');
    
    // Reset canvas header to normal
    const canvasHeader = document.querySelector('.canvas-header');
    if (canvasHeader) {
        canvasHeader.style.backgroundColor = '';
        canvasHeader.style.padding = '';
        canvasHeader.style.border = '';
        canvasHeader.style.margin = '';
        console.log('✅ Canvas header styling reset');
    }
    
    // Reset side toggle area to normal but keep it visible
    const sideToggle = document.querySelector('.side-toggle');
    if (sideToggle) {
        sideToggle.style.backgroundColor = '';
        sideToggle.style.border = '';
        sideToggle.style.padding = '';
        sideToggle.style.fontSize = '';
        sideToggle.style.fontWeight = '';
        console.log('✅ Side toggle area styling reset');
    }
    
    // Reset toggle switches to normal size but keep them visible
    const toggles = document.querySelectorAll('.toggle-switch');
    console.log(`Resetting ${toggles.length} toggle switches`);
    
    toggles.forEach((toggle, index) => {
        const radio = toggle.querySelector('input[type="radio"]');
        
        // Reset all the extreme styling
        toggle.style.border = '';
        toggle.style.fontSize = '';
        toggle.style.fontWeight = '';
        toggle.style.padding = '';
        toggle.style.margin = '';
        toggle.style.backgroundColor = '';
        toggle.style.color = '';
        toggle.style.minWidth = '';
        toggle.style.minHeight = '';
        
        // Apply normal styling that matches the design
        toggle.style.display = 'flex';
        toggle.style.alignItems = 'center';
        toggle.style.gap = '8px';
        toggle.style.padding = '8px 16px';
        toggle.style.cursor = 'pointer';
        toggle.style.transition = 'all 0.2s';
        
        // Apply active state if checked
        if (radio?.checked) {
            toggle.style.backgroundColor = '#9b59b6';
            toggle.style.color = 'white';
            toggle.classList.add('active');
        } else {
            toggle.style.backgroundColor = 'white';
            toggle.style.color = '#7f8c8d';
            toggle.classList.remove('active');
        }
        
        console.log(`✅ Reset toggle ${index} (${radio?.value}): checked=${radio?.checked}`);
    });
    
    // Reset other highlighted areas
    const canvasArea = document.querySelector('.canvas-area');
    if (canvasArea) {
        canvasArea.style.border = '';
    }
    
    const editorWorkspace = document.querySelector('.editor-workspace');
    if (editorWorkspace) {
        editorWorkspace.style.border = '';
    }
    
    console.log('🎯 All styling reset to normal - buttons should now be properly sized and visible');
}

function forceShowSideToggle() {
    console.log('🔧 Force showing side toggle buttons...');
    
    const manager = window.templateEditorManager;
    if (!manager) {
        console.error('❌ templateEditorManager not available');
        return;
    }
    
    // Try all methods to ensure visibility
    manager.ensureSideToggleAlwaysVisible();
    
    // Also create floating toggle as backup
    setTimeout(() => {
        manager.createFloatingSideToggle();
    }, 500);
    
    console.log('✅ Side toggle buttons forced to show');
}

function debugTemplateCoordinates() {
    console.log('🧪 Debugging template coordinates...');
    
    const manager = window.templateEditorManager;
    if (!manager) {
        console.error('❌ templateEditorManager not available');
        return;
    }
    
    manager.debugCoordinates();
    console.log('✅ Coordinate debug information printed to console');
}

console.log('🚀 Template Editor page loaded');
