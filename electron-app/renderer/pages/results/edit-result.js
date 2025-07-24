// Edit Result Page - Complete functionality with exact PHP logic conversion
// Maintains PHP structure while adding modern features

document.addEventListener('DOMContentLoaded', function() {
    console.log('Edit Result page loading...');
    
    // Check jQuery availability
    if (typeof $ === 'undefined') {
        console.error('jQuery not loaded! Check script order.');
        showMessage('jQuery not loaded. Please check the file paths.', 'danger');
        return;
    }
    
    // Check PDF libraries
    if (typeof window.jspdf === 'undefined') {
        console.warn('jsPDF not loaded! PDF download will not work.');
    }
    
    if (typeof html2canvas === 'undefined') {
        console.warn('html2canvas not loaded! PDF download will not work.');
    }
    
    console.log('Libraries loaded, initializing Edit Result page...');
    initializeEditResult();
});

// Global variables
let currentStudentId = null;
let currentStudentData = null;
let currentResults = [];

// Initialize page
function initializeEditResult() {
    try {
        console.log('Initializing Edit Result page...');
        
        // Get student ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        currentStudentId = urlParams.get('stid');
        
        if (!currentStudentId) {
            showErrorState('Student ID not provided in URL. Please access this page from Manage Results.');
            return;
        }
        
        console.log('Loading results for student ID:', currentStudentId);
        
        // Load student results
        loadStudentResults();
        
        // Set up form submission
        setupFormSubmission();
        
        // Update clock
        updateClock();
        setInterval(updateClock, 1000);
        
        console.log('Edit Result page initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize:', error);
        showErrorState('Failed to initialize page: ' + error.message);
    }
}

// Load student results for editing (exact PHP logic)
async function loadStudentResults() {
    try {
        console.log('🔍 Loading student results for editing...');
        
        // Show loading state
        showLoadingState();
        
        const response = await fetch(`http://localhost:9000/api/results/student-detailed/${currentStudentId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            currentStudentData = result.student;
            currentResults = result.results;
            
            populateStudentInfo(result.student);
            populateResultsForm(result.results);
            
            console.log('✅ Student results loaded successfully');
            showEditForm();
        } else {
            throw new Error(result.message || 'Failed to load student results');
        }
        
    } catch (error) {
        console.error('❌ Error loading student results:', error);
        showErrorState('Failed to load student results: ' + error.message);
    }
}

// Populate student information (matching PHP display logic)
function populateStudentInfo(student) {
    console.log('📋 Populating student information...');
    
    // Class display (exact PHP format)
    const classDisplay = `${student.ClassName}(${student.Section})`;
    document.getElementById('classDisplay').textContent = classDisplay;
    
    // Student name
    document.getElementById('nameDisplay').textContent = student.StudentName;
    
    // Roll ID
    document.getElementById('rollDisplay').textContent = student.RollId;
    
    console.log('✅ Student information populated');
}

// Populate results form (exact PHP form structure)
function populateResultsForm(results) {
    console.log('📝 Populating results form...');
    
    const container = document.getElementById('subjectsContainer');
    container.innerHTML = '';
    
    if (!results || results.length === 0) {
        container.innerHTML = `
            <div class="alert alert-warning">
                <i class="fa fa-exclamation-triangle"></i>
                No results found for this student.
            </div>
        `;
        return;
    }
    
    // Create form fields for each subject (matching PHP loop)
    results.forEach((result, index) => {
        const subjectDiv = document.createElement('div');
        subjectDiv.className = 'subject-input-group';
        
        // Calculate current grade
        const currentGrade = calculateGrade(result.marks);
        const gradeClass = getGradeClass(currentGrade);
        
        subjectDiv.innerHTML = `
            <div class="subject-label">
                <i class="fa fa-book"></i>
                <span>${escapeHtml(result.SubjectName)}</span>
                <span class="subject-code">${escapeHtml(result.SubjectCode || 'N/A')}</span>
            </div>
            <div class="form-group">
                <input type="hidden" name="resultIds[]" value="${result.SubjectId}" data-result-id="${result.SubjectId}">
                <input type="number" 
                       name="marks[]" 
                       class="form-control marks-input" 
                       value="${result.marks}" 
                       min="0" 
                       max="100" 
                       step="0.01"
                       data-subject-id="${result.SubjectId}"
                       data-subject-name="${escapeHtml(result.SubjectName)}"
                       placeholder="Enter marks (0-100)"
                       required>
                <div class="current-grade">
                    <span class="grade-badge ${gradeClass}" data-grade-display>
                        Grade: ${currentGrade}
                    </span>
                </div>
                <div class="invalid-feedback"></div>
            </div>
        `;
        
        container.appendChild(subjectDiv);
    });
    
    // Set up real-time grade calculation
    setupGradeCalculation();
    
    console.log(`✅ Form populated with ${results.length} subjects`);
}

// Setup real-time grade calculation
function setupGradeCalculation() {
    const marksInputs = document.querySelectorAll('.marks-input');
    
    marksInputs.forEach(input => {
        input.addEventListener('input', function() {
            const marks = parseFloat(this.value) || 0;
            const grade = calculateGrade(marks);
            const gradeClass = getGradeClass(grade);
            
            // Update grade display
            const gradeDisplay = this.closest('.subject-input-group').querySelector('[data-grade-display]');
            if (gradeDisplay) {
                gradeDisplay.textContent = `Grade: ${grade}`;
                gradeDisplay.className = `grade-badge ${gradeClass}`;
            }
            
            // Validation styling
            if (marks >= 0 && marks <= 100) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
                this.nextElementSibling.nextElementSibling.textContent = '';
            } else {
                this.classList.remove('is-valid');
                this.classList.add('is-invalid');
                this.nextElementSibling.nextElementSibling.textContent = 'Marks must be between 0 and 100';
            }
        });
    });
}

// Setup form submission (exact PHP update logic)
function setupFormSubmission() {
    const form = document.getElementById('editResultForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        console.log('📝 Form submitted, processing update...');
        
        try {
            // Validate form
            if (!validateForm()) {
                showMessage('Please correct the errors in the form', 'danger');
                return;
            }
            
            // Collect form data (matching PHP structure)
            const formData = collectFormData();
            
            if (!formData || formData.marks.length === 0) {
                showMessage('No marks data to update', 'warning');
                return;
            }
            
            // Submit update
            await submitResultUpdate(formData);
            
        } catch (error) {
            console.error('❌ Error submitting form:', error);
            showMessage('Failed to update results: ' + error.message, 'danger');
        }
    });
}

// Collect form data (matching PHP $_POST structure)
function collectFormData() {
    const resultIds = Array.from(document.querySelectorAll('input[name="resultIds[]"]')).map(input => input.value);
    const marksInputs = document.querySelectorAll('input[name="marks[]"]');
    const marks = [];
    
    marksInputs.forEach((input, index) => {
        const markValue = parseFloat(input.value);
        const subjectId = input.dataset.subjectId;
        
        if (!isNaN(markValue) && subjectId) {
            marks.push({
                subjectId: parseInt(subjectId),
                marks: markValue,
                resultId: resultIds[index] || subjectId
            });
        }
    });
    
    console.log('📋 Collected form data:', { marks });
    
    return {
        studentId: currentStudentId,
        marks: marks
    };
}

// Submit result update (exact PHP update logic)
async function submitResultUpdate(formData) {
    try {
        console.log('📤 Submitting result update...');
        
        // Show loading state
        const submitButton = document.querySelector('.btn-update');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Updating...';
        submitButton.disabled = true;
        
        const response = await fetch(`http://localhost:9000/api/results/students/${currentStudentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Success message (exact PHP message)
            showMessage('Result info updated successfully', 'success');
            
            // Add success animation
            document.getElementById('editFormContainer').classList.add('success-animation');
            setTimeout(() => {
                document.getElementById('editFormContainer').classList.remove('success-animation');
            }, 600);
            
            // Reload results to show updated data
            setTimeout(() => {
                loadStudentResults();
            }, 1000);
            
            console.log('✅ Results updated successfully');
            
        } else {
            throw new Error(result.message || 'Failed to update results');
        }
        
    } catch (error) {
        console.error('❌ Error updating results:', error);
        showMessage('Something went wrong. Please try again', 'danger');
    } finally {
        // Restore button
        const submitButton = document.querySelector('.btn-update');
        submitButton.innerHTML = '<i class="fa fa-save"></i> Update Results';
        submitButton.disabled = false;
    }
}

// Form validation
function validateForm() {
    let isValid = true;
    const marksInputs = document.querySelectorAll('input[name="marks[]"]');
    
    marksInputs.forEach(input => {
        const marks = parseFloat(input.value);
        
        if (isNaN(marks) || marks < 0 || marks > 100) {
            input.classList.add('is-invalid');
            input.nextElementSibling.nextElementSibling.textContent = 'Marks must be between 0 and 100';
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
        }
    });
    
    return isValid;
}

// Download updated result PDF
async function downloadUpdatedResultPDF() {
    try {
        console.log('📄 Downloading updated result PDF...');
        
        if (!currentStudentData) {
            showMessage('Student data not loaded. Please refresh the page.', 'warning');
            return;
        }
        
        // Collect current form data
        const formData = collectFormData();
        const updatedResults = formData.marks.map(mark => {
            const originalResult = currentResults.find(r => r.SubjectId == mark.subjectId);
            return {
                ...originalResult,
                marks: mark.marks
            };
        });
        
        // Generate PDF with updated marks
        await generateUpdatedResultPDF(currentStudentData, updatedResults);
        
        showMessage('Updated result PDF downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('❌ Error downloading PDF:', error);
        showMessage('Failed to download PDF: ' + error.message, 'danger');
    }
}

// Generate PDF with updated results
async function generateUpdatedResultPDF(student, results) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // PDF Header
        doc.setFontSize(20);
        doc.setTextColor(44, 62, 80);
        doc.text('Student Result Management System', 105, 20, { align: 'center' });
        
        doc.setFontSize(16);
        doc.setTextColor(73, 80, 87);
        doc.text('Updated Student Result Report', 105, 35, { align: 'center' });
        
        // Student Information
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        
        let yPos = 55;
        doc.text(`Student Name: ${student.StudentName}`, 20, yPos);
        yPos += 10;
        doc.text(`Roll ID: ${student.RollId}`, 20, yPos);
        yPos += 10;
        doc.text(`Class: ${student.ClassName}(${student.Section})`, 20, yPos);
        yPos += 10;
        doc.text(`Email: ${student.StudentEmail}`, 20, yPos);
        yPos += 10;
        doc.text(`Status: ${student.Status == 1 ? 'Active' : 'Blocked'}`, 20, yPos);
        yPos += 20;
        
        // Results Table
        if (results && results.length > 0) {
            doc.setFontSize(14);
            doc.setTextColor(44, 62, 80);
            doc.text('Updated Subject Results:', 20, yPos);
            yPos += 15;
            
            // Table headers
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text('Subject', 20, yPos);
            doc.text('Subject Code', 80, yPos);
            doc.text('Marks', 140, yPos);
            doc.text('Grade', 170, yPos);
            yPos += 5;
            
            // Draw line under headers
            doc.line(20, yPos, 190, yPos);
            yPos += 10;
            
            // Table data
            let totalMarks = 0;
            results.forEach(result => {
                if (yPos > 250) { // New page if needed
                    doc.addPage();
                    yPos = 20;
                }
                
                const marks = parseFloat(result.marks);
                totalMarks += marks;
                const grade = calculateGrade(marks);
                
                doc.text(result.SubjectName, 20, yPos);
                doc.text(result.SubjectCode || 'N/A', 80, yPos);
                doc.text(marks.toString(), 140, yPos);
                doc.text(grade, 170, yPos);
                yPos += 8;
            });
            
            // Summary
            yPos += 10;
            doc.line(20, yPos, 190, yPos);
            yPos += 10;
            
            const averageMarks = (totalMarks / results.length).toFixed(2);
            const overallGrade = calculateGrade(averageMarks);
            
            doc.setFontSize(12);
            doc.setTextColor(44, 62, 80);
            doc.text(`Total Subjects: ${results.length}`, 20, yPos);
            yPos += 10;
            doc.text(`Total Marks: ${totalMarks}`, 20, yPos);
            yPos += 10;
            doc.text(`Average Marks: ${averageMarks}`, 20, yPos);
            yPos += 10;
            doc.text(`Overall Grade: ${overallGrade}`, 20, yPos);
        } else {
            doc.text('No results found for this student.', 20, yPos);
        }
        
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(108, 117, 125);
        doc.text(`Updated on: ${new Date().toLocaleString()}`, 20, 280);
        doc.text('Generated by: Pilsertech', 20, 285);
        
        // Save PDF
        const fileName = `${student.StudentName.replace(/[^a-z0-9]/gi, '_')}_Updated_Result_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
    } catch (error) {
        console.error('❌ Error generating PDF:', error);
        throw error;
    }
}

// Helper function to calculate grade
function calculateGrade(marks) {
    const score = parseFloat(marks);
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C+';
    if (score >= 40) return 'C';
    if (score >= 30) return 'D';
    return 'F';
}

// Get CSS class for grade
function getGradeClass(grade) {
    if (grade.includes('A')) return 'grade-a';
    if (grade.includes('B')) return 'grade-b';
    if (grade.includes('C')) return 'grade-c';
    if (grade.includes('D')) return 'grade-d';
    return 'grade-f';
}

// Show loading state
function showLoadingState() {
    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('errorState').style.display = 'none';
    document.getElementById('editFormContainer').style.display = 'none';
}

// Show error state
function showErrorState(message) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
    document.getElementById('editFormContainer').style.display = 'none';
    document.getElementById('errorMessage').textContent = message;
}

// Show edit form
function showEditForm() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'none';
    document.getElementById('editFormContainer').style.display = 'block';
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
            <i class="fa fa-${type === 'success' ? 'check' : type === 'danger' ? 'times' : type === 'warning' ? 'exclamation-triangle' : 'info'}"></i>
            <strong>${strongText}</strong> ${message}
        </div>
    `;
    
    // Auto-hide messages after 5 seconds
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}

// Escape HTML for security
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Update real-time clock
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

console.log('Edit Result script loaded successfully');