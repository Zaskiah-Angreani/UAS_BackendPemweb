require('dotenv').config(); // Memastikan environment variables terbaca paling awal
const app = require('./app');
const testDatabaseConnection = require('./db'); // Mengimpor fungsi tes koneksi dari db.js

const PORT = process.env.PORT || 4000;

/**
 * Jalankan tes koneksi database sebelum menyalakan server Express.
 * Ini memastikan backend tidak berjalan jika "kabel" ke Neon masih putus.
 */
testDatabaseConnection().then((isConnected) => {
    if (isConnected) {
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`✅ Backend siap melayani request dari Frontend!`);
        });
    } else {
        console.error('❌ Server gagal dijalankan karena masalah database.');
        // Berikan jeda sebelum menutup proses jika diperlukan untuk melihat log
        process.exit(1); 
    }
}).catch(err => {
    console.error('❌ Terjadi error fatal saat inisialisasi:', err.message);
    process.exit(1);
});