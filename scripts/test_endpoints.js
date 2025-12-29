const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const REPORT_FILE = path.join(__dirname, '../API_TESTING_REPORT.md');

// random user for testing
const TEST_USER = {
    email: `test_${Date.now()}@example.com`,
    password: 'password123',
    fullName: 'Test User',
    phone: '1234567890'
};

let authToken = '';
let userId = '';
let testProductId = 1; // Assuming product ID 1 exists, or we'll fetch one

const results = [];

async function runTest(name, method, endpoint, body = null, requireAuth = false) {
    console.log(`Testing ${name}...`);

    const headers = {
        'Content-Type': 'application/json'
    };

    if (requireAuth && authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
        const options = {
            method,
            headers,
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const data = await response.json().catch(() => ({}));

        const status = response.status;
        const success = status >= 200 && status < 300;

        results.push({
            name,
            endpoint: `${method} ${endpoint}`,
            status: success ? '✅ PASS' : '❌ FAIL',
            statusCode: status,
            response: JSON.stringify(data).substring(0, 100) + (JSON.stringify(data).length > 100 ? '...' : '')
        });

        return { success, data, status };
    } catch (error) {
        results.push({
            name,
            endpoint: `${method} ${endpoint}`,
            status: '❌ ERROR',
            statusCode: 'N/A',
            response: error.message
        });
        return { success: false, error };
    }
}

async function main() {
    console.log('Starting API Tests...');

    // 1. Health Check
    await runTest('Health Check', 'GET', '/health');

    // 2. Auth - Register
    const registerRes = await runTest('Register User', 'POST', '/api/v1/auth/users/register', {
        email: TEST_USER.email,
        password: TEST_USER.password,
        fullName: TEST_USER.fullName,
        phone: TEST_USER.phone
    });

    // 3. Auth - Login
    const loginRes = await runTest('Login User', 'POST', '/api/v1/auth/users/signin', {
        email: TEST_USER.email,
        password: TEST_USER.password
    });

    if (loginRes.success && loginRes.data.token) {
        authToken = loginRes.data.token;
        userId = loginRes.data.data.userId;
        console.log('Got Auth Token:', authToken.substring(0, 20) + '...');
        console.log('Got User ID:', userId);
    } else {
        console.error('Failed to login, skipping protected tests');
    }

    // 3.5 Create Product (for testing)
    const productRes = await runTest('Create Product', 'POST', '/api/v1/products/upload', {
        title: 'Delicious Chocolate Cake',
        price: 25.99,
        category: 'Cakes',
        stock: 10,
        description: 'A rich chocolate cake',
        thumbnail: 'http://example.com/cake.jpg'
    });

    if (productRes.success && productRes.data.data && productRes.data.data.productId) {
        testProductId = productRes.data.data.productId;
        console.log('Created Test Product ID:', testProductId);
    }

    // 4. Products - List
    await runTest('List Products', 'GET', '/api/v1/products/');

    // 5. Products - Search (Fixed query param)
    await runTest('Search Products', 'GET', '/api/v1/products/search?query=cake');

    // 6. Products - Categories
    await runTest('Get Categories', 'GET', '/api/v1/products/categories');

    // 7. Products - Trending
    await runTest('Get Trending', 'GET', '/api/v1/products/trending');

    if (authToken) {
        // 8. Cart - Add
        await runTest('Add to Cart', 'POST', '/api/v1/cart/add', {
            productId: testProductId,
            quantity: 1
        }, true);

        // 9. Cart - View
        await runTest('View Cart', 'GET', '/api/v1/cart/view', null, true);

        // 10. Address - Add (Fixed payload)
        await runTest('Add Address', 'POST', '/api/v1/address/add', {
            address: {
                street: '123 Test St',
                city: 'Test City',
                state: 'TS',
                zipCode: '12345',
                country: 'Testland'
            }
        }, true);

        // 11. Address - View
        await runTest('View Addresses', 'GET', '/api/v1/address/view', null, true);

        // 12. User - Profile
        if (userId) {
            await runTest('Get Profile', 'GET', `/api/v1/auth/users/profile/${userId}`, null, true);
        }

        // 13. Contact (Fixed payload)
        await runTest('Submit Contact Form', 'POST', '/api/v1/contact/contact-us', {
            fullName: 'Test User',
            email: 'test@example.com',
            message: 'This is a test message'
        });
    }

    generateReport();
}

function generateReport() {
    let markdown = '# API Testing Report\n\n';
    markdown += `**Date:** ${new Date().toLocaleString()}\n\n`;
    markdown += '| Test Case | Endpoint | Status | Status Code | Response Snippet |\n';
    markdown += '|-----------|----------|--------|-------------|------------------|\n';

    results.forEach(r => {
        markdown += `| ${r.name} | \`${r.endpoint}\` | ${r.status} | ${r.statusCode} | \`${r.response}\` |\n`;
    });

    fs.writeFileSync(REPORT_FILE, markdown);
    console.log(`Report generated at ${REPORT_FILE}`);
}

main();
