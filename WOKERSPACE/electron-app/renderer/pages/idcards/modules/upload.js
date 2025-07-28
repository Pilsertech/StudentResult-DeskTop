// filepath: d:\AAAAAA\StudentResult DeskTop\electron-app\renderer\pages\idcards\print-cards.js

class PrintCardsManager {
    constructor() {
        // Existing properties...
        this.templates = []; // Store available templates
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => this.setup());
        this.loadTemplates(); // Load templates for selection
    }

    loadTemplates() {
        // Fetch templates from the server or local storage
        fetch('/api/idcards/templates')
            .then(response => response.json())
            .then(data => {
                this.templates = data;
                this.populateTemplateSelector();
            });
    }

    populateTemplateSelector() {
        const templateSelector = document.getElementById('templateSelector');
        this.templates.forEach(template => {
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = template.name;
            templateSelector.appendChild(option);
        });
    }

    // Modify existing printJob to include template selection
    async printJob(jobId) {
        const selectedTemplateId = document.getElementById('templateSelector').value;
        // Use selectedTemplateId in the print logic...
    }

    // Other existing methods...
}

// Initialize
const printCardsManager = new PrintCardsManager();
window.printCardsManager = printCardsManager;