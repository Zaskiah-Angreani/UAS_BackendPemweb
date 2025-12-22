const express = require('express');
const router = express.Router();
const activitiesController = require('../controllers/activitiesController');
const authMiddleware = require('../middleware/authMiddleware'); 
router.get('/', activitiesController.getAll);  
router.get('/:id', activitiesController.getById); 

module.exports = router;