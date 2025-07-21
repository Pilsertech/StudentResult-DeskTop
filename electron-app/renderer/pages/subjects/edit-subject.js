// Handles subject editing with data loading and form submission
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('editSubjectForm');
    const messageDiv = document.getElementById('message');
    const loadingDiv = document.getElementById('loading');
    const errorStateDiv = document.getElementById('error-state');
    const subjectIdInput = document.getElementById('subjectId');
    const subjectnameInput = document.getElementById('subjectname');
    const subjectcodeInput = document.getElementById('subjectcode');

    // Get subject ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const subjectId = urlParams.get('subjectid');

    if (!subjectId) {
        showErrorState('No subject ID provided');
        return;
    }

    // Load subject data on page load
    loadSubjectData(subjectId);

    async function loadSubjectData(id) {
        try {
            loadingDiv.style.display = 'block';
            form.style.display = 'none';
            errorStateDiv.style.display = 'none';
            
            const response = await fetch(`http://localhost:9000/subjects/${id}`);
            const result = await response.json();
            
            if (result.success && result.subject) {
                // Populate form with subject data
                subjectIdInput.value = result.subject.id;
                subjectnameInput.value = result.subject.SubjectName;
                subjectcodeInput.value = result.subject.SubjectCode;
                
                // Show form
                loadingDiv.style.display = 'none';
                form.style.display = 'block';
            } else {
                showErrorState('Subject not found');
            }
        } catch (err) {
            console.error('Error loading subject data:', err);
            showErrorState('Could not connect to server');
        }
    }

    function showErrorState(message) {
        loadingDiv.style.display = 'none';
        form.style.display = 'none';
        errorStateDiv.style.display = 'block';
        showError(message);
    }

    function showError(msg) {
        messageDiv.innerHTML = `<div class="errorWrap"><strong>Oh snap!</strong> ${msg}</div>`;
    }

    function showSuccess(msg) {
        messageDiv.innerHTML = `<div class="succWrap"><strong>Well done!</strong> ${msg}</div>`;
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        messageDiv.innerHTML = "";
        
        const subjectId = subjectIdInput.value;
        const subjectname = subjectnameInput.value.trim();
        const subjectcode = subjectcodeInput.value.trim();

        // Basic validation
        if (!subjectname || !subjectcode) {
            showError('Please fill in all required fields');
            return;
        }

        // Add loading state
        form.classList.add('loading');

        try {
            const response = await fetch(`http://localhost:9000/subjects/${subjectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subjectname, subjectcode })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showSuccess('Subject info updated successfully');
                // Optionally redirect after a delay
                setTimeout(() => {
                    window.location.href = 'manage-subjects.html';
                }, 2000);
            } else {
                showError(result.message || 'Something went wrong. Please try again');
            }
        } catch (err) {
            console.error('Error updating subject:', err);
            showError('Could not connect to server');
        } finally {
            // Remove loading state
            form.classList.remove('loading');
        }
    });
});