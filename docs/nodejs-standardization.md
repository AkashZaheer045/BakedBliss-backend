Node.js Standardization Guide 

Authoritative guidance for building and maintaining Node.js services in this repository. Apply these conventions to new modules and refactors to keep contributions consistent and auditable. 

1. Runtime & Tooling Baseline 

Node.js: Target the current Active LTS release (Node 20.x as of Nov 2025). Use .nvmrc or CI to enforce. Avoid syntax that is not supported by the pinned version. 

Package manager: npm (ships with Node). Always run npm install without --legacy-peer-deps. Commit the generated package-lock.json once created. 

Process manager: Use the scripts defined in package.json (npm run dev for hot reload via nodemon, npm start for production parity). Do not introduce parallel entry points without updating the scripts table. 

Type system & linting: JavaScript (CommonJS) today. When adding linting, prefer ESLint with the node, security, and jest plugins plus Prettier for formatting. Keep configuration in configs/ or a top-level RC file. 

2. Repository Layout Contracts 

app.js – main bootstrap that wires Express, middleware, and modules. Keep application-level concerns here only. 

src/modules/<domain>/ – vertical slices. Each module contains routes/, controllers/, services/, and validations/. Follow that pattern for new modules. 

middleware/ – cross-cutting Express middleware (auth.js, response_handler.js). Export middleware factories (functions returning handlers) to keep shared state explicit. 

helpers/ – pure utility helpers (pagination, common transforms). Do not import req/res objects here. 

utils/ – framework-agnostic utilities (e.g., response.js, uploader.js) and structured data such as custom_exceptions.json. 

db/ – Sequelize setup (connection.js, sequelize.js, associations.js) plus schema definitions. Place new migrations in db/migrations.sql until a formal migrator is adopted. 

config/ – JSON-based static configuration (non-secret). Use environment variables for secrets; never hard-code credentials. 

views/ – EJS/email templates. Keep template-specific assets here instead of mixing with business logic. 

Reference Project Structure 

Represent the repo in PRs/onboarding docs using this condensed tree. Keep new files in the closest matching layer, or add a new layer with an ADR. 

. 

├── app.js 

├── src/ 

│   └── modules/ 

│       └── users/ 

│           ├── app.js 

│           ├── controllers/ 

│           ├── routes/ 

│           ├── services/ 

│           └── validations/ 

├── middleware/ 

├── helpers/ 

├── utils/ 

│   └── uploads/ 

├── db/ 

│   ├── migrations.sql 

│   ├── schemas/ 

│   └── sequelize/ 

├── config/ 

├── views/ 

│   ├── emails/ 

│   ├── letters_docs/ 

│   └── user emails/ 

├── docs/ 

│   ├── nodejs-standardization.md 

├── Dockerfile 

├── docker-compose.yml 

├── Jenkinsfile 

└── package.json 

Group secrets (.env, certificates) outside the repo or in encrypted storage. 

If a module needs shared assets (e.g., email templates), nest them inside the module to avoid leaking boundaries. 

When introducing new directories, update this document and README.md. 

3. Coding Conventions 

Modules: Stick to CommonJS (module.exports / require) until a repo-wide migration plan exists. Avoid mixing ESM imports in the same file. 

Async patterns: Use async/await everywhere; never rely on unhandled promise rejections. Wrap async route handlers with centralized error middleware. 

Error handling: Bubble domain errors with custom types or codes defined in utils/custom_exceptions.json, then map to HTTP responses using middleware/response_handler.js. 

Validation: Keep schema logic inside src/modules/<domain>/validations/. Use express-validator or Zod; never validate inside controllers directly. 

Logging: Use console-stamp (already included) or a consistent logger wrapper. Every request should log trace ID, actor, and outcome at minimum. 

Naming: Files are lowercase with underscores (legacy). New files should converge on kebab-case or camelCase; pick one per directory and stay consistent. 

Comments: Use block comments only for non-obvious logic. Prefer self-documenting code and helper extraction. 

4. Configuration & Environment Management 

Load configuration via dotenv at process start, before any module imports that rely on env vars. 

Prefix environment variables by domain (AUTH_JWT_SECRET, DB_READ_URL). Document expected vars in .env.example (add one if missing). 

Keep runtime toggles (feature flags) in config/constants.json or dedicated flag service; do not gate behavior with process.env.NODE_ENV checks scattered throughout. 

5. Dependency Hygiene 

Introduce dependencies only after checking the tree (use npm ls <pkg>). Remove unused packages promptly. 

Prefer standard APIs (crypto, URL, fetch) before adding third-party modules. 

Record security-sensitive packages (auth, crypto, file upload) in this doc when added and note the owning teams. 

Run npm audit at least monthly and before releases; track exceptions in a shared log. 

6. HTTP & API Standards 

Routing: Define routes in src/modules/<domain>/routes. Keep routes declarative—no business logic in route files. 

Controllers: Only coordinate request flow: parse inputs, call services, map responses. No DB access here. 

Services: Own business logic and orchestration. They may call db/ repositories, external APIs (via axios), or helpers. 

Responses: Use centralized helpers from utils/response.js to ensure shape consistency ({ success, data, errors, meta }). 

Pagination: Reuse helpers/pagination.js utilities for list endpoints to standardize parameters (page, limit, sort). 

Versioning: Expose version via URL prefix (/api/v1) or headers. Document breaking changes in CHANGELOG.md (add file when first needed). 

7. Data & Persistence 

Use Sequelize models under db/schemas/. Define associations in db/sequelize/associations.js only. 

All SQL or migration scripts belong in db/migrations.sql until automated tooling is introduced. When possible, script migrations via Sequelize CLI. 

Never access the database through ad-hoc mysql2 or raw queries from controllers. Encapsulate them in repositories/services. 

8. Security Expectations 

Enforce authentication in middleware/auth.js and authorization in module-level guards (src/modules/<domain>/app.js). 

Sanitize all user inputs (sanitize-html, validators) before persisting or rendering into templates (views/). 

For file uploads (utils/uploader.js), validate MIME types with mime-types and scan file sizes before uploading to S3. 

Rotate secrets outside of the codebase; do not embed AWS keys, SMTP creds, or JWT secrets in config files. 

Use HTTPS in production and set trust proxy when behind load balancers. 

9. Testing & Quality Gates 

Testing stack: prefer Jest for unit/integration, Supertest for HTTP, and Sinon for spies. Place tests under __tests__/ mirroring the source tree. 

Every new module must ship with controller and service tests covering success and failure paths. 

Run tests plus npm run lint in CI before merge. Fail builds on any unhandled promise rejection or console error. 

10. Delivery Workflow 

Feature branches should follow feat/<ticket>, fixes fix/<ticket>, chores chore/<desc>. 

Use Conventional Commits in pull requests (feat: add user activation flow). CI and release tooling depends on this pattern. 

Code reviews must verify: tests added/updated, env docs updated, no console logs left behind, error paths handled, and security implications considered. 

Tag releases with semantic versioning. Generate release notes summarizing API and config changes plus migration steps. 

11. Documentation & Knowledge Sharing 

Keep README.md high-level. Place deep dives, API docs, and operational runbooks inside docs/. 

Update this document whenever platform-wide standards evolve (runtime bumps, new lint rules, security mandates). 

For user-facing flows (emails, templates), include screenshots or sample payloads in docs/ or under the relevant module. 

12. Quick Checklist Before Opening a PR 

Node version matches .nvmrc/CI. 

Added/updated tests pass locally. 

Linting/formatting run. 

New environment variables documented. 

Sensitive data scrubbed from logs and configs. 

README and this standard updated if expectations changed. 

 