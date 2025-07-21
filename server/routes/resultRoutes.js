const express = require('express');
const router = express.Router();
const ResultController = require('../controllers/resultController');

// Logging middleware for result routes
router.use((req, res, next) => {
    console.log(`Result API: ${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

// Get all classes (for dropdown)
router.get('/classes', ResultController.getClasses);

// Get students by class (for dropdown)
router.get('/students/:classId', ResultController.getStudentsByClass);

// Get subjects by class (for form generation)
router.get('/subjects/:classId', ResultController.getSubjectsByClass);

// Get existing results for a student (for warnings)
router.get('/student-results/:studentId/:classId', ResultController.getStudentResults);

// Submit new results (main form submission)
router.post('/results', ResultController.submitResults);

// Get dashboard statistics (for dashboard page)
router.get('/dashboard/stats', ResultController.getDashboardStats);

// Add these routes to your existing resultRoutes.js

// Get students with results (for manage results page)
router.get('/students-with-results', ResultController.getStudentsWithResults);

// Get detailed student results (for PDF download)
router.get('/student-detailed/:studentId', ResultController.getStudentDetailedResults);

// Error handling middleware
router.use((error, req, res, next) => {
    console.error('Result API Error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error in result operations'
    });
});

module.exports = router;