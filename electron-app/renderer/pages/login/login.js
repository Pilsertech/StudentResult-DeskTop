// FIX: Wrap all code in a DOMContentLoaded listener.
// This ensures that the HTML is fully loaded before this script runs.
document.addEventListener('DOMContentLoaded', () => {

    // Event listener for the login form submission.
    document.getElementById('loginForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const messageDiv = document.getElementById('message');

        try {
            const response = await fetch('http://localhost:9000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                messageDiv.textContent = 'Login successful! Redirecting...';
                messageDiv.style.color = 'green';
                window.electronAPI.loginSuccessful();
            } else {
                messageDiv.textContent = data.message;
                messageDiv.style.color = 'red';
            }
        } catch (error) {
            console.error('Login error:', error);
            messageDiv.textContent = 'An error occurred connecting to the server.';
            messageDiv.style.color = 'red';
        }
    });

    // Event listener for the stop server button.
    // This assumes you have a button with id="stopServerBtn" in your HTML.
    const stopServerBtn = document.getElementById('stopServerBtn');
    if(stopServerBtn) {
        stopServerBtn.addEventListener('click', () => {
            console.log('Stop Server button clicked.');
            const messageDiv = document.getElementById('message');
            messageDiv.textContent = 'Stopping server...';
            messageDiv.style.color = 'orange';
            window.electronAPI.stopServer();
        });
    }
});
