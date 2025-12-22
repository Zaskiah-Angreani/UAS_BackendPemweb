const pool = require('../db'); 
const fs = require('fs'); 
const deleteUploadedFile = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        console.log(`Menghapus file yang gagal disimpan di DB: ${filePath}`);
        fs.unlinkSync(filePath);
    }
};

const formatSqlDate = (dateString) => {
    if (!dateString) return null;
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
    }
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

exports.daftarRelawan = async (req, res) => {
    let relawanData;
    const portofolioPath = req.file ? req.file.path : null; 

    try {
        if (!req.body.relawanData) {
            throw new Error('Data pendaftaran utama (relawanData) hilang.');
        }
        relawanData = JSON.parse(req.body.relawanData);
    } catch (e) {
        deleteUploadedFile(portofolioPath);
        return res.status(400).json({ success: false, message: 'Format data pendaftaran tidak valid atau data relawanData hilang.' });
    }

    if (!portofolioPath) {
        return res.status(400).json({ success: false, message: 'File Portofolio/CV wajib diunggah.' });
    }

    const { 
        registration_id, full_name, date_of_birth, gender, phone_number, email, 
        profession, full_address, domicile_city, institution, source_info,
        keahlian, commitment_time, chosen_division, motivation_text 
    } = relawanData;

    const finalRegistrationId = parseInt(registration_id); 
    
    if (isNaN(finalRegistrationId) || finalRegistrationId <= 0) {
        deleteUploadedFile(portofolioPath);
        return res.status(400).json({ success: false, message: 'ID Program tidak valid (NaN/<=0). Silakan kembali ke halaman program.' });
    }

    const formattedDateOfBirth = formatSqlDate(date_of_birth);

    console.log('--- NILAI YANG DIKIRIM KE POSTGRES (FINAL) ---');
    console.log(`$1 (registrationId): ${finalRegistrationId}`); 
    console.log(`$2 (full_name): ${full_name || null}`);
    console.log(`$16 (email): ${email || null}`); 
    console.log('------------------------------------------------');

    try {
       const query = `
            INSERT INTO registration_details (
                registration_id, full_name, date_of_birth, gender, phone_number, profession, 
                full_address, domicile_city, institution, source_info, 
                motivation_text, commitment_time, chosen_division, cv_url, status, email, keahlian, submitted_at
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
            RETURNING id as "registrationId"
        `;
    
        const values = [
            finalRegistrationId,              
            full_name || null,           
            formattedDateOfBirth,         
            gender || null,               
            phone_number || null,        
            profession || null,          
            full_address || null,        
            domicile_city || null,       
            institution || null,         
            source_info || null,         
            motivation_text || null,      
            commitment_time || null,     
            chosen_division || null,      
            portofolioPath.replace(/\\/g, '/'), 
            'PENDING',                   
            email || null,               
            keahlian || null             
        ];
        
        const result = await pool.query(query, values);
        
        res.status(201).json({ 
            success: true, 
            message: 'Pendaftaran relawan berhasil!', 
            registrationId: result.rows[0].registrationId
        });

    } catch (err) {
        console.error('\n=================================================');
        console.error('SERVER FATAL POSTGRES ERROR (500):', err); 
        console.error('=================================================\n');

        deleteUploadedFile(portofolioPath); 
        
        let customMessage = `Gagal mendaftar relawan. Terjadi kesalahan Database.`;
        if (err.code === '23502') { // error NOT NULL
            customMessage = `DB ERROR: Ada data wajib (NOT NULL) yang kosong. Cek Log Server!`;
        } else if (err.code === '23503') { // error FOREIGN KEY
             customMessage = `DB ERROR: Program ID ${finalRegistrationId} tidak ditemukan (Foreign Key Violation).`;
        } else if (err.code === '23505') { // error UNIQUE constraint
             customMessage = `DB ERROR: Email/Nomor Telepon sudah terdaftar.`;
        } else if (err.message) {
            customMessage = `DB ERROR: ${err.message}`;
        }
        
        res.status(500).json({ 
            success: false, 
            message: customMessage,
            detail: err.message || 'Kesalahan server yang tidak terduga.'
        });
    }
};