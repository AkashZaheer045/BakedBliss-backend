# 🍰 BakedBliss Backend API

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21.0-blue.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![Sequelize](https://img.shields.io/badge/Sequelize-6.33.0-52B0E7.svg)](https://sequelize.org/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

A robust, scalable backend API for the **BakedBliss** e-commerce platform - your complete solution for online bakery management. Built with modern technologies following Node.js standardization best practices to provide seamless user experiences for browsing, ordering, and managing baked goods, spices, and more.

## 📖 About BakedBliss Backend

**BakedBliss Backend** is a comprehensive e-commerce backend system designed specifically for bakery and food delivery applications. This project serves as the backbone for the BakedBliss platform, offering a seamless online experience for customers to browse, order, and manage their favorite baked goods, spices, and related products.

### 🎯 **Project Purpose**
The BakedBliss backend is built to handle the complete customer journey from product discovery to order fulfillment. It provides a robust foundation for online bakery businesses, enabling them to offer their products through web and mobile applications with enterprise-grade reliability and security.

### 🏢 **Business Value**
- **Complete E-commerce Solution**: End-to-end order management from browsing to delivery
- **Multi-Platform Support**: Seamless integration with web and mobile applications
- **Real-time Operations**: Live order tracking and instant notifications
- **Scalable Architecture**: Built to handle growing customer bases and product catalogs
- **Secure Transactions**: Enterprise-grade security for user data and payments

### 🔧 **Technical Excellence**
Built with modern web technologies and best practices, the BakedBliss backend leverages:
- **MySQL Database**: Reliable relational database for structured data management
- **Sequelize ORM**: Modern ORM for elegant database interactions
- **Express.js Framework**: Fast, unopinionated web framework for Node.js
- **JWT Authentication**: Secure token-based user authentication
- **RESTful API Design**: Clean, predictable API endpoints
- **Standardized Structure**: Follows Node.js best practices and conventions

### 🌟 **Key Capabilities**
The system provides comprehensive functionality including user authentication, product management, shopping cart operations, order processing, address management, and customer support. Each component is designed with scalability, security, and performance in mind, ensuring a smooth experience for both customers and business operators.

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Security Features](#-security-features)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🔐 Authentication & User Management
- **Multi-Platform Authentication**: Email, Google, and Facebook login
- **Secure User Profiles**: Complete user data management with MySQL
- **JWT Token Security**: Protected routes with middleware verification
- **Social Login Integration**: Seamless OAuth with major platforms
- **User Favorites**: Save and manage favorite products

### 🛍️ E-commerce Core Features
- **Product Catalog**: Comprehensive product management system
- **Advanced Search**: Search by title and category with pagination
- **Category Filtering**: Browse products by specific categories
- **Product Details**: Rich product information with ingredients and allergens
- **Trending Products**: Popular product recommendations
- **Stock Management**: Real-time inventory tracking

### 🛒 Shopping Cart System
- **Dynamic Cart Management**: Add, update, and remove items
- **Quantity Control**: Flexible quantity management
- **User-specific Carts**: Individual cart for each user
- **Real-time Updates**: Instant cart synchronization
- **Cart Persistence**: Saved cart across sessions

### 📦 Order Management
- **Order Processing**: Complete order lifecycle management
- **Order History**: Comprehensive order tracking
- **Status Updates**: Real-time order status tracking
- **Delivery Management**: Address-based delivery system
- **Order Details**: Complete order information with items

### 🏠 Address Management
- **Multiple Addresses**: Store multiple delivery addresses
- **Default Address**: Set preferred delivery location
- **Address Selection**: Choose address per order
- **CRUD Operations**: Full address management

### 💬 Customer Support
- **Contact System**: Handle customer inquiries
- **Support Tickets**: Track customer issues
- **Response Management**: Efficient customer service workflow

## 🏗️ Architecture

### System Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   MySQL         │
│   (Mobile/Web)  │◄──►│   (Node.js)     │◄──►│   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Sequelize     │
                       │   (ORM)         │
                       └─────────────────┘
```

### Data Flow
1. **Client Request** → Express.js Router
2. **Authentication** → JWT Verification Middleware
3. **Routing** → Module-specific Routes
4. **Business Logic** → Service Layer
5. **Data Access** → Sequelize ORM
6. **Database** → MySQL
7. **Response** → Standardized JSON Response

### Architecture Principles
- **Vertical Slice Architecture**: Features organized by domain modules
- **Separation of Concerns**: Clear separation between routes, controllers, services
- **Centralized Error Handling**: Consistent error responses
- **Standardized Responses**: Uniform API response structure

## 🛠️ Technology Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Runtime** | Node.js | 20.x | JavaScript runtime (LTS) |
| **Framework** | Express.js | 4.21.0 | Web application framework |
| **Database** | MySQL | 8.0+ | Relational database |
| **ORM** | Sequelize | 6.33.0 | Object-relational mapping |
| **Authentication** | JWT | 9.0.2 | Token-based authentication |
| **Security** | Helmet.js | 8.0.0 | HTTP headers security |
| **CORS** | CORS | 2.8.5 | Cross-origin resource sharing |
| **Logging** | Morgan | 1.10.0 | HTTP request logger |
| **Environment** | dotenv | 16.4.5 | Environment variables |
| **Development** | Nodemon | 3.1.7 | Auto-restart development server |

## 🚀 Installation

### Prerequisites
- Node.js (v20 or higher) - [Download](https://nodejs.org/)
- MySQL (v8.0 or higher) - [Download](https://www.mysql.com/)
- npm (comes with Node.js)

### Step 1: Clone the Repository
```bash
git clone https://github.com/Code-Crafterspk/BakedBliss-backend.git
cd BakedBliss-backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Database Setup
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE bakedbliss;
exit;

# Run migrations
npm run db:migrate

# (Optional) Seed database with sample data
npm run db:seed
```

### Step 4: Environment Configuration
Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=bakedbliss
DB_USER=root
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Optional: Additional Configuration
LOG_LEVEL=info
```

### Step 5: Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## ⚙️ Configuration

### Environment Variables
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port number | No | 3000 |
| `NODE_ENV` | Environment (development/production) | No | development |
| `DB_HOST` | MySQL host | Yes | localhost |
| `DB_PORT` | MySQL port | No | 3306 |
| `DB_NAME` | Database name | Yes | bakedbliss |
| `DB_USER` | Database user | Yes | root |
| `DB_PASSWORD` | Database password | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `JWT_EXPIRES_IN` | JWT expiration time | No | 24h |

### Database Configuration
The database configuration is managed in `config/database.js`. It supports multiple environments:
- **Development**: Local MySQL instance
- **Production**: Production database with connection pooling
- **Test**: Separate test database

## 📁 Project Structure

```
BakedBliss-backend/
├── app.js                          # Main application entry point
├── package.json                    # Dependencies and scripts
├── .nvmrc                          # Node.js version specification
├── .env                            # Environment variables (not in git)
├── .env.example                    # Environment template
│
├── src/                            # Source code
│   └── modules/                    # Feature modules (vertical slices)
│       ├── auth/                   # Authentication module
│       │   ├── app.js             # Module entry point
│       │   ├── controllers/       # HTTP request handlers
│       │   ├── routes/            # Route definitions
│       │   ├── services/          # Business logic
│       │   └── validations/       # Input validation
│       ├── products/              # Products module
│       │   ├── controllers/
│       │   │   ├── productController.js
│       │   │   ├── productUploadController.js
│       │   │   └── trendingProductsController.js
│       │   ├── routes/
│       │   ├── services/
│       │   └── validations/
│       ├── cart/                  # Shopping cart module
│       ├── orders/                # Order management module
│       ├── address/               # Address management module
│       ├── contact/               # Customer support module
│       └── user/                  # User profile module
│           ├── controllers/
│           │   ├── userProfileController.js
│           │   └── favoritesController.js
│           ├── routes/
│           ├── services/
│           └── validations/
│
├── db/                            # Database layer
│   ├── schemas/                   # Sequelize model definitions
│   │   ├── users.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── carts.js
│   │   ├── contact_messages.js
│   │   └── favorites.js
│   ├── sequelize/                 # Sequelize configuration
│   │   ├── associations.js       # Model associations
│   │   ├── connection.js         # Database connection
│   │   ├── instance.js           # Sequelize instance
│   │   └── sequelize.js          # Sequelize setup
│   └── migrations/                # Database migrations
│
├── middleware/                    # Cross-cutting middleware
│   ├── authMiddleware.js         # JWT authentication
│   └── response_handler.js       # Centralized error handling
│
├── utils/                         # Framework-agnostic utilities
│   ├── response.js               # Standardized response helpers
│   └── custom_exceptions.json    # Error code definitions
│
├── helpers/                       # Pure utility functions
│   └── pagination.js             # Pagination helpers
│
├── config/                        # Configuration
│   ├── database.js               # Database configuration
│   └── sequelizeConfig.js        # Sequelize initialization
│
├── views/                         # Templates
│   └── emails/                   # Email templates
│
├── docs/                          # Documentation
│   └── nodejs-standardization.md # Coding standards
│
└── scripts/                       # Utility scripts
    └── seedDatabase.js           # Database seeding
```

### Module Structure
Each module follows a consistent structure:
```
module-name/
├── app.js              # Module exports
├── controllers/        # HTTP request handlers (thin layer)
├── routes/            # Route definitions
├── services/          # Business logic (to be implemented)
└── validations/       # Input validation schemas (to be implemented)
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Response Format
All API responses follow a standardized format:
```json
{
  "success": true,
  "data": { },
  "meta": {
    "pagination": { }
  }
}
```

Error responses:
```json
{
  "success": false,
  "errors": [
    {
      "code": "ERROR_CODE",
      "message": "Error description"
    }
  ],
  "meta": {
    "timestamp": "2025-11-27T12:00:00.000Z",
    "path": "/api/v1/endpoint"
  }
}
```

### Authentication Endpoints
```
POST   /api/v1/auth/users/register        - User registration
POST   /api/v1/auth/users/signin          - User sign-in
POST   /api/v1/auth/users/social-login    - Social media login
GET    /api/v1/auth/users/profile/:id     - Get user profile (Protected)
```

### Product Endpoints
```
GET    /api/v1/products/search            - Search products
POST   /api/v1/products/upload            - Upload new product (Admin)
GET    /api/v1/products/:product_id       - Get product by ID
GET    /api/v1/products/category/:name    - Get products by category
GET    /api/v1/products/trending          - Get trending products
```

### Cart Endpoints
```
POST   /api/v1/cart/add                   - Add item to cart (Protected)
GET    /api/v1/cart/view                  - View cart (Protected)
PUT    /api/v1/cart/update                - Update cart item (Protected)
DELETE /api/v1/cart/remove                - Remove item from cart (Protected)
```

### Order Endpoints
```
POST   /api/v1/order/confirm              - Place order (Protected)
GET    /api/v1/order/history              - Order history (Protected)
GET    /api/v1/order/status/:orderId      - Order status (Protected)
```

### Address Endpoints
```
POST   /api/v1/address/add                - Add address (Protected)
PUT    /api/v1/address/update             - Update address (Protected)
DELETE /api/v1/address/delete             - Delete address (Protected)
GET    /api/v1/address/view               - View addresses (Protected)
```

### User Endpoints
```
GET    /api/v1/users/favorites            - Get user favorites (Protected)
POST   /api/v1/users/favorites/add        - Add to favorites (Protected)
DELETE /api/v1/users/favorites/remove     - Remove from favorites (Protected)
```

### Contact Endpoints
```
POST   /api/v1/contact/contact-us         - Submit contact form
```

For detailed API documentation with request/response examples, see [ENDPOINTS.md](ENDPOINTS.md)

## 🔒 Security Features

### Authentication & Authorization
- **JWT Token Verification**: All protected routes require valid JWT tokens
- **Token Expiration**: Automatic token expiration and refresh
- **Password Security**: Secure password hashing (to be implemented)
- **Social Login Security**: OAuth 2.0 implementation

### Data Protection
- **Input Validation**: Request data sanitization (to be implemented)
- **CORS Protection**: Configured cross-origin request handling
- **Helmet.js**: Security HTTP headers
- **SQL Injection Prevention**: Sequelize ORM parameterized queries
- **Error Handling**: Secure error responses without sensitive data

### Database Security
- **Connection Pooling**: Optimized database connections
- **Encrypted Connections**: Secure data transmission
- **User Isolation**: Data separation by user ID
- **Prepared Statements**: Protection against SQL injection

### Best Practices
- Environment variables for sensitive data
- No credentials in codebase
- Centralized error handling
- Standardized response format

## 🧪 Development

### Available Scripts
```bash
# Development with hot reload
npm run dev

# Production mode
npm start

# Database migrations
npm run db:migrate          # Run migrations
npm run db:migrate:undo     # Rollback last migration
npm run db:seed             # Seed database
```

### Adding a New Module
1. Create module directory: `src/modules/new-module/`
2. Add required folders:
   ```bash
   mkdir -p src/modules/new-module/{controllers,routes,services,validations}
   ```
3. Create `app.js` in the module
4. Implement routes, controllers, services
5. Register routes in main `app.js`

### Code Standards
This project follows the [Node.js Standardization Guide](docs/nodejs-standardization.md):
- CommonJS modules (`require`/`module.exports`)
- Async/await for asynchronous operations
- Centralized error handling
- Standardized response helpers
- Service layer for business logic
- Validation layer for input validation

### Testing
```bash
# Test health endpoint
curl http://localhost:3000/health

# Test with authentication
curl -X POST http://localhost:3000/api/v1/auth/users/register \
  -H "Content-Type: application/json" \
  -d '{"userId":"test123","fullName":"Test User","email":"test@example.com"}'
```

## 📊 Performance

### Optimization Features
- **Pagination**: Efficient data loading with `helpers/pagination.js`
- **Database Indexing**: Optimized queries
- **Connection Pooling**: Reusable database connections
- **Response Compression**: Reduced payload sizes

### Monitoring
- **Request Logging**: Morgan HTTP logger
- **Error Tracking**: Centralized error handling
- **Health Checks**: `/health` endpoint for monitoring

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'feat: add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow the Node.js Standardization Guide
- Use conventional commits (feat:, fix:, chore:, docs:)
- Write comprehensive tests (when test suite is added)
- Update documentation
- Keep controllers thin - move logic to services
- Add validation schemas for new endpoints

### Code Review Checklist
- [ ] Tests added/updated
- [ ] Environment variables documented
- [ ] No console.logs left behind
- [ ] Error paths handled
- [ ] Security implications considered
- [ ] Documentation updated

## 📝 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Issues**: [GitHub Issues](https://github.com/Code-Crafterspk/BakedBliss-backend/issues)
- **Email**: support@bakedbliss.com
- **Documentation**: 
  - [Quick Reference](QUICK_REFERENCE.md)
  - [Standardization Guide](docs/nodejs-standardization.md)
  - [API Endpoints](ENDPOINTS.md)

## 🙏 Acknowledgments

- **Sequelize Team** for the excellent ORM
- **Express.js Community** for the robust framework
- **Node.js Community** for the amazing runtime
- **MySQL Team** for the reliable database
- **All Contributors** who helped build this project

## 📖 Additional Documentation

- [Quick Reference Guide](QUICK_REFERENCE.md) - Common commands and examples
- [Standardization Migration](STANDARDIZATION_MIGRATION.md) - Migration details
- [Cleanup Summary](CLEANUP_SUMMARY.md) - Recent cleanup changes
- [Node.js Standards](docs/nodejs-standardization.md) - Coding standards

---

<div align="center">
  <p>Made with ❤️ by the BakedBliss Team</p>
  <p>🍰 Delivering happiness, one order at a time 🍰</p>
  <p><strong>Version 2.0</strong> - Rebuilt with modern standards</p>
</div>
