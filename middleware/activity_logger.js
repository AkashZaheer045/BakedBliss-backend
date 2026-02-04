/**
 * Activity Logger Middleware
 * Logs all user activities to the activity_logs table
 * Place after auth middleware to capture user information
 */
const { models, db } = require('../db/sequelize/sequelize');

/**
 * Activity Logger Middleware
 * Logs every request to the activity_logs table
 */
const activityLogger = async (req, res, next) => {
    // Skip health check and static file endpoints
    const skipPaths = ['/health', '/user/health', '/', '/uploads', '/favicon.ico'];
    if (skipPaths.some(path => req.originalUrl === path || req.originalUrl.startsWith('/uploads'))) {
        return next();
    }

    // Store original end function
    const originalEnd = res.end;
    const startTime = Date.now();

    // Override res.end to capture response
    res.end = function (chunk, encoding) {
        res.end = originalEnd;
        res.end(chunk, encoding);

        // Log the activity asynchronously (don't block response)
        setImmediate(async () => {
            try {
                // Check if activity_logs model exists
                if (!models.activity_logs) {
                    console.log('[ActivityLogger] activity_logs model not found');
                    return;
                }

                const logInstance = new db(models.activity_logs);
                // Use the integer id (primary key) from users table
                const userId = req.user?.id || null;
                const responseTime = Date.now() - startTime;

                // Determine action from method and path
                const action = getActionFromRequest(req, res.statusCode);

                // Build details object
                const details = {
                    method: req.method,
                    path: req.originalUrl,
                    ip: req.ip || req.connection?.remoteAddress,
                    userAgent: req.get('User-Agent'),
                    statusCode: res.statusCode,
                    responseTime: `${responseTime}ms`,
                    timestamp: new Date().toISOString()
                };

                // Add request body for POST/PUT/PATCH (excluding sensitive data)
                if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
                    details.body = sanitizeBody(req.body);
                }

                // Add query params for GET requests
                if (req.method === 'GET' && Object.keys(req.query).length > 0) {
                    details.query = req.query;
                }

                await logInstance.create({
                    user_id: userId,
                    action: action,
                    details: JSON.stringify(details),
                    created_at: new Date()
                });

                console.log(`[ActivityLog] ${action} | User: ${userId || 'anonymous'} | ${req.method} ${req.originalUrl} | ${res.statusCode} | ${responseTime}ms`);

            } catch (error) {
                // Don't let logging errors affect the application
                console.error('[ActivityLogger] Error logging activity:', error.message);
            }
        });
    };

    next();
};

/**
 * Determine action type from request method and path
 */
const getActionFromRequest = (req, statusCode) => {
    const method = req.method;
    const path = req.originalUrl.toLowerCase();

    // Auth actions
    if (path.includes('/auth/login') || path.includes('/auth/signin')) {
        return statusCode < 400 ? 'USER_LOGIN' : 'USER_LOGIN_FAILED';
    }
    if (path.includes('/auth/register') || path.includes('/auth/signup')) {
        return statusCode < 400 ? 'USER_SIGNUP' : 'USER_SIGNUP_FAILED';
    }
    if (path.includes('/auth/logout')) {
        return 'USER_LOGOUT';
    }
    if (path.includes('/auth/forgot-password')) {
        return 'PASSWORD_RESET_REQUEST';
    }
    if (path.includes('/auth/reset-password')) {
        return 'PASSWORD_RESET';
    }
    if (path.includes('/auth/change-password')) {
        return 'PASSWORD_CHANGE';
    }
    if (path.includes('/auth/google-login')) {
        return statusCode < 400 ? 'SOCIAL_LOGIN' : 'SOCIAL_LOGIN_FAILED';
    }

    // Product actions
    if (path.includes('/products')) {
        if (method === 'GET') return 'PRODUCT_VIEW';
        if (method === 'POST') return 'PRODUCT_CREATE';
        if (method === 'PUT' || method === 'PATCH') return 'PRODUCT_UPDATE';
        if (method === 'DELETE') return 'PRODUCT_DELETE';
    }

    // Cart actions
    if (path.includes('/cart')) {
        if (path.includes('/add')) return 'CART_ADD_ITEM';
        if (path.includes('/remove')) return 'CART_REMOVE_ITEM';
        if (path.includes('/update')) return 'CART_UPDATE';
        if (path.includes('/clear')) return 'CART_CLEAR';
        if (method === 'GET') return 'CART_VIEW';
    }

    // Order actions
    if (path.includes('/order')) {
        if (path.includes('/create') || method === 'POST') return 'ORDER_CREATE';
        if (path.includes('/cancel')) return 'ORDER_CANCEL';
        if (path.includes('/status')) return 'ORDER_STATUS_UPDATE';
        if (method === 'GET') return 'ORDER_VIEW';
    }

    // User actions
    if (path.includes('/users')) {
        if (path.includes('/profile')) {
            return method === 'GET' ? 'PROFILE_VIEW' : 'PROFILE_UPDATE';
        }
        if (path.includes('/favorites')) {
            if (path.includes('/add')) return 'FAVORITE_ADD';
            if (path.includes('/remove')) return 'FAVORITE_REMOVE';
            return 'FAVORITES_VIEW';
        }
    }

    // Admin actions
    if (path.includes('/admin')) {
        if (path.includes('/orders')) return 'ADMIN_ORDERS_VIEW';
        if (path.includes('/customers')) return 'ADMIN_CUSTOMERS_VIEW';
        if (path.includes('/products')) return 'ADMIN_PRODUCTS_VIEW';
        if (path.includes('/dashboard')) return 'ADMIN_DASHBOARD_VIEW';
        if (path.includes('/settings')) return 'ADMIN_SETTINGS_VIEW';
        if (path.includes('/logs')) return 'ADMIN_LOGS_VIEW';
        return 'ADMIN_ACTION';
    }

    // Contact actions
    if (path.includes('/contact')) {
        return method === 'POST' ? 'CONTACT_SUBMIT' : 'CONTACT_VIEW';
    }

    // Address actions
    if (path.includes('/address')) {
        if (method === 'POST') return 'ADDRESS_ADD';
        if (method === 'PUT' || method === 'PATCH') return 'ADDRESS_UPDATE';
        if (method === 'DELETE') return 'ADDRESS_DELETE';
        return 'ADDRESS_VIEW';
    }

    // Default action based on method
    return `${method}_REQUEST`;
};

/**
 * Sanitize request body to remove sensitive information
 */
const sanitizeBody = (body) => {
    if (!body || typeof body !== 'object') return {};

    const sensitiveFields = ['password', 'currentPassword', 'newPassword', 'confirmPassword', 'token', 'accessToken', 'refreshToken', 'salt'];
    const sanitized = { ...body };

    sensitiveFields.forEach(field => {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
        }
    });

    return sanitized;
};

module.exports = { activityLogger };
