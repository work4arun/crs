const axios = require('axios');

async function verify() {
    try {
        console.log('Logging in as Admin...');
        const adminLogin = await axios.post('http://localhost:3000/auth/login', {
            email: 'admin@rathinam.in',
            password: 'password123'
        });
        const adminToken = adminLogin.data.access_token;

        console.log('Fetching Admin Dashboard Stats...');
        const statsRes = await axios.get('http://localhost:3000/analytics/admin/stats', {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        console.log('Admin Stats:', JSON.stringify(statsRes.data, null, 2));

        if (statsRes.data.totalStudents >= 0 && statsRes.data.averageCrs >= 0) {
            console.log('SUCCESS: Admin Stats fetched successfully.');
        } else {
            console.log('FAILURE: Invalid stats data.');
        }

    } catch (e) {
        console.error('Verification Failed:', e.message);
        if (e.response) {
            console.error('Status:', e.response.status);
            console.error('Data:', JSON.stringify(e.response.data, null, 2));
        }
    }
}

verify();
