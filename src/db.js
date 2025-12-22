require('dotenv').config(); 
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000 
});

async function testDatabaseConnection() {
    let client;
    try {
        client = await pool.connect();
        await client.query('SELECT 1 + 1'); 
        console.log('✅ Database Neon Terhubung!');
        return true;
    } catch (error) {
        console.error('❌ Koneksi Database Gagal:', error.message); 
        return false;
    } finally {
        if (client) client.release();
    }
}

module.exports = { pool, testDatabaseConnection };