// Fetches students list and populates DataTable
document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.querySelector('#students-table tbody');
    const messageDiv = document.getElementById('message');
    let dataTable;

    function formatDate(dateString) {
        if (!dateString || dateString === '0000-00-00 00:00:00') {
            return '';
        }
        const date = new Date(dateString);
        return date.toLocaleString();
    }

    function renderStudents(students) {
        tableBody.innerHTML = '';
        students.forEach(function (student, idx) {
            // Format status
            const statusText = student.Status == 1 ? 'Active' : 'Blocked';
            const statusClass = student.Status == 1 ? 'status-active' : 'status-blocked';
            
            // Format class info
            const classInfo = `${student.ClassName}(${student.Section})`;
            
            // Format registration date
            const regDate = formatDate(student.RegDate);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td>${student.StudentName}</td>
                <td>${student.RollId}</td>
                <td class="class-info">${classInfo}</td>
                <td class="reg-date">${regDate}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
                <td>
                    <a href="edit-student.html?stid=${student.StudentId}">
                        <i class="fa fa-edit" title="Edit Record"></i>
                    </a>
                </td>
            `;
            tableBody.appendChild(tr);
        });
        
        // Destroy existing DataTable if it exists
        if (dataTable) {
            dataTable.destroy();
        }
        
        // Initialize DataTable after rendering
        dataTable = $('#students-table').DataTable({
            "responsive": true,
            "pageLength": 10,
            "lengthMenu": [10, 25, 50, 100],
            "order": [[0, "asc"]],
            "columnDefs": [
                { "orderable": false, "targets": 6 } // Disable sorting on Action column
            ]
        });
    }

    function showError(msg) {
        messageDiv.innerHTML = `<div class="errorWrap"><strong>Oh snap!</strong> ${msg}</div>`;
        // Auto hide message after 5 seconds
        setTimeout(() => {
            messageDiv.innerHTML = '';
        }, 5000);
    }

    function showSuccess(msg) {
        messageDiv.innerHTML = `<div class="succWrap"><strong>Well done!</strong> ${msg}</div>`;
        // Auto hide message after 5 seconds
        setTimeout(() => {
            messageDiv.innerHTML = '';
        }, 5000);
    }

    // Load students from backend
    function loadStudents() {
        fetch('http://localhost:9000/students')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    renderStudents(data.students);
                } else {
                    showError(data.message || 'Could not fetch students.');
                }
            })
            .catch(() => showError('Could not connect to server.'));
    }

    // Initial load
    loadStudents();
});