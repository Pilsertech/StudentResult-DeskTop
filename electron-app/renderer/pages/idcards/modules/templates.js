/**
 * Professional Templates Manager - Database Integration
 * Handles template CRUD operations, class assignments, and version control
 * Following master plan for enhanced template management
 */

class TemplatesManager {
    constructor(core) {
        this.core = core;
        this.templates = [];
        this.currentTemplate = null;
        this.classes = [];
        this.isLoading = false;
        
        console.log('📋 Templates Manager initialized');
    }
    
    // Load all templates from database
    async loadTemplates() {
        try {
            this.setLoading(true);
            console.log('📥 Loading templates from database...');
            
            const response = await fetch(this.core.getEndpoint('templates'));
            const result = await response.json();
            
            if (result.success) {
                this.templates = result.templates || [];
                this.populateTemplatesGrid();
                console.log(`✅ Loaded ${this.templates.length} templates`);
            } else {
                throw new Error(result.message || 'Failed to load templates');
            }
            
        } catch (error) {
            console.error('❌ Error loading templates:', error);
            this.core.showMessage('Failed to load templates: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
    // Load active classes for assignment
    async loadClasses() {
        try {
            const response = await fetch(this.core.getEndpoint('classes'));
            const result = await response.json();
            
            if (result.success) {
                this.classes = result.classes || [];
                this.populateClassSelector();
                console.log(`✅ Loaded ${this.classes.length} classes`);
            }
            
        } catch (error) {
            console.error('❌ Error loading classes:', error);
        }
    }
    
    // Populate templates grid in UI
    populateTemplatesGrid() {
        const templatesGrid = document.getElementById('templatesGrid');
        if (!templatesGrid) return;
        
        if (this.templates.length === 0) {
            templatesGrid.innerHTML = `
                <div class="empty-templates">
                    <div class="empty-icon">
                        <i class="fa fa-paint-brush"></i>
                    </div>
                    <h4>No Templates Found</h4>
                    <p>Create your first ID card template to get started</p>
                    <button class="btn btn-primary" onclick="createNewTemplate()">
                        <i class="fa fa-plus"></i> Create Template
                    </button>
                </div>
            `;
            return;
        }
        
        const templatesHTML = this.templates.map(template => this.createTemplateCard(template)).join('');
        templatesGrid.innerHTML = templatesHTML;
    }
    
    // Create individual template card HTML
    createTemplateCard(template) {
        const assignedClassesText = template.AssignedClasses && template.AssignedClasses.length > 0 
            ? template.AssignedClasses.map(classId => {
                const cls = this.classes.find(c => c.id == classId);
                return cls ? `${cls.ClassName} ${cls.Section}` : `Class ${classId}`;
            }).join(', ')
            : 'Not assigned';
            
        const previewImage = template.FrontImagePath 
            ? `http://localhost:9000/idcards/templates/images/${template.FrontImagePath.split('/').pop()}`
            : null;
            
        return `
            <div class="template-card" data-template-id="${template.id}">
                <div class="template-header">
                    <h4>${template.TemplateName}</h4>
                    <div class="template-actions">
                        <button class="action-btn edit" onclick="editTemplate(${template.id})" title="Edit Template">
                            <i class="fa fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteTemplate(${template.id})" title="Delete Template">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="template-preview">
                    ${previewImage ? 
                        `<img src="${previewImage}" alt="${template.TemplateName}" onerror="this.style.display='none'">` :
                        `<div class="preview-placeholder">
                            <i class="fa fa-image"></i>
                            <p>No Preview</p>
                        </div>`
                    }
                </div>
                
                <div class="template-info">
                    <div class="template-details">
                        <small><strong>Classes:</strong> ${assignedClassesText}</small>
                        <small><strong>Version:</strong> ${template.VersionNumber || 1}</small>
                        <small><strong>Cards Generated:</strong> ${template.CardsGenerated || 0}</small>
                        <small><strong>Size:</strong> ${template.CanvasWidth || 1050} × ${template.CanvasHeight || 650}</small>
                    </div>
                    <div class="template-status">
                        <span class="template-status ${template.IsActive ? 'active' : 'inactive'}">
                            ${template.IsActive ? 'Active' : 'Inactive'}
                        </span>
                        ${template.LockStatus === 'Locked' ? '<i class="fa fa-lock" title="Template Locked"></i>' : ''}
                    </div>
                </div>
            </div>
        `;
    }
    
    // Populate class selector dropdown
    populateClassSelector() {
        const classSelector = document.getElementById('assignedClasses');
        if (!classSelector) return;
        
        classSelector.innerHTML = '';
        
        this.classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = `${cls.ClassName} Section-${cls.Section}`;
            classSelector.appendChild(option);
        });
    }
    
    // Create new template
    async createNewTemplate() {
        console.log('🆕 Creating new template...');
        
        // Load classes if not loaded
        if (this.classes.length === 0) {
            await this.loadClasses();
        }
        
        // Clear current template
        this.currentTemplate = null;
        
        // Show editor section
        this.showEditorView();
        
        // Clear all form fields
        this.clearTemplateForm();
        
        this.core.showMessage('Ready to create new template', 'info');
    }
    
    // Edit existing template
    async editTemplate(templateId) {
        try {
            console.log('✏️ Editing template:', templateId);
            this.setLoading(true);
            
            // Load template details
            const response = await fetch(`${this.core.getEndpoint('templates')}/${templateId}`);
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Template not found');
            }
            
            this.currentTemplate = result.template;
            
            // Load classes if not loaded
            if (this.classes.length === 0) {
                await this.loadClasses();
            }
            
            // Populate form with template data
            this.populateTemplateForm(this.currentTemplate);
            
            // Show editor
            this.showEditorView();
            
            // Load template into canvas
            if (this.core.modules.canvas) {
                await this.loadTemplateIntoCanvas(this.currentTemplate);
            }
            
            this.core.showMessage(`Editing template: ${this.currentTemplate.TemplateName}`, 'info');
            
        } catch (error) {
            console.error('❌ Error editing template:', error);
            this.core.showMessage('Failed to load template: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
    // Delete template
    async deleteTemplate(templateId) {
        const template = this.templates.find(t => t.id == templateId);
        if (!template) return;
        
        if (!confirm(`Are you sure you want to delete template "${template.TemplateName}"?`)) {
            return;
        }
        
        try {
            console.log('🗑️ Deleting template:', templateId);
            
            const response = await fetch(`${this.core.getEndpoint('templates')}/${templateId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.core.showMessage('Template deleted successfully', 'success');
                this.loadTemplates(); // Refresh list
            } else {
                throw new Error(result.message || 'Failed to delete template');
            }
            
        } catch (error) {
            console.error('❌ Error deleting template:', error);
            this.core.showMessage('Failed to delete template: ' + error.message, 'error');
        }
    }
    
    // Save current template
    async saveCurrentTemplate() {
        try {
            console.log('💾 Saving template...');
            this.setLoading(true);
            
            // Validate form
            if (!this.validateTemplateForm()) {
                return;
            }
            
            // Collect form data
            const templateData = this.collectTemplateData();
            
            // Add canvas data if available
            if (this.core.modules.canvas) {
                templateData.elementData = this.core.modules.canvas.getCanvasData();
            }
            
            // Determine save endpoint
            const endpoint = this.currentTemplate 
                ? `${this.core.getEndpoint('templates')}/${this.currentTemplate.id}`
                : `${this.core.getEndpoint('templates')}/save`;
                
            const method = this.currentTemplate ? 'PUT' : 'POST';
            
            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(templateData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.core.markSaved();
                this.core.showMessage(
                    this.currentTemplate ? 'Template updated successfully' : 'Template created successfully',
                    'success'
                );
                
                // Update current template reference
                if (!this.currentTemplate) {
                    this.currentTemplate = { id: result.data.templateId };
                }
                
                // Refresh templates list
                this.loadTemplates();
                
            } else {
                throw new Error(result.message || 'Failed to save template');
            }
            
        } catch (error) {
            console.error('❌ Error saving template:', error);
            this.core.showMessage('Failed to save template: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
    // Validate template form
    validateTemplateForm() {
        const templateName = document.getElementById('templateName')?.value?.trim();
        
        if (!templateName) {
            this.core.showMessage('Template name is required', 'error');
            document.getElementById('templateName')?.focus();
            return false;
        }
        
        if (templateName.length < 3) {
            this.core.showMessage('Template name must be at least 3 characters long', 'error');
            document.getElementById('templateName')?.focus();
            return false;
        }
        
        // Check for duplicate names (excluding current template)
        const existingTemplate = this.templates.find(t => 
            t.TemplateName.toLowerCase() === templateName.toLowerCase() && 
            t.id != this.currentTemplate?.id
        );
        
        if (existingTemplate) {
            this.core.showMessage('A template with this name already exists', 'error');
            document.getElementById('templateName')?.focus();
            return false;
        }
        
        return true;
    }
    
    // Collect template data from form
    collectTemplateData() {
        const templateName = document.getElementById('templateName')?.value?.trim();
        const assignedClasses = Array.from(document.getElementById('assignedClasses')?.selectedOptions || [])
            .map(option => parseInt(option.value));
        
        const data = {
            templateName,
            assignedClasses,
            canvasWidth: this.core.modules.canvas?.templateDimensions?.width || 1050,
            canvasHeight: this.core.modules.canvas?.templateDimensions?.height || 650,
            gridSettings: this.core.getTemplateData().gridSettings
        };
        
        // Add ID for updates
        if (this.currentTemplate) {
            data.id = this.currentTemplate.id;
        }
        
        return data;
    }
    
    // Clear template form
    clearTemplateForm() {
        const templateName = document.getElementById('templateName');
        const assignedClasses = document.getElementById('assignedClasses');
        
        if (templateName) templateName.value = '';
        if (assignedClasses) {
            Array.from(assignedClasses.options).forEach(option => {
                option.selected = false;
            });
        }
        
        // Clear images
        if (this.core.modules.upload) {
            this.core.modules.upload.clearImages();
        }
        
        // Clear canvas
        if (this.core.modules.canvas) {
            this.core.modules.canvas.clearCanvas();
        }
    }
    
    // Populate form with template data
    populateTemplateForm(template) {
        const templateName = document.getElementById('templateName');
        const assignedClasses = document.getElementById('assignedClasses');
        
        if (templateName) {
            templateName.value = template.TemplateName || '';
        }
        
        if (assignedClasses && template.AssignedClasses) {
            Array.from(assignedClasses.options).forEach(option => {
                option.selected = template.AssignedClasses.includes(parseInt(option.value));
            });
        }
        
        // Set canvas dimensions
        if (template.CanvasWidth && template.CanvasHeight && this.core.modules.canvas) {
            this.core.modules.canvas.resizeCanvas(template.CanvasWidth, template.CanvasHeight);
        }
    }
    
    // Load template into canvas
    async loadTemplateIntoCanvas(template) {
        if (!this.core.modules.canvas) return;
        
        try {
            // Load template images
            if (template.FrontImagePath) {
                const frontImageUrl = `http://localhost:9000/idcards/templates/images/${template.FrontImagePath.split('/').pop()}`;
                this.core.modules.canvas.setFrontImage(frontImageUrl);
                this.core.setFrontImage(frontImageUrl);
            }
            
            if (template.BackImagePath) {
                const backImageUrl = `http://localhost:9000/idcards/templates/images/${template.BackImagePath.split('/').pop()}`;
                this.core.modules.canvas.setBackImage(backImageUrl);
                this.core.setBackImage(backImageUrl);
            }
            
            // Load element data
            if (template.ElementData && this.core.modules.elements) {
                this.core.updateTemplateData({ elements: template.ElementData.elements || [] });
                this.core.modules.canvas.loadCanvasData(template.ElementData);
            }
            
            // Update image previews
            if (this.core.modules.upload) {
                this.core.modules.upload.updateImagePreviews(template);
            }
            
        } catch (error) {
            console.error('❌ Error loading template into canvas:', error);
        }
    }
    
    // Show editor view
    showEditorView() {
        const templatesSection = document.getElementById('templatesSection');
        const editorSection = document.getElementById('editorSection');
        
        if (templatesSection) templatesSection.style.display = 'none';
        if (editorSection) editorSection.style.display = 'block';
        
        // Show editor panel if canvas manager is ready
        if (this.core.modules.canvas) {
            const editorPanel = document.getElementById('editorPanel');
            if (editorPanel) editorPanel.style.display = 'block';
        }
    }
    
    // Show templates view
    showTemplatesView() {
        const templatesSection = document.getElementById('templatesSection');
        const editorSection = document.getElementById('editorSection');
        
        if (templatesSection) templatesSection.style.display = 'block';
        if (editorSection) editorSection.style.display = 'none';
        
        // Clear current template
        this.currentTemplate = null;
        this.core.markSaved(); // Clear unsaved changes
    }
    
    // Template locking/unlocking
    async toggleTemplateLock(templateId, lock = true) {
        try {
            const response = await fetch(`${this.core.getEndpoint('templates')}/${templateId}/lock`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ locked: lock })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.core.showMessage(
                    lock ? 'Template locked successfully' : 'Template unlocked successfully',
                    'success'
                );
                this.loadTemplates(); // Refresh list
            } else {
                throw new Error(result.message);
            }
            
        } catch (error) {
            console.error('❌ Error toggling template lock:', error);
            this.core.showMessage('Failed to update template lock: ' + error.message, 'error');
        }
    }
    
    // Get template by ID
    getTemplate(templateId) {
        return this.templates.find(t => t.id == templateId);
    }
    
    // Get current template
    getCurrentTemplate() {
        return this.currentTemplate;
    }
    
    // Set loading state
    setLoading(loading) {
        this.isLoading = loading;
        
        // Update UI loading states
        const loadingElements = document.querySelectorAll('.loading-indicator');
        loadingElements.forEach(el => {
            el.style.display = loading ? 'block' : 'none';
        });
        
        // Disable/enable action buttons
        const actionButtons = document.querySelectorAll('.template-actions button');
        actionButtons.forEach(btn => {
            btn.disabled = loading;
        });
    }
}

// Global functions for onclick handlers
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

window.createNewTemplate = function() {
    if (window.templateEditorCore?.modules?.templates) {
        window.templateEditorCore.modules.templates.createNewTemplate();
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

// Register module with core when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.templateEditorCore) {
        const templatesManager = new TemplatesManager(window.templateEditorCore);
        window.templateEditorCore.registerModule('templates', templatesManager);
        
        // Load templates and classes when ready
        setTimeout(() => {
            templatesManager.loadTemplates();
            templatesManager.loadClasses();
        }, 200);
    }
});

console.log('📋 Professional Templates Manager module loaded');
