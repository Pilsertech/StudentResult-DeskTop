// Fetches class list and populates DataTable
document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.querySelector('#classes-table tbody');
    const messageDiv = document.getElementById('message');

    function renderClasses(classes) {
        tableBody.innerHTML = '';
        classes.forEach(function (cls, idx) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td>${cls.ClassName}</td>
                <td>${cls.ClassNameNumeric}</td>
                <td>${cls.Section}</td>
                <td>${cls.CreationDate}</td>
                <td>
                    <a href="edit-class.html?classid=${cls.id}">
                        <i class="fa fa-edit" title="Edit Record"></i>
                    </a>
                </td>
            `;
            tableBody.appendChild(tr);
        });
        $('#classes-table').DataTable();
    }

    function showError(msg) {
        messageDiv.innerHTML = `<div class="errorWrap"><strong>Oh snap!</strong> ${msg}</div>`;
    }

    function showSuccess(msg) {
        messageDiv.innerHTML = `<div class="succWrap"><strong>Well done!</strong> ${msg}</div>`;
    }

    // Fetch classes from backend
    fetch('http://localhost:9000/classes')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                renderClasses(data.classes);
            } else {
                showError(data.message || 'Could not fetch classes.');
            }
        })
        .catch(() => showError('Could not connect to server.'));
});