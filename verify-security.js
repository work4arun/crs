const axios = require('axios');

const API_URL = 'http://localhost:3000';
const EMAIL = 'test-security@rathinam.in';
const PASSWORD = 'password123';
const NEW_PASSWORD = 'newpassword123';

async function verifySecurity() {
    try {
        console.log('--- Starting Security Verification ---');

        // 0. Register/Ensure User Exists
        try {
            await axios.post(`${API_URL}/auth/register`, {
                email: EMAIL,
                password: PASSWORD,
                // name removed as User model doesn't have it
            });
            console.log('✅ Registered Test User');
        } catch (e) {
            console.log('ℹ️ User likely exists, proceeding...');
        }

        // 1. Login
        console.log('\n--- 1. Testing Login & Session ---');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: EMAIL,
            password: PASSWORD // Try original password first
        }).catch(async () => {
            // If failed, try new password from previous runs
            console.log('Login failed with original password, trying NEW_PASSWORD...');
            return await axios.post(`${API_URL}/auth/login`, {
                email: EMAIL,
                password: NEW_PASSWORD
            });
        });

        const token = loginRes.data.access_token;
        console.log('✅ Login Successful. Token received.');

        // 2. Access Protected Route
        console.log('\n--- 2. Testing Protected Route ---');
        await axios.get(`${API_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Access to Profile Successful.');

        // 3. Logout
        console.log('\n--- 3. Testing Logout ---');
        await axios.post(`${API_URL}/auth/logout`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Logout Successful.');

        // 4. Access Protected Route After Logout (Should Fail)
        console.log('\n--- 4. Testing Access After Logout (Should Fail) ---');
        try {
            await axios.get(`${API_URL}/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.error('❌ Access succeeded but should have failed!');
            process.exit(1);
        } catch (e) {
            if (e.response.status === 401) {
                console.log('✅ Access Denied (401) as expected.');
            } else {
                console.error(`❌ Unexpected error: ${e.response.status}`);
            }
        }

        // 5. Forgot Password
        console.log('\n--- 5. Testing Forgot Password ---');
        const forgotRes = await axios.post(`${API_URL}/auth/forgot-password`, { email: EMAIL });
        console.log(`✅ Forgot Password Request Sent: ${forgotRes.data.message}`);
        console.log('⚠️ CHECK SERVER LOGS FOR TOKEN AND REPLACE BELOW MANUALLY IF NEEDED FOR MANAUL TEST, BUT AUTOMATION STOPS HERE FOR RESET.');
        // Note: We used console.log in backend for token. We can't easily capture it here without piping logs.
        // For automated test, we rely on the fact that the endpoint returned success.

        console.log('\n✅ Verification Complete.');

    } catch (error) {
        console.error('❌ Verification Failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

verifySecurity();
