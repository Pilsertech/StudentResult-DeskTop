// server/controllers/classController.js
// Controller for Class-related operations

const db = require('../config/database');

// List all classes
exports.getAllClasses = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM tblclasses ORDER BY id DESC');
        return res.json({ success: true, classes: rows });
    } catch (err) {
        console.error('Database error:', err);
        return res.json({ success: false, message: 'Database error.' });
    }
};

// Create a new class
exports.createClass = async (req, res) => {
    const { classname, classnamenumeric, section } = req.body;

    if (!classname || !classnamenumeric || !section) {
        return res.json({ success: false, message: 'All fields are required.' });
    }

    try {
        // Check for duplicate class combination
        const [existing] = await db.execute(
            'SELECT id FROM tblclasses WHERE ClassName = ? AND ClassNameNumeric = ? AND Section = ?',
            [classname, classnamenumeric, section]
        );
        
        if (existing.length > 0) {
            return res.json({ success: false, message: 'This class combination already exists.' });
        }

        const [result] = await db.execute(
            'INSERT INTO tblclasses (ClassName, ClassNameNumeric, Section) VALUES (?, ?, ?)',
            [classname, classnamenumeric, section]
        );
        
        if (result.insertId) {
            return res.json({ 
                success: true, 
                message: 'Class created successfully',
                id: result.insertId 
            });
        } else {
            return res.json({ success: false, message: 'Insert failed.' });
        }
    } catch (err) {
        console.error('Database error:', err);
        return res.json({ success: false, message: 'Database error.' });
    }
};

// Get a single class by ID
exports.getClassById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute('SELECT * FROM tblclasses WHERE id = ?', [id]);
        if (rows.length) {
            return res.json({ success: true, class: rows[0] });
        } else {
            return res.json({ success: false, message: 'Class not found.' });
        }
    } catch (err) {
        console.error('Database error:', err);
        return res.json({ success: false, message: 'Database error.' });
    }
};

// Update a class by ID
exports.updateClass = async (req, res) => {
    const { id } = req.params;
    const { classname, classnamenumeric, section } = req.body;

    if (!classname || !classnamenumeric || !section) {
        return res.json({ success: false, message: 'All fields are required.' });
    }

    try {
        // Check for duplicate class combination (excluding current record)
        const [existing] = await db.execute(
            'SELECT id FROM tblclasses WHERE ClassName = ? AND ClassNameNumeric = ? AND Section = ? AND id != ?',
            [classname, classnamenumeric, section, id]
        );
        
        if (existing.length > 0) {
            return res.json({ success: false, message: 'This class combination already exists.' });
        }

        const [result] = await db.execute(
            'UPDATE tblclasses SET ClassName = ?, ClassNameNumeric = ?, Section = ? WHERE id = ?',
            [classname, classnamenumeric, section, id]
        );
        
        if (result.affectedRows) {
            return res.json({ 
                success: true, 
                message: 'Data has been updated successfully' // Matches PHP message
            });
        } else {
            return res.json({ success: false, message: 'Update failed or class not found.' });
        }
    } catch (err) {
        console.error('Database error:', err);
        return res.json({ success: false, message: 'Database error.' });
    }
};

// Delete a class by ID
exports.deleteClass = async (req, res) => {
    const { id } = req.params;
    try {
        // Check if class is used in students or subject combinations
        const [students] = await db.execute('SELECT StudentId FROM tblstudents WHERE ClassId = ?', [id]);
        const [combinations] = await db.execute('SELECT id FROM tblsubjectcombination WHERE ClassId = ?', [id]);
        
        if (students.length > 0) {
            return res.json({ success: false, message: 'Cannot delete class. Students are assigned to this class.' });
        }
        
        if (combinations.length > 0) {
            return res.json({ success: false, message: 'Cannot delete class. Subject combinations exist for this class.' });
        }

        const [result] = await db.execute('DELETE FROM tblclasses WHERE id = ?', [id]);
        if (result.affectedRows) {
            return res.json({ 
                success: true, 
                message: 'Class deleted successfully' 
            });
        } else {
            return res.json({ success: false, message: 'Delete failed or class not found.' });
        }
    } catch (err) {
        console.error('Database error:', err);
        return res.json({ success: false, message: 'Database error.' });
    }
};