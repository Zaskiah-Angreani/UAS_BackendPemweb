const express = require('express');
const router = express.Router();
// WAJIB PAKAI KURUNG KURAWAL { } KARENA db.js MENG-EXPORT OBJECT
const { pool } = require('../db'); 

router.post('/', async (req, res) => {
    console.log("➡️ Menerima Request Pendaftaran..."); 

    // Cek darurat: Apakah pool terbaca?
    if (!pool) {
        console.error("❌ FATAL: Variabel 'pool' undefined. Cek export db.js!");
        return res.status(500).json({ message: "Server Misconfiguration: Database pool missing" });
    }

    try {
        // Parsing Data Aman
        const payload = typeof req.body.relawanData === 'string' 
            ? JSON.parse(req.body.relawanData) 
            : req.body;

        console.log("📦 Data siap insert untuk:", payload.full_name); 

        const query = `
            INSERT INTO registrations (
                activity_id, full_name, date_of_birth, gender, phone_number, 
                email, profession, full_address, domicile_city, institution, 
                source_info, keahlian, commitment_time, chosen_division, motivation_text
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING id
        `;

        // Gunakan string kosong/default biar tidak error constraint database
        const values = [
            String(payload.activity_id || '0'),
            payload.full_name || '-',
            payload.date_of_birth || null,
            payload.gender || '-',
            payload.phone_number || '-',
            payload.email || '-',
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
            message: "Berhasil disimpan", 
            id: result.rows[0].id 
        });

    } catch (err) {
        // Log Error Asli ke Railway Console (PENTING UNTUK DIAGNOSIS)
        console.error("🔥 ERROR DATABASE:", err); 
        
        res.status(500).json({ 
            success: false, 
            message: "Gagal menyimpan data", 
            errorDetail: err.message // Kirim pesan error ke frontend biar kelihatan
        });
    }
});

module.exports = router;