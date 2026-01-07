/**
 * Promise Handler Utility
 * Wraps async operations and returns [result, error] tuple
 * This allows for cleaner error handling without try-catch blocks
 */
module.exports = async function handle(promise) {
    try {
        const result = await promise;
        return [result, null];
    } catch (error) {
        console.error('Database operation error:', error.message);
        return [null, error];
    }
};
