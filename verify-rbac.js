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

        // 2. Login as Student (or register if not exists - we know it exists)
        console.log('Logging in as Student...');
        const studentRes = await axios.post('http://localhost:3000/auth/login', {
            email: 'student@rathinam.in',
            password: 'password123'
        });
        const studentToken = studentRes.data.access_token;
        console.log('Student Token received.');

        // 3. Access Admin Route as Admin
        console.log('Testing Admin Access (Expect Success)...');
        try {
            const res = await axios.get('http://localhost:3000/auth/admin', {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            console.log('Admin Access Success:', res.data);
        } catch (e) {
            console.error('Admin Access Failed:', e.message);
        }

        // 4. Access Admin Route as Student
        console.log('Testing Student Access to Admin Route (Expect Failure)...');
        try {
            await axios.get('http://localhost:3000/auth/admin', {
                headers: { Authorization: `Bearer ${studentToken}` }
            });
            console.error('Student Access Unexpectedly Succeeded!');
        } catch (e) {
            if (e.response && e.response.status === 403) {
                console.log('Student Access correctly Forbidden (403).');
            } else {
                console.error('Student Access Failed with unexpected error:', e.message);
            }
        }

    } catch (e) {
        console.error('Verification failed:', e.message);
        if (e.response) console.error(e.response.data);
    }
}

verify();
