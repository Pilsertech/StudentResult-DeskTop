-- phpMyAdmin SQL Dump - UPDATED VERSION
-- Updated on: 2025-07-21 20:18:30 UTC by Pilsertech
-- Original version: 5.0.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 21, 2025 at 08:18 PM (Updated)
-- Server version: 10.4.11-MariaDB
-- PHP Version: 7.4.2
--
-- UPDATES MADE:
-- 1. Added missing Status column to tblclasses table
-- 2. Added sample data for testing the Add Result functionality
-- 3. Added proper relationships and constraints
-- 4. Added comments for better understanding

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

--
-- Dumping data for table `admin`
-- Default admin credentials: Username: admin, Password: admin (MD5 hashed)
--

INSERT INTO `admin` (`id`, `UserName`, `Password`, `updationDate`) VALUES
(1, 'admin', '21232f297a57a5a743894a0e4a801fc3', '2025-07-21 20:18:30');

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
  `Status` int(1) NOT NULL DEFAULT 1 COMMENT '1=Active, 0=Inactive - NEWLY ADDED COLUMN',
  `CreationDate` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'When class was created',
  `UpdationDate` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE current_timestamp() COMMENT 'Last modification timestamp'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Class/Grade management table';

--
-- Dumping sample data for table `tblclasses`
-- Sample classes for testing Add Result functionality
--

INSERT INTO `tblclasses` (`id`, `ClassName`, `ClassNameNumeric`, `Section`, `Status`, `CreationDate`, `UpdationDate`) VALUES
(1, 'Class 1', 1, 'A', 1, '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(2, 'Class 1', 1, 'B', 1, '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(3, 'Class 2', 2, 'A', 1, '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(4, 'Class 2', 2, 'B', 1, '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(5, 'Class 3', 3, 'A', 1, '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(6, 'Class 4', 4, 'A', 1, '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(7, 'Class 5', 5, 'A', 1, '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(8, 'Class 6', 6, 'A', 0, '2025-07-21 20:18:30', '0000-00-00 00:00:00'); -- Inactive class for testing

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

--
-- Sample data for table `tblresult`
-- Sample results for testing (will be populated when adding results through the system)
--

-- --------------------------------------------------------

--
-- Table structure for table `tblstudents`
-- Purpose: Stores student information
-- Note: Status column already exists in original schema
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
  `Status` int(1) NOT NULL COMMENT '1=Active, 0=Blocked student'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Student information table';

--
-- Sample data for table `tblstudents`
-- Sample students for testing Add Result functionality
--

INSERT INTO `tblstudents` (`StudentId`, `StudentName`, `RollId`, `StudentEmail`, `Gender`, `DOB`, `ClassId`, `RegDate`, `UpdationDate`, `Status`) VALUES
(1, 'Alice Johnson', '001', 'alice.johnson@email.com', 'Female', '2010-01-15', 1, '2025-07-21 20:18:30', NULL, 1),
(2, 'Bob Smith', '002', 'bob.smith@email.com', 'Male', '2010-02-20', 1, '2025-07-21 20:18:30', NULL, 1),
(3, 'Charlie Brown', '003', 'charlie.brown@email.com', 'Male', '2010-03-10', 1, '2025-07-21 20:18:30', NULL, 1),
(4, 'Diana Prince', '004', 'diana.prince@email.com', 'Female', '2009-05-12', 2, '2025-07-21 20:18:30', NULL, 1),
(5, 'Edward Davis', '005', 'edward.davis@email.com', 'Male', '2009-06-18', 2, '2025-07-21 20:18:30', NULL, 1),
(6, 'Fiona Wilson', '006', 'fiona.wilson@email.com', 'Female', '2008-08-22', 3, '2025-07-21 20:18:30', NULL, 1),
(7, 'George Miller', '007', 'george.miller@email.com', 'Male', '2008-09-14', 3, '2025-07-21 20:18:30', NULL, 0), -- Blocked student for testing
(8, 'Helen Garcia', '008', 'helen.garcia@email.com', 'Female', '2007-11-05', 4, '2025-07-21 20:18:30', NULL, 1);

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

--
-- Sample data for table `tblsubjectcombination`
-- Sample subject combinations for testing Add Result functionality
--

INSERT INTO `tblsubjectcombination` (`id`, `ClassId`, `SubjectId`, `status`, `CreationDate`, `Updationdate`) VALUES
-- Class 1 subjects
(1, 1, 1, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Class 1A - Mathematics
(2, 1, 2, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Class 1A - English
(3, 1, 3, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Class 1A - Science
(4, 1, 4, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Class 1A - Social Studies

-- Class 1B subjects (same as 1A)
(5, 2, 1, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Class 1B - Mathematics
(6, 2, 2, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Class 1B - English
(7, 2, 3, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Class 1B - Science
(8, 2, 4, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Class 1B - Social Studies

-- Class 2 subjects (additional subjects)
(9, 3, 1, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'),  -- Class 2A - Mathematics
(10, 3, 2, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Class 2A - English
(11, 3, 3, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Class 2A - Science
(12, 3, 4, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Class 2A - Social Studies
(13, 3, 5, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Class 2A - Art

-- Class 2B subjects
(14, 4, 1, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Class 2B - Mathematics
(15, 4, 2, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Class 2B - English
(16, 4, 3, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Class 2B - Science
(17, 4, 4, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Class 2B - Social Studies
(18, 4, 5, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Class 2B - Art

-- Class 3 subjects (more advanced)
(19, 5, 1, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Class 3A - Mathematics
(20, 5, 2, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Class 3A - English
(21, 5, 3, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Class 3A - Science
(22, 5, 4, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Class 3A - Social Studies
(23, 5, 6, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Class 3A - Computer Science

-- Class 4 subjects
(24, 6, 1, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Class 4A - Mathematics
(25, 6, 2, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Class 4A - English
(26, 6, 3, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Class 4A - Science
(27, 6, 4, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Class 4A - Social Studies
(28, 6, 6, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'), -- Class 4A - Computer Science
(29, 6, 7, 1, '2025-07-21 20:18:30', '2025-07-21 20:18:30'); -- Class 4A - Physical Education

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

--
-- Sample data for table `tblsubjects`
-- Sample subjects for testing Add Result functionality
--

INSERT INTO `tblsubjects` (`id`, `SubjectName`, `SubjectCode`, `Creationdate`, `UpdationDate`) VALUES
(1, 'Mathematics', 'MATH01', '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(2, 'English Language', 'ENG01', '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(3, 'Science', 'SCI01', '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(4, 'Social Studies', 'SOC01', '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(5, 'Art & Craft', 'ART01', '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(6, 'Computer Science', 'CS01', '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(7, 'Physical Education', 'PE01', '2025-07-21 20:18:30', '0000-00-00 00:00:00'),
(8, 'Music', 'MUS01', '2025-07-21 20:18:30', '0000-00-00 00:00:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UserName` (`UserName`) COMMENT 'Ensure unique usernames';

--
-- Indexes for table `tblclasses`
--
ALTER TABLE `tblclasses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_class_section` (`ClassName`,`Section`) COMMENT 'Prevent duplicate class-section combinations',
  ADD KEY `idx_status` (`Status`) COMMENT 'Index for filtering active classes';

--
-- Indexes for table `tblresult`
--
ALTER TABLE `tblresult`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_student_subject` (`StudentId`,`ClassId`,`SubjectId`) COMMENT 'Prevent duplicate results for same student-subject',
  ADD KEY `idx_student` (`StudentId`) COMMENT 'Index for student result queries',
  ADD KEY `idx_class` (`ClassId`) COMMENT 'Index for class result queries',
  ADD KEY `idx_subject` (`SubjectId`) COMMENT 'Index for subject result queries';

--
-- Indexes for table `tblstudents`
--
ALTER TABLE `tblstudents`
  ADD PRIMARY KEY (`StudentId`),
  ADD UNIQUE KEY `RollId` (`RollId`) COMMENT 'Ensure unique roll IDs',
  ADD UNIQUE KEY `StudentEmail` (`StudentEmail`) COMMENT 'Ensure unique email addresses',
  ADD KEY `idx_class` (`ClassId`) COMMENT 'Index for class-wise student queries',
  ADD KEY `idx_status` (`Status`) COMMENT 'Index for filtering active students';

--
-- Indexes for table `tblsubjectcombination`
--
ALTER TABLE `tblsubjectcombination`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_class_subject` (`ClassId`,`SubjectId`) COMMENT 'Prevent duplicate subject assignments to same class',
  ADD KEY `idx_class` (`ClassId`) COMMENT 'Index for class subject queries',
  ADD KEY `idx_subject` (`SubjectId`) COMMENT 'Index for subject class queries',
  ADD KEY `idx_status` (`status`) COMMENT 'Index for filtering active combinations';

--
-- Indexes for table `tblsubjects`
--
ALTER TABLE `tblsubjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `SubjectCode` (`SubjectCode`) COMMENT 'Ensure unique subject codes',
  ADD KEY `idx_subject_name` (`SubjectName`) COMMENT 'Index for subject name searches';

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tblclasses`
--
ALTER TABLE `tblclasses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `tblresult`
--
ALTER TABLE `tblresult`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `tblstudents`
--
ALTER TABLE `tblstudents`
  MODIFY `StudentId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `tblsubjectcombination`
--
ALTER TABLE `tblsubjectcombination`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `tblsubjects`
--
ALTER TABLE `tblsubjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Foreign Key Constraints (Added for data integrity)
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

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- ============================================================
-- SETUP INSTRUCTIONS:
-- ============================================================
-- 1. Drop existing database if you want a fresh start:
--    DROP DATABASE IF EXISTS `srms`;
--    CREATE DATABASE `srms`;
--    USE `srms`;
-- 
-- 2. Import this SQL file
-- 
-- 3. Test login credentials:
--    Username: admin
--    Password: admin
--
-- 4. The database now includes:
--    - 8 classes with proper Status column
--    - 8 sample students (7 active, 1 blocked)
--    - 8 subjects covering basic curriculum
--    - 29 subject-class combinations
--    - Proper foreign key relationships
--    - Comprehensive indexing for performance
-- 
-- 5. Ready for testing Add Result functionality!
-- ============================================================