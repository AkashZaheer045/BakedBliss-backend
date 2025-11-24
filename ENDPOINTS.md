# 🍰 BakedBliss Backend - API Endpoints Documentation

**Base URL:** `http://localhost:3000`

---

## 📋 Table of Contents
1. [Health Check](#-health-check)
2. [Authentication](#-authentication)
3. [Products](#-products)
4. [Cart](#-cart)
5. [Orders](#-orders)
6. [Address](#-address)
7. [Contact](#-contact)

---

## 🏥 Health Check

### Get Server Health
```
GET /health
```

**Description:** Check if the server is running and responsive.

**Response (200 OK):**
```json
{
  "status": "UP"
}
```

---

## 🔐 Authentication

**Base Path:** `/baseApi/auth`

### 1. Register User
```
POST /baseApi/auth/users/register
```

**Description:** Register a new user account.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "unique_user_id",
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "User registered successfully",
  "userId": "unique_user_id"
}
```

**Error (400 Bad Request):**
```json
{
  "message": "Invalid input: userId and fullName are required."
}
```

---

### 2. Sign In User
```
POST /baseApi/auth/users/signin
```

**Description:** Authenticate user and get Firebase authentication token.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Sign in successful",
  "token": "firebase_auth_token_here",
  "userId": "unique_user_id"
}
```

**Error (401 Unauthorized):**
```json
{
  "message": "Invalid email or password"
}
```

---

### 3. Social Login
```
POST /baseApi/auth/users/social-login
```

**Description:** Login using social media (Facebook, Google, etc.).

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "provider": "google",
  "accessToken": "social_provider_token",
  "email": "user@gmail.com",
  "name": "John Doe"
}
```

**Response (200 OK):**
```json
{
  "message": "Social login successful",
  "token": "firebase_auth_token_here",
  "userId": "unique_user_id"
}
```

---

### 4. Get User Profile
```
GET /baseApi/auth/users/profile/:user_id
```

**Description:** Retrieve authenticated user's profile information.

**Headers:**
```
Authorization: Bearer <firebase_token>
```

**URL Parameters:**
- `user_id` (string) - The unique user ID

**Response (200 OK):**
```json
{
  "userId": "unique_user_id",
  "fullName": "John Doe",
  "email": "john@example.com",
  "profileImage": "url_to_profile_image",
  "createdAt": "2025-11-24T10:00:00Z"
}
```

**Error (401 Unauthorized):**
```json
{
  "message": "Unauthorized - Invalid or missing token"
}
```

---

## 🛍️ Products

**Base Path:** `/api/v1/products`

### 1. Search Products
```
GET /api/v1/products/search?query=<search_term>
```

**Description:** Search for products by name or description.

**Query Parameters:**
- `query` (string, required) - Search term (e.g., "chocolate cake", "brownie")

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "productId": "prod_123",
      "name": "Chocolate Cake",
      "description": "Rich chocolate cake",
      "price": 450,
      "category": "cakes",
      "image": "url_to_image",
      "rating": 4.5,
      "reviews": 25
    }
  ]
}
```

**Error (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Query parameter is required."
}
```

---

### 2. Get Product by ID
```
GET /api/v1/products/:product_id
```

**Description:** Get detailed information about a specific product.

**URL Parameters:**
- `product_id` (string) - The unique product ID

**Response (200 OK):**
```json
{
  "productId": "prod_123",
  "name": "Chocolate Cake",
  "description": "Rich, moist chocolate cake with ganache topping",
  "price": 450,
  "category": "cakes",
  "image": "url_to_image",
  "rating": 4.5,
  "reviews": 25,
  "ingredients": ["flour", "chocolate", "eggs", "butter"],
  "preparationTime": "30 minutes",
  "servings": 8,
  "inStock": true
}
```

**Error (404 Not Found):**
```json
{
  "status": "error",
  "message": "Product not found"
}
```

---

### 3. Get Products by Category
```
GET /api/v1/products/category/:category_name
```

**Description:** Get all products in a specific category.

**URL Parameters:**
- `category_name` (string) - Category name (e.g., "cakes", "pastries", "cookies")

**Response (200 OK):**
```json
{
  "status": "success",
  "category": "cakes",
  "data": [
    {
      "productId": "prod_123",
      "name": "Chocolate Cake",
      "price": 450,
      "image": "url_to_image",
      "rating": 4.5
    },
    {
      "productId": "prod_124",
      "name": "Vanilla Cake",
      "price": 400,
      "image": "url_to_image",
      "rating": 4.2
    }
  ]
}
```

---

### 4. Get Trending Products
```
GET /api/v1/products/trending
```

**Description:** Get the most popular/trending products.

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "productId": "prod_123",
      "name": "Bestseller Chocolate Cake",
      "price": 450,
      "image": "url_to_image",
      "rating": 4.8,
      "sales": 150
    }
  ]
}
```

**Error (500 Internal Server Error):**
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

---

### 5. Upload Product (Admin)
```
POST /api/v1/products/upload
```

**Description:** Upload a new product to the catalog.

**Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer <admin_token>
```

**Request Body (Form Data):**
```
name: "New Cake"
description: "A delicious new cake"
price: 500
category: "cakes"
image: <file>
ingredients: "flour,sugar,eggs,butter"
preparationTime: "45 minutes"
servings: 6
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Product uploaded successfully",
  "productId": "prod_125"
}
```

---

### 6. Get Recommendations
```
GET /api/v1/products/recommendations/:userId
```

**Description:** Get personalized product recommendations for a user.

**Headers:**
```
Authorization: Bearer <firebase_token>
```

**URL Parameters:**
- `userId` (string) - The user's ID

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "productId": "prod_456",
      "name": "Recommended Product",
      "price": 350,
      "image": "url_to_image",
      "reason": "Similar to your previous orders"
    }
  ]
}
```

**Error (401 Unauthorized):**
```json
{
  "message": "Unauthorized - Invalid or missing token"
}
```

---

## 🛒 Cart

**Base Path:** `/user/cart`

**All cart endpoints require authentication token.**

### 1. Add Item to Cart
```
POST /user/cart/add
```

**Description:** Add a product to the user's shopping cart.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <firebase_token>
```

**Request Body:**
```json
{
  "productId": "prod_123",
  "quantity": 2,
  "customization": "Extra frosting"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Item added to cart",
  "cartId": "cart_456"
}
```

---

### 2. View Cart
```
GET /user/cart/view
```

**Description:** Get all items in the user's shopping cart.

**Headers:**
```
Authorization: Bearer <firebase_token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "cartId": "cart_456",
  "items": [
    {
      "productId": "prod_123",
      "name": "Chocolate Cake",
      "quantity": 2,
      "price": 450,
      "subtotal": 900,
      "customization": "Extra frosting"
    }
  ],
  "total": 900,
  "itemCount": 2
}
```

---

### 3. Update Cart Item
```
PUT /user/cart/update
```

**Description:** Update quantity or customization of a cart item.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <firebase_token>
```

**Request Body:**
```json
{
  "productId": "prod_123",
  "quantity": 3,
  "customization": "Less sugar"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Cart item updated",
  "cartId": "cart_456"
}
```

---

### 4. Remove Item from Cart
```
DELETE /user/cart/remove
```

**Description:** Remove an item from the shopping cart.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <firebase_token>
```

**Request Body:**
```json
{
  "productId": "prod_123"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Item removed from cart"
}
```

---

## 📦 Orders

**Base Path:** `/user/order`

**All order endpoints require authentication token.**

### 1. Confirm Order
```
POST /user/order/confirm
```

**Description:** Place/confirm an order from the shopping cart.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <firebase_token>
```

**Request Body:**
```json
{
  "addressId": "addr_123",
  "paymentMethod": "credit_card",
  "deliveryDate": "2025-11-25",
  "specialInstructions": "Ring bell twice",
  "items": [
    {
      "productId": "prod_123",
      "quantity": 2,
      "price": 450
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Order confirmed successfully",
  "orderId": "order_789",
  "totalAmount": 900,
  "estimatedDelivery": "2025-11-25T14:00:00Z"
}
```

---

### 2. View Order History
```
GET /user/order/history
```

**Description:** Get all orders placed by the user.

**Headers:**
```
Authorization: Bearer <firebase_token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "orders": [
    {
      "orderId": "order_789",
      "orderDate": "2025-11-24T10:00:00Z",
      "totalAmount": 900,
      "status": "confirmed",
      "items": [
        {
          "productId": "prod_123",
          "name": "Chocolate Cake",
          "quantity": 2
        }
      ]
    }
  ],
  "totalOrders": 5
}
```

---

### 3. Get Order Status
```
GET /user/order/status/:orderId
```

**Description:** Get the current status of a specific order.

**Headers:**
```
Authorization: Bearer <firebase_token>
```

**URL Parameters:**
- `orderId` (string) - The order ID

**Response (200 OK):**
```json
{
  "orderId": "order_789",
  "status": "in-transit",
  "orderDate": "2025-11-24T10:00:00Z",
  "deliveryDate": "2025-11-25T14:00:00Z",
  "totalAmount": 900,
  "items": [
    {
      "productId": "prod_123",
      "name": "Chocolate Cake",
      "quantity": 2
    }
  ],
  "trackingNumber": "TRACK123456"
}
```

---

## 📍 Address

**Base Path:** `/user/address`

**All address endpoints require authentication token.**

### 1. Add Address
```
POST /user/address/add
```

**Description:** Add a new delivery address.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <firebase_token>
```

**Request Body:**
```json
{
  "fullName": "John Doe",
  "phoneNumber": "+91-9876543210",
  "street": "123 Main Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "zipCode": "400001",
  "country": "India",
  "isDefault": true,
  "addressType": "home"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Address added successfully",
  "addressId": "addr_123"
}
```

---

### 2. View Addresses
```
GET /user/address/view
```

**Description:** Get all saved addresses for the user.

**Headers:**
```
Authorization: Bearer <firebase_token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "addresses": [
    {
      "addressId": "addr_123",
      "fullName": "John Doe",
      "phoneNumber": "+91-9876543210",
      "street": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "zipCode": "400001",
      "country": "India",
      "isDefault": true,
      "addressType": "home"
    }
  ]
}
```

---

### 3. Update Address
```
PUT /user/address/update
```

**Description:** Update an existing delivery address.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <firebase_token>
```

**Request Body:**
```json
{
  "addressId": "addr_123",
  "fullName": "John Doe",
  "phoneNumber": "+91-9876543210",
  "street": "456 New Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "zipCode": "400001",
  "country": "India",
  "isDefault": true,
  "addressType": "home"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Address updated successfully"
}
```

---

### 4. Delete Address
```
DELETE /user/address/delete
```

**Description:** Delete a saved address.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <firebase_token>
```

**Request Body:**
```json
{
  "addressId": "addr_123"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Address deleted successfully"
}
```

---

## 📧 Contact

**Base Path:** `/api`

### Submit Contact Form
```
POST /api/contact-us
```

**Description:** Submit a contact/inquiry form.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "message": "I have a question about custom cakes"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Your message has been sent successfully. We will contact you soon."
}
```

**Error (400 Bad Request):**
```json
{
  "error": "All fields are required: fullName, email, and message."
}
```

---

## 🔑 Authentication Header Format

For protected endpoints, include the Firebase authentication token in the request header:

```
Authorization: Bearer <your_firebase_token_here>
```

Example with curl:
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." http://localhost:3000/user/address/view
```

---

## 📝 Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input/parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Permission denied |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

---

## 📝 Notes

- All timestamps are in ISO 8601 format (e.g., "2025-11-24T10:00:00Z")
- Currency is in INR (Indian Rupees)
- All protected endpoints require a valid Firebase authentication token
- Pagination parameters may be added to list endpoints in future updates
- Rate limiting may be implemented for production

---

**Last Updated:** November 24, 2025
**API Version:** v1.0
