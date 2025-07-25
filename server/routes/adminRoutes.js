const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// System settings routes
router.get('/settings', adminController.getSystemSettings);
router.put('/settings', adminController.updateSystemSettings);

// Database backup routes
router.post('/backup', adminController.backupDatabase);
router.get('/backups', adminController.listBackups);
router.get('/backups/:filename/download', adminController.downloadBackup);
router.post('/restore', adminController.restoreDatabase);
router.delete('/backups/:filename', adminController.deleteBackup);

// System maintenance route
router.post('/maintenance', adminController.runMaintenance);

module.exports = router;
router.get('/backups', adminController.listBackups);
router.get('/backups/:filename/download', adminController.downloadBackup); // NEW
router.post('/restore', adminController.restoreDatabase);
router.delete('/backups/:filename', adminController.deleteBackup);

// System maintenance route
router.post('/maintenance', adminController.runMaintenance); // NEW

module.exports = router;
