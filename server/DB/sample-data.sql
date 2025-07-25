-- Sample Data for SRMS Testing
-- Run this file AFTER importing the main srms.sql structure file
--
-- This file contains comprehensive sample data for all tables
-- to test the complete SRMS functionality including:
-- - Admin authentication
-- - Classes and subjects
-- - Students with photos
-- - Subject combinations
-- - Student results

-- ============================================================
-- ADMIN DATA
-- ============================================================

-- Default admin credentials: Username: admin, Password: admin (MD5 hashed)
INSERT INTO `admin` (`id`, `UserName`, `Password`, `updationDate`) VALUES
(1, 'admin', '21232f297a57a5a743894a0e4a801fc3', '2025-07-21 20:18:30');

-- ============================================================
-- CLASS DATA
-- ============================================================

-- Sample classes for different grade levels
INSERT INTO `tblclasses` (`id`, `ClassName`, `ClassNameNumeric`, `Section`, `Status`, `CreationDate`, `UpdationDate`) VALUES
(1, 'Class 1', 1, 'A', 1, '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(2, 'Class 1', 1, 'B', 1, '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(3, 'Class 2', 2, 'A', 1, '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(4, 'Class 2', 2, 'B', 1, '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(5, 'Class 3', 3, 'A', 1, '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(6, 'Class 3', 3, 'B', 1, '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(7, 'Class 4', 4, 'A', 1, '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(8, 'Class 4', 4, 'B', 1, '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(9, 'Class 5', 5, 'A', 1, '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(10, 'Class 6', 6, 'A', 0, '2025-07-21 20:18:30', '0000-00-00 00:00:00'); -- Inactive class for testing

-- ============================================================
-- SUBJECT DATA
-- ============================================================

-- Comprehensive list of subjects for different grade levels
INSERT INTO `tblsubjects` (`id`, `SubjectName`, `SubjectCode`, `Creationdate`, `UpdationDate`) VALUES
(1, 'Mathematics', 'MATH01', '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(2, 'English Language', 'ENG01', '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(3, 'Science', 'SCI01', '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(4, 'Social Studies', 'SOC01', '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(5, 'Art & Craft', 'ART01', '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(6, 'Computer Science', 'CS01', '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(7, 'Physical Education', 'PE01', '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(8, 'Music', 'MUS01', '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(9, 'Geography', 'GEO01', '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(10, 'History', 'HIS01', '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(11, 'Biology', 'BIO01', '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(12, 'Chemistry', 'CHEM01', '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(13, 'Physics', 'PHY01', '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(14, 'Environmental Science', 'ENV01', '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(15, 'Moral Education', 'MOR01', '2025-07-21 20:18:30', '0000-00-00 00:00:00');

-- ============================================================
-- STUDENT DATA
-- ============================================================

-- Comprehensive student data with varied information for testing
INSERT INTO `tblstudents` (`StudentId`, `StudentName`, `RollId`, `StudentEmail`, `Gender`, `DOB`, `ClassId`, `RegDate`, `UpdationDate`, `Status`, `PhotoPath`, `ThumbnailPath`, `PhotoUpdated`) VALUES
-- Class 1A students
(1, 'Alice Johnson', '1A001', 'alice.johnson@email.com', 'Female', '2015-01-15', 1, '2025-07-21 20:18:30', NULL, 1, NULL, NULL, NULL),
(2, 'Bob Smith', '1A002', 'bob.smith@email.com', 'Male', '2015-02-20', 1, '2025-07-21 20:18:30', NULL, 1, NULL, NULL, NULL),
(3, 'Charlie Brown', '1A003', 'charlie.brown@email.com', 'Male', '2015-03-10', 1, '2025-07-21 20:18:30', NULL, 1, NULL, NULL, NULL),
(4, 'Diana Prince', '1A004', 'diana.prince@email.com', 'Female', '2015-04-05', 1, '2025-07-21 20:18:30', NULL, 1, NULL, NULL, NULL),

-- Class 1B students
(5, 'Edward Davis', '1B001', 'edward.davis@email.com', 'Male', '2015-05-18', 2, '2025-07-21 20:18:30', NULL, 1, NULL, NULL, NULL),
(6, 'Fiona Wilson', '1B002', 'fiona.wilson@email.com', 'Female', '2015-06-22', 2, '2025-07-21 20:18:30', NULL, 1, NULL, NULL, NULL),
(7, 'George Miller', '1B003', 'george.miller@email.com', 'Male', '2015-07-14', 2, '2025-07-21 20:18:30', NULL, 1, NULL, NULL, NULL), -- Blocked student
(8, 'Helen Garcia', '1B004', 'helen.garcia@email.com', 'Female', '2015-08-05', 2, '2025-07-21 20:18:30', NULL, 1, NULL, NULL, NULL),

-- Class 2A students
(9, 'Ian Thompson', '2A001', 'ian.thompson@email.com', 'Male', '2014-01-10', 3, '2025-07-21 20:18:30', NULL, 1, NULL, NULL, NULL),
(10, 'Julia Martinez', '2A002', 'julia.martinez@email.com', 'Female', '2014-02-15', 3, '2025-07-21 20:18:30', NULL, 1, NULL, NULL, NULL),
(11, 'Kevin Lee', '2A003', 'kevin.lee@email.com', 'Male', '2014-03-20', 3, '2025-07-21 20:18:30', NULL, 1, NULL, NULL, NULL),
(12, 'Laura White', '2A004', 'laura.white@email.com', 'Female', '2014-04-25', 3, '2025-07-21 20:18:30', NULL, 1, NULL, NULL, NULL),

-- Class 2B students
(13, 'Michael Brown', '2B001', 'michael.brown@email.com', 'Male', '2014-05-30', 4, '2025-07-21 20:18:30', NULL, 1, NULL, NULL, NULL),
(14, 'Nina Davis', '2B002', 'nina.davis@email.com', 'Female', '2014-06-08', 4, '2025-07-21 20:18:30', NULL, 1, NULL, NULL, NULL),
(15, 'Oliver Wilson', '2B003', 'oliver.wilson@email.com', 'Male', '2014-07-12', 4, '2025-07-21 20:18:30', NULL, 1, NULL, NULL, NULL),

-- Class 3A students
(16, 'Penelope Garcia', '3A001', 'penelope.garcia@email.com', 'Female', '2013-01-18', 5, '2025-07-21 20:18:30', NULL, 1, NULL, NULL, NULL),
(17, 'Quincy Adams', '3A002', 'quincy.adams@email.com', 'Male', '2013-02-22', 5, '2025-07-21 20:18:30', NULL, 1, NULL, NULL, NULL),
(18, 'Rachel Green', '3A003', 'rachel.green@email.com', 'Female', '2013-03-28', 5, '2025-07-21 20:18:30', NULL, 1, NULL, NULL, NULL),
(19, 'Samuel Jackson', '3A004', 'samuel.jackson@email.com', 'Male', '2013-04-15', 5, '2025-07-21 20:18:30', NULL, 1, NULL, NULL, NULL),

-- Class 3B students
(20, 'Tara Singh', '3B001', 'tara.singh@email.com', 'Female', '2013-05-20', 6, '2025-07-21 20:18:30', NULL, 1, NULL, NULL, NULL),
(21, 'Umar Hassan', '3B002', 'umar.hassan@email.com', 'Male', '2013-06-25', 6, '2025-07-21 20:18:30', NULL, 1, NULL, NULL, NULL),
(22, 'Victoria Lopez', '3B003', 'victoria.lopez@email.com', 'Female', '2013-07-30', 6, '2025-07-21 20:18:30', NULL, 1, NULL, NULL, NULL),

-- Class 4A students
(23, 'William Chen', '4A001', 'william.chen@email.com', 'Male', '2012-01-12', 7, '2025-07-21 20:18:30', NULL, 1, NULL, NULL, NULL),
(24, 'Xara Ahmed', '4A002', 'xara.ahmed@email.com', 'Female', '2012-02-18', 7, '2025-07-21 20:18:30', NULL, 1, NULL, NULL, NULL),
(25, 'Yasir Ali', '4A003', 'yasir.ali@email.com', 'Male', '2012-03-25', 7, '2025-07-21 20:18:30', NULL, 1, NULL, NULL, NULL),

-- Class 4B students
(26, 'Zara Khan', '4B001', 'zara.khan@email.com', 'Female', '2012-04-08', 8, '2025-07-21 20:18:30', NULL, 1, NULL, NULL, NULL),
(27, 'Alexander Pope', '4B002', 'alexander.pope@email.com', 'Male', '2012-05-15', 8, '2025-07-21 20:18:30', NULL, 1, NULL, NULL, NULL),
(28, 'Bella Swan', '4B003', 'bella.swan@email.com', 'Female', '2012-06-22', 8, '2025-07-21 20:18:30', NULL, 1, NULL, NULL, NULL),

-- Class 5A students
(29, 'Carlos Mendez', '5A001', 'carlos.mendez@email.com', 'Male', '2011-01-10', 9, '2025-07-21 20:18:30', NULL, 1, NULL, NULL, NULL),
(30, 'Delia Rose', '5A002', 'delia.rose@email.com', 'Female', '2011-02-14', 9, '2025-07-21 20:18:30', NULL, 1, NULL, NULL, NULL);

-- ============================================================
-- SUBJECT COMBINATION DATA
-- ============================================================

-- Define which subjects are taught in which classes
INSERT INTO `tblsubjectcombination` (`id`, `ClassId`, `SubjectId`, `status`, `CreationDate`, `Updationdate`) VALUES
-- Class 1A subjects (Basic subjects for young learners)
(1, 1, 1, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Mathematics
(2, 1, 2, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- English
(3, 1, 3, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Science
(4, 1, 5, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Art & Craft
(5, 1, 7, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Physical Education

-- Class 1B subjects (same as 1A)
(6, 2, 1, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Mathematics
(7, 2, 2, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- English
(8, 2, 3, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Science
(9, 2, 5, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Art & Craft
(10, 2, 7, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Physical Education

-- Class 2A subjects (introducing social studies)
(11, 3, 1, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Mathematics
(12, 3, 2, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- English
(13, 3, 3, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Science
(14, 3, 4, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Social Studies
(15, 3, 5, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Art & Craft
(16, 3, 7, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Physical Education

-- Class 2B subjects (same as 2A)
(17, 4, 1, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Mathematics
(18, 4, 2, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- English
(19, 4, 3, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Science
(20, 4, 4, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Social Studies
(21, 4, 5, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Art & Craft
(22, 4, 7, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Physical Education

-- Class 3A subjects (introducing computer science)
(23, 5, 1, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Mathematics
(24, 5, 2, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- English
(25, 5, 3, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Science
(26, 5, 4, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Social Studies
(27, 5, 6, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Computer Science
(28, 5, 7, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Physical Education
(29, 5, 8, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Music

-- Class 3B subjects (same as 3A)
(30, 6, 1, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Mathematics
(31, 6, 2, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- English
(32, 6, 3, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Science
(33, 6, 4, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Social Studies
(34, 6, 6, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Computer Science
(35, 6, 7, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Physical Education

-- Class 4A subjects (more subjects including geography and history)
(36, 7, 1, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Mathematics
(37, 7, 2, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- English
(38, 7, 3, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Science
(39, 7, 6, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Computer Science
(40, 7, 7, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Physical Education
(41, 7, 9, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Geography
(42, 7, 10, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- History

-- Class 4B subjects (same as 4A)
(43, 8, 1, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Mathematics
(44, 8, 2, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- English
(45, 8, 3, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Science
(46, 8, 6, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Computer Science
(47, 8, 7, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Physical Education
(48, 8, 9, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Geography
(49, 8, 10, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- History

-- Class 5A subjects (comprehensive curriculum)
(50, 9, 1, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Mathematics
(51, 9, 2, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- English
(52, 9, 6, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Computer Science
(53, 9, 7, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Physical Education
(54, 9, 9, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Geography
(55, 9, 10, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- History
(56, 9, 11, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Biology
(57, 9, 12, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Chemistry
(58, 9, 13, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'); -- Physics

-- ============================================================
-- SAMPLE RESULT DATA
-- ============================================================

-- Sample examination results for testing result management
INSERT INTO `tblresult` (`id`, `StudentId`, `ClassId`, `SubjectId`, `marks`, `PostingDate`, `UpdationDate`) VALUES
-- Class 1A student results
(1, 1, 1, 1, 85, '2025-07-21 20:18:30', NULL), -- Alice - Mathematics
(2, 1, 1, 2, 78, '2025-07-21 20:18:30', NULL), -- Alice - English
(3, 1, 1, 3, 92, '2025-07-21 20:18:30', NULL), -- Alice - Science
(4, 1, 1, 5, 88, '2025-07-21 20:18:30', NULL), -- Alice - Art & Craft
(5, 1, 1, 7, 95, '2025-07-21 20:18:30', NULL), -- Alice - Physical Education

(6, 2, 1, 1, 76, '2025-07-21 20:18:30', NULL), -- Bob - Mathematics
(7, 2, 1, 2, 82, '2025-07-21 20:18:30', NULL), -- Bob - English
(8, 2, 1, 3, 79, '2025-07-21 20:18:30', NULL), -- Bob - Science
(9, 2, 1, 5, 91, '2025-07-21 20:18:30', NULL), -- Bob - Art & Craft
(10, 2, 1, 7, 87, '2025-07-21 20:18:30', NULL), -- Bob - Physical Education

(11, 3, 1, 1, 94, '2025-07-21 20:18:30', NULL), -- Charlie - Mathematics
(12, 3, 1, 2, 89, '2025-07-21 20:18:30', NULL), -- Charlie - English
(13, 3, 1, 3, 96, '2025-07-21 20:18:30', NULL), -- Charlie - Science

-- Class 2A student results
(14, 9, 3, 1, 88, '2025-07-21 20:18:30', NULL), -- Ian - Mathematics
(15, 9, 3, 2, 85, '2025-07-21 20:18:30', NULL), -- Ian - English
(16, 9, 3, 3, 90, '2025-07-21 20:18:30', NULL), -- Ian - Science
(17, 9, 3, 4, 83, '2025-07-21 20:18:30', NULL), -- Ian - Social Studies

(18, 10, 3, 1, 92, '2025-07-21 20:18:30', NULL), -- Julia - Mathematics
(19, 10, 3, 2, 94, '2025-07-21 20:18:30', NULL), -- Julia - English
(20, 10, 3, 3, 87, '2025-07-21 20:18:30', NULL), -- Julia - Science
(21, 10, 3, 4, 91, '2025-07-21 20:18:30', NULL), -- Julia - Social Studies

-- Class 3A student results
(22, 16, 5, 1, 89, '2025-07-21 20:18:30', NULL), -- Penelope - Mathematics
(23, 16, 5, 2, 93, '2025-07-21 20:18:30', NULL), -- Penelope - English
(24, 16, 5, 3, 86, '2025-07-21 20:18:30', NULL), -- Penelope - Science
(25, 16, 5, 6, 95, '2025-07-21 20:18:30', NULL), -- Penelope - Computer Science

-- Class 4A student results
(26, 23, 7, 1, 91, '2025-07-21 20:18:30', NULL), -- William - Mathematics
(27, 23, 7, 2, 88, '2025-07-21 20:18:30', NULL), -- William - English
(28, 23, 7, 9, 84, '2025-07-21 20:18:30', NULL), -- William - Geography
(29, 23, 7, 10, 87, '2025-07-21 20:18:30', NULL), -- William - History

-- Class 5A student results
(30, 29, 9, 1, 93, '2025-07-21 20:18:30', NULL), -- Carlos - Mathematics
(31, 29, 9, 11, 89, '2025-07-21 20:18:30', NULL), -- Carlos - Biology
(32, 29, 9, 12, 92, '2025-07-21 20:18:30', NULL), -- Carlos - Chemistry
(33, 29, 9, 13, 88, '2025-07-21 20:18:30', NULL), -- Carlos - Physics

(34, 30, 9, 1, 87, '2025-07-21 20:18:30', NULL), -- Delia - Mathematics
(35, 30, 9, 2, 95, '2025-07-21 20:18:30', NULL), -- Delia - English
(36, 30, 9, 11, 91, '2025-07-21 20:18:30', NULL), -- Delia - Biology
(37, 30, 9, 12, 86, '2025-07-21 20:18:30', NULL); -- Delia - Chemistry

-- ============================================================
-- PHASE 3: ATTENDANCE SYSTEM SAMPLE DATA
-- ============================================================

-- Default attendance sessions
INSERT INTO `tblattendance_sessions` (`id`, `SessionName`, `StartTime`, `EndTime`, `LateThreshold`, `IsActive`) VALUES
(1, 'Morning Session', '08:00:00', '12:00:00', 15, 1),
(2, 'Afternoon Session', '13:00:00', '17:00:00', 15, 1),
(3, 'Full Day', '08:00:00', '17:00:00', 30, 1),
(4, 'Evening Session', '18:00:00', '21:00:00', 10, 0); -- Disabled for demo

-- Sample attendance settings for classes
INSERT INTO `tblattendance_settings` (`ClassId`, `RequirePhoto`, `AllowLateEntry`, `LateThreshold`, `GeofenceEnabled`, `QRCodeEnabled`, `FingerprintEnabled`, `AutoMarkAbsent`, `AutoMarkTime`) VALUES
(1, 0, 1, 15, 0, 1, 0, 1, '10:00:00'), -- Class 1A - Basic settings
(2, 0, 1, 15, 0, 1, 0, 1, '10:00:00'), -- Class 1B - Basic settings
(3, 1, 1, 20, 0, 1, 0, 1, '10:30:00'), -- Class 2A - Requires photo
(4, 1, 1, 20, 0, 1, 0, 1, '10:30:00'), -- Class 2B - Requires photo
(5, 1, 1, 10, 1, 1, 1, 1, '09:00:00'), -- Class 3A - All features enabled
(6, 1, 1, 10, 0, 1, 1, 1, '09:00:00'), -- Class 3B - Advanced features
(7, 0, 1, 30, 0, 1, 0, 1, '09:30:00'), -- Class 4A - Flexible timing
(8, 0, 1, 30, 0, 1, 0, 1, '09:30:00'), -- Class 4B - Flexible timing
(9, 1, 1, 5, 1, 1, 1, 1, '08:30:00');  -- Class 5A - Strict attendance

-- Sample attendance records for the past week
-- Today's attendance (some students)
INSERT INTO `tblattendance` (`StudentId`, `ClassId`, `AttendanceDate`, `SessionId`, `Status`, `CheckInTime`, `Method`, `CreatedBy`) VALUES
-- Class 1A - Today
(1, 1, CURDATE(), 1, 'Present', '08:05:00', 'Manual', 1),
(2, 1, CURDATE(), 1, 'Present', '08:10:00', 'QR', 1),
(3, 1, CURDATE(), 1, 'Late', '08:20:00', 'Manual', 1),
(4, 1, CURDATE(), 1, 'Absent', NULL, 'Manual', 1),

-- Class 2A - Today
(9, 3, CURDATE(), 1, 'Present', '08:00:00', 'QR', 1),
(10, 3, CURDATE(), 1, 'Present', '08:15:00', 'Manual', 1),
(11, 3, CURDATE(), 1, 'Late', '08:25:00', 'QR', 1),
(12, 3, CURDATE(), 1, 'Present', '08:08:00', 'Manual', 1),

-- Class 3A - Today
(16, 5, CURDATE(), 1, 'Present', '07:55:00', 'Fingerprint', 1),
(17, 5, CURDATE(), 1, 'Present', '08:02:00', 'QR', 1),
(18, 5, CURDATE(), 1, 'Excused', NULL, 'Manual', 1),
(19, 5, CURDATE(), 1, 'Present', '08:05:00', 'QR', 1),

-- Yesterday's attendance (more complete)
(1, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1, 'Present', '08:05:00', 'Manual', 1),
(2, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1, 'Present', '08:00:00', 'QR', 1),
(3, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1, 'Present', '08:12:00', 'Manual', 1),
(4, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1, 'Late', '08:18:00', 'Manual', 1),

(9, 3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1, 'Present', '08:02:00', 'QR', 1),
(10, 3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1, 'Absent', NULL, 'Manual', 1),
(11, 3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1, 'Present', '08:10:00', 'QR', 1),
(12, 3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1, 'Present', '08:05:00', 'Manual', 1),

-- Day before yesterday
(1, 1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 1, 'Present', '08:08:00', 'Manual', 1),
(2, 1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 1, 'Present', '08:03:00', 'QR', 1),
(3, 1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 1, 'Absent', NULL, 'Manual', 1),
(4, 1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 1, 'Present', '08:15:00', 'Manual', 1),

-- Class 5A - Advanced attendance with afternoon sessions
(29, 9, CURDATE(), 1, 'Present', '08:25:00', 'Fingerprint', 1),
(30, 9, CURDATE(), 1, 'Present', '08:30:00', 'QR', 1),
(29, 9, CURDATE(), 2, 'Present', '13:00:00', 'QR', 1),
(30, 9, CURDATE(), 2, 'Late', '13:20:00', 'Manual', 1);

-- Sample attendance report cache
INSERT INTO `tblattendance_reports` (`ReportType`, `ClassId`, `DateFrom`, `DateTo`, `GeneratedData`, `GeneratedBy`) VALUES
('Daily', 1, CURDATE(), CURDATE(), '{"totalStudents":4,"presentCount":2,"absentCount":1,"lateCount":1,"attendanceRate":75.0}', 1),
('Weekly', 5, DATE_SUB(CURDATE(), INTERVAL 7 DAY), CURDATE(), '{"totalDays":7,"avgAttendanceRate":89.5,"bestDay":"Monday","worstDay":"Friday"}', 1),
('Monthly', NULL, DATE_SUB(CURDATE(), INTERVAL 30 DAY), CURDATE(), '{"totalClasses":9,"avgAttendanceRate":87.2,"totalStudents":30}', 1);

-- ============================================================
-- ATTENDANCE SAMPLE DATA SETUP COMPLETE
-- ============================================================
-- This provides:
-- - 4 attendance sessions (3 active, 1 disabled)
-- - Settings for all 9 classes with varied configurations
-- - Sample attendance records for multiple days
-- - Mix of attendance methods and statuses
-- - Cached report examples
-- - Ready for testing all attendance features
-- ============================================================
