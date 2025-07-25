// Modern Generate ID Cards Page

class GenerateCardsManager {
    constructor() {
        this.selectedTemplate = 'student-basic';
        this.currentMode = 'single';
        this.students = [];
        this.classes = [];
        this.generatedCards = [];
        this.isLoading = false;
        this.currentStep = 1;
        this.selectionMode = 'individual';
        this.selectedStudents = new Set();
        this.selectedClass = null;
        this.allStudents = [];
        
        this.init();
    }
    
    init() {
        document.addEventListener('DOMContentLoaded', () => this.setup());
    }
    
    setup() {
        this.setupEventListeners();
        this.loadStudents();
        this.loadClasses();
        
        console.log('✅ Generate Cards Manager initialized');
    }
    
    setupEventListeners() {
        // Template selection
        document.querySelectorAll('.template-option').forEach(option => {
            option.addEventListener('click', () => this.selectTemplate(option.dataset.template));
        });
        
        // Mode tabs
        document.querySelectorAll('.mode-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchMode(tab.dataset.mode));
        });
        
        console.log('🎯 Event listeners setup');
    }
    
    selectTemplate(templateId) {
        // Update UI
        document.querySelectorAll('.template-option').forEach(opt => {
            opt.classList.remove('active');
        });
        document.querySelector(`[data-template="${templateId}"]`).classList.add('active');
        
        this.selectedTemplate = templateId;
        console.log('🎨 Template selected:', templateId);
    }
    
    switchMode(mode) {
        // Update tabs
        document.querySelectorAll('.mode-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        
        // Update forms
        document.querySelectorAll('.generation-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${mode}Form`).classList.add('active');
        
        this.currentMode = mode;
        console.log('📋 Mode switched to:', mode);
    }
    
    async loadStudents() {
        try {
            const response = await fetch('http://localhost:9000/students');
            const result = await response.json();
            
            if (result.success) {
                this.students = result.students || [];
                this.allStudents = result.students || [];
                this.populateStudentSelectors();
                console.log(`✅ Loaded ${this.students.length} students`);
            } else {
                throw new Error(result.message || 'Failed to load students');
            }
        } catch (error) {
            console.error('❌ Error loading students:', error);
            this.showMessage('Failed to load students', 'error');
        }
    }
    
    async loadClasses() {
        try {
            const response = await fetch('http://localhost:9000/classes');
            const result = await response.json();
            
            if (result.success) {
                this.classes = result.classes || [];
                this.populateClassSelector();
                console.log(`✅ Loaded ${this.classes.length} classes`);
            } else {
                throw new Error(result.message || 'Failed to load classes');
            }
        } catch (error) {
            console.error('❌ Error loading classes:', error);
            this.showMessage('Failed to load classes', 'error');
        }
    }
    
    populateStudentSelectors() {
        const singleSelect = document.getElementById('singleStudent');
        const bulkSelect = document.getElementById('bulkStudents');
        
        const activeStudents = this.students.filter(s => s.Status == 1);
        
        [singleSelect, bulkSelect].forEach(select => {
            if (select) {
                select.innerHTML = '<option value="">Select Student(s)</option>';
                activeStudents.forEach(student => {
                    const option = document.createElement('option');
                    option.value = student.StudentId;
                    option.textContent = `${student.StudentName} (${student.RollId}) - ${student.ClassName} ${student.Section}`;
                    select.appendChild(option);
                });
            }
        });
    }
    
    populateClassSelector() {
        const classSelect = document.getElementById('classSelect');
        
        if (classSelect) {
            classSelect.innerHTML = '<option value="">Select Class</option>';
            this.classes.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls.id;
                option.textContent = `${cls.ClassName} Section-${cls.Section}`;
                classSelect.appendChild(option);
            });
        }
    }
    
    async previewCards() {
        try {
            const data = this.getFormData();
            if (!data) return;
            
            this.setLoading(true);
            
            let previewData;
            
            switch (this.currentMode) {
                case 'single':
                    previewData = await this.previewSingleCard(data.studentId);
                    break;
                case 'class':
                    previewData = await this.previewClassCards(data.classId);
                    break;
                case 'bulk':
                    previewData = await this.previewBulkCards(data.studentIds);
                    break;
            }
            
            if (previewData) {
                this.displayPreview(previewData);
            }
            
        } catch (error) {
            console.error('❌ Preview error:', error);
            this.showMessage('Failed to generate preview', 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
    async generateCards() {
        if (!this.validateFinalGeneration()) {
            return;
        }
        
        this.showGenerationModal();
        
        try {
            const studentIds = Array.from(this.selectedStudents);
            
            console.log('🎨 Starting card generation...', {
                template: this.selectedTemplate,
                students: studentIds.length,
                options: this.generationOptions
            });
            
            // Update generation options
            this.updateGenerationOptions();
            
            // Show progress
            this.updateGenerationProgress(0, studentIds.length, 'Preparing generation...');
            
            const response = await fetch('http://localhost:9000/idcards/generate/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentIds: studentIds,
                    templateId: this.selectedTemplate,
                    options: this.generationOptions
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.handleGenerationSuccess(result);
            } else {
                this.handleGenerationError(result.message || 'Generation failed');
            }
            
        } catch (error) {
            console.error('❌ Generation error:', error);
            this.handleGenerationError('Connection error: ' + error.message);
        }
    }
    
    getFormData() {
        switch (this.currentMode) {
            case 'single':
                const studentId = document.getElementById('singleStudent').value;
                const includeQR = document.getElementById('singleQR').checked;
                
                if (!studentId) {
                    this.showMessage('Please select a student', 'error');
                    return null;
                }
                
                return { studentId, includeQR };
                
            case 'class':
                const classId = document.getElementById('classSelect').value;
                const classQR = document.getElementById('classQR').checked;
                
                if (!classId) {
                    this.showMessage('Please select a class', 'error');
                    return null;
                }
                
                return { classId, includeQR: classQR };
                
            case 'bulk':
                const bulkSelect = document.getElementById('bulkStudents');
                const studentIds = Array.from(bulkSelect.selectedOptions).map(opt => opt.value);
                const bulkQR = document.getElementById('bulkQR').checked;
                
                if (studentIds.length === 0) {
                    this.showMessage('Please select at least one student', 'error');
                    return null;
                }
                
                if (studentIds.length > 50) {
                    this.showMessage('Maximum 50 students can be selected at once', 'error');
                    return null;
                }
                
                return { studentIds, includeQR: bulkQR };
        }
        
        return null;
    }
    
    async generateSingleCard(studentId, includeQR) {
        const response = await fetch(`http://localhost:9000/idcards/generate/single/${studentId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                templateId: this.selectedTemplate,
                includeQR: includeQR
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            return [result.data];
        } else {
            throw new Error(result.message);
        }
    }
    
    async generateClassCards(classId, includeQR) {
        const response = await fetch(`http://localhost:9000/idcards/generate/class/${classId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                templateId: this.selectedTemplate,
                includeQR: includeQR
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            return result.data.cards;
        } else {
            throw new Error(result.message);
        }
    }
    
    async generateBulkCards(studentIds, includeQR) {
        const response = await fetch('http://localhost:9000/idcards/generate/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentIds: studentIds,
                templateId: this.selectedTemplate,
                includeQR: includeQR
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            return result.data.cards;
        } else {
            throw new Error(result.message);
        }
    }
    
    async previewSingleCard(studentId) {
        const response = await fetch(`http://localhost:9000/idcards/preview/${studentId}?templateId=${this.selectedTemplate}`);
        const result = await response.json();
        
        if (result.success) {
            return [result.data];
        } else {
            throw new Error(result.message);
        }
    }
    
    async previewClassCards(classId) {
        // Get students in class first
        const studentsInClass = this.students.filter(s => s.ClassId == classId && s.Status == 1);
        const studentIds = studentsInClass.map(s => s.StudentId);
        
        if (studentIds.length === 0) {
            throw new Error('No active students found in selected class');
        }
        
        return this.previewBulkCards(studentIds);
    }
    
    async previewBulkCards(studentIds) {
        const response = await fetch('http://localhost:9000/idcards/preview/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentIds: studentIds,
                templateId: this.selectedTemplate
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            return result.data.students.map(student => ({ student }));
        } else {
            throw new Error(result.message);
        }
    }
    
    displayPreview(previewData) {
        const previewSection = document.getElementById('previewSection');
        const previewContainer = document.getElementById('previewContainer');
        
        previewContainer.innerHTML = '';
        
        previewData.forEach(data => {
            const cardElement = this.createCardElement(data, true);
            previewContainer.appendChild(cardElement);
        });
        
        previewSection.style.display = 'block';
        previewSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    displayGeneratedCards(cardsData) {
        const generatedSection = document.getElementById('generatedSection');
        const cardsContainer = document.getElementById('cardsContainer');
        
        cardsContainer.innerHTML = '';
        
        cardsData.forEach(data => {
            const cardElement = this.createCardElement(data, false);
            cardsContainer.appendChild(cardElement);
        });
        
        generatedSection.style.display = 'block';
        generatedSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    createCardElement(cardData, isPreview = false) {
        const student = cardData.student;
        const cardDiv = document.createElement('div');
        cardDiv.className = 'id-card';
        
        const photoSection = student.photoUrl 
            ? `<img src="${student.photoUrl}" alt="${student.StudentName}">`
            : student.StudentName.charAt(0).toUpperCase();
        
        const qrSection = (!isPreview && cardData.qrCode) 
            ? `<div class="card-qr"><img src="${cardData.qrCode}" alt="QR Code"></div>`
            : '';
        
        cardDiv.innerHTML = `
            <div class="id-card-header">
                Student Result Management System
            </div>
            <div class="id-card-body">
                <div class="card-photo">
                    ${photoSection}
                </div>
                <div class="card-info">
                    <div class="student-name">${student.StudentName}</div>
                    <div class="student-details">
                        <div>Roll: ${student.RollId}</div>
                        <div>Class: ${student.classInfo}</div>
                        <div>Email: ${student.StudentEmail}</div>
                        ${student.formattedDOB ? `<div>DOB: ${student.formattedDOB}</div>` : ''}
                    </div>
                </div>
                ${qrSection}
            </div>
        `;
        
        return cardDiv;
    }
    
    async downloadCards() {
        if (this.generatedCards.length === 0) {
            this.showMessage('No cards to download', 'error');
            return;
        }
        
        try {
            this.setLoading(true);
            
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            
            const cardsPerPage = 8; // 4x2 layout
            let currentPage = 0;
            
            for (let i = 0; i < this.generatedCards.length; i++) {
                if (i % cardsPerPage === 0 && i > 0) {
                    pdf.addPage();
                    currentPage++;
                }
                
                const cardElement = document.querySelectorAll('.id-card')[i];
                const canvas = await html2canvas(cardElement, {
                    scale: 2,
                    backgroundColor: '#ffffff'
                });
                
                const imgData = canvas.toDataURL('image/png');
                const x = (i % 2) * 100 + 10;
                const y = Math.floor((i % cardsPerPage) / 2) * 60 + 20;
                
                pdf.addImage(imgData, 'PNG', x, y, 80, 50);
            }
            
            pdf.save(`student-id-cards-${new Date().getTime()}.pdf`);
            this.showMessage('PDF downloaded successfully!', 'success');
            
        } catch (error) {
            console.error('❌ Download error:', error);
            this.showMessage('Failed to download PDF', 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
    printCards() {
        if (this.generatedCards.length === 0) {
            this.showMessage('No cards to print', 'error');
            return;
        }
        
        const printWindow = window.open('', '_blank');
        const cardsHtml = document.getElementById('cardsContainer').innerHTML;
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>Student ID Cards</title>
                    <style>
                        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                        .id-card { margin: 10px; page-break-inside: avoid; }
                        /* Include necessary CSS for printing */
                    </style>
                </head>
                <body>
                    ${cardsHtml}
                </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
    }
    
    saveToQueue() {
        // Save to print queue functionality
        const queueData = {
            cards: this.generatedCards,
            template: this.selectedTemplate,
            generatedAt: new Date().toISOString(),
            mode: this.currentMode
        };
        
        localStorage.setItem(`id-cards-queue-${Date.now()}`, JSON.stringify(queueData));
        this.showMessage('Cards saved to print queue!', 'success');
    }
    
    closePreview() {
        document.getElementById('previewSection').style.display = 'none';
    }
    
    setLoading(loading) {
        this.isLoading = loading;
        const generateBtn = document.getElementById('generateBtn');
        
        if (loading) {
            generateBtn.disabled = true;
            generateBtn.classList.add('loading');
            generateBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Generating...';
        } else {
            generateBtn.disabled = false;
            generateBtn.classList.remove('loading');
            generateBtn.innerHTML = '<i class="fa fa-magic"></i> Generate Cards';
        }
    }
    
    updateProgressIndicator() {
        // Update step indicators
        document.querySelectorAll('.step-indicator').forEach((step, index) => {
            step.classList.toggle('active', index < this.currentStep);
        });
        
        // Update progress lines
        document.querySelectorAll('.progress-line').forEach((line, index) => {
            if (index < this.currentStep - 1) {
                line.classList.add('completed');
            } else {
                line.classList.remove('completed');
            }
        });
    }
    
    validateStep() {
        const nextBtn = document.getElementById('nextBtn');
        let isValid = false;
        
        switch (this.currentStep) {
            case 1:
                isValid = this.selectedTemplate !== null;
                document.getElementById('step1Status').className = isValid ? 'fa fa-check-circle' : 'fa fa-circle-o';
                break;
                
            case 2:
                isValid = this.selectedStudents.size > 0 || this.selectedClass !== null;
                document.getElementById('step2Status').className = isValid ? 'fa fa-check-circle' : 'fa fa-circle-o';
                break;
                
            case 3:
                isValid = true; // Options step is always valid
                document.getElementById('step3Status').className = isValid ? 'fa fa-check-circle' : 'fa fa-circle-o';
                this.updatePreview();
                break;
        }
        
        if (nextBtn) {
            nextBtn.disabled = !isValid;
        }
        
        return isValid;
    }
    
    updatePreview() {
        const previewContainer = document.getElementById('cardPreview');
        const refreshBtn = document.getElementById('refreshPreviewBtn');
        
        if (!this.selectedTemplate || this.selectedStudents.size === 0) {
            previewContainer.innerHTML = `
                <div class="preview-placeholder">
                    <i class="fa fa-id-card"></i>
                    <p>Select template and students to see preview</p>
                </div>
            `;
            refreshBtn.style.display = 'none';
            return;
        }
        
        // Show preview for first selected student
        const firstStudentId = Array.from(this.selectedStudents)[0];
        const student = this.allStudents.find(s => s.StudentId == firstStudentId);
        
        if (student) {
            this.generatePreviewCard(student);
            refreshBtn.style.display = 'inline-flex';
        }
    }
    
    generatePreviewCard(student) {
        const previewContainer = document.getElementById('cardPreview');
        
        // Create mock card preview
        previewContainer.innerHTML = `
            <div class="preview-card-container">
                <div class="preview-card-front">
                    <div class="card-template">
                        <div class="card-header">
                            <h3>STUDENT ID CARD</h3>
                        </div>
                        <div class="card-content">
                            <div class="student-photo">
                                ${student.PhotoPath ? 
                                    `<img src="http://localhost:9000/students/photos/${student.PhotoPath.split('/').pop()}" alt="${student.StudentName}">` :
                                    `<div class="photo-placeholder">${student.StudentName.charAt(0)}</div>`
                                }
                            </div>
                            <div class="student-info">
                                <h4>${student.StudentName}</h4>
                                <p>Roll: ${student.RollId}</p>
                                <p>Class: ${student.ClassName} ${student.Section}</p>
                                <p>ID: ${student.StudentId}</p>
                            </div>
                        </div>
                        <div class="card-footer">
                            <div class="barcode-area">
                                <canvas id="previewBarcode" width="150" height="40"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="preview-options">
                    <small>Preview for: ${student.StudentName}</small>
                </div>
            </div>
        `;
        
        // Generate preview barcode
        this.generatePreviewBarcode(student.RollId);
    }
    
    generatePreviewBarcode(rollId) {
        try {
            const canvas = document.getElementById('previewBarcode');
            if (canvas && typeof JsBarcode !== 'undefined') {
                JsBarcode(canvas, rollId, {
                    format: "CODE128",
                    width: 1,
                    height: 30,
                    displayValue: false,
                    margin: 0
                });
            }
        } catch (error) {
            console.warn('Could not generate preview barcode:', error);
        }
    }
    
    updateGenerationOptions() {
        this.generationOptions = {
            outputFormat: document.querySelector('input[name="outputFormat"]:checked')?.value || 'pdf',
            cardLayout: document.querySelector('input[name="cardLayout"]:checked')?.value || 'single',
            includeQR: document.getElementById('includeQR')?.checked || false,
            includeBarcodes: document.getElementById('includeBarcodes')?.checked || false,
            highQuality: document.getElementById('highQuality')?.checked || false
        };
        
        console.log('📝 Generation options updated:', this.generationOptions);
    }
    
    async generateCards() {
        if (!this.validateFinalGeneration()) {
            return;
        }
        
        this.showGenerationModal();
        
        try {
            const studentIds = Array.from(this.selectedStudents);
            
            console.log('🎨 Starting card generation...', {
                template: this.selectedTemplate,
                students: studentIds.length,
                options: this.generationOptions
            });
            
            // Update generation options
            this.updateGenerationOptions();
            
            // Show progress
            this.updateGenerationProgress(0, studentIds.length, 'Preparing generation...');
            
            const response = await fetch('http://localhost:9000/idcards/generate/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentIds: studentIds,
                    templateId: this.selectedTemplate,
                    options: this.generationOptions
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.handleGenerationSuccess(result);
            } else {
                this.handleGenerationError(result.message || 'Generation failed');
            }
            
        } catch (error) {
            console.error('❌ Generation error:', error);
            this.handleGenerationError('Connection error: ' + error.message);
        }
    }
    
    validateFinalGeneration() {
        if (!this.selectedTemplate) {
            this.showMessage('Please select a template', 'error');
            return false;
        }
        
        if (this.selectedStudents.size === 0) {
            this.showMessage('Please select at least one student', 'error');
            return false;
        }
        
        return true;
    }
    
    showGenerationModal() {
        const modal = document.getElementById('generationModal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    hideGenerationModal() {
        const modal = document.getElementById('generationModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    updateGenerationProgress(current, total, message) {
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        const progressTitle = document.getElementById('progressTitle');
        const progressMessage = document.getElementById('progressMessage');
        const currentCard = document.getElementById('currentCard');
        const totalCards = document.getElementById('totalCards');
        
        const percentage = Math.round((current / total) * 100);
        
        if (progressBar) {
            const circumference = 2 * Math.PI * 45; // radius = 45
            const offset = circumference - (percentage / 100) * circumference;
            progressBar.style.strokeDashoffset = offset;
        }
        
        if (progressText) progressText.textContent = percentage + '%';
        if (progressTitle) progressTitle.textContent = message;
        if (progressMessage) progressMessage.textContent = `Generating ID cards for selected students...`;
        if (currentCard) currentCard.textContent = current;
        if (totalCards) totalCards.textContent = total;
    }
    
    handleGenerationSuccess(result) {
        console.log('✅ Generation completed successfully:', result);
        
        this.updateGenerationProgress(
            result.results?.length || this.selectedStudents.size,
            this.selectedStudents.size,
            'Generation completed!'
        );
        
        setTimeout(() => {
            this.hideGenerationModal();
            this.showMessage(
                `Successfully generated ${result.results?.filter(r => r.success).length || this.selectedStudents.size} ID cards!`,
                'success'
            );
            
            // Optional: Download or view cards
            if (result.downloadUrl) {
                this.offerDownload(result.downloadUrl);
            }
            
            // Reset wizard
            setTimeout(() => {
                if (confirm('Cards generated successfully! Would you like to generate more cards?')) {
                    this.resetWizard();
                } else {
                    window.location.href = '../dashboard/dashboard.html';
                }
            }, 2000);
            
        }, 1500);
    }
    
    handleGenerationError(message) {
        console.error('❌ Generation failed:', message);
        
        setTimeout(() => {
            this.hideGenerationModal();
            this.showMessage('Generation failed: ' + message, 'error');
        }, 1000);
    }
    
    offerDownload(downloadUrl) {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `id-cards-${Date.now()}.zip`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    resetWizard() {
        this.currentStep = 1;
        this.selectedTemplate = null;
        this.selectedStudents.clear();
        this.selectedClass = null;
        this.selectionMode = 'individual';
        
        // Reset UI
        document.querySelectorAll('.template-option').forEach(el => {
            el.classList.remove('selected');
        });
        
        document.querySelectorAll('.student-card').forEach(el => {
            el.classList.remove('selected');
        });
        
        document.querySelectorAll('.class-card').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Reset form
        document.getElementById('studentSearch').value = '';
        document.getElementById('classFilter').value = '';
        document.getElementById('manualIds').value = '';
        
        this.updateSelectionSummary();
        this.updateStepVisibility();
        this.updateProgressIndicator();
        
        this.showMessage('Wizard reset. You can start generating new cards.', 'info');
        
        console.log('🔄 Wizard reset completed');
    }
    
    refreshPreview() {
        this.updatePreview();
        this.showMessage('Preview refreshed', 'info');
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
function previewCards() {
    if (window.generateCardsManager) {
        window.generateCardsManager.previewCards();
    }
}

function generateCards() {
    if (window.generateCardsManager) {
        window.generateCardsManager.generateCards();
    }
}

function closePreview() {
    if (window.generateCardsManager) {
        window.generateCardsManager.closePreview();
    }
}

function downloadCards() {
    if (window.generateCardsManager) {
        window.generateCardsManager.downloadCards();
    }
}

function printCards() {
    if (window.generateCardsManager) {
        window.generateCardsManager.printCards();
    }
}

function saveToQueue() {
    if (window.generateCardsManager) {
        window.generateCardsManager.saveToQueue();
    }
}

function closeMessageModal() {
    document.getElementById('messageModal').classList.remove('active');
}

function resetSelection() {
    if (window.generateCardsManager) {
        window.generateCardsManager.clearSelection();
    }
}

function refreshPreview() {
    if (window.generateCardsManager) {
        window.generateCardsManager.refreshPreview();
    }
}

function processManualIds() {
    if (window.generateCardsManager) {
        window.generateCardsManager.processManualIds();
    }
}

function nextStep() {
    if (window.generateCardsManager) {
        window.generateCardsManager.nextStep();
    }
}

function previousStep() {
    if (window.generateCardsManager) {
        window.generateCardsManager.previousStep();
    }
}

function showPreviewSide(side) {
    const frontCard = document.getElementById('frontPreviewCard');
    const backCard = document.getElementById('backPreviewCard');
    const tabs = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    if (side === 'front') {
        frontCard.style.display = 'block';
        backCard.style.display = 'none';
    } else {
        frontCard.style.display = 'none';
        backCard.style.display = 'block';
    }
}

function closePreviewModal() {
    document.getElementById('previewModal').classList.remove('active');
    document.body.style.overflow = '';
}

function saveTemplateFromPreview() {
    closePreviewModal();
    if (window.generateCardsManager) {
        window.generateCardsManager.generateCards();
    }
}

// Initialize
const generateCardsManager = new GenerateCardsManager();
window.generateCardsManager = generateCardsManager;

console.log('🚀 Generate Cards page loaded');
