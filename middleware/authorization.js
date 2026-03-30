/**
 * Shared authorization helpers
 *
 * Centralizes common role and ownership checks so controllers can enforce
 * consistent authorization decisions with minimal duplication.
 */

const requireAdmin = (req, res) => {
    if (!req.user) {
        res.status(401).json({ status: 'error', message: 'Authentication required' });
        return false;
    }

    if (req.user.role !== 'admin') {
        res.status(403).json({ status: 'error', message: 'Admin access required' });
        return false;
    }

    return true;
};

const requireOwnership = (req, res, resourceUserId, options = {}) => {
    const { allowAdmin = true } = options;

    if (!req.user) {
        res.status(401).json({ status: 'error', message: 'Authentication required' });
        return false;
    }

    if (allowAdmin && req.user.role === 'admin') {
        return true;
    }

    if (req.user.id !== resourceUserId) {
        res.status(403).json({ status: 'error', message: 'Forbidden' });
        return false;
    }

    return true;
};

module.exports = {
    requireAdmin,
    requireOwnership
};
