const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Dashboard statistics
router.get('/stats', dashboardController.getDashboardStats);

// System status
router.get('/system-status', dashboardController.getSystemStatus);

// Chart data
router.get('/chart-data', dashboardController.getChartData);

// REMOVE THIS LINE COMPLETELY - IT'S CAUSING THE ERROR:
// router.get('/dashboard/stats', ResultController.getDashboardStats);

module.exports = router;