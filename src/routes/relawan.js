const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload'); 
const relawanController = require('../controllers/relawancontroller'); 

router.post('/daftar', 
    upload.single('portofolio'), 
    relawanController.daftarRelawan 
);

module.exports = router;