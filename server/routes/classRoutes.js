// server/routes/classRoutes.js
// Routes for Class CRUD operations

const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');

// Get all classes
router.get('/', classController.getAllClasses);

// Create a class
router.post('/create', classController.createClass);

// Get a class by ID
router.get('/:id', classController.getClassById);

// Update a class by ID
router.put('/:id', classController.updateClass);

// Delete a class by ID
router.delete('/:id', classController.deleteClass);

module.exports = router;