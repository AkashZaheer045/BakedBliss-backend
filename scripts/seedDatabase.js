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
    // ========== PASTRIES ==========
    {
        title: 'Classic Chocolate Croissant',
        price: 4.99,
        sale_price: 3.99,
        thumbnail: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
        rating: 4.8,
        category: 'Pastries',
        rating_count: 124,
        ingredients: ['flour', 'butter', 'dark chocolate', 'eggs', 'yeast', 'sugar'],
        description:
            'Buttery, flaky pastry filled with rich Belgian chocolate. A classic French treat perfect for breakfast or dessert.',
        tagline: 'Classic French indulgence',
        images: [
            'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800',
            'https://images.unsplash.com/photo-1558326567-98166e232c77?w=800'
        ],
        stock: 50
    },
    {
        title: 'Butter Croissant',
        price: 3.49,
        thumbnail: 'https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?w=400',
        rating: 4.9,
        category: 'Pastries',
        rating_count: 256,
        ingredients: ['flour', 'butter', 'eggs', 'yeast', 'sugar', 'salt'],
        description:
            'Light, flaky layers of pure butter goodness. Our signature croissant is made with premium European butter.',
        tagline: 'Pure butter perfection',
        images: ['https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?w=800'],
        stock: 80
    },
    {
        title: 'Almond Croissant',
        price: 5.49,
        thumbnail: 'https://images.unsplash.com/photo-1623334044303-241021148842?w=400',
        rating: 4.7,
        category: 'Pastries',
        rating_count: 98,
        ingredients: ['flour', 'butter', 'almonds', 'almond cream', 'eggs', 'sugar'],
        description:
            'Croissant filled with almond cream and topped with sliced almonds and powdered sugar.',
        tagline: 'Nutty indulgence',
        images: ['https://images.unsplash.com/photo-1623334044303-241021148842?w=800'],
        stock: 40
    },
    {
        title: 'Danish Pastry',
        price: 4.29,
        thumbnail: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=400',
        rating: 4.6,
        category: 'Pastries',
        rating_count: 87,
        ingredients: ['flour', 'butter', 'fruit jam', 'cream cheese', 'eggs'],
        description:
            'Flaky pastry with fruit filling and cream cheese, finished with a sweet glaze.',
        tagline: 'Danish delight',
        images: ['https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=800'],
        stock: 35
    },
    {
        title: 'Cinnamon Roll',
        price: 4.99,
        sale_price: 4.29,
        thumbnail: 'https://images.unsplash.com/photo-1609126979532-c48ce8a70add?w=400',
        rating: 4.8,
        category: 'Pastries',
        rating_count: 178,
        ingredients: ['flour', 'butter', 'cinnamon', 'brown sugar', 'cream cheese frosting'],
        description:
            'Soft, gooey cinnamon roll swirled with cinnamon sugar and topped with cream cheese frosting.',
        tagline: 'Warm cinnamon heaven',
        images: ['https://images.unsplash.com/photo-1609126979532-c48ce8a70add?w=800'],
        stock: 45
    },

    // ========== BREADS ==========
    {
        title: 'Artisan Sourdough Bread',
        price: 8.99,
        thumbnail: 'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=400',
        rating: 4.9,
        category: 'Breads',
        rating_count: 312,
        ingredients: ['flour', 'water', 'salt', 'sourdough starter'],
        description:
            'Traditional sourdough with a perfectly crispy crust and soft, tangy interior. 24-hour fermentation.',
        tagline: 'Artisan crafted perfection',
        images: [
            'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=800',
            'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800'
        ],
        stock: 25
    },
    {
        title: 'French Baguette',
        price: 4.49,
        thumbnail: 'https://images.unsplash.com/photo-1568471173242-461f0a730452?w=400',
        rating: 4.8,
        category: 'Breads',
        rating_count: 234,
        ingredients: ['flour', 'water', 'yeast', 'salt'],
        description:
            'Crispy golden crust with a light, airy interior. Baked fresh daily using traditional French techniques.',
        tagline: 'Authentically French',
        images: ['https://images.unsplash.com/photo-1568471173242-461f0a730452?w=800'],
        stock: 40
    },
    {
        title: 'Whole Wheat Loaf',
        price: 6.99,
        thumbnail: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=400',
        rating: 4.5,
        category: 'Breads',
        rating_count: 156,
        ingredients: ['whole wheat flour', 'water', 'honey', 'yeast', 'salt'],
        description:
            'Hearty whole wheat bread made with 100% whole grain flour. Perfect for sandwiches and toast.',
        tagline: 'Healthy and hearty',
        images: ['https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=800'],
        stock: 30
    },
    {
        title: 'Ciabatta Bread',
        price: 5.99,
        thumbnail: 'https://images.unsplash.com/photo-1574085733277-851d9d856a3a?w=400',
        rating: 4.7,
        category: 'Breads',
        rating_count: 145,
        ingredients: ['flour', 'water', 'olive oil', 'yeast', 'salt'],
        description:
            'Italian-style bread with a light, airy interior and crispy crust. Perfect for paninis.',
        tagline: 'Italian classic',
        images: ['https://images.unsplash.com/photo-1574085733277-851d9d856a3a?w=800'],
        stock: 35
    },
    {
        title: 'Multigrain Loaf',
        price: 7.49,
        thumbnail: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400',
        rating: 4.6,
        category: 'Breads',
        rating_count: 98,
        ingredients: ['wheat flour', 'oats', 'sunflower seeds', 'flax seeds', 'honey'],
        description: 'Nutritious blend of whole grains and seeds. Rich in fiber and flavor.',
        tagline: 'Packed with goodness',
        images: ['https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=800'],
        stock: 25
    },

    // ========== DESSERTS ==========
    {
        title: 'Strawberry Cheesecake Slice',
        price: 6.99,
        sale_price: 5.99,
        thumbnail: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400',
        rating: 4.8,
        category: 'Desserts',
        rating_count: 189,
        ingredients: ['cream cheese', 'strawberries', 'graham crackers', 'sugar', 'eggs'],
        description: 'Creamy New York style cheesecake topped with fresh strawberry glaze.',
        tagline: 'Creamy strawberry bliss',
        images: ['https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800'],
        stock: 20
    },
    {
        title: 'Rainbow Macarons Box',
        price: 12.99,
        thumbnail: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=400',
        rating: 4.9,
        category: 'Desserts',
        rating_count: 267,
        ingredients: ['almond flour', 'egg whites', 'sugar', 'various fillings'],
        description:
            'Assorted French macarons in raspberry, vanilla, pistachio, chocolate, and lavender flavors.',
        tagline: 'Six flavors of joy',
        images: [
            'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=800',
            'https://images.unsplash.com/photo-1558326567-98ae2405596b?w=800'
        ],
        stock: 30
    },
    {
        title: 'Tiramisu',
        price: 7.99,
        thumbnail: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
        rating: 4.9,
        category: 'Desserts',
        rating_count: 198,
        ingredients: ['mascarpone', 'espresso', 'ladyfingers', 'cocoa', 'eggs'],
        description:
            'Classic Italian dessert with layers of espresso-soaked ladyfingers and creamy mascarpone.',
        tagline: 'Pick me up in a cup',
        images: ['https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800'],
        stock: 15
    },
    {
        title: 'Chocolate Brownie',
        price: 4.49,
        thumbnail: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400',
        rating: 4.7,
        category: 'Desserts',
        rating_count: 321,
        ingredients: ['dark chocolate', 'butter', 'sugar', 'flour', 'eggs', 'walnuts'],
        description:
            'Rich, fudgy brownies made with premium dark chocolate and topped with walnuts.',
        tagline: 'Fudgy chocolate heaven',
        images: ['https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=800'],
        stock: 60
    },
    {
        title: 'Crème Brûlée',
        price: 8.49,
        thumbnail: 'https://images.unsplash.com/photo-1470324161839-ce2bb6fa6bc3?w=400',
        rating: 4.8,
        category: 'Desserts',
        rating_count: 145,
        ingredients: ['cream', 'egg yolks', 'vanilla', 'sugar'],
        description: 'Silky vanilla custard with a caramelized sugar crust. Created fresh daily.',
        tagline: 'Crack into perfection',
        images: ['https://images.unsplash.com/photo-1470324161839-ce2bb6fa6bc3?w=800'],
        stock: 18
    },
    {
        title: 'Chocolate Lava Cake',
        price: 7.99,
        sale_price: 6.99,
        thumbnail: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
        rating: 4.9,
        category: 'Desserts',
        rating_count: 234,
        ingredients: ['dark chocolate', 'butter', 'eggs', 'sugar', 'flour'],
        description: 'Warm chocolate cake with a molten center. Served with vanilla ice cream.',
        tagline: 'Melting moments',
        images: ['https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800'],
        stock: 22
    },

    // ========== CUPCAKES ==========
    {
        title: 'Red Velvet Cupcake',
        price: 4.49,
        thumbnail: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400',
        rating: 4.8,
        category: 'Cupcakes',
        rating_count: 198,
        ingredients: ['flour', 'cocoa', 'red food coloring', 'cream cheese frosting', 'butter'],
        description: 'Classic red velvet cupcake with creamy cream cheese frosting.',
        tagline: 'Velvety smooth perfection',
        images: ['https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=800'],
        stock: 48
    },
    {
        title: 'Chocolate Fudge Cupcake',
        price: 4.29,
        thumbnail: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400',
        rating: 4.7,
        category: 'Cupcakes',
        rating_count: 167,
        ingredients: ['dark chocolate', 'flour', 'butter', 'eggs', 'chocolate ganache'],
        description: 'Rich chocolate cupcake topped with silky chocolate ganache.',
        tagline: 'Double chocolate delight',
        images: ['https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=800'],
        stock: 55
    },
    {
        title: 'Vanilla Bean Cupcake',
        price: 3.99,
        thumbnail: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=400',
        rating: 4.6,
        category: 'Cupcakes',
        rating_count: 143,
        ingredients: ['flour', 'vanilla bean', 'butter', 'eggs', 'buttercream frosting'],
        description: 'Light and fluffy vanilla cupcake with real vanilla bean buttercream.',
        tagline: 'Simple vanilla bliss',
        images: ['https://images.unsplash.com/photo-1519869325930-281384150729?w=800'],
        stock: 70
    },
    {
        title: 'Salted Caramel Cupcake',
        price: 4.79,
        thumbnail: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=400',
        rating: 4.9,
        category: 'Cupcakes',
        rating_count: 212,
        ingredients: ['flour', 'caramel', 'sea salt', 'butter', 'brown sugar'],
        description: 'Sweet and salty perfection with caramel filling and salted caramel frosting.',
        tagline: 'Sweet meets salty',
        images: ['https://images.unsplash.com/photo-1587668178277-295251f900ce?w=800'],
        stock: 42
    },
    {
        title: 'Lemon Zest Cupcake',
        price: 4.49,
        thumbnail: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400',
        rating: 4.5,
        category: 'Cupcakes',
        rating_count: 89,
        ingredients: ['flour', 'lemon zest', 'lemon curd', 'butter', 'cream cheese'],
        description:
            'Bright and zesty lemon cupcake with lemon curd filling and cream cheese frosting.',
        tagline: 'Citrus sunshine',
        images: ['https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800'],
        stock: 38
    },
    {
        title: 'Strawberry Shortcake Cupcake',
        price: 4.99,
        thumbnail: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400',
        rating: 4.7,
        category: 'Cupcakes',
        rating_count: 156,
        ingredients: ['flour', 'strawberries', 'whipped cream', 'vanilla', 'butter'],
        description:
            'Light vanilla cupcake filled with fresh strawberries and topped with whipped cream.',
        tagline: 'Summer in a cupcake',
        images: ['https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800'],
        stock: 35
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
                cart_items: [{ productId: 5, quantity: 1, price: 15.99 }],
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
