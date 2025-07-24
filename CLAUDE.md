# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Student Result Management System (SRMS)** converted from PHP to a Node.js/Electron desktop application. The system manages academic records including classes, subjects, students, and results with a clean separation between server-side API and desktop client.

## Architecture

**3-Tier Architecture:**
- **electron-app/**: Electron desktop client (main process, renderer processes, UI)
- **server/**: Node.js Express API server with MySQL database
- **shared/**: Common static assets (CSS frameworks, JS libraries, fonts, images)

**Key Design Patterns:**
- Server auto-starts when Electron launches (`electron-app/main.js:17-38`)
- IPC communication between Electron processes for app state management
- REST API endpoints with controller/route separation
- MySQL connection pooling with comprehensive error handling

## Development Commands

### Starting the Application
```bash
# From electron-app directory (starts both server and client)
npm start
```

### Server Only (for API testing)
```bash
# From server directory
npm start
```

### Database Setup
1. Create MySQL database named `srms`
2. Import SQL schema from `server/DB/srms.sql`
3. Default admin login: username=`admin`, password=`alphacodecamp`

## Key Technical Details

**Database Configuration:**
- MySQL connection pool in `server/config/database.js`
- Auto-tests all required tables on startup: `tblclasses`, `tblstudents`, `tblsubjects`, `tblsubjectcombination`, `tblresult`

**Electron Security:**
- CSP configured for local file loading and Google Fonts (`electron-app/main.js:106-144`)
- Background throttling disabled for canvas animations
- Context isolation enabled, node integration disabled

**API Structure:**
- RESTful endpoints: `/auth`, `/dashboard`, `/classes`, `/subjects`, `/students`, `/api/results`
- Controllers use async/await with proper error handling
- Comprehensive logging to `server/server.log`

**Frontend Framework:**
- jQuery + Bootstrap 3 with legacy CSS libraries
- Shared assets loaded via file:// protocol from `shared/` directory
- Pages structured as independent HTML/CSS/JS modules

## Development Workflow

When adding new features:
1. Create API endpoints in `server/routes/` and `server/controllers/`
2. Build corresponding UI pages in `electron-app/renderer/pages/`
3. Link shared assets from `shared/css/` and `shared/js/`
4. Test database operations using the connection pool pattern

## Current Status

**Completed:** Authentication, dashboard, server architecture, database integration
**In Progress:** CRUD operations for classes, subjects, students, and results conversion from original PHP codebase

The project maintains the original database schema and UI design while modernizing the technology stack.