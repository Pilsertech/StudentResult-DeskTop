// Add this function to fetch the current template data
async function fetchCurrentTemplateData() {
    if (window.templateEditorCore) {
        const templateData = await window.templateEditorCore.getCurrentTemplate();
        return templateData;
    }
    return null;
}

// Modify the print job function to include template data
async function printJob(jobId) {
    const templateData = await fetchCurrentTemplateData();
    if (templateData) {
        // Use templateData for printing logic
    }
    // Existing print job logic...
}