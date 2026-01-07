/**
 * Auth Service - Baked Bliss
 * Handles all authentication-related database operations
 * Including: Sign up, Sign in, OTP verification, Password reset, Token refresh
 */
const { models, db } = require('../../../../db/sequelize/sequelize');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Import helpers
const otpHelper = require('../../../../helpers/otp');
const emailHelper = require('../../../../helpers/email');

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || 'dev_jwt_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret';
const JWT_ACCESS_EXPIRY = '1h';
const JWT_REFRESH_EXPIRY = '7d';

/**
 * Hash password using PBKDF2
 */
const hashPassword = password => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return { salt, hash };
};

/**
 * Verify password
 */
const verifyPassword = (password, hash, salt) => {
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
};

/**
 * Generate JWT access token
 */
const generateToken = (userId, email) => {
    return jwt.sign({ uid: userId, email }, JWT_SECRET, {
        expiresIn: JWT_ACCESS_EXPIRY
    });
};

/**
 * Generate JWT refresh token
 */
const generateRefreshToken = userId => {
    return jwt.sign({ uid: userId, type: 'refresh' }, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRY
    });
};

/**
 * Generate both access and refresh tokens
 */
const generateTokens = (userId, email) => {
    return {
        accessToken: generateToken(userId, email),
        refreshToken: generateRefreshToken(userId)
    };
};

/**
 * Generate unique user ID
 */
const generateUserId = () => {
    const timestamp = Date.now().toString();
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `user_${timestamp}_${randomPart}`;
};

/**
 * Format user response object
 */
const formatUserResponse = user => ({
    userId: user.user_id,
    fullName: user.full_name,
    role: user.role,
    email: user.email,
    profilePicture: user.profile_picture,
    addresses: user.addresses,
    phoneNumber: user.phone_number,
    dateJoined: user.date_joined,
    selectedAddressId: user.selected_address_id,
    pushToken: user.push_token
});

/**
 * Find user by email
 */
const findUserByEmail = async email => {
    try {
        const userInstance = new db(models.users);
        const [user, err] = await userInstance.fetchOne({ email: email.toLowerCase() });
        if (err) {
            return [null, err];
        }
        return [user, null];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Find user by user_id
 */
const findUserById = async userId => {
    try {
        const userInstance = new db(models.users);
        const [user, err] = await userInstance.fetchOne({ user_id: userId });
        if (err) {
            return [null, err];
        }
        return [user, null];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Create new user
 */
const createUser = async userData => {
    try {
        const userInstance = new db(models.users);
        const [user, err] = await userInstance.create(userData);
        if (err) {
            return [null, err];
        }
        return [user, null];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Sign up user
 */
const signUp = async ({
    fullName,
    email,
    password,
    profilePicture,
    addresses,
    selectedAddressId,
    phoneNumber,
    role
}) => {
    try {
        const normalizedEmail = email.toLowerCase();

        // Check if user exists
        const [existingUser, findErr] = await findUserByEmail(normalizedEmail);
        if (findErr) {
            return [null, findErr];
        }
        if (existingUser) {
            return [null, { message: 'User already exists', status: 409 }];
        }

        const userId = generateUserId();
        const { salt, hash } = hashPassword(password);

        const newUserData = {
            user_id: userId,
            full_name: fullName,
            role: role || 'user',
            email: normalizedEmail,
            password: hash,
            salt: salt,
            profile_picture: profilePicture || null,
            addresses: addresses || [],
            phone_number: phoneNumber || null,
            date_joined: new Date(),
            selected_address_id: selectedAddressId || null
        };

        const [newUser, createErr] = await createUser(newUserData);
        if (createErr) {
            return [null, createErr];
        }

        // Generate tokens
        const tokens = generateTokens(newUser.user_id, newUser.email);

        return [
            {
                user: formatUserResponse(newUser),
                ...tokens
            },
            null
        ];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Sign in user - Step 1: Validate credentials and send OTP
 * For direct login without OTP, use signInDirect
 */
const signInWithOTP = async (email, password) => {
    try {
        const normalizedEmail = email.toLowerCase();

        // Check lockout status
        const lockStatus = otpHelper.isLockedOut(normalizedEmail);
        if (lockStatus.locked) {
            return [
                null,
                {
                    message: `Account temporarily locked. Try again in ${lockStatus.remainingMinutes} minutes.`,
                    status: 429
                }
            ];
        }

        const [user, findErr] = await findUserByEmail(normalizedEmail);
        if (findErr) {
            return [null, findErr];
        }
        if (!user) {
            return [null, { message: 'User does not exist', status: 400 }];
        }

        if (!user.password || !user.salt) {
            return [null, { message: 'Please use social login for this account', status: 400 }];
        }

        const isValid = verifyPassword(password, user.password, user.salt);
        if (!isValid) {
            return [null, { message: 'Invalid password', status: 401 }];
        }

        // Generate and send OTP
        const otp = otpHelper.generateOTP();
        otpHelper.storeOTP(normalizedEmail, otp);

        // Send OTP email
        const [emailResult, emailErr] = await emailHelper.sendOTPEmail(normalizedEmail, otp);
        if (emailErr) {
            console.error('[Auth] Failed to send OTP email:', emailErr.message);
            // Continue anyway - user can request resend
        }

        return [
            {
                message: 'OTP sent to your email',
                email: normalizedEmail,
                otpSent: !emailErr,
                expiresIn: otpHelper.OTP_EXPIRY_MS / 1000 // in seconds
            },
            null
        ];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Sign in user - Direct login without OTP (for backward compatibility)
 */
const signIn = async (email, password) => {
    try {
        const normalizedEmail = email.toLowerCase();

        const [user, findErr] = await findUserByEmail(normalizedEmail);
        if (findErr) {
            return [null, findErr];
        }
        if (!user) {
            return [null, { message: 'User does not exist', status: 400 }];
        }

        if (!user.password || !user.salt) {
            return [null, { message: 'Please use social login for this account', status: 400 }];
        }

        const isValid = verifyPassword(password, user.password, user.salt);
        if (!isValid) {
            return [null, { message: 'Invalid password', status: 401 }];
        }

        // Generate tokens
        const tokens = generateTokens(user.user_id, user.email);

        return [
            {
                user: formatUserResponse(user),
                ...tokens
            },
            null
        ];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Verify OTP and complete login
 */
const verifyOTPAndLogin = async (email, otp) => {
    try {
        const normalizedEmail = email.toLowerCase();

        // Verify OTP
        const otpResult = otpHelper.verifyOTP(normalizedEmail, otp);
        if (!otpResult.valid) {
            return [null, { message: otpResult.error, status: 400 }];
        }

        // Get user
        const [user, findErr] = await findUserByEmail(normalizedEmail);
        if (findErr) {
            return [null, findErr];
        }
        if (!user) {
            return [null, { message: 'User not found', status: 404 }];
        }

        // Generate tokens
        const tokens = generateTokens(user.user_id, user.email);

        return [
            {
                user: formatUserResponse(user),
                ...tokens
            },
            null
        ];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Resend OTP
 */
const resendOTP = async email => {
    try {
        const normalizedEmail = email.toLowerCase();

        // Check if user exists
        const [user, findErr] = await findUserByEmail(normalizedEmail);
        if (findErr) {
            return [null, findErr];
        }
        if (!user) {
            return [null, { message: 'User not found', status: 404 }];
        }

        // Check lockout
        const lockStatus = otpHelper.isLockedOut(normalizedEmail);
        if (lockStatus.locked) {
            return [
                null,
                {
                    message: `Too many attempts. Try again in ${lockStatus.remainingMinutes} minutes.`,
                    status: 429
                }
            ];
        }

        // Generate and send new OTP
        const otp = otpHelper.generateOTP();
        otpHelper.storeOTP(normalizedEmail, otp);

        const [emailResult, emailErr] = await emailHelper.sendOTPEmail(normalizedEmail, otp);
        if (emailErr) {
            console.error('[Auth] Failed to resend OTP:', emailErr.message);
        }

        return [
            {
                message: 'New OTP sent to your email',
                email: normalizedEmail,
                otpSent: !emailErr,
                expiresIn: otpHelper.OTP_EXPIRY_MS / 1000
            },
            null
        ];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Request password reset - sends reset link via email
 */
const requestPasswordReset = async email => {
    try {
        const normalizedEmail = email.toLowerCase();

        // Check if user exists
        const [user, findErr] = await findUserByEmail(normalizedEmail);
        if (findErr) {
            return [null, findErr];
        }

        // Don't reveal if user exists or not (security)
        if (!user) {
            return [
                {
                    message: 'If an account exists with this email, you will receive a password reset link.',
                    email: normalizedEmail
                },
                null
            ];
        }

        // Generate reset token
        const resetToken = otpHelper.generateResetToken();
        otpHelper.storeResetToken(normalizedEmail, resetToken);

        // Send reset email
        const [emailResult, emailErr] = await emailHelper.sendPasswordResetEmail(normalizedEmail, resetToken);
        if (emailErr) {
            console.error('[Auth] Failed to send reset email:', emailErr.message);
        }

        return [
            {
                message: 'If an account exists with this email, you will receive a password reset link.',
                email: normalizedEmail,
                emailSent: !emailErr
            },
            null
        ];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Reset password with token
 */
const resetPassword = async (email, token, newPassword) => {
    try {
        const normalizedEmail = email.toLowerCase();

        // Verify reset token
        const tokenResult = otpHelper.verifyResetToken(normalizedEmail, token);
        if (!tokenResult.valid) {
            return [null, { message: tokenResult.error, status: 400 }];
        }

        // Get user
        const [user, findErr] = await findUserByEmail(normalizedEmail);
        if (findErr) {
            return [null, findErr];
        }
        if (!user) {
            return [null, { message: 'User not found', status: 404 }];
        }

        // Hash new password
        const { salt, hash } = hashPassword(newPassword);

        // Update user password
        user.password = hash;
        user.salt = salt;
        user.updated_at = new Date();
        await user.save();

        return [
            {
                message: 'Password reset successfully. You can now login with your new password.'
            },
            null
        ];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Refresh access token using refresh token
 */
const refreshAccessToken = async refreshToken => {
    try {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

        if (decoded.type !== 'refresh') {
            return [null, { message: 'Invalid token type', status: 401 }];
        }

        // Get user
        const [user, err] = await findUserById(decoded.uid);
        if (err || !user) {
            return [null, { message: 'User not found', status: 401 }];
        }

        // Generate new access token only
        const accessToken = generateToken(user.user_id, user.email);

        return [
            {
                accessToken,
                user: formatUserResponse(user)
            },
            null
        ];
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return [null, { message: 'Refresh token expired. Please login again.', status: 401 }];
        }
        if (error.name === 'JsonWebTokenError') {
            return [null, { message: 'Invalid refresh token', status: 401 }];
        }
        return [null, error];
    }
};

/**
 * Change password (authenticated user)
 */
const changePassword = async (userId, currentPassword, newPassword) => {
    try {
        const [user, findErr] = await findUserById(userId);
        if (findErr) {
            return [null, findErr];
        }
        if (!user) {
            return [null, { message: 'User not found', status: 404 }];
        }

        if (!user.password || !user.salt) {
            return [null, { message: 'Cannot change password for social login accounts', status: 400 }];
        }

        // Verify current password
        const isValid = verifyPassword(currentPassword, user.password, user.salt);
        if (!isValid) {
            return [null, { message: 'Current password is incorrect', status: 401 }];
        }

        // Hash new password
        const { salt, hash } = hashPassword(newPassword);

        // Update password
        user.password = hash;
        user.salt = salt;
        user.updated_at = new Date();
        await user.save();

        return [
            {
                message: 'Password changed successfully'
            },
            null
        ];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Social login
 */
const socialLogin = async ({
    userId,
    fullName,
    email,
    profilePicture,
    addresses,
    selectedAddressId,
    phoneNumber,
    pushToken
}) => {
    try {
        const [existingUser, findErr] = await findUserById(userId);
        if (findErr) {
            return [null, findErr];
        }

        if (existingUser) {
            if (pushToken && pushToken.trim() !== '') {
                existingUser.push_token = pushToken;
                await existingUser.save();
            }

            const tokens = generateTokens(existingUser.user_id, existingUser.email);

            return [
                {
                    user: formatUserResponse(existingUser),
                    ...tokens,
                    isNew: false
                },
                null
            ];
        }

        // Create new user
        const newUserData = {
            user_id: userId,
            full_name: fullName,
            email: email ? email.toLowerCase() : null,
            profile_picture: profilePicture || null,
            addresses: addresses || [],
            phone_number: phoneNumber || null,
            date_joined: new Date(),
            push_token: pushToken || null,
            selected_address_id: selectedAddressId || null
        };

        const [newUser, createErr] = await createUser(newUserData);
        if (createErr) {
            return [null, createErr];
        }

        const tokens = generateTokens(newUser.user_id, newUser.email);

        return [
            {
                user: formatUserResponse(newUser),
                ...tokens,
                isNew: true
            },
            null
        ];
    } catch (error) {
        return [null, error];
    }
};

module.exports = {
    // User management
    signUp,
    signIn,
    signInWithOTP,
    socialLogin,

    // OTP flow
    verifyOTPAndLogin,
    resendOTP,

    // Password management
    requestPasswordReset,
    resetPassword,
    changePassword,

    // Token management
    refreshAccessToken,
    generateToken,
    generateRefreshToken,
    generateTokens,

    // User lookup
    findUserByEmail,
    findUserById,

    // Password utilities
    hashPassword,
    verifyPassword
};
