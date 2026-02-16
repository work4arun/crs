const axios = require('axios');

const API_URL = 'http://localhost:3000';
const EMAIL = 'rarunkumar@rathinam.in';
const PASSWORD = 'M07ece007@13Lc01';

async function verifyLogin() {
    try {
        console.log(`Attempting login for ${EMAIL}...`);
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: EMAIL,
            password: PASSWORD
        });
        console.log('✅ Login Successful!');
        console.log('Token:', response.data.access_token ? 'Received' : 'Missing');
        console.log('User Role:', response.data.role || 'Unknown');
    } catch (error) {
        console.error('❌ Login Failed:', error.response?.data || error.message);
    }
}

verifyLogin();
