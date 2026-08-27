const express = require('express');
const router = express.Router();
const { properties } = require('../data/demo');

router.get('/', (req, res) => res.render('index.njk', { properties: properties.slice(0, 3) }));

router.get('/qr', (req, res) => {
  res.render('qr.njk', {
    title: 'Escanear QR | QCASA',
    minimal: true
  });
});

router.get('/propiedades', (req, res) => res.render('properties.njk', { properties }));
router.get('/reparaciones', (req, res) => res.render('repairs.njk'));
router.get('/propietarios', (req, res) => res.render('owners-info.njk'));
router.get('/tecnicos', (req, res) => res.render('technicians-info.njk'));
router.get('/contacto', (req, res) => res.render('contact.njk'));

module.exports = router;
