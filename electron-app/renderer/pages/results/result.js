// Student Result Page - Public result display functionality
// Exact PHP logic conversion for student result lookup

document.addEventListener('DOMContentLoaded', function() {
    console.log('Student Result page loading...');
    
    // Check jQuery availability
    if (typeof $ === 'undefined') {
        console.error('jQuery not loaded! Check script order.');
        showErrorMessage('jQuery not loaded. Please check the file paths.');
        return;
    }
    
    // Check PDF libraries
    if (typeof window.jspdf === 'undefined') {
        console.warn('jsPDF not loaded! PDF download will not work.');
    }
    
    if (typeof html2canvas === 'undefined') {
        console.warn('html2canvas not loaded! PDF download will not work.');
    }
    
    console.log('Libraries loaded, initializing Student Result page...');
    initializeResultPage();
});

// Global variables
let currentStudentData = null;
let currentResults = [];

// Initialize page
function initializeResultPage() {
    try {
        console.log('Initializing Student Result page...');
        
        // Load classes for dropdown
        loadClasses();
        
        // Set up form submission
        setupFormSubmission();
        
        console.log('Student Result page initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize:', error);
        showErrorMessage('Failed to initialize page: ' + error.message);
    }
}

// Load classes for dropdown (exact same API as other pages)
async function loadClasses() {
    try {
        console.log('🔍 Loading classes for result search...');
        
        const response = await fetch('http://localhost:9000/api/results/classes');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const classes = await response.json();
        populateClassDropdown(classes);
        
        console.log(`✅ Loaded ${classes.length} classes for selection`);
        
    } catch (error) {
        console.error('❌ Error loading classes:', error);
        showErrorMessage('Failed to load classes. Please refresh the page.');
    }
}

// Populate class dropdown
function populateClassDropdown(classes) {
    const select = document.getElementById('classSelect');
    select.innerHTML = '<option value="">-- Select Class --</option>';
    
    classes.forEach(classItem => {
        const option = document.createElement('option');
        option.value = classItem.id;
        option.textContent = `${classItem.ClassName} (${classItem.Section})`;
        select.appendChild(option);
    });
}

// Setup form submission
function setupFormSubmission() {
    const form = document.getElementById('resultSearchForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        console.log('📝 Result search form submitted...');
        
        try {
            // Validate form
            if (!validateSearchForm()) {
                return;
            }
            
            // Get form data
            const rollId = document.getElementById('rollIdInput').value.trim();
            const classId = document.getElementById('classSelect').value;
            
            console.log('🔍 Searching for results:', { rollId, classId });
            
            // Search for results
            await searchStudentResults(rollId, classId);
            
        } catch (error) {
            console.error('❌ Error searching for results:', error);
            showErrorMessage('Failed to search for results: ' + error.message);
        }
    });
}

// Validate search form
function validateSearchForm() {
    let isValid = true;
    
    const rollIdInput = document.getElementById('rollIdInput');
    const classSelect = document.getElementById('classSelect');
    
    // Clear previous validation
    rollIdInput.classList.remove('is-invalid');
    classSelect.classList.remove('is-invalid');
    
    // Validate roll ID
    if (!rollIdInput.value.trim()) {
        rollIdInput.classList.add('is-invalid');
        rollIdInput.nextElementSibling.textContent = 'Roll ID is required';
        isValid = false;
    }
    
    // Validate class selection
    if (!classSelect.value) {
        classSelect.classList.add('is-invalid');
        classSelect.nextElementSibling.textContent = 'Please select a class';
        isValid = false;
    }
    
    return isValid;
}

// Search student results (exact PHP logic)
async function searchStudentResults(rollId, classId) {
    try {
        console.log('🔍 Searching student results...');
        
        // Show loading state
        showLoadingState();
        
        // First, get student information (exact PHP student query)
        const studentResponse = await fetch(`http://localhost:9000/api/results/student-by-roll/${rollId}/${classId}`);
        
        if (!studentResponse.ok) {
            throw new Error(`HTTP error! status: ${studentResponse.status}`);
        }
        
        const studentResult = await studentResponse.json();
        
        if (!studentResult.success) {
            if (studentResult.message.includes('not found')) {
                showInvalidRollId();
            } else {
                showNoResults();
            }
            return;
        }
        
        // Get student results (exact PHP results query)
        const resultsResponse = await fetch(`http://localhost:9000/api/results/student-results-by-roll/${rollId}/${classId}`);
        
        if (!resultsResponse.ok) {
            throw new Error(`HTTP error! status: ${resultsResponse.status}`);
        }
        
        const resultsData = await resultsResponse.json();
        
        if (!resultsData.success || !resultsData.results || resultsData.results.length === 0) {
            showNoResults();
            return;
        }
        
        // Display results
        currentStudentData = studentResult.student;
        currentResults = resultsData.results;
        
        displayStudentResults(studentResult.student, resultsData.results);
        
        console.log('✅ Student results found and displayed');
        
    } catch (error) {
        console.error('❌ Error searching student results:', error);
        showErrorMessage('Failed to search for results: ' + error.message);
    }
}

// Display student results (exact PHP display logic)
function displayStudentResults(student, results) {
    console.log('📊 Displaying student results...');
    
    // Populate student information (exact PHP format)
    document.getElementById('studentName').textContent = student.StudentName;
    document.getElementById('studentRollId').textContent = student.RollId;
    document.getElementById('studentClass').textContent = `${student.ClassName}(${student.Section})`;
    
    // Populate results table
    const tbody = document.getElementById('resultsTableBody');
    tbody.innerHTML = '';
    
    let totalMarks = 0;
    let maxMarks = 0;
    
    // Add subject rows (exact PHP loop logic)
    results.forEach((result, index) => {
        const marks = parseFloat(result.marks);
        totalMarks += marks;
        maxMarks += 100; // Each subject is out of 100
        
        const grade = calculateGrade(marks);
        const gradeClass = getGradeClass(grade);
        
        const row = document.createElement('tr');
        row.className = 'subject-row';
        row.innerHTML = `
            <th scope="row">${index + 1}</th>
            <td class="subject-name">${escapeHtml(result.SubjectName)}</td>
            <td class="marks-cell">${marks}</td>
            <td><span class="grade-badge ${gradeClass}">${grade}</span></td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Calculate percentage (exact PHP calculation)
    const percentage = maxMarks > 0 ? ((totalMarks / maxMarks) * 100).toFixed(2) : 0;
    const overallGrade = calculateGrade(percentage);
    const overallGradeClass = getGradeClass(overallGrade);
    
    // Update totals (exact PHP format)
    document.getElementById('totalMarks').innerHTML = `<strong>${totalMarks}</strong> out of <strong>${maxMarks}</strong>`;
    document.getElementById('percentage').innerHTML = `<strong>${percentage}%</strong>`;
    document.getElementById('overallGrade').innerHTML = `<span class="grade-badge ${overallGradeClass}">${overallGrade}</span>`;
    
    // Show results with animation
    showResultsSection();
    
    console.log('✅ Results displayed successfully');
}

// Show different states
function showLoadingState() {
    hideAllSections();
    document.getElementById('loadingSection').style.display = 'block';
}

function showResultsSection() {
    hideAllSections();
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('resultsSection').classList.add('result-found');
}

function showNoResults() {
    hideAllSections();
    document.getElementById('notFoundSection').style.display = 'block';
}

function showInvalidRollId() {
    hideAllSections();
    document.getElementById('invalidSection').style.display = 'block';
}

function hideAllSections() {
    document.getElementById('searchSection').style.display = 'none';
    document.getElementById('loadingSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('notFoundSection').style.display = 'none';
    document.getElementById('invalidSection').style.display = 'none';
}

// Search again function
function searchAgain() {
    hideAllSections();
    document.getElementById('searchSection').style.display = 'block';
    
    // Clear form
    document.getElementById('resultSearchForm').reset();
    document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    document.querySelectorAll('.invalid-feedback').forEach(el => el.textContent = '');
}

// Download result PDF (exact PHP download functionality)
async function downloadResultPDF() {
    try {
        console.log('📄 Downloading result PDF...');
        
        if (!currentStudentData || !currentResults) {
            showErrorMessage('No result data available for download.');
            return;
        }
        
        // Generate PDF
        await generateStudentResultPDF(currentStudentData, currentResults);
        
        console.log('✅ PDF downloaded successfully');
        
    } catch (error) {
        console.error('❌ Error downloading PDF:', error);
        showErrorMessage('Failed to download PDF: ' + error.message);
    }
}

// Generate student result PDF
async function generateStudentResultPDF(student, results) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // PDF Header
        doc.setFontSize(20);
        doc.setTextColor(44, 62, 80);
        doc.text('Student Result Management System', 105, 20, { align: 'center' });
        
        doc.setFontSize(16);
        doc.setTextColor(73, 80, 87);
        doc.text('Official Academic Result', 105, 35, { align: 'center' });
        
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
        doc.text(`Registration Date: ${new Date(student.RegDate).toLocaleDateString()}`, 20, yPos);
        yPos += 20;
        
        // Results Table
        if (results && results.length > 0) {
            doc.setFontSize(14);
            doc.setTextColor(44, 62, 80);
            doc.text('Subject-wise Results:', 20, yPos);
            yPos += 15;
            
            // Table headers
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text('#', 20, yPos);
            doc.text('Subject', 35, yPos);
            doc.text('Marks', 130, yPos);
            doc.text('Grade', 160, yPos);
            yPos += 5;
            
            // Draw line under headers
            doc.line(20, yPos, 190, yPos);
            yPos += 10;
            
            // Table data (exact PHP logic)
            let totalMarks = 0;
            let maxMarks = 0;
            
            results.forEach((result, index) => {
                if (yPos > 250) { // New page if needed
                    doc.addPage();
                    yPos = 20;
                }
                
                const marks = parseFloat(result.marks);
                totalMarks += marks;
                maxMarks += 100;
                const grade = calculateGrade(marks);
                
                doc.text((index + 1).toString(), 20, yPos);
                doc.text(result.SubjectName.substring(0, 25), 35, yPos);
                doc.text(marks.toString(), 130, yPos);
                doc.text(grade, 160, yPos);
                yPos += 8;
            });
            
            // Summary (exact PHP calculation)
            yPos += 10;
            doc.line(20, yPos, 190, yPos);
            yPos += 10;
            
            const percentage = ((totalMarks / maxMarks) * 100).toFixed(2);
            const overallGrade = calculateGrade(percentage);
            
            doc.setFontSize(12);
            doc.setTextColor(44, 62, 80);
            doc.text(`Total Marks: ${totalMarks} out of ${maxMarks}`, 20, yPos);
            yPos += 10;
            doc.text(`Percentage: ${percentage}%`, 20, yPos);
            yPos += 10;
            doc.text(`Overall Grade: ${overallGrade}`, 20, yPos);
        }
        
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(108, 117, 125);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 280);
        doc.text('Official Document - Student Result Management System', 20, 285);
        
        // Save PDF (matching PHP download filename logic)
        const fileName = `${student.StudentName.replace(/[^a-z0-9]/gi, '_')}_Result_${student.RollId}_${new Date().toISOString().split('T')[0]}.pdf`;
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

// Show error message
function showErrorMessage(message) {
    console.error('Error:', message);
    // You can implement a toast notification or alert here
    alert('Error: ' + message);
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

console.log('Student Result script loaded successfully');