// Handles admin login functionality
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('adminLoginForm');
    const messageDiv = document.getElementById('message');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    function showError(msg) {
        messageDiv.innerHTML = `<div class="errorWrap"><strong>Oh snap!</strong> ${msg}</div>`;
        setTimeout(() => {
            messageDiv.innerHTML = '';
        }, 5000);
    }

    function showSuccess(msg) {
        messageDiv.innerHTML = `<div class="succWrap"><strong>Well done!</strong> ${msg}</div>`;
    }

    // Clear session data on page load (matching PHP logic)
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('isLoggedIn');
    sessionStorage.clear();

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        messageDiv.innerHTML = "";
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // Basic validation
        if (!username || !password) {
            showError('Please enter both username and password');
            return;
        }

        // Add loading state
        form.classList.add('loading');
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = 'Signing in... <i class="fa fa-spinner fa-spin"></i>';
        submitButton.disabled = true;

        try {
            console.log('Login attempt for user:', username);
            
            const response = await fetch('http://localhost:9000/auth/login', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const result = await response.json();
            console.log('Login response:', result);
            
            if (result.success) {
                showSuccess('Login successful! Redirecting...');
                
                // Store session data (matching PHP session logic)
                localStorage.setItem('adminUsername', username);
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('loginTime', new Date().toISOString());
                
                // Clear form
                form.reset();
                
                // Redirect to dashboard (matching PHP redirect)
                setTimeout(() => {
                    window.location.href = '../dashboard/dashboard.html';
                }, 1500);
                
            } else {
                // Matching PHP alert message
                showError(result.message || 'Invalid Details');
                console.log('Login failed:', result.message);
            }
        } catch (err) {
            console.error('Login error:', err);
            showError('Could not connect to server. Please check your connection.');
        } finally {
            // Remove loading state
            form.classList.remove('loading');
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    });

    // Enter key support
    [usernameInput, passwordInput].forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                form.dispatchEvent(new Event('submit'));
            }
        });
    });

    // Auto-focus username field
    usernameInput.focus();

    console.log('Login page loaded successfully');
});