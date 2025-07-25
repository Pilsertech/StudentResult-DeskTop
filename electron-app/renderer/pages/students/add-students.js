// Modern Add Student Page with Photo Upload

class AddStudentManager {
    constructor() {
        this.form = null;
        this.photoInput = null;
        this.photoPreview = null;
        this.currentPhoto = null;
        this.isLoading = false;
        
        this.init();
    }
    
    init() {
        document.addEventListener('DOMContentLoaded', () => this.setup());
    }
    
    setup() {
        // Get DOM elements
        this.form = document.getElementById('addStudentForm');
        this.photoInput = document.getElementById('photoInput');
        this.photoPreview = document.getElementById('photoPreview');
        this.messageArea = document.getElementById('messageArea');
        this.classSelect = document.getElementById('classSelect');
        this.submitBtn = document.getElementById('submitBtn');
        
        if (!this.form) {
            console.error('Form not found');
            return;
        }
        
        this.setupEventListeners();
        this.loadClasses();
        this.setupFormValidation();
        
        console.log('✅ Add Student Manager initialized');
    }
    
    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Photo input change
        this.photoInput.addEventListener('change', (e) => this.handlePhotoSelect(e));
        
        // Photo preview click
        this.photoPreview.addEventListener('click', () => this.selectPhoto());
        
        // Drag and drop for photo
        this.setupDragAndDrop();
        
        // Form field validation
        this.form.querySelectorAll('input, select').forEach(field => {
            field.addEventListener('blur', (e) => this.validateField(e.target));
            field.addEventListener('input', (e) => this.updateProgress());
        });
        
        console.log('🎯 Event listeners setup');
    }
    
    setupDragAndDrop() {
        const dropArea = this.photoPreview;
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, this.preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => {
                dropArea.classList.add('drag-over');
            }, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => {
                dropArea.classList.remove('drag-over');
            }, false);
        });
        
        dropArea.addEventListener('drop', (e) => this.handlePhotoDrop(e), false);
    }
    
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isLoading) return;
        
        this.clearMessages();
        
        // Validate form
        if (!this.validateForm()) {
            this.showMessage('Please fix the validation errors', 'error');
            return;
        }
        
        this.setLoading(true);
        
        try {
            // Create FormData for multipart submission
            const formData = new FormData();
            
            // Add form fields
            const fields = ['fullanme', 'rollid', 'emailid', 'gender', 'classid', 'dob'];
            const formDataObj = new FormData(this.form);
            
            fields.forEach(field => {
                const value = formDataObj.get(field);
                if (value) formData.append(field, value);
            });
            
            // Create student first
            const studentData = {};
            fields.forEach(field => {
                studentData[field] = formDataObj.get(field);
            });
            
            console.log('📤 Creating student...', studentData);
            
            const response = await fetch('http://localhost:9000/students/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                const studentId = result.data.studentId;
                
                // Upload photo if exists
                if (this.currentPhoto) {
                    console.log('📸 Uploading photo for student:', studentId);
                    await this.uploadPhoto(studentId);
                }
                
                this.showMessage(result.message + (this.currentPhoto ? ' with photo' : ''), 'success');
                this.resetForm();
                this.updateProgress();
                
                // Optional: Redirect after success
                setTimeout(() => {
                    if (confirm('Student added successfully! Would you like to view the student list?')) {
                        window.location.href = 'manage-students.html';
                    }
                }, 1500);
                
            } else {
                this.showMessage(result.message || 'Failed to add student', 'error');
            }
            
        } catch (error) {
            console.error('❌ Error creating student:', error);
            this.showMessage('Connection error. Please try again.', 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
    async uploadPhoto(studentId) {
        try {
            const formData = new FormData();
            formData.append('photo', this.currentPhoto);
            
            const response = await fetch(`http://localhost:9000/students/${studentId}/photo`, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (!result.success) {
                console.warn('⚠️ Photo upload failed:', result.message);
            } else {
                console.log('✅ Photo uploaded successfully');
            }
            
        } catch (error) {
            console.error('❌ Photo upload error:', error);
        }
    }
    
    async loadClasses() {
        try {
            console.log('📚 Loading classes...');
            
            const response = await fetch('http://localhost:9000/classes');
            const result = await response.json();
            
            this.classSelect.innerHTML = '<option value="">Select Class</option>';
            
            if (result.success && result.classes) {
                result.classes.forEach(cls => {
                    const option = document.createElement('option');
                    option.value = cls.id;
                    option.textContent = `${cls.ClassName} Section-${cls.Section}`;
                    this.classSelect.appendChild(option);
                });
                console.log(`✅ Loaded ${result.classes.length} classes`);
            } else {
                this.showMessage('Could not load classes', 'error');
            }
            
        } catch (error) {
            console.error('❌ Error loading classes:', error);
            this.classSelect.innerHTML = '<option value="">Error loading classes</option>';
            this.showMessage('Could not connect to server', 'error');
        }
    }
    
    selectPhoto() {
        this.photoInput.click();
    }
    
    handlePhotoSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processPhoto(file);
        }
    }
    
    handlePhotoDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            this.processPhoto(files[0]);
        }
    }
    
    processPhoto(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showMessage('Please select an image file', 'error');
            return;
        }
        
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            this.showMessage('Image file too large. Maximum size is 5MB', 'error');
            return;
        }
        
        this.currentPhoto = file;
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            this.photoPreview.innerHTML = `
                <img src="${e.target.result}" alt="Student Photo">
            `;
            this.photoPreview.classList.add('has-image');
            
            // Show remove button
            const removeBtn = document.getElementById('removePhotoBtn');
            if (removeBtn) removeBtn.style.display = 'inline-flex';
        };
        reader.readAsDataURL(file);
        
        console.log('📸 Photo processed:', file.name);
        this.updateProgress();
    }
    
    removePhoto() {
        this.currentPhoto = null;
        this.photoInput.value = '';
        this.photoPreview.classList.remove('has-image');
        this.photoPreview.innerHTML = `
            <div class="photo-placeholder">
                <i class="fa fa-user-circle"></i>
                <p>Click to upload photo</p>
                <small>Drag & drop or click to select</small>
            </div>
        `;
        
        // Hide remove button
        const removeBtn = document.getElementById('removePhotoBtn');
        if (removeBtn) removeBtn.style.display = 'none';
        
        this.updateProgress();
    }
    
    setupFormValidation() {
        // Real-time validation rules
        const validators = {
            fullanme: (value) => {
                if (!value.trim()) return 'Full name is required';
                if (value.trim().length < 2) return 'Name must be at least 2 characters';
                return null;
            },
            rollid: (value) => {
                if (!value.trim()) return 'Roll ID is required';
                if (value.length > 10) return 'Roll ID must be 10 characters or less';
                return null;
            },
            emailid: (value) => {
                if (!value.trim()) return 'Email is required';
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) return 'Please enter a valid email';
                return null;
            },
            dob: (value) => {
                if (!value) return 'Date of birth is required';
                const date = new Date(value);
                const today = new Date();
                if (date >= today) return 'Date must be in the past';
                return null;
            },
            classid: (value) => {
                if (!value) return 'Please select a class';
                return null;
            }
        };
        
        this.validators = validators;
    }
    
    validateField(field) {
        const validator = this.validators[field.name];
        if (!validator) return true;
        
        const error = validator(field.value);
        
        if (error) {
            field.classList.add('is-invalid');
            field.classList.remove('is-valid');
            this.showFieldError(field, error);
            return false;
        } else {
            field.classList.add('is-valid');
            field.classList.remove('is-invalid');
            this.hideFieldError(field);
            return true;
        }
    }
    
    validateForm() {
        let isValid = true;
        
        this.form.querySelectorAll('input[required], select[required]').forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        // Check if gender is selected
        const genderSelected = this.form.querySelector('input[name="gender"]:checked');
        if (!genderSelected) {
            this.showMessage('Please select a gender', 'error');
            isValid = false;
        }
        
        return isValid;
    }
    
    showFieldError(field, message) {
        let errorDiv = field.parentNode.querySelector('.field-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            field.parentNode.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
        errorDiv.style.color = '#e74c3c';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '5px';
    }
    
    hideFieldError(field) {
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
    
    updateProgress() {
        const fields = this.form.querySelectorAll('input[required], select[required]');
        const filledFields = Array.from(fields).filter(field => {
            if (field.type === 'radio') {
                return this.form.querySelector(`input[name="${field.name}"]:checked`);
            }
            return field.value.trim() !== '';
        });
        
        // Add photo to progress if uploaded
        const totalFields = fields.length + (this.currentPhoto ? 1 : 0);
        const completedFields = filledFields.length + (this.currentPhoto ? 1 : 0);
        
        const progress = (completedFields / totalFields) * 100;
        const progressBar = document.getElementById('formProgress');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
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
        
        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => this.clearMessages(), 5000);
        }
    }
    
    clearMessages() {
        this.messageArea.innerHTML = '';
    }
    
    setLoading(loading) {
        this.isLoading = loading;
        
        if (loading) {
            this.submitBtn.disabled = true;
            this.submitBtn.classList.add('loading');
            this.submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Adding Student...';
            this.form.classList.add('loading');
        } else {
            this.submitBtn.disabled = false;
            this.submitBtn.classList.remove('loading');
            this.submitBtn.innerHTML = '<i class="fa fa-save"></i> Add Student';
            this.form.classList.remove('loading');
        }
    }
    
    resetForm() {
        this.form.reset();
        this.removePhoto();
        this.clearMessages();
        
        // Reset validation classes
        this.form.querySelectorAll('.is-valid, .is-invalid').forEach(field => {
            field.classList.remove('is-valid', 'is-invalid');
        });
        
        // Remove field errors
        this.form.querySelectorAll('.field-error').forEach(error => {
            error.remove();
        });
        
        // Reset gender to default
        const defaultGender = this.form.querySelector('input[name="gender"][value="Male"]');
        if (defaultGender) defaultGender.checked = true;
        
        console.log('🔄 Form reset');
    }
}

// Global functions for onclick handlers
function selectPhoto() {
    if (window.addStudentManager) {
        window.addStudentManager.selectPhoto();
    }
}

function removePhoto() {
    if (window.addStudentManager) {
        window.addStudentManager.removePhoto();
    }
}

function resetForm() {
    if (window.addStudentManager) {
        if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
            window.addStudentManager.resetForm();
        }
    }
}

// Initialize
const addStudentManager = new AddStudentManager();
window.addStudentManager = addStudentManager;

console.log('🚀 Add Student page loaded');