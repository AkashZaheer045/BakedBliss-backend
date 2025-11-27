# BakedBliss Backend - Restructuring Plan

## Overview
Converting the project to follow the Node.js Standardization Guide structure.

## Current Structure → Target Structure

### 1. Main Entry Point
- **Current**: `index.js`
- **Target**: `app.js`
- **Action**: Rename `index.js` to `app.js`

### 2. Modules Directory
- **Current**: `./modules/`
- **Target**: `./src/modules/`
- **Action**: Move `modules/` to `src/modules/`

### 3. Database Layer (Critical)
- **Current**: Split across:
  - `./schema/` - Model definitions
  - `./sequelize/` - Sequelize configuration
  - `./migrations/` - Migration files
- **Target**: `./db/`
  - `./db/schemas/` - Model definitions
  - `./db/sequelize/` - Sequelize setup (connection, instance, associations)
  - `./db/migrations.sql` - SQL migrations
- **Action**: Consolidate all database-related files under `db/`

### 4. Module Structure Enhancement
Each module currently has:
- `controllers/`
- `routes/`

Each module should have:
- `app.js` - Module entry point
- `controllers/` - HTTP layer
- `routes/` - Route definitions
- `services/` - Business logic (NEW)
- `validations/` - Input validation schemas (NEW)

### 5. New Directories to Create
- `./utils/` - Framework-agnostic utilities (response helpers, uploaders)
- `./views/` - Email/EJS templates
- `./docs/` - Documentation

### 6. Configuration
- **Current**: `./config/` (keep)
- **Action**: Clean up and remove legacy files in `config copy/`

### 7. Helpers & Middleware
- **Current**: `./helpers/`, `./middleware/` (keep)
- **Action**: Review and ensure they follow conventions

## Execution Steps

1. ✅ Create target directory structure
2. ✅ Move modules to `src/modules/`
3. ✅ Consolidate database files to `db/`
4. ✅ Rename `index.js` to `app.js`
5. ✅ Update all import paths
6. ✅ Add missing directories to each module (services/, validations/)
7. ✅ Update package.json scripts
8. ✅ Create .nvmrc file
9. ✅ Clean up legacy files

## Files to Update (Import Paths)
- `app.js` (main bootstrap)
- All route files
- All controller files
- Module exports

## Risk Mitigation
- Test after each major change
- Keep backups of original structure
- Update one module at a time for safety
