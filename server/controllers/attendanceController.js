const db = require('../config/database');
const QRCode = require('qrcode');

// Mark attendance manually
const markAttendance = async (req, res) => {
    try {
        const { studentId, classId, sessionId = 1, status = 'Present', remarks = '' } = req.body;

        if (!studentId || !classId) {
            return res.json({
                success: false,
                message: 'Student ID and Class ID are required'
            });
        }

        const attendanceDate = new Date().toISOString().split('T')[0];
        const checkInTime = status === 'Present' || status === 'Late' ? 
            new Date().toTimeString().split(' ')[0] : null;

        // Check if attendance already exists
        const existingQuery = `
            SELECT id FROM tblattendance 
            WHERE StudentId = ? AND AttendanceDate = ? AND SessionId = ?
        `;
        const [existing] = await db.execute(existingQuery, [studentId, attendanceDate, sessionId]);

        if (existing.length > 0) {
            // Update existing attendance
            const updateQuery = `
                UPDATE tblattendance 
                SET Status = ?, CheckInTime = ?, Remarks = ?, UpdatedAt = NOW()
                WHERE StudentId = ? AND AttendanceDate = ? AND SessionId = ?
            `;
            await db.execute(updateQuery, [status, checkInTime, remarks, studentId, attendanceDate, sessionId]);
        } else {
            // Insert new attendance
            const insertQuery = `
                INSERT INTO tblattendance 
                (StudentId, ClassId, AttendanceDate, SessionId, Status, CheckInTime, Method, Remarks, CreatedBy)
                VALUES (?, ?, ?, ?, ?, ?, 'Manual', ?, 1)
            `;
            await db.execute(insertQuery, [studentId, classId, attendanceDate, sessionId, status, checkInTime, remarks]);
        }

        res.json({
            success: true,
            message: 'Attendance marked successfully'
        });

    } catch (error) {
        console.error('Error marking attendance:', error);
        res.json({
            success: false,
            message: 'Error marking attendance'
        });
    }
};

// Mark QR Code attendance
const markQRAttendance = async (req, res) => {
    try {
        const { qrData, location } = req.body;

        if (!qrData) {
            return res.json({
                success: false,
                message: 'QR code data is required'
            });
        }

        // Parse QR data
        let studentData;
        try {
            studentData = JSON.parse(qrData);
        } catch (parseError) {
            return res.json({
                success: false,
                message: 'Invalid QR code format'
            });
        }

        const { studentId, classId } = studentData;
        if (!studentId || !classId) {
            return res.json({
                success: false,
                message: 'Invalid QR code data'
            });
        }

        // Verify student exists and is active
        const studentQuery = `
            SELECT StudentId, ClassId FROM tblstudents 
            WHERE StudentId = ? AND ClassId = ? AND Status = 1
        `;
        const [students] = await db.execute(studentQuery, [studentId, classId]);

        if (students.length === 0) {
            return res.json({
                success: false,
                message: 'Student not found or inactive'
            });
        }

        const attendanceDate = new Date().toISOString().split('T')[0];
        const checkInTime = new Date().toTimeString().split(' ')[0];

        // Check class settings for late threshold
        const settingsQuery = `
            SELECT LateThreshold, QRCodeEnabled FROM tblattendance_settings 
            WHERE ClassId = ?
        `;
        const [settings] = await db.execute(settingsQuery, [classId]);
        
        const lateThreshold = settings.length > 0 ? settings[0].LateThreshold : 15;
        const qrEnabled = settings.length > 0 ? settings[0].QRCodeEnabled : 1;

        if (!qrEnabled) {
            return res.json({
                success: false,
                message: 'QR code attendance is disabled for this class'
            });
        }

        // Determine if late
        const sessionQuery = `SELECT StartTime FROM tblattendance_sessions WHERE id = 1 AND IsActive = 1`;
        const [sessions] = await db.execute(sessionQuery);
        
        let status = 'Present';
        if (sessions.length > 0) {
            const startTime = new Date(`1970-01-01 ${sessions[0].StartTime}`);
            const currentTime = new Date(`1970-01-01 ${checkInTime}`);
            const diffMinutes = (currentTime - startTime) / (1000 * 60);
            
            if (diffMinutes > lateThreshold) {
                status = 'Late';
            }
        }

        // Check if already marked
        const existingQuery = `
            SELECT id FROM tblattendance 
            WHERE StudentId = ? AND AttendanceDate = ? AND SessionId = 1
        `;
        const [existing] = await db.execute(existingQuery, [studentId, attendanceDate]);

        if (existing.length > 0) {
            return res.json({
                success: false,
                message: 'Attendance already marked for today'
            });
        }

        // Insert attendance
        const insertQuery = `
            INSERT INTO tblattendance 
            (StudentId, ClassId, AttendanceDate, SessionId, Status, CheckInTime, Method, Location, CreatedBy)
            VALUES (?, ?, ?, 1, ?, ?, 'QR', ?, 1)
        `;
        await db.execute(insertQuery, [studentId, classId, attendanceDate, status, checkInTime, location]);

        res.json({
            success: true,
            message: `QR attendance marked as ${status}`,
            data: { status, checkInTime, studentId }
        });

    } catch (error) {
        console.error('Error marking QR attendance:', error);
        res.json({
            success: false,
            message: 'Error processing QR attendance'
        });
    }
};

// Mark fingerprint attendance
const markFingerprintAttendance = async (req, res) => {
    try {
        const { studentId, classId, fingerprintData, location } = req.body;

        if (!studentId || !classId || !fingerprintData) {
            return res.json({
                success: false,
                message: 'Student ID, Class ID, and fingerprint data are required'
            });
        }

        // Verify student exists and is active
        const studentQuery = `
            SELECT StudentId, ClassId FROM tblstudents 
            WHERE StudentId = ? AND ClassId = ? AND Status = 1
        `;
        const [students] = await db.execute(studentQuery, [studentId, classId]);

        if (students.length === 0) {
            return res.json({
                success: false,
                message: 'Student not found or inactive'
            });
        }

        // Check if fingerprint is enabled for class
        const settingsQuery = `
            SELECT FingerprintEnabled, LateThreshold FROM tblattendance_settings 
            WHERE ClassId = ?
        `;
        const [settings] = await db.execute(settingsQuery, [classId]);
        
        const fingerprintEnabled = settings.length > 0 ? settings[0].FingerprintEnabled : 0;
        const lateThreshold = settings.length > 0 ? settings[0].LateThreshold : 15;

        if (!fingerprintEnabled) {
            return res.json({
                success: false,
                message: 'Fingerprint attendance is disabled for this class'
            });
        }

        const attendanceDate = new Date().toISOString().split('T')[0];
        const checkInTime = new Date().toTimeString().split(' ')[0];

        // Determine if late (same logic as QR)
        const sessionQuery = `SELECT StartTime FROM tblattendance_sessions WHERE id = 1 AND IsActive = 1`;
        const [sessions] = await db.execute(sessionQuery);
        
        let status = 'Present';
        if (sessions.length > 0) {
            const startTime = new Date(`1970-01-01 ${sessions[0].StartTime}`);
            const currentTime = new Date(`1970-01-01 ${checkInTime}`);
            const diffMinutes = (currentTime - startTime) / (1000 * 60);
            
            if (diffMinutes > lateThreshold) {
                status = 'Late';
            }
        }

        // Check if already marked
        const existingQuery = `
            SELECT id FROM tblattendance 
            WHERE StudentId = ? AND AttendanceDate = ? AND SessionId = 1
        `;
        const [existing] = await db.execute(existingQuery, [studentId, attendanceDate]);

        if (existing.length > 0) {
            return res.json({
                success: false,
                message: 'Attendance already marked for today'
            });
        }

        // Insert attendance
        const insertQuery = `
            INSERT INTO tblattendance 
            (StudentId, ClassId, AttendanceDate, SessionId, Status, CheckInTime, Method, Location, CreatedBy)
            VALUES (?, ?, ?, 1, ?, ?, 'Fingerprint', ?, 1)
        `;
        await db.execute(insertQuery, [studentId, classId, attendanceDate, status, checkInTime, location]);

        res.json({
            success: true,
            message: `Fingerprint attendance marked as ${status}`,
            data: { status, checkInTime, studentId }
        });

    } catch (error) {
        console.error('Error marking fingerprint attendance:', error);
        res.json({
            success: false,
            message: 'Error processing fingerprint attendance'
        });
    }
};

// Mark bulk attendance
const markBulkAttendance = async (req, res) => {
    try {
        const { classId, sessionId = 1, students } = req.body;

        if (!classId || !students || !Array.isArray(students)) {
            return res.json({
                success: false,
                message: 'Class ID and students array are required'
            });
        }

        const attendanceDate = new Date().toISOString().split('T')[0];
        
        // Prepare bulk insert
        const insertValues = [];
        const placeholders = [];

        students.forEach(student => {
            const { studentId, status = 'Present', remarks = '' } = student;
            const checkInTime = status === 'Present' || status === 'Late' ? 
                new Date().toTimeString().split(' ')[0] : null;

            insertValues.push(studentId, classId, attendanceDate, sessionId, status, checkInTime, 'Bulk', remarks, 1);
            placeholders.push('(?, ?, ?, ?, ?, ?, ?, ?, ?)');
        });

        // Delete existing attendance for the date
        const deleteQuery = `
            DELETE FROM tblattendance 
            WHERE ClassId = ? AND AttendanceDate = ? AND SessionId = ?
        `;
        await db.execute(deleteQuery, [classId, attendanceDate, sessionId]);

        // Insert bulk attendance
        const insertQuery = `
            INSERT INTO tblattendance 
            (StudentId, ClassId, AttendanceDate, SessionId, Status, CheckInTime, Method, Remarks, CreatedBy)
            VALUES ${placeholders.join(', ')}
        `;
        await db.execute(insertQuery, insertValues);

        res.json({
            success: true,
            message: `Bulk attendance marked for ${students.length} students`
        });

    } catch (error) {
        console.error('Error marking bulk attendance:', error);
        res.json({
            success: false,
            message: 'Error marking bulk attendance'
        });
    }
};

// Get today's attendance
const getTodayAttendance = async (req, res) => {
    try {
        const { classId } = req.query;
        const today = new Date().toISOString().split('T')[0];

        let query = `
            SELECT 
                a.StudentId,
                a.Status,
                a.CheckInTime,
                a.Method,
                a.Remarks,
                s.StudentName,
                s.RollId,
                c.ClassName,
                c.Section
            FROM tblattendance a
            JOIN tblstudents s ON s.StudentId = a.StudentId
            JOIN tblclasses c ON c.id = a.ClassId
            WHERE a.AttendanceDate = ?
        `;
        
        const params = [today];
        
        if (classId) {
            query += ' AND a.ClassId = ?';
            params.push(classId);
        }
        
        query += ' ORDER BY c.ClassName, c.Section, s.StudentName';

        const [attendance] = await db.execute(query, params);

        res.json({
            success: true,
            data: attendance,
            date: today
        });

    } catch (error) {
        console.error('Error fetching today\'s attendance:', error);
        res.json({
            success: false,
            message: 'Error fetching attendance data'
        });
    }
};

// Get class attendance for specific date
const getClassAttendance = async (req, res) => {
    try {
        const { classId, date } = req.params;

        const query = `
            SELECT 
                s.StudentId,
                s.StudentName,
                s.RollId,
                a.Status,
                a.CheckInTime,
                a.Method,
                a.Remarks,
                a.CreatedAt
            FROM tblstudents s
            LEFT JOIN tblattendance a ON s.StudentId = a.StudentId 
                AND a.AttendanceDate = ? AND a.ClassId = ?
            WHERE s.ClassId = ? AND s.Status = 1
            ORDER BY s.StudentName
        `;

        const [students] = await db.execute(query, [date, classId, classId]);

        // Add default status for students without attendance
        const processedStudents = students.map(student => ({
            ...student,
            Status: student.Status || 'Absent',
            CheckInTime: student.CheckInTime || null,
            Method: student.Method || null,
            isMarked: !!student.Status
        }));

        res.json({
            success: true,
            data: processedStudents,
            date: date,
            classId: classId
        });

    } catch (error) {
        console.error('Error fetching class attendance:', error);
        res.json({
            success: false,
            message: 'Error fetching attendance data'
        });
    }
};

// Generate QR Code for attendance
const generateQRCode = async (req, res) => {
    try {
        const { classId, sessionId } = req.params;

        // Get class info
        const classQuery = `
            SELECT ClassName, Section FROM tblclasses WHERE id = ? AND Status = 1
        `;
        const [classes] = await db.execute(classQuery, [classId]);

        if (classes.length === 0) {
            return res.json({
                success: false,
                message: 'Class not found'
            });
        }

        // Get session info
        const sessionQuery = `
            SELECT SessionName, StartTime, EndTime FROM tblattendance_sessions 
            WHERE id = ? AND IsActive = 1
        `;
        const [sessions] = await db.execute(sessionQuery, [sessionId]);

        if (sessions.length === 0) {
            return res.json({
                success: false,
                message: 'Session not found'
            });
        }

        const qrData = {
            classId: parseInt(classId),
            sessionId: parseInt(sessionId),
            className: `${classes[0].ClassName} ${classes[0].Section}`,
            sessionName: sessions[0].SessionName,
            date: new Date().toISOString().split('T')[0],
            validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
            type: 'attendance'
        };

        const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
            width: 256,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        res.json({
            success: true,
            data: {
                qrCode: qrCodeDataURL,
                qrData: qrData,
                classInfo: classes[0],
                sessionInfo: sessions[0]
            }
        });

    } catch (error) {
        console.error('Error generating QR code:', error);
        res.json({
            success: false,
            message: 'Error generating QR code'
        });
    }
};

// Get attendance sessions
const getSessions = async (req, res) => {
    try {
        const query = `
            SELECT * FROM tblattendance_sessions 
            WHERE IsActive = 1 
            ORDER BY StartTime
        `;
        const [sessions] = await db.execute(query);

        res.json({
            success: true,
            sessions: sessions
        });

    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.json({
            success: false,
            message: 'Error fetching sessions'
        });
    }
};

// Get class settings
const getClassSettings = async (req, res) => {
    try {
        const { classId } = req.params;

        const query = `
            SELECT * FROM tblattendance_settings 
            WHERE ClassId = ?
        `;
        const [settings] = await db.execute(query, [classId]);

        if (settings.length === 0) {
            // Return default settings
            res.json({
                success: true,
                settings: {
                    RequirePhoto: 0,
                    AllowLateEntry: 1,
                    LateThreshold: 15,
                    GeofenceEnabled: 0,
                    QRCodeEnabled: 1,
                    FingerprintEnabled: 0,
                    AutoMarkAbsent: 1,
                    AutoMarkTime: '10:00:00'
                }
            });
        } else {
            res.json({
                success: true,
                settings: settings[0]
            });
        }

    } catch (error) {
        console.error('Error fetching class settings:', error);
        res.json({
            success: false,
            message: 'Error fetching settings'
        });
    }
};

// Placeholder functions for other routes
const getStudentAttendance = async (req, res) => {
    res.json({ success: true, message: 'Student attendance feature coming soon' });
};

const getDateRangeAttendance = async (req, res) => {
    res.json({ success: true, message: 'Date range attendance feature coming soon' });
};

const createSession = async (req, res) => {
    res.json({ success: true, message: 'Create session feature coming soon' });
};

const updateSession = async (req, res) => {
    res.json({ success: true, message: 'Update session feature coming soon' });
};

const deleteSession = async (req, res) => {
    res.json({ success: true, message: 'Delete session feature coming soon' });
};

const updateClassSettings = async (req, res) => {
    res.json({ success: true, message: 'Update settings feature coming soon' });
};

const getDailyReport = async (req, res) => {
    res.json({ success: true, message: 'Daily report feature coming soon' });
};

const getWeeklyReport = async (req, res) => {
    res.json({ success: true, message: 'Weekly report feature coming soon' });
};

const getMonthlyReport = async (req, res) => {
    res.json({ success: true, message: 'Monthly report feature coming soon' });
};

const getStudentReport = async (req, res) => {
    res.json({ success: true, message: 'Student report feature coming soon' });
};

const getCustomReport = async (req, res) => {
    res.json({ success: true, message: 'Custom report feature coming soon' });
};

const getAttendanceDashboard = async (req, res) => {
    res.json({ success: true, message: 'Attendance dashboard feature coming soon' });
};

const getAttendanceTrends = async (req, res) => {
    res.json({ success: true, message: 'Attendance trends feature coming soon' });
};

const validateQRCode = async (req, res) => {
    res.json({ success: true, message: 'QR validation feature coming soon' });
};

const exportClassAttendance = async (req, res) => {
    res.json({ success: true, message: 'Export attendance feature coming soon' });
};

const exportStudentAttendance = async (req, res) => {
    res.json({ success: true, message: 'Export student attendance feature coming soon' });
};

module.exports = {
    markAttendance,
    markBulkAttendance,
    markQRAttendance,
    markFingerprintAttendance,
    getTodayAttendance,
    getClassAttendance,
    getStudentAttendance,
    getDateRangeAttendance,
    getSessions,
    createSession,
    updateSession,
    deleteSession,
    getClassSettings,
    updateClassSettings,
    getDailyReport,
    getWeeklyReport,
    getMonthlyReport,
    getStudentReport,
    getCustomReport,
    getAttendanceDashboard,
    getAttendanceTrends,
    generateQRCode,
    validateQRCode,
    exportClassAttendance,
    exportStudentAttendance
};
