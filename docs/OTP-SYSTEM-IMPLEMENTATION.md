# OTP System Implementation Guide - Baked Bliss Backend

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [OTP Flow](#otp-flow)
4. [API Endpoints](#api-endpoints)
5. [Database Schema](#database-schema)
6. [Security Considerations](#security-considerations)
7. [Configuration](#configuration)
8. [Email Templates](#email-templates)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The OTP (One-Time Password) system provides an additional layer of security to the authentication process. It enables **Two-Factor Authentication (2FA)** for user login, ensuring that only the person with access to the user's email account can log in.

### Key Features
- **6-digit OTP Generation**: Randomly generated 6-digit codes
- **2-minute Expiry**: OTPs expire after 2 minutes of generation
- **Email Delivery**: OTP sent to user's registered email address
- **Attempt Limiting**: Maximum 3 failed attempts before account lockout
- **1-hour Lockout**: Account locked for 1 hour after exceeding max attempts
- **Resend Capability**: Users can request OTP resend within cooldown period
- **Email Notifications**: Beautiful HTML email template for OTP delivery

---

## System Architecture

### Components

#### 1. **OTP Helper** (`helpers/otp.js`)
Core OTP management utility.

**Responsibilities:**
- Generate 6-digit OTP codes
- Store OTP with expiry timestamps
- Verify OTP validity
- Track failed attempts
- Manage account lockout mechanism
- Generate password reset tokens

**Key Functions:**
```javascript
generateOTP()                          // Returns 6-digit string
storeOTP(email, otp)                   // Stores with 2-min expiry
verifyOTP(email, otp)                  // Returns { valid: boolean, error?: string }
resendOTPAllowed(email)                // Checks resend eligibility
incrementAttempts(email)               // Track failed attempts
```

#### 2. **Email Helper** (`helpers/email.js`)
Email delivery service using Nodemailer.

**Responsibilities:**
- Send transactional emails
- Render HTML email templates
- Handle SMTP configuration
- Log email delivery status

**Key Functions:**
```javascript
sendEmail(to, subject, html, text)     // Generic email sender
sendOTPEmail(email, otp)               // OTP-specific email with template
sendPasswordResetEmail(email, token)   // Password reset email
```

#### 3. **Auth Service** (`src/modules/auth/services/authService.js`)
Business logic for OTP-based authentication.

**Key Functions:**
```javascript
signInWithOTP(email, password)         // Initiate OTP login
verifyOTPAndLogin(email, otp)          // Complete OTP verification
resendOTP(email)                        // Resend OTP to user
```

#### 4. **Auth Controller** (`src/modules/auth/controllers/authController.js`)
HTTP request handlers for OTP endpoints.

**Endpoints Handled:**
- POST `/auth/login-otp` - Initiate OTP login
- POST `/auth/verify-otp` - Verify OTP and complete login
- POST `/auth/resend-otp` - Request OTP resend

#### 5. **Auth Routes** (`src/modules/auth/routes/authRoutes.js`)
Route definitions with rate limiting and validation.

#### 6. **Auth Validation** (`src/modules/auth/validations/authValidation.js`)
Input validation rules for OTP endpoints.

---

## OTP Flow

### Complete Login Flow with OTP

```
┌─────────────────────────────────────────────────────────────┐
│ Client: POST /auth/login-otp                               │
│ Payload: { email, password }                               │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ authController.signInWithOTP                                │
│ - Parse request body                                        │
│ - Call AuthService.signInWithOTP                            │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ AuthService.signInWithOTP                                   │
│ - Validate credentials                                      │
│ - Check account status (active/locked)                      │
│ - Generate 6-digit OTP                                      │
│ - Store OTP with 2-min expiry                               │
│ - Call emailHelper.sendOTPEmail                             │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ emailHelper.sendOTPEmail                                    │
│ - Render email template                                     │
│ - Send via SMTP (Nodemailer)                                │
│ - Log delivery status                                       │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Response to Client: 200 OK                                  │
│ {                                                           │
│   "message": "OTP sent to your email",                      │
│   "email": "user@example.com",                              │
│   "expiresIn": 120,                                         │
│   "otpSent": true                                           │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
             ┌────────────────────────┐
             │ User checks email for   │
             │ OTP code (6 digits)     │
             └────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Client: POST /auth/verify-otp                              │
│ Payload: { email, otp }                                    │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ authController.verifyOTP                                    │
│ - Parse request body                                        │
│ - Call AuthService.verifyOTPAndLogin                        │
└─────────────────────────────────────────────────────────────┘
                          │
                    ┌─────┴─────┐
                    │            │
           OTP Valid?      OTP Invalid?
                    │            │
                    ▼            ▼
            ┌──────────────┐  ┌─────────────────┐
            │ Generate JWT │  │ Increment failed │
            │ Tokens       │  │ attempt counter  │
            │ Return user  │  │ Return error msg │
            │ data + tokens│  │                  │
            └──────────────┘  └─────────────────┘
                    │            │
                    ▼            ▼
            ┌──────────────┐  ┌─────────────────┐
            │ Response 200 │  │ Check lockout    │
            │ with tokens  │  │ Return 400/429  │
            └──────────────┘  └─────────────────┘
```

### OTP Resend Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Client: POST /auth/resend-otp                              │
│ Payload: { email }                                         │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ authController.resendOTP                                    │
│ - Call AuthService.resendOTP                                │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ AuthService.resendOTP                                       │
│ - Verify user exists                                        │
│ - Check if resend allowed (30s cooldown)                    │
│ - Generate new OTP                                          │
│ - Clear old OTP from storage                                │
│ - Send new OTP email                                        │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ Response to Client: 200 OK                                  │
│ {                                                           │
│   "message": "New OTP sent successfully",                   │
│   "expiresIn": 120                                          │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### 1. Login with OTP (Initiate)

**Endpoint:** `POST /auth/login-otp`

**Authentication:** None (Public endpoint)

**Rate Limiting:** 10 requests per 15 minutes per IP

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "HashedPassword123!"
}
```

**Validation Rules:**
- `email`: Required, valid email format
- `password`: Required, non-empty string

**Success Response (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "OTP sent to your email",
  "data": {
    "message": "OTP sent to your email",
    "email": "user@example.com",
    "expiresIn": 120,
    "otpSent": true
  }
}
```

**Error Responses:**

**Invalid Credentials (401):**
```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Invalid email or password",
  "data": {}
}
```

**Account Locked (429):**
```json
{
  "status": "error",
  "statusCode": 429,
  "message": "Account temporarily locked. Try again in 45 minutes.",
  "data": {}
}
```

**Account Deactivated (403):**
```json
{
  "status": "error",
  "statusCode": 403,
  "message": "Your account has been deactivated. Please contact support.",
  "data": {}
}
```

**Email Send Failed (500):**
```json
{
  "status": "error",
  "statusCode": 500,
  "message": "Failed to send OTP email",
  "data": {}
}
```

---

### 2. Verify OTP

**Endpoint:** `POST /auth/verify-otp`

**Authentication:** None (Public endpoint)

**Rate Limiting:** 10 requests per 15 minutes per IP

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Validation Rules:**
- `email`: Required, valid email format
- `otp`: Required, 4-6 character string

**Success Response (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "fullName": "John Doe",
      "email": "user@example.com",
      "role": "user",
      "profilePicture": "https://...",
      "phoneNumber": "+1234567890",
      "addresses": [],
      "dateJoined": "2025-01-15T10:30:00Z",
      "selectedAddressId": null
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Responses:**

**Invalid OTP (400):**
```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Invalid OTP",
  "data": {}
}
```

**OTP Expired (400):**
```json
{
  "status": "error",
  "statusCode": 400,
  "message": "OTP not found or expired. Please request a new one.",
  "data": {}
}
```

**Max Attempts Exceeded (429):**
```json
{
  "status": "error",
  "statusCode": 429,
  "message": "Account temporarily locked. Try again in 60 minutes.",
  "data": {}
}
```

**User Not Found (404):**
```json
{
  "status": "error",
  "statusCode": 404,
  "message": "User not found",
  "data": {}
}
```

---

### 3. Resend OTP

**Endpoint:** `POST /auth/resend-otp`

**Authentication:** None (Public endpoint)

**Rate Limiting:** 5 requests per 15 minutes per IP

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Validation Rules:**
- `email`: Required, valid email format

**Success Response (200 OK):**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "OTP sent successfully",
  "data": {
    "message": "New OTP sent successfully",
    "expiresIn": 120
  }
}
```

**Error Responses:**

**Resend Not Allowed (429):**
```json
{
  "status": "error",
  "statusCode": 429,
  "message": "OTP already sent. Wait 30 seconds before requesting another.",
  "data": {}
}
```

**User Not Found (404):**
```json
{
  "status": "error",
  "statusCode": 404,
  "message": "User not found",
  "data": {}
}
```

---

## Database Schema

### User Model (`db/schemas/users.js`)

The user model doesn't store OTP data directly. OTPs are maintained in-memory for security.

**Current User Fields:**
```javascript
{
  id: INTEGER,              // Primary key
  full_name: STRING,        // User's full name
  email: STRING,            // Unique email address
  profile_picture: STRING,  // Profile picture URL
  phone_number: STRING,     // Contact number
  addresses: JSON,          // Stored addresses
  selected_address_id: STRING,
  role: STRING,             // user | admin | moderator
  push_token: STRING,       // Device push notification token
  password: STRING,         // Hashed password (PBKDF2)
  salt: STRING,             // Password salt
  is_active: BOOLEAN,       // Account activation status
  date_joined: DATE,        // Registration date
  created_at: DATE,         // Created timestamp
  updated_at: DATE,         // Last update timestamp
  deleted_at: DATE          // Soft delete timestamp (paranoid)
}
```

### In-Memory Storage

OTPs are stored in-memory using JavaScript `Map` objects for development.

**Structure:**
```javascript
otpStore = Map<email, {otp, expiresAt}>
attemptStore = Map<email, {count, lockedUntil}>
```

**Migration to Production:**

For production environments with multiple server instances, migrate to Redis:

```javascript
// Production: Use Redis
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});

// Store: client.setex(key, seconds, value)
// Retrieve: client.get(key)
// Delete: client.del(key)
```

---

## Security Considerations

### 1. **Password Security**
- Passwords are hashed using PBKDF2 with 1000 iterations
- Each password has a unique salt
- Never store plain-text passwords

### 2. **OTP Security**
- OTPs are cryptographically random 6-digit codes
- Stored in-memory, never in database
- Automatically expire after 2 minutes
- Invalid OTP attempts tracked and limited
- Account locked after 3 failed attempts for 1 hour

### 3. **Rate Limiting**
- **Login OTP**: 10 requests per 15 minutes per IP
- **Resend OTP**: 5 requests per 15 minutes per IP
- **General API**: 100 requests per 15 minutes per IP

### 4. **Token Security**
- **Access Token**: JWT with 1-hour expiry
- **Refresh Token**: JWT with 7-day expiry
- Tokens signed with `JWT_SECRET_KEY` environment variable
- Never expose tokens in logs

### 5. **Email Security**
- SMTP credentials from environment variables
- Support for TLS/SSL
- Email delivery logged but OTP not logged in plaintext

### 6. **Account Protection**
- Deactivated accounts cannot login
- Generic error messages prevent email enumeration
- User-agent and IP tracking for suspicious activity (optional)

### 7. **Best Practices**
- Always use HTTPS in production
- Keep JWT secrets strong and unique
- Regularly rotate credentials
- Monitor failed login attempts
- Implement CSRF protection for web clients

---

## Configuration

### Environment Variables

Create or update `.env` file with the following:

```env
# JWT Configuration
JWT_SECRET_KEY=your_super_secret_key_min_32_chars_long
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars_long

# SMTP Configuration (Transactional Emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=Baked Bliss <noreply@bakedbliss.com>

# Frontend URL (for password reset links, if needed)
FRONTEND_URL=https://bakedbliss.com

# Optional: Redis (for production OTP storage)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_password
```

### OTP Constants Configuration (`helpers/otp.js`)

```javascript
const OTP_EXPIRY_MS = 2 * 60 * 1000;          // 2 minutes
const MAX_ATTEMPTS = 3;                        // Max failed attempts
const LOCKOUT_DURATION_MS = 60 * 60 * 1000;   // 1 hour lockout
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour token expiry
```

### Email Configuration

OTP emails use HTML templates with inline CSS for compatibility.

**Template Location:** `views/email/otp-email.html`

---

## Email Templates

### OTP Email Template

The OTP email includes:
- Branded header with Baked Bliss logo/brand
- Clear OTP code display (6 digits, highlighted)
- Expiry warning (2 minutes)
- Security notice
- Footer with support information

**Template File:** See [Email Template Documentation](#email-template-documentation)

---

## Testing

### Manual Testing with Postman

#### Step 1: Request OTP
```
POST http://localhost:5000/auth/login-otp
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "TestPass123!"
}
```

Expected: 200 OK with OTP sent confirmation

#### Step 2: Verify OTP
```
POST http://localhost:5000/auth/verify-otp
Content-Type: application/json

{
  "email": "test@example.com",
  "otp": "123456"
}
```

Expected: 200 OK with JWT tokens and user data

#### Step 3: Resend OTP
```
POST http://localhost:5000/auth/resend-otp
Content-Type: application/json

{
  "email": "test@example.com"
}
```

Expected: 200 OK (after 30s cooldown)

### Unit Tests

Test files location: `__tests__/auth/authController.test.js`

**Test Coverage:**
- Valid OTP verification
- Invalid OTP rejection
- Expired OTP handling
- Max attempts lockout
- Resend cooldown enforcement
- Account deactivation check
- Rate limiting

### Integration Tests

Test complete flow:
1. Create test user
2. Request OTP login
3. Check email service (Ethereal)
4. Verify with correct OTP
5. Check JWT token validity
6. Test failed attempts and lockout

---

## Troubleshooting

### Issue: OTP Email Not Received

**Check List:**
1. Verify SMTP credentials in `.env`
2. Check email service logs: `console.log` in `helpers/email.js`
3. For Ethereal testing: Check dashboard at https://ethereal.email/messages
4. Verify email address is correct (case-insensitive)
5. Check spam/junk folder

**Solution:**
```javascript
// Enable detailed logging in email helper
console.log('[OTP Email]', {
  to: email,
  otp: otp,
  timestamp: new Date().toISOString()
});
```

### Issue: OTP Expires Too Quickly

**Current Expiry:** 2 minutes

**To Change:**
```javascript
// In helpers/otp.js
const OTP_EXPIRY_MS = 5 * 60 * 1000; // Change to 5 minutes
```

### Issue: Account Locked After Failed Attempts

**Current Lockout:** 1 hour after 3 failed attempts

**Check Status:**
```javascript
// Call from auth service
const { attemptStore } = require('../../../../helpers/otp');
const lockStatus = attemptStore.get('user@example.com');
console.log(lockStatus);
// { count: 3, lockedUntil: 1676543200000 }
```

**Manually Clear Lockout (Development Only):**
```javascript
const { attemptStore } = require('../../../../helpers/otp');
attemptStore.delete('user@example.com');
```

### Issue: JWT Token Validation Fails

**Ensure:**
1. `JWT_SECRET_KEY` environment variable is set
2. Token format: `Bearer <token>` in Authorization header
3. Token hasn't expired (1 hour for access token)
4. Use refresh token to get new access token

### Issue: CORS Error with OTP Endpoints

**Solution:**
CORS is configured globally in `app.js`:
```javascript
app.use(cors({ optionsSuccessStatus: 200 }));
```

If still having issues:
```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
```

### Issue: Rate Limiting Blocking OTP Requests

**Current Limits:**
- Login OTP: 10/15min
- Resend OTP: 5/15min

**Check Your IP:**
Ensure client IP is being read correctly with proxy setup in `app.js`:
```javascript
app.set('trust proxy', 1); // Already configured
```

---

## Migration to Production

### Step 1: Switch to Redis for OTP Storage
```javascript
// in helpers/otp.js
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

const storeOTP = async (email, otp) => {
  const key = `otp:${email.toLowerCase()}`;
  await client.setex(key, OTP_EXPIRY_MS / 1000, otp);
};
```

### Step 2: Use Production SMTP
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxx
```

### Step 3: Enable HTTPS
All endpoints should be served over HTTPS

### Step 4: Set Strong Secrets
```env
JWT_SECRET_KEY=generate_strong_random_string_32_chars
JWT_REFRESH_SECRET=generate_strong_random_string_32_chars
```

### Step 5: Monitor and Log
- Setup error tracking (Sentry)
- Monitor email delivery (SendGrid dashboard)
- Track failed login attempts
- Alert on account lockouts

---

## Related Documentation

- [Nodemailer Implementation Guide](./NODEMAILER_IMPLEMENTATION_GUIDE.md)
- [Node.js Standardization](./nodejs-standardization.md)
- [Auth Service Implementation](../src/modules/auth/services/authService.js)
- [Email Helper](../helpers/email.js)
- [OTP Helper](../helpers/otp.js)

---

## Support & Questions

For issues or questions regarding the OTP system:
1. Check the Troubleshooting section
2. Review related documentation
3. Check server logs for detailed error messages
4. Contact the development team

---

**Last Updated:** February 20, 2026  
**Version:** 1.0.0  
**Status:** Production Ready
