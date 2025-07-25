-- ID Card System Database Schema

-- ============================================================
-- ID CARD TEMPLATES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `tblidcard_templates` (
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

-- ============================================================
-- GENERATED ID CARDS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `tblidcard_generated` (
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
ALTER TABLE `tblstudents` 
ADD COLUMN IF NOT EXISTS `QRCode` text NULL COMMENT 'QR code data in JSON format',
ADD COLUMN IF NOT EXISTS `Barcode` varchar(100) NULL COMMENT 'Generated barcode for student',
ADD COLUMN IF NOT EXISTS `FingerprintData` text NULL COMMENT 'Hashed fingerprint data',
ADD COLUMN IF NOT EXISTS `FingerprintRegistered` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1=Registered, 0=Not registered',
ADD COLUMN IF NOT EXISTS `FingerprintUpdated` timestamp NULL COMMENT 'When fingerprint was last updated';

-- Add indexes for performance
ALTER TABLE `tblstudents` 
ADD INDEX IF NOT EXISTS `idx_qr_code` (`QRCode`(100)),
ADD INDEX IF NOT EXISTS `idx_barcode` (`Barcode`),
ADD INDEX IF NOT EXISTS `idx_fingerprint_registered` (`FingerprintRegistered`);

-- ============================================================
-- SAMPLE TEMPLATE DATA
-- ============================================================
INSERT IGNORE INTO `tblidcard_templates` (`id`, `TemplateName`, `FrontImagePath`, `BackImagePath`, `PositionData`, `AssignedClasses`, `IsActive`) VALUES
(1, 'Standard Student Card', 'templates/standard-front.jpg', 'templates/standard-back.jpg', '{"front":{"studentName":{"x":150,"y":300,"fontSize":24,"fontFamily":"Arial","color":"#000000"},"rollId":{"x":150,"y":340,"fontSize":18,"fontFamily":"Arial","color":"#666666"},"photo":{"x":50,"y":200,"width":80,"height":100}},"back":{"qrCode":{"x":200,"y":250,"width":100,"height":100}}}', '[1,2,3,4,5]', 1),
(2, 'Premium Student Card', 'templates/premium-front.jpg', 'templates/premium-back.jpg', '{"front":{"studentName":{"x":180,"y":320,"fontSize":28,"fontFamily":"Arial","color":"#1a1a1a"},"rollId":{"x":180,"y":360,"fontSize":20,"fontFamily":"Arial","color":"#555555"},"className":{"x":180,"y":390,"fontSize":16,"fontFamily":"Arial","color":"#777777"},"photo":{"x":60,"y":220,"width":100,"height":120},"barcode":{"x":60,"y":450,"width":200,"height":40}},"back":{"qrCode":{"x":220,"y":280,"width":120,"height":120}}}', '[6,7,8,9]', 1);
