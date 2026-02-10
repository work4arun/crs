const axios = require('axios');

async function verify() {
    try {
        // 1. Login as Admin (simulating Manager mostly, or Super Admin who can do everything)
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:3000/auth/login', {
            email: 'admin@rathinam.in', // Using admin for simplicity, assuming they have access
            password: 'password123'
        });
        const token = loginRes.data.access_token;
        const headers = { Authorization: `Bearer ${token}` };

        // 2. Cleanup (Optional, but good for repeatable tests)
        // finding a specific student to test with
        console.log('Finding a student...');

        // Check if students exist, if not we might fail unless we upload one.
        // For verification, we assume at least one student exists from Phase 2.
        // If not, we should probably upload one, but let's try to fetch first.

        // Better: Creating a dummy parameter and sub-parameter to score against
        console.log('Creating Parameter and Sub-Parameter...');
        const paramRes = await axios.post('http://localhost:3000/parameters', {
            name: 'Sports_' + Date.now(),
            description: 'Sports Activities',
            weightage: 10,
            maxScore: 100
        }, { headers });
        const paramId = paramRes.data.id;

        const subRes = await axios.post('http://localhost:3000/sub-parameters', {
            name: 'Inter-College',
            weightage: 100,
            maxScore: 50,
            parameterId: paramId
        }, { headers });
        const subId = subRes.data.id;

        console.log('Finding a student... (Simulating by using first available or creating one via direct CSV if needed? No, let\'s assume one exists or fail)');
        // We uploaded students earlier in Phase 2. Let's list them? 
        // We didn't implement findAll in StudentsController yet? Let's check. 
        // Actually we did `StudentList` on frontend, so there MUST be a GET /students.
        const studentsRes = await axios.get('http://localhost:3000/students', { headers });
        if (studentsRes.data.length === 0) {
            throw new Error('No students found. Please upload students first.');
        }
        const studentId = studentsRes.data[0].id; // Use first student
        console.log('Using Student:', studentId);

        // 3. Create Score
        console.log('Entering Score (45/50)...');
        const scoreRes = await axios.post('http://localhost:3000/scores', {
            studentId: studentId,
            subParameterId: subId,
            obtainedScore: 45,
            data: { match: 'Finals', position: 'Winner' }
        }, { headers });
        console.log('Score Created:', scoreRes.data.id);

        // 4. Verify Score Retrival
        console.log('Verifying Score...');
        const getScore = await axios.get(`http://localhost:3000/scores/${scoreRes.data.id}`, { headers });
        if (getScore.data.obtainedScore === 45) {
            console.log('SUCCESS: Score verified.');
        } else {
            console.error('FAILED: Score mismatch', getScore.data);
        }

        // 5. Test Violation (Score > Max)
        console.log('Testing Validation (Score > Max)...');
        try {
            await axios.post('http://localhost:3000/scores', {
                studentId,
                subParameterId: subId,
                obtainedScore: 55, // Max is 50
                data: {}
            }, { headers });
            console.error('FAILED: Should have rejected score > max');
        } catch (e) {
            if (e.response && e.response.status === 400) {
                console.log('SUCCESS: correctly rejected invalid score.');
            } else {
                console.error('FAILED: Unexpected error', e.message);
            }
        }

    } catch (e) {
        console.error('Verification failed:', e.message);
        if (e.response) console.error(e.response.data);
    }
}

verify();
