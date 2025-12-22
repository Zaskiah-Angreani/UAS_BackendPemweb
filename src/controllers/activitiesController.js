const { pool } = require('../db'); 

/**
 * Validasi input data agar tidak ada field yang kosong saat Admin menambah/edit data
 */
const validateActivityData = (data) => {
    const requiredFields = ['title', 'category', 'description', 'event_day', 'event_time', 'location', 'image_url', 'status']; 
    for (const field of requiredFields) {
        if (!data[field]) {
            return `Field '${field}' wajib diisi dan tidak boleh kosong.`;
        }
    }
    return null; 
};

/**
 * GET ALL: Menampilkan semua aktivitas di halaman utama Aktivitas.jsx
 */
exports.getAll = async (req, res) => {
    try {
        // PERBAIKAN: Memastikan mengambil dari tabel 'volunteers' sesuai isi database Anda
        const result = await pool.query(
            'SELECT * FROM volunteers ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error in getAll:', err);
        res.status(500).json({ message: 'Gagal mengambil data aktivitas' });
    }
};

/**
 * GET BY ID: Digunakan saat kartu diklik untuk masuk ke halaman DetailAktivitas.jsx
 * Menghilangkan error 404.
 */
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;

        // PERBAIKAN: Mencari di tabel 'volunteers' berdasarkan ID yang dikirim dari Frontend
        const result = await pool.query(
            'SELECT * FROM volunteers WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ message: 'Aktivitas tidak ditemukan di database' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error in getById:', err);
        res.status(500).json({ message: 'Gagal mengambil detail aktivitas' });
    }
};

/**
 * CREATE: Digunakan oleh Admin untuk menambah konten baru
 */
exports.create = async (req, res) => {
    const data = req.body;
    
    const validationError = validateActivityData(data);
    if (validationError) {
        return res.status(400).json({ success: false, message: validationError });
    }

    const { 
        title, category, description, event_day, event_time, 
        location, image_url, status
    } = data;

    try {
        const query = `
            INSERT INTO volunteers 
            (title, category, description, event_day, event_time, location, image_url, status) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const values = [title, category, description, event_day, event_time, location, image_url, status];
        
        const result = await pool.query(query, values);

        res.status(201).json({ 
            success: true, 
            message: 'Aktivitas berhasil ditambahkan!', 
            activity: result.rows[0] 
        });

    } catch (err) {
        console.error('Error creating activity:', err.message);
        res.status(500).json({ success: false, message: 'Gagal menambahkan ke database.' });
    }
};

/**
 * UPDATE: Mengubah data aktivitas yang sudah ada
 */
exports.update = async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    const validationError = validateActivityData(data);
    if (validationError) {
        return res.status(400).json({ success: false, message: validationError });
    }

    const { title, category, description, event_day, event_time, location, image_url, status } = data;

    try {
        const query = `
            UPDATE volunteers
            SET title = $1, category = $2, description = $3, event_day = $4, event_time = $5, 
                location = $6, image_url = $7, status = $8
            WHERE id = $9
            RETURNING *
        `;
        const values = [title, category, description, event_day, event_time, location, image_url, status, id];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Aktivitas tidak ditemukan.' });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Aktivitas berhasil diupdate!', 
            activity: result.rows[0] 
        });

    } catch (err) {
        console.error('Error updating activity:', err.message);
        res.status(500).json({ success: false, message: 'Gagal mengupdate database.' });
    }
};

/**
 * DELETE: Menghapus aktivitas dari database
 */
exports.delete = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM volunteers WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Aktivitas tidak ditemukan.' });
        }

        res.status(200).json({ 
            success: true, 
            message: `Aktivitas ID ${id} berhasil dihapus.`
        });

    } catch (err) {
        console.error('Error deleting activity:', err.message);
        res.status(500).json({ success: false, message: 'Gagal menghapus data.' });
    }
};