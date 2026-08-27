const express = require('express');
const router = express.Router();
const demoUsers = require('../config/demoUsers');

router.get('/ingresar', (req, res) => res.render('auth/login.njk', { error: null }));
router.post('/ingresar', (req, res) => {
  const user = demoUsers.find(u => u.email === req.body.email && u.password === req.body.password);
  if (!user) return res.status(401).render('auth/login.njk', { error: 'Usuario o contraseña incorrectos.' });
  req.session.user = { email: user.email, role: user.role, name: user.name };
  if (user.role === 'admin') return res.redirect('/admin');
  if (user.role === 'owner') return res.redirect('/propietario');
  return res.redirect('/tecnico');
});
router.post('/salir', (req, res) => req.session.destroy(() => res.redirect('/')));
module.exports = router;
