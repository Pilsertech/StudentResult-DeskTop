const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Manual attendance marking
router.post('/mark', attendanceController.markAttendance);

// QR Code attendance
router.post('/mark/qr', attendanceController.markQRAttendance);
router.get('/qr/generate/:classId/:sessionId', attendanceController.generateQRCode);
router.post('/qr/validate', attendanceController.validateQRCode);

// Fingerprint attendance
router.post('/mark/fingerprint', attendanceController.markFingerprintAttendance);

// Bulk attendance
router.post('/mark/bulk', attendanceController.markBulkAttendance);

// Attendance retrieval
router.get('/today', attendanceController.getTodayAttendance);
router.get('/class/:classId/date/:date', attendanceController.getClassAttendance);
router.get('/student/:studentId', attendanceController.getStudentAttendance);
router.get('/date-range', attendanceController.getDateRangeAttendance);

// Sessions management
router.get('/sessions', attendanceController.getSessions);
router.post('/sessions', attendanceController.createSession);
router.put('/sessions/:id', attendanceController.updateSession);
router.delete('/sessions/:id', attendanceController.deleteSession);

// Settings management
router.get('/settings/:classId', attendanceController.getClassSettings);
router.put('/settings/:classId', attendanceController.updateClassSettings);

// Reports
router.get('/reports/daily', attendanceController.getDailyReport);
router.get('/reports/weekly', attendanceController.getWeeklyReport);
router.get('/reports/monthly', attendanceController.getMonthlyReport);
router.get('/reports/student/:studentId', attendanceController.getStudentReport);
router.get('/reports/custom', attendanceController.getCustomReport);

// Dashboard and analytics
router.get('/dashboard', attendanceController.getAttendanceDashboard);
router.get('/trends', attendanceController.getAttendanceTrends);

// Export functionality
router.get('/export/class/:classId', attendanceController.exportClassAttendance);
router.get('/export/student/:studentId', attendanceController.exportStudentAttendance);

module.exports = router;
