# Cleanup Plan - Removing Unused Files

## Files to Remove

### 1. Firebase-Related Files
- [x] `config/firebaseClient.js` - Firebase client config (not used)
- [x] `config/firebaseConfig.js` - Firebase admin config (not used)
- [x] `baked-blissed-firebase-adminsdk-qk2zr-3431647e6b.json` - Firebase service account (contains secrets)
- [x] `config copy/fcm.json` - Firebase Cloud Messaging config

### 2. Duplicate/Legacy Config Directory
- [x] `config copy/` - Entire directory (duplicate of config)
  - `db.js`
  - `fcm.json`
  - `keys_length.js`
  - `server.js`

### 3. Duplicate Migration Documents (Keep only STANDARDIZATION_MIGRATION.md)
- [x] `MIGRATION_COMPLETE.md`
- [x] `MIGRATION_GUIDE.md`
- [x] `MIGRATION_SUMMARY.md`

### 4. Moved Documentation
- [x] `Nodejs standardization doc.txt` - Now in docs/nodejs-standardization.md

### 5. Legacy/Unused Schema Files
- [x] `db/schemas/userModel.js` - Placeholder file, actual model is users.js
- [x] `db/schemas/productsModel.js` - Duplicate of products.js

### 6. Migration Scripts (Archive - Move to archive/)
- [ ] `scripts/migrateFirebaseData.js` - Migration complete, archive it

### 7. Log Files
- [x] `server.log` - Should not be in repo

## Total Files to Remove: ~15 files

## Actions
1. Remove Firebase files
2. Remove duplicate config directory
3. Remove duplicate migration docs
4. Remove duplicate schema files
5. Remove log files
6. Update .gitignore to prevent future log files
