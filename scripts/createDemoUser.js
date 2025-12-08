const crypto = require('crypto');
require('dotenv').config();

/**
 * Script to create a demo customer user
 * Usage: node scripts/createDemoUser.js
 */

const sequelize = require('../db/sequelize/sequelize');

// Customer credentials
const CUSTOMER_EMAIL = 'customer@test.com';
const CUSTOMER_PASSWORD = 'Customer@123';
const CUSTOMER_NAME = 'Demo Customer';
const CUSTOMER_PHONE = '+1234567890';

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

async function createDemoUser() {
    try {
        console.log('🔌 Connecting to database...');
        await sequelize.connection.authenticate();
        console.log('✅ Database connected successfully');

        // Check if user already exists
        const existingUser = await sequelize.models.users.findOne({
            where: { email: CUSTOMER_EMAIL }
        });

        if (existingUser) {
            console.log('⚠️  Demo customer already exists with email:', CUSTOMER_EMAIL);
            console.log('📧 Email:', CUSTOMER_EMAIL);
            console.log('🔑 Password:', CUSTOMER_PASSWORD);
            console.log('👤 User ID:', existingUser.user_id);
            return;
        }

        // Hash the password
        const { salt, hash } = hashPassword(CUSTOMER_PASSWORD);

        // Create customer user
        const customerUser = await sequelize.models.users.create({
            user_id: generateUserId(),
            full_name: CUSTOMER_NAME,
            email: CUSTOMER_EMAIL,
            phone_number: CUSTOMER_PHONE,
            password: hash,
            salt: salt,
            role: 'user',
            date_joined: new Date(),
            created_at: new Date()
        });

        console.log('\n✅ Demo customer created successfully!\n');
        console.log('═══════════════════════════════════════');
        console.log('📧 Email:', CUSTOMER_EMAIL);
        console.log('🔑 Password:', CUSTOMER_PASSWORD);
        console.log('📱 Phone:', CUSTOMER_PHONE);
        console.log('👤 User ID:', customerUser.user_id);
        console.log('📝 Role:', customerUser.role);
        console.log('═══════════════════════════════════════\n');
        console.log('You can now login at: http://localhost:5173');
        console.log('Select "Customer" role and use the credentials above.\n');

    } catch (error) {
        console.error('❌ Error creating demo user:', error.message);
        console.error(error);
    } finally {
        await sequelize.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
}

// Run the script
createDemoUser();
