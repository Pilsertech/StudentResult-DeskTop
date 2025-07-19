// FIX: Wrap all code in a DOMContentLoaded listener.
document.addEventListener('DOMContentLoaded', () => {
    
    // This function fetches the dashboard stats from the server.
    const loadDashboardStats = async () => {
        try {
            const response = await fetch('http://localhost:9000/dashboard/stats');
            const result = await response.json();

            if (result.success) {
                const stats = result.data;
                // Update the dashboard numbers with the fetched data.
                document.getElementById('totalStudents').textContent = stats.totalStudents;
                document.getElementById('totalSubjects').textContent = stats.totalSubjects;
                document.getElementById('totalClasses').textContent = stats.totalClasses;
                document.getElementById('totalResults').textContent = stats.totalResults;

                // Animate the numbers using the counterUp library.
                $('.counter').counterUp({
                    delay: 10,
                    time: 1000
                });
                
                // Display a welcome message using the toastr library.
                toastr.success('Welcome to Student Result Management System!');
            } else {
                toastr.error('Could not load dashboard stats.');
            }
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
            toastr.error('An error occurred while connecting to the server.');
        }
    };

    // Call the function to load the stats when the page is ready.
    loadDashboardStats();

    // Event listener for the logout button.
    document.getElementById('logoutBtn').addEventListener('click', () => {
        // Redirect back to the login page.
        window.location.href = '../login/login.html';
    });
});
