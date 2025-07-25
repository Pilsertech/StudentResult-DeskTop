const db = require('../config/database');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const QRCode = require('qrcode');
const JsBarcode = require('jsbarcode');
const { createCanvas } = require('canvas');

// Template Management

// Upload template
const uploadTemplate = async (req, res) => {
    try {
        const { templateName, assignedClasses, positionData } = req.body;
        
        if (!req.files || !req.files.frontImage) {
            return res.json({
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
        
        await sharp(frontFile.path)
            .resize(1050, 650, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 90 })
            .toFile(frontPath);

        // Process back image if provided
        let backFileName = null;
        if (req.files.backImage && req.files.backImage[0]) {
            const backFile = req.files.backImage[0];
            backFileName = `back_${Date.now()}_${Math.round(Math.random() * 1E9)}.jpg`;
            const backPath = path.join(templatesDir, backFileName);
            
            await sharp(backFile.path)
                .resize(1050, 650, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 90 })
                .toFile(backPath);
        }

        // Save template to database
        const insertQuery = `
            INSERT INTO tblidcard_templates 
            (TemplateName, FrontImagePath, BackImagePath, PositionData, AssignedClasses, IsActive) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.execute(insertQuery, [
            templateName,
            `id-templates/${frontFileName}`,
            backFileName ? `id-templates/${backFileName}` : null,
            JSON.stringify(positionData || {}),
            JSON.stringify(assignedClasses || []),
            1
        ]);

        // Clean up temp files
        await fs.unlink(frontFile.path);
        if (req.files.backImage && req.files.backImage[0]) {
            await fs.unlink(req.files.backImage[0].path);
        }

        res.json({
            success: true,
            message: 'Template uploaded successfully',
            data: {
                templateId: result.insertId,
                templateName,
                frontPath: `id-templates/${frontFileName}`,
                backPath: backFileName ? `id-templates/${backFileName}` : null
            }
        });

    } catch (error) {
        console.error('Error uploading template:', error);
        res.json({
            success: false,
            message: 'Error uploading template: ' + error.message
        });
    }
};

// Get all templates
const getAllTemplates = async (req, res) => {
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
    uploadTemplate,
    getAllTemplates,
    updateTemplatePositions,
    generateSingleCard,
    generateBulkCards,
    serveCard,
    serveTemplate
};
