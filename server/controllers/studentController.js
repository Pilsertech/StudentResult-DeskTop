const db = require('../config/database');

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
            res.json({
                success: true,
                message: 'Student info added successfully',
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
        // Exact same query as PHP with JOIN
        const query = `
            SELECT 
                tblstudents.StudentName,
                tblstudents.RollId,
                tblstudents.RegDate,
                tblstudents.StudentId,
                tblstudents.Status,
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
        // Exact same query as PHP with JOIN for edit form
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

module.exports = {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    updateStudentStatus,
    deleteStudent,
    getStudentsByClass,
    getStudentStats
};