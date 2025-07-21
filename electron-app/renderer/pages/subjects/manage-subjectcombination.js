// Fetches subject combinations and handles status updates
document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.querySelector('#combinations-table tbody');
    const messageDiv = document.getElementById('message');
    let dataTable;

    function renderCombinations(combinations) {
        tableBody.innerHTML = '';
        combinations.forEach(function (combination, idx) {
            const statusText = combination.status == 1 ? 'Active' : 'Inactive';
            const statusClass = combination.status == 1 ? 'status-active' : 'status-inactive';
            
            // Create action button based on current status
            let actionButton;
            if (combination.status == 0) {
                // Inactive - show activate button
                actionButton = `
                    <a href="#" onclick="updateStatus(${combination.scid}, 1, this)" class="activate-btn">
                        <i class="fa fa-check" title="Activate Record"></i>
                    </a>
                `;
            } else {
                // Active - show deactivate button
                actionButton = `
                    <a href="#" onclick="updateStatus(${combination.scid}, 0, this)" class="deactivate-btn">
                        <i class="fa fa-times" title="Deactivate Record"></i>
                    </a>
                `;
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td>${combination.ClassName} Section-${combination.Section}</td>
                <td>${combination.SubjectName}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
                <td>${actionButton}</td>
            `;
            tableBody.appendChild(tr);
        });
        
        // Destroy existing DataTable if it exists
        if (dataTable) {
            dataTable.destroy();
        }
        
        // Initialize DataTable after rendering
        dataTable = $('#combinations-table').DataTable({
            "responsive": true,
            "pageLength": 10,
            "lengthMenu": [10, 25, 50, 100],
            "order": [[1, "asc"]],
            "columnDefs": [
                { "orderable": false, "targets": 4 } // Disable sorting on Action column
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

    // Global function to update status (called from onclick)
    window.updateStatus = async function(id, newStatus, element) {
        const actionText = newStatus === 1 ? 'activate' : 'deactivate';
        
        // Confirm action
        if (!confirm(`Do you really want to ${actionText} this subject combination?`)) {
            return;
        }

        // Add loading state
        element.classList.add('action-loading');
        
        try {
            const response = await fetch(`http://localhost:9000/subjects/combinations/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showSuccess(result.message);
                // Reload the data to reflect changes
                loadCombinations();
            } else {
                showError(result.message || 'Something went wrong. Please try again');
            }
        } catch (err) {
            console.error('Error updating status:', err);
            showError('Could not connect to server');
        } finally {
            // Remove loading state
            element.classList.remove('action-loading');
        }
    };

    // Load combinations from backend
    function loadCombinations() {
        fetch('http://localhost:9000/subjects/combinations/details')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    renderCombinations(data.combinations);
                } else {
                    showError(data.message || 'Could not fetch subject combinations.');
                }
            })
            .catch(() => showError('Could not connect to server.'));
    }

    // Initial load
    loadCombinations();
});