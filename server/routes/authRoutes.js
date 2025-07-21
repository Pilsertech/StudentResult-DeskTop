const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Your existing login route
router.post('/login', authController.login);

// NEW: Password change route
router.post('/change-password', authController.changePassword);

// NEW: Profile route (optional)
router.get('/profile', authController.getProfile);

module.exports = router;