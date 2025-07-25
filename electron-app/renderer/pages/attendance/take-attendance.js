// Take Attendance System with QR & Fingerprint Support

class TakeAttendanceManager {
    constructor() {
        this.classes = [];
        this.sessions = [];
        this.students = [];
        this.currentAttendance = new Map();
        this.currentMethod = 'manual';
        this.selectedClass = null;
        this.selectedSession = null;
        this.selectedDate = null;
        this.qrScanner = null;
        this.fingerprintActive = false;
        
        this.init();
    }
    
    init() {
        document.addEventListener('DOMContentLoaded', () => this.setup());
    }
    
    setup() {
        this.setupEventListeners();
        this.loadClasses();
        this.loadSessions();
        this.updateCurrentDate();
        this.setupMethodTabs();
        
        console.log('✅ Take Attendance Manager initialized');
    }
    
    setupEventListeners() {
        // Method tab switching
        document.querySelectorAll('.method-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const method = e.target.dataset.method;
                this.switchMethod(method);
            });
        });
        
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
    
    updateCurrentDate() {
        const now = new Date();
        const dateString = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        document.getElementById('currentDate').textContent = dateString;
        
        // Set default date
        const today = now.toISOString().split('T')[0];
        const dateInput = document.getElementById('attendanceDate');
        if (dateInput) {
            dateInput.value = today;
            this.selectedDate = today;
        }
    }
    
    async loadClasses() {
        try {
            const response = await fetch('http://localhost:9000/classes');
            const result = await response.json();
            
            if (result.success && result.classes) {
                this.classes = result.classes;
                this.populateClassSelect();
                console.log(`✅ Loaded ${this.classes.length} classes`);
            }
        } catch (error) {
            console.error('❌ Error loading classes:', error);
            this.showMessage('Failed to load classes', 'error');
        }
    }
    
    async loadSessions() {
        try {
            const response = await fetch('http://localhost:9000/attendance/sessions');
            const result = await response.json();
            
            if (result.success && result.sessions) {
                this.sessions = result.sessions;
                this.populateSessionSelect();
                console.log(`✅ Loaded ${this.sessions.length} sessions`);
            }
        } catch (error) {
            console.error('❌ Error loading sessions:', error);
            this.showMessage('Failed to load sessions', 'error');
        }
    }
    
    populateClassSelect() {
        const classSelect = document.getElementById('classSelect');
        if (!classSelect) return;
        
        classSelect.innerHTML = '<option value="">Select Class</option>';
        
        this.classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = `${cls.ClassName} Section-${cls.Section}`;
            classSelect.appendChild(option);
        });
    }
    
    populateSessionSelect() {
        const sessionSelect = document.getElementById('sessionSelect');
        if (!sessionSelect) return;
        
        sessionSelect.innerHTML = '<option value="">Select Session</option>';
        
        this.sessions.forEach(session => {
            const option = document.createElement('option');
            option.value = session.id;
            option.textContent = `${session.SessionName} (${session.StartTime} - ${session.EndTime})`;
            sessionSelect.appendChild(option);
        });
        
        // Auto-select first session
        if (this.sessions.length > 0) {
            sessionSelect.value = this.sessions[0].id;
            this.selectedSession = this.sessions[0].id;
        }
    }
    
    setupMethodTabs() {
        // Initially hide methods card
        document.getElementById('methodsCard').style.display = 'none';
    }
    
    switchMethod(method) {
        this.currentMethod = method;
        
        // Update tab states
        document.querySelectorAll('.method-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-method="${method}"]`).classList.add('active');
        
        // Show/hide content
        document.querySelectorAll('.method-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${method}-content`).classList.add('active');
        
        // Stop any active scanners
        this.stopQRScanner();
        this.stopFingerprintScanner();
        
        console.log('📋 Switched to method:', method);
    }
    
    async loadStudents() {
        const classId = document.getElementById('classSelect').value;
        const sessionId = document.getElementById('sessionSelect').value;
        const date = document.getElementById('attendanceDate').value;
        
        if (!classId || !sessionId || !date) {
            this.showMessage('Please select class, session, and date', 'error');
            return;
        }
        
        this.selectedClass = classId;
        this.selectedSession = sessionId;
        this.selectedDate = date;
        
        try {
            console.log('📥 Loading students for class:', classId);
            
            const response = await fetch(`http://localhost:9000/attendance/class/${classId}/date/${date}`);
            const result = await response.json();
            
            if (result.success) {
                this.students = result.data;
                this.renderStudents();
                this.showMethodsCard();
                this.updateStats();
                console.log(`✅ Loaded ${this.students.length} students`);
            } else {
                this.showMessage('Failed to load students: ' + result.message, 'error');
            }
            
        } catch (error) {
            console.error('❌ Error loading students:', error);
            this.showMessage('Error loading students', 'error');
        }
    }
    
    renderStudents() {
        const studentsList = document.getElementById('studentsList');
        if (!studentsList) return;
        
        studentsList.innerHTML = '';
        
        this.students.forEach(student => {
            const studentElement = this.createStudentElement(student);
            studentsList.appendChild(studentElement);
        });
        
        // Also populate fingerprint and bulk selects
        this.populateFingerprintSelect();
        this.renderBulkStudents();
    }
    
    createStudentElement(student) {
        const div = document.createElement('div');
        div.className = 'student-item fade-in';
        div.dataset.studentId = student.StudentId;
        
        const photoSection = student.photoUrl 
            ? `<img src="${student.photoUrl}" alt="${student.StudentName}" class="student-photo">`
            : `<div class="student-photo-placeholder">${student.StudentName.charAt(0)}</div>`;
        
        const currentStatus = student.Status || 'Absent';
        
        div.innerHTML = `
            ${photoSection}
            <div class="student-info">
                <h4>${student.StudentName}</h4>
                <div class="student-details">
                    Roll: ${student.RollId} | 
                    ${student.isMarked ? `Marked: ${student.CheckInTime || 'N/A'}` : 'Not marked'}
                    ${student.Method ? ` via ${student.Method}` : ''}
                </div>
            </div>
            <div class="attendance-controls">
                <button class="status-btn present ${currentStatus === 'Present' ? 'active' : ''}" 
                        onclick="takeAttendanceManager.markStudentStatus(${student.StudentId}, 'Present')">
                    Present
                </button>
                <button class="status-btn absent ${currentStatus === 'Absent' ? 'active' : ''}" 
                        onclick="takeAttendanceManager.markStudentStatus(${student.StudentId}, 'Absent')">
                    Absent
                </button>
                <button class="status-btn late ${currentStatus === 'Late' ? 'active' : ''}" 
                        onclick="takeAttendanceManager.markStudentStatus(${student.StudentId}, 'Late')">
                    Late
                </button>
                <button class="status-btn excused ${currentStatus === 'Excused' ? 'active' : ''}" 
                        onclick="takeAttendanceManager.markStudentStatus(${student.StudentId}, 'Excused')">
                    Excused
                </button>
            </div>
        `;
        
        return div;
    }
    
    async markStudentStatus(studentId, status) {
        try {
            const response = await fetch('http://localhost:9000/attendance/mark', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: studentId,
                    classId: this.selectedClass,
                    sessionId: this.selectedSession,
                    status: status,
                    remarks: ''
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Update student status in memory
                const student = this.students.find(s => s.StudentId == studentId);
                if (student) {
                    student.Status = status;
                    student.isMarked = true;
                    student.Method = 'Manual';
                    student.CheckInTime = status === 'Present' || status === 'Late' ? 
                        new Date().toTimeString().split(' ')[0] : null;
                }
                
                // Update UI
                this.updateStudentUI(studentId, status);
                this.updateStats();
                
                console.log(`✅ Marked student ${studentId} as ${status}`);
                
            } else {
                this.showMessage('Failed to mark attendance: ' + result.message, 'error');
            }
            
        } catch (error) {
            console.error('❌ Error marking attendance:', error);
            this.showMessage('Error marking attendance', 'error');
        }
    }
    
    updateStudentUI(studentId, status) {
        const studentElement = document.querySelector(`[data-student-id="${studentId}"]`);
        if (!studentElement) return;
        
        // Update button states
        const buttons = studentElement.querySelectorAll('.status-btn');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.trim() === status) {
                btn.classList.add('active');
            }
        });
        
        // Update student details
        const detailsElement = studentElement.querySelector('.student-details');
        const student = this.students.find(s => s.StudentId == studentId);
        if (student && detailsElement) {
            detailsElement.innerHTML = `
                Roll: ${student.RollId} | 
                Marked: ${student.CheckInTime || 'N/A'} via ${student.Method || 'Manual'}
            `;
        }
    }
    
    updateStats() {
        const stats = {
            present: 0,
            absent: 0,
            late: 0,
            excused: 0
        };
        
        this.students.forEach(student => {
            const status = (student.Status || 'Absent').toLowerCase();
            if (stats.hasOwnProperty(status)) {
                stats[status]++;
            }
        });
        
        document.getElementById('presentCount').textContent = stats.present;
        document.getElementById('absentCount').textContent = stats.absent;
        document.getElementById('lateCount').textContent = stats.late;
        document.getElementById('excusedCount').textContent = stats.excused;
    }
    
    showMethodsCard() {
        document.getElementById('methodsCard').style.display = 'block';
    }
    
    markAllPresent() {
        this.students.forEach(student => {
            if (!student.isMarked) {
                this.markStudentStatus(student.StudentId, 'Present');
            }
        });
    }
    
    markAllAbsent() {
        this.students.forEach(student => {
            if (!student.isMarked) {
                this.markStudentStatus(student.StudentId, 'Absent');
            }
        });
    }
    
    // QR Code Methods
    async generateQRCode() {
        if (!this.selectedClass || !this.selectedSession) {
            this.showMessage('Please select class and session first', 'error');
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:9000/attendance/qr/generate/${this.selectedClass}/${this.selectedSession}`);
            const result = await response.json();
            
            if (result.success) {
                this.displayQRCode(result.data);
                console.log('📱 QR Code generated successfully');
            } else {
                this.showMessage('Failed to generate QR code: ' + result.message, 'error');
            }
            
        } catch (error) {
            console.error('❌ Error generating QR code:', error);
            this.showMessage('Error generating QR code', 'error');
        }
    }
    
    displayQRCode(qrData) {
        const qrDisplay = document.getElementById('qrDisplay');
        const qrCodeImage = document.getElementById('qrCodeImage');
        
        qrCodeImage.innerHTML = `<img src="${qrData.qrCode}" alt="Attendance QR Code">`;
        qrDisplay.style.display = 'block';
    }
    
    startQRScanner() {
        const video = document.getElementById('qrVideo');
        const startBtn = document.getElementById('startScanBtn');
        const stopBtn = document.getElementById('stopScanBtn');
        
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(stream => {
                video.srcObject = stream;
                this.qrScanner = stream;
                
                startBtn.style.display = 'none';
                stopBtn.style.display = 'inline-flex';
                
                // Start QR detection (simplified - in real implementation use instascan.js)
                this.detectQRCode(video);
                
                console.log('📷 QR Scanner started');
            })
            .catch(error => {
                console.error('❌ Error starting camera:', error);
                this.showMessage('Error accessing camera', 'error');
            });
    }
    
    stopQRScanner() {
        if (this.qrScanner) {
            this.qrScanner.getTracks().forEach(track => track.stop());
            this.qrScanner = null;
        }
        
        const video = document.getElementById('qrVideo');
        const startBtn = document.getElementById('startScanBtn');
        const stopBtn = document.getElementById('stopScanBtn');
        
        video.srcObject = null;
        startBtn.style.display = 'inline-flex';
        stopBtn.style.display = 'none';
        
        console.log('🛑 QR Scanner stopped');
    }
    
    detectQRCode(video) {
        // Simplified QR detection - in real implementation use instascan.js
        setTimeout(() => {
            if (this.qrScanner) {
                // Simulate QR code detection for demo
                this.detectQRCode(video);
            }
        }, 100);
    }
    
    // Fingerprint Methods
    startFingerprintScanner() {
        const fpStatus = document.getElementById('fpStatus');
        const fpProgressBar = document.getElementById('fpProgressBar');
        const startBtn = document.getElementById('startFpBtn');
        const stopBtn = document.getElementById('stopFpBtn');
        const studentSelect = document.getElementById('fpStudentSelect');
        
        this.fingerprintActive = true;
        
        startBtn.style.display = 'none';
        stopBtn.style.display = 'inline-flex';
        studentSelect.style.display = 'block';
        
        // Simulate fingerprint scanning
        let progress = 0;
        const interval = setInterval(() => {
            if (!this.fingerprintActive) {
                clearInterval(interval);
                return;
            }
            
            progress += 5;
            fpProgressBar.style.width = progress + '%';
            
            if (progress >= 100) {
                clearInterval(interval);
                this.processFingerprintScan();
            }
        }, 100);
        
        console.log('👆 Fingerprint scanner started');
    }
    
    stopFingerprintScanner() {
        this.fingerprintActive = false;
        
        const fpProgressBar = document.getElementById('fpProgressBar');
        const startBtn = document.getElementById('startFpBtn');
        const stopBtn = document.getElementById('stopFpBtn');
        const studentSelect = document.getElementById('fpStudentSelect');
        
        fpProgressBar.style.width = '0%';
        startBtn.style.display = 'inline-flex';
        stopBtn.style.display = 'none';
        studentSelect.style.display = 'none';
        
        console.log('🛑 Fingerprint scanner stopped');
    }
    
    processFingerprintScan() {
        // Simulate successful fingerprint scan
        this.showMessage('Fingerprint scanned successfully! Please select student.', 'success');
    }
    
    async confirmFingerprintAttendance() {
        const studentId = document.getElementById('fingerprintStudent').value;
        
        if (!studentId) {
            this.showMessage('Please select a student', 'error');
            return;
        }
        
        try {
            const response = await fetch('http://localhost:9000/attendance/mark/fingerprint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: studentId,
                    classId: this.selectedClass,
                    fingerprintData: 'demo_fingerprint_data',
                    location: 'Classroom'
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.addToFingerprintLog(studentId, result.data.status);
                this.markStudentStatus(studentId, result.data.status);
                this.stopFingerprintScanner();
                
                console.log('👆 Fingerprint attendance confirmed');
            } else {
                this.showMessage('Failed to mark fingerprint attendance: ' + result.message, 'error');
            }
            
        } catch (error) {
            console.error('❌ Error confirming fingerprint:', error);
            this.showMessage('Error confirming fingerprint attendance', 'error');
        }
    }
    
    populateFingerprintSelect() {
        const select = document.getElementById('fingerprintStudent');
        if (!select) return;
        
        select.innerHTML = '<option value="">Select Student</option>';
        
        this.students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.StudentId;
            option.textContent = `${student.StudentName} (${student.RollId})`;
            select.appendChild(option);
        });
    }
    
    addToFingerprintLog(studentId, status) {
        const student = this.students.find(s => s.StudentId == studentId);
        if (!student) return;
        
        const logList = document.getElementById('fpLogList');
        if (!logList) return;
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${status === 'Present' ? 'success' : 'warning'}`;
        
        logEntry.innerHTML = `
            <div class="log-info">
                <div class="log-student">${student.StudentName}</div>
                <div class="log-details">Roll: ${student.RollId} • Status: ${status}</div>
            </div>
            <div class="log-time">${new Date().toLocaleTimeString()}</div>
        `;
        
        logList.insertBefore(logEntry, logList.firstChild);
        
        // Keep only last 10 entries
        while (logList.children.length > 10) {
            logList.removeChild(logList.lastChild);
        }
    }
    
    // Bulk Methods
    renderBulkStudents() {
        const bulkGrid = document.getElementById('bulkStudentsGrid');
        if (!bulkGrid) return;
        
        bulkGrid.innerHTML = '';
        
        this.students.forEach(student => {
            const studentElement = this.createBulkStudentElement(student);
            bulkGrid.appendChild(studentElement);
        });
    }
    
    createBulkStudentElement(student) {
        const div = document.createElement('div');
        div.className = 'bulk-student-item';
        div.dataset.studentId = student.StudentId;
        
        const currentStatus = student.Status || 'Absent';
        
        div.innerHTML = `
            <div class="bulk-student-info">
                <div class="bulk-student-name">${student.StudentName}</div>
                <div class="bulk-student-details">Roll: ${student.RollId}</div>
            </div>
            <select class="bulk-status-select" onchange="takeAttendanceManager.updateBulkStatus(${student.StudentId}, this.value)">
                <option value="Present" ${currentStatus === 'Present' ? 'selected' : ''}>Present</option>
                <option value="Absent" ${currentStatus === 'Absent' ? 'selected' : ''}>Absent</option>
                <option value="Late" ${currentStatus === 'Late' ? 'selected' : ''}>Late</option>
                <option value="Excused" ${currentStatus === 'Excused' ? 'selected' : ''}>Excused</option>
            </select>
        `;
        
        return div;
    }
    
    updateBulkStatus(studentId, status) {
        const student = this.students.find(s => s.StudentId == studentId);
        if (student) {
            student.Status = status;
            student.isMarked = true;
        }
    }
    
    applyBulkStatus() {
        const bulkStatus = document.getElementById('bulkStatus').value;
        
        document.querySelectorAll('.bulk-status-select select').forEach(select => {
            select.value = bulkStatus;
            const studentId = select.closest('[data-student-id]').dataset.studentId;
            this.updateBulkStatus(studentId, bulkStatus);
        });
        
        this.showMessage(`Applied ${bulkStatus} status to all students`, 'success');
    }
    
    async saveBulkAttendance() {
        const studentsData = this.students.map(student => ({
            studentId: student.StudentId,
            status: student.Status || 'Absent',
            remarks: ''
        }));
        
        try {
            const response = await fetch('http://localhost:9000/attendance/mark/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    classId: this.selectedClass,
                    sessionId: this.selectedSession,
                    students: studentsData
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showMessage('Bulk attendance saved successfully!', 'success');
                this.loadStudents(); // Refresh data
                console.log('📊 Bulk attendance saved');
            } else {
                this.showMessage('Failed to save bulk attendance: ' + result.message, 'error');
            }
            
        } catch (error) {
            console.error('❌ Error saving bulk attendance:', error);
            this.showMessage('Error saving bulk attendance', 'error');
        }
    }
    
    resetBulkEntry() {
        this.students.forEach(student => {
            student.Status = 'Absent';
            student.isMarked = false;
        });
        
        this.renderBulkStudents();
        this.showMessage('Bulk entry reset', 'info');
    }
    
    downloadQR() {
        const qrImage = document.querySelector('#qrCodeImage img');
        if (!qrImage) return;
        
        const link = document.createElement('a');
        link.download = `attendance-qr-${this.selectedClass}-${new Date().toISOString().split('T')[0]}.png`;
        link.href = qrImage.src;
        link.click();
        
        console.log('💾 QR Code downloaded');
    }
    
    printQR() {
        const qrImage = document.querySelector('#qrCodeImage img');
        if (!qrImage) return;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head><title>Attendance QR Code</title></head>
                <body style="text-align: center; padding: 50px;">
                    <h2>Attendance QR Code</h2>
                    <p>Class: ${this.selectedClass} | Date: ${this.selectedDate}</p>
                    <img src="${qrImage.src}" style="max-width: 300px;">
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
        
        console.log('🖨️ QR Code sent to printer');
    }
    
    refreshAttendance() {
        if (this.selectedClass && this.selectedSession && this.selectedDate) {
            this.loadStudents();
            this.showMessage('Attendance data refreshed', 'info');
        } else {
            this.showMessage('Please select class, session and date first', 'error');
        }
    }
    
    showMessage(message, type = 'info') {
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
        
        // Create floating notification
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} fade-in`;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 30px;
            z-index: 9999;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            max-width: 400px;
        `;
        
        const colors = {
            success: { bg: '#d4edda', color: '#155724', border: '#28a745' },
            error: { bg: '#f8d7da', color: '#721c24', border: '#dc3545' },
            info: { bg: '#d1ecf1', color: '#0c5460', border: '#17a2b8' }
        };
        
        const style = colors[type] || colors.info;
        notification.style.background = style.bg;
        notification.style.color = style.color;
        notification.style.borderLeft = `4px solid ${style.border}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
    
    closeMessageModal() {
        document.getElementById('messageModal').classList.remove('active');
    }
}

// Global functions for onclick handlers
function loadStudents() {
    if (window.takeAttendanceManager) {
        window.takeAttendanceManager.loadStudents();
    }
}

function refreshAttendance() {
    if (window.takeAttendanceManager) {
        window.takeAttendanceManager.refreshAttendance();
    }
}

function markAllPresent() {
    if (window.takeAttendanceManager) {
        window.takeAttendanceManager.markAllPresent();
    }
}

function markAllAbsent() {
    if (window.takeAttendanceManager) {
        window.takeAttendanceManager.markAllAbsent();
    }
}

function generateQRCode() {
    if (window.takeAttendanceManager) {
        window.takeAttendanceManager.generateQRCode();
    }
}

function downloadQR() {
    if (window.takeAttendanceManager) {
        window.takeAttendanceManager.downloadQR();
    }
}

function printQR() {
    if (window.takeAttendanceManager) {
        window.takeAttendanceManager.printQR();
    }
}

function startQRScanner() {
    if (window.takeAttendanceManager) {
        window.takeAttendanceManager.startQRScanner();
    }
}

function stopQRScanner() {
    if (window.takeAttendanceManager) {
        window.takeAttendanceManager.stopQRScanner();
    }
}

function startFingerprintScanner() {
    if (window.takeAttendanceManager) {
        window.takeAttendanceManager.startFingerprintScanner();
    }
}

function stopFingerprintScanner() {
    if (window.takeAttendanceManager) {
        window.takeAttendanceManager.stopFingerprintScanner();
    }
}

function confirmFingerprintAttendance() {
    if (window.takeAttendanceManager) {
        window.takeAttendanceManager.confirmFingerprintAttendance();
    }
}

function applyBulkStatus() {
    if (window.takeAttendanceManager) {
        window.takeAttendanceManager.applyBulkStatus();
    }
}

function saveBulkAttendance() {
    if (window.takeAttendanceManager) {
        window.takeAttendanceManager.saveBulkAttendance();
    }
}

function resetBulkEntry() {
    if (window.takeAttendanceManager) {
        window.takeAttendanceManager.resetBulkEntry();
    }
}

function closeMessageModal() {
    if (window.takeAttendanceManager) {
        window.takeAttendanceManager.closeMessageModal();
    }
}

// Initialize
const takeAttendanceManager = new TakeAttendanceManager();
window.takeAttendanceManager = takeAttendanceManager;

console.log('🚀 Take Attendance page loaded');
