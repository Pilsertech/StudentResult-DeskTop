# Copilot Instructions for Student Result Management System (SRMS)

## Architecture Overview

This is a **3-tier desktop application** converted from PHP to Node.js/Electron:
- **electron-app/**: Electron desktop client with auto-server startup
- **server/**: Express.js API with MySQL database  
- **shared/**: Static assets (Bootstrap 3, jQuery, Font Awesome)

## Key Architectural Patterns

### Server Auto-Start Pattern
The Electron app automatically spawns the Node.js server on launch (`electron-app/main.js:17-38`):
```javascript
serverProcess = spawn('node', [path.join(__dirname, '..', 'server', 'app.js')]);
```
- Server signals readiness with `SERVER_READY` stdout message
- IPC communication for graceful shutdown via `/shutdown` endpoint

### Database Connection Pattern
Use the connection pool from `server/config/database.js`:
```javascript
const db = require('../config/database');
const [rows] = await db.execute('SELECT * FROM tblstudents WHERE Status = ?', [1]);
```
- Always use parameterized queries for security
- Pool auto-tests required tables on startup
- Comprehensive error logging to `server/server.log`

### API Controller Pattern
Follow the established structure in `server/controllers/`:
```javascript
exports.getEntityData = async (req, res) => {
    try {
        const [rows] = await db.execute(query, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
```

### Frontend Page Structure
Pages follow a modular pattern (`electron-app/renderer/pages/*/`):
- `page.html` - Structure with shared includes for topbar/leftbar
- `page.css` - Page-specific styles
- `page.js` - API calls and DOM manipulation with jQuery

## ID Card System Architecture

### Template-Based Generation System
The ID card system uses a 3-page workflow:

1. **Template Designer** (`card-templates-enhanced.*`) - Fabric.js canvas editor for positioning elements
2. **Card Generator** (`generate-cards-enhanced.*`) - Database-driven bulk generation 
3. **Print Manager** (`print-cards.*`) - PDF export and print queue management

### Key ID Card Components
```javascript
// Template positioning data structure
positionData = {
    front: {
        'student-name': { x: 100, y: 50, fontSize: 18, fontFamily: 'Arial' },
        'photo': { x: 200, y: 100, width: 150, height: 200 },
        'qr-code': { x: 50, y: 300, width: 100, height: 100 }
    },
    back: { /* back side elements */ }
};
```

### Database Schema for ID Cards
- `tblidcard_templates` - Template designs with JSON position data
- `tblidcard_generated` - Generated card tracking per student
- `tblstudents` enhanced with QR/barcode/photo fields

## Development Workflow

### Starting Development
```bash
# From electron-app directory (starts both server and client)
npm start
```

### Database Setup
1. Create MySQL database named `srms`
2. Import `server/DB/srms.sql` (comprehensive schema with attendance, ID cards)
3. Default login: username=`admin`, password=`alphacodecamp`

### Adding New Features
1. **API First**: Create routes in `server/routes/` and controllers in `server/controllers/`
2. **Frontend**: Build UI in `electron-app/renderer/pages/[feature]/`
3. **Shared Assets**: Reference from `../../../../shared/` path in HTML files

### ID Card Development Pattern
1. **Templates**: Use Fabric.js for visual element positioning
2. **Generation**: Server-side Canvas API for rendering with real data
3. **Export**: Sharp/PDF-lib for high-quality output formats

## Critical Database Schema

Key tables with relationships:
- `tblstudents` (StudentId) → enhanced with QR/barcode/fingerprint fields
- `tblclasses` (id) → with Status field for active/inactive
- `tblsubjects` (id) → linked via `tblsubjectcombination`
- `tblresult` → stores student marks per subject
- `tblattendance*` → comprehensive attendance system with sessions, settings, reports
- `tblidcard*` → template-based ID card generation system

## Security & Performance Notes

### Electron Security (main.js:106-144)
- Context isolation enabled, node integration disabled
- CSP configured for local files and Google Fonts
- Background throttling disabled for canvas animations

### MySQL Performance
- Connection pooling with 10 connections max
- Indexed foreign keys for all relationships
- Proper `UNIQUE` constraints on email/roll numbers

### ID Card Image Processing
- Sharp for server-side image optimization
- Canvas API for precise element positioning
- PDF-lib for print-ready PDF generation

## Legacy Considerations

- **MD5 Hashing**: Uses legacy MD5 for password compatibility
- **Bootstrap 3**: Frontend uses older Bootstrap/jQuery stack
- **File Protocol**: Shared assets loaded via `file://` protocol
- **PHP Conversion**: Original PHP patterns preserved in API design

## Current Status

**Completed**: Authentication, dashboard, database schema, server architecture, enhanced ID card system
**In Progress**: CRUD operations for classes, subjects, students, results

When converting remaining PHP functionality, maintain the established patterns and ensure compatibility with the existing database schema.
