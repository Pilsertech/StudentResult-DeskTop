// Handles class editing with data loading and form submission
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('editClassForm');
    const messageDiv = document.getElementById('message');
    const loadingDiv = document.getElementById('loading');
    const errorStateDiv = document.getElementById('error-state');
    const classIdInput = document.getElementById('classId');
    const classnameInput = document.getElementById('classname');
    const classnamenumericInput = document.getElementById('classnamenumeric');
    const sectionInput = document.getElementById('section');

    // Get class ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const classId = urlParams.get('classid');

    if (!classId) {
        showErrorState('No class ID provided');
        return;
    }

    // Load class data on page load
    loadClassData(classId);

    async function loadClassData(id) {
        try {
            loadingDiv.style.display = 'block';
            form.style.display = 'none';
            errorStateDiv.style.display = 'none';
            
            const response = await fetch(`http://localhost:9000/classes/${id}`);
            const result = await response.json();
            
            if (result.success && result.class) {
                // Populate form with class data
                classIdInput.value = result.class.id;
                classnameInput.value = result.class.ClassName;
                classnamenumericInput.value = result.class.ClassNameNumeric;
                sectionInput.value = result.class.Section;
                
                // Show form
                loadingDiv.style.display = 'none';
                form.style.display = 'block';
            } else {
                showErrorState('Class not found');
            }
        } catch (err) {
            console.error('Error loading class data:', err);
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
        
        const classId = classIdInput.value;
        const classname = classnameInput.value.trim();
        const classnamenumeric = classnamenumericInput.value.trim();
        const section = sectionInput.value.trim();

        // Basic validation
        if (!classname || !classnamenumeric || !section) {
            showError('Please fill in all required fields');
            return;
        }

        // Add loading state
        form.classList.add('loading');

        try {
            const response = await fetch(`http://localhost:9000/classes/${classId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ classname, classnamenumeric, section })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showSuccess(result.message || 'Data has been updated successfully');
                // Optionally redirect after a delay
                setTimeout(() => {
                    window.location.href = 'manage-classes.html';
                }, 2000);
            } else {
                showError(result.message || 'Something went wrong. Please try again');
            }
        } catch (err) {
            console.error('Error updating class:', err);
            showError('Could not connect to server');
        } finally {
            // Remove loading state
            form.classList.remove('loading');
        }
    });
});