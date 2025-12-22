// Memastikan variabel lingkungan dari file .env dibaca oleh Node.js
require('dotenv').config(); 

const { Pool } = require('pg');

// Mengambil URL koneksi dari file .env
const connectionString = process.env.DATABASE_URL;

// Validasi jika DATABASE_URL tidak ditemukan
if (!connectionString) {
    console.error('❌ ERROR: Variabel DATABASE_URL tidak ditemukan di file .env');
    throw new Error('FATAL ERROR: DATABASE_URL environment variable is not set.');
}

// Konfigurasi koneksi ke PostgreSQL (Neon)
const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        // Neon mewajibkan SSL, baris ini sangat penting
        rejectUnauthorized: false
    },
    max: 20, 
    idleTimeoutMillis: 30000 
});

/**
 * Fungsi untuk mengetes koneksi database saat server pertama kali dijalankan
 */
async function testDatabaseConnection() {
    // Menampilkan host database di terminal untuk keperluan debug
    const host = connectionString.split('@')[1] ? connectionString.split('@')[1].split('/')[0] : 'unknown host';
    console.log('DEBUG: Mencoba menghubungkan ke:', host); 
    
    let client;
    try {
        client = await pool.connect();
        
        // Menjalankan query sederhana untuk memastikan koneksi aktif
        await client.query('SELECT 1 + 1 AS solution'); 
        
        console.log('✅ Database connection successful!');
        return true;

    } catch (error) {
        console.error('❌ Database connection failed.');
        console.error('   Pesan Error:', error.message); 
        return false;

    } finally {
        if (client) {
            client.release(); // Mengembalikan koneksi ke pool
        }
    }
}

// PERBAIKAN EKSPOR: Menggabungkan pool dan fungsi test agar bisa dipanggil semua
module.exports = {
    pool,
    testDatabaseConnection
};