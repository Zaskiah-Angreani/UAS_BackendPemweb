const pool = require('../db');

// --- 1. MEMULAI PENDAFTARAN (Inisialisasi ID) ---
exports.startRegistration = async (req, res) => {
    const userId = req.user.id; 
    const activity_id = req.body.activity_id || req.body.volunteer_id || 0;

    try {
        // Cek apakah user sudah pernah mendaftar di aktivitas ini
        const check = await pool.query(
            'SELECT id FROM registrations WHERE activity_id = $1 AND email = (SELECT email FROM users WHERE id = $2)',
            [activity_id, userId]
        );

        if (check.rows.length > 0) {
            return res.status(409).json({ 
                success: false, 
                message: 'Anda sudah memulai pendaftaran untuk aktivitas ini.' 
            });
        }

        // Buat record awal (Draft)
        const result = await pool.query(
            'INSERT INTO registrations (activity_id, full_name, email, phone_number) SELECT $1, name, email, phone FROM users WHERE id = $2 RETURNING id',
            [activity_id, userId]
        );

        res.status(200).json({
            success: true,
            registration_id: result.rows[0].id,
            message: 'Pendaftaran dimulai.'
        });
    } catch (err) {
        console.error('Error startRegistration:', err);
        res.status(500).json({ success: false, message: 'Gagal memulai pendaftaran.' });
    }
};

// --- 2. UPDATE LANGKAH 1 & PENYIMPANAN AKHIR (Mapping FE ke BE) ---
// Fungsi ini didesain untuk menangani "Kirim Pendaftaran" agar tidak Error 500
exports.updateStep1 = async (req, res) => {
    const registrationId = req.params.id;
    const d = req.body;

    // MAPPING: Menyesuaikan variabel bahasa Indonesia dari FE ke Kolom Database
    const data = {
        full_name: d.namaLengkap || d.full_name,
        date_of_birth: d.tanggalLahir || d.date_of_birth,
        gender: d.gender,
        phone_number: d.noTelepon || d.phone_number,
        email: d.email,
        profession: d.profession,
        full_address: d.alamatLengkap || d.full_address,
        domicile_city: d.domisili || d.domicile_city,
        institution: d.institution || '-',
        source_info: d.source || d.source_info,
        keahlian: Array.isArray(d.keahlian) ? d.keahlian.join(', ') : (d.keahlian || d.skills),
        chosen_division: d.divisi || d.chosen_division,
        motivation_text: d.motivasi || d.motivation_text,
        commitment_time: d.commitment_time || 'Fleksibel'
    };

    // Validasi Kolom NOT NULL sesuai skema Neon
    if (!data.full_name || !data.phone_number || !data.email) {
        return res.status(400).json({ success: false, message: 'Nama, Email, dan Telepon wajib diisi.' });
    }

    try {
        const query = `
            UPDATE registrations 
            SET full_name=$1, date_of_birth=$2, gender=$3, phone_number=$4, profession=$5, 
                full_address=$6, domicile_city=$7, institution=$8, source_info=$9,
                keahlian=$10, chosen_division=$11, motivation_text=$12, commitment_time=$13
            WHERE id = $14 
            RETURNING *;
        `;
        
        const values = [
            data.full_name, data.date_of_birth, data.gender, data.phone_number, data.profession, 
            data.full_address, data.domicile_city, data.institution, data.source_info,
            data.keahlian, data.chosen_division, data.motivation_text, data.commitment_time,
            registrationId
        ];
        
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Data pendaftaran tidak ditemukan.' });
        }

        // Kembalikan data lengkap agar FE tidak error "reading full_name"
        res.status(200).json({
            success: true,
            message: 'Pendaftaran berhasil diperbarui/disimpan.',
            data: result.rows[0] 
        });

    } catch (err) {
        console.error('Error updateStep:', err);
        res.status(500).json({ success: false, message: 'Gagal simpan ke Database: ' + err.message });
    }
};

// --- 3. AMBIL DATA PENDAFTARAN USER ---
exports.getRegistrationsByUser = async (req, res) => {
    try {
        const user_email = req.user.email; 
        const result = await pool.query(
            'SELECT * FROM registrations WHERE email = $1 ORDER BY submitted_at DESC',
            [user_email]
        );
        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Gagal mengambil riwayat.' });
    }
};

// --- 4. HAPUS PENDAFTARAN ---
exports.deleteRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM registrations WHERE id = $1', [id]);
        res.status(200).json({ success: true, message: 'Pendaftaran dihapus.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Gagal menghapus.' });
    }
};