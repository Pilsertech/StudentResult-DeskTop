const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');

// Subject CRUD routes
router.post('/create', subjectController.createSubject);
router.get('/', subjectController.getAllSubjects);
router.get('/:id', subjectController.getSubjectById);
router.put('/:id', subjectController.updateSubject);
router.delete('/:id', subjectController.deleteSubject);

// Subject combination routes
router.post('/combinations/create', subjectController.createSubjectCombination);
router.get('/combinations', subjectController.getAllSubjectCombinations);
router.get('/combinations/details', subjectController.getAllSubjectCombinationsWithDetails);
router.put('/combinations/:id/status', subjectController.updateSubjectCombinationStatus);
router.delete('/combinations/:id', subjectController.deleteSubjectCombination);

// Dropdown data routes
router.get('/dropdown/classes', subjectController.getAllClasses);
router.get('/dropdown/subjects', subjectController.getAllSubjectsForDropdown);

module.exports = router;