const db = require('../config/database');

// Create a new subject
const createSubject = async (req, res) => {
    try {
        const { subjectname, subjectcode } = req.body;

        // Validate required fields
        if (!subjectname || !subjectcode) {
            return res.json({
                success: false,
                message: 'Subject name and subject code are required'
            });
        }

        // Check if subject code already exists
        const checkQuery = 'SELECT id FROM tblsubjects WHERE SubjectCode = ?';
        const [existing] = await db.execute(checkQuery, [subjectcode]);
        
        if (existing.length > 0) {
            return res.json({
                success: false,
                message: 'Subject code already exists'
            });
        }

        // Insert new subject
        const insertQuery = 'INSERT INTO tblsubjects (SubjectName, SubjectCode) VALUES (?, ?)';
        const [result] = await db.execute(insertQuery, [subjectname, subjectcode]);

        if (result.insertId) {
            res.json({
                success: true,
                message: 'Subject created successfully',
                data: {
                    id: result.insertId,
                    subjectname,
                    subjectcode
                }
            });
        } else {
            res.json({
                success: false,
                message: 'Something went wrong. Please try again'
            });
        }
    } catch (error) {
        console.error('Error creating subject:', error);
        res.json({
            success: false,
            message: 'Database error occurred'
        });
    }
};

// Get all subjects
const getAllSubjects = async (req, res) => {
    try {
        // Exact same query as PHP: SELECT * from tblsubjects
        const query = 'SELECT id, SubjectName, SubjectCode, Creationdate, UpdationDate FROM tblsubjects ORDER BY id DESC';
        const [subjects] = await db.execute(query);
        
        res.json({
            success: true,
            subjects: subjects
        });
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.json({
            success: false,
            message: 'Database error occurred'
        });
    }
};

// Get subject by ID
const getSubjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'SELECT * FROM tblsubjects WHERE id = ?';
        const [subjects] = await db.execute(query, [id]);
        
        if (subjects.length > 0) {
            res.json({
                success: true,
                subject: subjects[0]
            });
        } else {
            res.json({
                success: false,
                message: 'Subject not found'
            });
        }
    } catch (error) {
        console.error('Error fetching subject:', error);
        res.json({
            success: false,
            message: 'Database error occurred'
        });
    }
};

// Update subject
const updateSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const { subjectname, subjectcode } = req.body;

        // Validate required fields
        if (!subjectname || !subjectcode) {
            return res.json({
                success: false,
                message: 'Subject name and subject code are required'
            });
        }

        // Check if subject code already exists for other records
        const checkQuery = 'SELECT id FROM tblsubjects WHERE SubjectCode = ? AND id != ?';
        const [existing] = await db.execute(checkQuery, [subjectcode, id]);
        
        if (existing.length > 0) {
            return res.json({
                success: false,
                message: 'Subject code already exists'
            });
        }

        // Update subject
        const updateQuery = 'UPDATE tblsubjects SET SubjectName = ?, SubjectCode = ? WHERE id = ?';
        const [result] = await db.execute(updateQuery, [subjectname, subjectcode, id]);

        if (result.affectedRows > 0) {
            res.json({
                success: true,
                message: 'Subject updated successfully'
            });
        } else {
            res.json({
                success: false,
                message: 'Subject not found or no changes made'
            });
        }
    } catch (error) {
        console.error('Error updating subject:', error);
        res.json({
            success: false,
            message: 'Database error occurred'
        });
    }
};

// Delete subject
const deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if subject is used in subject combinations
        const checkQuery = 'SELECT id FROM tblsubjectcombination WHERE SubjectId = ?';
        const [combinations] = await db.execute(checkQuery, [id]);
        
        if (combinations.length > 0) {
            return res.json({
                success: false,
                message: 'Cannot delete subject. It is used in subject combinations.'
            });
        }

        // Delete subject
        const deleteQuery = 'DELETE FROM tblsubjects WHERE id = ?';
        const [result] = await db.execute(deleteQuery, [id]);

        if (result.affectedRows > 0) {
            res.json({
                success: true,
                message: 'Subject deleted successfully'
            });
        } else {
            res.json({
                success: false,
                message: 'Subject not found'
            });
        }
    } catch (error) {
        console.error('Error deleting subject:', error);
        res.json({
            success: false,
            message: 'Database error occurred'
        });
    }
};

module.exports = {
    createSubject,
    getAllSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject
};

// Add these methods to your existing subjectController.js

// Create subject combination
const createSubjectCombination = async (req, res) => {
    try {
        const { classId, subjectId } = req.body;

        // Validate required fields
        if (!classId || !subjectId) {
            return res.json({
                success: false,
                message: 'Class and subject are required'
            });
        }

        // Check if combination already exists
        const checkQuery = 'SELECT id FROM tblsubjectcombination WHERE ClassId = ? AND SubjectId = ?';
        const [existing] = await db.execute(checkQuery, [classId, subjectId]);
        
        if (existing.length > 0) {
            return res.json({
                success: false,
                message: 'This subject combination already exists'
            });
        }

        // Insert new subject combination
        const insertQuery = 'INSERT INTO tblsubjectcombination (ClassId, SubjectId, status) VALUES (?, ?, ?)';
        const [result] = await db.execute(insertQuery, [classId, subjectId, 1]);

        if (result.insertId) {
            res.json({
                success: true,
                message: 'Combination added successfully',
                data: {
                    id: result.insertId,
                    classId,
                    subjectId
                }
            });
        } else {
            res.json({
                success: false,
                message: 'Something went wrong. Please try again'
            });
        }
    } catch (error) {
        console.error('Error creating subject combination:', error);
        res.json({
            success: false,
            message: 'Database error occurred'
        });
    }
};

// Get all classes for dropdown
const getAllClasses = async (req, res) => {
    try {
        const query = 'SELECT id, ClassName, Section FROM tblclasses ORDER BY ClassName, Section';
        const [classes] = await db.execute(query);
        
        res.json({
            success: true,
            classes: classes
        });
    } catch (error) {
        console.error('Error fetching classes:', error);
        res.json({
            success: false,
            message: 'Database error occurred'
        });
    }
};

// Get all subjects for dropdown
const getAllSubjectsForDropdown = async (req, res) => {
    try {
        const query = 'SELECT id, SubjectName FROM tblsubjects ORDER BY SubjectName';
        const [subjects] = await db.execute(query);
        
        res.json({
            success: true,
            subjects: subjects
        });
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.json({
            success: false,
            message: 'Database error occurred'
        });
    }
};

// Get all subject combinations
const getAllSubjectCombinations = async (req, res) => {
    try {
        const query = `
            SELECT sc.id, sc.status, sc.CreationDate,
                   c.ClassName, c.Section,
                   s.SubjectName, s.SubjectCode
            FROM tblsubjectcombination sc
            JOIN tblclasses c ON c.id = sc.ClassId
            JOIN tblsubjects s ON s.id = sc.SubjectId
            ORDER BY c.ClassName, c.Section, s.SubjectName
        `;
        const [combinations] = await db.execute(query);
        
        res.json({
            success: true,
            combinations: combinations
        });
    } catch (error) {
        console.error('Error fetching subject combinations:', error);
        res.json({
            success: false,
            message: 'Database error occurred'
        });
    }
};

// Update the module.exports to include new methods
module.exports = {
    createSubject,
    getAllSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject,
    createSubjectCombination,
    getAllClasses,
    getAllSubjectsForDropdown,
    getAllSubjectCombinations
};

// Add these methods to your existing subjectController.js

// Update subject combination status (activate/deactivate)
const updateSubjectCombinationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status (should be 0 or 1)
        if (status !== 0 && status !== 1) {
            return res.json({
                success: false,
                message: 'Invalid status value'
            });
        }

        // Update status
        const updateQuery = 'UPDATE tblsubjectcombination SET status = ? WHERE id = ?';
        const [result] = await db.execute(updateQuery, [status, id]);

        if (result.affectedRows > 0) {
            const message = status === 1 ? 'Subject activated successfully' : 'Subject deactivated successfully';
            res.json({
                success: true,
                message: message
            });
        } else {
            res.json({
                success: false,
                message: 'Subject combination not found'
            });
        }
    } catch (error) {
        console.error('Error updating subject combination status:', error);
        res.json({
            success: false,
            message: 'Database error occurred'
        });
    }
};

// Get all subject combinations with JOIN (for manage page)
const getAllSubjectCombinationsWithDetails = async (req, res) => {
    try {
        // Exact same query as PHP with JOIN
        const query = `
            SELECT 
                tblclasses.ClassName,
                tblclasses.Section,
                tblsubjects.SubjectName,
                tblsubjectcombination.id as scid,
                tblsubjectcombination.status,
                tblsubjectcombination.CreationDate
            FROM tblsubjectcombination 
            JOIN tblclasses ON tblclasses.id = tblsubjectcombination.ClassId  
            JOIN tblsubjects ON tblsubjects.id = tblsubjectcombination.SubjectId
            ORDER BY tblclasses.ClassName, tblclasses.Section, tblsubjects.SubjectName
        `;
        const [combinations] = await db.execute(query);
        
        res.json({
            success: true,
            combinations: combinations
        });
    } catch (error) {
        console.error('Error fetching subject combinations:', error);
        res.json({
            success: false,
            message: 'Database error occurred'
        });
    }
};

// Delete subject combination
const deleteSubjectCombination = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if combination is used in results
        const checkQuery = 'SELECT id FROM tblresult WHERE SubjectId IN (SELECT SubjectId FROM tblsubjectcombination WHERE id = ?)';
        const [results] = await db.execute(checkQuery, [id]);
        
        if (results.length > 0) {
            return res.json({
                success: false,
                message: 'Cannot delete. This combination is used in student results.'
            });
        }

        // Delete combination
        const deleteQuery = 'DELETE FROM tblsubjectcombination WHERE id = ?';
        const [result] = await db.execute(deleteQuery, [id]);

        if (result.affectedRows > 0) {
            res.json({
                success: true,
                message: 'Subject combination deleted successfully'
            });
        } else {
            res.json({
                success: false,
                message: 'Subject combination not found'
            });
        }
    } catch (error) {
        console.error('Error deleting subject combination:', error);
        res.json({
            success: false,
            message: 'Database error occurred'
        });
    }
};

// Update the module.exports to include new methods
module.exports = {
    createSubject,
    getAllSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject,
    createSubjectCombination,
    getAllClasses,
    getAllSubjectsForDropdown,
    getAllSubjectCombinations,
    getAllSubjectCombinationsWithDetails,
    updateSubjectCombinationStatus,
    deleteSubjectCombination
};