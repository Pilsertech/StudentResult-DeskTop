-- phpMyAdmin SQL Dump - UPDATED STRUCTURE ONLY
-- Updated on: 2025-07-21 20:18:30 UTC by Pilsertech
-- Original version: 5.0.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 21, 2025 at 08:18 PM (Updated)
-- Server version: 10.4.11-MariaDB
-- PHP Version: 7.4.2
--
-- STRUCTURE ONLY - NO SAMPLE DATA
-- For sample data, run the sample-data.sql file separately
--
-- UPDATES MADE:
-- 1. Added Status column to tblclasses table
-- 2. Added photo fields to tblstudents table (PhotoPath, ThumbnailPath, PhotoUpdated)
-- 3. Added proper relationships and constraints
-- 4. Separated structure from sample data

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `srms` (Student Result Management System)
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
-- Purpose: Stores admin login credentials
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `UserName` varchar(100) NOT NULL COMMENT 'Admin username for login',
  `Password` varchar(100) NOT NULL COMMENT 'MD5 hashed password',
  `updationDate` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE current_timestamp() COMMENT 'Last password update timestamp'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Admin authentication table';

-- --------------------------------------------------------

--
-- Table structure for table `tblclasses`
-- Purpose: Stores class/grade information
-- UPDATED: Added Status column for active/inactive classes
--

CREATE TABLE `tblclasses` (
  `id` int(11) NOT NULL,
  `ClassName` varchar(80) DEFAULT NULL COMMENT 'Name of the class (e.g., Grade 1, Class 10)',
  `ClassNameNumeric` int(4) NOT NULL COMMENT 'Numeric representation of class',
  `Section` varchar(5) NOT NULL COMMENT 'Section identifier (A, B, C, etc.)',
  `Status` int(1) NOT NULL DEFAULT 1 COMMENT '1=Active, 0=Inactive',
  `CreationDate` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'When class was created',
  `UpdationDate` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE current_timestamp() COMMENT 'Last modification timestamp'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Class/Grade management table';

-- --------------------------------------------------------

--
-- Table structure for table `tblresult`
-- Purpose: Stores student examination results
-- Links students to their marks in specific subjects
--

CREATE TABLE `tblresult` (
  `id` int(11) NOT NULL,
  `StudentId` int(11) DEFAULT NULL COMMENT 'Reference to tblstudents.StudentId',
  `ClassId` int(11) DEFAULT NULL COMMENT 'Reference to tblclasses.id',
  `SubjectId` int(11) DEFAULT NULL COMMENT 'Reference to tblsubjects.id',
  `marks` int(11) DEFAULT NULL COMMENT 'Marks obtained (0-100)',
  `PostingDate` timestamp NULL DEFAULT current_timestamp() COMMENT 'When result was entered',
  `UpdationDate` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp() COMMENT 'Last result modification'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Student results/marks storage table';

-- --------------------------------------------------------

--
-- Table structure for table `tblstudents`
-- Purpose: Stores student information
-- UPDATED: Added photo fields for student photo management
--

CREATE TABLE `tblstudents` (
  `StudentId` int(11) NOT NULL,
  `StudentName` varchar(100) NOT NULL COMMENT 'Full name of the student',
  `RollId` varchar(100) NOT NULL COMMENT 'Unique roll number/ID',
  `StudentEmail` varchar(100) NOT NULL COMMENT 'Student email address',
  `Gender` varchar(10) NOT NULL COMMENT 'Male/Female/Other',
  `DOB` varchar(100) NOT NULL COMMENT 'Date of birth',
  `ClassId` int(11) NOT NULL COMMENT 'Reference to tblclasses.id',
  `RegDate` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Registration timestamp',
  `UpdationDate` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp() COMMENT 'Last profile update',
  `Status` int(1) NOT NULL COMMENT '1=Active, 0=Blocked student',
  `PhotoPath` varchar(255) NULL DEFAULT NULL COMMENT 'Path to student photo file',
  `ThumbnailPath` varchar(255) NULL DEFAULT NULL COMMENT 'Path to student photo thumbnail',
  `PhotoUpdated` timestamp NULL DEFAULT NULL COMMENT 'When photo was last updated'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Student information table';

-- --------------------------------------------------------

--
-- Table structure for table `tblsubjectcombination`
-- Purpose: Links subjects to classes (many-to-many relationship)
-- Defines which subjects are taught in which classes
--

CREATE TABLE `tblsubjectcombination` (
  `id` int(11) NOT NULL,
  `ClassId` int(11) NOT NULL COMMENT 'Reference to tblclasses.id',
  `SubjectId` int(11) NOT NULL COMMENT 'Reference to tblsubjects.id',
  `status` int(1) DEFAULT NULL COMMENT '1=Active combination, 0=Inactive',
  `CreationDate` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'When combination was created',
  `Updationdate` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Last update timestamp'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Subject-Class relationship table';

-- --------------------------------------------------------

--
-- Table structure for table `tblsubjects`
-- Purpose: Stores all available subjects
--

CREATE TABLE `tblsubjects` (
  `id` int(11) NOT NULL,
  `SubjectName` varchar(100) NOT NULL COMMENT 'Full name of the subject',
  `SubjectCode` varchar(100) NOT NULL COMMENT 'Short code for the subject (e.g., MATH01)',
  `Creationdate` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'When subject was added',
  `UpdationDate` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE current_timestamp() COMMENT 'Last modification timestamp'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Subjects master table';

-- ============================================================
-- PHASE 3: ATTENDANCE SYSTEM TABLES
-- ============================================================

-- --------------------------------------------------------
--
-- Table structure for table `tblattendance`
-- Purpose: Main attendance records for students
--

CREATE TABLE `tblattendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `StudentId` int(11) NOT NULL COMMENT 'Reference to tblstudents.StudentId',
  `ClassId` int(11) NOT NULL COMMENT 'Reference to tblclasses.id',
  `AttendanceDate` date NOT NULL COMMENT 'Date of attendance',
  `SessionId` int(11) DEFAULT 1 COMMENT 'Reference to tblattendance_sessions.id',
  `Status` enum('Present','Absent','Late','Excused') NOT NULL DEFAULT 'Present' COMMENT 'Attendance status',
  `CheckInTime` time NULL COMMENT 'Time student checked in',
  `CheckOutTime` time NULL COMMENT 'Time student checked out',
  `Method` enum('Manual','QR','Fingerprint','Bulk') NOT NULL DEFAULT 'Manual' COMMENT 'How attendance was marked',
  `Location` varchar(100) NULL COMMENT 'Location where attendance was marked',
  `Photo` varchar(255) NULL COMMENT 'Photo taken during attendance',
  `Remarks` text NULL COMMENT 'Additional notes',
  `CreatedBy` int(11) NOT NULL DEFAULT 1 COMMENT 'Admin/Teacher who marked attendance',
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_date_session` (`StudentId`, `AttendanceDate`, `SessionId`),
  KEY `idx_attendance_date` (`AttendanceDate`),
  KEY `idx_student_attendance` (`StudentId`),
  KEY `idx_class_attendance` (`ClassId`),
  KEY `idx_session_attendance` (`SessionId`),
  KEY `idx_status` (`Status`),
  KEY `idx_method` (`Method`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Student attendance records';

-- --------------------------------------------------------
--
-- Table structure for table `tblattendance_sessions`
-- Purpose: Define attendance sessions (morning, afternoon, etc.)
--

CREATE TABLE `tblattendance_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `SessionName` varchar(50) NOT NULL COMMENT 'Name of session (Morning, Afternoon, etc.)',
  `StartTime` time NOT NULL COMMENT 'Session start time',
  `EndTime` time NOT NULL COMMENT 'Session end time',
  `LateThreshold` int(11) DEFAULT 15 COMMENT 'Minutes after start time considered late',
  `IsActive` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1=Active session, 0=Disabled',
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_session_active` (`IsActive`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Attendance session definitions';

-- --------------------------------------------------------
--
-- Table structure for table `tblattendance_settings`
-- Purpose: Attendance settings per class
--

CREATE TABLE `tblattendance_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ClassId` int(11) NOT NULL COMMENT 'Reference to tblclasses.id',
  `RequirePhoto` tinyint(1) DEFAULT 0 COMMENT 'Require photo during attendance',
  `AllowLateEntry` tinyint(1) DEFAULT 1 COMMENT 'Allow marking attendance after start time',
  `LateThreshold` int(11) DEFAULT 15 COMMENT 'Minutes after which marked as late',
  `GeofenceEnabled` tinyint(1) DEFAULT 0 COMMENT 'Enable location-based attendance',
  `GeofenceRadius` int(11) DEFAULT 100 COMMENT 'Radius in meters for geofence',
  `GeofenceLatitude` decimal(10,8) NULL COMMENT 'Center latitude for geofence',
  `GeofenceLongitude` decimal(11,8) NULL COMMENT 'Center longitude for geofence',
  `QRCodeEnabled` tinyint(1) DEFAULT 1 COMMENT 'Enable QR code attendance',
  `FingerprintEnabled` tinyint(1) DEFAULT 0 COMMENT 'Enable fingerprint attendance',
  `AutoMarkAbsent` tinyint(1) DEFAULT 1 COMMENT 'Auto mark absent if not present',
  `AutoMarkTime` time DEFAULT '10:00:00' COMMENT 'Time to auto mark absent',
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_class_settings` (`ClassId`),
  KEY `idx_qr_enabled` (`QRCodeEnabled`),
  KEY `idx_geofence_enabled` (`GeofenceEnabled`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Class-specific attendance settings';

-- --------------------------------------------------------
--
-- Table structure for table `tblattendance_reports`
-- Purpose: Cache for generated attendance reports
--

CREATE TABLE `tblattendance_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ReportType` enum('Daily','Weekly','Monthly','Custom','Student','Class') NOT NULL COMMENT 'Type of report',
  `ClassId` int(11) NULL COMMENT 'Class for report (NULL for all)',
  `StudentId` int(11) NULL COMMENT 'Student for individual reports',
  `DateFrom` date NOT NULL COMMENT 'Report start date',
  `DateTo` date NOT NULL COMMENT 'Report end date',
  `GeneratedData` longtext NOT NULL COMMENT 'JSON data of the report',
  `GeneratedBy` int(11) NOT NULL DEFAULT 1 COMMENT 'Admin who generated report',
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_report_type` (`ReportType`),
  KEY `idx_report_class` (`ClassId`),
  KEY `idx_report_student` (`StudentId`),
  KEY `idx_report_date` (`DateFrom`, `DateTo`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Cached attendance reports';

-- --------------------------------------------------------
--
-- Foreign Key Constraints for Attendance Tables
--

ALTER TABLE `tblattendance`
  ADD CONSTRAINT `fk_attendance_student` FOREIGN KEY (`StudentId`) REFERENCES `tblstudents` (`StudentId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_attendance_class` FOREIGN KEY (`ClassId`) REFERENCES `tblclasses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_attendance_session` FOREIGN KEY (`SessionId`) REFERENCES `tblattendance_sessions` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `tblattendance_settings`
  ADD CONSTRAINT `fk_attendance_settings_class` FOREIGN KEY (`ClassId`) REFERENCES `tblclasses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `tblattendance_reports`
  ADD CONSTRAINT `fk_attendance_reports_class` FOREIGN KEY (`ClassId`) REFERENCES `tblclasses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_attendance_reports_student` FOREIGN KEY (`StudentId`) REFERENCES `tblstudents` (`StudentId`) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- ============================================================
-- DATABASE STRUCTURE SETUP COMPLETE
-- ============================================================
-- This file contains only the table structure.
-- To add sample data for testing, run the sample-data.sql file.
--
-- Features included:
-- 1. All required tables with proper structure
-- 2. Photo support for student profiles
-- 3. Status columns for soft deletes
-- 4. Foreign key constraints for data integrity
-- 5. Comprehensive indexing for performance
-- 6. Comments for documentation
-- ============================================================

-- phpMyAdmin SQL Dump - UPDATED STRUCTURE ONLY
-- Updated on: 2025-07-21 20:18:30 UTC by Pilsertech
-- Original version: 5.0.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 21, 2025 at 08:18 PM (Updated)
-- Server version: 10.4.11-MariaDB
-- PHP Version: 7.4.2
--
-- STRUCTURE ONLY - NO SAMPLE DATA
-- For sample data, run the sample-data.sql file separately
--
-- UPDATES MADE:
-- 1. Added Status column to tblclasses table
-- 2. Added photo fields to tblstudents table (PhotoPath, ThumbnailPath, PhotoUpdated)
-- 3. Added proper relationships and constraints
-- 4. Separated structure from sample data

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `srms` (Student Result Management System)
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
-- Purpose: Stores admin login credentials
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `UserName` varchar(100) NOT NULL COMMENT 'Admin username for login',
  `Password` varchar(100) NOT NULL COMMENT 'MD5 hashed password',
  `updationDate` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE current_timestamp() COMMENT 'Last password update timestamp'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Admin authentication table';

-- --------------------------------------------------------

--
-- Table structure for table `tblclasses`
-- Purpose: Stores class/grade information
-- UPDATED: Added Status column for active/inactive classes
--

CREATE TABLE `tblclasses` (
  `id` int(11) NOT NULL,
  `ClassName` varchar(80) DEFAULT NULL COMMENT 'Name of the class (e.g., Grade 1, Class 10)',
  `ClassNameNumeric` int(4) NOT NULL COMMENT 'Numeric representation of class',
  `Section` varchar(5) NOT NULL COMMENT 'Section identifier (A, B, C, etc.)',
  `Status` int(1) NOT NULL DEFAULT 1 COMMENT '1=Active, 0=Inactive',
  `CreationDate` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'When class was created',
  `UpdationDate` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE current_timestamp() COMMENT 'Last modification timestamp'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Class/Grade management table';

-- --------------------------------------------------------

--
-- Table structure for table `tblresult`
-- Purpose: Stores student examination results
-- Links students to their marks in specific subjects
--

CREATE TABLE `tblresult` (
  `id` int(11) NOT NULL,
  `StudentId` int(11) DEFAULT NULL COMMENT 'Reference to tblstudents.StudentId',
  `ClassId` int(11) DEFAULT NULL COMMENT 'Reference to tblclasses.id',
  `SubjectId` int(11) DEFAULT NULL COMMENT 'Reference to tblsubjects.id',
  `marks` int(11) DEFAULT NULL COMMENT 'Marks obtained (0-100)',
  `PostingDate` timestamp NULL DEFAULT current_timestamp() COMMENT 'When result was entered',
  `UpdationDate` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp() COMMENT 'Last result modification'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Student results/marks storage table';

-- --------------------------------------------------------

--
-- Table structure for table `tblstudents`
-- Purpose: Stores student information
-- UPDATED: Added photo fields for student photo management
--

CREATE TABLE `tblstudents` (
  `StudentId` int(11) NOT NULL,
  `StudentName` varchar(100) NOT NULL COMMENT 'Full name of the student',
  `RollId` varchar(100) NOT NULL COMMENT 'Unique roll number/ID',
  `StudentEmail` varchar(100) NOT NULL COMMENT 'Student email address',
  `Gender` varchar(10) NOT NULL COMMENT 'Male/Female/Other',
  `DOB` varchar(100) NOT NULL COMMENT 'Date of birth',
  `ClassId` int(11) NOT NULL COMMENT 'Reference to tblclasses.id',
  `RegDate` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Registration timestamp',
  `UpdationDate` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp() COMMENT 'Last profile update',
  `Status` int(1) NOT NULL COMMENT '1=Active, 0=Blocked student',
  `PhotoPath` varchar(255) NULL DEFAULT NULL COMMENT 'Path to student photo file',
  `ThumbnailPath` varchar(255) NULL DEFAULT NULL COMMENT 'Path to student photo thumbnail',
  `PhotoUpdated` timestamp NULL DEFAULT NULL COMMENT 'When photo was last updated'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Student information table';

-- --------------------------------------------------------

--
-- Table structure for table `tblsubjectcombination`
-- Purpose: Links subjects to classes (many-to-many relationship)
-- Defines which subjects are taught in which classes
--

CREATE TABLE `tblsubjectcombination` (
  `id` int(11) NOT NULL,
  `ClassId` int(11) NOT NULL COMMENT 'Reference to tblclasses.id',
  `SubjectId` int(11) NOT NULL COMMENT 'Reference to tblsubjects.id',
  `status` int(1) DEFAULT NULL COMMENT '1=Active combination, 0=Inactive',
  `CreationDate` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'When combination was created',
  `Updationdate` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Last update timestamp'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Subject-Class relationship table';

-- --------------------------------------------------------

--
-- Table structure for table `tblsubjects`
-- Purpose: Stores all available subjects
--

CREATE TABLE `tblsubjects` (
  `id` int(11) NOT NULL,
  `SubjectName` varchar(100) NOT NULL COMMENT 'Full name of the subject',
  `SubjectCode` varchar(100) NOT NULL COMMENT 'Short code for the subject (e.g., MATH01)',
  `Creationdate` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'When subject was added',
  `UpdationDate` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE current_timestamp() COMMENT 'Last modification timestamp'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Subjects master table';

-- ============================================================
-- PHASE 3: ATTENDANCE SYSTEM TABLES
-- ============================================================

-- --------------------------------------------------------
--
-- Table structure for table `tblattendance`
-- Purpose: Main attendance records for students
--

CREATE TABLE `tblattendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `StudentId` int(11) NOT NULL COMMENT 'Reference to tblstudents.StudentId',
  `ClassId` int(11) NOT NULL COMMENT 'Reference to tblclasses.id',
  `AttendanceDate` date NOT NULL COMMENT 'Date of attendance',
  `SessionId` int(11) DEFAULT 1 COMMENT 'Reference to tblattendance_sessions.id',
  `Status` enum('Present','Absent','Late','Excused') NOT NULL DEFAULT 'Present' COMMENT 'Attendance status',
  `CheckInTime` time NULL COMMENT 'Time student checked in',
  `CheckOutTime` time NULL COMMENT 'Time student checked out',
  `Method` enum('Manual','QR','Fingerprint','Bulk') NOT NULL DEFAULT 'Manual' COMMENT 'How attendance was marked',
  `Location` varchar(100) NULL COMMENT 'Location where attendance was marked',
  `Photo` varchar(255) NULL COMMENT 'Photo taken during attendance',
  `Remarks` text NULL COMMENT 'Additional notes',
  `CreatedBy` int(11) NOT NULL DEFAULT 1 COMMENT 'Admin/Teacher who marked attendance',
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_date_session` (`StudentId`, `AttendanceDate`, `SessionId`),
  KEY `idx_attendance_date` (`AttendanceDate`),
  KEY `idx_student_attendance` (`StudentId`),
  KEY `idx_class_attendance` (`ClassId`),
  KEY `idx_session_attendance` (`SessionId`),
  KEY `idx_status` (`Status`),
  KEY `idx_method` (`Method`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Student attendance records';

-- --------------------------------------------------------
--
-- Table structure for table `tblattendance_sessions`
-- Purpose: Define attendance sessions (morning, afternoon, etc.)
--

CREATE TABLE `tblattendance_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `SessionName` varchar(50) NOT NULL COMMENT 'Name of session (Morning, Afternoon, etc.)',
  `StartTime` time NOT NULL COMMENT 'Session start time',
  `EndTime` time NOT NULL COMMENT 'Session end time',
  `LateThreshold` int(11) DEFAULT 15 COMMENT 'Minutes after start time considered late',
  `IsActive` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1=Active session, 0=Disabled',
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_session_active` (`IsActive`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Attendance session definitions';

-- --------------------------------------------------------
--
-- Table structure for table `tblattendance_settings`
-- Purpose: Attendance settings per class
--

CREATE TABLE `tblattendance_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ClassId` int(11) NOT NULL COMMENT 'Reference to tblclasses.id',
  `RequirePhoto` tinyint(1) DEFAULT 0 COMMENT 'Require photo during attendance',
  `AllowLateEntry` tinyint(1) DEFAULT 1 COMMENT 'Allow marking attendance after start time',
  `LateThreshold` int(11) DEFAULT 15 COMMENT 'Minutes after which marked as late',
  `GeofenceEnabled` tinyint(1) DEFAULT 0 COMMENT 'Enable location-based attendance',
  `GeofenceRadius` int(11) DEFAULT 100 COMMENT 'Radius in meters for geofence',
  `GeofenceLatitude` decimal(10,8) NULL COMMENT 'Center latitude for geofence',
  `GeofenceLongitude` decimal(11,8) NULL COMMENT 'Center longitude for geofence',
  `QRCodeEnabled` tinyint(1) DEFAULT 1 COMMENT 'Enable QR code attendance',
  `FingerprintEnabled` tinyint(1) DEFAULT 0 COMMENT 'Enable fingerprint attendance',
  `AutoMarkAbsent` tinyint(1) DEFAULT 1 COMMENT 'Auto mark absent if not present',
  `AutoMarkTime` time DEFAULT '10:00:00' COMMENT 'Time to auto mark absent',
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_class_settings` (`ClassId`),
  KEY `idx_qr_enabled` (`QRCodeEnabled`),
  KEY `idx_geofence_enabled` (`GeofenceEnabled`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Class-specific attendance settings';

-- --------------------------------------------------------
--
-- Table structure for table `tblattendance_reports`
-- Purpose: Cache for generated attendance reports
--

CREATE TABLE `tblattendance_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ReportType` enum('Daily','Weekly','Monthly','Custom','Student','Class') NOT NULL COMMENT 'Type of report',
  `ClassId` int(11) NULL COMMENT 'Class for report (NULL for all)',
  `StudentId` int(11) NULL COMMENT 'Student for individual reports',
  `DateFrom` date NOT NULL COMMENT 'Report start date',
  `DateTo` date NOT NULL COMMENT 'Report end date',
  `GeneratedData` longtext NOT NULL COMMENT 'JSON data of the report',
  `GeneratedBy` int(11) NOT NULL DEFAULT 1 COMMENT 'Admin who generated report',
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_report_type` (`ReportType`),
  KEY `idx_report_class` (`ClassId`),
  KEY `idx_report_student` (`StudentId`),
  KEY `idx_report_date` (`DateFrom`, `DateTo`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Cached attendance reports';

-- --------------------------------------------------------
--
-- Foreign Key Constraints for Attendance Tables
--

ALTER TABLE `tblattendance`
  ADD CONSTRAINT `fk_attendance_student` FOREIGN KEY (`StudentId`) REFERENCES `tblstudents` (`StudentId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_attendance_class` FOREIGN KEY (`ClassId`) REFERENCES `tblclasses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_attendance_session` FOREIGN KEY (`SessionId`) REFERENCES `tblattendance_sessions` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `tblattendance_settings`
  ADD CONSTRAINT `fk_attendance_settings_class` FOREIGN KEY (`ClassId`) REFERENCES `tblclasses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `tblattendance_reports`
  ADD CONSTRAINT `fk_attendance_reports_class` FOREIGN KEY (`ClassId`) REFERENCES `tblclasses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_attendance_reports_student` FOREIGN KEY (`StudentId`) REFERENCES `tblstudents` (`StudentId`) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- ============================================================
-- PHASE 2: ID CARD SYSTEM TABLES
-- ============================================================

-- --------------------------------------------------------
--
-- Table structure for table `tblidcard_templates`
-- Purpose: Store ID card template designs and positioning data
--

CREATE TABLE `tblidcard_templates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `TemplateName` varchar(100) NOT NULL COMMENT 'Human readable template name',
  `FrontImagePath` varchar(255) NOT NULL COMMENT 'Path to front template image',
  `BackImagePath` varchar(255) NULL COMMENT 'Path to back template image (optional)',
  `PositionData` longtext NOT NULL COMMENT 'JSON data for element positions',
  `AssignedClasses` text NULL COMMENT 'JSON array of assigned class IDs',
  `IsActive` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1=Active, 0=Inactive',
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_template_active` (`IsActive`),
  KEY `idx_template_name` (`TemplateName`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='ID Card template definitions';

-- --------------------------------------------------------
--
-- Table structure for table `tblidcard_generated`
-- Purpose: Track generated ID cards for students
--

CREATE TABLE `tblidcard_generated` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `StudentId` int(11) NOT NULL COMMENT 'Reference to tblstudents.StudentId',
  `TemplateId` int(11) NOT NULL COMMENT 'Reference to tblidcard_templates.id',
  `FrontCardPath` varchar(255) NOT NULL COMMENT 'Path to generated front card',
  `BackCardPath` varchar(255) NULL COMMENT 'Path to generated back card',
  `GenerationOptions` text NULL COMMENT 'JSON of generation options used',
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_template` (`StudentId`, `TemplateId`),
  KEY `idx_generated_student` (`StudentId`),
  KEY `idx_generated_template` (`TemplateId`),
  KEY `idx_generated_date` (`CreatedAt`),
  CONSTRAINT `fk_generated_student` FOREIGN KEY (`StudentId`) REFERENCES `tblstudents` (`StudentId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_generated_template` FOREIGN KEY (`TemplateId`) REFERENCES `tblidcard_templates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Generated ID card records';

-- ============================================================
-- ENHANCED STUDENT TABLE FOR QR/BARCODE/FINGERPRINT
-- ============================================================

-- Add QR Code, Barcode, and Fingerprint columns to existing tblstudents table
ALTER TABLE `tblstudents` 
ADD COLUMN `QRCode` text NULL COMMENT 'QR code data in JSON format' AFTER `PhotoUpdated`,
ADD COLUMN `Barcode` varchar(100) NULL COMMENT 'Generated barcode for student' AFTER `QRCode`,
ADD COLUMN `FingerprintData` text NULL COMMENT 'Hashed fingerprint data' AFTER `Barcode`,
ADD COLUMN `FingerprintRegistered` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1=Registered, 0=Not registered' AFTER `FingerprintData`,
ADD COLUMN `FingerprintUpdated` timestamp NULL COMMENT 'When fingerprint was last updated' AFTER `FingerprintRegistered`;

-- Add indexes for performance
ALTER TABLE `tblstudents` 
ADD INDEX `idx_qr_code` (`QRCode`(100)),
ADD INDEX `idx_barcode` (`Barcode`),
ADD INDEX `idx_fingerprint_registered` (`FingerprintRegistered`);

-- ============================================================
-- INDEXES AND CONSTRAINTS
-- ============================================================

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tblclasses`
--
ALTER TABLE `tblclasses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_class_status` (`Status`),
  ADD KEY `idx_class_name` (`ClassName`);

--
-- Indexes for table `tblresult`
--
ALTER TABLE `tblresult`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_result_student` (`StudentId`),
  ADD KEY `idx_result_class` (`ClassId`),
  ADD KEY `idx_result_subject` (`SubjectId`),
  ADD KEY `idx_result_posting` (`PostingDate`);

--
-- Indexes for table `tblstudents`
--
ALTER TABLE `tblstudents`
  ADD PRIMARY KEY (`StudentId`),
  ADD UNIQUE KEY `unique_roll_id` (`RollId`),
  ADD UNIQUE KEY `unique_email` (`StudentEmail`),
  ADD KEY `idx_student_class` (`ClassId`),
  ADD KEY `idx_student_status` (`Status`),
  ADD KEY `idx_student_name` (`StudentName`);

--
-- Indexes for table `tblsubjectcombination`
--
ALTER TABLE `tblsubjectcombination`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_class_subject` (`ClassId`, `SubjectId`),
  ADD KEY `idx_combination_class` (`ClassId`),
  ADD KEY `idx_combination_subject` (`SubjectId`),
  ADD KEY `idx_combination_status` (`status`);

--
-- Indexes for table `tblsubjects`
--
ALTER TABLE `tblsubjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_subject_code` (`SubjectCode`),
  ADD KEY `idx_subject_name` (`SubjectName`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tblclasses`
--
ALTER TABLE `tblclasses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tblresult`
--
ALTER TABLE `tblresult`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tblstudents`
--
ALTER TABLE `tblstudents`
  MODIFY `StudentId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tblsubjectcombination`
--
ALTER TABLE `tblsubjectcombination`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tblsubjects`
--
ALTER TABLE `tblsubjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tblresult`
--
ALTER TABLE `tblresult`
  ADD CONSTRAINT `fk_result_student` FOREIGN KEY (`StudentId`) REFERENCES `tblstudents` (`StudentId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_result_class` FOREIGN KEY (`ClassId`) REFERENCES `tblclasses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_result_subject` FOREIGN KEY (`SubjectId`) REFERENCES `tblsubjects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tblstudents`
--
ALTER TABLE `tblstudents`
  ADD CONSTRAINT `fk_student_class` FOREIGN KEY (`ClassId`) REFERENCES `tblclasses` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `tblsubjectcombination`
--
ALTER TABLE `tblsubjectcombination`
  ADD CONSTRAINT `fk_combination_class` FOREIGN KEY (`ClassId`) REFERENCES `tblclasses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_combination_subject` FOREIGN KEY (`SubjectId`) REFERENCES `tblsubjects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tblattendance`
--
ALTER TABLE `tblattendance`
  ADD CONSTRAINT `fk_attendance_student` FOREIGN KEY (`StudentId`) REFERENCES `tblstudents` (`StudentId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_attendance_class` FOREIGN KEY (`ClassId`) REFERENCES `tblclasses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_attendance_session` FOREIGN KEY (`SessionId`) REFERENCES `tblattendance_sessions` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `tblattendance_settings`
  ADD CONSTRAINT `fk_attendance_settings_class` FOREIGN KEY (`ClassId`) REFERENCES `tblclasses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `tblattendance_reports`
  ADD CONSTRAINT `fk_attendance_reports_class` FOREIGN KEY (`ClassId`) REFERENCES `tblclasses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_attendance_reports_student` FOREIGN KEY (`StudentId`) REFERENCES `tblstudents` (`StudentId`) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;

-- ============================================================
-- COMPLETE DATABASE STRUCTURE SETUP
-- ============================================================
-- This file now contains ALL required tables:
-- 
-- CORE SYSTEM:
-- 1. admin - Admin authentication
-- 2. tblclasses - Class/Grade management with status
-- 3. tblstudents - Student info with photos, QR, barcode, fingerprint
-- 4. tblsubjects - Subject management
-- 5. tblsubjectcombination - Subject-Class relationships
-- 6. tblresult - Student results/marks
--
-- ID CARD SYSTEM:
-- 7. tblidcard_templates - Template designs and positioning
-- 8. tblidcard_generated - Generated card tracking
--
-- ATTENDANCE SYSTEM:
-- 9. tblattendance - Main attendance records
-- 10. tblattendance_sessions - Session definitions
-- 11. tblattendance_settings - Class-specific settings
-- 12. tblattendance_reports - Cached reports
--
-- FEATURES INCLUDED:
-- - Photo support for students
-- - QR code and barcode generation
-- - Fingerprint registration
-- - Template-based ID card system
-- - Comprehensive attendance tracking
-- - Proper foreign key relationships
-- - Performance-optimized indexing
-- - Complete data integrity
-- ============================================================