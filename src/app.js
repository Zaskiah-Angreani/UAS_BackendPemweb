const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Import Routes
const authRoutes = require('./routes/auth');
const activitiesRoutes = require('./routes/activities');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin'); 
const relawanRoutes = require('./routes/relawan'); // File ini akan menangani pendaftaran
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

// Middleware Keamanan & Akses
app.use(helmet());
app.use(cors({
    origin: 'https://satuaksivolunteer.vercel.app', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], 
    credentials: true, 
}));

// Middleware Parsing Data
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// Folder Statis untuk Upload File
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Pemetaan Route API
app.use('/api/auth', authRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes); 

/**
 * PERBAIKAN UTAMA:
 * Menghubungkan endpoint /api/registrations yang dipanggil frontend 
 * ke logic yang ada di relawanRoutes.
 */
app.use('/api/registrations', relawanRoutes); 

// Fallback jika Anda masih menggunakan prefix v1 di bagian lain
app.use('/v1/relawan', relawanRoutes); 

// Route Terproteksi (Contoh)
app.get('/api/protected', authMiddleware, (req, res) => {
    res.json({ message: 'Akses terproteksi berhasil', user: req.user });
});

// Root Endpoint
app.get('/', (req, res) => {
    res.send('Server Backend SatuAksi Berjalan!');
});

// Penanganan Route Tidak Ditemukan (404)
app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint tidak ditemukan' });
});

// Penanganan Global Error (500)
app.use((err, req, res, next) => {
    console.error(err.stack); 
    res.status(500).json({ 
        message: 'Terjadi kesalahan server internal', 
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error' 
    });
});

module.exports = app;