const axios = require('axios');

async function verify() {
    try {
        // 1. Login as Admin to setup test student
        console.log('Logging in as Admin to setup test student...');
        const adminLogin = await axios.post('http://localhost:3000/auth/login', {
            email: 'admin@rathinam.in',
            password: 'password123'
        });
        const adminToken = adminLogin.data.access_token;

        // Create User for Student
        const uniqueId = Date.now();
        const studentEmail = `student${uniqueId}@test.com`;
        const studentPass = 'password123';

        // 2. Create Student Profile
        const regNo = `REG${uniqueId}`;
        const studentRes = await axios.post('http://localhost:3000/students', {
            name: 'Dashboard Tester',
            registerNumber: regNo,
            department: 'CSE',
            batch: '2024',
            email: studentEmail,
            section: 'A'
        }, { headers: { Authorization: `Bearer ${adminToken}` } });
        const studentId = studentRes.data.id;
        console.log('Created Student:', studentId);

        // 3. Create User/Auth (Register)
        try {
            await axios.post('http://localhost:3000/auth/register', {
                email: studentEmail,
                password: studentPass,
                role: 'STUDENT'
            });
            console.log('Created User account');
        } catch (e) {
            console.log('Register info:', e.response?.data || e.message);
        }

        // 4. Link User to Student
        const loginRes = await axios.post('http://localhost:3000/auth/login', {
            email: studentEmail,
            // The API (StudentsService) auto-creates user with RegNo as password if not exists
            password: regNo
        });
        const studentToken = loginRes.data.access_token;

        const payload = JSON.parse(Buffer.from(studentToken.split('.')[1], 'base64').toString());
        const userId = payload.sub;

        console.log('Linking Student to User...', userId);
        await axios.patch(`http://localhost:3000/students/${studentId}`, {
            userId: userId
        }, { headers: { Authorization: `Bearer ${adminToken}` } });
        console.log('Linked successfully');

        // 5. Add some data (Score + Violation) using Admin token
        const params = await axios.get('http://localhost:3000/parameters', { headers: { Authorization: `Bearer ${adminToken}` } });
        let subParamId;
        if (params.data.length > 0 && params.data[0].subParameters.length > 0) {
            subParamId = params.data[0].subParameters[0].id;
        }

        if (subParamId) {
            // FIX: subParameterId key
            await axios.post('http://localhost:3000/scores', {
                studentId, subParameterId: subParamId, obtainedScore: 20, data: {}
            }, { headers: { Authorization: `Bearer ${adminToken}` } });
            console.log('Added Score');
        }

        // Violation
        const vios = await axios.get('http://localhost:3000/violations', { headers: { Authorization: `Bearer ${adminToken}` } });
        let vioId;
        if (vios.data.length > 0) {
            vioId = vios.data[0].id;
        } else {
            const newVio = await axios.post('http://localhost:3000/violations', { name: 'Dash Test Vio ' + Date.now(), penalty: 5, severity: 'LOW' }, { headers: { Authorization: `Bearer ${adminToken}` } });
            vioId = newVio.data.id;
        }

        if (vioId) {
            await axios.post('http://localhost:3000/violations/record', {
                studentId, violationTypeId: vioId, comments: 'Test'
            }, { headers: { Authorization: `Bearer ${adminToken}` } });
            console.log('Added Violation');
        }

        // 6. Verify Dashboard Endpoint as Student
        console.log('Fetching Dashboard as Student...');
        const dashRes = await axios.get('http://localhost:3000/students/me/dashboard', {
            headers: { Authorization: `Bearer ${studentToken}` }
        });

        const dash = dashRes.data;
        console.log('Dashboard Data:', {
            name: dash.student.name,
            crs: dash.student.currentCrs,
            stats: dash.stats
        });

        if (dash.student.currentCrs !== 1000) {
            console.log('SUCCESS: Dashboard returned dynamic data.');
        } else {
            console.log('WARNING: CRS is default (check calc logic or previous steps).');
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
