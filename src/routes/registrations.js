const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { pool } = require('../db');

// ========================================
// KONFIGURASI MULTER UNTUK UPLOAD FILE
// ========================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Pastikan folder ini ada!
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'CV-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|docx|doc|jpg|jpeg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Format file tidak didukung! Gunakan PDF, DOCX, atau gambar.'));
        }
    }
});

// ========================================
// FUNGSI HELPER: FORMAT TANGGAL
// ========================================
const formatSqlDate = (dateString) => {
    if (!dateString) return null;
    
    // Jika sudah format YYYY-MM-DD
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
    }
    
    // Jika format DD/MM/YYYY (dari frontend)
    if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month}-${day}`;
    }
    
    // Coba parse sebagai Date object
    try {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    } catch (e) {
        return null;
    }
    
    return null;
};

// ========================================
// ENDPOINT UTAMA: POST /api/registrations
// ========================================
router.post('/', upload.single('portofolio'), async (req, res) => {
    console.log('\n========================================');
    console.log('📥 INCOMING REGISTRATION REQUEST');
    console.log('========================================');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    
    let relawanData;
    
    // 1. PARSING DATA JSON
    try {
        if (!req.body.relawanData) {
            throw new Error('Field relawanData tidak ditemukan dalam request');
        }
        relawanData = JSON.parse(req.body.relawanData);
        console.log('✅ Data berhasil di-parse:', relawanData);
    } catch (err) {
        console.error('❌ Error parsing relawanData:', err.message);
        return res.status(400).json({ 
            success: false, 
            message: 'Format data tidak valid atau field relawanData hilang',
            detail: err.message
        });
    }
    
    // 2. VALIDASI FILE PORTOFOLIO
    if (!req.file) {
        return res.status(400).json({ 
            success: false, 
            message: 'File Portofolio/CV wajib diunggah!' 
        });
    }
    
    // 3. VALIDASI DATA WAJIB
    const requiredFields = ['full_name', 'email', 'phone_number', 'activity_id'];
    const missingFields = requiredFields.filter(field => !relawanData[field]);
    
    if (missingFields.length > 0) {
        return res.status(400).json({
            success: false,
            message: `Field wajib tidak lengkap: ${missingFields.join(', ')}`
        });
    }
    
    // 4. EKSTRAK & FORMAT DATA
    const {
        activity_id, full_name, date_of_birth, gender, phone_number, email,
        profession, full_address, domicile_city, institution, source_info,
        keahlian, commitment_time, chosen_division, motivation_text
    } = relawanData;
    
    const finalActivityId = parseInt(activity_id);
    if (isNaN(finalActivityId) || finalActivityId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'ID Program tidak valid'
        });
    }
    
    const formattedDateOfBirth = formatSqlDate(date_of_birth);
    const cvPath = req.file.path.replace(/\\/g, '/');
    
    // 5. SIMPAN KE DATABASE
    try {
        const query = `
            INSERT INTO registrations (
                activity_id, full_name, date_of_birth, gender, phone_number, 
                email, profession, full_address, domicile_city, institution, 
                source_info, keahlian, commitment_time, chosen_division, 
                motivation_text, cv_url, submitted_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
            RETURNING id, full_name, email, activity_id, submitted_at
        `;
        
        const values = [
            finalActivityId,              // $1
            full_name,                    // $2
            formattedDateOfBirth,         // $3
            gender || null,               // $4
            phone_number,                 // $5
            email,                        // $6
            profession || null,           // $7
            full_address || null,         // $8
            domicile_city || null,        // $9
            institution || null,          // $10
            source_info || null,          // $11
            keahlian || null,             // $12
            commitment_time || null,      // $13
            chosen_division || null,      // $14
            motivation_text || null,      // $15
            cvPath                        // $16
        ];
        
        console.log('📤 Executing SQL with values:', values);
        
        const result = await pool.query(query, values);
        const savedData = result.rows[0];
        
        console.log('✅ Data berhasil disimpan:', savedData);
        console.log('========================================\n');
        
        // RESPONSE SUKSES DENGAN DATA LENGKAP
        res.status(201).json({
            success: true,
            message: 'Pendaftaran relawan berhasil!',
            data: {
                id: savedData.id,
                full_name: savedData.full_name,
                email: savedData.email,
                activity_id: savedData.activity_id,
                submitted_at: savedData.submitted_at
            }
        });
        
    } catch (err) {
        console.error('❌ DATABASE ERROR:', err);
        console.error('Error Code:', err.code);
        console.error('Error Detail:', err.detail);
        console.error('========================================\n');
        
        // HAPUS FILE JIKA GAGAL SIMPAN KE DB
        const fs = require('fs');
        if (fs.existsSync(cvPath)) {
            fs.unlinkSync(cvPath);
            console.log('🗑️ File upload dihapus karena gagal simpan DB');
        }
        
        // ERROR HANDLING SPESIFIK
        let errorMessage = 'Gagal menyimpan pendaftaran ke database';
        
        if (err.code === '23502') { // NOT NULL violation
            errorMessage = 'Ada field wajib yang kosong. Periksa data Anda.';
        } else if (err.code === '23503') { // FOREIGN KEY violation
            errorMessage = `Program dengan ID ${finalActivityId} tidak ditemukan.`;
        } else if (err.code === '23505') { // UNIQUE violation
            errorMessage = 'Email atau nomor telepon sudah terdaftar.';
        }
        
        res.status(500).json({
            success: false,
            message: errorMessage,
            detail: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// ========================================
// ENDPOINT TAMBAHAN (OPSIONAL)
// ========================================

// GET /api/registrations/:id - Ambil detail pendaftaran
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM registrations WHERE id = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Pendaftaran tidak ditemukan'
            });
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error fetching registration:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data pendaftaran'
        });
    }
});

module.exports = router;