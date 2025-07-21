const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Student CRUD routes
router.post('/create', studentController.createStudent);
router.get('/', studentController.getAllStudents);
router.get('/:id', studentController.getStudentById);
router.put('/:id', studentController.updateStudent);
router.put('/:id/status', studentController.updateStudentStatus);
router.delete('/:id', studentController.deleteStudent);

module.exports = router;