// Handles form submission and shows result messages (no inline JS)
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('createClassForm');
    const messageDiv = document.getElementById('message');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        messageDiv.innerHTML = "";
        const classname = form.classname.value;
        const classnamenumeric = form.classnamenumeric.value;
        const section = form.section.value;

        try {
            // Replace endpoint below as needed for your backend
            const response = await fetch('http://localhost:9000/classes/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ classname, classnamenumeric, section })
            });
            const result = await response.json();
            if (result.success) {
                messageDiv.innerHTML = '<div class="succWrap"><strong>Well done!</strong> Class Created successfully</div>';
                form.reset();
            } else {
                messageDiv.innerHTML = '<div class="errorWrap"><strong>Oh snap!</strong> ' + (result.message || 'Something went wrong. Please try again') + '</div>';
            }
        } catch (err) {
            messageDiv.innerHTML = '<div class="errorWrap"><strong>Oh snap!</strong> Could not connect to server.</div>';
        }
    });
});