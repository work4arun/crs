const axios = require('axios');

async function list() {
    try {
        console.log('Logging in as Admin...');
        const loginRes = await axios.post('http://localhost:3001/auth/login', {
            email: 'admin@rathinam.in',
            password: 'password123'
        });
        const token = loginRes.data.access_token;
        const headers = { Authorization: `Bearer ${token}` };

        console.log('Fetching parameters...');
        const res = await axios.get('http://localhost:3001/parameters', { headers });
        console.log('Current Parameters in DB:', res.data);

    } catch (e) {
        console.error('Failed:', e.message);
    }
}

list();
