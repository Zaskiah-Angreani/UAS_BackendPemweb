const { pool } = require('../db');

const Activity = {
    // Fungsi untuk mengambil semua aktivitas
    getAll: async () => {
        const result = await pool.query('SELECT * FROM activities ORDER BY created_at DESC');
        return result.rows;
    },

    // Fungsi untuk menambah aktivitas baru
    create: async (data) => {
        const query = `
            INSERT INTO activities (title, description, category, location, date, time_detail, price, price_type, image, status, target_volunteers)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *`;
        const values = [
            data.title, data.description, data.category, data.location, data.date, 
            data.timeDetail, data.price, data.priceType, data.image, data.status, data.targetVolunteers
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    }
};

module.exports = Activity;