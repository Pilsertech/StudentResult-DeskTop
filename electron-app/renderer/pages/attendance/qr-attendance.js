// QR Code Attendance System

class QRAttendanceManager {
    constructor() {
        this.classes = [];
        this.sessions = [];
        this.scanner = null;
        this.isScanning = false;
        this.currentQRData = null;
        this.scanResults = [];
        this.successCount = 0;
        this.failureCount = 0;
        
        this.init();
    }
    
    init() {
        document.addEventListener('DOMContentLoaded', () => this.setup());
    }
    
    setup() {
        this.messageArea = document.getElementById('messageArea');
        this.resultsList = document.getElementById('resultsList');
        this.emptyResults = document.getElementById('emptyResults');
        
        this.loadClasses();
        this.loadSessions();
        this.setupEventListeners();
        
        console.log('✅ QR Attendance Manager initialized');
    }
    
    setupEventListeners() {
        // QR code generation
        document.getElementById('generateBtn').addEventListener('click', () => this.generateClassQR());
        
        // Scanner controls
        document.getElementById('startBtn').addEventListener('click', () => this.startScanner());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopScanner());
        document.getElementById('switchBtn').addEventListener('click', () => this.switchCamera());
        
        console.log('🎯 Event listeners setup');
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
        }
    }
    
    async generateClassQR() {
        const classId = document.getElementById('classSelect').value;
        const sessionId = document.getElementById('sessionSelect').value;
        
        if (!classId || !sessionId) {
            this.showMessage('Please select both class and session', 'error');
            return;
        }
        
        try {
            console.log('📱 Generating QR code...');
            
            const response = await fetch(`http://localhost:9000/attendance/qr/generate/${classId}/${sessionId}`);
            const result = await response.json();
            
            if (result.success) {
                this.currentQRData = result.data;
                this.displayQRCode(result.data);
                this.showMessage('QR Code generated successfully!', 'success');
                console.log('✅ QR Code generated');
            } else {
                this.showMessage('Failed to generate QR code: ' + result.message, 'error');
            }
            
        } catch (error) {
            console.error('❌ Error generating QR code:', error);
            this.showMessage('Error generating QR code', 'error');
        }
    }
    
    displayQRCode(qrData) {
        const qrOutput = document.getElementById('qrOutput');
        const qrCodeDisplay = document.getElementById('qrCodeDisplay');
        const qrInfo = document.getElementById('qrInfo');
        
        qrCodeDisplay.innerHTML = `<img src="${qrData.qrCode}" alt="Class QR Code">`;
        
        qrInfo.innerHTML = `
            <h4>Class QR Code Details</h4>
            <p><strong>Class:</strong> ${qrData.classInfo.ClassName} Section-${qrData.classInfo.Section}</p>
            <p><strong>Session:</strong> ${qrData.sessionInfo.SessionName}</p>
            <p><strong>Time:</strong> ${qrData.sessionInfo.StartTime} - ${qrData.sessionInfo.EndTime}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Valid Until:</strong> ${new Date(qrData.qrData.validUntil).toLocaleString()}</p>
        `;
        
        qrOutput.style.display = 'block';
    }
    
    async startScanner() {
        try {
            console.log('📷 Starting QR scanner...');
            
            // Request camera permission
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            
            const video = document.getElementById('qrVideo');
            video.srcObject = stream;
            
            this.isScanning = true;
            this.updateScannerUI(true);
            this.updateScannerStatus(true);
            
            // Start QR detection
            this.detectQRCodes(video);
            
            console.log('✅ QR scanner started');
            
        } catch (error) {
            console.error('❌ Error starting scanner:', error);
            this.showMessage('Error accessing camera: ' + error.message, 'error');
        }
    }
    
    stopScanner() {
        if (this.scanner) {
            this.scanner.getTracks().forEach(track => track.stop());
            this.scanner = null;
        }
        
        const video = document.getElementById('qrVideo');
        if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }
        
        this.isScanning = false;
        this.updateScannerUI(false);
        this.updateScannerStatus(false);
        
        console.log('🛑 QR scanner stopped');
    }
    
    switchCamera() {
        if (this.isScanning) {
            this.stopScanner();
            setTimeout(() => this.startScanner(), 500);
        }
    }
    
    detectQRCodes(video) {
        // This is a simplified QR detection
        // In a real implementation, you would use instascan.js or jsQR
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        const scanFrame = () => {
            if (!this.isScanning) return;
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0);
            
            // Simulate QR detection for demo
            // In real implementation, use jsQR or instascan
            this.simulateQRDetection();
            
            setTimeout(scanFrame, 100);
        };
        
        video.addEventListener('loadeddata', () => {
            scanFrame();
        });
    }
    
    simulateQRDetection() {
        // This simulates QR detection for demo purposes
        // Replace with actual QR scanning library
        if (Math.random() < 0.02) { // 2% chance per frame
            const mockQRData = this.generateMockStudentQR();
            this.processQRScan(JSON.stringify(mockQRData));
        }
    }
    
    generateMockStudentQR() {
        const studentIds = [1, 2, 3, 4, 5, 9, 10, 11, 12];
        const studentId = studentIds[Math.floor(Math.random() * studentIds.length)];
        
        return {
            type: 'student',
            studentId: studentId,
            studentName: `Student ${studentId}`,
            rollId: `STU${studentId.toString().padStart(3, '0')}`,
            classId: 1,
            timestamp: new Date().toISOString()
        };
    }
    
    async processQRScan(qrData) {
        try {
            let studentData;
            
            try {
                studentData = JSON.parse(qrData);
            } catch (parseError) {
                this.addScanResult('Invalid QR Code', 'Invalid QR format', 'error');
                return;
            }
            
            if (studentData.type !== 'student') {
                this.addScanResult('Invalid QR Code', 'Not a student QR code', 'error');
                return;
            }
            
            // Mark attendance via API
            const response = await fetch('http://localhost:9000/attendance/mark/qr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    qrData: qrData,
                    location: 'QR Scanner'
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.addScanResult(
                    studentData.studentName,
                    `Roll: ${studentData.rollId} • Status: ${result.data.status}`,
                    'success'
                );
                this.successCount++;
            } else {
                this.addScanResult(
                    studentData.studentName || 'Unknown',
                    result.message,
                    'error'
                );
                this.failureCount++;
            }
            
            this.updateStats();
            
        } catch (error) {
            console.error('❌ Error processing QR scan:', error);
            this.addScanResult('Scan Error', 'Failed to process QR code', 'error');
            this.failureCount++;
            this.updateStats();
        }
    }
    
    addScanResult(student, details, type) {
        const resultItem = document.createElement('div');
        resultItem.className = `result-item ${type} fade-in`;
        
        resultItem.innerHTML = `
            <div class="result-info">
                <div class="result-student">${student}</div>
                <div class="result-details">${details}</div>
            </div>
            <div class="result-status ${type}">${type === 'success' ? 'Success' : 'Failed'}</div>
            <div class="result-time">${new Date().toLocaleTimeString()}</div>
        `;
        
        // Hide empty state
        this.emptyResults.style.display = 'none';
        
        // Add to top of list
        this.resultsList.insertBefore(resultItem, this.resultsList.firstChild);
        
        // Keep only last 20 results
        while (this.resultsList.children.length > 21) { // +1 for empty state
            this.resultsList.removeChild(this.resultsList.lastChild);
        }
        
        // Show flash message
        if (type === 'success') {
            this.showMessage(`✅ ${student} marked successfully`, 'success');
        } else {
            this.showMessage(`❌ Failed: ${details}`, 'error');
        }
    }
    
    updateScannerUI(scanning) {
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        const switchBtn = document.getElementById('switchBtn');
        const scannerMessage = document.getElementById('scannerMessage');
        
        if (scanning) {
            startBtn.style.display = 'none';
            stopBtn.style.display = 'inline-flex';
            switchBtn.style.display = 'inline-flex';
            scannerMessage.textContent = 'Scanning for QR codes...';
        } else {
            startBtn.style.display = 'inline-flex';
            stopBtn.style.display = 'none';
            switchBtn.style.display = 'none';
            scannerMessage.textContent = 'Click "Start Scanner" to begin';
        }
    }
    
    updateScannerStatus(online) {
        const scannerStatus = document.getElementById('scannerStatus');
        const indicator = scannerStatus.querySelector('.status-indicator');
        const text = scannerStatus.querySelector('span');
        
        if (online) {
            indicator.className = 'status-indicator online';
            text.textContent = 'Scanner Online';
        } else {
            indicator.className = 'status-indicator offline';
            text.textContent = 'Scanner Offline';
        }
    }
    
    updateStats() {
        document.getElementById('successCount').textContent = this.successCount;
        document.getElementById('failureCount').textContent = this.failureCount;
    }
    
    downloadQR() {
        if (!this.currentQRData) return;
        
        const link = document.createElement('a');
        link.download = `qr-attendance-${Date.now()}.png`;
        link.href = this.currentQRData.qrCode;
        link.click();
        
        console.log('💾 QR Code downloaded');
    }
    
    printQR() {
        if (!this.currentQRData) return;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head><title>Attendance QR Code</title></head>
                <body style="text-align: center; padding: 50px;">
                    <h2>Attendance QR Code</h2>
                    <p>Class: ${this.currentQRData.classInfo.ClassName} Section-${this.currentQRData.classInfo.Section}</p>
                    <p>Session: ${this.currentQRData.sessionInfo.SessionName}</p>
                    <p>Date: ${new Date().toLocaleDateString()}</p>
                    <img src="${this.currentQRData.qrCode}" style="max-width: 400px;">
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
        
        console.log('🖨️ QR Code sent to printer');
    }
    
    shareQR() {
        if (!this.currentQRData) return;
        
        if (navigator.share) {
            navigator.share({
                title: 'Attendance QR Code',
                text: `QR Code for ${this.currentQRData.classInfo.ClassName} attendance`,
                url: this.currentQRData.qrCode
            });
        } else {
            // Copy to clipboard fallback
            navigator.clipboard.writeText(this.currentQRData.qrCode).then(() => {
                this.showMessage('QR Code URL copied to clipboard', 'info');
            });
        }
        
        console.log('📤 QR Code shared');
    }
    
    toggleScanner() {
        if (this.isScanning) {
            this.stopScanner();
        } else {
            this.startScanner();
        }
        
        // Update header button
        const toggleIcon = document.getElementById('scannerToggleIcon');
        const toggleText = document.getElementById('scannerToggleText');
        
        if (this.isScanning) {
            toggleIcon.className = 'fa fa-stop';
            toggleText.textContent = 'Stop Scanner';
        } else {
            toggleIcon.className = 'fa fa-camera';
            toggleText.textContent = 'Start Scanner';
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
        
        // Auto-hide messages
        setTimeout(() => {
            this.messageArea.innerHTML = '';
        }, 5000);
    }
}

// Global functions for onclick handlers
function generateClassQR() {
    if (window.qrAttendanceManager) {
        window.qrAttendanceManager.generateClassQR();
    }
}

function downloadQR() {
    if (window.qrAttendanceManager) {
        window.qrAttendanceManager.downloadQR();
    }
}

function printQR() {
    if (window.qrAttendanceManager) {
        window.qrAttendanceManager.printQR();
    }
}

function shareQR() {
    if (window.qrAttendanceManager) {
        window.qrAttendanceManager.shareQR();
    }
}

function startScanner() {
    if (window.qrAttendanceManager) {
        window.qrAttendanceManager.startScanner();
    }
}

function stopScanner() {
    if (window.qrAttendanceManager) {
        window.qrAttendanceManager.stopScanner();
    }
}

function switchCamera() {
    if (window.qrAttendanceManager) {
        window.qrAttendanceManager.switchCamera();
    }
}

function toggleScanner() {
    if (window.qrAttendanceManager) {
        window.qrAttendanceManager.toggleScanner();
    }
}

// Initialize
const qrAttendanceManager = new QRAttendanceManager();
window.qrAttendanceManager = qrAttendanceManager;

console.log('🚀 QR Attendance page loaded');
