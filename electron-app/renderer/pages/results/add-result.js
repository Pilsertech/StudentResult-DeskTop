// Add Result - Integrated with Your Backend Controllers
// Perfect PHP conversion using your existing backend APIs

document.addEventListener('DOMContentLoaded', function() {
    console.log('Add Result page loading...');
    
    // Check jQuery availability
    if (typeof $ === 'undefined') {
        console.error('jQuery not loaded! Check script order.');
        showMessage('jQuery not loaded. Please check the file paths.', 'danger');
        return;
    }
    
    console.log('jQuery available, initializing...');
    initializeAddResult();
});

// Global variables
let currentClassId = null;
let currentStudentId = null;
let loadedSubjects = [];

// Initialize page
function initializeAddResult() {
    try {
        console.log('Initializing Add Result page...');
        
        // Load classes on page load
        loadClasses();
        
        // Setup event listeners (matching PHP jQuery)
        setupEventListeners();
        
        // Initialize Select2 (matching PHP)
        initializeSelect2();
        
        // Update clock
        updateClock();
        setInterval(updateClock, 1000);
        
        console.log('Add Result page initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize:', error);
        showMessage('Failed to initialize page: ' + error.message, 'danger');
    }
}

// Load classes using your existing API
async function loadClasses() {
    try {
        console.log('Loading classes...');
        
        const response = await fetch('http://localhost:9000/api/results/classes');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const classes = await response.json();
        populateClassDropdown(classes);
        console.log('Classes loaded successfully');
        
    } catch (error) {
        console.error('Error loading classes:', error);
        showMessage('Failed to load classes. Please check your server connection.', 'danger');
    }
}

// Populate class dropdown (matching PHP loop)
function populateClassDropdown(classes) {
    const classSelect = document.getElementById('classid');
    
    // Clear existing options except first
    classSelect.innerHTML = '<option value="">Select Class</option>';
    
    // Add classes (matching PHP foreach loop)
    classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls.id;
        option.textContent = `${cls.ClassName} Section-${cls.Section}`;
        classSelect.appendChild(option);
    });
    
    console.log('Class dropdown populated with', classes.length, 'classes');
}

// Get students when class changes (using your existing API)
async function getStudent(classId) {
    if (!classId) {
        clearStudentDropdown();
        clearSubjects();
        return;
    }
    
    console.log('Getting students for class:', classId);
    currentClassId = classId;
    
    try {
        // Load students using your API
        const response = await fetch(`http://localhost:9000/api/results/students/${classId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const students = await response.json();
        populateStudentDropdown(students);
        
        // Also load subjects for this class
        loadSubjectsForClass(classId);
        
    } catch (error) {
        console.error('Error loading students:', error);
        showMessage('Failed to load students', 'danger');
    }
}

// Populate student dropdown
function populateStudentDropdown(students) {
    let html = '<option value="">Select Student</option>';
    
    students.forEach(student => {
        html += `<option value="${student.id}">${student.StudentName} (${student.RollId})</option>`;
    });
    
    document.getElementById('studentid').innerHTML = html;
    console.log('Students loaded successfully');
}

// Load subjects using your existing API
async function loadSubjectsForClass(classId) {
    try {
        const response = await fetch(`http://localhost:9000/api/results/subjects/${classId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const subjects = await response.json();
        loadedSubjects = subjects;
        renderSubjectsForm(subjects);
        
    } catch (error) {
        console.error('Error loading subjects:', error);
        showMessage('Failed to load subjects', 'danger');
    }
}

// Render subjects form (matching PHP subject display)
function renderSubjectsForm(subjects) {
    let html = '';
    
    subjects.forEach(subject => {
        html += `
            <div class="subject-input-group">
                <label for="marks_${subject.id}">${subject.SubjectName}</label>
                <input type="number" 
                       class="form-control" 
                       id="marks_${subject.id}" 
                       name="marks[]" 
                       placeholder="Enter marks (0-100)" 
                       min="0" 
                       max="100" 
                       data-subject-id="${subject.id}"
                       required>
            </div>
        `;
    });
    
    document.getElementById('subject').innerHTML = html;
    console.log('Subjects loaded successfully');
}

// Get existing results (using your existing API)
async function getresult(studentId) {
    if (!studentId || !currentClassId) {
        document.getElementById('reslt').innerHTML = '';
        return;
    }
    
    console.log('Getting results for student:', studentId);
    currentStudentId = studentId;
    
    try {
        const response = await fetch(`http://localhost:9000/api/results/student-results/${studentId}/${currentClassId}`);
        
        if (response.status === 404) {
            // No existing results - this is fine
            document.getElementById('reslt').innerHTML = '';
            return;
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const results = await response.json();
        displayExistingResults(results);
        
    } catch (error) {
        console.error('Error loading results:', error);
        document.getElementById('reslt').innerHTML = '';
    }
}

// Display existing results (matching PHP display)
function displayExistingResults(results) {
    let html = `
        <div class="existing-results-warning">
            <h5><i class="fa fa-info-circle"></i> Existing Results Found</h5>
            <p>This student already has results declared:</p>
            <div class="result-list">
    `;
    
    results.forEach(result => {
        html += `
            <div class="result-item">
                <span>${result.SubjectName}</span>
                <span><strong>${result.marks} marks</strong></span>
            </div>
        `;
    });
    
    html += `
            </div>
            <p><small>To update these results, please use the Edit Result function.</small></p>
        </div>
    `;
    
    document.getElementById('reslt').innerHTML = html;
}

// Setup event listeners (matching PHP onChange events)
function setupEventListeners() {
    // Class selection change (matching PHP onChange="getStudent(this.value);")
    document.getElementById('classid').addEventListener('change', function() {
        const classId = this.value;
        getStudent(classId);
    });
    
    // Student selection change (matching PHP onChange="getresult(this.value);")
    document.getElementById('studentid').addEventListener('change', function() {
        const studentId = this.value;
        getresult(studentId);
    });
    
    // Form submission (matching PHP form post)
    document.getElementById('addResultForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitResults();
    });
    
    console.log('Event listeners setup successfully');
}

// Initialize Select2 (matching PHP Select2 initialization)
function initializeSelect2() {
    try {
        if ($.fn.select2) {
            // Matching PHP Select2 initialization
            $(".js-states").select2();
            $(".js-states-limit").select2({
                maximumSelectionLength: 2
            });
            $(".js-states-hide").select2({
                minimumResultsForSearch: Infinity
            });
            
            console.log('Select2 initialized successfully');
        }
    } catch (error) {
        console.warn('Select2 initialization failed:', error);
    }
}

// Submit results using your existing API
async function submitResults() {
    try {
        console.log('Submitting results...');
        
        // Validate form
        if (!currentClassId || !currentStudentId) {
            showMessage('Please select both class and student', 'danger');
            return;
        }
        
        // Collect marks data (matching your API structure)
        const marks = [];
        const markInputs = document.querySelectorAll('input[name="marks[]"]');
        
        markInputs.forEach(input => {
            const subjectId = input.dataset.subjectId;
            const markValue = parseFloat(input.value);
            
            if (!isNaN(markValue) && markValue >= 0 && markValue <= 100) {
                marks.push({
                    subjectId: subjectId,
                    marks: markValue
                });
            }
        });
        
        if (marks.length === 0) {
            showMessage('Please enter valid marks for at least one subject', 'danger');
            return;
        }
        
        // Prepare data for your API
        const submitData = {
            classId: currentClassId,
            studentId: currentStudentId,
            marks: marks
        };
        
        console.log('Submitting data:', submitData);
        
        // Submit using your existing API
        const response = await fetch('http://localhost:9000/api/results/results', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(submitData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success message (matching PHP success message)
            showMessage('Result info added successfully', 'success');
            resetForm();
        } else {
            // Show error message (matching PHP error message)
            showMessage(result.message || 'Something went wrong. Please try again', 'danger');
        }
        
    } catch (error) {
        console.error('Error submitting results:', error);
        showMessage('Something went wrong. Please try again', 'danger');
    }
}

// Clear student dropdown
function clearStudentDropdown() {
    document.getElementById('studentid').innerHTML = '<option value="">Select Student</option>';
    document.getElementById('reslt').innerHTML = '';
}

// Clear subjects
function clearSubjects() {
    document.getElementById('subject').innerHTML = '';
}

// Reset form
function resetForm() {
    document.getElementById('addResultForm').reset();
    currentClassId = null;
    currentStudentId = null;
    loadedSubjects = [];
    clearStudentDropdown();
    clearSubjects();
    clearMessages();
    
    // Reset Select2 if available
    if ($.fn.select2) {
        $('#classid').val('').trigger('change');
        $('#studentid').val('').trigger('change');
    }
}

// Show message (matching PHP alert display)
function showMessage(message, type = 'info') {
    const container = document.getElementById('messageContainer');
    
    let alertClass, strongText;
    
    switch(type) {
        case 'success':
            alertClass = 'alert alert-success left-icon-alert';
            strongText = 'Well done!';
            break;
        case 'danger':
            alertClass = 'alert alert-danger left-icon-alert';
            strongText = 'Oh snap!';
            break;
        case 'warning':
            alertClass = 'alert alert-warning left-icon-alert';
            strongText = 'Warning!';
            break;
        default:
            alertClass = 'alert alert-info left-icon-alert';
            strongText = 'Info!';
    }
    
    // Matching PHP alert structure exactly
    container.innerHTML = `
        <div class="${alertClass}" role="alert">
            <strong>${strongText}</strong> ${message}
        </div>
    `;
    
    // Auto-hide success messages
    if (type === 'success') {
        setTimeout(() => {
            clearMessages();
        }, 5000);
    }
}

// Clear messages
function clearMessages() {
    const container = document.getElementById('messageContainer');
    if (container) {
        container.innerHTML = '';
    }
}

// Update real-time clock (matching dashboard)
function updateClock() {
    const now = new Date();
    const formatted = now.getFullYear() + '-' + 
                     String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(now.getDate()).padStart(2, '0') + ' ' +
                     String(now.getHours()).padStart(2, '0') + ':' + 
                     String(now.getMinutes()).padStart(2, '0') + ':' + 
                     String(now.getSeconds()).padStart(2, '0');
    
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = formatted;
    }
}

console.log('Add Result script loaded successfully');