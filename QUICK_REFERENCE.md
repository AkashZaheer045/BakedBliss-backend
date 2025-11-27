# BakedBliss Backend - Quick Reference

## Project Structure (Standardized)

```
BakedBliss-backend/
├── app.js                          # Main application entry point
├── package.json                    # Dependencies & scripts
├── .nvmrc                          # Node version (20)
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
│       ├── cart/                  # Cart module
│       ├── orders/                # Orders module
│       ├── contact/               # Contact module
│       ├── address/               # Address module
│       └── user/                  # User module
│
├── db/                            # Database layer
│   ├── schemas/                   # Sequelize model definitions
│   │   ├── users.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   └── ...
│   ├── sequelize/                 # Sequelize configuration
│   │   ├── associations.js
│   │   ├── connection.js
│   │   ├── instance.js
│   │   └── sequelize.js
│   └── migrations/                # Database migrations
│
├── middleware/                    # Cross-cutting middleware
│   ├── authMiddleware.js         # Authentication
│   └── response_handler.js       # Error handling
│
├── utils/                         # Framework-agnostic utilities
│   ├── response.js               # Response helpers
│   └── custom_exceptions.json    # Error definitions
│
├── helpers/                       # Pure utility functions
│   └── pagination.js
│
├── config/                        # Configuration
│   ├── database.js               # Database config
│   └── sequelizeConfig.js        # Sequelize setup
│
├── views/                         # Templates
│   └── emails/                   # Email templates
│
├── docs/                          # Documentation
│   └── nodejs-standardization.md
│
└── scripts/                       # Utility scripts
    ├── migrateFirebaseData.js
    └── seedDatabase.js
```

## NPM Scripts

```bash
# Development (with hot reload)
npm run dev

# Production
npm start

# Database migrations
npm run db:migrate          # Run migrations
npm run db:migrate:undo     # Rollback last migration
npm run db:seed             # Seed database
```

## Import Paths (from module controllers/routes)

```javascript
// Database models
const { models } = require('../../../../config/sequelizeConfig');

// Middleware
const authMiddleware = require('../../../../middleware/authMiddleware');

// Utilities
const { sendSuccess, sendError } = require('../../../../utils/response');

// Cross-module (relative)
const { getUserProfile } = require('../../user/controllers/userProfileController');
```

## Module Structure Template

When creating a new module:

```
src/modules/my-module/
├── app.js              # Module exports
├── controllers/        # HTTP handlers
│   └── myController.js
├── routes/            # Route definitions
│   └── myRoutes.js
├── services/          # Business logic
│   └── myService.js
└── validations/       # Input validation
    └── myValidation.js
```

## Response Helpers

```javascript
const { 
  sendSuccess, 
  sendError, 
  sendCreated,
  sendNotFound 
} = require('../../../../utils/response');

// Success response
sendSuccess(res, data, { pagination: {...} });

// Error response
sendError(res, 'Error message', 400);

// Created (201)
sendCreated(res, newResource);

// Not found (404)
sendNotFound(res, 'Resource not found');
```

## Error Handling

Errors are automatically handled by centralized middleware:

```javascript
// In async controller - just throw
throw new Error('Something went wrong');

// Or use next()
next(error);

// Custom error with status code
const error = new Error('Not found');
error.statusCode = 404;
throw error;
```

## Environment Variables

Required in `.env`:

```bash
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=bakedbliss
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
```

## Key Changes from Old Structure

| Old Path | New Path |
|---------|----------|
| `index.js` | `app.js` |
| `modules/` | `src/modules/` |
| `schema/` | `db/schemas/` |
| `sequelize/` | `db/sequelize/` |
| `migrations/` | `db/migrations/` |
| N/A | `utils/` (new) |
| N/A | `views/` (new) |
| N/A | `docs/` (new) |

## Common Tasks

### Start Development Server
```bash
npm run dev
```

### Access Database Models
```javascript
const { models } = require('../../../../config/sequelizeConfig');
const { User, Product, Order } = models;
```

### Add New Route
1. Create route file in `src/modules/[module]/routes/`
2. Create controller in `src/modules/[module]/controllers/`
3. Import route in `app.js`
4. Register with `app.use('/api/v1/...', routes)`

### Create Migration
```bash
npm run db:migrate
```

## Documentation Links

- **Standardization Guide**: `docs/nodejs-standardization.md`
- **Migration Summary**: `STANDARDIZATION_MIGRATION.md`
- **Quick Start**: `QUICKSTART.md`
- **API Endpoints**: `ENDPOINTS.md`

## Troubleshooting

### Module not found error
- Check import paths - they should now go up 4 levels (`../../../../`) from module controllers/routes
- Ensure you're using the correct path for new structure

### Database connection error
- Check `.env` file for correct database credentials
- Ensure MySQL is running
- Verify database exists

### Port already in use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

## Standards & Best Practices

✅ Use CommonJS (`require`/`module.exports`)
✅ Use async/await (no callbacks)
✅ Keep controllers thin (coordination only)
✅ Business logic in services
✅ Use centralized error handling
✅ Use standardized response helpers
✅ Validate inputs in validation layer
✅ Document environment variables

## Next Steps

1. Move business logic to services
2. Add validation schemas
3. Set up ESLint & Prettier
4. Add unit tests
5. Update documentation
