const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
const DEFAULT_USER_ROLE = 'user';
const JWT_SECRET = process.env.JWT_SECRET || 'secret-default-key';

exports.register = async (req, res) => {
    let client;
    // Pindahkan deklarasi ke luar try agar bisa diakses oleh catch
    const { name, email, password, role } = req.body;

    try {
        console.log('[DEBUG] Menerima data dari frontend:', req.body);

        if (!name || !email || !password) {
            console.log('[DEBUG] Field wajib kosong.');
            return res.status(400).json({ message: 'Semua field wajib diisi' });
        }

        // Gunakan role dari frontend jika ada (untuk fitur Daftar Admin)
        const userRole = role || DEFAULT_USER_ROLE;
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        client = await pool.connect();
        const insertQuery = 'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)';

        await client.query(
            insertQuery,
            [name, email, hashedPassword, userRole]
        );

        console.log(`[REGISTER SUKSES] User baru berhasil didaftarkan: ${email} sebagai ${userRole}`);
        res.status(201).json({ message: 'Register berhasil! Silakan Login.' });

    } catch (err) {
        // Sekarang variabel 'email' sudah bisa diakses di sini tanpa ReferenceError
        if (err.code === '23505') {
            console.log(`[REGISTER GAGAL] Email duplikat: ${email}`);
            return res.status(400).json({ message: 'Email sudah terdaftar. Gunakan email lain.' });
        }
        
        console.error('--- KRITIS: INSERT GAGAL TOTAL ---', err.message);
        res.status(500).json({ message: `Gagal membuat akun. Server error: ${err.message}` });

    } finally {
        if (client) {
            client.release();
        }
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email dan password wajib diisi' });
        }

        console.log(`[LOGIN DEBUG] Permintaan login masuk untuk email: ${email}`);

        const userResult = await pool.query(
            'SELECT id, name, email, password, role FROM users WHERE email = $1',
            [email]
        );

        console.log(`[LOGIN DEBUG] Hasil cek email: Ditemukan ${userResult.rows.length} baris.`);

        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'Email atau Password salah!' });
        }

        const user = userResult.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        console.log(`[LOGIN DEBUG] Perbandingan password: ${passwordMatch ? 'BERHASIL' : 'GAGAL'}`);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Email atau Password salah!' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log(`[LOGIN DEBUG] Login sukses. JWT dibuat.`);
        res.status(200).json({
            message: 'Login berhasil!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error('--- KRITIS: Error Database di Login ---', err);
        res.status(500).json({ message: `Gagal login. Server error: ${err.message}` });
    }
};