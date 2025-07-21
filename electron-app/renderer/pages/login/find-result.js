// Enhanced student result search functionality for desktop
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('findResultForm');
    const messageDiv = document.getElementById('message');
    const rollIdInput = document.getElementById('rollid');
    const classSelect = document.getElementById('classSelect');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // Initialize page
    initializePage();

    function initializePage() {
        console.log('Find Result page loaded - Desktop optimized');
        
        // Load classes dropdown
        loadClasses();
        
        // Auto-focus roll ID field with slight delay for better UX
        setTimeout(() => {
            rollIdInput.focus();
        }, 300);
        
        // Add form reset functionality
        const clearButton = form.querySelector('.btn-clear');
        if (clearButton) {
            clearButton.addEventListener('click', function(e) {
                e.preventDefault();
                clearForm();
            });
        }
        
        // Add keyboard shortcuts
        addKeyboardShortcuts();
    }

    async function loadClasses() {
        try {
            console.log('Loading classes from server...');
            
            const response = await fetch('http://localhost:9000/classes/');
            const result = await response.json();
            
            if (result.success && result.classes) {
                populateClassDropdown(result.classes);
                console.log(`Loaded ${result.classes.length} classes successfully`);
            } else {
                showError('Could not load classes. Please try again.');
                console.error('Failed to load classes:', result.message);
            }
        } catch (err) {
            console.error('Error loading classes:', err);
            showError('Could not connect to server. Please check your connection.');
        }
    }

    function populateClassDropdown(classes) {
        classSelect.innerHTML = '<option value="">Select Your Class</option>';
        
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = `${cls.ClassName} Section-${cls.Section}`;
            classSelect.appendChild(option);
        });
        
        // Add change animation
        classSelect.style.opacity = '0';
        setTimeout(() => {
            classSelect.style.transition = 'opacity 0.3s ease';
            classSelect.style.opacity = '1';
        }, 100);
    }

    function showError(msg) {
        messageDiv.innerHTML = `
            <div class="errorWrap">
                <i class="fa fa-exclamation-triangle" style="margin-right: 10px;"></i>
                <strong>Error!</strong> ${msg}
            </div>
        `;
        
        // Scroll to message
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Auto hide after 7 seconds
        setTimeout(() => {
            hideMessage();
        }, 7000);
    }

    function showSuccess(msg) {
        messageDiv.innerHTML = `
            <div class="succWrap">
                <i class="fa fa-check-circle" style="margin-right: 10px;"></i>
                <strong>Success!</strong> ${msg}
            </div>
        `;
        
        // Scroll to message
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function hideMessage() {
        if (messageDiv.innerHTML) {
            messageDiv.style.transition = 'opacity 0.3s ease';
            messageDiv.style.opacity = '0';
            setTimeout(() => {
                messageDiv.innerHTML = '';
                messageDiv.style.opacity = '1';
            }, 300);
        }
    }

    function clearForm() {
        // Clear inputs with animation
        rollIdInput.style.transition = 'all 0.3s ease';
        classSelect.style.transition = 'all 0.3s ease';
        
        rollIdInput.value = '';
        classSelect.value = '';
        
        // Clear any messages
        hideMessage();
        
        // Remove any validation states
        [rollIdInput, classSelect].forEach(input => {
            input.classList.remove('is-valid', 'is-invalid');
        });
        
        // Focus back to roll ID
        setTimeout(() => {
            rollIdInput.focus();
        }, 100);
        
        console.log('Form cleared');
    }

    function addKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + Enter to submit
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                form.dispatchEvent(new Event('submit'));
            }
            
            // Escape to clear form
            if (e.key === 'Escape') {
                e.preventDefault();
                clearForm();
            }
            
            // F5 to reload classes
            if (e.key === 'F5') {
                e.preventDefault();
                loadClasses();
            }
        });
    }

    function showLoadingOverlay(show = true) {
        if (show) {
            loadingOverlay.style.display = 'flex';
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.transition = 'opacity 0.3s ease';
                loadingOverlay.style.opacity = '1';
            }, 10);
        } else {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 300);
        }
    }

    function validateForm() {
        let isValid = true;
        
        // Clear previous validation states
        [rollIdInput, classSelect].forEach(input => {
            input.classList.remove('is-valid', 'is-invalid');
        });
        
        // Validate Roll ID
        const rollId = rollIdInput.value.trim();
        if (!rollId) {
            rollIdInput.classList.add('is-invalid');
            isValid = false;
        } else if (rollId.length < 2) {
            rollIdInput.classList.add('is-invalid');
            showError('Roll ID must be at least 2 characters long');
            isValid = false;
        } else {
            rollIdInput.classList.add('is-valid');
        }
        
        // Validate Class Selection
        if (!classSelect.value) {
            classSelect.classList.add('is-invalid');
            isValid = false;
        } else {
            classSelect.classList.add('is-valid');
        }
        
        return isValid;
    }

    // Form submission handler
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        hideMessage();
        
        console.log('Form submission started');
        
        // Validate form
        if (!validateForm()) {
            if (!rollIdInput.value.trim()) {
                showError('Please enter your Roll ID');
                rollIdInput.focus();
            } else if (!classSelect.value) {
                showError('Please select your class');
                classSelect.focus();
            }
            return;
        }
        
        const rollId = rollIdInput.value.trim();
        const classId = classSelect.value;
        
        console.log('Searching for student:', { rollId, classId });
        
        try {
            // Show loading overlay
            showLoadingOverlay(true);
            
            // Add form loading state
            form.classList.add('loading');
            
            // Store search parameters for result page
            localStorage.setItem('searchRollId', rollId);
            localStorage.setItem('searchClassId', classId);
            localStorage.setItem('searchTimestamp', new Date().toISOString());
            
            // Show success message
            showLoadingOverlay(false);
            showSuccess('Redirecting to results page...');
            
            // Redirect to result page with animation
            setTimeout(() => {
                const url = `result.html?rollid=${encodeURIComponent(rollId)}&class=${encodeURIComponent(classId)}`;
                console.log('Redirecting to:', url);
                window.location.href = url;
            }, 1500);
            
        } catch (err) {
            console.error('Search error:', err);
            showLoadingOverlay(false);
            form.classList.remove('loading');
            showError('Could not connect to server. Please try again.');
        }
    });

    // Real-time validation
    rollIdInput.addEventListener('input', function() {
        const value = this.value.trim();
        if (value.length >= 2) {
            this.classList.remove('is-invalid');
            this.classList.add('is-valid');
        } else {
            this.classList.remove('is-valid');
            if (value.length > 0) {
                this.classList.add('is-invalid');
            }
        }
    });

    classSelect.addEventListener('change', function() {
        if (this.value) {
            this.classList.remove('is-invalid');
            this.classList.add('is-valid');
        } else {
            this.classList.remove('is-valid');
            this.classList.add('is-invalid');
        }
    });

    // Enter key support with enhanced UX
    rollIdInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (this.value.trim()) {
                classSelect.focus();
            }
        }
    });

    classSelect.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (this.value) {
                form.dispatchEvent(new Event('submit'));
            }
        }
    });

    // Page visibility change handler
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            console.log('Page became visible - refreshing classes');
            loadClasses();
        }
    });
});