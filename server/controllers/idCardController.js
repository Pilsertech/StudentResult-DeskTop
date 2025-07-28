const db = require('../config/database');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const QRCode = require('qrcode');
const JsBarcode = require('jsbarcode');
const { createCanvas } = require('canvas');
const { v4: uuidv4 } = require('uuid');

// Enhanced Template Management for Professional Canvas Editor

// Create/Update template with enhanced schema
const createOrUpdateTemplate = async (req, res) => {
    try {
        console.log('📝 Creating/updating template for professional canvas editor');
        
        const { 
            id, 
            templateName, 
            assignedClasses, 
            canvasWidth, 
            canvasHeight,
            elementData,
            positionDataPixel,
            positionDataPercent,
            customAssets,
            gridSettings
        } = req.body;

        // Validate required fields
        if (!templateName || templateName.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Template name is required'
            });
        }

        // Parse JSON fields safely
        const parsedElementData = typeof elementData === 'string' ? JSON.parse(elementData || '{}') : elementData || {};
        const parsedPositionPixel = typeof positionDataPixel === 'string' ? JSON.parse(positionDataPixel || '{}') : positionDataPixel || {};
        const parsedPositionPercent = typeof positionDataPercent === 'string' ? JSON.parse(positionDataPercent || '{}') : positionDataPercent || {};
        const parsedAssignedClasses = typeof assignedClasses === 'string' ? JSON.parse(assignedClasses || '[]') : assignedClasses || [];
        const parsedCustomAssets = typeof customAssets === 'string' ? JSON.parse(customAssets || '[]') : customAssets || [];
        const parsedGridSettings = typeof gridSettings === 'string' ? JSON.parse(gridSettings || '{}') : gridSettings || {
            enabled: true,
            size: 10,
            snapEnabled: true,
            snapThreshold: 10,
            snapToElements: true,
            snapToEdges: true
        };

        let query, params;

        if (id) {
            // Update existing template with version increment
            const versionQuery = 'SELECT VersionNumber, ElementData FROM tblidcard_templates WHERE id = ?';
            const [versionResult] = await db.execute(versionQuery, [id]);
            
            if (versionResult.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Template not found'
                });
            }

            const currentVersion = versionResult[0].VersionNumber || 1;
            const newVersion = currentVersion + 1;

            // Store previous version
            const previousVersionData = {
                version: currentVersion,
                elementData: JSON.parse(versionResult[0].ElementData || '{}'),
                savedAt: new Date().toISOString()
            };

            query = `
                UPDATE tblidcard_templates SET
                    TemplateName = ?,
                    AssignedClasses = ?,
                    CanvasWidth = ?,
                    CanvasHeight = ?,
                    ElementData = ?,
                    PositionDataPixel = ?,
                    PositionDataPercent = ?,
                    VersionNumber = ?,
                    PreviousVersions = JSON_ARRAY_APPEND(
                        COALESCE(PreviousVersions, JSON_ARRAY()), 
                        '$', 
                        ?
                    ),
                    CustomAssets = ?,
                    GridSettings = ?,
                    UpdatedAt = NOW()
                WHERE id = ?
            `;

            params = [
                templateName.trim(),
                JSON.stringify(parsedAssignedClasses),
                canvasWidth || null,
                canvasHeight || null,
                JSON.stringify(parsedElementData),
                JSON.stringify(parsedPositionPixel),
                JSON.stringify(parsedPositionPercent),
                newVersion,
                JSON.stringify(previousVersionData),
                JSON.stringify(parsedCustomAssets),
                JSON.stringify(parsedGridSettings),
                id
            ];
        } else {
            // Create new template
            query = `
                INSERT INTO tblidcard_templates (
                    TemplateName, AssignedClasses, CanvasWidth, CanvasHeight,
                    ElementData, PositionDataPixel, PositionDataPercent,
                    VersionNumber, CustomAssets, GridSettings, IsActive, CreatedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())
            `;

            params = [
                templateName.trim(),
                JSON.stringify(parsedAssignedClasses),
                canvasWidth || null,
                canvasHeight || null,
                JSON.stringify(parsedElementData),
                JSON.stringify(parsedPositionPixel),
                JSON.stringify(parsedPositionPercent),
                1, // Initial version
                JSON.stringify(parsedCustomAssets),
                JSON.stringify(parsedGridSettings)
            ];
        }

        const [result] = await db.execute(query, params);
        const templateId = id || result.insertId;

        console.log('✅ Template saved successfully:', templateId);

        res.json({
            success: true,
            message: id ? 'Template updated successfully' : 'Template created successfully',
            data: {
                templateId,
                templateName: templateName.trim(),
                version: id ? (await getTemplateVersion(templateId)) : 1
            }
        });

    } catch (error) {
        console.error('❌ Error saving template:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving template: ' + error.message
        });
    }
};

// Enhanced template upload with professional editor support
const uploadTemplate = async (req, res) => {
    try {
        console.log('📤 Professional template upload request received');
        console.log('Body keys:', Object.keys(req.body));
        console.log('Files:', req.files ? Object.keys(req.files) : 'No files');
        
        const { templateName, assignedClasses } = req.body;
        
        if (!templateName || templateName.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Template name is required'
            });
        }
        
        if (!req.files || !req.files.frontImage) {
            return res.status(400).json({
                success: false,
                message: 'Front template image is required'
            });
        }

        // Create templates directory
        const templatesDir = path.join(__dirname, '../uploads/id-templates');
        await fs.mkdir(templatesDir, { recursive: true });

        // Process front image with size validation (max 2000px)
        const frontFile = req.files.frontImage[0];
        const frontFileName = `front_${Date.now()}_${Math.round(Math.random() * 1E9)}.jpg`;
        const frontPath = path.join(templatesDir, frontFileName);
        
        console.log('📸 Processing front image:', frontFile.originalname);
        
        // Get image dimensions to validate size limit
        const frontMetadata = await sharp(frontFile.path).metadata();
        const maxDimension = Math.max(frontMetadata.width, frontMetadata.height);
        
        if (maxDimension > 2000) {
            // Clean up temp file
            await fs.unlink(frontFile.path).catch(() => {});
            return res.status(400).json({
                success: false,
                message: `Image too large. Maximum dimension is 2000px, but image is ${maxDimension}px`
            });
        }

        await sharp(frontFile.path)
            .jpeg({ quality: 95 })
            .toFile(frontPath);

        // Process back image if provided
        let backFileName = null;
        let backDimensions = null;
        if (req.files.backImage && req.files.backImage[0]) {
            const backFile = req.files.backImage[0];
            
            // Validate back image size
            const backMetadata = await sharp(backFile.path).metadata();
            const backMaxDimension = Math.max(backMetadata.width, backMetadata.height);
            
            if (backMaxDimension > 2000) {
                // Clean up temp files
                await fs.unlink(frontFile.path).catch(() => {});
                await fs.unlink(backFile.path).catch(() => {});
                return res.status(400).json({
                    success: false,
                    message: `Back image too large. Maximum dimension is 2000px, but image is ${backMaxDimension}px`
                });
            }

            backFileName = `back_${Date.now()}_${Math.round(Math.random() * 1E9)}.jpg`;
            const backPath = path.join(templatesDir, backFileName);
            
            console.log('📸 Processing back image:', backFile.originalname);
            
            await sharp(backFile.path)
                .jpeg({ quality: 95 })
                .toFile(backPath);

            backDimensions = { width: backMetadata.width, height: backMetadata.height };
        }

        // Parse assigned classes
        let parsedAssignedClasses = [];
        if (assignedClasses) {
            try {
                parsedAssignedClasses = typeof assignedClasses === 'string' ? 
                    JSON.parse(assignedClasses) : assignedClasses;
            } catch (error) {
                console.warn('⚠️ Failed to parse assigned classes:', error.message);
                parsedAssignedClasses = [];
            }
        }

        // Initialize empty template structure for professional editor
        const initialElementData = {
            elements: [],
            canvas: {
                front: { width: frontMetadata.width, height: frontMetadata.height },
                back: backDimensions || null
            },
            customAssets: [],
            undoHistory: [],
            gridSettings: {
                enabled: true,
                size: 10,
                snapEnabled: true,
                snapThreshold: 10,
                snapToElements: true,
                snapToEdges: true
            },
            layerSettings: {
                autoNaming: true,
                namingPattern: "{type} {number}"
            }
        };

        // Save template to enhanced database schema
        const insertQuery = `
            INSERT INTO tblidcard_templates 
            (TemplateName, FrontImagePath, BackImagePath, AssignedClasses, CanvasWidth, CanvasHeight,
             ElementData, PositionDataPixel, PositionDataPercent, VersionNumber, GridSettings, IsActive, CreatedAt) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 1, NOW())
        `;
        
        const [result] = await db.execute(insertQuery, [
            templateName.trim(),
            `id-templates/${frontFileName}`,
            backFileName ? `id-templates/${backFileName}` : null,
            JSON.stringify(parsedAssignedClasses),
            frontMetadata.width,
            frontMetadata.height,
            JSON.stringify(initialElementData),
            JSON.stringify({}), // Initial empty pixel positions
            JSON.stringify({}), // Initial empty percent positions
            JSON.stringify(initialElementData.gridSettings)
        ]);

        // Clean up temp files
        try {
            await fs.unlink(frontFile.path);
            if (req.files.backImage && req.files.backImage[0]) {
                await fs.unlink(req.files.backImage[0].path);
            }
        } catch (cleanupError) {
            console.warn('⚠️ Failed to clean up temp files:', cleanupError.message);
        }

        console.log('✅ Professional template uploaded successfully:', result.insertId);

        res.json({
            success: true,
            message: 'Template uploaded successfully',
            data: {
                templateId: result.insertId,
                templateName: templateName.trim(),
                frontPath: `id-templates/${frontFileName}`,
                backPath: backFileName ? `id-templates/${backFileName}` : null,
                canvasSize: {
                    width: frontMetadata.width,
                    height: frontMetadata.height
                },
                assignedClasses: parsedAssignedClasses
            }
        });

    } catch (error) {
        console.error('❌ Error uploading professional template:', error);
        
        // Clean up any temp files on error
        try {
            if (req.files?.frontImage?.[0]?.path) {
                await fs.unlink(req.files.frontImage[0].path);
            }
            if (req.files?.backImage?.[0]?.path) {
                await fs.unlink(req.files.backImage[0].path);
            }
        } catch (cleanupError) {
            console.warn('⚠️ Failed to clean up temp files on error:', cleanupError.message);
        }
        
        res.status(500).json({
            success: false,
            message: 'Error uploading template: ' + error.message
        });
    }
};

// Get all templates with enhanced data
const getAllTemplates = async (req, res) => {
    try {
        const query = `
            SELECT 
                t.*,
                COUNT(g.id) as CardsGenerated,
                (CASE WHEN t.IsLocked = 1 THEN 'Locked' ELSE 'Unlocked' END) as LockStatus
            FROM tblidcard_templates t
            LEFT JOIN tblidcard_generated g ON t.id = g.TemplateId
            WHERE t.IsActive = 1
            GROUP BY t.id
            ORDER BY t.CreatedAt DESC
        `;
        
        const [templates] = await db.execute(query);
        
        // Process templates with enhanced data structure
        const processedTemplates = templates.map(template => ({
            ...template,
            ElementData: JSON.parse(template.ElementData || '{}'),
            PositionDataPixel: JSON.parse(template.PositionDataPixel || '{}'),
            PositionDataPercent: JSON.parse(template.PositionDataPercent || '{}'),
            AssignedClasses: JSON.parse(template.AssignedClasses || '[]'),
            CustomAssets: JSON.parse(template.CustomAssets || '[]'),
            GridSettings: JSON.parse(template.GridSettings || '{}'),
            PreviousVersions: JSON.parse(template.PreviousVersions || '[]'),
            UndoHistory: JSON.parse(template.UndoHistory || '[]')
        }));

        res.json({
            success: true,
            templates: processedTemplates
        });

    } catch (error) {
        console.error('❌ Error fetching enhanced templates:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching templates: ' + error.message
        });
    }
};

// Custom asset management
const uploadCustomAsset = async (req, res) => {
    try {
        const { assetName, assetType } = req.body;
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Asset file is required'
            });
        }

        // Validate file size (max 2MB)
        if (req.file.size > 2 * 1024 * 1024) {
            await fs.unlink(req.file.path).catch(() => {});
            return res.status(400).json({
                success: false,
                message: 'Asset file too large. Maximum size is 2MB'
            });
        }

        // Create custom assets directory
        const assetsDir = path.join(__dirname, '../uploads/custom-assets', assetType || 'other');
        await fs.mkdir(assetsDir, { recursive: true });

        // Process and save asset
        const assetFileName = `${assetType}_${Date.now()}_${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`;
        const assetPath = path.join(assetsDir, assetFileName);
        
        // Optimize image if it's an image file
        if (req.file.mimetype.startsWith('image/')) {
            await sharp(req.file.path)
                .resize(500, 500, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 90 })
                .toFile(assetPath);
        } else {
            // Copy non-image files directly
            await fs.copyFile(req.file.path, assetPath);
        }

        // Generate thumbnail for images
        let thumbnailPath = null;
        if (req.file.mimetype.startsWith('image/')) {
            const thumbnailFileName = `thumb_${assetFileName}`;
            thumbnailPath = path.join(assetsDir, thumbnailFileName);
            
            await sharp(req.file.path)
                .resize(100, 100, { fit: 'cover' })
                .jpeg({ quality: 80 })
                .toFile(thumbnailPath);
        }

        // Save asset metadata to database
        const insertQuery = `
            INSERT INTO tblidcard_custom_assets 
            (AssetName, AssetType, FilePath, FileName, FileSize, MimeType, ThumbnailPath, UploadedBy) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.execute(insertQuery, [
            assetName || req.file.originalname,
            assetType || 'other',
            `custom-assets/${assetType || 'other'}/${assetFileName}`,
            req.file.originalname,
            req.file.size,
            req.file.mimetype,
            thumbnailPath ? `custom-assets/${assetType || 'other'}/thumb_${assetFileName}` : null,
            1 // Default admin user
        ]);

        // Clean up temp file
        await fs.unlink(req.file.path).catch(() => {});

        console.log('✅ Custom asset uploaded successfully:', result.insertId);

        res.json({
            success: true,
            message: 'Custom asset uploaded successfully',
            data: {
                assetId: result.insertId,
                assetName: assetName || req.file.originalname,
                assetPath: `custom-assets/${assetType || 'other'}/${assetFileName}`,
                thumbnailPath: thumbnailPath ? `custom-assets/${assetType || 'other'}/thumb_${assetFileName}` : null
            }
        });

    } catch (error) {
        console.error('❌ Error uploading custom asset:', error);
        
        // Clean up temp file on error
        try {
            if (req.file?.path) {
                await fs.unlink(req.file.path);
            }
        } catch (cleanupError) {
            console.warn('⚠️ Failed to clean up temp file on error:', cleanupError.message);
        }
        
        res.status(500).json({
            success: false,
            message: 'Error uploading custom asset: ' + error.message
        });
    }
};

// Get active classes for assignment dropdown
const getActiveClasses = async (req, res) => {
    try {
        const query = `
            SELECT id, ClassName, Section, ClassNameNumeric
            FROM tblclasses 
            WHERE Status = 1 
            ORDER BY ClassNameNumeric ASC, Section ASC
        `;
        
        const [classes] = await db.execute(query);

        res.json({
            success: true,
            classes: classes
        });

    } catch (error) {
        console.error('❌ Error fetching active classes:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching classes: ' + error.message
        });
    }
};

// Helper function to get current template version
const getTemplateVersion = async (templateId) => {
    try {
        const [result] = await db.execute('SELECT VersionNumber FROM tblidcard_templates WHERE id = ?', [templateId]);
        return result[0]?.VersionNumber || 1;
    } catch (error) {
        console.warn('Could not get template version:', error);
        return 1;
    }
};

// Template Management

// Upload template
const uploadTemplateLegacy = async (req, res) => {
    try {
        console.log('📤 Upload template request received');
        console.log('Body keys:', Object.keys(req.body));
        console.log('Files:', req.files ? Object.keys(req.files) : 'No files');
        
        const { templateName, positionData } = req.body;
        
        if (!templateName || templateName.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Template name is required'
            });
        }
        
        if (!req.files || !req.files.frontImage) {
            return res.status(400).json({
                success: false,
                message: 'Front template image is required'
            });
        }

        // Create templates directory
        const templatesDir = path.join(__dirname, '../uploads/id-templates');
        await fs.mkdir(templatesDir, { recursive: true });

        // Process front image
        const frontFile = req.files.frontImage[0];
        const frontFileName = `front_${Date.now()}_${Math.round(Math.random() * 1E9)}.jpg`;
        const frontPath = path.join(templatesDir, frontFileName);
        
        console.log('📸 Processing front image:', frontFile.originalname);
        
        await sharp(frontFile.path)
            .resize(2000, 1200, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 95 })
            .toFile(frontPath);

        // Process back image if provided
        let backFileName = null;
        if (req.files.backImage && req.files.backImage[0]) {
            const backFile = req.files.backImage[0];
            backFileName = `back_${Date.now()}_${Math.round(Math.random() * 1E9)}.jpg`;
            const backPath = path.join(templatesDir, backFileName);
            
            console.log('📸 Processing back image:', backFile.originalname);
            
            await sharp(backFile.path)
                .resize(2000, 1200, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 95 })
                .toFile(backPath);
        }

        // Parse position data - handle both string and object
        let parsedPositionData = {};
        if (positionData) {
            try {
                parsedPositionData = typeof positionData === 'string' ? JSON.parse(positionData) : positionData;
                console.log('📊 Position data parsed successfully');
            } catch (error) {
                console.warn('⚠️ Failed to parse position data:', error.message);
                parsedPositionData = {};
            }
        }

        // Save template to database
        const insertQuery = `
            INSERT INTO tblidcard_templates 
            (TemplateName, FrontImagePath, BackImagePath, PositionData, IsActive, CreatedAt) 
            VALUES (?, ?, ?, ?, ?, NOW())
        `;
        
        const [result] = await db.execute(insertQuery, [
            templateName.trim(),
            `id-templates/${frontFileName}`,
            backFileName ? `id-templates/${backFileName}` : null,
            JSON.stringify(parsedPositionData),
            1
        ]);

        // Clean up temp files
        try {
            await fs.unlink(frontFile.path);
            if (req.files.backImage && req.files.backImage[0]) {
                await fs.unlink(req.files.backImage[0].path);
            }
        } catch (cleanupError) {
            console.warn('⚠️ Failed to clean up temp files:', cleanupError.message);
        }

        console.log('✅ Template uploaded successfully:', result.insertId);

        res.json({
            success: true,
            message: 'Template uploaded successfully',
            data: {
                templateId: result.insertId,
                templateName: templateName.trim(),
                frontPath: `id-templates/${frontFileName}`,
                backPath: backFileName ? `id-templates/${backFileName}` : null
            }
        });

    } catch (error) {
        console.error('❌ Error uploading template:', error);
        
        // Clean up any temp files on error
        try {
            if (req.files?.frontImage?.[0]?.path) {
                await fs.unlink(req.files.frontImage[0].path);
            }
            if (req.files?.backImage?.[0]?.path) {
                await fs.unlink(req.files.backImage[0].path);
            }
        } catch (cleanupError) {
            console.warn('⚠️ Failed to clean up temp files on error:', cleanupError.message);
        }
        
        res.status(500).json({
            success: false,
            message: 'Error uploading template: ' + error.message
        });
    }
};

// Get all templates
const getAllTemplatesLegacy = async (req, res) => {
    try {
        const query = `
            SELECT 
                t.*,
                COUNT(g.id) as CardsGenerated
            FROM tblidcard_templates t
            LEFT JOIN tblidcard_generated g ON t.id = g.TemplateId
            WHERE t.IsActive = 1
            GROUP BY t.id
            ORDER BY t.CreatedAt DESC
        `;
        
        const [templates] = await db.execute(query);
        
        // Parse JSON fields
        const processedTemplates = templates.map(template => ({
            ...template,
            PositionData: JSON.parse(template.PositionData || '{}'),
            AssignedClasses: JSON.parse(template.AssignedClasses || '[]')
        }));

        res.json({
            success: true,
            templates: processedTemplates
        });

    } catch (error) {
        console.error('Error fetching templates:', error);
        res.json({
            success: false,
            message: 'Error fetching templates'
        });
    }
};

// Update template positioning
const updateTemplatePositions = async (req, res) => {
    try {
        const { id } = req.params;
        const { positionData } = req.body;

        const updateQuery = `
            UPDATE tblidcard_templates 
            SET PositionData = ?, UpdatedAt = NOW() 
            WHERE id = ?
        `;
        
        await db.execute(updateQuery, [JSON.stringify(positionData), id]);

        res.json({
            success: true,
            message: 'Template positions updated successfully'
        });

    } catch (error) {
        console.error('Error updating template positions:', error);
        res.json({
            success: false,
            message: 'Error updating template positions'
        });
    }
};

// Card Generation

// Generate single ID card
const generateSingleCard = async (req, res) => {
    try {
        const { studentId, templateId } = req.body;

        // Get student data
        const studentQuery = `
            SELECT 
                s.*, 
                c.ClassName, 
                c.Section,
                s.QRCode,
                s.Barcode
            FROM tblstudents s
            JOIN tblclasses c ON c.id = s.ClassId
            WHERE s.StudentId = ?
        `;
        
        const [students] = await db.execute(studentQuery, [studentId]);
        if (students.length === 0) {
            return res.json({
                success: false,
                message: 'Student not found'
            });
        }

        // Get template data
        const templateQuery = 'SELECT * FROM tblidcard_templates WHERE id = ?';
        const [templates] = await db.execute(templateQuery, [templateId]);
        if (templates.length === 0) {
            return res.json({
                success: false,
                message: 'Template not found'
            });
        }

        const student = students[0];
        const template = templates[0];
        
        // Generate card
        const cardPaths = await generateCard(student, template);

        // Save generation record
        const insertQuery = `
            INSERT INTO tblidcard_generated 
            (StudentId, TemplateId, FrontCardPath, BackCardPath) 
            VALUES (?, ?, ?, ?)
        `;
        
        await db.execute(insertQuery, [
            studentId,
            templateId,
            cardPaths.front,
            cardPaths.back
        ]);

        res.json({
            success: true,
            message: 'ID card generated successfully',
            data: cardPaths
        });

    } catch (error) {
        console.error('Error generating card:', error);
        res.json({
            success: false,
            message: 'Error generating ID card: ' + error.message
        });
    }
};

// Generate bulk ID cards
const generateBulkCards = async (req, res) => {
    try {
        const { studentIds, templateId } = req.body;
        
        if (!studentIds || studentIds.length === 0) {
            return res.json({
                success: false,
                message: 'No students selected'
            });
        }

        const results = [];
        
        for (const studentId of studentIds) {
            try {
                // Generate card for each student
                const cardResult = await generateSingleCardInternal(studentId, templateId);
                results.push({
                    studentId,
                    success: true,
                    cardPaths: cardResult
                });
            } catch (error) {
                results.push({
                    studentId,
                    success: false,
                    error: error.message
                });
            }
        }

        const successCount = results.filter(r => r.success).length;
        
        res.json({
            success: true,
            message: `Generated ${successCount} out of ${studentIds.length} ID cards`,
            results
        });

    } catch (error) {
        console.error('Error in bulk generation:', error);
        res.json({
            success: false,
            message: 'Error in bulk generation: ' + error.message
        });
    }
};

// Internal card generation function
const generateSingleCardInternal = async (studentId, templateId) => {
    // Get student data
    const studentQuery = `
        SELECT 
            s.*, 
            c.ClassName, 
            c.Section,
            s.QRCode,
            s.Barcode
        FROM tblstudents s
        JOIN tblclasses c ON c.id = s.ClassId
        WHERE s.StudentId = ?
    `;
    
    const [students] = await db.execute(studentQuery, [studentId]);
    if (students.length === 0) {
        throw new Error('Student not found');
    }

    // Get template data
    const templateQuery = 'SELECT * FROM tblidcard_templates WHERE id = ?';
    const [templates] = await db.execute(templateQuery, [templateId]);
    if (templates.length === 0) {
        throw new Error('Template not found');
    }

    const student = students[0];
    const template = templates[0];
    
    // Generate card
    const cardPaths = await generateCard(student, template);

    // Save generation record
    const insertQuery = `
        INSERT INTO tblidcard_generated 
        (StudentId, TemplateId, FrontCardPath, BackCardPath) 
        VALUES (?, ?, ?, ?)
    `;
    
    await db.execute(insertQuery, [
        studentId,
        templateId,
        cardPaths.front,
        cardPaths.back
    ]);

    return cardPaths;
};

// Core card generation function
const generateCard = async (student, template) => {
    const cardsDir = path.join(__dirname, '../uploads/generated-cards');
    await fs.mkdir(cardsDir, { recursive: true });

    const positionData = JSON.parse(template.PositionData || '{}');
    const cardId = `${student.StudentId}_${Date.now()}`;

    // Generate front card
    const frontCardPath = await generateCardSide(
        student,
        template.FrontImagePath,
        positionData.front || {},
        `front_${cardId}.png`,
        'front'
    );

    // Generate back card if template has back side
    let backCardPath = null;
    if (template.BackImagePath) {
        backCardPath = await generateCardSide(
            student,
            template.BackImagePath,
            positionData.back || {},
            `back_${cardId}.png`,
            'back'
        );
    }

    return {
        front: `generated-cards/front_${cardId}.png`,
        back: backCardPath ? `generated-cards/back_${cardId}.png` : null
    };
};

// Generate individual card side
const generateCardSide = async (student, templatePath, positions, fileName, side) => {
    const canvas = createCanvas(1050, 650);
    const ctx = canvas.getContext('2d');

    // Load template image
    const templateFullPath = path.join(__dirname, '../uploads', templatePath);
    const Image = require('canvas').Image;
    const templateImage = new Image();
    
    return new Promise((resolve, reject) => {
        templateImage.onload = async () => {
            try {
                // Draw template background
                ctx.drawImage(templateImage, 0, 0, 1050, 650);

                // Apply positioned elements
                for (const [elementType, position] of Object.entries(positions)) {
                    await drawElement(ctx, elementType, position, student, side);
                }

                // Save to file
                const outputPath = path.join(__dirname, '../uploads/generated-cards', fileName);
                const buffer = canvas.toBuffer('image/png');
                await fs.writeFile(outputPath, buffer);
                
                resolve(outputPath);
            } catch (error) {
                reject(error);
            }
        };

        templateImage.onerror = reject;
        templateImage.src = templateFullPath;
    });
};

// Draw positioned elements on canvas
const drawElement = async (ctx, elementType, position, student, side) => {
    const { x, y, width, height, fontSize, fontFamily, color, align } = position;

    ctx.save();

    switch (elementType) {
        case 'studentName':
            drawText(ctx, student.StudentName, x, y, { fontSize, fontFamily, color, align });
            break;

        case 'rollId':
            drawText(ctx, student.RollId, x, y, { fontSize, fontFamily, color, align });
            break;

        case 'className':
            drawText(ctx, `${student.ClassName} ${student.Section}`, x, y, { fontSize, fontFamily, color, align });
            break;

        case 'studentId':
            drawText(ctx, student.StudentId.toString(), x, y, { fontSize, fontFamily, color, align });
            break;

        case 'photo':
            await drawPhoto(ctx, student, x, y, width, height);
            break;

        case 'qrCode':
            if (side === 'back') {
                await drawQRCode(ctx, student, x, y, width, height);
            }
            break;

        case 'barcode':
            if (side === 'front') {
                await drawBarcode(ctx, student, x, y, width, height);
            }
            break;
    }

    ctx.restore();
};

// Draw text with styling
const drawText = (ctx, text, x, y, options) => {
    const { fontSize = 16, fontFamily = 'Arial', color = '#000000', align = 'left' } = options;
    
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = 'top';
    
    ctx.fillText(text, x, y);
};

// Draw student photo
const drawPhoto = async (ctx, student, x, y, width, height) => {
    if (!student.PhotoPath) return;

    try {
        const photoPath = path.join(__dirname, '../uploads', student.PhotoPath);
        const Image = require('canvas').Image;
        const photoImage = new Image();
        
        return new Promise((resolve) => {
            photoImage.onload = () => {
                // Create circular clipping mask
                ctx.save();
                ctx.beginPath();
                ctx.arc(x + width/2, y + height/2, Math.min(width, height)/2, 0, Math.PI * 2);
                ctx.clip();
                
                ctx.drawImage(photoImage, x, y, width, height);
                ctx.restore();
                resolve();
            };
            
            photoImage.onerror = resolve; // Continue even if photo fails
            photoImage.src = photoPath;
        });
    } catch (error) {
        console.warn('Could not load student photo:', error);
    }
};

// Draw QR code
const drawQRCode = async (ctx, student, x, y, width, height) => {
    try {
        // Generate QR code if not exists
        let qrData = student.QRCode;
        if (!qrData) {
            qrData = JSON.stringify({
                type: 'student',
                studentId: student.StudentId,
                studentName: student.StudentName,
                rollId: student.RollId,
                className: `${student.ClassName} ${student.Section}`,
                issued: new Date().toISOString()
            });
        }

        const qrDataURL = await QRCode.toDataURL(qrData, {
            width: width,
            margin: 1
        });

        const Image = require('canvas').Image;
        const qrImage = new Image();
        
        return new Promise((resolve) => {
            qrImage.onload = () => {
                ctx.drawImage(qrImage, x, y, width, height);
                resolve();
            };
            qrImage.onerror = resolve;
            qrImage.src = qrDataURL;
        });
    } catch (error) {
        console.warn('Could not generate QR code:', error);
    }
};

// Draw barcode
const drawBarcode = async (ctx, student, x, y, width, height) => {
    try {
        const barcodeCanvas = createCanvas(width, height);
        
        JsBarcode(barcodeCanvas, student.RollId, {
            format: "CODE128",
            width: 2,
            height: height - 20,
            displayValue: true,
            fontSize: 12,
            textMargin: 5
        });

        ctx.drawImage(barcodeCanvas, x, y);
    } catch (error) {
        console.warn('Could not generate barcode:', error);
    }
};

// Serve generated cards
const serveCard = async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, '../uploads/generated-cards', filename);
        
        await fs.access(filePath);
        res.sendFile(filePath);
    } catch (error) {
        res.status(404).json({
            success: false,
            message: 'Card not found'
        });
    }
};

// Serve template images
const serveTemplate = async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, '../uploads/id-templates', filename);
        
        await fs.access(filePath);
        res.sendFile(filePath);
    } catch (error) {
        res.status(404).json({
            success: false,
            message: 'Template not found'
        });
    }
};

module.exports = {
    createOrUpdateTemplate,
    uploadTemplate,
    getAllTemplates,
    updateTemplatePositions: createOrUpdateTemplate, // Alias for backward compatibility
    uploadCustomAsset,
    getActiveClasses,
    generateSingleCard,
    generateBulkCards,
    serveCard,
    serveTemplate
};
