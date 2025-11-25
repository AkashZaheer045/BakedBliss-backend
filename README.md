# 🍰 BakedBliss Backend API

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21.0-blue.svg)](https://expressjs.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange.svg)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

A robust, scalable backend API for the **BakedBliss** e-commerce platform - your complete solution for online bakery management. Built with modern technologies to provide seamless user experiences for browsing, ordering, and managing baked goods, spices, and more.

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
- **Firebase Firestore**: NoSQL cloud database for flexible data management
- **Express.js Framework**: Fast, unopinionated web framework for Node.js
- **JWT Authentication**: Secure token-based user authentication
- **RESTful API Design**: Clean, predictable API endpoints
- **Real-time Capabilities**: Push notifications and live updates

### 🌟 **Key Capabilities**
The system provides comprehensive functionality including user authentication, product management, shopping cart operations, order processing, address management, and customer support. Each component is designed with scalability, security, and performance in mind, ensuring a smooth experience for both customers and business operators.

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [API Documentation](#-api-documentation)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Security Features](#-security-features)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🔐 Authentication & User Management
- **Multi-Platform Authentication**: Email, Google, and Facebook login
- **Secure User Profiles**: Complete user data management with Firebase
- **Real-time Notifications**: Push token support for instant updates
- **Social Login Integration**: Seamless OAuth with major platforms
- **JWT Token Security**: Protected routes with middleware verification

### 🛍️ E-commerce Core Features
- **Product Catalog**: Comprehensive product management system
- **Advanced Search**: Search by title and category with pagination
- **Category Filtering**: Browse products by specific categories
- **Product Details**: Rich product information with ingredients and allergens
- **Trending Products**: AI-powered product recommendations

### 🛒 Shopping Cart System
- **Dynamic Cart Management**: Add, update, and remove items
- **Quantity Control**: Flexible quantity management
- **User-specific Carts**: Individual cart for each user
- **Real-time Updates**: Instant cart synchronization

### 📦 Order Management
- **Order Processing**: Complete order lifecycle management
- **Order History**: Comprehensive order tracking
- **Status Updates**: Real-time order status tracking
- **Delivery Management**: Address-based delivery system

### 🏠 Address Management
- **Multiple Addresses**: Store multiple delivery addresses
- **Default Address**: Set preferred delivery location
- **Address Selection**: Choose address per order
- **Geolocation Support**: Location-based services

### 💬 Customer Support
- **Contact System**: Handle customer inquiries
- **Support Tickets**: Track customer issues
- **Response Management**: Efficient customer service workflow

## 🏗️ Architecture

### System Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Firebase      │
│   (Mobile/Web)  │◄──►│   (Node.js)     │◄──►│   (Firestore)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Stripe        │
                       │   (Payments)    │
                       └─────────────────┘
```

### Data Flow
1. **Client Request** → Express.js Router
2. **Authentication** → Firebase Auth + JWT Verification
3. **Business Logic** → Controller Layer
4. **Data Persistence** → Firebase Firestore
5. **Response** → JSON API Response

## 🛠️ Technology Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Runtime** | Node.js | 18.x | JavaScript runtime |
| **Framework** | Express.js | 4.21.0 | Web application framework |
| **Database** | Firebase Firestore | Latest | NoSQL cloud database |
| **Authentication** | Firebase Auth | Latest | User authentication |
| **Security** | Helmet.js | 8.0.0 | HTTP headers security |
| **CORS** | CORS | 2.8.5 | Cross-origin resource sharing |
| **Logging** | Morgan | 1.10.0 | HTTP request logger |
| **Environment** | dotenv | 16.4.5 | Environment variables |
| **Development** | Nodemon | 3.1.7 | Auto-restart development server |

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```


### Authentication Endpoints
```
POST /users/register                - User registration
POST /users/signin                  - User sign-in
POST /users/social-login            - Social media login
GET  /users/profile/:user_id        - Get user profile (Protected)
```

### Product Endpoints
```
GET  /search                        - Search products
POST /upload                        - Upload new product
GET  /:product_id                   - Get product by ID
GET  /category/:category_name       - Get products by category
GET  /trending                      - Get trending products
GET  /recommendations/:userId       - Get recommendations (Protected)
```

### Cart Endpoints
```
POST   /add                         - Add item to cart (Protected)
GET    /view                        - View cart (Protected)
PUT    /update                      - Update cart item (Protected)
DELETE /remove                      - Remove item from cart (Protected)
```

### Order Endpoints
```
POST /confirm                       - Place order (Protected)
GET  /history                       - Order history (Protected)
GET  /status/:orderId               - Order status (Protected)
```

### Address Endpoints
```
POST   /add                         - Add address (Protected)
PUT    /update                      - Update address (Protected)
DELETE /delete                      - Delete address (Protected)
GET    /view                        - View addresses (Protected)
```

### Contact Endpoints
```
POST /contact-us                    - Submit contact form
```

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Firebase project with Firestore enabled
- Firebase service account key

### Step 1: Clone the Repository
```bash
git clone https://github.com/Code-Crafterspk/BakedBliss-backend.git
cd BakedBliss-backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Configuration
Create a `.env` file in the root directory:
```env
PORT=3000
NODE_ENV=development
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your-cert-url
```

### Step 4: Firebase Configuration
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Generate a service account key
4. Update the `firebaseConfig.js` file with your credentials

### Step 5: Start the Server
```bash
# Development mode (with auto-restart)
npm start

# Production mode
NODE_ENV=production node index.js
```

## ⚙️ Configuration

### Firebase Setup
```javascript
// config/firebaseConfig.js
const admin = require('firebase-admin');
const serviceAccount = require('./path-to-your-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
module.exports = { admin, db };
```

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port number | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |
| `FIREBASE_*` | Firebase configuration variables | Yes |

## 📁 Project Structure

```
BakedBliss-backend/
├── config/
│   └── firebaseConfig.js          # Firebase configuration
├── controllers/
│   ├── authController.js          # Authentication logic
│   ├── productController.js       # Product management
│   ├── cartController.js          # Shopping cart logic
│   ├── orderController.js         # Order processing
│   ├── addressController.js       # Address management
│   ├── contactController.js       # Customer support
│   ├── productUploadController.js # Product upload
│   ├── trendingProductsController.js # Recommendations
│   └── userProfileController.js   # User profile management
├── middleware/
│   └── authMiddleware.js          # JWT token verification
├── models/
│   ├── productsModel.js           # Product data model
│   └── userModel.js              # User data model
├── routes/
│   ├── authRoutes.js             # Authentication routes
│   ├── productRoutes.js          # Product routes
│   ├── cartRoutes.js             # Cart routes
│   ├── orderRoutes.js            # Order routes
│   ├── addressRoutes.js          # Address routes
│   └── contactRoutes.js          # Contact routes
├── index.js                      # Main application entry
├── package.json                  # Dependencies and scripts
└── README.md                     # Project documentation
```

## 🔒 Security Features

### Authentication & Authorization
- **Firebase Authentication**: Secure user authentication
- **JWT Token Verification**: Protected route middleware
- **Social Login Security**: OAuth 2.0 implementation
- **Token Expiration**: Automatic token refresh

### Data Protection
- **Input Validation**: Request data sanitization
- **CORS Protection**: Cross-origin request handling
- **Helmet.js**: HTTP security headers
- **Error Handling**: Secure error responses

### Database Security
- **Firebase Security Rules**: Database access control
- **Encrypted Connections**: Secure data transmission
- **User Isolation**: Data separation by user

## 🧪 Testing

### API Testing
```bash
# Test health endpoint
curl http://localhost:3000/health

# Test authentication
curl -X POST http://localhost:3000/baseApi/auth/users/register \
  -H "Content-Type: application/json" \
  -d '{"userId":"test123","fullName":"Test User"}'
```

### Load Testing
```bash
# Install artillery for load testing
npm install -g artillery

# Run load test
artillery quick --count 100 --num 10 http://localhost:3000/health
```

## 📊 Performance

### Optimization Features
- **Pagination**: Efficient data loading
- **Caching**: Firebase Firestore caching
- **Compression**: Response compression
- **Connection Pooling**: Database connection optimization

### Monitoring
- **Request Logging**: Morgan HTTP logger
- **Error Tracking**: Comprehensive error handling
- **Performance Metrics**: Response time monitoring

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow ESLint configuration
- Write comprehensive tests
- Update documentation
- Follow conventional commits

## 📝 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Email**: support@bakedbliss.com
- **Issues**: [GitHub Issues](https://github.com/Code-Crafterspk/BakedBliss-backend/issues)
- **Documentation**: [API Docs](https://docs.bakedbliss.com)

## 🙏 Acknowledgments

- **Firebase Team** for the excellent cloud platform
- **Express.js Community** for the robust framework
- **Node.js Community** for the amazing runtime
- **All Contributors** who helped build this project

---

<div align="center">
  <p>Made with ❤️ by the BakedBliss Team</p>
  <p>🍰 Delivering happiness, one order at a time 🍰</p>
</div>
