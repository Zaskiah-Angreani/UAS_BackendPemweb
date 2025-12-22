const app = require('./app');
const { testDatabaseConnection } = require('./db'); 

const PORT = process.env.PORT || 8080;

testDatabaseConnection().then((isConnected) => {
    if (isConnected) {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server Railway Aktif di Port ${PORT}`);
        });
    } else {
        console.error('❌ Server berhenti karena masalah database.');
        process.exit(1);
    }
});