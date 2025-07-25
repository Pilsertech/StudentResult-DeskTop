// Modern Settings Page JavaScript

class SettingsManager {
    constructor() {
        this.apiBaseUrl = 'http://localhost:9000';
        this.isLoading = false;
        this.systemInfo = null;
        this.backups = [];
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Settings Manager initializing...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        this.loadSystemInfo();
        this.setupEventListeners();
        
        console.log('✅ Settings Manager ready');
    }
    
    setupEventListeners() {
        // Modal close on overlay click
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
        
        // ESC key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
        
        // Backup select change
        const backupSelect = document.getElementById('backupSelect');
        if (backupSelect) {
            backupSelect.addEventListener('change', (e) => {
                const confirmBtn = document.getElementById('confirmRestoreBtn');
                if (confirmBtn) {
                    confirmBtn.disabled = !e.target.value;
                }
            });
        }
        
        console.log('🎯 Event listeners setup complete');
    }
    
    async loadSystemInfo() {
        try {
            console.log('📊 Loading system information...');
            this.updateStatus('systemStatus', 'Loading...', 'loading');
            
            const response = await fetch(`${this.apiBaseUrl}/admin/settings`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                this.systemInfo = result.data;
                this.displaySystemInfo();
                this.updateStatus('systemStatus', 'Online', 'online');
                console.log('✅ System information loaded');
            } else {
                throw new Error(result.message || 'Failed to load system info');
            }
            
        } catch (error) {
            console.error('❌ Failed to load system info:', error.message);
            this.updateStatus('systemStatus', 'Error', 'error');
            this.showError('Failed to load system information');
        }
    }
    
    displaySystemInfo() {
        const info = this.systemInfo;
        
        // Application info
        this.updateElement('appVersion', info.system?.version || '1.0.0');
        this.updateElement('appEnvironment', info.system?.environment || 'Development');
        this.updateElement('appUptime', this.formatUptime(info.system?.uptime || 0));
        this.updateElement('nodeVersion', info.system?.nodeVersion || 'Unknown');
        
        // Database info
        this.updateElement('dbHost', info.database?.host || 'localhost');
        this.updateElement('dbName', info.database?.name || 'srms');
        this.updateElement('dbSize', `${info.database?.size || 0} MB`);
        this.updateElement('dbTables', info.database?.tables || 0);
        
        // Records info
        this.updateElement('recordStudents', info.database?.records?.students || 0);
        this.updateElement('recordClasses', info.database?.records?.classes || 0);
        this.updateElement('recordSubjects', info.database?.records?.subjects || 0);
        this.updateElement('recordResults', info.database?.records?.results || 0);
        
        // Last backup info
        if (info.lastBackup) {
            this.updateElement('lastBackupDate', this.formatDate(info.lastBackup.date));
            this.updateElement('lastBackupSize', this.formatFileSize(info.lastBackup.size));
            this.updateElement('lastBackupStatus', 'Available', 'status-success');
        } else {
            this.updateElement('lastBackupDate', 'Never');
            this.updateElement('lastBackupSize', '--');
            this.updateElement('lastBackupStatus', 'No backups', 'status-unknown');
        }
    }
    
    async createBackup() {
        if (this.isLoading) return;
        
        try {
            console.log('💾 Creating database backup...');
            this.isLoading = true;
            
            this.showProgress('Creating Backup', 'Please wait while we create a backup of your database...');
            this.disableButton('backupBtn');
            
            const response = await fetch(`${this.apiBaseUrl}/admin/backup`, {
                method: 'POST'
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.hideProgress();
                this.showSuccess(`Backup created successfully: ${result.data.filename}`);
                this.loadSystemInfo(); // Refresh system info
                console.log('✅ Backup created successfully');
            } else {
                throw new Error(result.message || 'Backup failed');
            }
            
        } catch (error) {
            this.hideProgress();
            console.error('❌ Backup failed:', error.message);
            this.showError(`Backup failed: ${error.message}`);
        } finally {
            this.isLoading = false;
            this.enableButton('backupBtn');
        }
    }
    
    async showBackupHistory() {
        try {
            console.log('📂 Loading backup history...');
            this.showModal('backupModal');
            
            const response = await fetch(`${this.apiBaseUrl}/admin/backups`);
            const result = await response.json();
            
            if (result.success) {
                this.backups = result.data;
                this.displayBackupHistory();
                console.log(`✅ Loaded ${this.backups.length} backups`);
            } else {
                throw new Error(result.message || 'Failed to load backups');
            }
            
        } catch (error) {
            console.error('❌ Failed to load backups:', error.message);
            this.displayBackupError();
        }
    }
    
    displayBackupHistory() {
        const backupList = document.getElementById('backupList');
        
        if (this.backups.length === 0) {
            backupList.innerHTML = `
                <div class="text-center" style="padding: 40px; color: #7f8c8d;">
                    <i class="fa fa-archive" style="font-size: 2rem; margin-bottom: 15px; display: block;"></i>
                    <h4>No Backups Found</h4>
                    <p>No backup files have been created yet.</p>
                </div>
            `;
            return;
        }
        
        backupList.innerHTML = this.backups.map(backup => `
            <div class="backup-item">
                <div class="backup-info">
                    <h5>${backup.filename}</h5>
                    <p>
                        Created: ${this.formatDate(backup.created)} | 
                        Size: ${this.formatFileSize(backup.size)}
                    </p>
                </div>
                <div class="backup-actions">
                    <button class="btn btn-info" onclick="settingsManager.downloadBackup('${backup.filename}')">
                        <i class="fa fa-download"></i> Download
                    </button>
                    <button class="btn btn-warning" onclick="settingsManager.restoreFromBackup('${backup.filename}')">
                        <i class="fa fa-upload"></i> Restore
                    </button>
                    <button class="btn btn-danger" onclick="settingsManager.deleteBackup('${backup.filename}')">
                        <i class="fa fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    displayBackupError() {
        const backupList = document.getElementById('backupList');
        backupList.innerHTML = `
            <div class="text-center" style="padding: 40px; color: #e74c3c;">
                <i class="fa fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 15px; display: block;"></i>
                <h4>Error Loading Backups</h4>
                <p>Failed to load backup history. Please try again.</p>
                <button class="btn btn-primary mt-2" onclick="settingsManager.showBackupHistory()">
                    <i class="fa fa-refresh"></i> Retry
                </button>
            </div>
        `;
    }
    
    async showRestoreDialog() {
        try {
            console.log('🔄 Preparing restore dialog...');
            
            // Load backups for selection
            const response = await fetch(`${this.apiBaseUrl}/admin/backups`);
            const result = await response.json();
            
            if (result.success) {
                this.backups = result.data;
                this.populateBackupSelect();
                this.showModal('restoreModal');
            } else {
                throw new Error(result.message || 'Failed to load backups');
            }
            
        } catch (error) {
            console.error('❌ Failed to prepare restore:', error.message);
            this.showError('Failed to load backup list for restore');
        }
    }
    
    populateBackupSelect() {
        const backupSelect = document.getElementById('backupSelect');
        const confirmBtn = document.getElementById('confirmRestoreBtn');
        
        if (this.backups.length === 0) {
            backupSelect.innerHTML = '<option value="">No backups available</option>';
            confirmBtn.disabled = true;
            return;
        }
        
        backupSelect.innerHTML = `
            <option value="">Select a backup file...</option>
            ${this.backups.map(backup => `
                <option value="${backup.filename}">
                    ${backup.filename} (${this.formatDate(backup.created)})
                </option>
            `).join('')}
        `;
        
        confirmBtn.disabled = true;
    }
    
    async confirmRestore() {
        const backupSelect = document.getElementById('backupSelect');
        const selectedBackup = backupSelect.value;
        
        if (!selectedBackup) {
            this.showError('Please select a backup file');
            return;
        }
        
        const confirmed = confirm(
            `Are you sure you want to restore from "${selectedBackup}"?\n\n` +
            `This will REPLACE ALL current data with the backup data.\n` +
            `This action CANNOT be undone.\n\n` +
            `Click OK to proceed or Cancel to abort.`
        );
        
        if (!confirmed) {
            console.log('🚫 Restore cancelled by user');
            return;
        }
        
        try {
            console.log('🔄 Starting database restore...');
            this.closeModal('restoreModal');
            this.showProgress('Restoring Database', 'Please wait while we restore your database...');
            
            const response = await fetch(`${this.apiBaseUrl}/admin/restore`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    filename: selectedBackup
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.hideProgress();
                this.showSuccess(`Database restored successfully from ${selectedBackup}`);
                this.loadSystemInfo(); // Refresh system info
                console.log('✅ Database restored successfully');
            } else {
                throw new Error(result.message || 'Restore failed');
            }
            
        } catch (error) {
            this.hideProgress();
            console.error('❌ Restore failed:', error.message);
            this.showError(`Restore failed: ${error.message}`);
        }
    }
    
    async deleteBackup(filename) {
        const confirmed = confirm(
            `Are you sure you want to delete the backup "${filename}"?\n\n` +
            `This action cannot be undone.`
        );
        
        if (!confirmed) return;
        
        try {
            console.log('🗑️ Deleting backup:', filename);
            
            const response = await fetch(`${this.apiBaseUrl}/admin/backups/${filename}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showSuccess(`Backup "${filename}" deleted successfully`);
                this.showBackupHistory(); // Refresh backup list
                console.log('✅ Backup deleted successfully');
            } else {
                throw new Error(result.message || 'Delete failed');
            }
            
        } catch (error) {
            console.error('❌ Delete failed:', error.message);
            this.showError(`Failed to delete backup: ${error.message}`);
        }
    }
    
    downloadBackup(filename) {
        // Create a proper download link
        const downloadUrl = `${this.apiBaseUrl}/admin/backups/${filename}/download`;
        
        // Create temporary link element
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        link.style.display = 'none';
        
        // Add to DOM, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showSuccess(`Download started for "${filename}"`);
        console.log('📥 Download initiated for:', filename);
    }
    
    async runMaintenance() {
        const confirmed = confirm(
            'Are you sure you want to run database maintenance?\n\n' +
            'This will optimize database performance but may take several minutes.\n\n' +
            'Operations:\n' +
            '• Optimize all tables\n' +
            '• Analyze table statistics\n' +
            '• Check table integrity\n' +
            '• Clean up old data'
        );
        
        if (!confirmed) return;
        
        try {
            console.log('🔧 Running database maintenance...');
            this.showProgress('Running Maintenance', 'Optimizing database performance...');
            this.disableButton('maintenanceBtn');
            
            const response = await fetch(`${this.apiBaseUrl}/admin/maintenance`, {
                method: 'POST'
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.hideProgress();
                
                // Show detailed results
                const resultDetails = result.data.results.join('\n');
                this.showMaintenanceResults(result.data);
                
                console.log('✅ Maintenance completed');
            } else {
                throw new Error(result.message || 'Maintenance failed');
            }
            
        } catch (error) {
            this.hideProgress();
            console.error('❌ Maintenance failed:', error.message);
            this.showError(`Maintenance failed: ${error.message}`);
        } finally {
            this.enableButton('maintenanceBtn');
        }
    }
    
    showMaintenanceResults(data) {
        const results = data.results || [];
        const message = `Database Maintenance Completed!\n\n` +
                       `Tables Processed: ${data.tablesProcessed}\n` +
                       `Completed At: ${new Date(data.completedAt).toLocaleString()}\n\n` +
                       `Results:\n${results.join('\n')}`;
        
        alert(message);
    }

    // Utility methods
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    }
    
    showProgress(title, message) {
        document.getElementById('progressTitle').textContent = title;
        document.getElementById('progressMessage').textContent = message;
        this.showModal('progressModal');
    }
    
    hideProgress() {
        this.closeModal('progressModal');
    }
    
    updateElement(id, value, className = '') {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
            if (className) {
                element.className = className;
            }
        }
    }
    
    updateStatus(id, text, status) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
            element.className = `status-badge ${status}`;
        }
    }
    
    disableButton(id) {
        const button = document.getElementById(id);
        if (button) {
            button.disabled = true;
            button.style.opacity = '0.6';
        }
    }
    
    enableButton(id) {
        const button = document.getElementById(id);
        if (button) {
            button.disabled = false;
            button.style.opacity = '1';
        }
    }
    
    formatUptime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }
    
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    showSuccess(message) {
        alert('✅ ' + message); // Replace with better notification system
    }
    
    showError(message) {
        alert('❌ ' + message); // Replace with better notification system
    }
    
    showInfo(message) {
        alert('ℹ️ ' + message); // Replace with better notification system
    }
}

// Global functions for onclick handlers
function loadSystemInfo() {
    if (window.settingsManager) {
        window.settingsManager.loadSystemInfo();
    }
}

function createBackup() {
    if (window.settingsManager) {
        window.settingsManager.createBackup();
    }
}

function showBackupHistory() {
    if (window.settingsManager) {
        window.settingsManager.showBackupHistory();
    }
}

function showRestoreDialog() {
    if (window.settingsManager) {
        window.settingsManager.showRestoreDialog();
    }
}

function confirmRestore() {
    if (window.settingsManager) {
        window.settingsManager.confirmRestore();
    }
}

function closeModal(modalId) {
    if (window.settingsManager) {
        window.settingsManager.closeModal(modalId);
    }
}

function runMaintenance() {
    if (window.settingsManager) {
        window.settingsManager.runMaintenance();
    }
}

// Initialize settings manager
let settingsManager;

document.addEventListener('DOMContentLoaded', () => {
    settingsManager = new SettingsManager();
    window.settingsManager = settingsManager; // Make globally available
});

console.log('🌐 Settings script loaded');
