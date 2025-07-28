// filepath: d:\AAAAAA\StudentResult DeskTop\electron-app\renderer\pages\idcards\print-cards.js

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
        // Add event listeners for template integration
        document.getElementById('generateCardsBtn').addEventListener('click', this.generateCardsFromTemplate.bind(this));
    }

    async generateCardsFromTemplate() {
        // Call the new template editor function to generate cards
        const templateId = this.getSelectedTemplateId();
        if (templateId) {
            const cardsData = await window.generateCardsManager.generateBulkCards(templateId);
            this.displayGeneratedCards(cardsData);
        } else {
            this.showMessage('Please select a template first.', 'error');
        }
    }

    // Other existing methods...
}

// Global functions for onclick handlers
function printAll() {
    if (window.printCardsManager) { /* existing logic */ }
}

function clearCompleted() {
    if (window.printCardsManager) { /* existing logic */ }
}

// Initialize
const printCardsManager = new PrintCardsManager();
window.printCardsManager = printCardsManager;

console.log('🚀 Print Cards page loaded');