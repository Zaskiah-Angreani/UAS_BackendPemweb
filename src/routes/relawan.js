const express = require('express');
const router = express.Router();
const { pool } = require('../db'); 

router.post('/', async (req, res) => {
    console.log("➡️ Menerima Request Pendaftaran..."); 
    console.log("📦 req.body:", JSON.stringify(req.body, null, 2)); // DEBUG: Lihat struktur data

    if (!pool) {
        console.error("❌ FATAL: Variabel 'pool' undefined.");
        return res.status(500).json({ message: "Server Misconfiguration" });
    }

    try {
        // ✅ PERBAIKAN: Ambil data langsung dari req.body
        const payload = req.body;

        // Validasi data wajib
        if (!payload.full_name || !payload.email || !payload.phone_number) {
            console.error("❌ Validasi gagal: Field wajib kosong");
            return res.status(400).json({ 
                success: false, 
                message: "Nama, email, dan nomor telepon wajib diisi" 
            });
        }

        console.log("📦 Data siap insert untuk:", payload.full_name); 

        const query = `
            INSERT INTO registrations (
                activity_id, full_name, date_of_birth, gender, phone_number, 
                email, profession, full_address, domicile_city, institution, 
                source_info, keahlian, commitment_time, chosen_division, motivation_text
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING id
        `;

        const values = [
            payload.activity_id || 0,
            payload.full_name,
            payload.date_of_birth || null,
            payload.gender || '-',
            payload.phone_number,
            payload.email,
            payload.profession || '-',
            payload.full_address || '-',
            payload.domicile_city || '-',
            payload.institution || '-',
            payload.source_info || '-',
            payload.keahlian || '-',
            payload.commitment_time || '-',
            payload.chosen_division || '-',
            payload.motivation_text || '-'
        ];

        const result = await pool.query(query, values);
        console.log("✅ Insert Berhasil, ID:", result.rows[0].id);
        
        res.status(201).json({ 
            success: true, 
            message: "Pendaftaran berhasil disimpan", 
            id: result.rows[0].id 
        });

    } catch (err) {
        console.error("🔥 ERROR DATABASE:", err.message); 
        console.error("Stack trace:", err.stack);
        
        res.status(500).json({ 
            success: false, 
            message: "Gagal menyimpan data", 
            errorDetail: err.message
        });
    }
});

module.exports = router;