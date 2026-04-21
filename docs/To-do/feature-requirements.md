# 🚀 BakedBliss Backend — Feature Requirements & Roadmap

_Last updated: 2026-04-02_

This document is a **feature-first backlog** for the BakedBliss backend. It aims to be more than a TODO list by adding:
- **Scope + priorities** (what matters most)
- **Acceptance criteria** (how we know it’s correct)
- **API/DB notes** (what will likely change)

---

## ✅ Scope

In scope:
- Backend API (`/api/v1/*`), database schema/migrations, background jobs, integrations (payments, email), observability.
- Security, performance, and reliability improvements that affect backend behavior.

Out of scope (unless explicitly required by a feature):
- UI/UX work (frontend), design assets, marketing pages.

---

## 🧩 Current Modules (API Surface)

- Auth: `/api/v1/auth`
- Products: `/api/v1/products`
- Cart: `/api/v1/cart`
- Orders: `/api/v1/order`
- Address: `/api/v1/address`
- Users: `/api/v1/users`
- Admin: `/api/v1/admin`
- Contact: `/api/v1/contact`

---

## 🧭 Priority Legend

- **P0**: Required for production checkout + operations
- **P1**: Improves experience, reduces support load, or scales ops
- **P2**: Nice-to-have, growth experiments, long-term

---

## 📌 Definition of Done (DoD)

A feature is “Done” when:
1. API contract is documented in Swagger and Postman collection is updated.
2. Validation + authentication + authorization are enforced (no trust in client ids).
3. DB changes include migrations (and rollback guidance if needed).
4. Logs/metrics are added for critical flows (payments/orders/auth).
5. Tests cover success + failure paths (unit/integration as appropriate).

---

## 🔐 Authentication & Security Improvements (P0/P1)

### Requirements (Backlog)
- [x] Implement brute force protection on login
- [x] Add IP-based rate limiting
- [x] Add user-based request throttling
- [ ] Add refresh-token rotation + revocation (server-side invalidation on logout)
- [ ] Add account lockout policy (configurable) + admin unlock endpoint
- [ ] Add admin-only MFA (TOTP) for privileged accounts
- [ ] Add security headers hardening (Helmet baseline + CSP where applicable)

### Acceptance Criteria
- Login brute force is mitigated (increasing delay/lockout) without leaking whether an account exists.
- Refresh tokens cannot be reused after rotation (replay is blocked).
- Admin endpoints require admin role and (if enabled) MFA.

---

## 💳 Payment Integration (P0)

### Requirements (Backlog)
- [ ] Integrate Stripe/Razorpay payment gateway (choose one as primary, keep provider interface clean)
- [ ] Implement payment intent / order payment session flow
- [ ] Handle payment webhooks (signature verification + idempotency)
- [ ] Sync payment status with orders (Paid/Failed/Refunded)
- [ ] Implement refund APIs (full/partial)
- [ ] Handle failed payment retries (new intent + state-safe retries)
- [ ] Add a `payments` table (provider, intent_id, status, amount, currency, order_id, raw_payload reference)
- [ ] Add idempotency keys for payment-creating endpoints

### Acceptance Criteria
- Webhook processing is idempotent (duplicate deliveries do not double-update an order).
- A user cannot mark an order as paid without a verified provider event.
- Refunds update both `payments` and `orders` consistently.

---

## 📦 Inventory Management (P0/P1)

### Requirements (Backlog)
- [x] Add product stock quantity field
- [ ] Auto-decrement stock on order placement (only when payment is confirmed if using online payments)
- [ ] Prevent overselling (transaction-safe decrement)
- [ ] Implement low stock alerts (threshold per product)
- [ ] Add reserved stock (cart hold mechanism with TTL)
- [ ] Support multiple warehouse inventory (optional)
- [ ] Add stock adjustment audit trail (who/when/why)

### Acceptance Criteria
- Concurrent checkouts do not oversell inventory.
- Stock changes are fully auditable (admin adjustments tracked).
- Cart reservations expire and restore stock reliably.

---

## 📑 Order Management Enhancements (P0)

### Requirements (Backlog)
- [ ] Implement order state machine (Pending → Paid → Processing → Shipped → Delivered → Cancelled)
- [ ] Add state transition validation (only legal transitions)
- [ ] Maintain order timeline/history logs (status changes + payment events + notes)
- [ ] Add order cancellation policy rules (cutoff time, paid vs COD, refund behavior)
- [ ] Add idempotency for order creation (`POST /order/create`)

### Acceptance Criteria
- Order status cannot be arbitrarily set (only valid transitions).
- Every status change is recorded with actor + timestamp.
- Repeated “create order” requests do not create duplicates.

---

## ⚙️ Background Jobs & Queue System (P1)

### Requirements (Backlog)
- [ ] Integrate Redis
- [ ] Setup BullMQ (or similar queue system)
- [ ] Move email sending to queue
- [ ] Move OTP handling to queue (resends, expiry cleanup)
- [ ] Process order tasks asynchronously (invoice generation, notifications, stock reconciliation)
- [ ] Add retry + dead-letter behavior for critical jobs

### Acceptance Criteria
- Email/OTP flows are not blocked by network latency or provider downtime.
- Failed jobs retry with backoff and are visible for debugging.

---

## 🔔 Notification System (P1)

### Requirements (Backlog)
- [x] Send email notifications (order updates)
- [ ] Implement in-app notifications (persisted + unread state)
- [ ] Add notification preferences for users (email/in-app per event type)
- [ ] Add admin broadcast notifications (e.g., downtime, promo)

### Acceptance Criteria
- Users can opt out of non-critical notifications without breaking transactional emails.
- In-app notifications support pagination and “mark as read”.

---

## ⭐ Review & Rating System (P1)

### Requirements (Backlog)
- [ ] Allow users to rate products (1–5)
- [ ] Add product reviews with comments
- [ ] Restrict reviews to verified buyers (order contains product + delivered status)
- [ ] Calculate average ratings (precomputed field or query-based)
- [ ] Add admin moderation for reviews (hide/remove)
- [ ] Prevent review spam (rate limit + one review per order item)

### Acceptance Criteria
- Only verified buyers can leave a review.
- Average rating is accurate and updates when reviews are moderated.

---

## 🎟️ Coupon & Discount System (P1)

### Requirements (Backlog)
- [ ] Implement coupon code system
- [ ] Add validation rules (expiry, usage limit, min order value, product/category constraints)
- [ ] Support percentage and fixed discounts
- [ ] Add user-specific coupons (targeted promos)
- [ ] Add stacking rules (prevent/allow combining)

### Acceptance Criteria
- Coupon application is deterministic and fully validated server-side.
- Usage limits are enforced under concurrency.

---

## ❤️ Wishlist Improvements (P2)

### Requirements (Backlog)
- [ ] Move items from wishlist to cart
- [ ] Notify users on price drops (requires price history tracking)
- [ ] Support “back in stock” alerts

---

## 🔍 Search Optimization (P1/P2)

### Requirements (Backlog)
- [x] Implement full-text search
- [ ] Add fuzzy search (typo tolerance)
- [ ] Add search analytics (top queries, zero-result queries)
- [ ] Integrate Elasticsearch (advanced, optional)

### Acceptance Criteria
- Search remains fast under load (p95 target defined in performance section).
- Fuzzy search does not return irrelevant products excessively (tunable thresholds).

---

## ⚡ Performance Optimization (P1)

### Requirements (Backlog)
- [ ] Implement Redis caching (read-heavy endpoints)
- [ ] Cache product listings (with invalidation on product update)
- [ ] Cache trending products
- [ ] Add DB indexing review for hot queries (orders history, search, favorites)
- [ ] Add request timeouts + circuit breakers for external providers (email/payments)

### Performance Targets (Suggested)
- Product list/search p95 < 300ms (warm cache)
- Checkout flow p95 < 800ms excluding payment provider redirect

---

## 🛡️ Role-Based Access Control (RBAC) (P0)

### Requirements (Backlog)
- [x] Define roles (Admin, Manager, User)
- [x] Implement permission-based access control
- [ ] Add fine-grained permissions (feature flags per role: products:write, orders:write, analytics:read)
- [ ] Add an “admin action requires re-auth” policy for sensitive actions (password prompt)

---

## 🧾 Audit Logs (P0/P1)

### Requirements (Backlog)
- [x] Track admin actions
- [x] Log order status changes
- [x] Maintain activity history
- [ ] Standardize audit event schema (actor, action, entity, before/after, ip, userAgent)
- [ ] Add export for compliance/debug (CSV download for admins)

---

## 📁 File Upload System (P1)

### Requirements (Backlog)
- [x] Integrate AWS S3 / Cloudinary
- [x] Upload product images
- [x] Update/Delete images
- [ ] Add image processing pipeline (resize, format, thumbnail)
- [ ] Enforce MIME/type validation + max size (server-side)

---

## 🚚 Delivery & Address Enhancements (P0/P1)

### Requirements (Backlog)
- [ ] Calculate delivery charges (rules by distance/zone/order value)
- [ ] Add location-based delivery logic (serviceable areas, delivery windows)
- [ ] Add delivery ETA calculation (simple rules initially)
- [ ] Add “pickup” orders (no delivery address required)

### Acceptance Criteria
- Orders cannot be placed for non-serviceable areas.
- Delivery fee calculation is consistent and reproducible.

---

## 🤖 Recommendation System (P2)

### Requirements (Backlog)
- [ ] Show related products (same category, similar tags)
- [ ] Implement “Customers also bought” (co-purchase)
- [ ] Add category-based recommendations
- [ ] Add “Recently viewed” tracking (per user/device)

---

## 📊 Analytics & Dashboard (P1)

### Requirements (Backlog)
- [ ] Total sales metrics
- [ ] Revenue analytics (daily/weekly/monthly)
- [ ] Top-selling products
- [ ] User growth tracking
- [ ] Conversion metrics (views → cart → checkout → paid)
- [ ] Export reports (CSV)

---

## 📜 Logging & Monitoring (P1)

### Requirements (Backlog)
- [ ] Setup Winston/Pino logging
- [ ] Implement structured logs (JSON, trace id, actor)
- [ ] Integrate Sentry (error monitoring)
- [ ] Add health checks for dependencies (DB, Redis, queue)
- [ ] Add rate-limit + auth failure dashboards (metrics)

---

## 📘 API Documentation (P0)

### Requirements (Backlog)
- [x] Setup Swagger documentation
- [x] Maintain Postman collection
- [ ] Add “API changelog” section (breaking changes + deprecations)
- [ ] Add example payloads for major flows (checkout, payment, refund)

---

## 🧩 Advanced Architecture (Optional / P2)

### Requirements (Backlog)
- [ ] Convert to microservices architecture
- [ ] Separate Auth, Product, Order services
- [ ] Add event-driven order pipeline (outbox pattern + events)

---

## ❓ Open Questions (Fill Before Payments Go Live)

- Primary payment provider: Stripe vs Razorpay (and supported countries/currencies)?
- Payment model: online-only, COD-only, or hybrid?
- Delivery model: shipping vs same-day local delivery vs pickup?
- Tax/VAT requirements and invoice format?
