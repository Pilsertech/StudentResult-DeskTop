// Modern Edit Student Page with Photo Upload

class EditStudentManager {
    constructor() {
        this.form = null;
        this.photoInput = null;
        this.photoPreview = null;
        this.currentPhoto = null;
        this.originalData = null;
        this.studentId = null;
        this.isLoading = false;
        
        this.init();
    }
    
    init() {
        document.addEventListener('DOMContentLoaded', () => this.setup());
    }
    
    setup() {
        // Get student ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        this.studentId = urlParams.get('stid');
        
        if (!this.studentId) {
            this.showError('No student ID provided in URL');
            return;
        }
        
        // Get DOM elements
        this.form = document.getElementById('editStudentForm');
        this.photoInput = document.getElementById('photoInput');
        this.photoPreview = document.getElementById('photoPreview');
        this.messageArea = document.getElementById('messageArea');
        this.submitBtn = document.getElementById('submitBtn');
        
        this.setupEventListeners();
        this.loadStudentData();
        this.setupFormValidation();
        
        console.log('✅ Edit Student Manager initialized for ID:', this.studentId);
    }
    
    setupEventListeners() {
        if (!this.form) return;
        
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
    
    async loadStudentData() {
        try {
            console.log('📥 Loading student data for ID:', this.studentId);
            
            this.showLoading();
            
            const response = await fetch(`http://localhost:9000/students/${this.studentId}`);
            const result = await response.json();
            
            if (result.success && result.student) {
                this.originalData = result.student;
                this.populateForm(result.student);
                await this.loadStudentPhoto();
                this.showForm();
                console.log('✅ Student data loaded successfully');
            } else {
                throw new Error(result.message || 'Student not found');
            }
            
        } catch (error) {
            console.error('❌ Error loading student:', error);
            this.showError('Failed to load student data: ' + error.message);
        }
    }
    
    async loadStudentPhoto() {
        try {
            const response = await fetch(`http://localhost:9000/students/${this.studentId}/photo`);
            const result = await response.json();
            
            if (result.success && result.data.hasPhoto) {
                const photoUrl = `http://localhost:9000/students/photos/${result.data.photoPath.split('/').pop()}`;
                this.displayExistingPhoto(photoUrl);
                console.log('📸 Student photo loaded');
            }
            
        } catch (error) {
            console.warn('⚠️ No existing photo found:', error.message);
        }
    }
    
    displayExistingPhoto(photoUrl) {
        this.photoPreview.innerHTML = `<img src="${photoUrl}" alt="Student Photo">`;
        this.photoPreview.classList.add('has-image');
        
        // Show update and remove buttons
        const updateBtn = document.getElementById('updatePhotoBtn');
        const removeBtn = document.getElementById('removePhotoBtn');
        if (updateBtn) updateBtn.style.display = 'inline-flex';
        if (removeBtn) removeBtn.style.display = 'inline-flex';
    }
    
    populateForm(student) {
        // Hidden fields
        document.getElementById('studentId').value = student.StudentId;
        document.getElementById('originalClassId').value = student.ClassId;
        
        // Display meta information
        document.getElementById('displayStudentId').textContent = student.StudentId;
        document.getElementById('displayRegDate').textContent = new Date(student.RegDate).toLocaleDateString();
        
        // Basic information
        document.getElementById('fullname').value = student.StudentName;
        document.getElementById('rollid').value = student.RollId;
        document.getElementById('emailid').value = student.StudentEmail;
        document.getElementById('dob').value = student.DOB;
        
        // Class display (readonly)
        document.getElementById('classDisplay').value = `${student.ClassName} Section-${student.Section}`;
        
        // Gender radio buttons
        const genderRadio = document.querySelector(`input[name="gender"][value="${student.Gender}"]`);
        if (genderRadio) genderRadio.checked = true;
        
        // Status radio buttons
        const statusRadio = document.querySelector(`input[name="status"][value="${student.Status}"]`);
        if (statusRadio) statusRadio.checked = true;
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
            // Prepare student data
            const formData = new FormData(this.form);
            const studentData = {
                fullanme: formData.get('fullanme').trim(),
                rollid: formData.get('rollid').trim(),
                emailid: formData.get('emailid').trim(),
                gender: formData.get('gender'),
                classid: formData.get('originalClassId'), // Keep original class
                dob: formData.get('dob'),
                status: parseInt(formData.get('status'))
            };
            
            console.log('📤 Updating student...', studentData);
            
            // Update student data
            const response = await fetch(`http://localhost:9000/students/${this.studentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Upload new photo if exists
                if (this.currentPhoto) {
                    console.log('📸 Uploading new photo...');
                    await this.uploadPhoto();
                }
                
                this.showMessage('Student updated successfully!', 'success');
                
                // Optional: Redirect after success
                setTimeout(() => {
                    if (confirm('Student updated successfully! Would you like to return to the student list?')) {
                        window.location.href = 'manage-students.html';
                    }
                }, 1500);
                
            } else {
                this.showMessage(result.message || 'Failed to update student', 'error');
            }
            
        } catch (error) {
            console.error('❌ Error updating student:', error);
            this.showMessage('Connection error. Please try again.', 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
    async uploadPhoto() {
        try {
            const formData = new FormData();
            formData.append('photo', this.currentPhoto);
            
            const response = await fetch(`http://localhost:9000/students/${this.studentId}/photo`, {
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
            this.photoPreview.innerHTML = `<img src="${e.target.result}" alt="Student Photo">`;
            this.photoPreview.classList.add('has-image');
            
            // Show remove button, hide update button
            const updateBtn = document.getElementById('updatePhotoBtn');
            const removeBtn = document.getElementById('removePhotoBtn');
            if (updateBtn) updateBtn.style.display = 'none';
            if (removeBtn) removeBtn.style.display = 'inline-flex';
        };
        reader.readAsDataURL(file);
        
        console.log('📸 New photo processed:', file.name);
    }
    
    async removePhoto() {
        const confirmed = confirm('Are you sure you want to remove the student photo?');
        if (!confirmed) return;
        
        try {
            this.setLoading(true);
            
            const response = await fetch(`http://localhost:9000/students/${this.studentId}/photo`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Reset photo display
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
                
                // Hide action buttons
                const updateBtn = document.getElementById('updatePhotoBtn');
                const removeBtn = document.getElementById('removePhotoBtn');
                if (updateBtn) updateBtn.style.display = 'none';
                if (removeBtn) removeBtn.style.display = 'none';
                
                this.showMessage('Photo removed successfully', 'success');
                console.log('🗑️ Photo removed successfully');
            } else {
                this.showMessage('Failed to remove photo: ' + result.message, 'error');
            }
            
        } catch (error) {
            console.error('❌ Error removing photo:', error);
            this.showMessage('Error removing photo', 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
    updatePhoto() {
        this.selectPhoto();
    }
    
    resetChanges() {
        if (!this.originalData) return;
        
        const confirmed = confirm('Are you sure you want to reset all changes? This will restore the original data.');
        if (!confirmed) return;
        
        this.populateForm(this.originalData);
        this.loadStudentPhoto();
        this.clearMessages();
        this.showMessage('Changes reset to original values', 'info');
        
        console.log('🔄 Form reset to original data');
    }
    
    setupFormValidation() {
        // Same validation rules as add-student
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
        
        this.form.querySelectorAll('input[required]').forEach(field => {
            if (field.type !== 'radio' && !this.validateField(field)) {
                isValid = false;
            }
        });
        
        // Check if gender is selected
        const genderSelected = this.form.querySelector('input[name="gender"]:checked');
        if (!genderSelected) {
            this.showMessage('Please select a gender', 'error');
            isValid = false;
        }
        
        // Check if status is selected
        const statusSelected = this.form.querySelector('input[name="status"]:checked');
        if (!statusSelected) {
            this.showMessage('Please select a status', 'error');
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
    
    showLoading() {
        document.getElementById('loadingSection').style.display = 'block';
        document.getElementById('errorSection').style.display = 'none';
        document.getElementById('formContent').style.display = 'none';
    }
    
    showError(message) {
        document.getElementById('loadingSection').style.display = 'none';
        document.getElementById('errorSection').style.display = 'block';
        document.getElementById('formContent').style.display = 'none';
        document.getElementById('errorMessage').textContent = message;
    }
    
    showForm() {
        document.getElementById('loadingSection').style.display = 'none';
        document.getElementById('errorSection').style.display = 'none';
        document.getElementById('formContent').style.display = 'block';
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
            this.submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Updating Student...';
            this.form.classList.add('loading');
        } else {
            this.submitBtn.disabled = false;
            this.submitBtn.classList.remove('loading');
            this.submitBtn.innerHTML = '<i class="fa fa-save"></i> Update Student';
            this.form.classList.remove('loading');
        }
    }
}

// Global functions for onclick handlers
function selectPhoto() {
    if (window.editStudentManager) {
        window.editStudentManager.selectPhoto();
    }
}

function updatePhoto() {
    if (window.editStudentManager) {
        window.editStudentManager.updatePhoto();
    }
}

function removePhoto() {
    if (window.editStudentManager) {
        window.editStudentManager.removePhoto();
    }
}

function resetChanges() {
    if (window.editStudentManager) {
        window.editStudentManager.resetChanges();
    }
}

function goBack() {
    if (confirm('Are you sure you want to go back? Any unsaved changes will be lost.')) {
        window.location.href = 'manage-students.html';
    }
}

function tryAgain() {
    if (window.editStudentManager) {
        window.editStudentManager.loadStudentData();
    }
}

// Initialize
const editStudentManager = new EditStudentManager();
window.editStudentManager = editStudentManager;

console.log('🚀 Edit Student page loaded');