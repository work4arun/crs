const axios = require('axios');

const API_URL = 'http://localhost:3000';
const EMAIL = 'admin@rathinam.in';
const PASSWORD = 'password123'; // Confirmed correct password

async function debugLogin() {
    try {
        console.log(`--- Attempting Login for ${EMAIL} ---`);
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: EMAIL,
            password: PASSWORD
        });

        const token = loginRes.data.access_token;
        console.log('✅ Login Success. Token received.');

        console.log('\n--- Fetching Profile ---');
        const profileRes = await axios.get(`${API_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ Profile Fetched.');
        console.log('Raw Profile Data:', JSON.stringify(profileRes.data, null, 2));

        const user = profileRes.data;
        if (user.roles) {
            console.log(`\nDetected 'roles' array: [${user.roles.join(', ')}]`);
        } else if (user.role) {
            console.log(`\nDetected 'role' string: "${user.role}"`);
        } else {
            console.log('\n⚠️ No role information found!');
        }

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

debugLogin();
