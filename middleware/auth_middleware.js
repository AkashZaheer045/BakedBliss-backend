const jwt = require('jsonwebtoken');

// JWT-based authentication middleware
// Expects header: Authorization: Bearer <JWT>
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split('Bearer ')[1];
        // Use JWT_SECRET_KEY for consistency with global auth middleware
        const secret = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET;

        // Verify JWT
        const decoded = jwt.verify(token, secret);

        // Normalise to match previous shape used in controllers (req.user.uid)
        req.user = { uid: decoded.uid || decoded.userId || decoded.sub, ...decoded };
        next();
    } catch (error) {
        console.error('Error verifying JWT:', error.message || error);
        return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
    }
};

module.exports = authenticateToken;
