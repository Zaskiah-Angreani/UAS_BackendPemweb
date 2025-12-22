const pool = require('../db');
exports.startRegistration = async (req, res) => {
    const userId = req.user.id; 
    const { volunteer_id } = req.body;

    if (!volunteer_id) {
        return res.status(400).json({ success: false, message: 'ID Volunteer wajib diisi' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');   const regQuery = `
            INSERT INTO volunteer_registrations (user_id, volunteer_id) 
            VALUES ($1, $2)
            ON CONFLICT (user_id, volunteer_id) DO NOTHING
            RETURNING id;
        `;
        const regValues = [userId, volunteer_id];
        let regResult = await client.query(regQuery, regValues);
        
        let registrationId;

        if (regResult.rows.length === 0) {
            
            const existingReg = await client.query(
                'SELECT id FROM volunteer_registrations WHERE user_id = $1 AND volunteer_id = $2',
                regValues
            );
            registrationId = existingReg.rows[0].id;
            
            const detailCheck = await client.query(
                'SELECT status FROM registration_details WHERE registration_id = $1',
                [registrationId]
            );

            if (detailCheck.rows.length > 0 && detailCheck.rows[0].status !== 'draft') {
                   await client.query('ROLLBACK');
                 return res.status(409).json({
                    success: false,
                    message: 'Anda sudah menyelesaikan pendaftaran untuk aktivitas ini.'
                });
            }
        } else {
               registrationId = regResult.rows[0].id;
            const detailQuery = `
                INSERT INTO registration_details (registration_id, status) 
                VALUES ($1, 'draft')
                RETURNING *;
            `;
            await client.query(detailQuery, [registrationId]);
        }
        
        await client.query('COMMIT'); 
        res.status(200).json({
            success: true,
            message: 'Pendaftaran dimulai. Lanjutkan mengisi detail formulir.',
            registration_id: registrationId 
        });

    } catch (err) {
        await client.query('ROLLBACK'); 
        console.error('Error startRegistration:', err);
        res.status(500).json({ success: false, message: 'Gagal memulai pendaftaran di database.' });
    } finally {
        client.release();
    }
};


exports.updateStep1 = async (req, res) => {
    
    const userId = req.user.id; 
    const registrationId = req.params.id; const { 
        full_name, date_of_birth, gender, phone_number, profession, 
        full_address, domicile_city, institution, source_info 
    } = req.body;

    if (!full_name || !domicile_city) { 
        return res.status(400).json({ success: false, message: 'Nama Lengkap dan Domisili wajib diisi' });
    }

    try {
        const authCheck = await pool.query(
            'SELECT user_id FROM volunteer_registrations WHERE id = $1 AND user_id = $2',
            [registrationId, userId]
        );

        if (authCheck.rows.length === 0) {
            return res.status(403).json({ success: false, message: 'Anda tidak memiliki izin mengedit data ini.' });
        }

        const query = `
            UPDATE registration_details 
            SET full_name=$1, date_of_birth=$2, gender=$3, phone_number=$4, profession=$5, 
                full_address=$6, domicile_city=$7, institution=$8, source_info=$9
            WHERE registration_id = $10 
            RETURNING *;
        `;
        const values = [
            full_name, date_of_birth, gender, phone_number, profession, 
            full_address, domicile_city, institution, source_info, registrationId
        ];
        
        const result = await pool.query(query, values);

        res.status(200).json({
            success: true,
            message: 'Informasi pribadi berhasil disimpan. Lanjut ke langkah 2.',
            data: result.rows[0]
        });

    } catch (err) {
        console.error('Error updateStep1:', err);
        res.status(500).json({ success: false, message: 'Gagal menyimpan data Langkah 1.' });
    }
};


exports.getRegistrationsByUser = async (req, res) => {
    try {
        const user_id = req.user.id; 

        const result = await pool.query(
            `SELECT 
                r.id AS registration_id, r.registered_at, 
                v.title, v.category, v.event_date, v.event_time, 
                d.status AS registration_status -- Mengambil status dari tabel details
            FROM volunteer_registrations r
            JOIN volunteers v ON r.volunteer_id = v.id
            LEFT JOIN registration_details d ON r.id = d.registration_id
            WHERE r.user_id = $1
            ORDER BY r.registered_at DESC`,
            [user_id]
        );

        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        console.error('Error getRegistrationsByUser:', err);
        res.status(500).json({ success: false, message: 'Gagal mengambil riwayat pendaftaran' });
    }
};

exports.deleteRegistration = async (req, res) => {
    try {
        const { id } = req.params; 
        const user_id = req.user.id; 

          const result = await pool.query(
            'DELETE FROM volunteer_registrations WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Pendaftaran tidak ditemukan atau Anda tidak memiliki izin' });
        }

        res.status(200).json({ success: true, message: 'Pendaftaran berhasil dibatalkan' });
    } catch (err) {
        console.error('Error deleteRegistration:', err);
        res.status(500).json({ success: false, message: 'Gagal membatalkan pendaftaran' });
    }
};