/**
 * Auth Service
 * Handles all authentication-related database operations
 */
const { models, db } = require('../../../../db/sequelize/sequelize');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

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
 * Generate JWT token
 */
const generateToken = (userId, email) => {
    return jwt.sign({ uid: userId, email }, process.env.JWT_SECRET || 'dev_jwt_secret', {
        expiresIn: '1h'
    });
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
 * Find user by email
 */
const findUserByEmail = async email => {
    try {
        const userInstance = new db(models.users);
        const [user, err] = await userInstance.fetchOne({ email });
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
        // Check if user exists
        const [existingUser, findErr] = await findUserByEmail(email);
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
            email: email || null,
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

        const token = generateToken(newUser.user_id, newUser.email);

        return [
            {
                user: {
                    userId: newUser.user_id,
                    fullName: newUser.full_name,
                    role: newUser.role,
                    email: newUser.email,
                    profilePicture: newUser.profile_picture,
                    addresses: newUser.addresses,
                    phoneNumber: newUser.phone_number,
                    dateJoined: newUser.date_joined,
                    selectedAddressId: newUser.selected_address_id
                },
                token
            },
            null
        ];
    } catch (error) {
        return [null, error];
    }
};

/**
 * Sign in user
 */
const signIn = async (email, password) => {
    try {
        const [user, findErr] = await findUserByEmail(email);
        if (findErr) {
            return [null, findErr];
        }
        if (!user) {
            return [null, { message: 'User does not exist', status: 400 }];
        }

        if (!user.password || !user.salt) {
            return [null, { message: 'Invalid credentials or social login account', status: 400 }];
        }

        const isValid = verifyPassword(password, user.password, user.salt);
        if (!isValid) {
            return [null, { message: 'Invalid password', status: 401 }];
        }

        const token = generateToken(user.user_id, user.email);

        return [
            {
                user: {
                    userId: user.user_id,
                    fullName: user.full_name,
                    role: user.role,
                    email: user.email,
                    profilePicture: user.profile_picture,
                    addresses: user.addresses,
                    phoneNumber: user.phone_number,
                    dateJoined: user.date_joined,
                    selectedAddressId: user.selected_address_id
                },
                token
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

            const token = generateToken(existingUser.user_id, existingUser.email);

            return [
                {
                    user: {
                        userId: existingUser.user_id,
                        fullName: existingUser.full_name,
                        role: existingUser.role,
                        email: existingUser.email,
                        profilePicture: existingUser.profile_picture,
                        addresses: existingUser.addresses,
                        phoneNumber: existingUser.phone_number,
                        dateJoined: existingUser.date_joined,
                        pushToken: pushToken || existingUser.push_token,
                        selectedAddressId: selectedAddressId || existingUser.selected_address_id
                    },
                    token,
                    isNew: false
                },
                null
            ];
        }

        // Create new user
        const newUserData = {
            user_id: userId,
            full_name: fullName,
            email: email || null,
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

        const token = generateToken(newUser.user_id, newUser.email);

        return [
            {
                user: {
                    userId: newUser.user_id,
                    fullName: newUser.full_name,
                    role: newUser.role,
                    email: newUser.email,
                    profilePicture: newUser.profile_picture,
                    addresses: newUser.addresses,
                    phoneNumber: newUser.phone_number,
                    dateJoined: newUser.date_joined,
                    pushToken: newUser.push_token,
                    selectedAddressId: newUser.selected_address_id
                },
                token,
                isNew: true
            },
            null
        ];
    } catch (error) {
        return [null, error];
    }
};

module.exports = {
    signUp,
    signIn,
    socialLogin,
    findUserByEmail,
    findUserById,
    hashPassword,
    verifyPassword,
    generateToken
};
