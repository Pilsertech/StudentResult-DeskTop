const db = require('../config/database');

// Get comprehensive dashboard statistics
exports.getDashboardStats = async (req, res) => {
    console.log('🔄 Fetching dashboard stats...');

    try {
        // Test database connection first
        const isConnected = await db.testConnection();
        if (!isConnected) {
            throw new Error('Database connection failed');
        }

        // Execute all queries with better error handling
        const queries = [
            { name: 'totalStudents', sql: "SELECT COUNT(StudentId) as count FROM tblstudents" },
            { name: 'totalSubjects', sql: "SELECT COUNT(id) as count FROM tblsubjects" },
            { name: 'totalClasses', sql: "SELECT COUNT(id) as count FROM tblclasses" },
            { name: 'totalResults', sql: "SELECT COUNT(DISTINCT StudentId) as count FROM tblresult" },
            { name: 'activeStudents', sql: "SELECT COUNT(StudentId) as count FROM tblstudents WHERE Status = 1" }
        ];

        const results = {};
        
        // Execute queries one by one for better error tracking
        for (const query of queries) {
            try {
                console.log(`🔍 Executing ${query.name} query...`);
                const [result] = await db.execute(query.sql);
                results[query.name] = result[0]?.count || 0;
                console.log(`✅ ${query.name}: ${results[query.name]}`);
            } catch (queryError) {
                console.error(`❌ ${query.name} query failed:`, queryError.message);
                results[query.name] = 0; // Default to 0 on error
            }
        }

        // Calculate derived metrics
        const stats = {
            totalStudents: results.totalStudents || 0,
            totalSubjects: results.totalSubjects || 0,
            totalClasses: results.totalClasses || 0,
            totalResults: results.totalResults || 0,
            activeStudents: results.activeStudents || 0,
            
            // Calculated metrics
            inactiveStudents: Math.max(0, (results.totalStudents || 0) - (results.activeStudents || 0)),
            resultCompletionRate: results.totalStudents > 0 
                ? Math.round((results.totalResults / results.totalStudents) * 100) 
                : 0,
            
            // System info
            lastUpdated: new Date().toISOString(),
            systemStatus: 'operational'
        };

        console.log('✅ Dashboard stats compiled successfully:', stats);

        res.json({ 
            success: true, 
            data: stats,
            message: 'Dashboard statistics loaded successfully'
        });

    } catch (err) {
        console.error("❌ Dashboard controller error:", err.message);
        console.error("📋 Full error:", err);
        
        // Return fallback data instead of error
        const fallbackStats = {
            totalStudents: 0,
            totalSubjects: 0,
            totalClasses: 0,
            totalResults: 0,
            activeStudents: 0,
            inactiveStudents: 0,
            resultCompletionRate: 0,
            lastUpdated: new Date().toISOString(),
            systemStatus: 'error'
        };
        
        res.status(200).json({ 
            success: true, 
            data: fallbackStats,
            message: "Using fallback data due to database error",
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