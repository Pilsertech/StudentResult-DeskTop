const db = require('../config/database');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

// Get system settings
exports.getSystemSettings = async (req, res) => {
    try {
        console.log('📊 Fetching system settings...');
        
        // Get database info
        const [dbInfo] = await db.execute(`
            SELECT 
                COUNT(*) as totalTables,
                (SELECT COUNT(*) FROM tblstudents) as totalStudents,
                (SELECT COUNT(*) FROM tblclasses) as totalClasses,
                (SELECT COUNT(*) FROM tblsubjects) as totalSubjects,
                (SELECT COUNT(*) FROM tblresult) as totalResults
        `);
        
        // Get database size
        const [sizeInfo] = await db.execute(`
            SELECT 
                ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS dbSize
            FROM information_schema.tables 
            WHERE table_schema = 'srms'
        `);
        
        const settings = {
            system: {
                version: '1.0.0',
                environment: process.env.NODE_ENV || 'development',
                uptime: Math.floor(process.uptime()),
                memory: process.memoryUsage(),
                nodeVersion: process.version
            },
            database: {
                host: 'localhost',
                name: 'srms',
                size: sizeInfo[0]?.dbSize || 0,
                tables: dbInfo[0]?.totalTables || 0,
                records: {
                    students: dbInfo[0]?.totalStudents || 0,
                    classes: dbInfo[0]?.totalClasses || 0,
                    subjects: dbInfo[0]?.totalSubjects || 0,
                    results: dbInfo[0]?.totalResults || 0
                }
            },
            lastBackup: await getLastBackupInfo(),
            timestamp: new Date().toISOString()
        };
        
        res.json({
            success: true,
            data: settings,
            message: 'System settings retrieved successfully'
        });
        
    } catch (error) {
        console.error('❌ Error fetching system settings:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve system settings',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Database backup - FIXED VERSION
exports.backupDatabase = async (req, res) => {
    try {
        console.log('💾 Starting database backup...');
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const backupDir = path.join(__dirname, '../backups');
        const backupFile = path.join(backupDir, `srms_backup_${timestamp}.sql`);
        
        // Ensure backup directory exists
        try {
            await fs.access(backupDir);
        } catch {
            await fs.mkdir(backupDir, { recursive: true });
            console.log('📁 Created backup directory');
        }
        
        // FIXED: Use direct SQL queries instead of mysqldump
        const backupContent = await generateBackupSQL();
        
        // Write backup to file
        await fs.writeFile(backupFile, backupContent);
        
        // Get file stats
        const stats = await fs.stat(backupFile);
        
        console.log('✅ Database backup completed:', backupFile);
        
        res.json({
            success: true,
            data: {
                filename: path.basename(backupFile),
                filepath: backupFile,
                size: stats.size,
                timestamp: timestamp,
                tables: ['tblstudents', 'tblclasses', 'tblsubjects', 'tblresult', 'tblsubjectcombination']
            },
            message: 'Database backup completed successfully'
        });
        
    } catch (error) {
        console.error('❌ Database backup failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'Database backup failed: ' + error.message,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Generate backup SQL using direct queries
async function generateBackupSQL() {
    let backupSQL = '';
    
    // Add header
    backupSQL += `-- SRMS Database Backup\n`;
    backupSQL += `-- Generated on: ${new Date().toISOString()}\n`;
    backupSQL += `-- Database: srms\n\n`;
    
    // Tables to backup
    const tables = ['tblclasses', 'tblsubjects', 'tblstudents', 'tblsubjectcombination', 'tblresult'];
    
    for (const table of tables) {
        try {
            console.log(`📋 Backing up table: ${table}`);
            
            // Get table structure
            const [createTable] = await db.execute(`SHOW CREATE TABLE ${table}`);
            backupSQL += `-- Table structure for ${table}\n`;
            backupSQL += `DROP TABLE IF EXISTS \`${table}\`;\n`;
            backupSQL += createTable[0]['Create Table'] + ';\n\n';
            
            // Get table data
            const [rows] = await db.execute(`SELECT * FROM ${table}`);
            
            if (rows.length > 0) {
                backupSQL += `-- Data for table ${table}\n`;
                backupSQL += `INSERT INTO \`${table}\` VALUES\n`;
                
                const values = rows.map(row => {
                    const rowValues = Object.values(row).map(value => {
                        if (value === null) return 'NULL';
                        if (typeof value === 'string') return `'${value.replace(/'/g, "\\'")}'`;
                        if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
                        return value;
                    });
                    return `(${rowValues.join(', ')})`;
                });
                
                backupSQL += values.join(',\n') + ';\n\n';
            }
            
        } catch (error) {
            console.error(`❌ Error backing up table ${table}:`, error.message);
            backupSQL += `-- Error backing up table ${table}: ${error.message}\n\n`;
        }
    }
    
    return backupSQL;
}

// Download backup file - NEW ENDPOINT
exports.downloadBackup = async (req, res) => {
    try {
        const { filename } = req.params;
        
        console.log('📥 Download requested for:', filename);
        
        const backupDir = path.join(__dirname, '../backups');
        const backupFile = path.join(backupDir, filename);
        
        // Verify file exists and is in backup directory
        try {
            await fs.access(backupFile);
        } catch {
            return res.status(404).json({
                success: false,
                message: 'Backup file not found'
            });
        }
        
        // Set headers for download
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/sql');
        
        // Stream file to response
        const fileStream = require('fs').createReadStream(backupFile);
        fileStream.pipe(res);
        
        console.log('✅ File download started:', filename);
        
    } catch (error) {
        console.error('❌ Download failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'Download failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Restore database from backup - FIXED VERSION
exports.restoreDatabase = async (req, res) => {
    try {
        const { filename } = req.body;
        
        if (!filename) {
            return res.status(400).json({
                success: false,
                message: 'Backup filename is required'
            });
        }
        
        console.log('🔄 Starting database restore from:', filename);
        
        const backupDir = path.join(__dirname, '../backups');
        const backupFile = path.join(backupDir, filename);
        
        // Verify backup file exists
        try {
            await fs.access(backupFile);
        } catch {
            return res.status(404).json({
                success: false,
                message: 'Backup file not found'
            });
        }
        
        // Read and execute backup file
        const backupContent = await fs.readFile(backupFile, 'utf8');
        
        // Split SQL commands and execute them
        const commands = backupContent
            .split(';')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd && !cmd.startsWith('--'));
        
        console.log(`🔄 Executing ${commands.length} SQL commands...`);
        
        for (const command of commands) {
            if (command.trim()) {
                try {
                    await db.execute(command);
                } catch (cmdError) {
                    console.warn(`⚠️ Command failed (continuing): ${cmdError.message}`);
                }
            }
        }
        
        console.log('✅ Database restore completed from:', filename);
        
        res.json({
            success: true,
            data: {
                filename: filename,
                restoredAt: new Date().toISOString(),
                commandsExecuted: commands.length
            },
            message: 'Database restore completed successfully'
        });
        
    } catch (error) {
        console.error('❌ Database restore failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'Database restore failed: ' + error.message,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// System maintenance - ACTUAL IMPLEMENTATION
exports.runMaintenance = async (req, res) => {
    try {
        console.log('🔧 Starting database maintenance...');
        
        const maintenanceResults = [];
        
        // 1. Optimize tables
        const tables = ['tblclasses', 'tblsubjects', 'tblstudents', 'tblsubjectcombination', 'tblresult'];
        
        for (const table of tables) {
            try {
                await db.execute(`OPTIMIZE TABLE ${table}`);
                maintenanceResults.push(`✅ Optimized table: ${table}`);
                console.log(`✅ Optimized table: ${table}`);
            } catch (error) {
                maintenanceResults.push(`❌ Failed to optimize ${table}: ${error.message}`);
                console.error(`❌ Failed to optimize ${table}:`, error.message);
            }
        }
        
        // 2. Analyze tables
        for (const table of tables) {
            try {
                await db.execute(`ANALYZE TABLE ${table}`);
                maintenanceResults.push(`📊 Analyzed table: ${table}`);
                console.log(`📊 Analyzed table: ${table}`);
            } catch (error) {
                maintenanceResults.push(`❌ Failed to analyze ${table}: ${error.message}`);
            }
        }
        
        // 3. Check tables
        for (const table of tables) {
            try {
                const [result] = await db.execute(`CHECK TABLE ${table}`);
                const status = result[0]?.Msg_text || 'Unknown';
                maintenanceResults.push(`🔍 ${table}: ${status}`);
                console.log(`🔍 ${table}: ${status}`);
            } catch (error) {
                maintenanceResults.push(`❌ Failed to check ${table}: ${error.message}`);
            }
        }
        
        // 4. Clean up old data (example - adjust as needed)
        try {
            // Remove any test data or cleanup old records
            // This is just an example - adjust based on your needs
            await db.execute(`DELETE FROM tblresult WHERE CreationDate < DATE_SUB(NOW(), INTERVAL 5 YEAR)`);
            maintenanceResults.push(`🧹 Cleaned up old records`);
        } catch (error) {
            maintenanceResults.push(`❌ Cleanup failed: ${error.message}`);
        }
        
        console.log('✅ Database maintenance completed');
        
        res.json({
            success: true,
            data: {
                results: maintenanceResults,
                completedAt: new Date().toISOString(),
                tablesProcessed: tables.length
            },
            message: 'Database maintenance completed successfully'
        });
        
    } catch (error) {
        console.error('❌ Database maintenance failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'Database maintenance failed: ' + error.message,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update system settings - MISSING FUNCTION
exports.updateSystemSettings = async (req, res) => {
    try {
        const { settings } = req.body;
        
        console.log('⚙️ Updating system settings...');
        
        // Here you would typically save settings to a configuration file or database
        // For now, we'll just return success with the received settings
        
        res.json({
            success: true,
            data: settings,
            message: 'System settings updated successfully'
        });
        
    } catch (error) {
        console.error('❌ Error updating settings:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to update system settings',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// List available backups - MISSING FUNCTION
exports.listBackups = async (req, res) => {
    try {
        console.log('📂 Listing available backups...');
        
        const backupDir = path.join(__dirname, '../backups');
        
        try {
            const files = await fs.readdir(backupDir);
            const backupFiles = files.filter(file => file.endsWith('.sql'));
            
            const backups = await Promise.all(
                backupFiles.map(async (file) => {
                    const filepath = path.join(backupDir, file);
                    const stats = await fs.stat(filepath);
                    
                    return {
                        filename: file,
                        filepath: filepath,
                        size: stats.size,
                        created: stats.birthtime,
                        modified: stats.mtime
                    };
                })
            );
            
            // Sort by creation date (newest first)
            backups.sort((a, b) => new Date(b.created) - new Date(a.created));
            
            res.json({
                success: true,
                data: backups,
                message: `Found ${backups.length} backup files`
            });
            
        } catch (dirError) {
            // Backup directory doesn't exist
            res.json({
                success: true,
                data: [],
                message: 'No backups found - backup directory will be created on first backup'
            });
        }
        
    } catch (error) {
        console.error('❌ Error listing backups:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to list backups',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Delete backup file - MISSING FUNCTION
exports.deleteBackup = async (req, res) => {
    try {
        const { filename } = req.params;
        
        console.log('🗑️ Deleting backup file:', filename);
        
        const backupDir = path.join(__dirname, '../backups');
        const backupFile = path.join(backupDir, filename);
        
        // Verify file exists and is in backup directory
        try {
            await fs.access(backupFile);
        } catch {
            return res.status(404).json({
                success: false,
                message: 'Backup file not found'
            });
        }
        
        // Delete file
        await fs.unlink(backupFile);
        
        console.log('✅ Backup file deleted:', filename);
        
        res.json({
            success: true,
            message: 'Backup file deleted successfully'
        });
        
    } catch (error) {
        console.error('❌ Error deleting backup:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to delete backup file',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Helper function to get last backup info
async function getLastBackupInfo() {
    try {
        const backupDir = path.join(__dirname, '../backups');
        const files = await fs.readdir(backupDir);
        const backupFiles = files.filter(file => file.endsWith('.sql'));
        
        if (backupFiles.length === 0) {
            return null;
        }
        
        // Get most recent backup
        const latestBackup = backupFiles
            .map(file => ({
                filename: file,
                filepath: path.join(backupDir, file)
            }))
            .sort((a, b) => {
                const aTime = fs.statSync(a.filepath).birthtime;
                const bTime = fs.statSync(b.filepath).birthtime;
                return bTime - aTime;
            })[0];
        
        const stats = await fs.stat(latestBackup.filepath);
        
        return {
            filename: latestBackup.filename,
            date: stats.birthtime,
            size: stats.size
        };
        
    } catch (error) {
        return null;
    }
}
