const express = require('express');
const router = express.Router();
const registrationsController = require('../controllers/registrationsController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/start', authMiddleware, registrationsController.startRegistration);
router.put('/step1/:id', authMiddleware, registrationsController.updateStep1); 
router.put('/step2/:id', authMiddleware, registrationsController.updateStep2); 
router.post('/finish/:id', authMiddleware, registrationsController.finishRegistration); 
router.get('/user', authMiddleware, registrationsController.getRegistrationsByUser);
router.delete('/:id', authMiddleware, registrationsController.deleteRegistration);

module.exports = router;