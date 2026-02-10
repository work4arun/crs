const axios = require('axios');

async function verify() {
    try {
        // 1. Login as Admin
        console.log('Logging in as Admin...');
        const adminRes = await axios.post('http://localhost:3000/auth/login', {
            email: 'admin@rathinam.in',
            password: 'password123'
        });
        const adminToken = adminRes.data.access_token;
        // 1.5 Clean up existing parameters
        console.log('Cleaning up existing parameters...');
        const existing = await axios.get('http://localhost:3000/parameters', {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        for (const p of existing.data) {
            await axios.delete(`http://localhost:3000/parameters/${p.id}`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
        }
        console.log('Cleanup complete.');

        // 2. Create Parameter
        const paramName = 'Academics_' + Date.now();
        console.log(`Creating Parameter "${paramName}"...`);
        const paramRes = await axios.post('http://localhost:3000/parameters', {
            name: paramName,
            description: 'Academic performance including GPA and arrears',
            weightage: 40,
            maxScore: 400
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('Parameter Created:', paramRes.data);
        const paramId = paramRes.data.id;

        // 3. List Parameters
        console.log('Listing Parameters...');
        const listRes = await axios.get('http://localhost:3000/parameters', {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('Parameters found:', listRes.data.length);

        // 4. Update Parameter
        console.log('Updating Parameter...');
        const updateRes = await axios.patch(`http://localhost:3000/parameters/${paramId}`, {
            weightage: 50
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('Parameter Updated:', updateRes.data);

        // 5. Delete Parameter (Clean up)
        console.log('Deleting Parameter...');
        await axios.delete(`http://localhost:3000/parameters/${paramId}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('Parameter Deleted.');

        console.log('Verification Successful!');

    } catch (e) {
        console.error('Verification failed:', e.message);
        if (e.response) console.error(e.response.data);
    }
}

verify();
