const express = require('express');
const router = express.Router();
// PERBAIKAN: Gunakan destructuring { pool }
const { pool } = require('../db'); 

router.post('/', async (req, res) => {
    console.log("📥 Data Masuk:", req.body);

    const data = req.body;

    // Validasi Minimal
    if (!data.full_name || !data.email || !data.phone_number) {
        return res.status(400).json({ 
            success: false, 
            message: "Nama, Email, dan No HP wajib diisi!" 
        });
    }

    try {
        const query = `
            INSERT INTO registrations (
                activity_id, full_name, date_of_birth, gender, phone_number, 
                email, profession, full_address, domicile_city, institution, 
                source_info, keahlian, commitment_time, chosen_division, motivation_text
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING id;
        `;

        const values = [
            data.activity_id || 0,
            data.full_name,
            data.date_of_birth || null,
            data.gender || '-',
            data.phone_number,
            data.email,
            data.profession || '-',
            data.full_address || '-',
            data.domicile_city || '-',
            data.institution || '-',
            data.source_info || '-',
            data.keahlian || '-',
            data.commitment_time || '-',
            data.chosen_division || '-',
            data.motivation_text || '-'
        ];

        const result = await pool.query(query, values);
        
        res.status(201).json({ 
            success: true, 
            message: "Pendaftaran Berhasil!", 
            id: result.rows[0].id 
        });

    } catch (err) {
        console.error("🔥 DATABASE_ERROR:", err.message);
        res.status(500).json({ 
            success: false, 
            message: "Gagal menyimpan ke database",
            error: err.message 
        });
    }
});

module.exports = router;