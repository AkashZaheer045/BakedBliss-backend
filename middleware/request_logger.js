/**
 * Request Logger Middleware
 * Per Node.js Standardization Guide Section 3:
 * Every request should log trace ID, actor, and outcome at minimum.
 */
const crypto = require('crypto');

/**
 * Generates a unique trace ID for request tracking
 */
const generateTraceId = () => {
    return `req_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
};

/**
 * Request logging middleware
 * Attaches trace ID to request and logs request details
 */
const requestLogger = (req, res, next) => {
    // Generate and attach trace ID
    req.traceId = req.headers['x-trace-id'] || generateTraceId();
    req.startTime = Date.now();

    // Attach trace ID to response headers
    res.setHeader('X-Trace-Id', req.traceId);

    // Extract actor information
    const actor = req.user ? `user:${req.user.user_id}` : 'anonymous';
    req.actor = actor;

    // Log request entry
    console.log(`[${req.traceId}] [${actor}] → ${req.method} ${req.originalUrl}`);

    // Override res.json to log response
    const originalJson = res.json.bind(res);
    res.json = body => {
        const duration = Date.now() - req.startTime;
        const outcome = res.statusCode >= 400 ? 'ERROR' : 'SUCCESS';

        console.log(
            `[${req.traceId}] [${actor}] ← ${req.method} ${req.originalUrl} ` +
                `${res.statusCode} ${outcome} (${duration}ms)`
        );

        return originalJson(body);
    };

    next();
};

/**
 * Structured log format for JSON logging (optional)
 */
const structuredLog = (req, level, message, meta = {}) => {
    const log = {
        timestamp: new Date().toISOString(),
        traceId: req.traceId,
        actor: req.actor,
        level,
        message,
        method: req.method,
        path: req.originalUrl,
        ...meta
    };

    console.log(JSON.stringify(log));
};

module.exports = {
    requestLogger,
    structuredLog,
    generateTraceId
};
