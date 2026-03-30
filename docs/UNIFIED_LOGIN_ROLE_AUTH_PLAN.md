# Unified Login + Role-Based Authorization Plan

Date: 2026-03-29
Scope: Backend-first plan for one login flow (admin/user), role hydration in middleware, and role-protected actions across the project.

## 1. Goal

Build a clean and secure auth/authorization model where:

1. There is only one login endpoint for both admin and user.
2. New registrations always create normal users by default.
3. Admin users are managed only at database level (or secure admin-only backoffice process), not public signup.
4. Middleware verifies token, fetches user from DB, and injects role into request context for every protected request.
5. Controllers and routes enforce permissions based on role from middleware (`req.user.role`).

## 2. Current Direction (What We Are Standardizing)

1. Login: single flow for all accounts.
2. Signup/Register: user role only by default.
3. Role source of truth: database.
4. Runtime role propagation: middleware reads DB and sets role on request object.
5. Authorization enforcement: centralized role checks for admin-only operations and ownership checks for user data.

## 3. Target Architecture

## 3.1 Authentication

1. Client sends credentials to one endpoint (for example, `POST /api/v1/auth/login`).
2. Service validates credentials and returns JWT with user id (`uid`/`id`).
3. JWT does not need to be the only source of role trust; DB remains source of truth.

## 3.2 Middleware (Per Request)

1. Read and verify JWT.
2. Resolve user id from token.
3. Fetch user from DB by primary key.
4. Attach canonical request context:
   - `req.user.id`
   - `req.user.role`
   - `req.user.email` (optional)
   - `req.user.status` (optional)
5. Reject invalid token/user/status before reaching controllers.

## 3.3 Authorization

1. Admin-only endpoints: allow only `req.user.role === 'admin'`.
2. User-owned resources: derive acting user from `req.user.id`, never trust frontend user id.
3. Optional backward-compatibility routes with `:id` must hard-check `:id === req.user.id`.

## 4. Implementation Plan

## Phase 1: Auth Contract Consolidation

1. Keep one login endpoint as primary (`/auth/login`).
2. Ensure signup/register always creates `role = 'user'` regardless of client payload.
3. Remove/ignore role assignment from public signup payload.
4. Document admin creation policy:
   - Admin inserted/updated directly via DB script or secure internal process.

Deliverables:
1. Auth service/controller enforce default user role.
2. API docs clearly state no public admin creation.

## Phase 2: Middleware Role Hydration (DB Call)

1. In global auth middleware:
   - verify token
   - fetch user from DB
   - inject normalized `req.user` object (id, role, status)
2. Standardize field naming (use `req.user.id`, not mixed `uid/userId/user_id`).
3. Reject inactive/suspended users before route handlers.

Deliverables:
1. Single canonical request identity shape.
2. Middleware unit/integration tests for role hydration.

## Phase 3: Route and Controller Authorization Hardening

1. Replace client-id-based access with token-id-based access for user operations:
   - profile
   - favorites
   - addresses
   - order history/details/cancel
   - cart
2. Add strict admin role checks for:
   - product create/update/delete
   - admin analytics/dashboard endpoints
   - order administration endpoints
3. Keep legacy id routes only if needed; guard with strict mismatch rejection.

Deliverables:
1. Ownership checks in user-scoped flows.
2. Role checks in admin-scoped flows.

## Phase 4: API Surface Simplification

1. Introduce self-scoped routes as primary:
   - `/users/profile`
   - `/users/favorites`
   - `/order/history`
   - `/products/recommendations`
2. Mark old id-based routes as deprecated.
3. Publish deprecation timeline and remove after client migration.

Deliverables:
1. Cleaner API contract.
2. Reduced security risk from path id misuse.

## Phase 5: Testing and Validation

1. Update Jest/Supertest mocks to use canonical `req.user.id` and `req.user.role`.
2. Add authorization test matrix:
   - user access own data: allowed
   - user access another user data: forbidden
   - admin access admin endpoints: allowed
   - normal user access admin endpoints: forbidden
3. Add regression tests for middleware DB lookup and role propagation.
4. Ensure test runtime has no startup port conflict and no open handle leaks.

Deliverables:
1. Passing suite with explicit authz coverage.
2. Security regression confidence.

## 5. Data and Operational Policy

1. Default role on registration: `user`.
2. Admin role management:
   - DB-only or protected internal tooling
   - audited changes recommended
3. Role changes should be logged (recommended in activity logs).
4. Any role escalation endpoint must be admin-only and audited.

## 6. Security Rules (Non-Negotiable)

1. Never trust user id from frontend for authorization decisions.
2. Always use `req.user.id` and `req.user.role` from middleware.
3. Use DB as authoritative source for role/status.
4. Enforce least privilege by default.

## 7. Rollout Strategy

1. Deploy backend role-hydration and authorization checks first.
2. Deploy frontend updates to self-scoped endpoints second.
3. Monitor logs for forbidden/mismatch traffic to identify old clients.
4. Remove deprecated id-based endpoints after migration window.

## 8. Acceptance Criteria

1. Single login endpoint works for both user and admin.
2. Public registration cannot create admin accounts.
3. Every protected request gets role from middleware DB call.
4. Admin-only endpoints are blocked for non-admin users.
5. User cannot access another user's resources by changing path/body ids.
6. Automated tests pass with ownership and role checks validated.

## 9. Suggested Immediate Next Tasks

1. Freeze auth payload contract: reject `role` in public signup.
2. Add shared authorization helpers:
   - `requireAdmin(req)`
   - `requireOwnership(req, resourceUserId)`
3. Update endpoint docs to mark self-scoped routes as primary.
4. Add explicit deprecation notes for legacy id-based routes.
