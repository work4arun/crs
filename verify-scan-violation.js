const axios = require('axios');

async function verify() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:3000/auth/login', {
            email: 'admin@rathinam.in',
            password: 'password123'
        });
        const token = loginRes.data.access_token;
        const headers = { Authorization: `Bearer ${token}` };

        // 2. Mock Fetch Student (simulating scan of existing student)
        // We need a student with a known QR code.
        // Let's first list students to get one.
        console.log('Fetching a student...');
        const studentsRes = await axios.get('http://localhost:3000/students', { headers });
        if (studentsRes.data.length === 0) {
            throw new Error('No students found. Please seed or upload students.');
        }
        const student = studentsRes.data[0];
        const qrCode = student.qrCode; // This should exist as per schema default uuid
        console.log(`Found student: ${student.name} (${student.registerNumber}), QR: ${qrCode}`);

        // 3. Test QR Lookup Endpoint
        console.log('Testing QR Lookup...');
        const qrRes = await axios.get(`http://localhost:3000/students/qr/${qrCode}`, { headers });
        if (qrRes.data.id === student.id) {
            console.log('SUCCESS: Student found by QR code.');
        } else {
            console.error('FAILED: Student lookup mismatch.', qrRes.data);
        }

        // 4. Create Violation Type (if not exists)
        console.log('Ensuring Violation Type exists...');
        // We already have some from previous step? Let's create one specifically for test.
        const createVioRes = await axios.post('http://localhost:3000/violations', {
            name: 'Uniform Violation_' + Date.now(),
            penalty: 10,
            severity: 'LOW'
        }, { headers });
        const violationTypeId = createVioRes.data.id;

        // 5. Record Violation
        console.log('Recording Violation...');
        const recordRes = await axios.post('http://localhost:3000/violations/record', {
            studentId: student.id,
            violationTypeId: violationTypeId,
            comments: 'Caught during verify script'
        }, { headers });
        console.log('Recorded Violation ID:', recordRes.data.id);

        // 6. Verify Violation Record (Check if student has violation)
        // We don't have a direct endpoint to get StudentViolations yet (except maybe via Student include?).
        // Schema has 'violations' relation on Student.
        // Does GET /students/:id include violations?
        // Let's check update of StudentsService.findOne if necessary.
        // Or check GET /violations (list of Types) ? No, that's types.
        // The record endpoint returned the created object. If status is 201, it's good.
        // Let's allow implicit success if 201.
        if (recordRes.status === 201) {
            console.log('SUCCESS: Violation recorded successfully.');
        }

    } catch (e) {
        console.error('Verification failed:', e.message);
        if (e.response) console.error(e.response.data);
    }
}

verify();
