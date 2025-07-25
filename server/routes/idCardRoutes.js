const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const idCardController = require('../controllers/idCardController');

// Configure multer for template uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/temp/'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf';
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, JPG, PNG) and PDF files are allowed'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: fileFilter
});

// Template management routes
router.post('/templates/upload', 
    upload.fields([
        { name: 'frontImage', maxCount: 1 },
        { name: 'backImage', maxCount: 1 }
    ]), 
    idCardController.uploadTemplate
);

router.get('/templates', idCardController.getAllTemplates);
router.put('/templates/:id/positions', idCardController.updateTemplatePositions);

// Card generation routes
router.post('/generate/single', idCardController.generateSingleCard);
router.post('/generate/bulk', idCardController.generateBulkCards);

// File serving routes
router.get('/cards/:filename', idCardController.serveCard);
router.get('/templates/:filename', idCardController.serveTemplate);

module.exports = router;
