const express = require('express');
const router = express.Router();
const { pool } = require('../db'); 

router.post('/', async (req, res) => {
    // Log ini sangat penting agar Anda bisa lihat di Railway Logs apa yang sebenarnya masuk
    console.log("DATA DARI FRONTEND:", req.body);

    try {
        // Parsing data: Menangani jika data dikirim sebagai string atau object
        let data = req.body;
        if (req.body.relawanData) {
            data = typeof req.body.relawanData === 'string' 
                ? JSON.parse(req.body.relawanData) 
                : req.body.relawanData;
        }

        const query = `
            INSERT INTO registrations (
                activity_id, full_name, date_of_birth, gender, phone_number, 
                email, profession, full_address, domicile_city, institution, 
                source_info, keahlian, commitment_time, chosen_division, motivation_text
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING id
        `;

        // Menggunakan operator || untuk memastikan tidak ada nilai null yang bikin error database
        const values = [
            String(data.activity_id || '0'),
            String(data.full_name || 'No Name'),
            data.date_of_birth || null,
            String(data.gender || '-'),
            String(data.phone_number || '-'),
            String(data.email || '-'),
            String(data.profession || '-'),
            String(data.full_address || '-'),
            String(data.domicile_city || '-'),
            String(data.institution || '-'),
            String(data.source_info || '-'),
            String(data.keahlian || '-'),
            String(data.commitment_time || '-'),
            String(data.chosen_division || '-'),
            String(data.motivation_text || '-')
        ];

        const result = await pool.query(query, values);
        
        return res.status(201).json({ 
            success: true, 
            message: "Data Berhasil Masuk!", 
            id: result.rows[0].id 
        });

    } catch (err) {
        // Ini akan muncul di Railway Logs jika pendaftaran gagal lagi
        console.error("DATABASE ERROR DETAIL:", err.message);
        return res.status(500).json({ 
            success: false, 
            message: "Gagal menyimpan data", 
            error: err.message 
        });
    }
});

module.exports = router;