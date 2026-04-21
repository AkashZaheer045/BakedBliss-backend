# BakedBliss Backend - Project Functionality

## Overview
The BakedBliss backend exposes REST APIs for a bakery e-commerce platform. The current implementation covers authentication, user profile and favorites, product browsing and management, cart workflows, order lifecycle handling, address management, contact submissions, and admin operations.

This document is intentionally split into two parts:
- What is implemented now in the API surface.
- What is planned but not yet complete, based on the feature backlog.

---

## Implemented API Surface

### 1. Authentication and Account Security
- User signup and login.
- Alternate signup route for compatibility.
- OTP-based login flow.
- OTP verification and resend flows.
- Password reset and password change.
- Token refresh and logout.
- Legacy profile lookup route retained for compatibility.
- Rate limiting on sensitive auth endpoints.

### 2. User Profile and Favorites
- Fetch and update the authenticated user profile.
- Support legacy profile route variants using an explicit user id.
- Add products to favorites.
- Remove products from favorites.
- List favorite products.
- Support both self-scoped favorites routes and id-based compatibility routes.

### 3. Product Catalog
- List products with pagination and filtering support.
- Search products.
- Fetch product categories.
- Fetch trending products.
- Fetch products by category.
- Create, update, and delete products.
- Upload new products and product media.
- Generate product recommendations, including a backward-compatible route variant.

### 4. Shopping Cart
- Add product items to cart.
- Update quantities in cart.
- Remove specific cart items.
- Clear the cart.
- Retrieve the current cart view.
- Support both `view` and `items` aliases for compatibility.

### 5. Order Management
- Create orders from cart or user context.
- Confirm orders through a compatibility alias.
- Track order status.
- View order history.
- Retrieve order details.
- Cancel orders where business rules allow.
- List all orders for admin access.
- Update order status for admin workflows.
- Expose order statistics for operations and dashboards.

### 6. Address Management
- Add new delivery address.
- Update an existing address.
- Delete an address.
- List all user addresses.
- Support an alternate address listing route for compatibility.
- Provide the foundation for default address handling in the checkout flow.

### 7. Contact and Support
- Submit contact messages from users.
- Retrieve contact submissions for authorized access.
- Support multiple route aliases for the list view.

### 8. Admin Operations
- Access admin dashboard stats.
- View revenue analytics.
- View product analytics.
- Manage users and customer records.
- Update customer status.
- View admin activity logs.
- Review payment summaries.
- Review review/moderation summaries.
- Manage promotions.
- Read admin settings.
- All admin routes are protected by role checks.

---

## Platform and API Behavior

### API and Routing
- Versioned API routes under `/api/v1`.
- Modular route structure per domain: auth, products, contact, cart, orders, address, user, and admin.
- Route files stay declarative and delegate validation to centralized middleware.
- Several backward-compatible aliases remain in place to avoid breaking existing clients.

### Security and Request Controls
- Centralized authentication middleware.
- Role-based authorization for admin access.
- Rate limiting for sensitive endpoints.
- Request validation before controller execution.
- Standard error handling and 404 responses.
- CORS handling.

### Observability and Reliability
- Health endpoints for uptime checks.
- Request logging with trace-friendly patterns.
- Structured error interception and response handling.
- Swagger documentation and Postman collection support the API contract.

---

## Planned But Not Yet Complete

The backlog in the feature requirements document includes items that are not yet fully implemented in the current API surface. The main gaps are:

### Security and Authentication
- Refresh-token rotation and server-side revocation.
- Configurable account lockout plus admin unlock.
- Admin-only MFA for privileged accounts.
- Additional security header hardening.

### Payments
- Primary payment provider integration.
- Payment intent / session flow.
- Webhook processing with signature verification and idempotency.
- Refund APIs.
- Payment-state synchronization with orders.

### Inventory and Fulfillment
- Stock decrement on paid orders.
- Oversell prevention.
- Low-stock alerts and reserved stock.
- Delivery charges, serviceability checks, ETA, and pickup orders.

### Background Jobs and Notifications
- Redis-backed queue processing.
- Asynchronous email and OTP handling.
- In-app notifications and notification preferences.

### Customer Engagement
- Product reviews and ratings.
- Coupon and discount system.
- Wishlist enhancements.
- Recommendation expansion.

### Performance and Platform Hardening
- Redis caching for read-heavy endpoints.
- Query/index tuning for hot paths.
- External provider timeouts and circuit breakers.
- Stronger structured logging and monitoring.

---

## Outcome
The current backend is already functional for the core bakery commerce flow: users can register, authenticate, browse products, manage carts, place and track orders, maintain addresses, and contact support, while admins can operate the platform through dashboard and management endpoints.

The backlog items above should be treated as planned extensions rather than assumed functionality, so the overview stays accurate and does not overstate what is already built.