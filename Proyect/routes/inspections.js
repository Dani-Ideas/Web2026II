const express = require('express');
const router = express.Router();
const inspectionController = require('../controllers/inspectionController');
const { upload } = require('../config/multer');

router.get('/', inspectionController.index);
router.get('/nueva', inspectionController.create);
router.post('/', upload.array('evidencia', 5), inspectionController.store);
router.get('/:id', inspectionController.show);

module.exports = router;
