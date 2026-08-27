const express = require('express');
const router = express.Router();
const { properties } = require('../data/demo');

router.get('/', (req, res) => {
  res.render('index.njk', {
    title: 'QCASA | Tu hogar, un QR. Todo resuelto.'
  });
});

router.get('/qr', (req, res) => {
  res.render('qr.njk', {
    title: 'Escanear QR | QCASA'
  });
});

// Páginas institucionales
router.get('/como-funciona', (req, res) => res.render('repairs.njk', { title: 'Cómo funciona | QCASA' }));
router.get('/propietarios', (req, res) => res.render('owners-info.njk', { title: 'Propietarios | QCASA' }));
router.get('/tecnicos', (req, res) => res.render('technicians-info.njk', { title: 'Técnicos | QCASA' }));
router.get('/contacto', (req, res) => res.render('contact.njk', { title: 'Contacto | QCASA' }));

// Se mantiene por compatibilidad, pero ya no forma parte del menú principal.
router.get('/propiedades', (req, res) => res.render('properties.njk', { properties, title: 'Propiedades | QCASA' }));
router.get('/reparaciones', (req, res) => res.redirect('/como-funciona'));

router.get('/mis-reclamos', (req, res) => {
  res.render('tenant/my-complaints.njk', {
    title: 'Mis reclamos | QCASA'
  });
});

router.get('/emergencia', (req, res) => {
  res.render('tenant/emergency.njk', {
    title: 'Emergencia | QCASA'
  });
});

module.exports = router;
