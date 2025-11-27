# Baked Bliss Backend - Quick Start Guide

## Prerequisites
- Node.js (v14 or higher)
- MySQL or MariaDB installed and running
- npm or yarn package manager

## Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
cd BakedBliss-backend
npm install
```

### 2. Setup Database
```bash
# Login to MySQL
mysql -u root -p

# Create database and user (copy and paste these commands)
CREATE DATABASE baked_bliss_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'baked_bliss_user'@'localhost' IDENTIFIED BY 'BakedBliss2024!';
GRANT ALL PRIVILEGES ON baked_bliss_dev.* TO 'baked_bliss_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Configure Environment
```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your favorite editor
nano .env  # or vim .env or code .env
```

Update these values in `.env`:
```env
DB_USER=baked_bliss_user
DB_PASSWORD=BakedBliss2024!
DB_NAME=baked_bliss_dev
JWT_SECRET=your_random_secret_key_here_change_this
```

### 4. Run Database Migrations
```bash
# Create all database tables
npm run db:migrate
```

### 5. Start the Server
```bash
# Development mode (with auto-reload)
npm start

# Production mode
npm run start:prod
```

You should see:
```
✅ Database connection has been established successfully.
✅ All models were synchronized successfully.
Server running on http://localhost:3000
```

## Verify Installation

Test the health endpoint:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"UP"}
```

## Available Scripts

- `npm start` - Start development server with nodemon
- `npm run start:prod` - Start production server
- `npm run db:migrate` - Run database migrations
- `npm run db:migrate:undo` - Rollback last migration
- `npm run db:seed` - Seed database with test data

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Create new user
- `POST /api/v1/auth/signin` - Sign in user
- `POST /api/v1/auth/social-login` - Social media login

### Products
- `GET /api/v1/products` - List all products
- `GET /api/v1/products/search` - Search products
- `GET /api/v1/products/:product_id` - Get product by ID
- `GET /api/v1/products/category/:category_name` - Get products by category
- `POST /api/v1/products` - Create new product (admin)

### Cart
- `POST /api/v1/cart/add` - Add item to cart
- `GET /api/v1/cart` - View cart
- `PUT /api/v1/cart/update` - Update cart item
- `DELETE /api/v1/cart/remove` - Remove item from cart

### Orders
- `POST /api/v1/order/confirm` - Place order
- `GET /api/v1/order/history` - View order history
- `GET /api/v1/order/:orderId` - Get order status

### User Profile
- `GET /api/v1/users/profile/:user_id` - Get user profile

### Address Management
- `POST /api/v1/address` - Add new address
- `GET /api/v1/address` - View all addresses
- `PUT /api/v1/address` - Update address
- `DELETE /api/v1/address` - Delete address

### Contact
- `POST /api/v1/contact` - Submit contact form

## Common Issues

### "Unable to connect to the database"
- Check if MySQL is running: `sudo systemctl status mysql`
- Verify credentials in `.env` file
- Ensure database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### "Unknown database"
- Run the CREATE DATABASE command from step 2 again

### "Access denied for user"
- Check DB_USER and DB_PASSWORD in `.env`
- Ensure MySQL user has been created with GRANT ALL PRIVILEGES

### Port already in use
- Change PORT in `.env` file
- Or kill the process using port 3000:
  ```bash
  sudo lsof -ti:3000 | xargs kill -9
  ```

## Next Steps

1. **Read the full documentation**: See `MIGRATION_GUIDE.md` for detailed information
2. **Test the API**: Import `postman_collection.json` into Postman
3. **Configure production**: Update `.env` for production environment
4. **Add SSL**: Configure HTTPS for production deployment

## Project Structure

```
BakedBliss-backend/
├── config/               # Configuration files
│   ├── database.js      # Database config
│   └── sequelizeConfig.js  # Sequelize initialization
├── modules/             # Feature modules
│   ├── auth/           # Authentication
│   ├── products/       # Product management
│   ├── cart/           # Shopping cart
│   ├── orders/         # Order management
│   ├── user/           # User profile
│   ├── address/        # Address management
│   └── contact/        # Contact form
├── schema/             # Database models
├── migrations/         # Database migrations
├── middleware/         # Custom middleware
├── index.js           # Main server file
└── .env               # Environment variables (create this)
```

## Support

For more detailed information, see:
- `MIGRATION_GUIDE.md` - Complete migration documentation
- `ENDPOINTS.md` - API endpoint documentation
- `README.md` - Project README

---

**Status**: ✅ Ready to use with Sequelize/MySQL
**Database**: MySQL/MariaDB
**ORM**: Sequelize v6
