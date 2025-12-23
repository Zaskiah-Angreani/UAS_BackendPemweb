const express = require('express');
const router = express.Router();
const registrationsController = require('../controllers/registrationsController');
const authMiddleware = require('../middleware/authMiddleware');

// Endpoint untuk memulai pendaftaran
router.post('/start', authMiddleware, registrationsController.startRegistration);

// Endpoint utama yang dipanggil saat FE mengirim data (Step 1, Step 2, atau Final)
// Menggunakan PUT karena sistem kita mengupdate record yang dibuat di '/start'
router.put('/update/:id', authMiddleware, registrationsController.updateStep1);

// Alias untuk kecocokan dengan kode lama Anda jika diperlukan
router.put('/step1/:id', authMiddleware, registrationsController.updateStep1);
router.put('/step2/:id', authMiddleware, registrationsController.updateStep1);

// Mengambil riwayat pendaftaran user login
router.get('/user', authMiddleware, registrationsController.getRegistrationsByUser);

// Menghapus pendaftaran
router.delete('/:id', authMiddleware, registrationsController.deleteRegistration);

module.exports = router;