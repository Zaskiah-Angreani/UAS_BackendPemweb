const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path'); const authRoutes = require('./routes/auth');
const activitiesRoutes = require('./routes/activities');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin'); 
const relawanRoutes = require('./routes/relawan'); 
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
app.use(helmet());
app.use(cors({
    origin: 'https://satuaksivolunteer.vercel.app', // Tambahkan https:// dan // yang benar
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], 
    credentials: true, 
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/v1/relawan', relawanRoutes); 
app.get('/api/protected', authMiddleware, (req, res) => {
    res.json({ message: 'Akses terproteksi berhasil', user: req.user });
});
app.get('/', (req, res) => {
    res.send('Server Backend SatuAksi Berjalan!');
});
app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint tidak ditemukan' });
});
app.use((err, req, res, next) => {
    console.error(err.stack); 
    res.status(500).json({ 
        message: 'Terjadi kesalahan server internal', 
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error' 
    });
});

module.exports = app;