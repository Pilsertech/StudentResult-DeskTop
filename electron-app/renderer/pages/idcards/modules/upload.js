/**
 * Professional Upload Manager - Enhanced File Handling
 * Handles template image uploads with validation, preview, and optimization
 * Supports PDF, PNG, JPG with size validation and preview generation
 */

class UploadManager {
    constructor(core) {
        this.core = core;
        this.frontImage = null;
        this.backImage = null;
        this.maxFileSize = 10 * 1024 * 1024; // 10MB as per master plan
        this.maxDimension = 2000; // 2000px max dimension
        this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        
        this.setupUploadHandlers();
        console.log('📤 Upload Manager initialized with professional features');
    }
    
    // Setup upload event handlers
    setupUploadHandlers() {
        // Setup front image upload
        const frontInput = document.getElementById('frontImageInput');
        if (frontInput) {
            frontInput.addEventListener('change', (e) => this.handleImageUpload(e, 'front'));
        }
        
        // Setup back image upload
        const backInput = document.getElementById('backImageInput');
        if (backInput) {
            backInput.addEventListener('change', (e) => this.handleImageUpload(e, 'back'));
        }
        
        // Setup drag and drop for upload areas
        this.setupDragAndDrop();
        
        console.log('📎 Upload handlers configured');
    }
    
    // Setup drag and drop functionality
    setupDragAndDrop() {
        const uploadAreas = document.querySelectorAll('.upload-thumbnail, .image-upload-compact');
        
        uploadAreas.forEach(area => {
            area.addEventListener('dragover', (e) => {
                e.preventDefault();
                area.classList.add('dragover');
            });
            
            area.addEventListener('dragleave', (e) => {
                e.preventDefault();
                area.classList.remove('dragover');
            });
            
            area.addEventListener('drop', (e) => {
                e.preventDefault();
                area.classList.remove('dragover');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    const side = area.closest('.image-upload-compact')?.querySelector('span')?.textContent?.toLowerCase();
                    if (side) {
                        this.processImageFile(files[0], side);
                    }
                }
            });
        });
        
        console.log('🎯 Drag and drop enabled for upload areas');
    }
    
    // Handle image upload from file input
    async handleImageUpload(event, side) {
        const file = event.target.files[0];
        if (!file) return;
        
        await this.processImageFile(file, side);
        
        // Clear input for re-upload
        event.target.value = '';
    }
    
    // Process and validate uploaded image file
    async processImageFile(file, side) {
        try {
            console.log(`📸 Processing ${side} image:`, file.name);
            
            // Validate file
            const validation = this.validateImageFile(file);
            if (!validation.valid) {
                this.core.showMessage(validation.message, 'error');
                return;
            }
            
            // Create preview and validate dimensions
            const imageData = await this.createImagePreview(file);
            
            // Validate dimensions
            if (Math.max(imageData.width, imageData.height) > this.maxDimension) {
                this.core.showMessage(
                    `Image too large. Maximum dimension is ${this.maxDimension}px, but image is ${Math.max(imageData.width, imageData.height)}px`,
                    'error'
                );
                return;
            }
            
            // Store image data
            if (side === 'front') {
                this.frontImage = imageData;
                this.core.setFrontImage(imageData.url);
                if (this.core.modules.canvas) {
                    this.core.modules.canvas.setFrontImage(imageData.url);
                }
            } else if (side === 'back') {
                this.backImage = imageData;
                this.core.setBackImage(imageData.url);
                if (this.core.modules.canvas) {
                    this.core.modules.canvas.setBackImage(imageData.url);
                }
            }
            
            // Update preview in UI
            this.updateImagePreview(side, imageData);
            
            // Update canvas dimensions if this is first image
            if (!this.core.modules.canvas?.canvasReady || side === 'front') {
                this.updateCanvasDimensions(imageData.width, imageData.height);
            }
            
            // Show editor panel
            this.showEditorPanel();
            
            this.core.showMessage(`${side.charAt(0).toUpperCase() + side.slice(1)} image uploaded successfully`, 'success');
            this.core.markUnsavedChanges();
            
        } catch (error) {
            console.error(`❌ Error processing ${side} image:`, error);
            this.core.showMessage(`Failed to process ${side} image: ` + error.message, 'error');
        }
    }
    
    // Validate uploaded image file
    validateImageFile(file) {
        // Check file type
        if (!this.allowedTypes.includes(file.type)) {
            return {
                valid: false,
                message: 'Invalid file type. Please upload JPG, PNG, or PDF files only.'
            };
        }
        
        // Check file size
        if (file.size > this.maxFileSize) {
            const maxSizeMB = this.maxFileSize / (1024 * 1024);
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
            return {
                valid: false,
                message: `File too large. Maximum size is ${maxSizeMB}MB, but file is ${fileSizeMB}MB.`
            };
        }
        
        // Check file name
        if (file.name.length > 100) {
            return {
                valid: false,
                message: 'Filename too long. Please use a shorter filename.'
            };
        }
        
        return { valid: true };
    }
    
    // Create image preview from file
    async createImagePreview(file) {
        return new Promise((resolve, reject) => {
            if (file.type === 'application/pdf') {
                // Handle PDF files - for now just create a placeholder
                resolve({
                    url: URL.createObjectURL(file),
                    width: 1050,
                    height: 650,
                    type: 'pdf',
                    file: file,
                    name: file.name,
                    size: file.size
                });
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    resolve({
                        url: e.target.result,
                        width: img.width,
                        height: img.height,
                        type: 'image',
                        file: file,
                        name: file.name,
                        size: file.size
                    });
                };
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }
    
    // Update image preview in UI
    updateImagePreview(side, imageData) {
        const thumbnail = document.getElementById(`${side}UploadThumbnail`);
        const preview = document.getElementById(`${side}PreviewCompact`);
        const previewImg = document.getElementById(`${side}PreviewCompactImg`);
        
        if (thumbnail && preview && previewImg) {
            if (imageData.type === 'pdf') {
                // Show PDF icon instead of image
                previewImg.style.display = 'none';
                preview.innerHTML = `
                    <div class="pdf-preview">
                        <i class="fa fa-file-pdf-o"></i>
                        <span>PDF</span>
                    </div>
                    <div class="preview-overlay">
                        <button class="btn-remove" onclick="remove${side.charAt(0).toUpperCase() + side.slice(1)}Image()" title="Remove">
                            <i class="fa fa-times"></i>
                        </button>
                    </div>
                `;
            } else {
                previewImg.src = imageData.url;
                previewImg.style.display = 'block';
            }
            
            thumbnail.style.display = 'none';
            preview.style.display = 'block';
        }
        
        // Update canvas size display
        this.updateCanvasSizeDisplay(imageData.width, imageData.height);
    }
    
    // Update canvas dimensions based on uploaded image
    updateCanvasDimensions(width, height) {
        if (this.core.modules.canvas) {
            this.core.modules.canvas.resizeCanvas(width, height);
            this.core.modules.canvas.templateDimensions = { width, height };
        }
        
        // Update template data
        this.core.updateTemplateData({
            canvas: {
                front: { width, height },
                back: this.backImage ? { width: this.backImage.width, height: this.backImage.height } : null
            }
        });
        
        console.log('📐 Canvas dimensions updated:', { width, height });
    }
    
    // Update canvas size display
    updateCanvasSizeDisplay(width, height) {
        const canvasDimensions = document.getElementById('canvasDimensions');
        const canvasScale = document.getElementById('canvasScale');
        
        if (canvasDimensions) {
            canvasDimensions.textContent = `${width} × ${height}`;
        }
        
        if (canvasScale) {
            // Calculate scale based on standard card size
            const standardWidth = 1050;
            const scale = (width / standardWidth).toFixed(2);
            canvasScale.textContent = `Scale: ${scale}:1`;
        }
    }
    
    // Show editor panel after image upload
    showEditorPanel() {
        const editorPanel = document.getElementById('editorPanel');
        if (editorPanel) {
            editorPanel.style.display = 'block';
        }
    }
    
    // Remove front image
    removeFrontImage() {
        this.frontImage = null;
        this.core.setFrontImage(null);
        
        if (this.core.modules.canvas) {
            this.core.modules.canvas.setFrontImage(null);
        }
        
        // Update UI
        const thumbnail = document.getElementById('frontUploadThumbnail');
        const preview = document.getElementById('frontPreviewCompact');
        
        if (thumbnail && preview) {
            thumbnail.style.display = 'block';
            preview.style.display = 'none';
        }
        
        // Hide editor panel if no images
        if (!this.frontImage && !this.backImage) {
            const editorPanel = document.getElementById('editorPanel');
            if (editorPanel) {
                editorPanel.style.display = 'none';
            }
        }
        
        this.core.markUnsavedChanges();
        console.log('🗑️ Front image removed');
    }
    
    // Remove back image
    removeBackImage() {
        this.backImage = null;
        this.core.setBackImage(null);
        
        if (this.core.modules.canvas) {
            this.core.modules.canvas.setBackImage(null);
        }
        
        // Update UI
        const thumbnail = document.getElementById('backUploadThumbnail');
        const preview = document.getElementById('backPreviewCompact');
        
        if (thumbnail && preview) {
            thumbnail.style.display = 'block';
            preview.style.display = 'none';
        }
        
        this.core.markUnsavedChanges();
        console.log('🗑️ Back image removed');
    }
    
    // Clear all images
    clearImages() {
        this.removeFrontImage();
        this.removeBackImage();
        console.log('🧹 All images cleared');
    }
    
    // Update image previews from template data
    updateImagePreviews(template) {
        if (template.FrontImagePath) {
            const frontImageUrl = `http://localhost:9000/idcards/templates/images/${template.FrontImagePath.split('/').pop()}`;
            this.frontImage = {
                url: frontImageUrl,
                width: template.CanvasWidth || 1050,
                height: template.CanvasHeight || 650,
                type: 'image'
            };
            this.updateImagePreview('front', this.frontImage);
        }
        
        if (template.BackImagePath) {
            const backImageUrl = `http://localhost:9000/idcards/templates/images/${template.BackImagePath.split('/').pop()}`;
            this.backImage = {
                url: backImageUrl,
                width: template.CanvasWidth || 1050,
                height: template.CanvasHeight || 650,
                type: 'image'
            };
            this.updateImagePreview('back', this.backImage);
        }
    }
    
    // Upload template with images to server
    async uploadTemplateToServer(templateData) {
        try {
            console.log('🚀 Uploading template to server...');
            
            const formData = new FormData();
            
            // Add template metadata
            formData.append('templateName', templateData.templateName);
            formData.append('assignedClasses', JSON.stringify(templateData.assignedClasses || []));
            
            // Add images if available
            if (this.frontImage && this.frontImage.file) {
                formData.append('frontImage', this.frontImage.file);
            }
            
            if (this.backImage && this.backImage.file) {
                formData.append('backImage', this.backImage.file);
            }
            
            // Add position data
            if (templateData.elementData) {
                formData.append('positionData', JSON.stringify(templateData.elementData));
            }
            
            const response = await fetch(this.core.getEndpoint('upload'), {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Template uploaded successfully:', result.data);
                return result.data;
            } else {
                throw new Error(result.message || 'Upload failed');
            }
            
        } catch (error) {
            console.error('❌ Template upload failed:', error);
            throw error;
        }
    }
    
    // Get current images
    getCurrentImages() {
        return {
            front: this.frontImage,
            back: this.backImage
        };
    }
    
    // Check if any images are uploaded
    hasImages() {
        return !!(this.frontImage || this.backImage);
    }
    
    // Get upload progress (for future enhancement)
    getUploadProgress() {
        return {
            front: this.frontImage ? 100 : 0,
            back: this.backImage ? 100 : 0
        };
    }
}

// Global functions for onclick handlers
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

// Register module with core when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.templateEditorCore) {
        const uploadManager = new UploadManager(window.templateEditorCore);
        window.templateEditorCore.registerModule('upload', uploadManager);
    }
});

console.log('📤 Professional Upload Manager module loaded');
