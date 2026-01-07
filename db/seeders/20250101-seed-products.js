'use strict';

module.exports = {
    up: async (queryInterface, _Sequelize) => {
        const categories = [
            'Pastries',
            'Breads',
            'Desserts',
            'Cupcakes',
            'Pizza',
            'Burger',
            'Cookies',
            'Snacks',
            'Pasta'
        ];
        const products = [];

        // Helpers
        const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        const randomItem = arr => arr[Math.floor(Math.random() * arr.length)];
        const randomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(2);

        const adjectives = [
            'Fresh',
            'Delicious',
            'Hot',
            'Spicy',
            'Sweet',
            'Crunchy',
            'Homemade',
            'Cheesy',
            'Savory',
            'Premium',
            'Tasty',
            'Crispy',
            'Fluffy',
            'Oven-Baked'
        ];

        // Noun map per category
        const nouns = {
            Pastries: [
                'Croissant',
                'Danish',
                'Puff',
                'Tart',
                'Eclair',
                'Turnover',
                'Strudel',
                'Bear Claw'
            ],
            Breads: [
                'Loaf',
                'Baguette',
                'Bun',
                'Sourdough',
                'Rye',
                'Focaccia',
                'Ciabatta',
                'Brioche'
            ],
            Desserts: [
                'Cake',
                'Pie',
                'Mousse',
                'Brownie',
                'Pudding',
                'Tiramisu',
                'Cheesecake',
                'Custard'
            ],
            Cupcakes: [
                'Vanilla Cupcake',
                'Chocolate Cupcake',
                'Red Velvet',
                'Berry Cupcake',
                'Lemon Drop',
                'Caramel Swirl'
            ],
            Pizza: [
                'Pizza',
                'Slice',
                'Deep Dish',
                'Flatbread',
                'Margherita',
                'Pepperoni',
                'Veggie Supreme'
            ],
            Burger: [
                'Burger',
                'Cheeseburger',
                'Slider',
                'Whopper',
                'Patty Melt',
                'Veggie Burger',
                'Chicken Sandwich'
            ],
            Cookies: [
                'Cookie',
                'Biscuit',
                'Macaron',
                'Wafer',
                'Choc Chip',
                'Oatmeal Raisin',
                'Shortbread'
            ],
            Snacks: ['Chips', 'Pretzels', 'Popcorn', 'Nachos', 'Crackers', 'Mix', 'Protein Bar'],
            Pasta: [
                'Spaghetti',
                'Penne',
                'Fusilli',
                'Lasagna',
                'Ravioli',
                'Fettuccine',
                'Macaroni',
                'Linguine'
            ]
        };

        const ingredientsList = [
            'Flour',
            'Sugar',
            'Butter',
            'Eggs',
            'Milk',
            'Chocolate',
            'Vanilla',
            'Yeast',
            'Salt',
            'Cheese',
            'Tomato',
            'Basil',
            'Garlic',
            'Olive Oil',
            'Pepper'
        ];

        for (let i = 0; i < 200; i++) {
            const cat = randomItem(categories);
            const adj = randomItem(adjectives);
            const nounList = nouns[cat] || ['Delight'];
            const noun = randomItem(nounList);
            const title = `${adj} ${noun} ${randomInt(1, 99)}`; // Add number to make unique

            const price = parseFloat(randomFloat(5, 50));
            let sale_price = null;
            if (Math.random() > 0.7) {
                sale_price = parseFloat((price * 0.8).toFixed(2));
            }

            const productIngredients = [];
            const numIngredients = randomInt(3, 8);
            for (let j = 0; j < numIngredients; j++) {
                productIngredients.push(randomItem(ingredientsList));
            }
            // Unique ingredients
            const uniqueIngredients = [...new Set(productIngredients)];

            // Image URL: real images via loremflickr
            const imgUrl = `https://loremflickr.com/600/400/${cat.toLowerCase()}?lock=${i}`;

            products.push({
                title: title,
                description: `Experience the taste of our ${adj.toLowerCase()} ${noun.toLowerCase()}. Made with the finest ingredients including ${uniqueIngredients.slice(0, 3).join(', ')}. Perfect for any occasion.`,
                price: price,
                sale_price: sale_price,
                category: cat.toLowerCase(), // Frontend expects lowercase normally (e.g. 'pastries') or maps it. DB migration uses string. Products.tsx expects lowercase for filters?
                // Wait, Menu.tsx categories valid IDs: 'pastries', 'breads'.
                // I should store lowercase category ID or capitalized Label?
                // Menu.tsx: const categories = [{id: 'pastries'...}].
                // ProductService filters matches `product.category === selectedCategory`.
                // So I should store lowercase matched ID.
                stock: randomInt(0, 100),
                thumbnail: imgUrl,
                images: JSON.stringify([imgUrl, imgUrl]), // Two images
                ingredients: JSON.stringify(uniqueIngredients),
                rating: randomFloat(3.5, 5.0),
                rating_count: randomInt(10, 500),
                created_at: new Date(),
                updated_at: new Date()
            });
        }

        await queryInterface.bulkInsert('products', products, {});
    },

    down: async (queryInterface, _Sequelize) => {
        await queryInterface.bulkDelete('products', null, {});
    }
};
