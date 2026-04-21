/**
 * Swagger Configuration - Baked Bliss Backend
 * Centralized API documentation configuration
 * Imports modular specifications from docs/swagger/
 */

const swaggerJsdoc = require('swagger-jsdoc');

// Import modular specs
const commonComponents = require('../docs/swagger/common.spec');
const authSpec = require('../docs/swagger/auth.spec');
const productsSpec = require('../docs/swagger/products.spec');
const cartSpec = require('../docs/swagger/cart.spec');
const ordersSpec = require('../docs/swagger/orders.spec');
const addressSpec = require('../docs/swagger/address.spec');
const usersSpec = require('../docs/swagger/users.spec');

// Merge all path specs
const allPaths = {
    ...authSpec.paths,
    ...productsSpec.paths,
    ...cartSpec.paths,
    ...ordersSpec.paths,
    ...addressSpec.paths,
    ...usersSpec.paths
};

const options = {
    apis: [], // No JSDoc scanning needed - using modular spec files
    definition: {
        openapi: '3.0.0',
        info: {
            title: '🍰 BakedBliss Backend API',
            version: '1.0.0',
            description:
                'RESTful API for BakedBliss bakery e-commerce platform. Complete solution for online bakery management including product catalog, shopping, orders, and user management.',
            contact: {
                name: 'BakedBliss Support',
                url: 'https://github.com/AkashZaheer045/BakedBliss-backend'
            },
            license: {
                name: 'ISC'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000/api/v1',
                description: 'Development Server'
            },
            {
                url: 'https://bakedbliss-backend.vercel.app/api/v1',
                description: 'Production Server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT token for authentication'
                }
            },
            ...commonComponents
        },
        security: [
            {
                bearerAuth: []
            }
        ],
        paths: allPaths,
        tags: [
            { name: 'Authentication', description: 'User authentication and authorization' },
            { name: 'Products', description: 'Product catalog and search' },
            { name: 'Shopping Cart', description: 'Shopping cart management' },
            { name: 'Orders', description: 'Order management' },
            { name: 'Address Management', description: 'Delivery address management' },
            { name: 'User Profile', description: 'User profile management' },
            { name: 'User Favorites', description: 'User favorites management' }
        ]
    }
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
