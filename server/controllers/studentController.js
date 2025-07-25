const db = require('../config/database');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const QRCode = require('qrcode');
const JsBarcode = require('jsbarcode');
const { createCanvas } = require('canvas');

// Generate QR Code for student
const generateStudentQR = async (studentId) => {
    try {
        // Get student data
        const query = `
            SELECT 
                tblstudents.StudentId,
                tblstudents.StudentName,
                tblstudents.RollId,
                tblstudents.StudentEmail,
                tblclasses.ClassName,
                tblclasses.Section
            FROM tblstudents 
            JOIN tblclasses ON tblclasses.id = tblstudents.ClassId 
            WHERE tblstudents.StudentId = ?
        `;
        const [students] = await db.execute(query, [studentId]);
        
        if (students.length === 0) {
            throw new Error('Student not found');
        }

        const student = students[0];
        const qrData = {
            type: 'student',
            studentId: student.StudentId,
            studentName: student.StudentName,
            rollId: student.RollId,
            classId: student.ClassId,
            className: `${student.ClassName} ${student.Section}`,
            email: student.StudentEmail,
            issued: new Date().toISOString(),
            verified: true
        };

        // Generate QR code
        const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
            width: 200,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        // Save QR data to database
        const updateQuery = 'UPDATE tblstudents SET QRCode = ? WHERE StudentId = ?';
        await db.execute(updateQuery, [JSON.stringify(qrData), studentId]);

        return {
            qrCode: qrCodeDataURL,
            qrData: qrData
        };
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }
};

// Generate Barcode for student
const generateStudentBarcode = async (studentId) => {
    try {
        // Get student data
        const query = 'SELECT RollId FROM tblstudents WHERE StudentId = ?';
        const [students] = await db.execute(query, [studentId]);
        
        if (students.length === 0) {
            throw new Error('Student not found');
        }

        const rollId = students[0].RollId;
        
        // Create canvas for barcode
        const canvas = createCanvas(300, 100);
        
        // Generate barcode
        JsBarcode(canvas, rollId, {
            format: "CODE128",
            width: 2,
            height: 60,
            displayValue: true,
            fontSize: 12,
            textMargin: 5
        });

        // Convert to data URL
        const barcodeDataURL = canvas.toDataURL();

        // Save barcode to database
        const updateQuery = 'UPDATE tblstudents SET Barcode = ? WHERE StudentId = ?';
        await db.execute(updateQuery, [rollId, studentId]);

        return {
            barcode: barcodeDataURL,
            rollId: rollId
        };
    } catch (error) {
        console.error('Error generating barcode:', error);
        throw error;
    }
};

// Create a new student
const createStudent = async (req, res) => {
    try {
        const { fullanme, rollid, emailid, gender, classid, dob } = req.body;

        // Validate required fields
        if (!fullanme || !rollid || !emailid || !gender || !classid || !dob) {
            return res.json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailid)) {
            return res.json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }

        // Check if roll ID already exists
        const checkRollQuery = 'SELECT StudentId FROM tblstudents WHERE RollId = ?';
        const [existingRoll] = await db.execute(checkRollQuery, [rollid]);
        
        if (existingRoll.length > 0) {
            return res.json({
                success: false,
                message: 'Roll ID already exists'
            });
        }

        // Check if email already exists
        const checkEmailQuery = 'SELECT StudentId FROM tblstudents WHERE StudentEmail = ?';
        const [existingEmail] = await db.execute(checkEmailQuery, [emailid]);
        
        if (existingEmail.length > 0) {
            return res.json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Verify class exists
        const checkClassQuery = 'SELECT id FROM tblclasses WHERE id = ?';
        const [classExists] = await db.execute(checkClassQuery, [classid]);
        
        if (classExists.length === 0) {
            return res.json({
                success: false,
                message: 'Selected class does not exist'
            });
        }

        // Insert new student
        const insertQuery = `
            INSERT INTO tblstudents (StudentName, RollId, StudentEmail, Gender, ClassId, DOB, Status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(insertQuery, [fullanme, rollid, emailid, gender, classid, dob, 1]);

        if (result.insertId) {
            // Generate QR code and barcode for new student
            try {
                const qrResult = await generateStudentQR(result.insertId);
                const barcodeResult = await generateStudentBarcode(result.insertId);
                
                res.json({
                    success: true,
                    message: 'Student info added successfully with QR code and barcode',
                    data: {
                        studentId: result.insertId,
                        fullanme,
                        rollid,
                        emailid,
                        gender,
                        classid,
                        dob,
                        qrCode: qrResult.qrCode,
                        barcode: barcodeResult.barcode
                    }
                });
            } catch (codeError) {
                console.warn('Failed to generate codes:', codeError);
                res.json({
                    success: true,
                    message: 'Student info added successfully (codes will be generated later)',
                    data: {
                        studentId: result.insertId,
                        fullanme,
                        rollid,
                        emailid,
                        gender,
                        classid,
                        dob
                    }
                });
            }
        } else {
            res.json({
                success: false,
                message: 'Something went wrong. Please try again'
            });
        }
    } catch (error) {
        console.error('Error creating student:', error);
        res.json({
            success: false,
            message: 'Database error occurred'
        });
    }
};

// Get all students with class information
const getAllStudents = async (req, res) => {
    try {
        // Updated query to include photo information
        const query = `
            SELECT 
                tblstudents.StudentName,
                tblstudents.RollId,
                tblstudents.RegDate,
                tblstudents.StudentId,
                tblstudents.Status,
                tblstudents.PhotoPath,
                tblstudents.ThumbnailPath,
                tblclasses.ClassName,
                tblclasses.Section
            FROM tblstudents 
            JOIN tblclasses ON tblclasses.id = tblstudents.ClassId
            ORDER BY tblstudents.StudentId DESC
        `;
        const [students] = await db.execute(query);
        
        res.json({
            success: true,
            students: students
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.json({
            success: false,
            message: 'Database error occurred'
        });
    }
};

// Get student by ID with class information (for edit form)
const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        // Updated query to include photo information
        const query = `
            SELECT 
                tblstudents.StudentName,
                tblstudents.RollId,
                tblstudents.RegDate,
                tblstudents.StudentId,
                tblstudents.Status,
                tblstudents.StudentEmail,
                tblstudents.Gender,
                tblstudents.DOB,
                tblstudents.ClassId,
                tblstudents.PhotoPath,
                tblstudents.ThumbnailPath,
                tblclasses.ClassName,
                tblclasses.Section
            FROM tblstudents 
            JOIN tblclasses ON tblclasses.id = tblstudents.ClassId 
            WHERE tblstudents.StudentId = ?
        `;
        const [students] = await db.execute(query, [id]);
        
        if (students.length > 0) {
            res.json({
                success: true,
                student: students[0]
            });
        } else {
            res.json({
                success: false,
                message: 'Student not found'
            });
        }
    } catch (error) {
        console.error('Error fetching student:', error);
        res.json({
            success: false,
            message: 'Database error occurred'
        });
    }
};

// Update student (matching PHP query exactly)
const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullanme, rollid, emailid, gender, classid, dob, status } = req.body;

        // Validate required fields
        if (!fullanme || !rollid || !emailid || !gender || !classid || !dob || status === undefined) {
            return res.json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailid)) {
            return res.json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }

        // Validate status (should be 0 or 1)
        const statusValue = parseInt(status);
        if (statusValue !== 0 && statusValue !== 1) {
            return res.json({
                success: false,
                message: 'Invalid status value'
            });
        }

        // Check if roll ID already exists for other students
        const checkRollQuery = 'SELECT StudentId FROM tblstudents WHERE RollId = ? AND StudentId != ?';
        const [existingRoll] = await db.execute(checkRollQuery, [rollid, id]);
        
        if (existingRoll.length > 0) {
            return res.json({
                success: false,
                message: 'Roll ID already exists'
            });
        }

        // Check if email already exists for other students
        const checkEmailQuery = 'SELECT StudentId FROM tblstudents WHERE StudentEmail = ? AND StudentId != ?';
        const [existingEmail] = await db.execute(checkEmailQuery, [emailid, id]);
        
        if (existingEmail.length > 0) {
            return res.json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Verify class exists
        const checkClassQuery = 'SELECT id FROM tblclasses WHERE id = ?';
        const [classExists] = await db.execute(checkClassQuery, [classid]);
        
        if (classExists.length === 0) {
            return res.json({
                success: false,
                message: 'Selected class does not exist'
            });
        }

        // Update student (exact same query as PHP)
        const updateQuery = `
            UPDATE tblstudents 
            SET StudentName = ?, RollId = ?, StudentEmail = ?, Gender = ?, DOB = ?, Status = ? 
            WHERE StudentId = ?
        `;
        const [result] = await db.execute(updateQuery, [fullanme, rollid, emailid, gender, dob, statusValue, id]);

        if (result.affectedRows > 0) {
            res.json({
                success: true,
                message: 'Student info updated successfully'
            });
        } else {
            res.json({
                success: false,
                message: 'Student not found or no changes made'
            });
        }
    } catch (error) {
        console.error('Error updating student:', error);
        res.json({
            success: false,
            message: 'Database error occurred'
        });
    }
};

// Update student status (for activate/deactivate functionality)
const updateStudentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status (should be 0 or 1)
        const statusValue = parseInt(status);
        if (statusValue !== 0 && statusValue !== 1) {
            return res.json({
                success: false,
                message: 'Invalid status value'
            });
        }

        // Update status
        const updateQuery = 'UPDATE tblstudents SET Status = ? WHERE StudentId = ?';
        const [result] = await db.execute(updateQuery, [statusValue, id]);

        if (result.affectedRows > 0) {
            const message = statusValue === 1 ? 'Student activated successfully' : 'Student blocked successfully';
            res.json({
                success: true,
                message: message
            });
        } else {
            res.json({
                success: false,
                message: 'Student not found'
            });
        }
    } catch (error) {
        console.error('Error updating student status:', error);
        res.json({
            success: false,
            message: 'Database error occurred'
        });
    }
};

// Delete student (with dependency checking)
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if student has exam results
        const checkResultsQuery = 'SELECT id FROM tblresult WHERE StudentId = ?';
        const [results] = await db.execute(checkResultsQuery, [id]);
        
        if (results.length > 0) {
            return res.json({
                success: false,
                message: 'Cannot delete student. Student has exam results.'
            });
        }

        // Delete student
        const deleteQuery = 'DELETE FROM tblstudents WHERE StudentId = ?';
        const [result] = await db.execute(deleteQuery, [id]);

        if (result.affectedRows > 0) {
            res.json({
                success: true,
                message: 'Student deleted successfully'
            });
        } else {
            res.json({
                success: false,
                message: 'Student not found'
            });
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        res.json({
            success: false,
            message: 'Database error occurred'
        });
    }
};

// Get students by class (for reports and filtering)
const getStudentsByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        
        const query = `
            SELECT 
                tblstudents.StudentId,
                tblstudents.StudentName,
                tblstudents.RollId,
                tblstudents.StudentEmail,
                tblstudents.Status
            FROM tblstudents 
            WHERE tblstudents.ClassId = ? AND tblstudents.Status = 1
            ORDER BY tblstudents.RollId
        `;
        const [students] = await db.execute(query, [classId]);
        
        res.json({
            success: true,
            students: students
        });
    } catch (error) {
        console.error('Error fetching students by class:', error);
        res.json({
            success: false,
            message: 'Database error occurred'
        });
    }
};

// Get student statistics
const getStudentStats = async (req, res) => {
    try {
        const statsQuery = `
            SELECT 
                COUNT(*) as totalStudents,
                SUM(CASE WHEN Status = 1 THEN 1 ELSE 0 END) as activeStudents,
                SUM(CASE WHEN Status = 0 THEN 1 ELSE 0 END) as blockedStudents,
                COUNT(DISTINCT ClassId) as totalClasses
            FROM tblstudents
        `;
        const [stats] = await db.execute(statsQuery);
        
        res.json({
            success: true,
            stats: stats[0]
        });
    } catch (error) {
        console.error('Error fetching student statistics:', error);
        res.json({
            success: false,
            message: 'Database error occurred'
        });
    }
};

// Upload student photo
const uploadStudentPhoto = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!req.file) {
            return res.json({
                success: false,
                message: 'No photo file uploaded'
            });
        }

        // Verify student exists
        const checkStudentQuery = 'SELECT StudentId FROM tblstudents WHERE StudentId = ?';
        const [student] = await db.execute(checkStudentQuery, [id]);
        
        if (student.length === 0) {
            // Clean up uploaded file
            await fs.unlink(req.file.path);
            return res.json({
                success: false,
                message: 'Student not found'
            });
        }

        // Create directories if they don't exist
        const uploadsDir = path.join(__dirname, '../uploads/student-photos');
        const thumbnailsDir = path.join(uploadsDir, 'thumbnails');
        
        await fs.mkdir(uploadsDir, { recursive: true });
        await fs.mkdir(thumbnailsDir, { recursive: true });

        const originalFileName = req.file.filename;
        const fileExtension = path.extname(originalFileName);
        const baseFileName = `student_${id}_${Date.now()}`;
        
        // Process original image (resize to max 800x800)
        const originalPath = path.join(uploadsDir, `${baseFileName}${fileExtension}`);
        await sharp(req.file.path)
            .resize(800, 800, { 
                fit: 'inside', 
                withoutEnlargement: true 
            })
            .jpeg({ quality: 85 })
            .toFile(originalPath);

        // Create thumbnail (150x150)
        const thumbnailPath = path.join(thumbnailsDir, `thumb_${baseFileName}.jpg`);
        await sharp(req.file.path)
            .resize(150, 150, { 
                fit: 'cover' 
            })
            .jpeg({ quality: 80 })
            .toFile(thumbnailPath);

        // Remove temporary uploaded file
        await fs.unlink(req.file.path);

        // Update database with photo paths
        const updateQuery = `
            UPDATE tblstudents 
            SET PhotoPath = ?, ThumbnailPath = ?, PhotoUpdated = NOW() 
            WHERE StudentId = ?
        `;
        const relativePath = `student-photos/${baseFileName}${fileExtension}`;
        const relativeThumbnail = `student-photos/thumbnails/thumb_${baseFileName}.jpg`;
        
        await db.execute(updateQuery, [relativePath, relativeThumbnail, id]);

        res.json({
            success: true,
            message: 'Photo uploaded successfully',
            data: {
                photoPath: relativePath,
                thumbnailPath: relativeThumbnail
            }
        });

    } catch (error) {
        console.error('Error uploading photo:', error);
        
        // Clean up files on error
        if (req.file && req.file.path) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error cleaning up temp file:', unlinkError);
            }
        }
        
        res.json({
            success: false,
            message: 'Error uploading photo: ' + error.message
        });
    }
};

// Delete student photo
const deleteStudentPhoto = async (req, res) => {
    try {
        const { id } = req.params;

        // Get current photo paths
        const getPhotoQuery = 'SELECT PhotoPath, ThumbnailPath FROM tblstudents WHERE StudentId = ?';
        const [student] = await db.execute(getPhotoQuery, [id]);
        
        if (student.length === 0) {
            return res.json({
                success: false,
                message: 'Student not found'
            });
        }

        const { PhotoPath, ThumbnailPath } = student[0];

        // Delete physical files
        if (PhotoPath) {
            try {
                await fs.unlink(path.join(__dirname, '../uploads', PhotoPath));
            } catch (error) {
                console.warn('Could not delete photo file:', error.message);
            }
        }

        if (ThumbnailPath) {
            try {
                await fs.unlink(path.join(__dirname, '../uploads', ThumbnailPath));
            } catch (error) {
                console.warn('Could not delete thumbnail file:', error.message);
            }
        }

        // Update database
        const updateQuery = `
            UPDATE tblstudents 
            SET PhotoPath = NULL, ThumbnailPath = NULL, PhotoUpdated = NOW() 
            WHERE StudentId = ?
        `;
        await db.execute(updateQuery, [id]);

        res.json({
            success: true,
            message: 'Photo deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting photo:', error);
        res.json({
            success: false,
            message: 'Error deleting photo'
        });
    }
};

// Get student photo info
const getStudentPhoto = async (req, res) => {
    try {
        const { id } = req.params;

        const query = 'SELECT PhotoPath, ThumbnailPath, PhotoUpdated FROM tblstudents WHERE StudentId = ?';
        const [student] = await db.execute(query, [id]);
        
        if (student.length === 0) {
            return res.json({
                success: false,
                message: 'Student not found'
            });
        }

        const { PhotoPath, ThumbnailPath, PhotoUpdated } = student[0];

        res.json({
            success: true,
            data: {
                hasPhoto: !!PhotoPath,
                photoPath: PhotoPath,
                thumbnailPath: ThumbnailPath,
                photoUpdated: PhotoUpdated
            }
        });

    } catch (error) {
        console.error('Error getting photo info:', error);
        res.json({
            success: false,
            message: 'Error getting photo info'
        });
    }
};

// Serve photo files
const servePhoto = async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, '../uploads/student-photos', filename);
        
        // Check if file exists
        try {
            await fs.access(filePath);
            res.sendFile(filePath);
        } catch (error) {
            res.status(404).json({
                success: false,
                message: 'Photo not found'
            });
        }

    } catch (error) {
        console.error('Error serving photo:', error);
        res.status(500).json({
            success: false,
            message: 'Error serving photo'
        });
    }
};

// Bulk photo upload
const bulkUploadPhotos = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.json({
                success: false,
                message: 'No photos uploaded'
            });
        }

        const results = [];
        
        for (const file of req.files) {
            try {
                // Extract student ID from filename (expecting format: studentId_photo.jpg)
                const studentId = file.originalname.split('_')[0];
                
                if (!studentId || isNaN(studentId)) {
                    results.push({
                        filename: file.originalname,
                        success: false,
                        message: 'Invalid filename format. Expected: studentId_photo.jpg'
                    });
                    continue;
                }

                // Process the photo (similar to single upload)
                req.file = file;
                req.params = { id: studentId };
                
                // Call the single upload function
                await uploadStudentPhoto(req, res);
                
                results.push({
                    filename: file.originalname,
                    studentId: studentId,
                    success: true,
                    message: 'Photo uploaded successfully'
                });

            } catch (error) {
                results.push({
                    filename: file.originalname,
                    success: false,
                    message: error.message
                });
            }
        }

        res.json({
            success: true,
            message: `Processed ${req.files.length} photos`,
            results: results
        });

    } catch (error) {
        console.error('Error in bulk upload:', error);
        res.json({
            success: false,
            message: 'Error in bulk photo upload'
        });
    }
};

// Get student QR code
const getStudentQR = async (req, res) => {
    try {
        const { id } = req.params;
        
        let qrResult;
        
        // Try to get existing QR from database
        const query = 'SELECT QRCode FROM tblstudents WHERE StudentId = ?';
        const [students] = await db.execute(query, [id]);
        
        if (students.length === 0) {
            return res.json({
                success: false,
                message: 'Student not found'
            });
        }

        if (students[0].QRCode) {
            // Parse existing QR data and regenerate image
            const qrData = JSON.parse(students[0].QRCode);
            const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
                width: 200,
                margin: 2
            });
            qrResult = {
                qrCode: qrCodeDataURL,
                qrData: qrData
            };
        } else {
            // Generate new QR code
            qrResult = await generateStudentQR(id);
        }

        res.json({
            success: true,
            data: qrResult
        });

    } catch (error) {
        console.error('Error getting QR code:', error);
        res.json({
            success: false,
            message: 'Error generating QR code'
        });
    }
};

// Get student barcode
const getStudentBarcode = async (req, res) => {
    try {
        const { id } = req.params;
        
        let barcodeResult;
        
        // Try to get existing barcode from database
        const query = 'SELECT Barcode, RollId FROM tblstudents WHERE StudentId = ?';
        const [students] = await db.execute(query, [id]);
        
        if (students.length === 0) {
            return res.json({
                success: false,
                message: 'Student not found'
            });
        }

        if (students[0].Barcode) {
            // Regenerate barcode image
            const canvas = createCanvas(300, 100);
            JsBarcode(canvas, students[0].RollId, {
                format: "CODE128",
                width: 2,
                height: 60,
                displayValue: true
            });
            
            barcodeResult = {
                barcode: canvas.toDataURL(),
                rollId: students[0].RollId
            };
        } else {
            // Generate new barcode
            barcodeResult = await generateStudentBarcode(id);
        }

        res.json({
            success: true,
            data: barcodeResult
        });

    } catch (error) {
        console.error('Error getting barcode:', error);
        res.json({
            success: false,
            message: 'Error generating barcode'
        });
    }
};

// Register fingerprint data
const registerFingerprint = async (req, res) => {
    try {
        const { id } = req.params;
        const { fingerprintData, fingerprintHash } = req.body;

        if (!fingerprintData || !fingerprintHash) {
            return res.json({
                success: false,
                message: 'Fingerprint data is required'
            });
        }

        // Update student with fingerprint data
        const updateQuery = `
            UPDATE tblstudents 
            SET FingerprintData = ?, FingerprintRegistered = 1, FingerprintUpdated = NOW() 
            WHERE StudentId = ?
        `;
        const [result] = await db.execute(updateQuery, [fingerprintHash, id]);

        if (result.affectedRows > 0) {
            res.json({
                success: true,
                message: 'Fingerprint registered successfully'
            });
        } else {
            res.json({
                success: false,
                message: 'Student not found'
            });
        }

    } catch (error) {
        console.error('Error registering fingerprint:', error);
        res.json({
            success: false,
            message: 'Error registering fingerprint'
        });
    }
};

// Get fingerprint status
const getFingerprintStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const query = 'SELECT FingerprintRegistered, FingerprintUpdated FROM tblstudents WHERE StudentId = ?';
        const [students] = await db.execute(query, [id]);
        
        if (students.length === 0) {
            return res.json({
                success: false,
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            data: {
                registered: students[0].FingerprintRegistered == 1,
                lastUpdated: students[0].FingerprintUpdated
            }
        });

    } catch (error) {
        console.error('Error getting fingerprint status:', error);
        res.json({
            success: false,
            message: 'Error getting fingerprint status'
        });
    }
};

module.exports = {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    updateStudentStatus,
    deleteStudent,
    getStudentsByClass,
    getStudentStats,
    // NEW photo functions
    uploadStudentPhoto,
    deleteStudentPhoto,
    getStudentPhoto,
    servePhoto,
    bulkUploadPhotos,
    // QR/Barcode functions
    getStudentQR,
    getStudentBarcode,
    registerFingerprint,
    getFingerprintStatus,
    generateStudentQR,
    generateStudentBarcode
};