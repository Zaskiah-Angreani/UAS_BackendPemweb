const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// 1. IMPORT ROUTES 
// Pastikan file-file di bawah ini melakukan 'module.exports = router;'
const authRoutes = require('./routes/auth');
const activitiesRoutes = require('./routes/activities');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin'); 
const relawanRoutes = require('./routes/relawan'); // Pastikan ini benar
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

// 2. MIDDLEWARE KEAMANAN & CORS
app.use(helmet({
    contentSecurityPolicy: false,
}));

app.use(cors({
    origin: '*', // Sementara gunakan '*' untuk memastikan CORS tidak memblokir saat debugging
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. BODY PARSER (Wajib untuk membaca JSON dari Frontend)
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// 4. STATIC FOLDER
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// 5. PENDEFINISIAN ROUTE API
// PERBAIKAN: Jangan gunakan 'if (relawanRoutes)' secara kondisional jika itu handler utama
app.use('/api/auth', authRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/registrations', relawanRoutes); // Jalur utama pendaftaran

// 6. HEALTH CHECK
app.get('/', (req, res) => {
    res.send('Server Backend SatuAksi Berjalan Lancar di Railway!');
});

// 7. HANDLING 404
app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint tidak ditemukan' });
});

// 8. GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
    console.error('CRITICAL_SERVER_ERROR:', err.stack); 
    res.status(500).json({ 
        success: false,
        message: 'Terjadi kesalahan server internal', 
        error: err.message 
    });
});

module.exports = app;