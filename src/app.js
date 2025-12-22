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
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

// 2. MIDDLEWARE KEAMANAN & CORS
app.use(helmet({
    contentSecurityPolicy: false, // Memudahkan integrasi frontend-backend
}));

app.use(cors({
    origin: 'https://satuaksivolunteer.vercel.app', // Domain Vercel Anda
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. BODY PARSER
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// 4. STATIC FOLDER FOR UPLOADS
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// 5. PENDEFINISIAN ROUTE API
// Pastikan semua variabel route di atas (poin 1) mengekspor router dengan benar!
app.use('/api/auth', authRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes); 

/** * FIX BARIS 42: Registrasi route pendaftaran relawan
 * Ini yang menyebabkan crash sebelumnya jika relawanRoutes undefined.
 */
if (relawanRoutes) {
    app.use('/api/registrations', relawanRoutes);
    app.use('/v1/relawan', relawanRoutes);
}

// 6. HEALTH CHECK & PROTECTED ROUTE
app.get('/', (req, res) => {
    res.send('Server Backend SatuAksi Berjalan Lancar di Railway!');
});

app.get('/api/protected', authMiddleware, (req, res) => {
    res.json({ message: 'Akses terproteksi berhasil', user: req.user });
});

// 7. HANDLING 404
app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint tidak ditemukan' });
});

// 8. GLOBAL ERROR HANDLER (Mencegah Crash Total)
app.use((err, req, res, next) => {
    console.error('CRITICAL_SERVER_ERROR:', err.stack); 
    res.status(500).json({ 
        message: 'Terjadi kesalahan server internal', 
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error' 
    });
});

// 9. SERVER PORT BINDING FOR RAILWAY
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server aktif di port ${PORT}`);
});

module.exports = app;