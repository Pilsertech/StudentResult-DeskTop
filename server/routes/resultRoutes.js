const express = require('express');
const router = express.Router();
const ResultController = require('../controllers/resultController');

// Logging middleware for result routes
router.use((req, res, next) => {
    console.log(`📊 Result API: ${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

// ========== BASIC DATA ROUTES ==========
// Get all classes (for dropdown)
router.get('/classes', ResultController.getClasses);

// Get students by class (for dropdown)
router.get('/students/:classId', ResultController.getStudentsByClass);

// Get subjects by class (for form generation)
router.get('/subjects/:classId', ResultController.getSubjectsByClass);

// ========== RESULT MANAGEMENT ROUTES ==========
// Get existing results for a student (for warnings)
router.get('/student-results/:studentId/:classId', ResultController.getStudentResults);

// Submit new results (main form submission)
router.post('/results', ResultController.submitResults);

// Get students with results (for manage results page)
router.get('/students-with-results', ResultController.getStudentsWithResults);

// Get detailed student results (for PDF download and edit page)
router.get('/student-detailed/:studentId', ResultController.getStudentDetailedResults);

// Update student results (for edit functionality)
router.put('/students/:studentId', ResultController.updateStudentResults);

// Delete student results (for manage results page)
router.delete('/students/:studentId', ResultController.deleteStudentResults);

// ========== DASHBOARD AND STATISTICS ROUTES ==========
// Get dashboard statistics (for dashboard page) - MAIN DASHBOARD ROUTE
router.get('/dashboard/stats', ResultController.getDashboardStats);

// Get class-wise result summary (for reports)
router.get('/class-wise-results', ResultController.getClassWiseResults);

// Get subject-wise result summary (for reports)
router.get('/subject-wise-results', ResultController.getSubjectWiseResults);

// ========== PUBLIC RESULT DISPLAY ROUTES (for result.php conversion) ==========
// Get student by roll ID and class (for public result display)
router.get('/student-by-roll/:rollId/:classId', ResultController.getStudentByRoll);

// Get student results by roll ID and class (for public result display)
router.get('/student-results-by-roll/:rollId/:classId', ResultController.getStudentResultsByRoll);

// ========== ADDITIONAL UTILITY ROUTES ==========
// Get result statistics for specific class
router.get('/class-stats/:classId', (req, res, next) => {
    req.params.classFilter = req.params.classId;
    ResultController.getClassWiseResults(req, res, next);
});

// Enhanced dashboard stats with more details
router.get('/enhanced-stats', ResultController.getDashboardStats);

// Validation route - check if student has results
router.get('/validate-student/:rollId/:classId', async (req, res) => {
    try {
        const { rollId, classId } = req.params;
        
        // Check if student exists
        const studentResponse = await ResultController.getStudentByRoll(
            { params: { rollId, classId } }, 
            {
                json: (data) => {
                    if (data.success) {
                        res.json({ 
                            success: true, 
                            hasStudent: true,
                            student: data.student 
                        });
                    } else {
                        res.json({ 
                            success: true, 
                            hasStudent: false 
                        });
                    }
                }
            }
        );
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to validate student',
            error: error.message
        });
    }
});

// Health check route for result system
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Result Management System API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// ========== ERROR HANDLING MIDDLEWARE ==========
// Error handling middleware
router.use((error, req, res, next) => {
    console.error('❌ Result API Error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error in result operations',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Server error',
        timestamp: new Date().toISOString()
    });
});

// 404 handler for undefined routes
router.use('*', (req, res) => {
    console.warn(`⚠️ 404 - Result API endpoint not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        message: `Result API endpoint not found: ${req.method} ${req.originalUrl}`,
        availableRoutes: [
            'GET /api/results/classes',
            'GET /api/results/students/:classId',
            'GET /api/results/subjects/:classId',
            'POST /api/results/results',
            'GET /api/results/dashboard/stats',
            'GET /api/results/students-with-results',
            'GET /api/results/student-by-roll/:rollId/:classId',
            'GET /api/results/health'
        ],
        timestamp: new Date().toISOString()
    });
});

module.exports = router;