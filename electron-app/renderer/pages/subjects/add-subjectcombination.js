// Handles subject combination creation with dropdown population
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('addCombinationForm');
    const messageDiv = document.getElementById('message');
    const classSelect = document.getElementById('classSelect');
    const subjectSelect = document.getElementById('subjectSelect');

    // Load dropdown options on page load
    loadClasses();
    loadSubjects();

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

    async function loadSubjects() {
        try {
            const response = await fetch('http://localhost:9000/subjects/dropdown/subjects');
            const result = await response.json();
            
            if (result.success) {
                subjectSelect.innerHTML = '<option value="">Select Subject</option>';
                result.subjects.forEach(subject => {
                    const option = document.createElement('option');
                    option.value = subject.id;
                    option.textContent = subject.SubjectName;
                    subjectSelect.appendChild(option);
                });
            } else {
                showError('Could not load subjects');
            }
        } catch (err) {
            console.error('Error loading subjects:', err);
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
        
        const classId = form.class.value;
        const subjectId = form.subject.value;

        // Basic validation
        if (!classId || !subjectId) {
            showError('Please select both class and subject');
            return;
        }

        // Add loading state
        form.classList.add('loading');

        try {
            const response = await fetch('http://localhost:9000/subjects/combinations/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ classId, subjectId })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showSuccess(result.message);
                form.reset();
            } else {
                showError(result.message || 'Something went wrong. Please try again');
            }
        } catch (err) {
            console.error('Error creating combination:', err);
            showError('Could not connect to server');
        } finally {
            // Remove loading state
            form.classList.remove('loading');
        }
    });
});