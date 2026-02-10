const axios = require('axios');

async function verify() {
    try {
        console.log('Logging in as Admin...');
        const adminLogin = await axios.post('http://localhost:3000/auth/login', {
            email: 'admin@rathinam.in',
            password: 'password123'
        });
        const adminToken = adminLogin.data.access_token;

        // 1. Trigger an Action (e.g., Login itself triggers 'LOGIN' audit)
        // 2. Fetch Audit Logs
        console.log('Fetching Audit Logs...');
        const auditRes = await axios.get('http://localhost:3000/audit?limit=10', {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        console.log(`Fetched ${auditRes.data.length} logs.`);

        const loginLog = auditRes.data.find(l => l.action === 'LOGIN');
        if (loginLog) {
            console.log('SUCCESS: "LOGIN" Audit Log found:', JSON.stringify(loginLog, null, 2));
        } else {
            console.log('WARNING: "LOGIN" Log not found immediately (might be async).');
            console.log('Latest Logs:', JSON.stringify(auditRes.data.slice(0, 3), null, 2));
        }

    } catch (e) {
        console.error('Verification Failed:', e.message);
        if (e.response) {
            console.error('Status:', e.response.status);
        }
    }
}

verify();
