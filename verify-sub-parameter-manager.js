const axios = require('axios');

async function verify() {
    try {
        console.log('Logging in as Admin...');
        const loginRes = await axios.post('http://localhost:3001/auth/login', {
            email: 'admin@rathinam.in',
            password: 'password123'
        });
        const token = loginRes.data.access_token;
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch Managers
        console.log('Fetching Managers...');
        const managersRes = await axios.get('http://localhost:3001/users?role=MANAGER', { headers });
        const managers = managersRes.data;
        console.log(`Found ${managers.length} managers.`);

        if (managers.length === 0) {
            console.warn('No managers found. Creating one for test...');
            // Create a manager
            const mgrRes = await axios.post('http://localhost:3001/users', {
                email: `manager${Date.now()}@test.com`,
                password: 'password123',
                role: 'MANAGER'
            }, { headers });
            managers.push(mgrRes.data);
            console.log('Created Manager:', managers[0].id);
        }

        const managerId = managers[0].id;

        // 2. Create Parameter (Parent)
        console.log('Creating Parent Parameter...');
        const paramRes = await axios.post('http://localhost:3001/parameters', {
            name: 'TestParam_' + Date.now(),
            description: 'Test',
            weightage: 10,
            maxScore: 100
        }, { headers });
        const paramId = paramRes.data.id;

        // 3. Create Sub-Parameter with Manager
        console.log('Creating Sub-Parameter with Manager...', managerId);
        const subRes = await axios.post('http://localhost:3001/sub-parameters', {
            name: 'TestSubParam',
            weightage: 50,
            maxScore: 50,
            parameterId: paramId,
            mappedManagerId: managerId
        }, { headers });

        console.log('Sub-Parameter Created:', subRes.data.id);

        // 4. Verify Mapping
        const verifyRes = await axios.get(`http://localhost:3001/sub-parameters/${subRes.data.id}`, { headers });
        if (verifyRes.data.mappedManagerId === managerId) {
            console.log('SUCCESS: mappedManagerId verified.');
        } else {
            console.error('FAILED: mappedManagerId mismatch', verifyRes.data);
        }

        // Cleanup
        await axios.delete(`http://localhost:3001/parameters/${paramId}`, { headers });
        // Manager cleanup optional

    } catch (e) {
        console.error('Verification failed:', e.message);
        if (e.response) console.error(e.response.data);
    }
}

verify();
