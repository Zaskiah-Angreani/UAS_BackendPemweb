// routes/relawan.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db'); // Pastikan koneksi DB Neon sudah benar

router.post('/', async (req, res) => {
    try {
        // Parsing data dari FormData frontend
        const data = typeof req.body.relawanData === 'string' 
            ? JSON.parse(req.body.relawanData) 
            : req.body;

        const query = `
            INSERT INTO registrations (
                activity_id, full_name, date_of_birth, gender, phone_number, 
                email, profession, full_address, domicile_city, institution, 
                source_info, keahlian, commitment_time, chosen_division, motivation_text
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING id
        `;

        const values = [
            data.activity_id, data.full_name, data.date_of_birth, data.gender, data.phone_number,
            data.email, data.profession, data.full_address, data.domicile_city, data.institution,
            data.source_info, data.keahlian, data.commitment_time, data.chosen_division, data.motivation_text
        ];

        const result = await pool.query(query, values);
        res.status(201).json({ 
            success: true, 
            registrationId: result.rows[0].id,
            message: "Data berhasil disimpan ke Neon" 
        });

    } catch (err) {
        console.error("DATABASE ERROR:", err.message); 
        res.status(500).json({ message: "Gagal menyimpan data", error: err.message });
    }
});

// WAJIB TAMBAHKAN INI AGAR APP.JS TIDAK CRASH
module.exports = router;