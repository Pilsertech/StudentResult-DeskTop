# Professional ID Card Template Editor - COMPLETE MASTER PLAN
# Updated: 2025-01-21 with ALL Final User Requirements
# Version: 1.0 - Master Implementation Guide

## Project Overview
Convert existing ID card template system into a professional canvas editor similar to Canva/Figma with full-screen popup functionality, drag-and-drop elements, precise positioning, grid snapping, element libraries, and comprehensive template management.

## Core Workflow Requirements
1. **Upload Phase**: Upload front and back template images → Fill template name and class assignment
2. **Editor Trigger**: "Open Canvas Editor" button appears ONLY when BOTH front AND back images are uploaded
3. **Full-Screen Editor**: Button opens professional editor that completely replaces page view (hides upload area)
4. **Element Positioning**: Drag-drop elements with real-time positioning → Save with prompts for unsaved changes
5. **Return Flow**: Exit canvas editor returns to upload view

## Canvas Behavior Specifications
- **Initial State**: Canvas starts as 0x0 dimensions (completely hidden)
- **Dynamic Sizing**: After image upload, canvas resizes to EXACTLY match uploaded template dimensions
- **Template Display**: Template image fills the entire canvas and they are the same size
- **Zoom System**: 100% zoom with scroll - fully visible even for large templates
- **Element Interaction**: Immediate drag-drop after adding, visual feedback during selection/dragging
- **Background Pattern**: Checkerboard pattern for transparent areas

## User Interaction Preferences (FINALIZED)

### 1. Element Addition Behavior
- **Drag & Drop Anywhere**: User can drag elements from panel and drop anywhere on canvas
- **Boundary Validation**: Elements cannot be dropped outside template boundaries - dropping terminates if attempted
- **Real-time Feedback**: Immediate visual response during drag operations
- **Drop Zones**: Elements must be dropped within canvas area only

### 2. Grid Snapping System (DETAILED SPECIFICATION)
- **Grid Size**: 10px grid for precise alignment
- **Grid Visibility**: Grid lines visible only for snapping (not visually displayed)
- **Element Snapping**: Elements snap to other elements for alignment
- **Template Edge Snapping**: Elements snap to template edges and corners
- **CTRL Override**: Press CTRL key while dragging to disable ALL snapping features
- **Smart Guides**: Show alignment guides and distance measurements between elements
- **Snap Threshold**: Elements snap when within 10px of grid lines, other elements, or template edges

### 3. Save Confirmation Strategy
- **Browser Close Detection**: Detect page unload/refresh attempts with save prompt
- **Manual Save Button**: Always visible save button for user-initiated saves
- **Auto-save Prompts**: Warn before losing unsaved changes
- **Template Versioning**: Old template versions are preserved in database

### 4. Canvas Background Display
- **Template Fills Canvas**: Template image covers entire canvas area
- **Exact Size Matching**: Canvas dimensions exactly match uploaded template
- **Checkerboard Pattern**: Show checkerboard pattern for transparent areas
- **No Scaling**: Templates displayed at 100% size with scroll if needed

### 5. Element Selection Visual Feedback
- **Glow Effect**: Soft glow around selected elements for professional appearance
- **Selection Handles**: Corner handles for resize operations
- **Movement Indicators**: Visual feedback during drag operations
- **Multi-Selection**: Ctrl+Click for multiple element selection

### 6. Element Grouping & Management
- **Element Grouping**: Related elements can be grouped together
- **Group Operations**: Move, resize, delete groups as single units
- **Layer Management**: Full layer panel to control element stacking order
- **Copy/Paste**: Elements can be copied between different templates/projects

### 7. Floating Panel Behavior
- **Snap to Edges**: Automatic edge snapping when dragged near screen borders
- **Remember Position**: Panel position persists between sessions
- **Minimize to Icon**: Collapsible to small icon for maximum canvas space
- **Draggable**: Properties panel can be repositioned anywhere on screen

### 8. Property Change Application
- **Real-time Updates**: Property changes apply immediately as user types/changes
- **Live Preview**: See changes instantly without confirmation needed
- **Advanced Styling**: Support for shadows, outlines, gradients on text elements

### 9. Large Template Handling
- **100% Scale with Scroll**: Always show templates at actual size
- **Size Limits**: Maximum template image dimensions: 2000px (longest side)
- **Size Warning**: Emphasize size limits during upload to prevent crashes
- **Scrollable Canvas**: Large templates use scrollbars for navigation

### 10. Element Library Enhancement
- **Professional Icons**: High-quality element icons in sidebar
- **Custom Graphics**: Users can upload custom shapes/graphics to element library
- **Logo Support**: Support for school/institution logos (attached to template on export)
- **Element Templates**: Pre-designed element combinations
- **Categories**: Organized by type (Student Data, Codes, Shapes, Custom, etc.)
- **Quick Search**: Searchable element library for efficiency

### 11. Undo/Redo System
- **10-Step History**: Track last 10 operations for undo/redo
- **Keyboard Shortcuts**: Ctrl+Z for undo, Ctrl+Y for redo
- **Visual Indicators**: Show available undo/redo operations

## UI Layout Architecture
### Full-Screen Editor Layout


[Header Bar with Save/Exit/Template Switching] [Left: Elements Panel (Collapsible/Snap)] [Center: Canvas Area] [Right: Properties Panel (Floating/Repositionable)] [Bottom: Layer Panel for stacking order control]


### Elements Panel (Left Sidebar)
- **Type**: Collapsible sidebar with snap-to-edge functionality
- **Behavior**: Can be completely hidden or minimized to icon
- **Categories**: Student Data, QR/Barcode Codes, Custom Text, Shapes, Icons, Custom Graphics, Logos
- **Interaction**: Drag-and-drop to canvas with glow effect feedback
- **Search**: Quick element search functionality
- **Custom Upload**: Interface to upload custom graphics/logos

### Canvas Area (Center)
- **Background**: Template image fills entire canvas with checkerboard for transparency
- **Sizing**: Dynamic to match uploaded template exactly (100% scale)
- **Zoom**: 100% with scroll support for large templates
- **Grid**: Optional snap-to-grid with CTRL override functionality
- **Rulers**: Show pixel measurements
- **Keyboard Shortcuts**: Full keyboard support for professional workflow
- **Boundary Enforcement**: Prevent element placement outside canvas

### Properties Panel (Right Sidebar)  
- **Type**: Floating panel that snaps to edges and remembers position
- **Default**: 320px wide, docked to right side initially
- **Behavior**: Draggable header, snaps to screen edges when near
- **Content**: Real-time property updates based on selected element
- **Collapse**: Minimizable to icon for maximum canvas space
- **Persistence**: Remember size and position between sessions

### Layer Panel (Bottom/Floating)
- **Element Stacking**: Visual representation of element layers
- **Drag Reorder**: Drag elements to change stacking order
- **Visibility Toggle**: Show/hide individual elements
- **Lock Elements**: Lock elements to prevent accidental modification

## Element Positioning Storage Strategy
- **Primary**: Pixel-based positioning for maximum precision and accuracy
- **Conversion Logic**: Automatic conversion between pixel and percentage-based positioning
- **Database Storage**: Both formats stored for flexibility and scalability
- **Scale Properties**: Element scale data stored in relation to template size
- **Positioning Data**: Store x, y, width, height, rotation, scale factor, z-index

## Template Management System

### Template Versioning
- **Version History**: Keep history of template changes with timestamps
- **Rollback Capability**: Ability to revert to previous template versions
- **Change Tracking**: Track what changes were made and by whom

### Template Sharing & Import/Export
- **Export Format**: Templates exported with embedded position data
- **Import Validation**: Verify template compatibility on import
- **Cross-System**: Templates can be shared between different SRMS installations
- **Accuracy Preservation**: Element positions maintained exactly during export/import

### Template Validation
- **Boundary Checking**: All elements must be within canvas boundaries
- **Upload State**: Templates start as plain uploaded images before editing
- **Integrity Checks**: Validate template structure before allowing edits

### Template Locking
- **Edit Protection**: Templates can be locked to prevent unauthorized editing
- **Permission Levels**: Different users may have different template access levels
- **Lock Status**: Visual indication of locked templates


## Database Schema Requirements
### Enhanced `tblidcard_templates` Table
```sql
ALTER TABLE `tblidcard_templates` 
ADD COLUMN `CanvasWidth` int(11) NULL COMMENT 'Canvas width in pixels',
ADD COLUMN `CanvasHeight` int(11) NULL COMMENT 'Canvas height in pixels',
ADD COLUMN `ElementData` longtext NULL COMMENT 'JSON array of positioned elements with pixel coords',
ADD COLUMN `PositionDataPixel` longtext NULL COMMENT 'Pixel-based positioning (primary)',
ADD COLUMN `PositionDataPercent` longtext NULL COMMENT 'Percentage-based positioning (secondary)',
ADD COLUMN `VersionNumber` int(11) NOT NULL DEFAULT 1 COMMENT 'Template version number',
ADD COLUMN `PreviousVersions` longtext NULL COMMENT 'JSON array of previous versions',
ADD COLUMN `CustomAssets` longtext NULL COMMENT 'JSON array of custom graphics/logos',
ADD COLUMN `IsLocked` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1=Locked, 0=Unlocked',
ADD COLUMN `LockedBy` int(11) NULL COMMENT 'User who locked the template',
ADD COLUMN `LockedAt` timestamp NULL COMMENT 'When template was locked',
ADD COLUMN `UndoHistory` longtext NULL COMMENT 'JSON array of last 10 operations for undo/redo',
MODIFY COLUMN `PositionData` longtext NULL COMMENT 'Legacy compatibility field';
```
=======================================================

THE FULL DETAILE  SURMERIZED MASTER PLAN IS HERE


# Professional ID Card Template Editor - COMPLETE MASTER PLAN

**Version:** 1.1  
**Last Updated:** 2025-01-21  
**Status:** ✅ FINAL SPECIFICATION  
**Intended For:** Development team and AI tooling to execute with precision  
**Note:** This is a **feature module** of the **Student Results Management System (SRMS)**, not a standalone application.

---

## 📌 Project Overview
Build a professional full-screen ID card template editor into the Student Results Management System (SRMS), supporting drag-and-drop design, student data integration, element libraries, template versioning, class assignment, asset management, and print/export capabilities.

---

## 🧭 Core Workflow

1. **Template Upload**
   - Upload both front and back template images
   - Provide template name and assign classes (dropdown from `tblclasses`)

2. **Canvas Entry**
   - "Open Canvas Editor" button activates ONLY after both images are uploaded
   - Opens fullscreen canvas editor, hides original page

3. **Editing & Saving**
   - Drag-drop elements
   - Real-time property editing
   - Manual Save & Save Confirmation system
   - Auto-backup every 3 minutes
   - Version history maintained

4. **Return to Upload View**
   - Exit button returns to the upload view
   - Canvas saves and closes

---

## 🖼️ Full-Screen Canvas Editor Layout

```
[Header Bar with Save/Exit/Template Switching]
[Left: Elements Panel (Collapsible/Snap)]
[Center: Canvas Area]
[Right: Properties Panel (Floating/Repositionable)]
[Bottom: Layer Panel for stacking order control - Small Area]
```

---

## 🧩 Elements Panel (Left Sidebar)

- **Collapsible**: Can be minimized or hidden
- **Snap-to-edge**: Always aligned on left screen edge
- **Element Categories**:
  - Student Data (Name, Roll, Photo)
  - QR/Barcode
  - Custom Text
  - Shapes, Icons
  - Logos, Custom Graphics
- **Interactions**:
  - Drag-and-drop to canvas
  - Glow effect feedback
- **Search & Upload**:
  - Search bar for quick access
  - Upload custom graphics/logos

---

## 🎨 Canvas Area (Center)

- **Template Fills Canvas**: Background uses uploaded template (checkerboard for transparency)
- **Size**: Matches uploaded image exactly (100% scale)
- **Scroll Support**: For large templates
- **Snapping**:
  - 10px grid (optional), edge snapping
  - CTRL disables snapping
- **Rulers & Measurements**: Pixel-based rulers
- **Keyboard Support**: Full keyboard shortcuts for pro editing
- **Boundary Enforcement**: No element outside canvas
- **Zoom**: 100% zoom, no auto-resizing

---

## ⚙️ Properties Panel (Right Sidebar)

- **Floating/Draggable**
- **Edge-Snap & Position Persistence**
- **Minimizable**
- **Real-time Property Sync**: Updates as elements are selected
- **Default Width**: 320px

---

## 📑 Layer Panel (Bottom Docked)

- **Max Height**: 150px, horizontally scrollable
- **Layer Stack**: Drag to reorder, z-index respected
- **Auto-Naming**: “Text 1”, “Image 1”, etc.
- **Visibility Toggle**
- **Element Locking**
- **Compact Design**

---

## 💾 Element Storage & Positioning Strategy

- **Primary**: Pixel-based
- **Secondary**: Percentage-based
- **Stored Attributes**:
  - x, y, width, height, rotation, z-index
  - scale factor, element ID, side (front/back), grouped
- **DB Storage**: Both pixel and percent stored

---

## 🔐 Template Management System

[... Truncated for brevity, continues in the next cell ...]
---

## 🔐 Template Management System (continued)

### Versioning
- Save full version history with timestamps
- Manual rollback support
- Tracks user who made change

### Import/Export
- Embedded position and asset data
- Cross-system compatible
- Import validation to check accuracy and structure

### Validation
- Elements must stay within bounds
- Image integrity checks
- Start as plain images before editing

### Locking
- Editable access control per template
- Lock indicator and user info on lock

---

## 🏷️ Class Assignment System

- Class dropdown sourced from `tblclasses` table (only active classes)
- Reassign anytime
- Auto-assign to all active classes
- Stored in DB as JSON
- Visual indicator for assigned classes

---

## 📁 Custom Asset Management System

### Storage
- File System: Logos/graphics stored in `/uploads/custom-assets/`
- DB stores metadata only

### Upload Rules
- Max Size: 2MB
- Formats: PNG, JPG, SVG, PDF
- Auto-Optimize and Generate Thumbnails
- File Type & Size Validated

### Library
- Searchable, categorized view
- Track asset usage per template
- Clean unused assets

---

## 🧠 Canvas & Editor Tech Stack

- Fabric.js – Canvas rendering & manipulation
- Sharp – Image optimization
- QRCode.js / JsBarcode – QR & barcode generation
- PDF-lib – Export to print-ready PDFs
- Multer – Secure file upload
- LocalStorage / IndexedDB – UI state & backups

---

## 📚 Student Data Integration

- Data from `tblstudents`
- Photos read-only; cannot replace via editor
- QR auto-generated if missing
- Validation before export:
  - Required: Name, RollId, Class
  - File check for photo
  - Active class validation

---

## 🖨️ Output & Production Specifications

- Match template resolution
- CR80 / ID-1 standard support
- RGB/CMYK toggle
- Bleed: 0mm / 3mm / 5mm
- Crop marks optional

### Print Layouts
- Default: 2 cards/page
- Options: 1, 2, 4, 6, 8, 9 per page
- Portrait/Landscape toggle
- A4, Letter, A3, Legal paper sizes
- Margin configuration

### Batch Generation
- Single student
- Custom (2, 5, 10, etc.)
- Full class (max 50)
- Progress bar shown
- Max: 50 per batch

---

## 🛡️ Performance & Security

- 2000px image max (longest side)
- Auto asset cleanup
- Template Locking
- Permission Levels
- Audit Trail
- Student data privacy guaranteed

---

## 🔄 Backup & Recovery

- Auto-backup every 3 minutes (localStorage & IndexedDB)
- Version retention
- Manual exportable backups
- No auto cleanup of backups
- Disaster recovery plan included

---

## 🗄️ Database Schema Requirements

### Enhanced `tblidcard_templates` Table
```sql
ALTER TABLE `tblidcard_templates` 
ADD COLUMN `CanvasWidth` int(11) NULL COMMENT 'Canvas width in pixels',
ADD COLUMN `CanvasHeight` int(11) NULL COMMENT 'Canvas height in pixels',
ADD COLUMN `ElementData` longtext NULL COMMENT 'JSON array of positioned elements with pixel coords',
ADD COLUMN `PositionDataPixel` longtext NULL COMMENT 'Pixel-based positioning (primary)',
ADD COLUMN `PositionDataPercent` longtext NULL COMMENT 'Percentage-based positioning (secondary)',
ADD COLUMN `VersionNumber` int(11) NOT NULL DEFAULT 1 COMMENT 'Template version number',
ADD COLUMN `PreviousVersions` longtext NULL COMMENT 'JSON array of previous versions',
ADD COLUMN `CustomAssets` longtext NULL COMMENT 'JSON array of custom graphics/logos file paths',
ADD COLUMN `IsLocked` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1=Locked, 0=Unlocked',
ADD COLUMN `LockedBy` int(11) NULL COMMENT 'User who locked the template',
ADD COLUMN `LockedAt` timestamp NULL COMMENT 'When template was locked',
ADD COLUMN `UndoHistory` longtext NULL COMMENT 'JSON array of last 10 operations for undo/redo',
ADD COLUMN `GridSettings` text NULL COMMENT 'JSON of grid configuration (size, snap settings)',
MODIFY COLUMN `PositionData` longtext NULL COMMENT 'Legacy compatibility field';
```

### New `tblidcard_custom_assets` Table
```sql
CREATE TABLE `tblidcard_custom_assets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `AssetName` varchar(100) NOT NULL COMMENT 'User-friendly asset name',
  `AssetType` enum('logo','graphic','shape','other') NOT NULL COMMENT 'Type of asset',
  `FilePath` varchar(255) NOT NULL COMMENT 'Relative path to asset file',
  `FileName` varchar(255) NOT NULL COMMENT 'Original filename',
  `FileSize` int(11) NOT NULL COMMENT 'File size in bytes',
  `MimeType` varchar(50) NOT NULL COMMENT 'MIME type of file',
  `ThumbnailPath` varchar(255) NULL COMMENT 'Path to thumbnail image',
  `UploadedBy` int(11) NOT NULL DEFAULT 1 COMMENT 'User who uploaded asset',
  `UsageCount` int(11) NOT NULL DEFAULT 0 COMMENT 'Number of templates using this asset',
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_asset_type` (`AssetType`),
  KEY `idx_asset_name` (`AssetName`),
  KEY `idx_uploaded_by` (`UploadedBy`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Custom asset management';
```

---

## 📦 JSON Element Data Structure

(See full schema previously provided. Structure includes `elements`, `canvas`, `customAssets`, `undoHistory`, `gridSettings`, `layerSettings`)

---

## 📱 Future Mobile & Web Features

- Responsive editor
- Pinch-to-zoom, touch drag
- Mobile preview
- Offline mode with sync
- Mobile app (planned)
- Cloud sync and API support

---

## ✅ Implementation Checklist

See full 10-phase checklist with boxes in original content

---

## 🚀 Success Metrics

- Smooth canvas performance
- QR accuracy
- Professional UI/UX
- Reliable backup system
- Seamless student data integration

---

## 🧭 Final Reminder

This feature module is part of the **Student Results Management System**. Follow all layout, validation, and database specs to ensure smooth integration and future scalability.

