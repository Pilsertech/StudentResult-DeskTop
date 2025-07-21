// Handles subject creation form submission
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('createSubjectForm');
    const messageDiv = document.getElementById('message');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        messageDiv.innerHTML = "";
        
        const subjectname = form.subjectname.value.trim();
        const subjectcode = form.subjectcode.value.trim();

        // Basic validation
        if (!subjectname || !subjectcode) {
            messageDiv.innerHTML = '<div class="errorWrap"><strong>Oh snap!</strong> Please fill in all required fields.</div>';
            return;
        }

        try {
            const response = await fetch('http://localhost:9000/subjects/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subjectname, subjectcode })
            });
            
            const result = await response.json();
            
            if (result.success) {
                messageDiv.innerHTML = '<div class="succWrap"><strong>Well done!</strong> ' + result.message + '</div>';
                form.reset();
            } else {
                messageDiv.innerHTML = '<div class="errorWrap"><strong>Oh snap!</strong> ' + (result.message || 'Something went wrong. Please try again') + '</div>';
            }
        } catch (err) {
            console.error('Error creating subject:', err);
            messageDiv.innerHTML = '<div class="errorWrap"><strong>Oh snap!</strong> Could not connect to server.</div>';
        }
    });
});