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
        console.log('Admin Token received.');

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

        // 2. Create Main Parameter
        console.log('Creating Main Parameter "Academics"...');
        const paramRes = await axios.post('http://localhost:3000/parameters', {
            name: 'Academics_' + Date.now(),
            description: 'Academic performance',
            weightage: 50,
            maxScore: 500
        }, { headers: { Authorization: `Bearer ${adminToken}` } });
        const paramId = paramRes.data.id;
        console.log('Main Parameter Created:', paramId);

        // 3. Create Sub-Parameter 1 (within limit)
        console.log('Creating Sub-Parameter "GPA" (40%)...');
        const sub1 = await axios.post('http://localhost:3000/sub-parameters', {
            name: 'GPA',
            description: 'Grade Point Average',
            weightage: 40,
            maxScore: 100,
            parameterId: paramId
        }, { headers: { Authorization: `Bearer ${adminToken}` } });
        console.log('Sub-Parameter 1 Created:', sub1.data.id);

        // 4. Create Sub-Parameter 2 (within limit)
        console.log('Creating Sub-Parameter "Arrears" (60%)...');
        const sub2 = await axios.post('http://localhost:3000/sub-parameters', {
            name: 'Arrears',
            description: 'History of arrears',
            weightage: 60,
            maxScore: 100,
            parameterId: paramId
        }, { headers: { Authorization: `Bearer ${adminToken}` } });
        console.log('Sub-Parameter 2 Created:', sub2.data.id);

        // 5. Create Sub-Parameter 3 (Exceeds limit - should fail)
        console.log('Attempting to create Sub-Parameter "Extra" (10%) - Should Fail...');
        try {
            await axios.post('http://localhost:3000/sub-parameters', {
                name: 'Extra',
                weightage: 10,
                maxScore: 50,
                parameterId: paramId
            }, { headers: { Authorization: `Bearer ${adminToken}` } });
            console.error('FAILED: Should have rejected creating extra sub-parameter');
        } catch (e) {
            console.log('SUCCESS: Rejected as expected:', e.response?.data?.message);
        }

        console.log('Verification Successful!');

    } catch (e) {
        console.error('Verification failed:', e.message);
        if (e.response) console.error(e.response.data);
    }
}

verify();
