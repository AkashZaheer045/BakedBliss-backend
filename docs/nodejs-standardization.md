# Baked Bliss - Node.js Standardization Guide

> Apply these conventions to new modules and refactors to keep contributions consistent and auditable.

## Table of Contents
1. [Runtime & Tooling Baseline](#1-runtime--tooling-baseline)
2. [Repository Layout Contracts](#2-repository-layout-contracts)
3. [Coding Conventions](#3-coding-conventions)
4. [Configuration & Environment Management](#4-configuration--environment-management)
5. [Dependency Hygiene](#5-dependency-hygiene)
6. [HTTP & API Standards](#6-http--api-standards)
7. [Data & Persistence](#7-data--persistence)
8. [Security Expectations](#8-security-expectations)
9. [Testing & Quality Gates](#9-testing--quality-gates)
10. [Delivery Workflow](#10-delivery-workflow)
11. [Documentation & Knowledge Sharing](#11-documentation--knowledge-sharing)
12. [Quick Checklist Before Opening a PR](#12-quick-checklist-before-opening-a-pr)

---

## 1. Runtime & Tooling Baseline

- **Node.js**: Target the current Active LTS release (Node 20.x). Use `.nvmrc` or CI to enforce. Avoid syntax that is not supported by the pinned version.
- **Package manager**: npm (ships with Node). Always run `npm install` without `--legacy-peer-deps`. Commit the generated `package-lock.json` once created.
- **Process manager**: Use the scripts defined in `package.json`:
  - `npm run dev` for hot reload
  - `npm start` for production parity
- **Type system & linting**: JavaScript (CommonJS) today. ESLint with the node, security, and jest plugins plus Prettier for formatting.

---

## 2. Repository Layout Contracts

```
.
├── app.js                    # Main bootstrap (Express, middleware, modules)
├── src/
│   └── modules/
│       └── <domain>/         # Vertical slices
│           ├── app.js        # Module router
│           ├── controllers/  # Request handlers
│           ├── routes/       # Route definitions
│           ├── services/     # Business logic
│           └── validations/  # Input validation
├── middleware/               # Cross-cutting Express middleware
├── helpers/                  # Pure utility helpers
├── utils/                    # Framework-agnostic utilities
├── db/
│   ├── migrations/           # Database migrations
│   ├── schemas/              # Sequelize models
│   ├── seeders/              # Seed data
│   └── sequelize/            # Sequelize configuration
├── config/                   # JSON-based static configuration
├── views/                    # EJS/email templates
├── docs/                     # Documentation
├── __tests__/                # Test files
├── .env.example              # Environment variable documentation
├── .nvmrc                    # Node.js version
├── jest.config.js            # Test configuration
├── .eslintrc.js              # Linting configuration
└── package.json
```

**Key Rules:**
- `middleware/` - Export middleware factories (functions returning handlers)
- `helpers/` - Pure utility helpers. Do NOT import req/res objects here
- `utils/` - Framework-agnostic utilities and structured data
- Keep new files in the closest matching layer

---

## 3. Coding Conventions

### Modules
Stick to CommonJS (`module.exports` / `require`) until a repo-wide migration plan exists.

### Async Patterns
Use `async/await` everywhere. Never rely on unhandled promise rejections.

```javascript
// Use the async handler wrapper
const asyncHandler = require('../../middleware/async_handler');
router.get('/products', asyncHandler(controller.getProducts));
```

### Error Handling
Bubble domain errors with custom types or codes defined in `utils/custom_exceptions.json`, then map to HTTP responses using `middleware/response_handler.js`.

### Validation
Keep schema logic inside `src/modules/<domain>/validations/`. Use express-validator; never validate inside controllers directly.

### Logging
Every request logs trace ID, actor, and outcome at minimum. Use the `requestLogger` middleware.

### Naming
- Files: lowercase with underscores (legacy) or kebab-case/camelCase
- Stay consistent per directory

---

## 4. Configuration & Environment Management

- Load configuration via `dotenv` at process start, before any module imports that rely on env vars
- Prefix environment variables by domain: `AUTH_JWT_SECRET`, `DB_READ_URL`
- Document expected vars in `.env.example`
- Keep runtime toggles in `config/constants.json`

---

## 5. Dependency Hygiene

- Introduce dependencies only after checking the tree (`npm ls <pkg>`)
- Remove unused packages promptly
- Prefer standard APIs (crypto, URL, fetch) before adding third-party modules
- Record security-sensitive packages in this doc when added
- Run `npm audit` at least monthly and before releases

---

## 6. HTTP & API Standards

### Routing
Define routes in `src/modules/<domain>/routes`. Keep routes declarative—no business logic in route files.

### Controllers
Only coordinate request flow: parse inputs, call services, map responses. No DB access here.

### Services
Own business logic and orchestration. They may call db/ repositories, external APIs, or helpers.

### Responses
Use centralized helpers from `utils/response.js` to ensure shape consistency:
```javascript
{ status, statusCode, message, data, error }
```

### Pagination
Reuse `helpers/pagination.js` utilities for list endpoints to standardize parameters (page, limit, sort).

### Versioning
Expose version via URL prefix (`/api/v1`). Document breaking changes in CHANGELOG.md.

---

## 7. Data & Persistence

- Use Sequelize models under `db/schemas/`
- Define associations in `db/sequelize/associations.js` only
- All SQL or migration scripts belong in `db/migrations/`
- Never access the database through ad-hoc queries from controllers

---

## 8. Security Expectations

- Enforce authentication in `middleware/authMiddleware.js`
- Enforce authorization in module-level guards (`src/modules/<domain>/app.js`)
- Sanitize all user inputs (sanitize-html, validators) before persisting
- For file uploads, validate MIME types with `mime-types` and scan file sizes
- Rotate secrets outside of the codebase
- Use HTTPS in production

---

## 9. Testing & Quality Gates

### Testing Stack
- **Jest** for unit/integration
- **Supertest** for HTTP
- Tests in `__tests__/` mirroring the source tree

### Requirements
- Every new module must ship with controller and service tests
- Cover success and failure paths
- Run tests plus `npm run lint` in CI before merge
- Fail builds on any unhandled promise rejection

---

## 10. Delivery Workflow

### Branch Naming
- Features: `feat/<ticket>`
- Fixes: `fix/<ticket>`
- Chores: `chore/<desc>`

### Commits
Use Conventional Commits:
- `feat: add user activation flow`
- `fix: resolve cart calculation bug`
- `chore: update dependencies`

### Code Reviews
Verify:
- Tests added/updated
- Env docs updated
- No console logs left behind
- Error paths handled
- Security implications considered

### Releases
Tag with semantic versioning. Generate release notes summarizing API and config changes.

---

## 11. Documentation & Knowledge Sharing

- Keep `README.md` high-level
- Place deep dives, API docs, and operational runbooks inside `docs/`
- Update this document whenever platform-wide standards evolve

---

## 12. Quick Checklist Before Opening a PR

- [ ] Node version matches `.nvmrc`/CI
- [ ] Added/updated tests pass locally
- [ ] Linting/formatting run (`npm run lint`)
- [ ] New environment variables documented in `.env.example`
- [ ] Sensitive data scrubbed from logs and configs
- [ ] README and this standard updated if expectations changed

---

## Security-Sensitive Packages

| Package | Purpose | Owner |
|---------|---------|-------|
| jsonwebtoken | JWT authentication | Auth Team |
| multer | File uploads | Backend Team |
| sanitize-html | XSS prevention | Security Team |
| helmet | HTTP security headers | Backend Team |

---

*Last Updated: 2026-01-02*
