function requireAuth(req, res, next) {
  if (!req.session.user) {
    req.flash("error", "Debés iniciar sesión para continuar.");
    return res.redirect("/auth/login");
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user) {
    req.flash("error", "Debés iniciar sesión.");
    return res.redirect("/auth/login");
  }

  if (req.session.user.role !== "admin") {
    req.flash("error", "No tenés permisos para acceder a esa sección.");
    return res.redirect("/");
  }

  next();
}

module.exports = {
  requireAuth,
  requireAdmin
};
