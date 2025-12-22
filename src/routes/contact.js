const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const authMiddleware = require('../middleware/authMiddleware'); 
const adminMiddleware = require('../middleware/adminMiddleware'); 

router.post('/', contactController.createMessage);
router.get('/', authMiddleware, adminMiddleware, contactController.getAllMessages);

module.exports = router;