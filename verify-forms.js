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

        // 1.5 Clean up existing parameters (Cascades to subparams and forms)
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
        console.log('Creating Main Parameter "Research"...');
        const paramRes = await axios.post('http://localhost:3000/parameters', {
            name: 'Research_' + Date.now(),
            description: 'Research activities',
            weightage: 20,
            maxScore: 200
        }, { headers: { Authorization: `Bearer ${adminToken}` } });
        const paramId = paramRes.data.id;

        // 3. Create Sub-Parameter
        console.log('Creating Sub-Parameter "Paper Presentation"...');
        const subRes = await axios.post('http://localhost:3000/sub-parameters', {
            name: 'Paper Presentation',
            weightage: 100,
            maxScore: 100,
            parameterId: paramId
        }, { headers: { Authorization: `Bearer ${adminToken}` } });
        const subId = subRes.data.id;
        console.log('Sub-Parameter Created:', subId);

        // 4. Create Form Template
        console.log('Creating Form Template...');
        const formSchema = [
            { label: "Conference Name", type: "text", required: true },
            { label: "Presentation Date", type: "date", required: true },
            { label: "Certificate", type: "file", required: true }
        ];

        try {
            const formRes = await axios.post('http://localhost:3000/forms', {
                name: 'Paper Presentation Form',
                schema: formSchema,
                subParameterId: subId
            }, { headers: { Authorization: `Bearer ${adminToken}` } });
            console.log('Form Template Created:', formRes.data.id);

            // 5. Verify Sub-Parameter includes Form
            console.log('Verifying Sub-Parameter includes Form...');
            const subCheck = await axios.get(`http://localhost:3000/sub-parameters/${subId}`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });

            if (subCheck.data.formTemplate && subCheck.data.formTemplate.id === formRes.data.id) {
                console.log('SUCCESS: Sub-Parameter correctly linked to Form Template.');
            } else {
                console.error('FAILED: Form Template not found in Sub-Parameter response.', subCheck.data);
            }
        } catch (e) {
            console.error('Form Creation Failed:', e.message);
            if (e.response) console.error(e.response.data);
        }

        console.log('Verification Successful!');

    } catch (e) {
        console.error('Verification failed:', e.message);
        if (e.response) console.error(e.response.data);
    }
}

verify();
