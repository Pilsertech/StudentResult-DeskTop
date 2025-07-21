const db = require('../config/database');

class ResultController {
    // Get all classes - FIXED to handle missing Status column
    static async getClasses(req, res) {
        try {
            console.log('🔍 Fetching classes for Add Result page...');
            
            // First check if Status column exists
            let query = `
                SELECT id, ClassName, Section
                FROM tblclasses 
                ORDER BY ClassName, Section
            `;
            
            // Try to check if Status column exists
            try {
                const [testResult] = await db.execute(`
                    SELECT id, ClassName, Section, Status
                    FROM tblclasses 
                    WHERE Status = 1
                    ORDER BY ClassName, Section
                `);
                
                // If no error, Status column exists
                query = `
                    SELECT id, ClassName, Section
                    FROM tblclasses 
                    WHERE Status = 1
                    ORDER BY ClassName, Section
                `;
                console.log('✅ Using Status filter');
                
            } catch (statusError) {
                // Status column doesn't exist, use query without Status
                console.log('ℹ️ Status column not found, querying all classes');
                query = `
                    SELECT id, ClassName, Section
                    FROM tblclasses 
                    ORDER BY ClassName, Section
                `;
            }
            
            const [results] = await db.execute(query);
            
            console.log(`✅ Found ${results.length} classes`);
            res.json(results);
            
        } catch (error) {
            console.error('❌ Error fetching classes:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to fetch classes',
                error: error.message
            });
        }
    }

    // Get students by class ID - FIXED to handle missing Status column
    static async getStudentsByClass(req, res) {
        try {
            const { classId } = req.params;
            console.log('🔍 Fetching students for class:', classId);
            
            if (!classId || isNaN(classId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid class ID provided'
                });
            }
            
            // Check if Status column exists in tblstudents
            let query = `
                SELECT StudentId as id, StudentName, RollId, RegDate 
                FROM tblstudents 
                WHERE ClassId = ?
                ORDER BY StudentName
            `;
            
            try {
                // Try with Status filter first
                const [testResult] = await db.execute(`
                    SELECT StudentId as id, StudentName, RollId, RegDate 
                    FROM tblstudents 
                    WHERE ClassId = ? AND Status = 1
                    ORDER BY StudentName
                `, [classId]);
                
                // If no error, use Status filter
                query = `
                    SELECT StudentId as id, StudentName, RollId, RegDate 
                    FROM tblstudents 
                    WHERE ClassId = ? AND Status = 1
                    ORDER BY StudentName
                `;
                console.log('✅ Using Status filter for students');
                
            } catch (statusError) {
                // Status column doesn't exist
                console.log('ℹ️ Status column not found, querying all students');
            }
            
            const [results] = await db.execute(query, [classId]);
            
            console.log(`✅ Found ${results.length} students for class ${classId}`);
            res.json(results);
            
        } catch (error) {
            console.error('❌ Error fetching students:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to fetch students',
                error: error.message
            });
        }
    }

    // Get subjects by class ID - EXACT PHP logic
    static async getSubjectsByClass(req, res) {
        try {
            const { classId } = req.params;
            console.log('🔍 Fetching subjects for class:', classId);
            
            if (!classId || isNaN(classId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid class ID provided'
                });
            }
            
            // Exact query matching PHP logic
            const query = `
                SELECT tblsubjects.SubjectName, tblsubjects.id, tblsubjects.SubjectCode
                FROM tblsubjectcombination 
                JOIN tblsubjects ON tblsubjects.id = tblsubjectcombination.SubjectId 
                WHERE tblsubjectcombination.ClassId = ? 
                ORDER BY tblsubjects.SubjectName
            `;
            
            const [results] = await db.execute(query, [classId]);
            
            console.log(`✅ Found ${results.length} subjects for class ${classId}`);
            res.json(results);
            
        } catch (error) {
            console.error('❌ Error fetching subjects:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to fetch subjects',
                error: error.message
            });
        }
    }

    // Get existing results for a student in a class
    static async getStudentResults(req, res) {
        try {
            const { studentId, classId } = req.params;
            console.log('🔍 Checking existing results for student:', studentId, 'in class:', classId);
            
            if (!studentId || !classId || isNaN(studentId) || isNaN(classId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid student ID or class ID provided'
                });
            }
            
            const query = `
                SELECT r.marks, s.SubjectName, s.id as SubjectId, r.PostingDate
                FROM tblresult r
                JOIN tblsubjects s ON s.id = r.SubjectId
                WHERE r.StudentId = ? AND r.ClassId = ?
                ORDER BY s.SubjectName
            `;
            
            const [results] = await db.execute(query, [studentId, classId]);
            
            if (results.length === 0) {
                console.log('ℹ️ No existing results found');
                return res.status(404).json({ 
                    success: false, 
                    message: 'No existing results found' 
                });
            }
            
            console.log(`✅ Found ${results.length} existing results`);
            res.json(results);
            
        } catch (error) {
            console.error('❌ Error fetching student results:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to fetch student results',
                error: error.message
            });
        }
    }

    // Submit new results - EXACT PHP logic
    static async submitResults(req, res) {
        let connection;
        
        try {
            const { classId, studentId, marks } = req.body;
            console.log('📝 Submitting results:', { classId, studentId, marksCount: marks?.length });
            
            // Validate input (matching PHP validation)
            if (!classId || !studentId || !marks || !Array.isArray(marks)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid input data. Please provide classId, studentId, and marks array.'
                });
            }

            // Validate marks array
            for (const mark of marks) {
                if (!mark.subjectId || mark.marks === undefined || mark.marks < 0 || mark.marks > 100) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid marks data. Marks must be between 0 and 100.'
                    });
                }
            }

            connection = await db.getConnection();
            await connection.beginTransaction();
            console.log('🔄 Transaction started');

            // Check if results already exist (matching PHP logic)
            const checkQuery = `
                SELECT COUNT(*) as count 
                FROM tblresult 
                WHERE StudentId = ? AND ClassId = ?
            `;
            const [existingCheck] = await connection.execute(checkQuery, [studentId, classId]);
            
            if (existingCheck[0].count > 0) {
                await connection.rollback();
                console.log('⚠️ Results already exist for this student');
                return res.status(409).json({
                    success: false,
                    message: 'Results already exist for this student. Please use edit function.'
                });
            }

            // Insert new results (exact PHP INSERT logic)
            const insertQuery = `
                INSERT INTO tblresult (StudentId, ClassId, SubjectId, marks, PostingDate, UpdationDate)
                VALUES (?, ?, ?, ?, NOW(), NOW())
            `;

            let insertCount = 0;
            for (const mark of marks) {
                console.log(`📝 Inserting mark for subject ${mark.subjectId}: ${mark.marks}`);
                await connection.execute(insertQuery, [
                    studentId,
                    classId,
                    mark.subjectId,
                    mark.marks
                ]);
                insertCount++;
            }

            await connection.commit();
            console.log(`✅ Successfully inserted ${insertCount} results`);

            res.json({
                success: true,
                message: 'Result info added successfully', // Exact PHP message
                data: {
                    studentId,
                    classId,
                    subjectsCount: marks.length
                }
            });

        } catch (error) {
            if (connection) {
                await connection.rollback();
                console.log('🔄 Transaction rolled back');
            }
            console.error('❌ Error submitting results:', error);
            res.status(500).json({
                success: false,
                message: 'Something went wrong. Please try again', // Exact PHP error message
                error: error.message
            });
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    // Get students with results (exact PHP query for manage-results page)
    static async getStudentsWithResults(req, res) {
        try {
            console.log('🔍 Fetching students with results for Manage Results page...');
            
            // Exact PHP query logic from manage-results.php
            const query = `
                SELECT DISTINCT 
                    tblstudents.StudentName,
                    tblstudents.RollId,
                    tblstudents.RegDate,
                    tblstudents.StudentId,
                    tblstudents.Status,
                    tblstudents.StudentEmail,
                    tblstudents.DOB,
                    tblstudents.Gender,
                    tblclasses.ClassName,
                    tblclasses.Section
                FROM tblresult 
                JOIN tblstudents ON tblstudents.StudentId = tblresult.StudentId  
                JOIN tblclasses ON tblclasses.id = tblresult.ClassId
                ORDER BY tblstudents.StudentName
            `;
            
            const [results] = await db.execute(query);
            
            console.log(`✅ Found ${results.length} students with results`);
            
            res.json({
                success: true,
                students: results,
                count: results.length
            });
            
        } catch (error) {
            console.error('❌ Error fetching students with results:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to fetch students with results',
                error: error.message
            });
        }
    }

    // Get detailed student results for PDF download
    static async getStudentDetailedResults(req, res) {
        try {
            const { studentId } = req.params;
            console.log('🔍 Fetching detailed results for student:', studentId);
            
            if (!studentId || isNaN(studentId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid student ID provided'
                });
            }
            
            // Get student info with class details
            const studentQuery = `
                SELECT 
                    s.StudentId,
                    s.StudentName,
                    s.RollId,
                    s.StudentEmail,
                    s.Gender,
                    s.DOB,
                    s.RegDate,
                    s.Status,
                    c.ClassName,
                    c.Section,
                    c.ClassNameNumeric
                FROM tblstudents s
                JOIN tblclasses c ON c.id = s.ClassId
                WHERE s.StudentId = ?
            `;
            
            const [studentResult] = await db.execute(studentQuery, [studentId]);
            
            if (studentResult.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Student not found'
                });
            }
            
            // Get student's detailed results with subject information
            const resultsQuery = `
                SELECT 
                    r.marks,
                    r.PostingDate,
                    r.UpdationDate,
                    s.SubjectName,
                    s.SubjectCode,
                    s.id as SubjectId
                FROM tblresult r
                JOIN tblsubjects s ON s.id = r.SubjectId
                WHERE r.StudentId = ?
                ORDER BY s.SubjectName
            `;
            
            const [results] = await db.execute(resultsQuery, [studentId]);
            
            // Calculate statistics
            let totalMarks = 0;
            let maxMarks = 0;
            let minMarks = 100;
            
            results.forEach(result => {
                const marks = parseFloat(result.marks);
                totalMarks += marks;
                if (marks > maxMarks) maxMarks = marks;
                if (marks < minMarks) minMarks = marks;
            });
            
            const averageMarks = results.length > 0 ? (totalMarks / results.length).toFixed(2) : 0;
            const percentage = results.length > 0 ? ((totalMarks / (results.length * 100)) * 100).toFixed(2) : 0;
            
            console.log(`✅ Found detailed results for student ${studentId}: ${results.length} subjects`);
            
            res.json({
                success: true,
                student: studentResult[0],
                results: results,
                statistics: {
                    totalSubjects: results.length,
                    totalMarks: totalMarks,
                    averageMarks: parseFloat(averageMarks),
                    percentage: parseFloat(percentage),
                    maxMarks: maxMarks,
                    minMarks: results.length > 0 ? minMarks : 0
                }
            });
            
        } catch (error) {
            console.error('❌ Error fetching detailed student results:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to fetch detailed results',
                error: error.message
            });
        }
    }

    // Update student results (for edit functionality)
    static async updateStudentResults(req, res) {
        let connection;
        
        try {
            const { studentId } = req.params;
            const { marks } = req.body;
            
            console.log('📝 Updating results for student:', studentId);
            
            // Validate input
            if (!studentId || isNaN(studentId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid student ID provided'
                });
            }
            
            if (!marks || !Array.isArray(marks)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid marks data provided'
                });
            }

            // Validate marks array
            for (const mark of marks) {
                if (!mark.subjectId || mark.marks === undefined || mark.marks < 0 || mark.marks > 100) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid marks data. Marks must be between 0 and 100.'
                    });
                }
            }

            connection = await db.getConnection();
            await connection.beginTransaction();
            console.log('🔄 Transaction started for update');

            // Update results
            const updateQuery = `
                UPDATE tblresult 
                SET marks = ?, UpdationDate = NOW()
                WHERE StudentId = ? AND SubjectId = ?
            `;

            let updateCount = 0;
            for (const mark of marks) {
                console.log(`📝 Updating mark for subject ${mark.subjectId}: ${mark.marks}`);
                const [updateResult] = await connection.execute(updateQuery, [
                    mark.marks,
                    studentId,
                    mark.subjectId
                ]);
                
                if (updateResult.affectedRows > 0) {
                    updateCount++;
                }
            }

            await connection.commit();
            console.log(`✅ Successfully updated ${updateCount} results`);

            res.json({
                success: true,
                message: 'Student results updated successfully',
                data: {
                    studentId,
                    updatedSubjects: updateCount
                }
            });

        } catch (error) {
            if (connection) {
                await connection.rollback();
                console.log('🔄 Transaction rolled back');
            }
            console.error('❌ Error updating student results:', error);
            res.status(500).json({
                success: false,
                message: 'Something went wrong while updating results',
                error: error.message
            });
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    // Delete student results
    static async deleteStudentResults(req, res) {
        let connection;
        
        try {
            const { studentId } = req.params;
            console.log('🗑️ Deleting results for student:', studentId);
            
            if (!studentId || isNaN(studentId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid student ID provided'
                });
            }

            connection = await db.getConnection();
            await connection.beginTransaction();

            // Check if results exist
            const checkQuery = `SELECT COUNT(*) as count FROM tblresult WHERE StudentId = ?`;
            const [checkResult] = await connection.execute(checkQuery, [studentId]);
            
            if (checkResult[0].count === 0) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    message: 'No results found for this student'
                });
            }

            // Delete results
            const deleteQuery = `DELETE FROM tblresult WHERE StudentId = ?`;
            const [deleteResult] = await connection.execute(deleteQuery, [studentId]);

            await connection.commit();
            console.log(`✅ Successfully deleted ${deleteResult.affectedRows} results`);

            res.json({
                success: true,
                message: 'Student results deleted successfully',
                data: {
                    studentId,
                    deletedRecords: deleteResult.affectedRows
                }
            });

        } catch (error) {
            if (connection) {
                await connection.rollback();
                console.log('🔄 Transaction rolled back');
            }
            console.error('❌ Error deleting student results:', error);
            res.status(500).json({
                success: false,
                message: 'Something went wrong while deleting results',
                error: error.message
            });
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    // Enhanced dashboard statistics
    static async getDashboardStats(req, res) {
        try {
            console.log('📊 Fetching enhanced dashboard statistics...');
            
            const queries = {
                totalStudents: 'SELECT COUNT(*) as count FROM tblstudents',
                totalClasses: 'SELECT COUNT(*) as count FROM tblclasses',
                totalSubjects: 'SELECT COUNT(*) as count FROM tblsubjects',
                totalResults: 'SELECT COUNT(DISTINCT StudentId) as count FROM tblresult',
                totalResultRecords: 'SELECT COUNT(*) as count FROM tblresult',
                totalSubjectCombinations: 'SELECT COUNT(*) as count FROM tblsubjectcombination'
            };

            const stats = {};
            
            for (const [key, query] of Object.entries(queries)) {
                try {
                    const [result] = await db.execute(query);
                    stats[key] = result[0].count;
                } catch (queryError) {
                    console.error(`Error executing ${key} query:`, queryError);
                    stats[key] = 0;
                }
            }

            // Try to get active students (if Status column exists)
            try {
                const [activeResult] = await db.execute('SELECT COUNT(*) as count FROM tblstudents WHERE Status = 1');
                stats.activeStudents = activeResult[0].count;
                
                const [blockedResult] = await db.execute('SELECT COUNT(*) as count FROM tblstudents WHERE Status = 0');
                stats.blockedStudents = blockedResult[0].count;
            } catch (statusError) {
                stats.activeStudents = stats.totalStudents;
                stats.blockedStudents = 0;
            }

            // Try to get active classes (if Status column exists)
            try {
                const [activeClassesResult] = await db.execute('SELECT COUNT(*) as count FROM tblclasses WHERE Status = 1');
                stats.activeClasses = activeClassesResult[0].count;
            } catch (statusError) {
                stats.activeClasses = stats.totalClasses;
            }

            // Calculate additional metrics
            stats.studentsWithResults = stats.totalResults;
            stats.studentsWithoutResults = stats.activeStudents - stats.totalResults;
            stats.resultCompletionRate = stats.activeStudents > 0 
                ? Math.round((stats.totalResults / stats.activeStudents) * 100)
                : 0;

            // Calculate average results per student
            stats.averageResultsPerStudent = stats.totalResults > 0 
                ? Math.round(stats.totalResultRecords / stats.totalResults)
                : 0;

            console.log('✅ Enhanced dashboard stats calculated successfully:', stats);
            
            res.json({
                success: true,
                data: stats,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('❌ Error fetching dashboard stats:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to fetch statistics',
                error: error.message
            });
        }
    }

    // Get class-wise result summary
    static async getClassWiseResults(req, res) {
        try {
            console.log('📊 Fetching class-wise result summary...');
            
            const query = `
                SELECT 
                    c.ClassName,
                    c.Section,
                    COUNT(DISTINCT r.StudentId) as studentsWithResults,
                    COUNT(r.id) as totalResultRecords,
                    AVG(r.marks) as averageMarks,
                    MAX(r.marks) as highestMarks,
                    MIN(r.marks) as lowestMarks
                FROM tblclasses c
                LEFT JOIN tblresult r ON c.id = r.ClassId
                GROUP BY c.id, c.ClassName, c.Section
                ORDER BY c.ClassName, c.Section
            `;
            
            const [results] = await db.execute(query);
            
            // Format results
            const formattedResults = results.map(result => ({
                className: result.ClassName,
                section: result.Section,
                studentsWithResults: result.studentsWithResults || 0,
                totalResultRecords: result.totalResultRecords || 0,
                averageMarks: result.averageMarks ? parseFloat(result.averageMarks).toFixed(2) : 0,
                highestMarks: result.highestMarks || 0,
                lowestMarks: result.lowestMarks || 0
            }));
            
            console.log(`✅ Found class-wise results for ${results.length} classes`);
            
            res.json({
                success: true,
                data: formattedResults
            });
            
        } catch (error) {
            console.error('❌ Error fetching class-wise results:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to fetch class-wise results',
                error: error.message
            });
        }
    }

    // Get subject-wise result summary
    static async getSubjectWiseResults(req, res) {
        try {
            console.log('📊 Fetching subject-wise result summary...');
            
            const query = `
                SELECT 
                    s.SubjectName,
                    s.SubjectCode,
                    COUNT(r.id) as totalResults,
                    AVG(r.marks) as averageMarks,
                    MAX(r.marks) as highestMarks,
                    MIN(r.marks) as lowestMarks,
                    COUNT(CASE WHEN r.marks >= 90 THEN 1 END) as aGrades,
                    COUNT(CASE WHEN r.marks >= 80 AND r.marks < 90 THEN 1 END) as bGrades,
                    COUNT(CASE WHEN r.marks >= 70 AND r.marks < 80 THEN 1 END) as cGrades,
                    COUNT(CASE WHEN r.marks < 40 THEN 1 END) as failures
                FROM tblsubjects s
                LEFT JOIN tblresult r ON s.id = r.SubjectId
                GROUP BY s.id, s.SubjectName, s.SubjectCode
                ORDER BY s.SubjectName
            `;
            
            const [results] = await db.execute(query);
            
            // Format results
            const formattedResults = results.map(result => ({
                subjectName: result.SubjectName,
                subjectCode: result.SubjectCode,
                totalResults: result.totalResults || 0,
                averageMarks: result.averageMarks ? parseFloat(result.averageMarks).toFixed(2) : 0,
                highestMarks: result.highestMarks || 0,
                lowestMarks: result.lowestMarks || 0,
                gradeDistribution: {
                    aGrades: result.aGrades || 0,
                    bGrades: result.bGrades || 0,
                    cGrades: result.cGrades || 0,
                    failures: result.failures || 0
                }
            }));
            
            console.log(`✅ Found subject-wise results for ${results.length} subjects`);
            
            res.json({
                success: true,
                data: formattedResults
            });
            
        } catch (error) {
            console.error('❌ Error fetching subject-wise results:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to fetch subject-wise results',
                error: error.message
            });
        }
    }
}

module.exports = ResultController;