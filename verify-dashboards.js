const axios = require('axios');

async function verify() {
    try {
        console.log('Logging in as Admin...');
        const adminLogin = await axios.post('http://localhost:3000/auth/login', {
            email: 'admin@rathinam.in',
            password: 'password123'
        });
        const adminToken = adminLogin.data.access_token;

        console.log('Creating a Test Dashboard...');
        const createRes = await axios.post('http://localhost:3000/dashboards', {
            name: 'Test Tutor Dashboard',
            role: 'TUTOR',
            layout: [
                { id: 'widget-1', type: 'recent-violations', x: 0, y: 0, w: 2, h: 4 },
                { id: 'widget-2', type: 'top-students', x: 2, y: 0, w: 2, h: 4 }
            ]
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('Dashboard Created:', createRes.data.id);

        console.log('Fetching Dashboards...');
        const listRes = await axios.get('http://localhost:3000/dashboards', {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const dashboard = listRes.data.find(d => d.id === createRes.data.id);

        if (dashboard) {
            console.log('SUCCESS: Dashboard retrieved successfully.');
            console.log(JSON.stringify(dashboard, null, 2));
        } else {
            console.log('FAILURE: Created dashboard not found in list.');
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
