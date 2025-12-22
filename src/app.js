const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Import Routes - Pastikan file-file ini ada di folder /routes
const authRoutes = require('./routes/auth');
const activitiesRoutes = require('./routes/activities');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin'); 
const relawanRoutes = require('./routes/relawan'); 
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

// 1. Middleware Keamanan
app.use(helmet());

// 2. Konfigurasi CORS - Diperketat untuk Vercel
app.use(cors({
    origin: 'https://satuaksivolunteer.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], 
    credentials: true, 
}));

// 3. Middleware Parsing
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// 4. Folder Statis untuk Uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// 5. Pemetaan Route API
app.use('/api/auth', authRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes); 

/** * FIX BARIS 42: Registrasi route pendaftaran
 * Pastikan variabel 'relawanRoutes' terdefinisi dari require di atas.
 */
app.use('/api/registrations', relawanRoutes); 

// Fallback untuk route lama
app.use('/v1/relawan', relawanRoutes); 

// 6. Route Terproteksi & Root
app.get('/api/protected', authMiddleware, (req, res) => {
    res.json({ message: 'Akses terproteksi berhasil', user: req.user });
});

app.get('/', (req, res) => {
    res.send('Server Backend SatuAksi Berjalan Lancar!');
});

// 7. Penanganan 404 (Not Found)
app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint tidak ditemukan' });
});

// 8. Penanganan Global Error (mencegah crash total)
app.use((err, req, res, next) => {
    console.error('SERVER_ERROR:', err.stack); 
    res.status(500).json({ 
        message: 'Terjadi kesalahan server internal', 
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error' 
    });
});

// 9. Port Binding untuk Railway
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server aktif di port ${PORT}`);
});

module.exports = app;