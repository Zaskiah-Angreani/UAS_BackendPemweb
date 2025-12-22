const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController'); 
const activitiesController = require('../controllers/activitiesController'); 
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/stats', authMiddleware, adminMiddleware, adminController.getDashboardStats);
router.post(
    '/activities', 
    authMiddleware, 
    adminMiddleware, 
    activitiesController.create
);
router.put(
    '/activities/:id', 
    authMiddleware, 
    adminMiddleware, 
    activitiesController.update
);
router.delete(
    '/activities/:id', 
    authMiddleware, 
    adminMiddleware, 
    activitiesController.delete
);


module.exports = router;