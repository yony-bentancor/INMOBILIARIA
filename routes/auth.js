const express = require('express');
const router = express.Router();
const demoUsers = require('../config/demoUsers');

router.get('/ingresar', (req, res) => {
  res.render('auth/login.njk', { error: null });
});

router.post('/ingresar', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  const user = demoUsers.find(
    u => u.email.toLowerCase() === email && u.password === password
  );

  if (!user) {
    return res.status(401).render('auth/login.njk', {
      error: 'Usuario o contraseña incorrectos.'
    });
  }

  req.session.user = {
    email: user.email,
    role: user.role,
    name: user.name,
    phone: user.phone || ''
  };

  req.session.save((err) => {
    if (err) {
      console.error('Error guardando sesión:', err);
      return res.status(500).render('auth/login.njk', {
        error: 'No pudimos iniciar la sesión. Intentá nuevamente.'
      });
    }

    if (user.role === 'admin') return res.redirect('/admin');
    if (user.role === 'owner') return res.redirect('/propietario');
    return res.redirect('/tecnico');
  });
});

router.post('/salir', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
