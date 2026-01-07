# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-01-02

### Added - QAutos Pattern Implementation

- **Centralized Authentication**: Auth handled in `middleware/auth.js` with `allowedPaths` array
    - Public paths defined in one place
    - No more route-level `authenticateToken` middleware
- **Validation Rules Pattern**: Each module has `validations/` folder with `rule()` method
    - `authValidation.js` - Auth validation rules
    - `productValidation.js` - Product validation rules
    - `cartValidation.js` - Cart validation rules
    - `orderValidation.js` - Order validation rules
- **Centralized Validation**: `utils/validation.js` with `Validation.validate` middleware
- **Endpoint Registry**: All endpoints registered in `app.js` (like QAutos)

### Changed

- Refactored `app.js` with QAutos pattern structure
- Refactored all route files to use validation rules pattern
- Removed route-level `authenticateToken` middleware from all routes
- Routes now use `rules.rule('methodName'), Validation.validate` pattern

### Migration Guide for New Endpoints

1. Add endpoint to `middleware/auth.js` `allowedPaths` if public
2. Add validation rule in module's `validations/` file
3. Use `rules.rule('methodName'), Validation.validate, controller.action` in routes

---

## [1.1.0] - 2026-01-02

### Added

- Node.js Standardization Guide implementation
- `.nvmrc` for Node.js version pinning (v20.x LTS)
- `.env.example` documenting all environment variables
- Async handler wrapper middleware (`middleware/async_handler.js`)
- Request logger middleware with trace ID support (`middleware/request_logger.js`)
- Validation middleware (`middleware/validation.js`)
- Product input validation schemas (`src/modules/products/validations/productValidation.js`)
- Jest configuration and test setup
- ESLint configuration with node, security, and jest plugins
- Prettier configuration for code formatting
- Comprehensive `custom_exceptions.json` with i18n support
- Standardization documentation (`docs/nodejs-standardization.md`)
- Test examples for product controller

### Changed

- Updated `package.json` with test scripts and dev dependencies
- Updated Node.js engine requirement to `>=20.0.0` (LTS)
- Product routes now use asyncHandler wrapper
- Request logging now includes trace ID, actor, and outcome

### Security

- Added `sanitize-html` for XSS prevention
- Added `mime-types` for file upload validation

## [1.0.0] - 2025-11-25

### Added

- Initial release
- Express.js API with modular architecture
- User authentication with JWT
- Product management (CRUD operations)
- Shopping cart functionality
- Order management
- Contact form
- Address management
- Admin panel support
- Sequelize ORM with MySQL
- File upload support

---

## Migration Notes

### From 1.0.0 to 1.1.0

1. **Node.js Version**: Ensure you're running Node.js v20.x or later
2. **Install Dependencies**: Run `npm install` to get new dev dependencies
3. **Environment Variables**: Copy `.env.example` to `.env` and configure
4. **Run Tests**: `npm test` to verify setup

### New NPM Scripts

- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Auto-fix linting issues
