-- SRMS Database Backup
-- Generated on: 2025-07-24T17:45:16.850Z
-- Database: srms

-- Table structure for tblclasses
DROP TABLE IF EXISTS `tblclasses`;
CREATE TABLE `tblclasses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ClassName` varchar(80) DEFAULT NULL COMMENT 'Name of the class (e.g., Grade 1, Class 10)',
  `ClassNameNumeric` int(4) NOT NULL COMMENT 'Numeric representation of class',
  `Section` varchar(5) NOT NULL COMMENT 'Section identifier (A, B, C, etc.)',
  `Status` int(1) NOT NULL DEFAULT 1 COMMENT '1=Active, 0=Inactive - NEWLY ADDED COLUMN',
  `CreationDate` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'When class was created',
  `UpdationDate` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE current_timestamp() COMMENT 'Last modification timestamp',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_class_section` (`ClassName`,`Section`) COMMENT 'Prevent duplicate class-section combinations',
  KEY `idx_status` (`Status`) COMMENT 'Index for filtering active classes'
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci COMMENT='Class/Grade management table';

-- Data for table tblclasses
INSERT INTO `tblclasses` VALUES
(1, 'Class 1', 1, 'A', 1, '2025-07-21 23:18:30', ),
(2, 'Class 1', 1, 'B', 1, '2025-07-21 23:18:30', ),
(3, 'Class 2', 2, 'A', 1, '2025-07-21 23:18:30', ),
(4, 'Class 2', 2, 'B', 1, '2025-07-21 23:18:30', ),
(5, 'Class 3', 3, 'A', 1, '2025-07-21 23:18:30', ),
(6, 'Class 4', 4, 'A', 1, '2025-07-21 23:18:30', ),
(7, 'Class 5', 5, 'A', 1, '2025-07-21 23:18:30', ),
(8, 'Class 6', 6, 'A', 0, '2025-07-21 23:18:30', ),
(9, 's.1', 3, 'C', 1, '2025-07-22 15:23:08', );

-- Table structure for tblsubjects
DROP TABLE IF EXISTS `tblsubjects`;
CREATE TABLE `tblsubjects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `SubjectName` varchar(100) NOT NULL COMMENT 'Full name of the subject',
  `SubjectCode` varchar(100) NOT NULL COMMENT 'Short code for the subject (e.g., MATH01)',
  `Creationdate` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'When subject was added',
  `UpdationDate` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE current_timestamp() COMMENT 'Last modification timestamp',
  PRIMARY KEY (`id`),
  UNIQUE KEY `SubjectCode` (`SubjectCode`) COMMENT 'Ensure unique subject codes',
  KEY `idx_subject_name` (`SubjectName`) COMMENT 'Index for subject name searches'
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci COMMENT='Subjects master table';

-- Data for table tblsubjects
INSERT INTO `tblsubjects` VALUES
(1, 'Mathematics', 'MATH01', '2025-07-21 23:18:30', ),
(2, 'English Language', 'ENG01', '2025-07-21 23:18:30', ),
(3, 'Science', 'SCI01', '2025-07-21 23:18:30', ),
(4, 'Social Studies', 'SOC01', '2025-07-21 23:18:30', ),
(5, 'Art & Craft', 'ART01', '2025-07-21 23:18:30', ),
(6, 'Computer Science', 'CS01', '2025-07-21 23:18:30', ),
(7, 'Physical Education', 'PE01', '2025-07-21 23:18:30', ),
(8, 'Music', 'MUS01', '2025-07-21 23:18:30', ),
(9, 'math', '4', '2025-07-22 15:25:19', );

-- Table structure for tblstudents
DROP TABLE IF EXISTS `tblstudents`;
CREATE TABLE `tblstudents` (
  `StudentId` int(11) NOT NULL AUTO_INCREMENT,
  `StudentName` varchar(100) NOT NULL COMMENT 'Full name of the student',
  `RollId` varchar(100) NOT NULL COMMENT 'Unique roll number/ID',
  `StudentEmail` varchar(100) NOT NULL COMMENT 'Student email address',
  `Gender` varchar(10) NOT NULL COMMENT 'Male/Female/Other',
  `DOB` varchar(100) NOT NULL COMMENT 'Date of birth',
  `ClassId` int(11) NOT NULL COMMENT 'Reference to tblclasses.id',
  `RegDate` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Registration timestamp',
  `UpdationDate` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp() COMMENT 'Last profile update',
  `Status` int(1) NOT NULL COMMENT '1=Active, 0=Blocked student',
  PRIMARY KEY (`StudentId`),
  UNIQUE KEY `RollId` (`RollId`) COMMENT 'Ensure unique roll IDs',
  UNIQUE KEY `StudentEmail` (`StudentEmail`) COMMENT 'Ensure unique email addresses',
  KEY `idx_class` (`ClassId`) COMMENT 'Index for class-wise student queries',
  KEY `idx_status` (`Status`) COMMENT 'Index for filtering active students',
  CONSTRAINT `fk_student_class` FOREIGN KEY (`ClassId`) REFERENCES `tblclasses` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci COMMENT='Student information table';

-- Data for table tblstudents
INSERT INTO `tblstudents` VALUES
(1, 'Alice Johnson', '001', 'alice.johnson@email.com', 'Female', '2010-01-15', 1, '2025-07-21 23:18:30', NULL, 1),
(2, 'Bob Smith', '002', 'bob.smith@email.com', 'Male', '2010-02-20', 1, '2025-07-21 23:18:30', NULL, 1),
(3, 'Charlie Brown', '003', 'charlie.brown@email.com', 'Male', '2010-03-10', 1, '2025-07-21 23:18:30', NULL, 1),
(4, 'Diana Prince', '004', 'diana.prince@email.com', 'Female', '2009-05-12', 2, '2025-07-21 23:18:30', NULL, 1),
(5, 'Edward Davis', '005', 'edward.davis@email.com', 'Male', '2009-06-18', 2, '2025-07-21 23:18:30', NULL, 1),
(6, 'Fiona Wilson', '006', 'fiona.wilson@email.com', 'Female', '2008-08-22', 3, '2025-07-21 23:18:30', NULL, 1),
(7, 'George Miller', '007', 'george.miller@email.com', 'Male', '2008-09-14', 3, '2025-07-21 23:18:30', '2025-07-22 15:37:32', 1),
(8, 'Helen Garcia', '008', 'helen.garcia@email.com', 'Female', '2007-11-05', 4, '2025-07-21 23:18:30', NULL, 1);

-- Table structure for tblsubjectcombination
DROP TABLE IF EXISTS `tblsubjectcombination`;
CREATE TABLE `tblsubjectcombination` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ClassId` int(11) NOT NULL COMMENT 'Reference to tblclasses.id',
  `SubjectId` int(11) NOT NULL COMMENT 'Reference to tblsubjects.id',
  `status` int(1) DEFAULT NULL COMMENT '1=Active combination, 0=Inactive',
  `CreationDate` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'When combination was created',
  `Updationdate` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Last update timestamp',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_class_subject` (`ClassId`,`SubjectId`) COMMENT 'Prevent duplicate subject assignments to same class',
  KEY `idx_class` (`ClassId`) COMMENT 'Index for class subject queries',
  KEY `idx_subject` (`SubjectId`) COMMENT 'Index for subject class queries',
  KEY `idx_status` (`status`) COMMENT 'Index for filtering active combinations',
  CONSTRAINT `fk_combination_class` FOREIGN KEY (`ClassId`) REFERENCES `tblclasses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_combination_subject` FOREIGN KEY (`SubjectId`) REFERENCES `tblsubjects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci COMMENT='Subject-Class relationship table';

-- Data for table tblsubjectcombination
INSERT INTO `tblsubjectcombination` VALUES
(1, 1, 1, 1, '2025-07-21 23:18:30', '2025-07-21 23:18:30'),
(2, 1, 2, 1, '2025-07-21 23:18:30', '2025-07-21 23:18:30'),
(3, 1, 3, 1, '2025-07-21 23:18:30', '2025-07-21 23:18:30'),
(4, 1, 4, 1, '2025-07-21 23:18:30', '2025-07-21 23:18:30'),
(5, 2, 1, 1, '2025-07-21 23:18:30', '2025-07-21 23:18:30'),
(6, 2, 2, 1, '2025-07-21 23:18:30', '2025-07-21 23:18:30'),
(7, 2, 3, 1, '2025-07-21 23:18:30', '2025-07-21 23:18:30'),
(8, 2, 4, 1, '2025-07-21 23:18:30', '2025-07-21 23:18:30'),
(9, 3, 1, 1, '2025-07-21 23:18:30', '2025-07-21 23:18:30'),
(10, 3, 2, 1, '2025-07-21 23:18:30', '2025-07-21 23:18:30'),
(11, 3, 3, 1, '2025-07-21 23:18:30', '2025-07-21 23:18:30'),
(12, 3, 4, 1, '2025-07-21 23:18:30', '2025-07-21 23:18:30'),
(13, 3, 5, 1, '2025-07-21 23:18:30', '2025-07-21 23:18:30'),
(14, 4, 1, 1, '2025-07-21 23:18:30', '2025-07-21 23:18:30'),
(15, 4, 2, 1, '2025-07-21 23:18:30', '2025-07-21 23:18:30'),
(16, 4, 3, 1, '2025-07-21 23:18:30', '2025-07-21 23:18:30'),
(17, 4, 4, 1, '2025-07-21 23:18:30', '2025-07-21 23:18:30'),
(18, 4, 5, 1, '2025-07-21 23:18:30', '2025-07-21 23:18:30'),
(19, 5, 1, 1, '2025-07-21 23:18:30', '2025-07-21 23:18:30'),
(20, 5, 2, 1, '2025-07-21 23:18:30', '2025-07-21 23:18:30'),
(21, 5, 3, 1, '2025-07-21 23:18:30', '2025-07-21 23:18:30'),
(22, 5, 4, 1, '2025-07-21 23:18:30', '2025-07-21 23:18:30'),
(23, 5, 6, 1, '2025-07-21 23:18:30', '2025-07-21 23:18:30'),
(24, 6, 1, 1, '2025-07-21 23:18:30', '2025-07-21 23:18:30'),
(25, 6, 2, 1, '2025-07-21 23:18:30', '2025-07-21 23:18:30'),
(26, 6, 3, 1, '2025-07-21 23:18:30', '2025-07-21 23:18:30'),
(27, 6, 4, 1, '2025-07-21 23:18:30', '2025-07-21 23:18:30'),
(28, 6, 6, 1, '2025-07-21 23:18:30', '2025-07-21 23:18:30'),
(29, 6, 7, 1, '2025-07-21 23:18:30', '2025-07-21 23:18:30');

-- Table structure for tblresult
DROP TABLE IF EXISTS `tblresult`;
CREATE TABLE `tblresult` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `StudentId` int(11) DEFAULT NULL COMMENT 'Reference to tblstudents.StudentId',
  `ClassId` int(11) DEFAULT NULL COMMENT 'Reference to tblclasses.id',
  `SubjectId` int(11) DEFAULT NULL COMMENT 'Reference to tblsubjects.id',
  `marks` int(11) DEFAULT NULL COMMENT 'Marks obtained (0-100)',
  `PostingDate` timestamp NULL DEFAULT current_timestamp() COMMENT 'When result was entered',
  `UpdationDate` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp() COMMENT 'Last result modification',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_subject` (`StudentId`,`ClassId`,`SubjectId`) COMMENT 'Prevent duplicate results for same student-subject',
  KEY `idx_student` (`StudentId`) COMMENT 'Index for student result queries',
  KEY `idx_class` (`ClassId`) COMMENT 'Index for class result queries',
  KEY `idx_subject` (`SubjectId`) COMMENT 'Index for subject result queries',
  CONSTRAINT `fk_result_class` FOREIGN KEY (`ClassId`) REFERENCES `tblclasses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_result_student` FOREIGN KEY (`StudentId`) REFERENCES `tblstudents` (`StudentId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_result_subject` FOREIGN KEY (`SubjectId`) REFERENCES `tblsubjects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci COMMENT='Student results/marks storage table';

