const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// 1. IMPORT ROUTES 
// Pastikan semua file di folder routes menggunakan 'module.exports = router;'
const authRoutes = require('./routes/auth');
const activitiesRoutes = require('./routes/activities');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin'); 
const relawanRoutes = require('./routes/relawan');

const app = express();

// 2. MIDDLEWARE KEAMANAN (HELMET)
app.use(helmet({
    contentSecurityPolicy: false, // Memudahkan integrasi frontend-backend
}));

// 3. KONFIGURASI CORS
const allowedOrigins = [
    'https://satuaksivolunteer.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 4. BODY PARSER
// Menangani data JSON dan Form-Data dengan batas ukuran 10mb
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' })); 

// 5. REQUEST LOGGER (Sangat membantu untuk debugging di Railway)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// 6. STATIC FOLDER
// Untuk akses file upload (CV/Portofolio)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// 7. PENDEFINISIAN ROUTE API
app.use('/api/auth', authRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/registrations', relawanRoutes); // Jalur utama pendaftaran relawan

// 8. HEALTH CHECK & WELCOME ROUTE
app.get('/', (req, res) => {
    res.status(200).json({ 
        status: 'success',
        message: 'Backend SatuAksi API is Running',
        version: '1.0.0'
    });
});

// 9. HANDLING 404 (Route Tidak Ditemukan)
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        message: `Endpoint ${req.originalUrl} tidak ditemukan pada server ini.` 
    });
});

// 10. GLOBAL ERROR HANDLER (Mencegah Server Mati Total)
app.use((err, req, res, next) => {
    console.error('SERVER_ERROR_LOG:', err.stack);
    
    const statusCode = err.status || 500;
    res.status(statusCode).json({ 
        success: false,
        message: err.message || 'Terjadi kesalahan pada internal server',
        error: process.env.NODE_ENV === 'development' ? err.stack : {} 
    });
});

module.exports = app;