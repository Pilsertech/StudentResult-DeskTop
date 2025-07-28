// Add a function to get available templates
async function loadTemplates() {
    const response = await fetch('/idcards/templates');
    const templates = await response.json();
    // Populate a dropdown or selection area with templates
}

// Modify the print job function to include template information
async function printJob(jobId) {
    const job = await getJobDetails(jobId);
    const templateId = job.templateId; // Assuming job has a templateId
    // Use the templateId to fetch the template and print accordingly
}