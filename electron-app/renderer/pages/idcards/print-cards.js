// Print Cards Management System

class PrintCardsManager {
    constructor() {
        this.printQueue = [];
        this.currentPreview = null;
        this.printSettings = {
            pageSize: 'a4',
            orientation: 'portrait',
            cardsPerPage: 6,
            quality: 'normal',
            copies: 1,
            includeMargins: true,
            cropMarks: false,
            colorMode: true
        };
        
        this.init();
    }
    
    init() {
        document.addEventListener('DOMContentLoaded', () => this.setup());
    }
    
    setup() {
        this.messageArea = document.getElementById('messageArea');
        this.queueList = document.getElementById('queueList');
        this.emptyQueue = document.getElementById('emptyQueue');
        
        this.setupEventListeners();
        this.loadPrintQueue();
        this.loadPrintSettings();
        this.updateStats();
        
        console.log('✅ Print Cards Manager initialized');
    }
    
    setupEventListeners() {
        // Print settings changes
        const settingsInputs = ['pageSize', 'orientation', 'cardsPerPage', 'quality', 'copies', 
                               'includeMargins', 'cropMarks', 'colorMode'];
        
        settingsInputs.forEach(inputId => {
            const element = document.getElementById(inputId);
            if (element) {
                element.addEventListener('change', () => this.updatePrintSettings());
            }
        });
        
        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterQueue());
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
    
    loadPrintQueue() {
        try {
            // Load from localStorage (saved from generate-cards page)
            const savedQueues = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('id-cards-queue-')) {
                    const queueData = JSON.parse(localStorage.getItem(key));
                    queueData.id = key;
                    queueData.status = queueData.status || 'pending';
                    queueData.timestamp = queueData.generatedAt || new Date().toISOString();
                    savedQueues.push(queueData);
                }
            }
            
            // Sort by timestamp (newest first)
            this.printQueue = savedQueues.sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
            );
            
            this.renderQueue();
            console.log(`✅ Loaded ${this.printQueue.length} print jobs`);
            
        } catch (error) {
            console.error('❌ Error loading print queue:', error);
            this.showMessage('Failed to load print queue', 'error');
        }
    }
    
    renderQueue() {
        if (this.printQueue.length === 0) {
            this.queueList.style.display = 'none';
            this.emptyQueue.style.display = 'block';
            return;
        }
        
        this.queueList.style.display = 'block';
        this.emptyQueue.style.display = 'none';
        
        this.queueList.innerHTML = '';
        
        this.printQueue.forEach((job, index) => {
            const jobElement = this.createQueueItem(job, index);
            this.queueList.appendChild(jobElement);
        });
        
        this.updateStats();
    }
    
    createQueueItem(job, index) {
        const div = document.createElement('div');
        div.className = `queue-item ${job.status || 'pending'} fade-in`;
        
        const cardCount = job.cards ? job.cards.length : 0;
        const pageCount = Math.ceil(cardCount / this.printSettings.cardsPerPage);
        const formatTime = (timestamp) => new Date(timestamp).toLocaleString();
        
        div.innerHTML = `
            <div class="queue-header">
                <div class="queue-title">
                    <i class="fa fa-file-o"></i>
                    Print Job #${index + 1}
                </div>
                <span class="queue-status ${job.status || 'pending'}">${job.status || 'pending'}</span>
            </div>
            
            <div class="queue-details">
                <div class="queue-info">
                    <strong>${cardCount}</strong> Cards
                </div>
                <div class="queue-info">
                    <strong>${pageCount}</strong> Pages
                </div>
                <div class="queue-info">
                    <strong>${job.template || 'Unknown'}</strong> Template
                </div>
                <div class="queue-info">
                    ${formatTime(job.timestamp)}
                </div>
            </div>
            
            <div class="queue-actions">
                <button class="btn btn-outline" onclick="printCardsManager.previewJob('${job.id}')" title="Preview">
                    <i class="fa fa-eye"></i>
                </button>
                <button class="btn btn-primary" onclick="printCardsManager.printJob('${job.id}')" title="Print">
                    <i class="fa fa-print"></i>
                </button>
                <button class="btn btn-secondary" onclick="printCardsManager.downloadJob('${job.id}')" title="Download">
                    <i class="fa fa-download"></i>
                </button>
                <button class="btn btn-outline" onclick="printCardsManager.viewJobDetails('${job.id}')" title="Details">
                    <i class="fa fa-info"></i>
                </button>
                <button class="btn btn-outline" onclick="printCardsManager.removeJob('${job.id}')" title="Remove">
                    <i class="fa fa-trash"></i>
                </button>
            </div>
        `;
        
        return div;
    }
    
    updatePrintSettings() {
        this.printSettings = {
            pageSize: document.getElementById('pageSize').value,
            orientation: document.getElementById('orientation').value,
            cardsPerPage: parseInt(document.getElementById('cardsPerPage').value),
            quality: document.getElementById('quality').value,
            copies: parseInt(document.getElementById('copies').value),
            includeMargins: document.getElementById('includeMargins').checked,
            cropMarks: document.getElementById('cropMarks').checked,
            colorMode: document.getElementById('colorMode').checked
        };
        
        // Save settings
        localStorage.setItem('print-settings', JSON.stringify(this.printSettings));
        
        // Update preview if visible
        if (this.currentPreview) {
            this.generatePreview(this.currentPreview);
        }
        
        // Recalculate page counts for all jobs
        this.renderQueue();
        
        console.log('⚙️ Print settings updated', this.printSettings);
    }
    
    loadPrintSettings() {
        try {
            const saved = localStorage.getItem('print-settings');
            if (saved) {
                const settings = JSON.parse(saved);
                Object.assign(this.printSettings, settings);
                
                // Apply to form
                Object.keys(this.printSettings).forEach(key => {
                    const element = document.getElementById(key);
                    if (element) {
                        if (element.type === 'checkbox') {
                            element.checked = this.printSettings[key];
                        } else {
                            element.value = this.printSettings[key];
                        }
                    }
                });
            }
        } catch (error) {
            console.warn('Could not load print settings:', error);
        }
    }
    
    async previewJob(jobId) {
        const job = this.printQueue.find(j => j.id === jobId);
        if (!job) return;
        
        this.currentPreview = job;
        this.generatePreview(job);
        
        const previewCard = document.getElementById('previewCard');
        previewCard.style.display = 'block';
        previewCard.scrollIntoView({ behavior: 'smooth' });
    }
    
    generatePreview(job) {
        const previewContainer = document.getElementById('previewContainer');
        if (!previewContainer) return;
        
        const { cardsPerPage, pageSize, orientation } = this.printSettings;
        const cards = job.cards || [];
        const totalPages = Math.ceil(cards.length / cardsPerPage);
        
        previewContainer.innerHTML = '';
        
        for (let pageNum = 0; pageNum < totalPages; pageNum++) {
            const pageDiv = document.createElement('div');
            pageDiv.className = `print-page ${pageSize} ${orientation}`;
            
            const startIndex = pageNum * cardsPerPage;
            const endIndex = Math.min(startIndex + cardsPerPage, cards.length);
            const pageCards = cards.slice(startIndex, endIndex);
            
            // Calculate grid layout
            const cols = cardsPerPage === 4 ? 2 : cardsPerPage === 6 ? 2 : cardsPerPage === 9 ? 3 : 3;
            const rows = Math.ceil(cardsPerPage / cols);
            
            pageDiv.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
            pageDiv.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
            
            pageCards.forEach(cardData => {
                const cardElement = this.createPrintCard(cardData);
                pageDiv.appendChild(cardElement);
            });
            
            previewContainer.appendChild(pageDiv);
        }
    }
    
    createPrintCard(cardData) {
        const student = cardData.student;
        const cardDiv = document.createElement('div');
        cardDiv.className = 'print-id-card';
        cardDiv.style.cssText = `
            width: 200px;
            height: 125px;
            background: white;
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 10px;
            display: flex;
            flex-direction: column;
            font-size: 0.7rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin: 5px;
        `;
        
        const photoSection = student.photoUrl 
            ? `<img src="${student.photoUrl}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">`
            : `<div style="width: 40px; height: 40px; border-radius: 50%; background: #ccc; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${student.StudentName.charAt(0)}</div>`;
        
        const qrSection = cardData.qrCode 
            ? `<img src="${cardData.qrCode}" style="width: 30px; height: 30px;">`
            : '';
        
        cardDiv.innerHTML = `
            <div style="background: #3498db; color: white; text-align: center; padding: 2px; font-size: 0.6rem; font-weight: bold; margin: -10px -10px 5px -10px;">
                STUDENT ID CARD
            </div>
            <div style="display: flex; gap: 10px; align-items: center; flex: 1;">
                ${photoSection}
                <div style="flex: 1;">
                    <div style="font-weight: bold; font-size: 0.8rem;">${student.StudentName}</div>
                    <div>Roll: ${student.RollId}</div>
                    <div>Class: ${student.classInfo || 'N/A'}</div>
                </div>
                <div style="align-self: flex-end;">
                    ${qrSection}
                </div>
            </div>
        `;
        
        return cardDiv;
    }
    
    async printJob(jobId) {
        const job = this.printQueue.find(j => j.id === jobId);
        if (!job) return;
        
        try {
            // Update job status
            job.status = 'processing';
            this.updateJobInStorage(job);
            this.renderQueue();
            
            // Generate print content
            await this.generatePreview(job);
            
            // Trigger print
            setTimeout(() => {
                window.print();
                
                // Update status after print
                setTimeout(() => {
                    job.status = 'completed';
                    job.printedAt = new Date().toISOString();
                    this.updateJobInStorage(job);
                    this.renderQueue();
                    this.showMessage('Print job completed successfully!', 'success');
                }, 1000);
            }, 500);
            
        } catch (error) {
            console.error('❌ Print error:', error);
            job.status = 'failed';
            job.error = error.message;
            this.updateJobInStorage(job);
            this.renderQueue();
            this.showMessage('Print job failed: ' + error.message, 'error');
        }
    }
    
    async downloadJob(jobId) {
        const job = this.printQueue.find(j => j.id === jobId);
        if (!job) return;
        
        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: this.printSettings.orientation,
                unit: 'mm',
                format: this.printSettings.pageSize
            });
            
            const cards = job.cards || [];
            const { cardsPerPage } = this.printSettings;
            const totalPages = Math.ceil(cards.length / cardsPerPage);
            
            for (let pageNum = 0; pageNum < totalPages; pageNum++) {
                if (pageNum > 0) pdf.addPage();
                
                const startIndex = pageNum * cardsPerPage;
                const endIndex = Math.min(startIndex + cardsPerPage, cards.length);
                const pageCards = cards.slice(startIndex, endIndex);
                
                // Add cards to PDF page
                for (let i = 0; i < pageCards.length; i++) {
                    const card = pageCards[i];
                    const x = (i % 2) * 100 + 10;
                    const y = Math.floor(i / 2) * 60 + 20;
                    
                    // Create temporary card element for conversion
                    const cardElement = this.createPrintCard(card);
                    document.body.appendChild(cardElement);
                    
                    const canvas = await html2canvas(cardElement, {
                        scale: 2,
                        backgroundColor: '#ffffff'
                    });
                    
                    const imgData = canvas.toDataURL('image/png');
                    pdf.addImage(imgData, 'PNG', x, y, 80, 50);
                    
                    document.body.removeChild(cardElement);
                }
            }
            
            const filename = `student-id-cards-${job.id.split('-').pop()}.pdf`;
            pdf.save(filename);
            
            this.showMessage('PDF downloaded successfully!', 'success');
            
        } catch (error) {
            console.error('❌ Download error:', error);
            this.showMessage('Failed to download PDF: ' + error.message, 'error');
        }
    }
    
    viewJobDetails(jobId) {
        const job = this.printQueue.find(j => j.id === jobId);
        if (!job) return;
        
        const modal = document.getElementById('printJobModal');
        const body = document.getElementById('printJobBody');
        const reprintBtn = document.getElementById('reprintBtn');
        
        reprintBtn.setAttribute('data-job-id', jobId);
        
        const cardCount = job.cards ? job.cards.length : 0;
        const pageCount = Math.ceil(cardCount / this.printSettings.cardsPerPage);
        
        body.innerHTML = `
            <div class="job-details">
                <div class="detail-item">
                    <span class="detail-label">Job ID:</span>
                    <span class="detail-value">${job.id}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value">
                        <span class="queue-status ${job.status || 'pending'}">${job.status || 'pending'}</span>
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Template:</span>
                    <span class="detail-value">${job.template || 'Unknown'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Generation Mode:</span>
                    <span class="detail-value">${job.mode || 'Unknown'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Card Count:</span>
                    <span class="detail-value">${cardCount} cards</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Page Count:</span>
                    <span class="detail-value">${pageCount} pages</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Generated:</span>
                    <span class="detail-value">${new Date(job.timestamp).toLocaleString()}</span>
                </div>
                ${job.printedAt ? `
                <div class="detail-item">
                    <span class="detail-label">Printed:</span>
                    <span class="detail-value">${new Date(job.printedAt).toLocaleString()}</span>
                </div>
                ` : ''}
                ${job.error ? `
                <div class="detail-item">
                    <span class="detail-label">Error:</span>
                    <span class="detail-value" style="color: #e74c3c;">${job.error}</span>
                </div>
                ` : ''}
            </div>
        `;
        
        modal.classList.add('active');
    }
    
    removeJob(jobId) {
        const confirmed = confirm('Are you sure you want to remove this print job?');
        if (!confirmed) return;
        
        try {
            localStorage.removeItem(jobId);
            this.printQueue = this.printQueue.filter(job => job.id !== jobId);
            this.renderQueue();
            this.showMessage('Print job removed successfully', 'success');
            
        } catch (error) {
            console.error('❌ Error removing job:', error);
            this.showMessage('Failed to remove print job', 'error');
        }
    }
    
    clearCompleted() {
        const confirmed = confirm('Are you sure you want to clear all completed jobs?');
        if (!confirmed) return;
        
        try {
            const completedJobs = this.printQueue.filter(job => job.status === 'completed');
            
            completedJobs.forEach(job => {
                localStorage.removeItem(job.id);
            });
            
            this.printQueue = this.printQueue.filter(job => job.status !== 'completed');
            this.renderQueue();
            this.showMessage(`Cleared ${completedJobs.length} completed job(s)`, 'success');
            
        } catch (error) {
            console.error('❌ Error clearing completed jobs:', error);
            this.showMessage('Failed to clear completed jobs', 'error');
        }
    }
    
    clearAll() {
        const confirmed = confirm('Are you sure you want to clear all print jobs? This action cannot be undone.');
        if (!confirmed) return;
        
        try {
            this.printQueue.forEach(job => {
                localStorage.removeItem(job.id);
            });
            
            this.printQueue = [];
            this.renderQueue();
            this.showMessage('All print jobs cleared', 'success');
            
        } catch (error) {
            console.error('❌ Error clearing all jobs:', error);
            this.showMessage('Failed to clear all jobs', 'error');
        }
    }
    
    printAll() {
        const pendingJobs = this.printQueue.filter(job => job.status === 'pending');
        
        if (pendingJobs.length === 0) {
            this.showMessage('No pending jobs to print', 'info');
            return;
        }
        
        const confirmed = confirm(`Are you sure you want to print all ${pendingJobs.length} pending job(s)?`);
        if (!confirmed) return;
        
        // Process jobs sequentially
        let currentIndex = 0;
        
        const printNext = () => {
            if (currentIndex >= pendingJobs.length) {
                this.showMessage('All jobs printed successfully!', 'success');
                return;
            }
            
            const job = pendingJobs[currentIndex];
            this.printJob(job.id);
            
            setTimeout(() => {
                currentIndex++;
                printNext();
            }, 2000);
        };
        
        printNext();
    }
    
    filterQueue() {
        const statusFilter = document.getElementById('statusFilter');
        const filterValue = statusFilter.value;
        
        const items = document.querySelectorAll('.queue-item');
        
        items.forEach(item => {
            if (!filterValue || item.classList.contains(filterValue)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    updateJobInStorage(job) {
        try {
            localStorage.setItem(job.id, JSON.stringify(job));
            
            // Update in memory array
            const index = this.printQueue.findIndex(j => j.id === job.id);
            if (index !== -1) {
                this.printQueue[index] = job;
            }
            
        } catch (error) {
            console.error('❌ Error updating job in storage:', error);
        }
    }
    
    updateStats() {
        const total = this.printQueue.length;
        const totalCards = this.printQueue.reduce((sum, job) => sum + (job.cards?.length || 0), 0);
        const totalPages = this.printQueue.reduce((sum, job) => {
            const cardCount = job.cards?.length || 0;
            return sum + Math.ceil(cardCount / this.printSettings.cardsPerPage);
        }, 0);
        
        document.getElementById('queueCount').textContent = total;
        document.getElementById('cardCount').textContent = totalCards;
        document.getElementById('pageCount').textContent = totalPages;
    }
    
    closePreview() {
        document.getElementById('previewCard').style.display = 'none';
        this.currentPreview = null;
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
function printAll() {
    if (window.printCardsManager) {
        window.printCardsManager.printAll();
    }
}

function clearCompleted() {
    if (window.printCardsManager) {
        window.printCardsManager.clearCompleted();
    }
}

function clearAll() {
    if (window.printCardsManager) {
        window.printCardsManager.clearAll();
    }
}

function closePreview() {
    if (window.printCardsManager) {
        window.printCardsManager.closePreview();
    }
}

function adjustLayout() {
    // Open print settings for layout adjustment
    const settingsCard = document.querySelector('.print-options-card');
    settingsCard.scrollIntoView({ behavior: 'smooth' });
}

function downloadPDF() {
    if (window.printCardsManager && window.printCardsManager.currentPreview) {
        window.printCardsManager.downloadJob(window.printCardsManager.currentPreview.id);
    }
}

function sendToPrinter() {
    if (window.printCardsManager && window.printCardsManager.currentPreview) {
        window.printCardsManager.printJob(window.printCardsManager.currentPreview.id);
    }
}

function closePrintJobModal() {
    document.getElementById('printJobModal').classList.remove('active');
}

function reprintJob() {
    const btn = document.getElementById('reprintBtn');
    const jobId = btn.getAttribute('data-job-id');
    
    if (window.printCardsManager && jobId) {
        window.printCardsManager.printJob(jobId);
        closePrintJobModal();
    }
}

function closePrinterModal() {
    document.getElementById('printerModal').classList.remove('active');
}

function savePrinterSettings() {
    // Save printer settings logic here
    closePrinterModal();
    
    if (window.printCardsManager) {
        window.printCardsManager.showMessage('Printer settings saved successfully!', 'success');
    }
}

// Initialize
const printCardsManager = new PrintCardsManager();
window.printCardsManager = printCardsManager;

console.log('🚀 Print Cards page loaded');
