// Manage Attendance System

class ManageAttendanceManager {
    constructor() {
        this.dataTable = null;
        this.attendance = [];
        this.classes = [];
        this.sessions = [];
        this.currentRecord = null;
        this.pendingAction = null;
        
        this.init();
    }
    
    init() {
        document.addEventListener('DOMContentLoaded', () => this.setup());
    }
    
    setup() {
        this.messageArea = document.getElementById('messageArea');
        this.classFilter = document.getElementById('classFilter');
        this.dateFilter = document.getElementById('dateFilter');
        this.statusFilter = document.getElementById('statusFilter');
        this.sessionFilter = document.getElementById('sessionFilter');
        
        this.setupEventListeners();
        this.loadClasses();
        this.loadSessions();
        this.setDefaultDate();
        this.loadAttendanceData();
        
        console.log('✅ Manage Attendance Manager initialized');
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
        
        console.log('🎯 Event listeners setup');
    }
    
    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        this.dateFilter.value = today;
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
    
    async loadSessions() {
        try {
            const response = await fetch('http://localhost:9000/attendance/sessions');
            const result = await response.json();
            
            if (result.success && result.sessions) {
                this.sessions = result.sessions;
                this.populateSessionFilter();
            }
        } catch (error) {
            console.warn('Could not load sessions:', error);
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
    
    populateSessionFilter() {
        this.sessionFilter.innerHTML = '<option value="">All Sessions</option>';
        
        this.sessions.forEach(session => {
            const option = document.createElement('option');
            option.value = session.id;
            option.textContent = `${session.SessionName}`;
            this.sessionFilter.appendChild(option);
        });
    }
    
    async loadAttendanceData() {
        try {
            console.log('📚 Loading attendance data...');
            this.showTableLoading();
            
            // Build query parameters
            const params = new URLSearchParams();
            
            if (this.classFilter.value) {
                params.append('classId', this.classFilter.value);
            }
            if (this.dateFilter.value) {
                params.append('date', this.dateFilter.value);
            }
            if (this.statusFilter.value) {
                params.append('status', this.statusFilter.value);
            }
            if (this.sessionFilter.value) {
                params.append('sessionId', this.sessionFilter.value);
            }
            
            const response = await fetch(`http://localhost:9000/attendance/today?${params.toString()}`);
            const result = await response.json();
            
            if (result.success) {
                this.attendance = result.data || [];
                this.renderTable();
                this.updateStats();
                console.log(`✅ Loaded ${this.attendance.length} attendance records`);
            } else {
                throw new Error(result.message || 'Failed to load attendance');
            }
            
        } catch (error) {
            console.error('❌ Error loading attendance:', error);
            this.showMessage('Failed to load attendance data: ' + error.message, 'error');
            this.showTableError();
        }
    }
    
    renderTable() {
        const tableBody = document.querySelector('#attendanceTable tbody');
        
        if (!tableBody) {
            console.error('Table body not found');
            return;
        }
        
        // Destroy existing DataTable
        if (this.dataTable) {
            this.dataTable.destroy();
        }
        
        tableBody.innerHTML = '';
        
        this.attendance.forEach((record, index) => {
            const row = this.createAttendanceRow(record, index + 1);
            tableBody.appendChild(row);
        });
        
        // Initialize DataTable
        this.initializeDataTable();
    }
    
    createAttendanceRow(record, serialNumber) {
        const row = document.createElement('tr');
        row.className = 'fade-in';
        
        // Format data
        const attendanceDate = this.formatDate(record.AttendanceDate);
        const checkInTime = record.CheckInTime || '-';
        const statusClass = record.Status.toLowerCase();
        const classInfo = `${record.ClassName} (${record.Section})`;
        
        row.innerHTML = `
            <td>${serialNumber}</td>
            <td>
                <span class="student-name">${record.StudentName}</span>
            </td>
            <td>
                <span class="roll-id">${record.RollId}</span>
            </td>
            <td class="class-info">${classInfo}</td>
            <td class="attendance-date">${attendanceDate}</td>
            <td class="session-name">${record.SessionName || 'Morning'}</td>
            <td>
                <span class="status-badge ${statusClass}">${record.Status}</span>
            </td>
            <td class="check-in-time">${checkInTime}</td>
            <td class="method">${record.Method || 'Manual'}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn btn-edit" onclick="manageAttendanceManager.editAttendance('${record.StudentId}', '${record.AttendanceDate}')" title="Edit Attendance">
                        <i class="fa fa-edit"></i>
                    </button>
                    <button class="action-btn btn-delete" onclick="manageAttendanceManager.deleteAttendance('${record.StudentId}', '${record.AttendanceDate}')" title="Delete Record">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        return row;
    }
    
    initializeDataTable() {
        this.dataTable = $('#attendanceTable').DataTable({
            responsive: true,
            pageLength: 25,
            lengthMenu: [10, 25, 50, 100],
            order: [[1, 'asc']], // Sort by student name
            columnDefs: [
                { orderable: false, targets: [9] }, // Actions column
                { searchable: false, targets: [0, 9] } // Serial and Actions
            ],
            language: {
                search: "Search attendance:",
                lengthMenu: "Show _MENU_ records per page",
                info: "Showing _START_ to _END_ of _TOTAL_ records",
                infoEmpty: "No attendance records found",
                infoFiltered: "(filtered from _MAX_ total records)",
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
        this.loadAttendanceData();
    }
    
    updateStats() {
        const stats = {
            present: 0,
            absent: 0,
            late: 0,
            excused: 0
        };
        
        this.attendance.forEach(record => {
            const status = record.Status.toLowerCase();
            if (stats.hasOwnProperty(status)) {
                stats[status]++;
            }
        });
        
        document.getElementById('presentCount').textContent = stats.present;
        document.getElementById('absentCount').textContent = stats.absent;
        document.getElementById('lateCount').textContent = stats.late;
        document.getElementById('excusedCount').textContent = stats.excused;
    }
    
    async editAttendance(studentId, attendanceDate) {
        try {
            // Find the record
            this.currentRecord = this.attendance.find(r => 
                r.StudentId == studentId && r.AttendanceDate === attendanceDate
            );
            
            if (!this.currentRecord) {
                this.showMessage('Attendance record not found', 'error');
                return;
            }
            
            this.displayEditModal(this.currentRecord);
            
        } catch (error) {
            console.error('Error loading attendance for edit:', error);
            this.showMessage('Error loading attendance details', 'error');
        }
    }
    
    displayEditModal(record) {
        const modalBody = document.getElementById('editStudentInfo');
        const editForm = document.getElementById('editAttendanceForm');
        
        // Set hidden fields
        document.getElementById('editAttendanceId').value = record.id || '';
        document.getElementById('editStudentId').value = record.StudentId;
        
        // Display student info
        modalBody.innerHTML = `
            <h4>${record.StudentName}</h4>
            <p><strong>Roll ID:</strong> ${record.RollId}</p>
            <p><strong>Class:</strong> ${record.ClassName} Section-${record.Section}</p>
            <p><strong>Date:</strong> ${this.formatDate(record.AttendanceDate)}</p>
            <p><strong>Current Method:</strong> ${record.Method || 'Manual'}</p>
        `;
        
        // Set current status
        const statusRadio = document.querySelector(`input[name="editStatus"][value="${record.Status}"]`);
        if (statusRadio) statusRadio.checked = true;
        
        // Set check-in time
        document.getElementById('editCheckIn').value = record.CheckInTime || '';
        
        // Set remarks
        document.getElementById('editRemarks').value = record.Remarks || '';
        
        this.showModal('editModal');
    }
    
    async saveAttendanceEdit() {
        try {
            const form = document.getElementById('editAttendanceForm');
            const formData = new FormData(form);
            
            const studentId = formData.get('editStudentId');
            const status = formData.get('editStatus');
            const checkInTime = formData.get('editCheckIn');
            const remarks = formData.get('editRemarks');
            
            if (!status) {
                this.showMessage('Please select an attendance status', 'error');
                return;
            }
            
            const response = await fetch('http://localhost:9000/attendance/mark', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: studentId,
                    classId: this.currentRecord.ClassId,
                    sessionId: this.currentRecord.SessionId || 1,
                    status: status,
                    checkInTime: checkInTime,
                    remarks: remarks
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showMessage('Attendance updated successfully!', 'success');
                this.closeEditModal();
                this.loadAttendanceData(); // Refresh table
            } else {
                this.showMessage(result.message || 'Failed to update attendance', 'error');
            }
            
        } catch (error) {
            console.error('Error updating attendance:', error);
            this.showMessage('Error updating attendance', 'error');
        }
    }
    
    deleteAttendance(studentId, attendanceDate) {
        this.pendingAction = {
            type: 'delete',
            studentId: studentId,
            attendanceDate: attendanceDate
        };
        
        const record = this.attendance.find(r => 
            r.StudentId == studentId && r.AttendanceDate === attendanceDate
        );
        
        const studentName = record ? record.StudentName : 'this student';
        
        this.showConfirmModal(
            `Are you sure you want to delete the attendance record for ${studentName} on ${this.formatDate(attendanceDate)}?`
        );
    }
    
    async confirmAction() {
        if (!this.pendingAction) return;
        
        try {
            this.closeConfirmModal();
            
            if (this.pendingAction.type === 'delete') {
                // For demo purposes, we'll use the mark attendance API with 'Absent' status
                // In a real system, you'd have a delete endpoint
                const response = await fetch('http://localhost:9000/attendance/mark', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        studentId: this.pendingAction.studentId,
                        classId: 1, // Default class
                        sessionId: 1, // Default session
                        status: 'Absent',
                        remarks: 'Record deleted'
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    this.showMessage('Attendance record deleted successfully', 'success');
                    this.loadAttendanceData(); // Refresh table
                } else {
                    this.showMessage(result.message || 'Delete failed', 'error');
                }
            }
        } catch (error) {
            console.error('Action failed:', error);
            this.showMessage('Action failed: ' + error.message, 'error');
        } finally {
            this.pendingAction = null;
        }
    }
    
    refreshData() {
        this.loadAttendanceData();
        this.showMessage('Attendance data refreshed', 'info');
    }
    
    showTableLoading() {
        const tableBody = document.querySelector('#attendanceTable tbody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="10" class="table-loading">
                        <i class="fa fa-spinner"></i>
                        <div>Loading attendance data...</div>
                    </td>
                </tr>
            `;
        }
    }
    
    showTableError() {
        const tableBody = document.querySelector('#attendanceTable tbody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center; padding: 50px; color: #e74c3c;">
                        <i class="fa fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                        <div>Failed to load attendance data</div>
                        <button onclick="manageAttendanceManager.refreshData()" style="margin-top: 10px; padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
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
    
    closeEditModal() {
        document.getElementById('editModal').classList.remove('active');
        document.body.style.overflow = '';
        this.currentRecord = null;
    }
    
    showConfirmModal(message) {
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
        this.currentRecord = null;
        this.pendingAction = null;
    }
    
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        
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
function refreshData() {
    if (window.manageAttendanceManager) {
        window.manageAttendanceManager.refreshData();
    }
}

function applyFilters() {
    if (window.manageAttendanceManager) {
        window.manageAttendanceManager.applyFilters();
    }
}

function closeEditModal() {
    if (window.manageAttendanceManager) {
        window.manageAttendanceManager.closeEditModal();
    }
}

function saveAttendanceEdit() {
    if (window.manageAttendanceManager) {
        window.manageAttendanceManager.saveAttendanceEdit();
    }
}

function closeConfirmModal() {
    if (window.manageAttendanceManager) {
        window.manageAttendanceManager.closeConfirmModal();
    }
}

function confirmAction() {
    if (window.manageAttendanceManager) {
        window.manageAttendanceManager.confirmAction();
    }
}

// Initialize
const manageAttendanceManager = new ManageAttendanceManager();
window.manageAttendanceManager = manageAttendanceManager;

console.log('🚀 Manage Attendance page loaded');
