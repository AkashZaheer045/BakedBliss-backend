# 📚 Swagger API Documentation Setup

## Overview

Swagger documentation for BakedBliss Backend is organized in a **modular, professional structure** for maintainability, scalability, and clean code practices.

## 📂 Structure

```
backend/
├── config/
│   └── swagger.js                 # Main Swagger configuration (orchestrator)
├── docs/
│   └── swagger/                   # Centralized API spec definitions
│       ├── common.spec.js        # Shared schemas & responses
│       ├── auth.spec.js          # Authentication endpoints
│       ├── products.spec.js      # Product catalog endpoints
│       ├── cart.spec.js          # Shopping cart endpoints
│       ├── orders.spec.js        # Order management endpoints
│       ├── address.spec.js       # Address management endpoints
│       └── users.spec.js         # User profile endpoints
└── src/modules/
    └── **/routes/                # Route definitions (clean & free of JSDoc)
```

## 🎯 Key Principles

### 1. **Separation of Concerns**
- **Route files** contain only route logic and middleware
- **Swagger spec files** contain complete API documentation
- Single responsibility principle maintained

### 2. **Modular Specs**
Each module has its own spec file (`docs/swagger/*.spec.js`):
- Easy to find and update
- Scales well with growing API
- Clear ownership of documentation per feature

### 3. **Centralized Components**
**`common.spec.js`** defines all:
- Reusable schemas (User, Product, Order, Address, etc.)
- Common response templates
- Shared error responses
- Pagination schemas

Other spec files use these components via `$ref` to avoid duplication.

### 4. **Clean Routes**
Route files have:
```javascript
// ✅ Simple, readable imports
const { userController } = require('../controllers');

// ✅ Comment pointing to swagger docs
// API documentation is managed in docs/swagger/users.spec.js

// ✅ No JSDoc clutter - just business logic
router.get('/profile', authorization, userController.getProfile);
```

## 🔗 Configuration Flow

```
config/swagger.js (Main Orchestrator)
  ↓
  ├─→ imports docs/swagger/common.spec.js
  ├─→ imports docs/swagger/auth.spec.js
  ├─→ imports docs/swagger/products.spec.js
  ├─→ imports docs/swagger/cart.spec.js
  ├─→ imports docs/swagger/orders.spec.js
  ├─→ imports docs/swagger/address.spec.js
  └─→ imports docs/swagger/users.spec.js
  ↓
  Merges all paths + components
  ↓
  Generates complete OpenAPI 3.0 spec
```

## 📝 How to Add New Endpoints

### Step 1: Create Route

**`src/modules/myfeature/routes/myRoutess.js`**
```javascript
const routes = function () {
    const router = express.Router();
    
    // API documentation is managed in docs/swagger/myfeature.spec.js
    
    router.get('/data', controller.getData);
    return router;
};
```

### Step 2: Add Swagger Spec

**`docs/swagger/myfeature.spec.js`**
```javascript
const myFeatureSpec = {
    paths: {
        '/myfeature/data': {
            get: {
                tags: ['My Feature'],
                summary: 'Get data',
                description: 'Retrieve data from my feature',
                responses: {
                    200: {
                        description: 'Data retrieved',
                        content: {
                            'application/json': {
                                schema: { /* schema */ }
                            }
                        }
                    }
                }
            }
        }
    }
};

module.exports = myFeatureSpec;
```

### Step 3: Register in Main Config

**`config/swagger.js`** - Add import and merge:
```javascript
const myFeatureSpec = require('../docs/swagger/myfeature.spec');

const allPaths = {
    ...authSpec.paths,
    ...myFeatureSpec.paths,  // Add this
    // ...
};
```

## 🚀 Accessing Documentation

### Development
```bash
npm run dev
# Open: http://localhost:3000/api-docs
```

### Production
```bash
npm start
# Open: https://bakedbliss-backend.vercel.app/api-docs
```

## 📊 Benefits

| Aspect | Benefit |
|--------|---------|
| **Maintainability** | Each module's docs are isolated and easy to update |
| **Scalability** | New endpoints follow clear patterns |
| **Clean Code** | Route files remain free of verbose JSDoc comments |
| **Organization** | Specs mirror package structure |
| **Collaboration** | Team members know exactly where to find/update docs |
| **DRY Principle** | Common schemas reused across specs |

## 🔍 File References

- **Main Config**: [config/swagger.js](../config/swagger.js)
- **Common Components**: [docs/swagger/common.spec.js](./common.spec.js)
- **Auth Endpoints**: [docs/swagger/auth.spec.js](./auth.spec.js)
- **Product Endpoints**: [docs/swagger/products.spec.js](./products.spec.js)
- **Cart Endpoints**: [docs/swagger/cart.spec.js](./cart.spec.js)
- **Order Endpoints**: [docs/swagger/orders.spec.js](./orders.spec.js)
- **Address Endpoints**: [docs/swagger/address.spec.js](./address.spec.js)
- **User Endpoints**: [docs/swagger/users.spec.js](./users.spec.js)

## 💡 Best Practices

✅ **DO:**
- Keep route files clean and focused on logic
- Put all API doc in spec files
- Reuse schemas from `common.spec.js`
- Use `$ref` for schema references
- Add descriptive tags and summaries
- Document security requirements

❌ **DON'T:**
- Mix JSDoc swagger comments with route code
- Duplicate schema definitions
- Add business logic to spec files
- Hardcode response objects (use schemas)
- Leave endpoints undocumented

## 🔐 Security Documentation

All authenticated endpoints include:
```javascript
security: [{ bearerAuth: [] }]
```

Public endpoints omit this field (default: `security: [{ bearerAuth: [] }]` at root level, can override).
