require('dotenv').config(); 
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ ERROR: DATABASE_URL tidak ditemukan');
    throw new Error('DATABASE_URL is not set.');
}

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false },
    max: 20, 
    idleTimeoutMillis: 30000 
});

async function testDatabaseConnection() {
    let client;
    try {
        client = await pool.connect();
        await client.query('SELECT 1 + 1 AS solution'); 
        console.log('✅ Database connection successful!');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message); 
        return false;
    } finally {
        if (client) client.release();
    }
}

// EKSPOR SEBAGAI OBJEK
module.exports = {
    pool,
    testDatabaseConnection
};