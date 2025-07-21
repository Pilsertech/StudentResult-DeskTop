// Handles student editing with data loading and form submission
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('editStudentForm');
    const messageDiv = document.getElementById('message');
    const loadingDiv = document.getElementById('loading');
    const errorStateDiv = document.getElementById('error-state');
    const studentIdInput = document.getElementById('studentId');
    const classIdInput = document.getElementById('classId');

    // Get student ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('stid');

    if (!studentId) {
        showErrorState('No student ID provided');
        return;
    }

    // Load student data on page load
    loadStudentData(studentId);

    async function loadStudentData(id) {
        try {
            loadingDiv.style.display = 'block';
            form.style.display = 'none';
            errorStateDiv.style.display = 'none';
            
            const response = await fetch(`http://localhost:9000/students/${id}`);
            const result = await response.json();
            
            if (result.success && result.student) {
                populateForm(result.student);
                
                // Show form
                loadingDiv.style.display = 'none';
                form.style.display = 'block';
            } else {
                showErrorState('Student not found');
            }
        } catch (err) {
            console.error('Error loading student data:', err);
            showErrorState('Could not connect to server');
        }
    }

    function populateForm(student) {
        // Populate basic fields
        studentIdInput.value = student.StudentId;
        classIdInput.value = student.ClassId;
        document.getElementById('fullanme').value = student.StudentName;
        document.getElementById('rollid').value = student.RollId;
        document.getElementById('emailid').value = student.StudentEmail;
        document.getElementById('dob').value = student.DOB;
        
        // Set gender radio button
        const genderRadio = document.querySelector(`input[name="gender"][value="${student.Gender}"]`);
        if (genderRadio) {
            genderRadio.checked = true;
        }
        
        // Set status radio button
        const statusRadio = document.querySelector(`input[name="status"][value="${student.Status}"]`);
        if (statusRadio) {
            statusRadio.checked = true;
        }
        
        // Set class information (readonly)
        document.getElementById('classname').value = `${student.ClassName}(${student.Section})`;
        
        // Set registration date
        const regDate = new Date(student.RegDate).toLocaleString();
        document.getElementById('regdate').textContent = regDate;
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
        
        const formData = new FormData(form);
        const studentId = studentIdInput.value;
        const classid = classIdInput.value; // Keep original class
        const fullanme = formData.get('fullanme').trim();
        const rollid = formData.get('rollid').trim();
        const emailid = formData.get('emailid').trim();
        const gender = formData.get('gender');
        const dob = formData.get('dob');
        const status = formData.get('status');

        // Basic validation
        if (!fullanme || !rollid || !emailid || !gender || !dob || !status) {
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
            const response = await fetch(`http://localhost:9000/students/${studentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullanme, rollid, emailid, gender, classid, dob, status })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showSuccess('Student info updated successfully');
                // Optionally redirect after a delay
                setTimeout(() => {
                    window.location.href = 'manage-students.html';
                }, 2000);
            } else {
                showError(result.message || 'Something went wrong. Please try again');
            }
        } catch (err) {
            console.error('Error updating student:', err);
            showError('Could not connect to server');
        } finally {
            // Remove loading state
            form.classList.remove('loading');
        }
    });
});