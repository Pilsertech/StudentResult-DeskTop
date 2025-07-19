const db = require('../config/database');

exports.getDashboardStats = (req, res) => {
    console.log('Fetching dashboard stats...');

    // Queries to get the counts from the database
    const studentsQuery = "SELECT COUNT(StudentId) as totalStudents FROM tblstudents";
    const subjectsQuery = "SELECT COUNT(id) as totalSubjects FROM tblsubjects";
    const classesQuery = "SELECT COUNT(id) as totalClasses FROM tblclasses";
    const resultsQuery = "SELECT COUNT(DISTINCT StudentId) as totalResults FROM tblresult";

    // Execute all queries in parallel for efficiency
    db.query(`${studentsQuery}; ${subjectsQuery}; ${classesQuery}; ${resultsQuery}`, (err, results) => {
        if (err) {
            console.error("Database query error on dashboard:", err.message);
            return res.status(500).json({ success: false, message: "An internal server error occurred." });
        }

        // The results array contains the output of each query
        const stats = {
            totalStudents: results[0][0].totalStudents,
            totalSubjects: results[1][0].totalSubjects,
            totalClasses: results[2][0].totalClasses,
            totalResults: results[3][0].totalResults,
        };

        console.log('Successfully fetched dashboard stats:', stats);
        res.json({ success: true, data: stats });
    });
};