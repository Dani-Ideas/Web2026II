const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');

router.get('/', maintenanceController.index);
router.get('/nuevo', maintenanceController.create);
router.post('/', maintenanceController.store);
router.get('/:id/editar', maintenanceController.edit);
router.post('/:id', maintenanceController.update);

module.exports = router;
