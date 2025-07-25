// Attendance Settings Management System

class AttendanceSettingsManager {
    constructor() {
        this.classes = [];
        this.selectedClass = null;
        this.currentSettings = {};
        this.originalSettings = {};
        this.isLoading = false;
        
        this.init();
    }
    
    init() {
        document.addEventListener('DOMContentLoaded', () => this.setup());
    }
    
    setup() {
        this.messageArea = document.getElementById('messageArea');
        this.classGrid = document.getElementById('classGrid');
        this.settingsCard = document.getElementById('settingsCard');
        this.settingsForm = document.getElementById('settingsForm');
        
        this.setupEventListeners();
        this.loadClasses();
        
        console.log('✅ Attendance Settings Manager initialized');
    }
    
    setupEventListeners() {
        // Form submission
        if (this.settingsForm) {
            this.settingsForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }
        
        // Geofence toggle
        const geofenceEnabled = document.getElementById('geofenceEnabled');
        if (geofenceEnabled) {
            geofenceEnabled.addEventListener('change', (e) => this.toggleGeofenceSettings(e.target.checked));
        }
        
        // Auto mark absent toggle
        const autoMarkAbsent = document.getElementById('autoMarkAbsent');
        if (autoMarkAbsent) {
            autoMarkAbsent.addEventListener('change', (e) => this.toggleAutoMarkTime(e.target.checked));
        }
        
        // Modal close on overlay click
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
        
        console.log('🎯 Event listeners setup');
    }
    
    async loadClasses() {
        try {
            console.log('📚 Loading classes...');
            
            const response = await fetch('http://localhost:9000/classes');
            const result = await response.json();
            
            if (result.success && result.classes) {
                this.classes = result.classes.filter(cls => cls.Status == 1); // Only active classes
                this.renderClassGrid();
                console.log(`✅ Loaded ${this.classes.length} active classes`);
            } else {
                throw new Error(result.message || 'Failed to load classes');
            }
            
        } catch (error) {
            console.error('❌ Error loading classes:', error);
            this.showMessage('Failed to load classes: ' + error.message, 'error');
            this.showClassGridError();
        }
    }
    
    renderClassGrid() {
        if (!this.classGrid) return;
        
        this.classGrid.innerHTML = '';
        
        if (this.classes.length === 0) {
            this.classGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #7f8c8d;">
                    <i class="fa fa-graduation-cap" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                    <p>No active classes found</p>
                </div>
            `;
            return;
        }
        
        this.classes.forEach(cls => {
            const classItem = this.createClassItem(cls);
            this.classGrid.appendChild(classItem);
        });
    }
    
    createClassItem(cls) {
        const item = document.createElement('div');
        item.className = 'class-item fade-in';
        item.dataset.classId = cls.id;
        
        item.innerHTML = `
            <h4>${cls.ClassName}</h4>
            <p>Section ${cls.Section}</p>
        `;
        
        item.addEventListener('click', () => this.selectClass(cls));
        
        return item;
    }
    
    async selectClass(cls) {
        // Update UI selection
        document.querySelectorAll('.class-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelector(`[data-class-id="${cls.id}"]`).classList.add('selected');
        
        this.selectedClass = cls;
        
        // Update header info
        document.getElementById('selectedClassInfo').innerHTML = `
            <i class="fa fa-graduation-cap"></i>
            ${cls.ClassName} Section-${cls.Section}
        `;
        
        // Load settings for this class
        await this.loadClassSettings(cls.id);
        
        // Show settings card
        this.settingsCard.style.display = 'block';
        this.settingsCard.scrollIntoView({ behavior: 'smooth' });
        
        console.log('📝 Selected class:', cls.ClassName, cls.Section);
    }
    
    async loadClassSettings(classId) {
        try {
            this.setLoading(true);
            console.log('⚙️ Loading settings for class:', classId);
            
            const response = await fetch(`http://localhost:9000/attendance/settings/${classId}`);
            const result = await response.json();
            
            if (result.success) {
                this.currentSettings = result.settings;
                this.originalSettings = { ...result.settings };
                this.populateForm(result.settings);
                console.log('✅ Settings loaded successfully');
            } else {
                throw new Error(result.message || 'Failed to load settings');
            }
            
        } catch (error) {
            console.error('❌ Error loading settings:', error);
            this.showMessage('Failed to load settings: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
    populateForm(settings) {
        // Set hidden class ID
        document.getElementById('classId').value = this.selectedClass.id;
        
        // General settings
        document.getElementById('lateThreshold').value = settings.LateThreshold || 15;
        document.getElementById('allowLateEntry').checked = settings.AllowLateEntry == 1;
        document.getElementById('autoMarkAbsent').checked = settings.AutoMarkAbsent == 1;
        document.getElementById('autoMarkTime').value = settings.AutoMarkTime || '10:00';
        
        // Attendance methods
        document.getElementById('qrCodeEnabled').checked = settings.QRCodeEnabled == 1;
        document.getElementById('fingerprintEnabled').checked = settings.FingerprintEnabled == 1;
        document.getElementById('requirePhoto').checked = settings.RequirePhoto == 1;
        
        // Location settings
        document.getElementById('geofenceEnabled').checked = settings.GeofenceEnabled == 1;
        document.getElementById('geofenceRadius').value = settings.GeofenceRadius || 100;
        document.getElementById('geofenceLatitude').value = settings.GeofenceLatitude || '';
        document.getElementById('geofenceLongitude').value = settings.GeofenceLongitude || '';
        
        // Toggle dependent sections
        this.toggleGeofenceSettings(settings.GeofenceEnabled == 1);
        this.toggleAutoMarkTime(settings.AutoMarkAbsent == 1);
    }
    
    toggleGeofenceSettings(enabled) {
        const geofenceSettings = document.getElementById('geofenceSettings');
        if (geofenceSettings) {
            geofenceSettings.style.display = enabled ? 'block' : 'none';
        }
    }
    
    toggleAutoMarkTime(enabled) {
        const autoMarkTimeContainer = document.getElementById('autoMarkTimeContainer');
        if (autoMarkTimeContainer) {
            autoMarkTimeContainer.style.display = enabled ? 'flex' : 'none';
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isLoading) return;
        
        this.clearMessages();
        await this.saveSettings();
    }
    
    async saveSettings() {
        if (!this.selectedClass) {
            this.showMessage('Please select a class first', 'error');
            return;
        }
        
        try {
            this.setLoading(true);
            console.log('💾 Saving settings...');
            
            const formData = new FormData(this.settingsForm);
            const settings = {
                classId: this.selectedClass.id,
                lateThreshold: parseInt(formData.get('lateThreshold')) || 15,
                allowLateEntry: formData.get('allowLateEntry') ? 1 : 0,
                autoMarkAbsent: formData.get('autoMarkAbsent') ? 1 : 0,
                autoMarkTime: formData.get('autoMarkTime') || '10:00:00',
                qrCodeEnabled: formData.get('qrCodeEnabled') ? 1 : 0,
                fingerprintEnabled: formData.get('fingerprintEnabled') ? 1 : 0,
                requirePhoto: formData.get('requirePhoto') ? 1 : 0,
                geofenceEnabled: formData.get('geofenceEnabled') ? 1 : 0,
                geofenceRadius: parseInt(formData.get('geofenceRadius')) || 100,
                geofenceLatitude: parseFloat(formData.get('geofenceLatitude')) || null,
                geofenceLongitude: parseFloat(formData.get('geofenceLongitude')) || null
            };
            
            const response = await fetch(`http://localhost:9000/attendance/settings/${this.selectedClass.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.currentSettings = settings;
                this.originalSettings = { ...settings };
                this.showMessage('Settings saved successfully!', 'success');
                console.log('✅ Settings saved');
            } else {
                this.showMessage(result.message || 'Failed to save settings', 'error');
            }
            
        } catch (error) {
            console.error('❌ Error saving settings:', error);
            this.showMessage('Error saving settings: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
    async getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showMessage('Geolocation is not supported by this browser', 'error');
            return;
        }
        
        try {
            this.setLoading(true);
            console.log('📍 Getting current location...');
            
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                });
            });
            
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            
            document.getElementById('geofenceLatitude').value = latitude.toFixed(6);
            document.getElementById('geofenceLongitude').value = longitude.toFixed(6);
            
            this.showMessage(`Location set: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, 'success');
            console.log('✅ Location obtained:', latitude, longitude);
            
        } catch (error) {
            console.error('❌ Error getting location:', error);
            this.showMessage('Failed to get current location: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
    previewSettings() {
        if (!this.selectedClass) {
            this.showMessage('Please select a class first', 'error');
            return;
        }
        
        const formData = new FormData(this.settingsForm);
        const settings = {
            lateThreshold: parseInt(formData.get('lateThreshold')) || 15,
            allowLateEntry: formData.get('allowLateEntry') ? 'Enabled' : 'Disabled',
            autoMarkAbsent: formData.get('autoMarkAbsent') ? 'Enabled' : 'Disabled',
            autoMarkTime: formData.get('autoMarkTime') || '10:00:00',
            qrCodeEnabled: formData.get('qrCodeEnabled') ? 'Enabled' : 'Disabled',
            fingerprintEnabled: formData.get('fingerprintEnabled') ? 'Enabled' : 'Disabled',
            requirePhoto: formData.get('requirePhoto') ? 'Enabled' : 'Disabled',
            geofenceEnabled: formData.get('geofenceEnabled') ? 'Enabled' : 'Disabled',
            geofenceRadius: parseInt(formData.get('geofenceRadius')) || 100,
            geofenceLatitude: formData.get('geofenceLatitude') || 'Not set',
            geofenceLongitude: formData.get('geofenceLongitude') || 'Not set'
        };
        
        const previewContent = document.getElementById('previewContent');
        previewContent.innerHTML = `
            <div class="preview-section">
                <h5>Class Information</h5>
                <div class="preview-item">
                    <span class="preview-label">Class:</span>
                    <span class="preview-value">${this.selectedClass.ClassName} Section-${this.selectedClass.Section}</span>
                </div>
            </div>
            
            <div class="preview-section">
                <h5>General Settings</h5>
                <div class="preview-item">
                    <span class="preview-label">Late Threshold:</span>
                    <span class="preview-value">${settings.lateThreshold} minutes</span>
                </div>
                <div class="preview-item">
                    <span class="preview-label">Allow Late Entry:</span>
                    <span class="preview-value ${settings.allowLateEntry.toLowerCase()}">${settings.allowLateEntry}</span>
                </div>
                <div class="preview-item">
                    <span class="preview-label">Auto Mark Absent:</span>
                    <span class="preview-value ${settings.autoMarkAbsent.toLowerCase()}">${settings.autoMarkAbsent}</span>
                </div>
                <div class="preview-item">
                    <span class="preview-label">Auto Mark Time:</span>
                    <span class="preview-value">${settings.autoMarkTime}</span>
                </div>
            </div>
            
            <div class="preview-section">
                <h5>Attendance Methods</h5>
                <div class="preview-item">
                    <span class="preview-label">QR Code:</span>
                    <span class="preview-value ${settings.qrCodeEnabled.toLowerCase()}">${settings.qrCodeEnabled}</span>
                </div>
                <div class="preview-item">
                    <span class="preview-label">Fingerprint:</span>
                    <span class="preview-value ${settings.fingerprintEnabled.toLowerCase()}">${settings.fingerprintEnabled}</span>
                </div>
                <div class="preview-item">
                    <span class="preview-label">Require Photo:</span>
                    <span class="preview-value ${settings.requirePhoto.toLowerCase()}">${settings.requirePhoto}</span>
                </div>
            </div>
            
            <div class="preview-section">
                <h5>Location Settings</h5>
                <div class="preview-item">
                    <span class="preview-label">Geofence:</span>
                    <span class="preview-value ${settings.geofenceEnabled.toLowerCase()}">${settings.geofenceEnabled}</span>
                </div>
                <div class="preview-item">
                    <span class="preview-label">Radius:</span>
                    <span class="preview-value">${settings.geofenceRadius} meters</span>
                </div>
                <div class="preview-item">
                    <span class="preview-label">Latitude:</span>
                    <span class="preview-value">${settings.geofenceLatitude}</span>
                </div>
                <div class="preview-item">
                    <span class="preview-label">Longitude:</span>
                    <span class="preview-value">${settings.geofenceLongitude}</span>
                </div>
            </div>
        `;
        
        this.showModal('previewModal');
    }
    
    async applyPreviewedSettings() {
        this.closePreviewModal();
        await this.saveSettings();
    }
    
    cancelSettings() {
        if (!this.originalSettings || Object.keys(this.originalSettings).length === 0) {
            this.settingsCard.style.display = 'none';
            this.selectedClass = null;
            document.querySelectorAll('.class-item').forEach(item => {
                item.classList.remove('selected');
            });
            return;
        }
        
        const hasChanges = this.hasUnsavedChanges();
        
        if (hasChanges) {
            const confirmed = confirm('You have unsaved changes. Are you sure you want to cancel?');
            if (!confirmed) return;
        }
        
        // Reset to original settings
        this.populateForm(this.originalSettings);
        this.showMessage('Changes cancelled', 'info');
    }
    
    hasUnsavedChanges() {
        if (!this.settingsForm || !this.originalSettings) return false;
        
        const formData = new FormData(this.settingsForm);
        const currentValues = {
            lateThreshold: parseInt(formData.get('lateThreshold')) || 15,
            allowLateEntry: formData.get('allowLateEntry') ? 1 : 0,
            autoMarkAbsent: formData.get('autoMarkAbsent') ? 1 : 0,
            qrCodeEnabled: formData.get('qrCodeEnabled') ? 1 : 0,
            fingerprintEnabled: formData.get('fingerprintEnabled') ? 1 : 0,
            requirePhoto: formData.get('requirePhoto') ? 1 : 0,
            geofenceEnabled: formData.get('geofenceEnabled') ? 1 : 0
        };
        
        return Object.keys(currentValues).some(key => 
            currentValues[key] !== this.originalSettings[key]
        );
    }
    
    resetToDefaults() {
        const confirmed = confirm('Are you sure you want to reset all settings to default values?');
        if (!confirmed) return;
        
        const defaultSettings = {
            LateThreshold: 15,
            AllowLateEntry: 1,
            AutoMarkAbsent: 1,
            AutoMarkTime: '10:00:00',
            QRCodeEnabled: 1,
            FingerprintEnabled: 0,
            RequirePhoto: 0,
            GeofenceEnabled: 0,
            GeofenceRadius: 100,
            GeofenceLatitude: null,
            GeofenceLongitude: null
        };
        
        this.populateForm(defaultSettings);
        this.showMessage('Settings reset to defaults', 'info');
    }
    
    async saveAllSettings() {
        if (!this.selectedClass) {
            this.showMessage('Please select a class to save settings', 'error');
            return;
        }
        
        await this.saveSettings();
    }
    
    showClassGridError() {
        if (this.classGrid) {
            this.classGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #e74c3c;">
                    <i class="fa fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                    <p>Failed to load classes</p>
                    <button onclick="attendanceSettingsManager.loadClasses()" style="margin-top: 10px; padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Try Again
                    </button>
                </div>
            `;
        }
    }
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    closePreviewModal() {
        document.getElementById('previewModal').classList.remove('active');
        document.body.style.overflow = '';
    }
    
    setLoading(loading) {
        this.isLoading = loading;
        
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            if (loading) {
                saveBtn.disabled = true;
                saveBtn.classList.add('loading');
                saveBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Saving...';
            } else {
                saveBtn.disabled = false;
                saveBtn.classList.remove('loading');
                saveBtn.innerHTML = '<i class="fa fa-save"></i> Save Settings';
            }
        }
        
        if (this.settingsForm) {
            if (loading) {
                this.settingsForm.classList.add('loading');
            } else {
                this.settingsForm.classList.remove('loading');
            }
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
}

// Global functions for onclick handlers
function resetToDefaults() {
    if (window.attendanceSettingsManager) {
        window.attendanceSettingsManager.resetToDefaults();
    }
}

function saveAllSettings() {
    if (window.attendanceSettingsManager) {
        window.attendanceSettingsManager.saveAllSettings();
    }
}

function getCurrentLocation() {
    if (window.attendanceSettingsManager) {
        window.attendanceSettingsManager.getCurrentLocation();
    }
}

function cancelSettings() {
    if (window.attendanceSettingsManager) {
        window.attendanceSettingsManager.cancelSettings();
    }
}

function previewSettings() {
    if (window.attendanceSettingsManager) {
        window.attendanceSettingsManager.previewSettings();
    }
}

function closePreviewModal() {
    if (window.attendanceSettingsManager) {
        window.attendanceSettingsManager.closePreviewModal();
    }
}

function applyPreviewedSettings() {
    if (window.attendanceSettingsManager) {
        window.attendanceSettingsManager.applyPreviewedSettings();
    }
}

// Initialize
const attendanceSettingsManager = new AttendanceSettingsManager();
window.attendanceSettingsManager = attendanceSettingsManager;

console.log('🚀 Attendance Settings page loaded');
