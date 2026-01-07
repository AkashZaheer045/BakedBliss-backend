/**
 * ESLint Configuration
 * Per Node.js Standardization Guide Section 1
 */
module.exports = {
    env: {
        node: true,
        es2022: true,
        jest: true
    },
    extends: ['eslint:recommended'],
    parserOptions: {
        ecmaVersion: 2022
    },
    rules: {
        // Code style
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        'no-console': 'off',
        'prefer-const': 'warn',
        'no-var': 'error',

        // Best practices
        eqeqeq: ['error', 'always'],
        curly: ['error', 'all'],
        'no-return-await': 'error',
        'require-await': 'warn'
    },
    ignorePatterns: ['node_modules/', 'coverage/', '*.min.js']
};
