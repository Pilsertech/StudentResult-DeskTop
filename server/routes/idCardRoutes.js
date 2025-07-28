const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();
const idCardController = require('../controllers/idCardController');

// Enhanced multer configuration for professional template uploads
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const tempDir = path.join(__dirname, '../uploads/temp/');
        try {
            await fs.mkdir(tempDir, { recursive: true });
            cb(null, tempDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + sanitizedName);
    }
});

// Enhanced file filter with size validation
const fileFilter = (req, file, cb) => {
    console.log(`📁 File upload attempt: ${file.originalname} (${file.mimetype})`);
    
    const allowedTypes = /jpeg|jpg|png|pdf|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || 
                    file.mimetype === 'application/pdf' || 
                    file.mimetype === 'image/svg+xml';
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, JPG, PNG, SVG) and PDF files are allowed'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit for templates
        files: 5 // Max 5 files per request
    },
    fileFilter: fileFilter
});

// Custom asset upload configuration (2MB limit)
const assetUpload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit for custom assets
        files: 1
    },
    fileFilter: fileFilter
});

// ==========================================
// PROFESSIONAL TEMPLATE MANAGEMENT ROUTES
// ==========================================

// Enhanced template upload with professional editor support
router.post('/templates/upload', 
    upload.fields([
        { name: 'frontImage', maxCount: 1 },
        { name: 'backImage', maxCount: 1 }
    ]), 
    idCardController.uploadTemplate
);

// Get all templates with enhanced data
router.get('/templates', idCardController.getAllTemplates);

// Create or update template (professional canvas editor)
router.post('/templates/save', idCardController.createOrUpdateTemplate);
router.put('/templates/:id', idCardController.createOrUpdateTemplate);

// Template positioning updates (legacy compatibility)
router.put('/templates/:id/positions', idCardController.updateTemplatePositions);

// Get single template with full data
router.get('/templates/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT t.*, 
                   (CASE WHEN t.IsLocked = 1 THEN 'Locked' ELSE 'Unlocked' END) as LockStatus
            FROM tblidcard_templates t 
            WHERE t.id = ? AND t.IsActive = 1
        `;
        
        const db = require('../config/database');
        const [templates] = await db.execute(query, [id]);
        
        if (templates.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        const template = templates[0];
        
        // Process JSON fields
        const processedTemplate = {
            ...template,
            ElementData: JSON.parse(template.ElementData || '{}'),
            PositionDataPixel: JSON.parse(template.PositionDataPixel || '{}'),
            PositionDataPercent: JSON.parse(template.PositionDataPercent || '{}'),
            AssignedClasses: JSON.parse(template.AssignedClasses || '[]'),
            CustomAssets: JSON.parse(template.CustomAssets || '[]'),
            GridSettings: JSON.parse(template.GridSettings || '{}'),
            PreviousVersions: JSON.parse(template.PreviousVersions || '[]'),
            UndoHistory: JSON.parse(template.UndoHistory || '[]')
        };

        res.json({
            success: true,
            template: processedTemplate
        });

    } catch (error) {
        console.error('❌ Error fetching template:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching template: ' + error.message
        });
    }
});

// Delete template
router.delete('/templates/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = require('../config/database');
        
        // Soft delete (set IsActive = 0)
        await db.execute('UPDATE tblidcard_templates SET IsActive = 0 WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Template deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error deleting template:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting template: ' + error.message
        });
    }
});

// Template locking/unlocking
router.put('/templates/:id/lock', async (req, res) => {
    try {
        const { id } = req.params;
        const { locked } = req.body;
        const db = require('../config/database');
        
        const lockStatus = locked ? 1 : 0;
        const lockedBy = locked ? 1 : null; // Default admin user
        const lockedAt = locked ? new Date().toISOString() : null;
        
        await db.execute(
            'UPDATE tblidcard_templates SET IsLocked = ?, LockedBy = ?, LockedAt = ? WHERE id = ?',
            [lockStatus, lockedBy, lockedAt, id]
        );
        
        res.json({
            success: true,
            message: locked ? 'Template locked successfully' : 'Template unlocked successfully'
        });

    } catch (error) {
        console.error('❌ Error updating template lock:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating template lock: ' + error.message
        });
    }
});

// ==========================================
// CUSTOM ASSET MANAGEMENT ROUTES
// ==========================================

// Upload custom assets (logos, graphics, shapes)
router.post('/assets/upload', 
    assetUpload.single('assetFile'), 
    idCardController.uploadCustomAsset
);

// Get all custom assets
router.get('/assets', async (req, res) => {
    try {
        const { type } = req.query;
        const db = require('../config/database');
        
        let query = `
            SELECT * FROM tblidcard_custom_assets 
            ORDER BY CreatedAt DESC
        `;
        let params = [];
        
        if (type) {
            query = `
                SELECT * FROM tblidcard_custom_assets 
                WHERE AssetType = ?
                ORDER BY CreatedAt DESC
            `;
            params = [type];
        }
        
        const [assets] = await db.execute(query, params);
        
        res.json({
            success: true,
            assets: assets
        });

    } catch (error) {
        console.error('❌ Error fetching assets:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching assets: ' + error.message
        });
    }
});

// Delete custom asset
router.delete('/assets/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = require('../config/database');
        
        // Get asset info before deletion
        const [assets] = await db.execute('SELECT * FROM tblidcard_custom_assets WHERE id = ?', [id]);
        
        if (assets.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Asset not found'
            });
        }

        const asset = assets[0];
        
        // Delete file from filesystem
        try {
            const filePath = path.join(__dirname, '../uploads', asset.FilePath);
            await fs.unlink(filePath);
            
            if (asset.ThumbnailPath) {
                const thumbPath = path.join(__dirname, '../uploads', asset.ThumbnailPath);
                await fs.unlink(thumbPath);
            }
        } catch (fileError) {
            console.warn('⚠️ Could not delete asset files:', fileError.message);
        }
        
        // Delete from database
        await db.execute('DELETE FROM tblidcard_custom_assets WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Asset deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error deleting asset:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting asset: ' + error.message
        });
    }
});

// ==========================================
// CLASS MANAGEMENT ROUTES
// ==========================================

// Get active classes for assignment dropdown
router.get('/classes', idCardController.getActiveClasses);

// ==========================================
// CARD GENERATION ROUTES
// ==========================================

// Enhanced card generation with batch limits
router.post('/generate/single', idCardController.generateSingleCard);
router.post('/generate/bulk', async (req, res) => {
    try {
        const { studentIds } = req.body;
        
        // Enforce maximum batch size of 50
        if (studentIds && studentIds.length > 50) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 50 students can be processed at once to prevent system overload'
            });
        }
        
        // Call controller
        return idCardController.generateBulkCards(req, res);

    } catch (error) {
        console.error('❌ Error in bulk generation route:', error);
        res.status(500).json({
            success: false,
            message: 'Error in bulk generation: ' + error.message
        });
    }
});

// Generate cards for entire class
router.post('/generate/class/:classId', async (req, res) => {
    try {
        const { classId } = req.params;
        const { templateId, options } = req.body;
        
        // Get students in class (max 50 check)
        const db = require('../config/database');
        const [students] = await db.execute(
            'SELECT StudentId FROM tblstudents WHERE ClassId = ? AND Status = 1 LIMIT 51',
            [classId]
        );
        
        if (students.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No active students found in selected class'
            });
        }
        
        if (students.length > 50) {
            return res.status(400).json({
                success: false,
                message: `Class has ${students.length} students. Maximum 50 students can be processed at once. Please use bulk selection to choose specific students.`
            });
        }
        
        // Convert to bulk generation
        req.body.studentIds = students.map(s => s.StudentId);
        req.body.templateId = templateId;
        req.body.options = options;
        
        return idCardController.generateBulkCards(req, res);

    } catch (error) {
        console.error('❌ Error in class generation route:', error);
        res.status(500).json({
            success: false,
            message: 'Error in class generation: ' + error.message
        });
    }
});

// ==========================================
// FILE SERVING ROUTES
// ==========================================

// Serve generated cards
router.get('/cards/:filename', idCardController.serveCard);

// Serve template images
router.get('/templates/images/:filename', idCardController.serveTemplate);

// Serve custom assets
router.get('/assets/files/:type/:filename', async (req, res) => {
    try {
        const { type, filename } = req.params;
        const filePath = path.join(__dirname, '../uploads/custom-assets', type, filename);
        
        await fs.access(filePath);
        res.sendFile(filePath);
    } catch (error) {
        res.status(404).json({
            success: false,
            message: 'Asset file not found'
        });
    }
});

// ==========================================
// DATA VALIDATION ROUTES
// ==========================================

// Validate student data before generation
router.post('/validate/students', async (req, res) => {
    try {
        const { studentIds } = req.body;
        const db = require('../config/database');
        
        const errors = [];
        const validStudents = [];
        
        for (const studentId of studentIds) {
            const [students] = await db.execute(`
                SELECT s.*, c.ClassName, c.Section
                FROM tblstudents s
                JOIN tblclasses c ON c.id = s.ClassId
                WHERE s.StudentId = ? AND s.Status = 1
            `, [studentId]);
            
            if (students.length === 0) {
                errors.push({
                    studentId,
                    error: 'Student not found or inactive'
                });
            } else {
                const student = students[0];
                const studentErrors = [];
                
                // Validate required fields
                if (!student.StudentName) studentErrors.push('Missing student name');
                if (!student.RollId) studentErrors.push('Missing roll ID');
                if (!student.ClassName) studentErrors.push('Missing class information');
                
                if (studentErrors.length > 0) {
                    errors.push({
                        studentId,
                        studentName: student.StudentName,
                        rollId: student.RollId,
                        className: `${student.ClassName} ${student.Section}`,
                        errors: studentErrors
                    });
                } else {
                    validStudents.push({
                        studentId,
                        studentName: student.StudentName,
                        rollId: student.RollId,
                        className: `${student.ClassName} ${student.Section}`
                    });
                }
            }
        }
        
        res.json({
            success: true,
            validStudents,
            errors,
            summary: {
                total: studentIds.length,
                valid: validStudents.length,
                invalid: errors.length
            }
        });

    } catch (error) {
        console.error('❌ Error validating students:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating students: ' + error.message
        });
    }
});

// ==========================================
// ERROR HANDLING MIDDLEWARE
// ==========================================

router.use((error, req, res, next) => {
    console.error('❌ ID Card Routes Error:', error);
    
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 10MB for templates and 2MB for assets.'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum 5 files per upload.'
            });
        }
    }
    
    res.status(500).json({
        success: false,
        message: error.message || 'Internal server error in ID card system'
    });
});

module.exports = router;
