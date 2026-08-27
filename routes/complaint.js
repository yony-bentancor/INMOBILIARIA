const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');

router.get('/r/:code', complaintController.showQrForm);
router.post('/r/:code', complaintController.createFromQr);
router.get('/reclamos/:id/recibido', complaintController.received);
router.get('/reclamos/:id', complaintController.status);
module.exports = router;
