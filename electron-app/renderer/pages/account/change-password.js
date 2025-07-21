// Handles password change with validation and MD5 hashing
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('changePasswordForm');
    const messageDiv = document.getElementById('message');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // Get username from localStorage or set default (matching your login system)
    const getUsername = () => {
        // Try to get from localStorage first (if you store it after login)
        const storedUsername = localStorage.getItem('adminUsername') || 
                              localStorage.getItem('username') || 
                              sessionStorage.getItem('username');
        
        // Fallback to default admin username
        return storedUsername || 'admin';
    };

    // Enhanced password strength checker
    function checkPasswordStrength(password) {
        let strength = 0;
        let feedback = [];
        
        if (password.length >= 8) {
            strength++;
        } else {
            feedback.push('At least 8 characters');
        }
        
        if (/[a-z]/.test(password)) {
            strength++;
        } else {
            feedback.push('Lowercase letter');
        }
        
        if (/[A-Z]/.test(password)) {
            strength++;
        } else {
            feedback.push('Uppercase letter');
        }
        
        if (/[0-9]/.test(password)) {
            strength++;
        } else {
            feedback.push('Number');
        }
        
        if (/[^A-Za-z0-9]/.test(password)) {
            strength++;
        } else {
            feedback.push('Special character');
        }
        
        return { strength, feedback };
    }

    // Validation function (matching PHP JavaScript exactly)
    function validateForm() {
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Exact same validation as PHP
        if (newPassword !== confirmPassword) {
            showError('New Password and Confirm Password Field do not match  !!');
            confirmPasswordInput.focus();
            return false;
        }

        // Enhanced password requirements
        if (newPassword.length < 6) {
            showError('New password must be at least 6 characters long');
            newPasswordInput.focus();
            return false;
        }

        // Additional security check
        if (newPassword === currentPasswordInput.value) {
            showError('New password must be different from current password');
            newPasswordInput.focus();
            return false;
        }

        return true;
    }

    // Real-time password confirmation validation
    confirmPasswordInput.addEventListener('input', function() {
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (confirmPassword && newPassword !== confirmPassword) {
            confirmPasswordInput.classList.add('error');
            confirmPasswordInput.classList.remove('success');
            // Show inline error
            let errorSpan = confirmPasswordInput.parentNode.querySelector('.error-text');
            if (!errorSpan) {
                errorSpan = document.createElement('small');
                errorSpan.className = 'error-text text-danger';
                confirmPasswordInput.parentNode.appendChild(errorSpan);
            }
            errorSpan.textContent = 'Passwords do not match';
        } else if (confirmPassword) {
            confirmPasswordInput.classList.add('success');
            confirmPasswordInput.classList.remove('error');
            // Remove inline error
            const errorSpan = confirmPasswordInput.parentNode.querySelector('.error-text');
            if (errorSpan) {
                errorSpan.remove();
            }
        }
    });

    // Enhanced password strength indicator
    newPasswordInput.addEventListener('input', function() {
        const password = this.value;
        const { strength, feedback } = checkPasswordStrength(password);
        
        if (password.length > 0) {
            // Remove existing strength indicator
            let strengthDiv = this.parentNode.querySelector('.password-strength-info');
            if (strengthDiv) {
                strengthDiv.remove();
            }

            // Create new strength indicator
            strengthDiv = document.createElement('div');
            strengthDiv.className = 'password-strength-info';
            
            if (strength < 3) {
                this.classList.add('error');
                this.classList.remove('success');
                strengthDiv.innerHTML = `<small class="text-danger">Weak password. Missing: ${feedback.join(', ')}</small>`;
            } else if (strength < 5) {
                this.classList.remove('error', 'success');
                strengthDiv.innerHTML = `<small class="text-warning">Medium strength. Consider adding: ${feedback.join(', ')}</small>`;
            } else {
                this.classList.add('success');
                this.classList.remove('error');
                strengthDiv.innerHTML = `<small class="text-success">Strong password!</small>`;
            }
            
            this.parentNode.appendChild(strengthDiv);
        } else {
            // Remove strength indicator when empty
            const strengthDiv = this.parentNode.querySelector('.password-strength-info');
            if (strengthDiv) {
                strengthDiv.remove();
            }
            this.classList.remove('error', 'success');
        }
    });

    function showError(msg) {
        messageDiv.innerHTML = `<div class="errorWrap"><strong>Oh snap!</strong> ${msg}</div>`;
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        // Auto hide after 7 seconds (increased time)
        setTimeout(() => {
            messageDiv.innerHTML = '';
        }, 7000);
    }

    function showSuccess(msg) {
        messageDiv.innerHTML = `<div class="succWrap"><strong>Well done!</strong> ${msg}</div>`;
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        // Auto hide after 5 seconds
        setTimeout(() => {
            messageDiv.innerHTML = '';
        }, 5000);
    }

    // Clear any existing messages when user starts typing
    [currentPasswordInput, newPasswordInput, confirmPasswordInput].forEach(input => {
        input.addEventListener('focus', () => {
            if (messageDiv.innerHTML.includes('errorWrap')) {
                messageDiv.innerHTML = '';
            }
        });
    });

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        messageDiv.innerHTML = "";

        // Client-side validation (matching PHP)
        if (!validateForm()) {
            return;
        }
        
        const currentPassword = currentPasswordInput.value.trim();
        const newPassword = newPasswordInput.value.trim();
        const username = getUsername(); // Get username dynamically

        // Basic validation
        if (!currentPassword || !newPassword) {
            showError('Please fill in all required fields');
            return;
        }

        // Log the attempt (for debugging)
        console.log('Password change attempt for user:', username);

        // Add loading state
        form.classList.add('loading');
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = 'Changing... <i class="fa fa-spinner fa-spin"></i>';
        submitButton.disabled = true;

        try {
            const response = await fetch('http://localhost:9000/auth/change-password', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ currentPassword, newPassword, username })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showSuccess(result.message);
                form.reset();
                // Clear all validation classes and indicators
                document.querySelectorAll('.form-control').forEach(input => {
                    input.classList.remove('error', 'success');
                });
                document.querySelectorAll('.password-strength-info, .error-text').forEach(el => {
                    el.remove();
                });
                
                // Optional: Save timestamp of last password change
                localStorage.setItem('lastPasswordChange', new Date().toISOString());
            } else {
                showError(result.message || 'Something went wrong. Please try again');
                console.error('Password change failed:', result.message);
            }
        } catch (err) {
            console.error('Error changing password:', err);
            showError('Could not connect to server. Please check your connection and try again.');
        } finally {
            // Remove loading state
            form.classList.remove('loading');
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    });

    // Auto-focus first input
    currentPasswordInput.focus();

    // Show current user info (optional)
    const username = getUsername();
    if (username && username !== 'admin') {
        console.log('Logged in as:', username);
        // You could display this in the UI if needed
    }
});