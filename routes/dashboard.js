const express = require('express');
const router = express.Router();
const dashboard = require('../controllers/dashboardController');
const complaintService = require('../services/complaintService');
const { requireRole } = require('../middleware/auth');

router.get('/propietario', requireRole('owner', 'admin'), dashboard.owner);
router.get('/admin', requireRole('admin'), dashboard.admin);
router.get('/admin/propiedades/:code/qr', requireRole('admin'), dashboard.propertyQr);
router.post('/admin/reclamos/:id/estado', requireRole('admin'), async (req, res) => {
  await complaintService.updateStatus(req.params.id, req.body.status);
  res.redirect('/admin');
});
router.get('/tecnico', requireRole('technician', 'admin'), dashboard.technician);
router.post('/tecnico/trabajos/:id/estado', requireRole('technician', 'admin'), async (req, res) => {
  await complaintService.updateStatus(req.params.id, req.body.status);
  res.redirect('/tecnico');
});
module.exports = router;
