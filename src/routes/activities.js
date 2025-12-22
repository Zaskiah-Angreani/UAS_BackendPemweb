const express = require('express');
const router = express.Router();
const activitiesController = require('../controllers/activitiesController');

// Rute ini akan dipanggil oleh axios.get(API_URL) di frontend
router.get('/', activitiesController.getAll);  
router.get('/:id', activitiesController.getById); 

module.exports = router;