const express = require('express');
const router = express.Router();
const fleetController = require('../controllers/fleetController');

router.get('/', fleetController.index);
router.get('/nuevo', fleetController.create);
router.post('/', fleetController.store);

// Must come before /:id to avoid param collision
router.post('/horario/:id/avanzar', fleetController.advanceSchedule);

router.get('/:id/editar', fleetController.edit);
router.post('/:id', fleetController.update);
router.post('/:id/eliminar', fleetController.destroy);

module.exports = router;
