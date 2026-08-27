function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/ingresar');
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session.user) return res.redirect('/ingresar');
    if (!roles.includes(req.session.user.role)) return res.status(403).render('auth/forbidden.njk');
    next();
  };
}

module.exports = { requireAuth, requireRole };
