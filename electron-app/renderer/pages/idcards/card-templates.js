// ID Card Template Editor with Fabric.js

class TemplateEditorManager {
    constructor() {
        this.canvas = null;
        this.templates = [];
        this.currentTemplate = null;
        this.currentSide = 'front';
        this.frontImage = null;
        this.backImage = null;
        this.positionData = { front: {}, back: {} };
        this.isLoading = false;
        
        this.init();
    }
    
    init() {
        document.addEventListener('DOMContentLoaded', () => this.setup());
    }
    
    setup() {
        this.messageArea = document.getElementById('messageArea');
        this.templatesGrid = document.getElementById('templatesGrid');
        this.editorSection = document.getElementById('editorSection');
        
        this.setupEventListeners();
        this.loadTemplates();
        this.setupCanvas();
        
        console.log('✅ Template Editor Manager initialized');
    }
    
    setupEventListeners() {
        // Upload zones
        this.setupUploadZones();
        
        // Template configuration
        document.getElementById('templateName').addEventListener('input', () => this.validateForm());
        
        // Side toggle
        document.querySelectorAll('input[name="cardSide"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.switchSide(e.target.value));
        });
        
        // Canvas controls
        this.setupCanvasControls();
        
        // Element dragging
        this.setupElementDragging();
        
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
        if (!canvasElement) return;
        
        this.canvas = new fabric.Canvas('templateCanvas', {
            width: 1050,
            height: 650,
            backgroundColor: '#ffffff',
            preserveObjectStacking: true
        });
        
        // Canvas events
        this.canvas.on('selection:created', (e) => this.onObjectSelected(e.selected[0]));
        this.canvas.on('selection:updated', (e) => this.onObjectSelected(e.selected[0]));
        this.canvas.on('selection:cleared', () => this.clearProperties());
        this.canvas.on('object:modified', () => this.updatePositionData());
        
        console.log('🎨 Fabric.js canvas initialized');
    }
    
    setupCanvasControls() {
        // Zoom controls
        document.getElementById('zoomIn')?.addEventListener('click', () => this.zoomCanvas(1.1));
        document.getElementById('zoomOut')?.addEventListener('click', () => this.zoomCanvas(0.9));
        document.getElementById('resetZoom')?.addEventListener('click', () => this.resetZoom());
    }
    
    setupElementDragging() {
        const elementItems = document.querySelectorAll('.element-item');
        
        elementItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.type);
                item.classList.add('dragging');
            });
            
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });
            
            item.setAttribute('draggable', 'true');
        });
        
        // Canvas drop zone
        const canvasContainer = document.querySelector('.canvas-container');
        canvasContainer.addEventListener('dragover', (e) => e.preventDefault());
        canvasContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            const elementType = e.dataTransfer.getData('text/plain');
            this.addElementToCanvas(elementType, e);
        });
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
            // Scale image to fit canvas
            const scaleX = this.canvas.width / img.width;
            const scaleY = this.canvas.height / img.height;
            const scale = Math.min(scaleX, scaleY);
            
            img.set({
                scaleX: scale,
                scaleY: scale,
                selectable: false,
                evented: false
            });
            
            // Clear canvas and add background image
            this.canvas.clear();
            this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas));
            
            // Restore positioned elements for this side
            this.loadPositionedElements();
        });
    }
    
    addElementToCanvas(elementType, dropEvent) {
        const canvasRect = this.canvas.getElement().getBoundingClientRect();
        const x = dropEvent.clientX - canvasRect.left;
        const y = dropEvent.clientY - canvasRect.top;
        
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
                element = this.createTextElement('12345', x, y, { fontSize: 14, fontFamily: 'Courier New' });
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
        }
        
        if (element) {
            element.set('elementType', elementType);
            this.canvas.add(element);
            this.canvas.setActiveObject(element);
            this.updatePositionData();
        }
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
    
    onObjectSelected(obj) {
        if (!obj) return;
        
        this.showObjectProperties(obj);
    }
    
    showObjectProperties(obj) {
        const propertiesContent = document.getElementById('propertiesContent');
        
        let propertiesHTML = `
            <div class="property-group">
                <h5>Position & Size</h5>
                <div class="form-group">
                    <label>X Position</label>
                    <input type="number" id="propX" value="${Math.round(obj.left)}" onchange="templateEditorManager.updateObjectProperty('left', this.value)">
                </div>
                <div class="form-group">
                    <label>Y Position</label>
                    <input type="number" id="propY" value="${Math.round(obj.top)}" onchange="templateEditorManager.updateObjectProperty('top', this.value)">
                </div>
                <div class="form-group">
                    <label>Width</label>
                    <input type="number" id="propWidth" value="${Math.round(obj.width * obj.scaleX)}" onchange="templateEditorManager.updateObjectSize('width', this.value)">
                </div>
                <div class="form-group">
                    <label>Height</label>
                    <input type="number" id="propHeight" value="${Math.round(obj.height * obj.scaleY)}" onchange="templateEditorManager.updateObjectSize('height', this.value)">
                </div>
            </div>
        `;
        
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
                this.positionData[this.currentSide][obj.elementType] = {
                    x: Math.round(obj.left),
                    y: Math.round(obj.top),
                    width: Math.round(obj.width * obj.scaleX),
                    height: Math.round(obj.height * obj.scaleY),
                    fontSize: obj.fontSize || 16,
                    fontFamily: obj.fontFamily || 'Arial',
                    color: obj.fill || '#000000',
                    align: obj.textAlign || 'left'
                };
            }
        });
    }
    
    switchSide(side) {
        this.currentSide = side;
        
        // Load appropriate image
        if (side === 'front' && this.frontImage) {
            const reader = new FileReader();
            reader.onload = (e) => this.loadImageToCanvas(e.target.result);
            reader.readAsDataURL(this.frontImage);
        } else if (side === 'back' && this.backImage) {
            const reader = new FileReader();
            reader.onload = (e) => this.loadImageToCanvas(e.target.result);
            reader.readAsDataURL(this.backImage);
        } else {
            this.canvas.clear();
            this.canvas.setBackgroundColor('#ffffff', this.canvas.renderAll.bind(this.canvas));
        }
    }
    
    loadPositionedElements() {
        const positions = this.positionData[this.currentSide];
        
        Object.entries(positions).forEach(([elementType, position]) => {
            let element;
            
            if (['studentName', 'rollId', 'className', 'studentId'].includes(elementType)) {
                element = this.createTextElement(
                    elementType === 'studentName' ? 'John Doe' :
                    elementType === 'rollId' ? '001' :
                    elementType === 'className' ? 'Class 10-A' : '12345',
                    position.x, position.y, position
                );
            } else if (elementType === 'photo') {
                element = this.createPhotoPlaceholder(position.x, position.y);
            } else if (elementType === 'qrCode') {
                element = this.createQRPlaceholder(position.x, position.y);
            } else if (elementType === 'barcode') {
                element = this.createBarcodePlaceholder(position.x, position.y);
            }
            
            if (element) {
                element.set('elementType', elementType);
                this.canvas.add(element);
            }
        });
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
            const formData = new FormData();
            formData.append('templateName', document.getElementById('templateName').value);
            formData.append('positionData', JSON.stringify(this.positionData));
            
            if (this.frontImage) formData.append('frontImage', this.frontImage);
            if (this.backImage) formData.append('backImage', this.backImage);
            
            const response = await fetch('http://localhost:9000/idcards/templates/upload', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showMessage('Template saved successfully!', 'success');
                this.loadTemplates();
                this.cancelEdit();
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

// Initialize
const templateEditorManager = new TemplateEditorManager();
window.templateEditorManager = templateEditorManager;

console.log('🚀 Template Editor page loaded');
