// Modern Manage Students Page with Photo Support

class ManageStudentsManager {
    constructor() {
        this.dataTable = null;
        this.students = [];
        this.classes = [];
        this.currentStudent = null;
        this.pendingAction = null;
        
        this.init();
    }
    
    init() {
        document.addEventListener('DOMContentLoaded', () => this.setup());
    }
    
    setup() {
        this.messageArea = document.getElementById('messageArea');
        this.statusFilter = document.getElementById('statusFilter');
        this.classFilter = document.getElementById('classFilter');
        
        this.setupEventListeners();
        this.loadClasses();
        this.loadStudents();
        
        console.log('✅ Manage Students Manager initialized');
    }
    
    setupEventListeners() {
        // Filter changes
        this.statusFilter.addEventListener('change', () => this.applyFilters());
        this.classFilter.addEventListener('change', () => this.applyFilters());
        
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
        
        console.log('🎯 Event listeners setup');
    }
    
    async loadClasses() {
        try {
            const response = await fetch('http://localhost:9000/classes');
            const result = await response.json();
            
            if (result.success && result.classes) {
                this.classes = result.classes;
                this.populateClassFilter();
            }
        } catch (error) {
            console.warn('Could not load classes:', error);
        }
    }
    
    populateClassFilter() {
        this.classFilter.innerHTML = '<option value="">All Classes</option>';
        
        this.classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = `${cls.ClassName} Section-${cls.Section}`;
            this.classFilter.appendChild(option);
        });
    }
    
    async loadStudents() {
        try {
            console.log('📚 Loading students...');
            this.showTableLoading();
            
            const response = await fetch('http://localhost:9000/students');
            const result = await response.json();
            
            if (result.success) {
                this.students = result.students || [];
                this.renderTable();
                this.updateStats();
                console.log(`✅ Loaded ${this.students.length} students`);
            } else {
                throw new Error(result.message || 'Failed to load students');
            }
            
        } catch (error) {
            console.error('❌ Error loading students:', error);
            this.showMessage('Failed to load students: ' + error.message, 'error');
            this.showTableError();
        }
    }
    
    renderTable() {
        const tableBody = document.querySelector('#studentsTable tbody');
        
        if (!tableBody) {
            console.error('Table body not found');
            return;
        }
        
        // Destroy existing DataTable
        if (this.dataTable) {
            this.dataTable.destroy();
        }
        
        tableBody.innerHTML = '';
        
        this.students.forEach((student, index) => {
            const row = this.createStudentRow(student, index + 1);
            tableBody.appendChild(row);
        });
        
        // Initialize DataTable
        this.initializeDataTable();
    }
    
    createStudentRow(student, serialNumber) {
        const row = document.createElement('tr');
        row.className = 'fade-in';
        
        // Format data
        const regDate = this.formatDate(student.RegDate);
        const statusClass = student.Status == 1 ? 'status-active' : 'status-blocked';
        const statusText = student.Status == 1 ? 'Active' : 'Blocked';
        const classInfo = `${student.ClassName} (${student.Section})`;
        
        row.innerHTML = `
            <td>${serialNumber}</td>
            <td>${this.createPhotoCell(student)}</td>
            <td>
                <span class="student-name" onclick="manageStudentsManager.viewStudent(${student.StudentId})">
                    ${student.StudentName}
                </span>
            </td>
            <td>
                <span class="roll-id">${student.RollId}</span>
            </td>
            <td class="class-info">${classInfo}</td>
            <td class="reg-date">${regDate}</td>
            <td>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn btn-view" onclick="manageStudentsManager.viewStudent(${student.StudentId})" title="View Details">
                        <i class="fa fa-eye"></i>
                    </button>
                    <button class="action-btn btn-edit" onclick="manageStudentsManager.editStudent(${student.StudentId})" title="Edit Student">
                        <i class="fa fa-edit"></i>
                    </button>
                    <button class="action-btn btn-toggle ${student.Status == 1 ? 'active' : 'blocked'}" 
                            onclick="manageStudentsManager.toggleStatus(${student.StudentId}, ${student.Status})" 
                            title="${student.Status == 1 ? 'Block Student' : 'Activate Student'}">
                        <i class="fa ${student.Status == 1 ? 'fa-ban' : 'fa-check'}"></i>
                    </button>
                </div>
            </td>
        `;
        
        return row;
    }
    
    createPhotoCell(student) {
        if (student.PhotoPath) {
            const photoUrl = `http://localhost:9000/students/photos/${student.PhotoPath.split('/').pop()}`;
            return `<img src="${photoUrl}" alt="${student.StudentName}" class="student-photo" onclick="manageStudentsManager.viewStudent(${student.StudentId})">`;
        } else {
            const initial = student.StudentName.charAt(0).toUpperCase();
            return `<div class="photo-placeholder" onclick="manageStudentsManager.viewStudent(${student.StudentId})">${initial}</div>`;
        }
    }
    
    initializeDataTable() {
        this.dataTable = $('#studentsTable').DataTable({
            responsive: true,
            pageLength: 25,
            lengthMenu: [10, 25, 50, 100],
            order: [[2, 'asc']], // Sort by name
            columnDefs: [
                { orderable: false, targets: [1, 7] }, // Photo and Actions columns
                { searchable: false, targets: [0, 1, 7] } // Serial, Photo, Actions
            ],
            language: {
                search: "Search students:",
                lengthMenu: "Show _MENU_ students per page",
                info: "Showing _START_ to _END_ of _TOTAL_ students",
                infoEmpty: "No students found",
                infoFiltered: "(filtered from _MAX_ total students)",
                paginate: {
                    first: "First",
                    last: "Last",
                    next: "Next",
                    previous: "Previous"
                }
            }
        });
        
        console.log('📊 DataTable initialized');
    }
    
    applyFilters() {
        if (!this.dataTable) return;
        
        const statusValue = this.statusFilter.value;
        const classValue = this.classFilter.value;
        
        // Apply status filter
        if (statusValue !== '') {
            this.dataTable.column(6).search(statusValue === '1' ? 'Active' : 'Blocked');
        } else {
            this.dataTable.column(6).search('');
        }
        
        // Apply class filter
        if (classValue !== '') {
            const selectedClass = this.classes.find(cls => cls.id == classValue);
            if (selectedClass) {
                this.dataTable.column(4).search(selectedClass.ClassName);
            }
        } else {
            this.dataTable.column(4).search('');
        }
        
        this.dataTable.draw();
        console.log('🔍 Filters applied');
    }
    
    updateStats() {
        const total = this.students.length;
        const active = this.students.filter(s => s.Status == 1).length;
        const blocked = total - active;
        
        document.getElementById('totalCount').textContent = total;
        document.getElementById('activeCount').textContent = active;
        document.getElementById('blockedCount').textContent = blocked;
    }
    
    async viewStudent(studentId) {
        try {
            const response = await fetch(`http://localhost:9000/students/${studentId}`);
            const result = await response.json();
            
            if (result.success && result.student) {
                this.currentStudent = result.student;
                this.displayStudentModal(result.student);
                
                // Load QR code, barcode, and fingerprint status
                this.loadStudentCodes(studentId);
            } else {
                this.showMessage('Student not found', 'error');
            }
        } catch (error) {
            console.error('Error loading student details:', error);
            this.showMessage('Error loading student details', 'error');
        }
    }
    
    displayStudentModal(student) {
        const modalBody = document.getElementById('studentModalBody');
        
        modalBody.innerHTML = `
            <div class="student-details-grid">
                <div class="student-info">
                    <div class="student-photo-section">
                        ${student.PhotoPath ? 
                            `<img src="http://localhost:9000/students/photos/${student.PhotoPath.split('/').pop()}" alt="${student.StudentName}" class="student-photo-large">` :
                            `<div class="photo-placeholder-large"><i class="fa fa-user"></i></div>`
                        }
                    </div>
                    <div class="student-basic-info">
                        <h4>${student.StudentName}</h4>
                        <table class="info-table">
                            <tr><td><strong>Roll ID:</strong></td><td>${student.RollId}</td></tr>
                            <tr><td><strong>Email:</strong></td><td>${student.StudentEmail}</td></tr>
                            <tr><td><strong>Gender:</strong></td><td>${student.Gender}</td></tr>
                            <tr><td><strong>Class:</strong></td><td>${student.ClassName} Section-${student.Section}</td></tr>
                            <tr><td><strong>DOB:</strong></td><td>${new Date(student.DOB).toLocaleDateString()}</td></tr>
                            <tr><td><strong>Status:</strong></td><td><span class="status-badge ${student.Status == 1 ? 'active' : 'blocked'}">${student.Status == 1 ? 'Active' : 'Blocked'}</span></td></tr>
                            <tr><td><strong>Registered:</strong></td><td>${new Date(student.RegDate).toLocaleDateString()}</td></tr>
                        </table>
                    </div>
                </div>
                <div class="student-codes">
                    <div class="codes-section">
                        <h4><i class="fa fa-qrcode"></i> QR Code</h4>
                        <div class="qr-container" id="studentQRContainer">
                            <div class="loading-placeholder">
                                <i class="fa fa-spinner fa-spin"></i> Loading QR...
                            </div>
                        </div>
                        <button class="btn btn-outline btn-sm" onclick="downloadQR()" id="downloadQRBtn" style="display: none;">
                            <i class="fa fa-download"></i> Download QR
                        </button>
                    </div>
                    <div class="codes-section">
                        <h4><i class="fa fa-barcode"></i> Barcode</h4>
                        <div class="barcode-container" id="studentBarcodeContainer">
                            <div class="loading-placeholder">
                                <i class="fa fa-spinner fa-spin"></i> Loading Barcode...
                            </div>
                        </div>
                        <button class="btn btn-outline btn-sm" onclick="downloadBarcode()" id="downloadBarcodeBtn" style="display: none;">
                            <i class="fa fa-download"></i> Download Barcode
                        </button>
                    </div>
                    <div class="codes-section">
                        <h4><i class="fa fa-fingerprint"></i> Fingerprint</h4>
                        <div class="fingerprint-status" id="fingerprintStatus">
                            <div class="loading-placeholder">
                                <i class="fa fa-spinner fa-spin"></i> Checking status...
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.showModal('studentModal');
    }

    async loadStudentCodes(studentId) {
        // Load QR Code
        try {
            const qrResponse = await fetch(`http://localhost:9000/students/${studentId}/qr`);
            const qrResult = await qrResponse.json();
            
            if (qrResult.success) {
                this.displayQRCode(qrResult.data);
            } else {
                this.showQRError();
            }
        } catch (error) {
            console.error('Error loading QR code:', error);
            this.showQRError();
        }

        // Load Barcode
        try {
            const barcodeResponse = await fetch(`http://localhost:9000/students/${studentId}/barcode`);
            const barcodeResult = await barcodeResponse.json();
            
            if (barcodeResult.success) {
                this.displayBarcode(barcodeResult.data);
            } else {
                this.showBarcodeError();
            }
        } catch (error) {
            console.error('Error loading barcode:', error);
            this.showBarcodeError();
        }

        // Load Fingerprint Status
        try {
            const fingerprintResponse = await fetch(`http://localhost:9000/students/${studentId}/fingerprint/status`);
            const fingerprintResult = await fingerprintResponse.json();
            
            if (fingerprintResult.success) {
                this.displayFingerprintStatus(fingerprintResult.data);
            } else {
                this.showFingerprintError();
            }
        } catch (error) {
            console.error('Error loading fingerprint status:', error);
            this.showFingerprintError();
        }
    }

    displayQRCode(qrData) {
        const container = document.getElementById('studentQRContainer');
        const downloadBtn = document.getElementById('downloadQRBtn');
        
        container.innerHTML = `
            <div class="qr-display">
                <img src="${qrData.qrCode}" alt="Student QR Code" class="qr-image">
                <div class="qr-info">
                    <small>Scan for student verification</small>
                </div>
            </div>
        `;
        
        this.currentQRData = qrData;
        downloadBtn.style.display = 'inline-flex';
    }

    displayBarcode(barcodeData) {
        const container = document.getElementById('studentBarcodeContainer');
        const downloadBtn = document.getElementById('downloadBarcodeBtn');
        
        container.innerHTML = `
            <div class="barcode-display">
                <img src="${barcodeData.barcode}" alt="Student Barcode" class="barcode-image">
                <div class="barcode-info">
                    <small>Roll ID: ${barcodeData.rollId}</small>
                </div>
            </div>
        `;
        
        this.currentBarcodeData = barcodeData;
        downloadBtn.style.display = 'inline-flex';
    }

    displayFingerprintStatus(statusData) {
        const container = document.getElementById('fingerprintStatus');
        
        if (statusData.registered) {
            container.innerHTML = `
                <div class="fingerprint-registered">
                    <i class="fa fa-check-circle" style="color: #27ae60; font-size: 2rem;"></i>
                    <div class="status-text">
                        <strong>Registered</strong>
                        <small>Last updated: ${new Date(statusData.lastUpdated).toLocaleDateString()}</small>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="fingerprint-not-registered">
                    <i class="fa fa-times-circle" style="color: #e74c3c; font-size: 2rem;"></i>
                    <div class="status-text">
                        <strong>Not Registered</strong>
                        <small>No fingerprint data available</small>
                    </div>
                </div>
            `;
        }
    }

    showQRError() {
        document.getElementById('studentQRContainer').innerHTML = `
            <div class="error-placeholder">
                <i class="fa fa-exclamation-triangle"></i>
                <small>Failed to load QR code</small>
            </div>
        `;
    }

    showBarcodeError() {
        document.getElementById('studentBarcodeContainer').innerHTML = `
            <div class="error-placeholder">
                <i class="fa fa-exclamation-triangle"></i>
                <small>Failed to load barcode</small>
            </div>
        `;
    }

    showFingerprintError() {
        document.getElementById('fingerprintStatus').innerHTML = `
            <div class="error-placeholder">
                <i class="fa fa-exclamation-triangle"></i>
                <small>Failed to load fingerprint status</small>
            </div>
        `;
    }

    downloadQR() {
        if (this.currentQRData && this.currentQRData.qrCode) {
            const link = document.createElement('a');
            link.download = `student-qr-${this.currentStudent.StudentId}.png`;
            link.href = this.currentQRData.qrCode;
            link.click();
        }
    }

    downloadBarcode() {
        if (this.currentBarcodeData && this.currentBarcodeData.barcode) {
            const link = document.createElement('a');
            link.download = `student-barcode-${this.currentStudent.StudentId}.png`;
            link.href = this.currentBarcodeData.barcode;
            link.click();
        }
    }
    
    async editStudent(studentId) {
        if (studentId) {
            window.location.href = `edit-student.html?stid=${studentId}`;
        } else if (this.currentStudent) {
            window.location.href = `edit-student.html?stid=${this.currentStudent.StudentId}`;
        }
    }
    
    toggleStatus(studentId, currentStatus) {
        const newStatus = currentStatus == 1 ? 0 : 1;
        const actionText = newStatus == 1 ? 'activate' : 'block';
        
        this.pendingAction = {
            type: 'toggleStatus',
            studentId: studentId,
            status: newStatus
        };
        
        this.showConfirmModal(
            `Are you sure you want to ${actionText} this student?`,
            'warning'
        );
    }
    
    async confirmAction() {
        if (!this.pendingAction) return;
        
        try {
            this.closeConfirmModal();
            
            if (this.pendingAction.type === 'toggleStatus') {
                const response = await fetch(`http://localhost:9000/students/${this.pendingAction.studentId}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: this.pendingAction.status })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    this.showMessage(result.message, 'success');
                    this.loadStudents(); // Refresh table
                } else {
                    this.showMessage(result.message || 'Action failed', 'error');
                }
            }
        } catch (error) {
            console.error('Action failed:', error);
            this.showMessage('Action failed: ' + error.message, 'error');
        } finally {
            this.pendingAction = null;
        }
    }
    
    refreshTable() {
        this.loadStudents();
        this.showMessage('Students list refreshed', 'info');
    }
    
    showTableLoading() {
        const tableBody = document.querySelector('#studentsTable tbody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="table-loading">
                        <i class="fa fa-spinner"></i>
                        <div>Loading students...</div>
                    </td>
                </tr>
            `;
        }
    }
    
    showTableError() {
        const tableBody = document.querySelector('#studentsTable tbody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 50px; color: #e74c3c;">
                        <i class="fa fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                        <div>Failed to load students</div>
                        <button onclick="manageStudentsManager.refreshTable()" style="margin-top: 10px; padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Try Again
                        </button>
                    </td>
                </tr>
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
    
    closeModal() {
        document.getElementById('studentModal').classList.remove('active');
        document.body.style.overflow = '';
        this.currentStudent = null;
    }
    
    showConfirmModal(message, type = 'warning') {
        document.getElementById('confirmMessage').textContent = message;
        this.showModal('confirmModal');
    }
    
    closeConfirmModal() {
        document.getElementById('confirmModal').classList.remove('active');
        document.body.style.overflow = '';
        this.pendingAction = null;
    }
    
    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
        this.currentStudent = null;
        this.pendingAction = null;
    }
    
    formatDate(dateString) {
        if (!dateString || dateString === '0000-00-00 00:00:00') {
            return 'N/A';
        }
        
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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
        
        // Auto-hide messages
        setTimeout(() => {
            this.messageArea.innerHTML = '';
        }, 5000);
    }
}

// Global functions for onclick handlers
function refreshTable() {
    if (window.manageStudentsManager) {
        window.manageStudentsManager.refreshTable();
    }
}

function closeModal() {
    if (window.manageStudentsManager) {
        window.manageStudentsManager.closeModal();
    }
}

function editStudent() {
    if (window.manageStudentsManager) {
        window.manageStudentsManager.editStudent();
    }
}

function closeConfirmModal() {
    if (window.manageStudentsManager) {
        window.manageStudentsManager.closeConfirmModal();
    }
}

function confirmAction() {
    if (window.manageStudentsManager) {
        window.manageStudentsManager.confirmAction();
    }
}

function downloadQR() {
    if (window.manageStudentsManager) {
        window.manageStudentsManager.downloadQR();
    }
}

function downloadBarcode() {
    if (window.manageStudentsManager) {
        window.manageStudentsManager.downloadBarcode();
    }
}

// Initialize
const manageStudentsManager = new ManageStudentsManager();
window.manageStudentsManager = manageStudentsManager;

console.log('🚀 Manage Students page loaded');