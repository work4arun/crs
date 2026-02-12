
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

// Try to load dotenv
try {
    require('dotenv').config();
} catch (e) {
    console.log('⚠️  dotenv not found or failed to load. Relying on system env vars.');
}

async function diagnose() {
    console.log('\n🔍 --- STARTING DIAGNOSTICS --- 🔍\n');

    // 1. Environment Variables
    console.log('1️⃣  Checking Environment Variables...');
    const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
    const missing = requiredVars.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error(`❌ FAILED: Missing environment variables: ${missing.join(', ')}`);
    } else {
        console.log('✅ SUCCESS: All required environment variables are present.');
    }

    // 2. Database Connectivity
    console.log('\n2️⃣  Testing Database Connection...');
    const prisma = new PrismaClient({
        log: ['error', 'warn'],
    });

    try {
        console.log(`   Attempting to connect to: ${process.env.DATABASE_URL?.split('@')[1] || 'URL not set'}`); // Mask credentials
        await prisma.$connect();
        console.log('✅ SUCCESS: Connected to the database!');

        // Simple query to verify read access
        const userCount = await prisma.user.count();
        console.log(`   ℹ️  Current User Count: ${userCount}`);

    } catch (error) {
        console.error('❌ FAILED: Database connection failed.');
        console.error('   Error Message:', error.message);
        console.error('   Hint: Check if your VPS IP is allowed in the Database Firewall.');
    } finally {
        await prisma.$disconnect();
    }

    // 3. Native Modules (Bcrypt)
    console.log('\n3️⃣  Testing Native Modules (Bcrypt)...');
    try {
        const start = Date.now();
        const hash = await bcrypt.hash('test_password', 10);
        const isValid = await bcrypt.compare('test_password', hash);
        const duration = Date.now() - start;

        if (isValid) {
            console.log(`✅ SUCCESS: Bcrypt is working correctly (took ${duration}ms).`);
        } else {
            console.error('❌ FAILED: Bcrypt validation failed. Logical error.');
        }
    } catch (error) {
        console.error('❌ FAILED: Bcrypt crashed.');
        console.error('   Error:', error.message);
        console.error('   Hint: You might need to rebuild dependencies. Run: npm rebuild bcrypt --build-from-source');
    }

    console.log('\n🏁 --- DIAGNOSTICS COMPLETE --- 🏁\n');
}

diagnose();
