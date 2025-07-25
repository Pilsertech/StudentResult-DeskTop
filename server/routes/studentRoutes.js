const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Configure multer for photo uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/student-photos/'));
    },
    filename: function (req, file, cb) {
        // Generate unique filename: studentId_timestamp.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, `student_${uniqueSuffix}${fileExtension}`);
    }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (JPEG, JPG, PNG, GIF, WEBP)'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});

// Student CRUD routes
router.post('/create', studentController.createStudent);
router.get('/', studentController.getAllStudents);
router.get('/:id', studentController.getStudentById);
router.put('/:id', studentController.updateStudent);
router.put('/:id/status', studentController.updateStudentStatus);
router.delete('/:id', studentController.deleteStudent);

// Photo upload routes
router.post('/:id/photo', upload.single('photo'), studentController.uploadStudentPhoto);
router.delete('/:id/photo', studentController.deleteStudentPhoto);
router.get('/:id/photo', studentController.getStudentPhoto);

// Bulk photo upload for multiple students
router.post('/photos/bulk', upload.array('photos', 10), studentController.bulkUploadPhotos);

// Serve uploaded photos
router.get('/photos/:filename', studentController.servePhoto);

// QR Code and Barcode routes
router.get('/:id/qr', studentController.getStudentQR);
router.get('/:id/barcode', studentController.getStudentBarcode);

// Fingerprint routes
router.post('/:id/fingerprint', studentController.registerFingerprint);
router.get('/:id/fingerprint/status', studentController.getFingerprintStatus);

module.exports = router;