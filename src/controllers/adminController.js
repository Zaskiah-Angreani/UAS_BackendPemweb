const pool = require('../db'); 
exports.getDashboardStats = async (req, res) => {
    try {
        const usersCountResult = await pool.query('SELECT COUNT(*) FROM users');
        const totalUsers = parseInt(usersCountResult.rows[0].count);
        const activitiesCountResult = await pool.query('SELECT COUNT(*) FROM volunteers');
        const totalAktivitas = parseInt(activitiesCountResult.rows[0].count);
        const registrationsCountResult = await pool.query('SELECT COUNT(*) FROM volunteer_registrations');
        const totalPendaftaran = parseInt(registrationsCountResult.rows[0].count);
        const contactCountResult = await pool.query('SELECT COUNT(*) FROM contact_messages');
        const totalContactMessages = parseInt(contactCountResult.rows[0].count);

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalAktivitas,
                totalPendaftaran,
                totalContactMessages
            }
        });

    } catch (err) {
        console.error('Error fetching dashboard stats:', err.message);
        res.status(500).json({ success: false, message: 'Gagal memuat statistik dari database.' });
    }
};

