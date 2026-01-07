const crypto = require('crypto');
require('dotenv').config();

/**
 * Script to create an admin user in the database
 * Usage: node scripts/createAdminUser.js
 */

const sequelize = require('../db/sequelize/sequelize');

// Admin credentials
const ADMIN_EMAIL = 'admin@bakedbliss.com';
const ADMIN_PASSWORD = 'Admin@123456';
const ADMIN_NAME = 'Admin User';

/**
 * Hash password with salt
 */
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return { salt, hash };
}

/**
 * Generate unique user ID
 */
function generateUserId() {
    return 'USR_' + crypto.randomBytes(8).toString('hex').toUpperCase();
}

async function createAdminUser() {
    try {
        console.log('🔌 Connecting to database...');
        await sequelize.connection.authenticate();
        console.log('✅ Database connected successfully');

        // Check if admin already exists
        const existingAdmin = await sequelize.models.users.findOne({
            where: { email: ADMIN_EMAIL }
        });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists with email:', ADMIN_EMAIL);
            console.log('📧 Email:', ADMIN_EMAIL);
            console.log('🔑 Password:', ADMIN_PASSWORD);
            console.log('👤 User ID:', existingAdmin.user_id);
            console.log('📝 Role:', existingAdmin.role);
            return;
        }

        // Hash the password
        const { salt, hash } = hashPassword(ADMIN_PASSWORD);

        // Create admin user
        const adminUser = await sequelize.models.users.create({
            user_id: generateUserId(),
            full_name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: hash,
            salt: salt,
            role: 'admin',
            date_joined: new Date(),
            created_at: new Date()
        });

        console.log('\n✅ Admin user created successfully!\n');
        console.log('═══════════════════════════════════════');
        console.log('📧 Email:', ADMIN_EMAIL);
        console.log('🔑 Password:', ADMIN_PASSWORD);
        console.log('👤 User ID:', adminUser.user_id);
        console.log('📝 Role:', adminUser.role);
        console.log('═══════════════════════════════════════\n');
        console.log('⚠️  IMPORTANT: Change this password after first login!\n');
        console.log('You can now login at: http://localhost:5173');
        console.log('Select "Admin" role and use the credentials above.\n');
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        console.error(error);
    } finally {
        await sequelize.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
}

// Run the script
createAdminUser();
