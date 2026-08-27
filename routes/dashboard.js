const express = require('express');
const router = express.Router();
const dashboard = require('../controllers/dashboardController');
const ownerController = require('../controllers/ownerController');
const complaintService = require('../services/complaintService');
const { requireRole } = require('../middleware/auth');

// PROPIETARIO
router.get('/propietario', requireRole('owner', 'admin'), ownerController.dashboard);
router.get('/propietario/propiedades/nueva', requireRole('owner', 'admin'), ownerController.newPropertyForm);
router.post('/propietario/propiedades/nueva', requireRole('owner', 'admin'), ownerController.createProperty);
router.get('/propietario/propiedades/:code/editar', requireRole('owner', 'admin'), ownerController.editPropertyForm);
router.post('/propietario/propiedades/:code/editar', requireRole('owner', 'admin'), ownerController.updateProperty);
router.post('/propietario/propiedades/:code/eliminar', requireRole('owner', 'admin'), ownerController.deleteProperty);
router.get('/propietario/reclamos/:id', requireRole('owner', 'admin'), ownerController.complaintDetail);
router.get('/propietario/perfil', requireRole('owner', 'admin'), ownerController.profileForm);
router.post('/propietario/perfil', requireRole('owner', 'admin'), ownerController.updateProfile);

// ADMINISTRADOR
router.get('/admin', requireRole('admin'), dashboard.admin);
router.get('/admin/propiedades/:code/qr', requireRole('admin'), dashboard.propertyQr);
router.post('/admin/reclamos/:id/estado', requireRole('admin'), async (req, res) => {
  await complaintService.updateStatus(req.params.id, req.body.status);
  res.redirect('/admin');
});

// TÉCNICO
router.get('/tecnico', requireRole('technician', 'admin'), dashboard.technician);
router.post('/tecnico/trabajos/:id/estado', requireRole('technician', 'admin'), async (req, res) => {
  await complaintService.updateStatus(req.params.id, req.body.status);
  res.redirect('/tecnico');
});

module.exports = router;
