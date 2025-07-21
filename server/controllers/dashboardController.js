const db = require('../config/database');

// Get comprehensive dashboard statistics
exports.getDashboardStats = async (req, res) => {
    console.log('Fetching enhanced dashboard stats...');

    try {
        // Execute all queries in parallel using Promise.all for better performance
        const [
            studentsResult,
            subjectsResult,
            classesResult,
            resultsResult,
            activeStudentsResult,
            recentResultsResult
        ] = await Promise.all([
            // Total students
            db.execute("SELECT COUNT(StudentId) as totalStudents FROM tblstudents"),
            
            // Total subjects
            db.execute("SELECT COUNT(id) as totalSubjects FROM tblsubjects"),
            
            // Total classes
            db.execute("SELECT COUNT(id) as totalClasses FROM tblclasses"),
            
            // Total results (distinct students with results)
            db.execute("SELECT COUNT(DISTINCT StudentId) as totalResults FROM tblresult"),
            
            // Active students (status = 1)
            db.execute("SELECT COUNT(StudentId) as activeStudents FROM tblstudents WHERE Status = 1"),
            
            // Recent results (last 30 days)
            db.execute(`
                SELECT COUNT(DISTINCT StudentId) as recentResults 
                FROM tblresult 
                WHERE CreationDate >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            `)
        ]);

        // Get additional analytics
        const [classDistributionResult] = await db.execute(`
            SELECT 
                c.ClassName,
                c.Section,
                COUNT(s.StudentId) as studentCount
            FROM tblclasses c
            LEFT JOIN tblstudents s ON c.id = s.ClassId
            GROUP BY c.id, c.ClassName, c.Section
            ORDER BY studentCount DESC
            LIMIT 5
        `);

        // Get recent activity
        const [recentActivityResult] = await db.execute(`
            SELECT 
                s.StudentName,
                c.ClassName,
                c.Section,
                s.RegDate
            FROM tblstudents s
            JOIN tblclasses c ON s.ClassId = c.id
            ORDER BY s.RegDate DESC
            LIMIT 5
        `);

        // Compile statistics
        const stats = {
            // Main dashboard cards
            totalStudents: studentsResult[0][0].totalStudents || 0,
            totalSubjects: subjectsResult[0][0].totalSubjects || 0,
            totalClasses: classesResult[0][0].totalClasses || 0,
            totalResults: resultsResult[0][0].totalResults || 0,
            
            // Additional metrics
            activeStudents: activeStudentsResult[0][0].activeStudents || 0,
            recentResults: recentResultsResult[0][0].recentResults || 0,
            
            // Calculated metrics
            inactiveStudents: (studentsResult[0][0].totalStudents || 0) - (activeStudentsResult[0][0].activeStudents || 0),
            studentsWithResults: resultsResult[0][0].totalResults || 0,
            studentsWithoutResults: (activeStudentsResult[0][0].activeStudents || 0) - (resultsResult[0][0].totalResults || 0),
            
            // Analytics data
            classDistribution: classDistributionResult[0] || [],
            recentActivity: recentActivityResult[0] || [],
            
            // System info
            lastUpdated: new Date().toISOString(),
            systemStatus: 'operational'
        };

        // Calculate percentages
        stats.resultCompletionRate = stats.totalStudents > 0 
            ? Math.round((stats.totalResults / stats.totalStudents) * 100) 
            : 0;
        
        stats.activeStudentRate = stats.totalStudents > 0 
            ? Math.round((stats.activeStudents / stats.totalStudents) * 100) 
            : 0;

        console.log('Successfully fetched enhanced dashboard stats:', {
            totalStudents: stats.totalStudents,
            totalSubjects: stats.totalSubjects,
            totalClasses: stats.totalClasses,
            totalResults: stats.totalResults,
            completionRate: stats.resultCompletionRate
        });

        res.json({ 
            success: true, 
            data: stats,
            message: 'Dashboard statistics loaded successfully'
        });

    } catch (err) {
        console.error("Database query error on dashboard:", err.message);
        res.status(500).json({ 
            success: false, 
            message: "Failed to load dashboard statistics",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Get real-time system status
exports.getSystemStatus = async (req, res) => {
    try {
        console.log('Fetching system status...');
        
        // Check database connection
        const [pingResult] = await db.execute("SELECT 1 as ping");
        
        // Get system metrics
        const systemInfo = {
            database: pingResult[0].ping === 1 ? 'connected' : 'disconnected',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        };
        
        res.json({
            success: true,
            data: systemInfo,
            message: 'System status retrieved successfully'
        });
        
    } catch (err) {
        console.error('System status error:', err.message);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve system status'
        });
    }
};

// Get chart data for dashboard
exports.getChartData = async (req, res) => {
    try {
        console.log('Fetching chart data...');
        
        // Monthly student registrations
        const [monthlyRegistrations] = await db.execute(`
            SELECT 
                DATE_FORMAT(RegDate, '%Y-%m') as month,
                COUNT(StudentId) as count
            FROM tblstudents 
            WHERE RegDate >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(RegDate, '%Y-%m')
            ORDER BY month
        `);
        
        // Results by class
        const [resultsByClass] = await db.execute(`
            SELECT 
                c.ClassName,
                c.Section,
                COUNT(DISTINCT r.StudentId) as resultCount
            FROM tblclasses c
            LEFT JOIN tblstudents s ON c.id = s.ClassId
            LEFT JOIN tblresult r ON s.StudentId = r.StudentId
            GROUP BY c.id, c.ClassName, c.Section
            ORDER BY resultCount DESC
        `);
        
        const chartData = {
            monthlyRegistrations: monthlyRegistrations[0] || [],
            resultsByClass: resultsByClass[0] || []
        };
        
        res.json({
            success: true,
            data: chartData,
            message: 'Chart data loaded successfully'
        });
        
    } catch (err) {
        console.error('Chart data error:', err.message);
        res.status(500).json({
            success: false,
            message: 'Failed to load chart data'
        });
    }
};