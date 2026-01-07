/**
 * Auth Controller
 * Handles HTTP requests/responses, delegates business logic to AuthService
 */
const AuthService = require('../services/authService');

// Sign-up function
const signUpUser = async (req, res) => {
    try {
        const {
            fullName,
            email,
            password,
            profilePicture,
            addresses,
            selectedAddressId,
            phoneNumber,
            role
        } = req.body;

        if (!fullName) {
            return res.status(400).json({ message: 'Invalid input: fullName is required.' });
        }

        if (!password) {
            return res.status(400).json({ message: 'Invalid input: password is required.' });
        }

        const [result, error] = await AuthService.signUp({
            fullName,
            email,
            password,
            profilePicture,
            addresses,
            selectedAddressId,
            phoneNumber,
            role
        });

        if (error) {
            console.error('Error signing up user:', error);
            return res.status(error.status || 500).json({
                message: 'failed',
                error: error.message || 'An error occurred during signup.'
            });
        }

        res.status(201).json({ message: 'success', data: result.user, token: result.token });
    } catch (error) {
        console.error('Error signing up user:', error);
        res.status(500).json({ message: 'failed', error: 'An error occurred during signup.' });
    }
};

// Sign-in function
const signInUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'failed',
                error: 'Email and password are required.'
            });
        }

        const [result, error] = await AuthService.signIn(email, password);

        if (error) {
            console.error('Error signing in user:', error);
            return res.status(error.status || 500).json({
                message: 'failed',
                error: error.message || 'An error occurred during sign-in.'
            });
        }

        res.status(200).json({ message: 'success', data: result.user, token: result.token });
    } catch (error) {
        console.error('Error signing in user:', error);
        res.status(500).json({ message: 'failed', error: 'An error occurred during sign-in.' });
    }
};

// Social login function
const socialLogin = async (req, res) => {
    try {
        const {
            userId,
            fullName,
            email,
            profilePicture,
            addresses,
            selectedAddressId,
            phoneNumber,
            pushToken
        } = req.body;

        if (!userId || !fullName) {
            return res
                .status(400)
                .json({ message: 'Invalid input: userId and fullName are required.' });
        }

        const [result, error] = await AuthService.socialLogin({
            userId,
            fullName,
            email,
            profilePicture,
            addresses,
            selectedAddressId,
            phoneNumber,
            pushToken
        });

        if (error) {
            console.error('Error during social login:', error);
            return res.status(error.status || 500).json({
                message: 'failed',
                error: error.message || 'An error occurred during social login.'
            });
        }

        const statusCode = result.isNew ? 201 : 200;
        res.status(statusCode).json({ message: 'success', data: result.user, token: result.token });
    } catch (error) {
        console.error('Error during social login:', error);
        res.status(500).json({
            message: 'failed',
            error: 'An error occurred during social login.'
        });
    }
};

module.exports = { signUpUser, signInUser, socialLogin };
