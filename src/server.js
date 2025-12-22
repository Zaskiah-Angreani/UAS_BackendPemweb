const app = require('./app');
// WAJIB PAKAI KURUNG KURAWAL { } AGAR TIDAK ERROR "NOT A FUNCTION"
const { testConnection } = require('./db'); 

const PORT = process.env.PORT || 8080;

testConnection().then((success) => {
  if (success) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server berjalan aman di port ${PORT}`);
    });
  } else {
    console.error('💀 Server mati: Koneksi DB gagal.');
    process.exit(1);
  }
});