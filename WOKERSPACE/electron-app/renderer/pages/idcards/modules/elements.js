// In print-cards.js
// Add a function to handle template selection
function selectTemplate(templateId) {
    if (window.templateEditorCore) {
        window.templateEditorCore.selectTemplate(templateId);
    }
}

// Update the print job creation to include template data
async function createPrintJob(cardData) {
    const templateId = cardData.templateId; // Assuming cardData has a templateId
    await selectTemplate(templateId);
    // Proceed with the print job creation
}