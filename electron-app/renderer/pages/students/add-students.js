// Handles student creation with form validation and dropdown population
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('addStudentForm');
    const messageDiv = document.getElementById('message');
    const classSelect = document.getElementById('classSelect');

    // Load classes dropdown on page load
    loadClasses();

    async function loadClasses() {
        try {
            const response = await fetch('http://localhost:9000/subjects/dropdown/classes');
            const result = await response.json();
            
            if (result.success) {
                classSelect.innerHTML = '<option value="">Select Class</option>';
                result.classes.forEach(cls => {
                    const option = document.createElement('option');
                    option.value = cls.id;
                    option.textContent = `${cls.ClassName} Section-${cls.Section}`;
                    classSelect.appendChild(option);
                });
            } else {
                showError('Could not load classes');
            }
        } catch (err) {
            console.error('Error loading classes:', err);
            showError('Could not connect to server');
        }
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
        
        const formData = new FormData(form);
        const fullanme = formData.get('fullanme').trim();
        const rollid = formData.get('rollid').trim();
        const emailid = formData.get('emailid').trim();
        const gender = formData.get('gender');
        const classid = formData.get('class');
        const dob = formData.get('dob');

        // Basic validation
        if (!fullanme || !rollid || !emailid || !gender || !classid || !dob) {
            showError('Please fill in all required fields');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailid)) {
            showError('Please enter a valid email address');
            return;
        }

        // Roll ID validation
        if (rollid.length > 5) {
            showError('Roll ID must be 5 characters or less');
            return;
        }

        // Date validation
        const dobDate = new Date(dob);
        const today = new Date();
        if (dobDate >= today) {
            showError('Date of birth must be in the past');
            return;
        }

        // Add loading state
        form.classList.add('loading');

        try {
            const response = await fetch('http://localhost:9000/students/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullanme, rollid, emailid, gender, classid, dob })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showSuccess(result.message);
                form.reset();
                // Reset radio button to default
                document.querySelector('input[name="gender"][value="Male"]').checked = true;
            } else {
                showError(result.message || 'Something went wrong. Please try again');
            }
        } catch (err) {
            console.error('Error creating student:', err);
            showError('Could not connect to server');
        } finally {
            // Remove loading state
            form.classList.remove('loading');
        }
    });
});