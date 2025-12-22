require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Wajib untuk Neon
  max: 20,
  idleTimeoutMillis: 30000
});

// Fungsi test koneksi (dipakai server.js)
const testConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ Cek Koneksi Database: BERHASIL');
    return true;
  } catch (err) {
    console.error('❌ Cek Koneksi Database: GAGAL', err.message);
    return false;
  }
};

// EKSPOR SEBAGAI OBJECT (PENTING!)
module.exports = { pool, testConnection };