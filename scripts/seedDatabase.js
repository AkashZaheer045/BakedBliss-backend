/**
 * Database Seeder for Test Data
 * 
 * This script creates sample data for testing the application
 * 
 * Usage: node scripts/seedDatabase.js
 */

require('dotenv').config();
const { models, sequelize } = require('../config/sequelizeConfig');
const { User, Product, Order, Cart, ContactMessage, Favorite } = models;

const sampleUsers = [
    {
        user_id: 'user_test_001',
        full_name: 'John Doe',
        email: 'john.doe@example.com',
        profile_picture: 'https://i.pravatar.cc/150?img=1',
        phone_number: '+1234567890',
        addresses: [
            {
                street: '123 Main St',
                city: 'New York',
                state: 'NY',
                zipCode: '10001',
                country: 'USA'
            }
        ],
        role: 'user',
        date_joined: new Date()
    },
    {
        user_id: 'user_test_002',
        full_name: 'Jane Smith',
        email: 'jane.smith@example.com',
        profile_picture: 'https://i.pravatar.cc/150?img=2',
        phone_number: '+1234567891',
        addresses: [],
        role: 'user',
        date_joined: new Date()
    },
    {
        user_id: 'admin_test_001',
        full_name: 'Admin User',
        email: 'admin@bakedbliss.com',
        role: 'admin',
        date_joined: new Date()
    }
];

const sampleProducts = [
    {
        title: 'Chocolate Chip Cookies',
        price: 5.99,
        sale_price: 4.99,
        thumbnail: 'https://via.placeholder.com/300x300/8B4513/FFFFFF?text=Cookies',
        rating: 4.8,
        category: 'Cookies',
        rating_count: 120,
        ingredients: ['flour', 'sugar', 'chocolate chips', 'butter', 'eggs'],
        description: 'Delicious homemade chocolate chip cookies',
        tagline: 'Classic comfort in every bite',
        images: [
            'https://via.placeholder.com/600x600/8B4513/FFFFFF?text=Cookie1',
            'https://via.placeholder.com/600x600/8B4513/FFFFFF?text=Cookie2'
        ],
        stock: 100
    },
    {
        title: 'Blueberry Muffins',
        price: 8.99,
        thumbnail: 'https://via.placeholder.com/300x300/4169E1/FFFFFF?text=Muffins',
        rating: 4.6,
        category: 'Muffins',
        rating_count: 85,
        ingredients: ['flour', 'blueberries', 'sugar', 'butter', 'eggs', 'milk'],
        description: 'Fresh baked blueberry muffins',
        tagline: 'Morning perfection',
        images: [
            'https://via.placeholder.com/600x600/4169E1/FFFFFF?text=Muffin1'
        ],
        stock: 50
    },
    {
        title: 'Sourdough Bread',
        price: 6.50,
        thumbnail: 'https://via.placeholder.com/300x300/D2691E/FFFFFF?text=Bread',
        rating: 4.9,
        category: 'Breads',
        rating_count: 200,
        ingredients: ['flour', 'water', 'salt', 'sourdough starter'],
        description: 'Artisan sourdough bread',
        tagline: 'Crafted with love',
        images: [
            'https://via.placeholder.com/600x600/D2691E/FFFFFF?text=Bread1',
            'https://via.placeholder.com/600x600/D2691E/FFFFFF?text=Bread2'
        ],
        stock: 30
    },
    {
        title: 'Vanilla Cupcakes',
        price: 12.99,
        sale_price: 9.99,
        thumbnail: 'https://via.placeholder.com/300x300/FFB6C1/FFFFFF?text=Cupcakes',
        rating: 4.7,
        category: 'Cakes',
        rating_count: 150,
        ingredients: ['flour', 'sugar', 'butter', 'eggs', 'vanilla extract', 'frosting'],
        description: 'Light and fluffy vanilla cupcakes with buttercream frosting',
        tagline: 'Party perfect',
        images: [
            'https://via.placeholder.com/600x600/FFB6C1/FFFFFF?text=Cupcake1'
        ],
        stock: 75
    },
    {
        title: 'Apple Pie',
        price: 15.99,
        thumbnail: 'https://via.placeholder.com/300x300/CD853F/FFFFFF?text=Pie',
        rating: 5.0,
        category: 'Pies',
        rating_count: 180,
        ingredients: ['apples', 'flour', 'sugar', 'cinnamon', 'butter'],
        description: 'Classic American apple pie',
        tagline: 'Made like grandma used to',
        images: [
            'https://via.placeholder.com/600x600/CD853F/FFFFFF?text=Pie1',
            'https://via.placeholder.com/600x600/CD853F/FFFFFF?text=Pie2'
        ],
        stock: 20
    }
];

async function seedDatabase() {
    console.log('🌱 Starting database seeding...\n');

    try {
        // Test connection
        await sequelize.authenticate();
        console.log('✅ Database connected\n');

        // Clear existing data (optional - comment out if you want to keep existing data)
        console.log('🗑️  Clearing existing data...');
        await Favorite.destroy({ where: {}, force: true });
        await ContactMessage.destroy({ where: {}, force: true });
        await Cart.destroy({ where: {}, force: true });
        await Order.destroy({ where: {}, force: true });
        await Product.destroy({ where: {}, force: true });
        await User.destroy({ where: {}, force: true });
        console.log('✅ Existing data cleared\n');

        // Seed users
        console.log('👥 Seeding users...');
        await User.bulkCreate(sampleUsers);
        console.log(`✅ Created ${sampleUsers.length} users\n`);

        // Seed products
        console.log('🍰 Seeding products...');
        await Product.bulkCreate(sampleProducts);
        console.log(`✅ Created ${sampleProducts.length} products\n`);

        // Create a sample cart
        console.log('🛒 Creating sample cart...');
        await Cart.create({
            user_id: 'user_test_001',
            items: [
                { productId: 1, quantity: 2 },
                { productId: 3, quantity: 1 }
            ]
        });
        console.log('✅ Created sample cart\n');

        // Create sample orders
        console.log('📦 Creating sample orders...');
        await Order.bulkCreate([
            {
                order_id: 'order_test_001',
                user_id: 'user_test_001',
                cart_items: [
                    { productId: 1, quantity: 3, price: 4.99 },
                    { productId: 2, quantity: 1, price: 8.99 }
                ],
                delivery_address: {
                    street: '123 Main St',
                    city: 'New York',
                    state: 'NY',
                    zipCode: '10001',
                    country: 'USA'
                },
                status: 'Delivered',
                total_amount: 23.96
            },
            {
                order_id: 'order_test_002',
                user_id: 'user_test_002',
                cart_items: [
                    { productId: 5, quantity: 1, price: 15.99 }
                ],
                delivery_address: {
                    street: '456 Oak Ave',
                    city: 'Los Angeles',
                    state: 'CA',
                    zipCode: '90001',
                    country: 'USA'
                },
                status: 'Pending',
                total_amount: 15.99
            }
        ]);
        console.log('✅ Created sample orders\n');

        // Create sample contact messages
        console.log('✉️  Creating sample contact messages...');
        await ContactMessage.bulkCreate([
            {
                full_name: 'Alice Johnson',
                email: 'alice@example.com',
                message: 'I love your chocolate chip cookies! Do you offer bulk orders?',
                date: new Date()
            },
            {
                full_name: 'Bob Wilson',
                email: 'bob@example.com',
                message: 'What are your store hours?',
                date: new Date()
            }
        ]);
        console.log('✅ Created sample contact messages\n');

        // Create sample favorites
        console.log('⭐ Creating sample favorites...');
        await Favorite.bulkCreate([
            {
                user_id: 'user_test_001',
                product_id: 1
            },
            {
                user_id: 'user_test_001',
                product_id: 5
            },
            {
                user_id: 'user_test_002',
                product_id: 2
            }
        ]);
        console.log('✅ Created sample favorites\n');

        // Display summary
        console.log('📊 Seeding Summary:');
        console.log(`   Users: ${await User.count()}`);
        console.log(`   Products: ${await Product.count()}`);
        console.log(`   Orders: ${await Order.count()}`);
        console.log(`   Carts: ${await Cart.count()}`);
        console.log(`   Contact Messages: ${await ContactMessage.count()}`);
        console.log(`   Favorites: ${await Favorite.count()}`);

        console.log('\n✅ Database seeding completed successfully!');
        console.log('\n🎯 You can now:');
        console.log('   1. Start the server: npm start');
        console.log('   2. Test endpoints with Postman');
        console.log('   3. Login with: john.doe@example.com or jane.smith@example.com');

    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

// Run the seeder
seedDatabase();
