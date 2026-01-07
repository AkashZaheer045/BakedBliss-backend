/**
 * Jest Configuration
 * Per Node.js Standardization Guide Section 9
 */
module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.js'],
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
    collectCoverageFrom: [
        'src/**/*.js',
        'middleware/**/*.js',
        'helpers/**/*.js',
        '!**/node_modules/**',
        '!**/__tests__/**'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50
        }
    },
    verbose: true,
    testTimeout: 30000,
    clearMocks: true,
    restoreMocks: true
};
