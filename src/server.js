const app = require('./app');
// PERHATIKAN TANDA KURUNG KURAWAL DI BAWAH INI:
const { testDatabaseConnection } = require('./db'); 

const PORT = process.env.PORT || 8080;

// Menjalankan test koneksi sebelum start server
testDatabaseConnection().then((isConnected) => {
    if (isConnected) {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } else {
        console.error('❌ Server gagal start karena koneksi database error.');
        process.exit(1);
    }
});