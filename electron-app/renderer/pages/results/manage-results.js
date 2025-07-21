// Manage Results - Complete functionality with PDF download
// Exact PHP logic conversion with offline PDF generation

document.addEventListener('DOMContentLoaded', function() {
    console.log('Manage Results page loading...');
    
    // Check jQuery availability
    if (typeof $ === 'undefined') {
        console.error('jQuery not loaded! Check script order.');
        showMessage('jQuery not loaded. Please check the file paths.', 'danger');
        return;
    }
    
    // Check PDF libraries
    if (typeof window.jspdf === 'undefined') {
        console.error('jsPDF not loaded! Check PDF library paths.');
        showMessage('PDF library not loaded. PDF download will not work.', 'warning');
    }
    
    if (typeof html2canvas === 'undefined') {
        console.error('html2canvas not loaded! Check PDF library paths.');
        showMessage('HTML2Canvas library not loaded. PDF download will not work.', 'warning');
    }
    
    console.log('Libraries loaded, initializing Manage Results page...');
    initializeManageResults();
});

// Global variables
let studentsWithResults = [];
let dataTable = null;

// Initialize page
function initializeManageResults() {
    try {
        console.log('Initializing Manage Results page...');
        
        // Load students with results
        loadStudentsWithResults();
        
        // Update clock
        updateClock();
        setInterval(updateClock, 1000);
        
        console.log('Manage Results page initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize:', error);
        showErrorState('Failed to initialize page: ' + error.message);
    }
}

// Load students who have results (exact PHP query logic)
async function loadStudentsWithResults() {
    try {
        console.log('🔍 Loading students with results...');
        
        // Show loading state
        showLoadingState();
        
        const response = await fetch('http://localhost:9000/api/results/students-with-results');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            studentsWithResults = result.students;
            populateResultsTable(result.students);
            console.log('✅ Students with results loaded successfully:', result.students.length);
        } else {
            throw new Error(result.message || 'Failed to load students with results');
        }
        
    } catch (error) {
        console.error('❌ Error loading students with results:', error);
        showErrorState('Failed to load students with results: ' + error.message);
    }
}

// Populate results table (exact PHP table structure)
function populateResultsTable(students) {
    const tbody = document.querySelector('#resultsTable tbody');
    
    if (!students || students.length === 0) {
        showErrorState('No students with results found.');
        return;
    }
    
    // Clear existing data
    tbody.innerHTML = '';
    
    // Populate table (matching PHP loop logic)
    students.forEach((student, index) => {
        const row = document.createElement('tr');
        
        // Format registration date
        const regDate = new Date(student.RegDate).toLocaleString();
        
        // Status badge
        const statusBadge = student.Status == 1 
            ? '<span class="status-active">Active</span>'
            : '<span class="status-blocked">Blocked</span>';
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${escapeHtml(student.StudentName)}</td>
            <td>${escapeHtml(student.RollId)}</td>
            <td>${escapeHtml(student.ClassName)}(${escapeHtml(student.Section)})</td>
            <td>${regDate}</td>
            <td>${statusBadge}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-edit" onclick="editResult(${student.StudentId})" title="Edit Result">
                        <i class="fa fa-edit"></i> Edit
                    </button>
                    <button class="btn-action btn-pdf" onclick="downloadStudentResultPDF(${student.StudentId}, '${escapeHtml(student.StudentName)}')" title="Download PDF">
                        <i class="fa fa-file-pdf-o"></i> PDF
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Initialize/reinitialize DataTable
    initializeDataTable();
    
    // Show table
    showTableContainer();
}

// Initialize DataTable (matching PHP DataTable config)
function initializeDataTable() {
    // Destroy existing DataTable if it exists
    if (dataTable) {
        dataTable.destroy();
        dataTable = null;
    }
    
    try {
        // Initialize DataTable with exact PHP config
        dataTable = $('#resultsTable').DataTable({
            "pageLength": 10,
            "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
            "order": [[0, "asc"]],
            "columnDefs": [
                { "orderable": false, "targets": [6] } // Disable sorting on Action column
            ],
            "responsive": true,
            "language": {
                "search": "Search students:",
                "lengthMenu": "Show _MENU_ students per page",
                "info": "Showing _START_ to _END_ of _TOTAL_ students",
                "infoEmpty": "No students found",
                "infoFiltered": "(filtered from _MAX_ total students)",
                "paginate": {
                    "first": "First",
                    "last": "Last",
                    "next": "Next",
                    "previous": "Previous"
                },
                "emptyTable": "No students with results found"
            }
        });
        
        console.log('✅ DataTable initialized successfully');
        
    } catch (error) {
        console.error('❌ Error initializing DataTable:', error);
        showMessage('DataTable initialization failed', 'warning');
    }
}

// Edit result function (matching PHP edit link)
function editResult(studentId) {
    if (!studentId) {
        showMessage('Invalid student ID', 'danger');
        return;
    }
    
    console.log('📝 Editing result for student:', studentId);
    
    // Navigate to edit result page (matching PHP behavior)
    window.location.href = `edit-result.html?stid=${studentId}`;
}

// Download individual student result PDF
async function downloadStudentResultPDF(studentId, studentName) {
    try {
        console.log('📄 Downloading PDF for student:', studentId, studentName);
        
        // Show loading message
        showMessage('Generating PDF...', 'info');
        
        // Fetch student's detailed results
        const response = await fetch(`http://localhost:9000/api/results/student-detailed/${studentId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'Failed to fetch student results');
        }
        
        // Generate PDF with student results
        await generateStudentResultPDF(result.student, result.results);
        
        showMessage('PDF downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('❌ Error downloading student PDF:', error);
        showMessage('Failed to download PDF: ' + error.message, 'danger');
    }
}

// Generate individual student result PDF
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
        doc.text('Individual Student Result Report', 105, 35, { align: 'center' });
        
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
            doc.text('Subject-wise Results:', 20, yPos);
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
                const grade = getGrade(marks);
                
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
            const overallGrade = getGrade(averageMarks);
            
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
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 280);
        doc.text('Generated by: Pilsertech', 20, 285);
        
        // Save PDF
        const fileName = `${student.StudentName.replace(/[^a-z0-9]/gi, '_')}_Result_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
    } catch (error) {
        console.error('❌ Error generating individual PDF:', error);
        throw error;
    }
}

// Download all results as PDF
async function downloadAllResultsPDF() {
    try {
        console.log('📄 Downloading all results PDF...');
        
        if (!studentsWithResults || studentsWithResults.length === 0) {
            showMessage('No students with results to download', 'warning');
            return;
        }
        
        // Show loading message
        showMessage('Generating complete results PDF...', 'info');
        
        // Generate PDF with all results
        await generateAllResultsPDF();
        
        showMessage('Complete results PDF downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('❌ Error downloading all results PDF:', error);
        showMessage('Failed to download complete PDF: ' + error.message, 'danger');
    }
}

// Generate all results PDF
async function generateAllResultsPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // PDF Header
        doc.setFontSize(20);
        doc.setTextColor(44, 62, 80);
        doc.text('Student Result Management System', 105, 20, { align: 'center' });
        
        doc.setFontSize(16);
        doc.setTextColor(73, 80, 87);
        doc.text('Complete Results Report', 105, 35, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(108, 117, 125);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 50, { align: 'center' });
        doc.text('Generated by: Pilsertech', 105, 60, { align: 'center' });
        
        // Summary Statistics
        let yPos = 80;
        doc.setFontSize(14);
        doc.setTextColor(44, 62, 80);
        doc.text('Summary Statistics:', 20, yPos);
        yPos += 15;
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Total Students with Results: ${studentsWithResults.length}`, 20, yPos);
        yPos += 10;
        
        const activeStudents = studentsWithResults.filter(s => s.Status == 1).length;
        const blockedStudents = studentsWithResults.length - activeStudents;
        
        doc.text(`Active Students: ${activeStudents}`, 20, yPos);
        yPos += 10;
        doc.text(`Blocked Students: ${blockedStudents}`, 20, yPos);
        yPos += 20;
        
        // Students Table
        doc.setFontSize(14);
        doc.setTextColor(44, 62, 80);
        doc.text('Students with Results:', 20, yPos);
        yPos += 15;
        
        // Table headers
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text('#', 20, yPos);
        doc.text('Student Name', 30, yPos);
        doc.text('Roll ID', 80, yPos);
        doc.text('Class', 110, yPos);
        doc.text('Reg Date', 140, yPos);
        doc.text('Status', 180, yPos);
        yPos += 5;
        
        // Draw line under headers
        doc.line(20, yPos, 200, yPos);
        yPos += 10;
        
        // Table data
        studentsWithResults.forEach((student, index) => {
            if (yPos > 250) { // New page if needed
                doc.addPage();
                yPos = 20;
                
                // Repeat headers on new page
                doc.setFontSize(10);
                doc.text('#', 20, yPos);
                doc.text('Student Name', 30, yPos);
                doc.text('Roll ID', 80, yPos);
                doc.text('Class', 110, yPos);
                doc.text('Reg Date', 140, yPos);
                doc.text('Status', 180, yPos);
                yPos += 5;
                doc.line(20, yPos, 200, yPos);
                yPos += 10;
            }
            
            doc.text((index + 1).toString(), 20, yPos);
            doc.text(student.StudentName.substring(0, 15), 30, yPos);
            doc.text(student.RollId, 80, yPos);
            doc.text(`${student.ClassName}(${student.Section})`, 110, yPos);
            doc.text(new Date(student.RegDate).toLocaleDateString(), 140, yPos);
            doc.text(student.Status == 1 ? 'Active' : 'Blocked', 180, yPos);
            yPos += 8;
        });
        
        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(108, 117, 125);
            doc.text(`Page ${i} of ${pageCount}`, 180, 285);
        }
        
        // Save PDF
        const fileName = `Complete_Results_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
    } catch (error) {
        console.error('❌ Error generating complete PDF:', error);
        throw error;
    }
}

// Helper function to calculate grade
function getGrade(marks) {
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

// Show loading state
function showLoadingState() {
    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('errorState').style.display = 'none';
    document.getElementById('tableContainer').style.display = 'none';
}

// Show error state
function showErrorState(message) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
    document.getElementById('tableContainer').style.display = 'none';
    document.getElementById('errorMessage').textContent = message;
}

// Show table container
function showTableContainer() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'none';
    document.getElementById('tableContainer').style.display = 'block';
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

console.log('Manage Results script loaded successfully');