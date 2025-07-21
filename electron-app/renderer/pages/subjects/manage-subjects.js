// Fetches subjects list and populates DataTable
document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.querySelector('#subjects-table tbody');
    const messageDiv = document.getElementById('message');

    function formatDate(dateString) {
        if (!dateString || dateString === '0000-00-00 00:00:00') {
            return '';
        }
        const date = new Date(dateString);
        return date.toLocaleString();
    }

    function renderSubjects(subjects) {
        tableBody.innerHTML = '';
        subjects.forEach(function (subject, idx) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td>${subject.SubjectName}</td>
                <td>${subject.SubjectCode}</td>
                <td>${formatDate(subject.Creationdate)}</td>
                <td>${formatDate(subject.UpdationDate)}</td>
                <td>
                    <a href="edit-subject.html?subjectid=${subject.id}">
                        <i class="fa fa-edit" title="Edit Record"></i>
                    </a>
                </td>
            `;
            tableBody.appendChild(tr);
        });
        
        // Initialize DataTable after rendering
        $('#subjects-table').DataTable({
            "responsive": true,
            "pageLength": 10,
            "lengthMenu": [10, 25, 50, 100],
            "order": [[0, "asc"]],
            "columnDefs": [
                { "orderable": false, "targets": 5 } // Disable sorting on Action column
            ]
        });
    }

    function showError(msg) {
        messageDiv.innerHTML = `<div class="errorWrap"><strong>Oh snap!</strong> ${msg}</div>`;
    }

    function showSuccess(msg) {
        messageDiv.innerHTML = `<div class="succWrap"><strong>Well done!</strong> ${msg}</div>`;
    }

    // Fetch subjects from backend
    fetch('http://localhost:9000/subjects')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                renderSubjects(data.subjects);
            } else {
                showError(data.message || 'Could not fetch subjects.');
            }
        })
        .catch(() => showError('Could not connect to server.'));
});