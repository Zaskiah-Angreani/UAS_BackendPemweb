// Gunakan destructuring { pool } agar sesuai dengan db.js Anda
const { pool } = require('../db');

exports.createMessage = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'Nama, Email, dan Pesan wajib diisi' 
            });
        }

        // Memastikan nama tabel adalah contact_messages sesuai SQL di atas
        const result = await pool.query(
            'INSERT INTO contact_messages (name, email, phone, message) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, phone || null, message]
        );

        res.status(201).json({
            success: true,
            message: 'Pesan berhasil dikirim',
            data: result.rows[0]
        });
        
    } catch (err) {
        console.error('Error createMessage:', err);
        res.status(500).json({ 
            success: false,
            message: 'Gagal mengirim pesan kontak. Terjadi kesalahan pada server.' 
        });
    }
};

exports.getAllMessages = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM contact_messages ORDER BY created_at DESC'
        );
        
        res.status(200).json({
            success: true,
            messages: result.rows
        });
        
    } catch (err) {
        console.error('Error getAllMessages:', err);
        res.status(500).json({ 
            success: false,
            message: 'Gagal mengambil pesan masuk' 
        });
    }
};