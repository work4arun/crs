const axios = require('axios');

async function cleanup() {
    try {
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:3001/auth/login', {
            email: 'admin@rathinam.in',
            password: 'password123'
        });
        const token = loginRes.data.access_token;
        const headers = { Authorization: `Bearer ${token}` };

        console.log('Fetching parameters...');
        const res = await axios.get('http://localhost:3001/parameters', { headers });
        const params = res.data;

        console.log(`Found ${params.length} parameters. Deleting...`);
        for (const p of params) {
            await axios.delete(`http://localhost:3001/parameters/${p.id}`, { headers });
            console.log(`Deleted parameter: ${p.id}`);
        }
        console.log('Cleanup complete.');

    } catch (e) {
        console.error('Cleanup failed:', e.message);
        if (e.response) console.error(e.response.data);
    }
}

cleanup();
