const axios = require('axios');

const API_URL = 'http://localhost:3000';
const EMAIL = 'admin@rathinam.in';
const PASSWORD = 'password123';

async function verifyAdminLogin() {
    try {
        console.log(`Attempting login for ${EMAIL}...`);
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: EMAIL,
            password: PASSWORD
        });
        console.log('✅ Login Successful!');
        console.log('Token:', response.data.access_token ? 'Received' : 'Missing');
    } catch (error) {
        console.error('❌ Login Failed:', error.response?.data || error.message);
        if (error.response?.status === 401 || error.response?.status === 500) {
            console.log('Possible causes: Seed data mismatch, bcrypt version mismatch, or DB connection issue.');
        }
    }
}

verifyAdminLogin();
