/**
 * OTP Service - Baked Bliss
 * Handles OTP generation, storage, and verification
 *
 * Uses in-memory storage for development.
 * For production, consider upgrading to Redis for:
 * - Persistence across server restarts
 * - Distributed storage for multi-instance deployments
 */

// In-memory OTP storage
// Structure: Map<email, { otp: string, expiresAt: number }>
const otpStore = new Map();

// In-memory attempt tracking
// Structure: Map<email, { count: number, lockedUntil?: number }>
const attemptStore = new Map();

// Password reset token storage
// Structure: Map<email, { token: string, expiresAt: number }>
const resetTokenStore = new Map();

// Constants
const OTP_EXPIRY_MS = 2 * 60 * 1000; // 2 minutes
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 60 * 60 * 1000; // 1 hour
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

/**
 * Generate 6-digit OTP
 * @returns {string} 6-digit OTP code
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate secure random token for password reset
 * @returns {string} 32-character hex token
 */
const generateResetToken = () => {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Store OTP for email with expiry
 * @param {string} email - User email
 * @param {string} otp - Generated OTP
 */
const storeOTP = (email, otp) => {
    const key = email.toLowerCase();
    const expiresAt = Date.now() + OTP_EXPIRY_MS;

    otpStore.set(key, { otp, expiresAt });

    console.log(`[OTP] Stored for ${key}, expires at ${new Date(expiresAt).toISOString()}`);

    // Auto-cleanup after expiry
    setTimeout(() => {
        const stored = otpStore.get(key);
        if (stored && stored.otp === otp) {
            otpStore.delete(key);
            console.log(`[OTP] Auto-expired for ${key}`);
        }
    }, OTP_EXPIRY_MS + 1000);
};

/**
 * Verify OTP for email
 * @param {string} email - User email
 * @param {string} otp - OTP to verify
 * @returns {{ valid: boolean, error?: string }}
 */
const verifyOTP = (email, otp) => {
    const key = email.toLowerCase();

    // Check lockout
    const attempts = attemptStore.get(key);
    if (attempts && attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
        const remainingMinutes = Math.ceil((attempts.lockedUntil - Date.now()) / 60000);
        return {
            valid: false,
            error: `Account temporarily locked. Try again in ${remainingMinutes} minutes.`
        };
    }

    const stored = otpStore.get(key);

    if (!stored) {
        incrementAttempts(key);
        return {
            valid: false,
            error: 'OTP not found or expired. Please request a new one.'
        };
    }

    if (Date.now() > stored.expiresAt) {
        otpStore.delete(key);
        return {
            valid: false,
            error: 'OTP has expired. Please request a new one.'
        };
    }

    if (stored.otp !== otp) {
        incrementAttempts(key);
        const remaining = getRemainingAttempts(key);
        return {
            valid: false,
            error: remaining > 0 ? `Invalid OTP. ${remaining} attempt(s) remaining.` : 'Account temporarily locked due to too many failed attempts.'
        };
    }

    // Success - clear OTP and attempts
    otpStore.delete(key);
    clearAttempts(key);
    console.log(`[OTP] Verified successfully for ${key}`);

    return { valid: true };
};

/**
 * Increment failed attempt count
 * @param {string} email - User email
 */
const incrementAttempts = email => {
    const key = email.toLowerCase();
    const current = attemptStore.get(key) || { count: 0 };
    current.count += 1;

    if (current.count >= MAX_ATTEMPTS) {
        current.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
        console.log(`[OTP] Account locked for ${key} until ${new Date(current.lockedUntil).toISOString()}`);
    }

    attemptStore.set(key, current);
};

/**
 * Get remaining attempts for email
 * @param {string} email - User email
 * @returns {number} Remaining attempts
 */
const getRemainingAttempts = email => {
    const key = email.toLowerCase();
    const attempts = attemptStore.get(key);

    if (!attempts) return MAX_ATTEMPTS;
    if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) return 0;
    if (attempts.lockedUntil && Date.now() >= attempts.lockedUntil) {
        // Lockout expired, reset
        attemptStore.delete(key);
        return MAX_ATTEMPTS;
    }

    return Math.max(0, MAX_ATTEMPTS - attempts.count);
};

/**
 * Clear attempts for email (on successful verification)
 * @param {string} email - User email
 */
const clearAttempts = email => {
    attemptStore.delete(email.toLowerCase());
};

/**
 * Check if email is locked out
 * @param {string} email - User email
 * @returns {{ locked: boolean, remainingMinutes?: number }}
 */
const isLockedOut = email => {
    const key = email.toLowerCase();
    const attempts = attemptStore.get(key);

    if (!attempts || !attempts.lockedUntil) {
        return { locked: false };
    }

    if (Date.now() >= attempts.lockedUntil) {
        attemptStore.delete(key);
        return { locked: false };
    }

    return {
        locked: true,
        remainingMinutes: Math.ceil((attempts.lockedUntil - Date.now()) / 60000)
    };
};

/**
 * Store password reset token
 * @param {string} email - User email
 * @param {string} token - Reset token
 */
const storeResetToken = (email, token) => {
    const key = email.toLowerCase();
    const expiresAt = Date.now() + RESET_TOKEN_EXPIRY_MS;

    resetTokenStore.set(key, { token, expiresAt });

    console.log(`[Reset] Token stored for ${key}, expires at ${new Date(expiresAt).toISOString()}`);

    // Auto-cleanup after expiry
    setTimeout(() => {
        const stored = resetTokenStore.get(key);
        if (stored && stored.token === token) {
            resetTokenStore.delete(key);
            console.log(`[Reset] Token auto-expired for ${key}`);
        }
    }, RESET_TOKEN_EXPIRY_MS + 1000);
};

/**
 * Verify password reset token
 * @param {string} email - User email
 * @param {string} token - Token to verify
 * @returns {{ valid: boolean, error?: string }}
 */
const verifyResetToken = (email, token) => {
    const key = email.toLowerCase();
    const stored = resetTokenStore.get(key);

    if (!stored) {
        return {
            valid: false,
            error: 'Reset token not found or expired. Please request a new one.'
        };
    }

    if (Date.now() > stored.expiresAt) {
        resetTokenStore.delete(key);
        return {
            valid: false,
            error: 'Reset token has expired. Please request a new one.'
        };
    }

    if (stored.token !== token) {
        return {
            valid: false,
            error: 'Invalid reset token.'
        };
    }

    // Valid token - clear it (one-time use)
    resetTokenStore.delete(key);
    return { valid: true };
};

/**
 * Clear all OTP data for an email (for testing/admin purposes)
 * @param {string} email - User email
 */
const clearAllForEmail = email => {
    const key = email.toLowerCase();
    otpStore.delete(key);
    attemptStore.delete(key);
    resetTokenStore.delete(key);
};

module.exports = {
    // OTP functions
    generateOTP,
    storeOTP,
    verifyOTP,

    // Attempt tracking
    getRemainingAttempts,
    clearAttempts,
    isLockedOut,

    // Password reset
    generateResetToken,
    storeResetToken,
    verifyResetToken,

    // Utilities
    clearAllForEmail,

    // Constants (exported for reference)
    OTP_EXPIRY_MS,
    MAX_ATTEMPTS,
    LOCKOUT_DURATION_MS,
    RESET_TOKEN_EXPIRY_MS
};
