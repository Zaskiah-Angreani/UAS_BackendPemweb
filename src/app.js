const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// 1. IMPORT ROUTES 
const authRoutes = require('./routes/auth');
const activitiesRoutes = require('./routes/activities');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin'); 
const relawanRoutes = require('./routes/relawan');

const app = express();

// 2. MIDDLEWARE KEAMANAN & CORS
app.use(helmet({
    contentSecurityPolicy: false,
}));

app.use(cors({
    origin: [
        'https://satuaksivolunteer.vercel.app',
        'http://localhost:3000',
        'http://localhost:5173'
    ], // ✅ Lebih aman daripada '*'
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. BODY PARSER (Wajib untuk membaca JSON dari Frontend)
app.use(express.json({ limit: '10mb' })); // ✅ Tambah limit untuk file besar
app.use(express.urlencoded({ extended: true, limit: '10mb' })); 

// 4. LOGGING MIDDLEWARE (untuk debugging)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
    console.log('Body:', req.body);
    next();
});

// 5. STATIC FOLDER
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// 6. PENDEFINISIAN ROUTE API
app.use('/api/auth', authRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/registrations', relawanRoutes); // ✅ Pastikan ini mengarah ke router.post('/')

// 7. HEALTH CHECK
app.get('/', (req, res) => {
    res.json({ 
        status: 'ok',
        message: 'Server Backend SatuAksi Berjalan Lancar di Railway!',
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        database: 'connected', // Bisa ditambah test DB di sini
        timestamp: new Date().toISOString()
    });
});

// 8. HANDLING 404
app.use((req, res) => {
    console.log(`❌ 404 - Route tidak ditemukan: ${req.method} ${req.path}`);
    res.status(404).json({ 
        success: false,
        message: `Endpoint ${req.path} tidak ditemukan` 
    });
});

// 9. GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
    console.error('🔥 CRITICAL_SERVER_ERROR:', err.stack); 
    res.status(err.status || 500).json({ 
        success: false,
        message: 'Terjadi kesalahan server internal', 
        error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
    });
});

module.exports = app;