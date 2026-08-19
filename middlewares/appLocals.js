function injectUser(req, res, next) {
  res.locals.currentUser = req.session.user || null;
  res.locals.currentPath = req.path;
  next();
}

function flashMiddleware(req, res, next) {
  req.flash = (type, message) => {
    req.session.flash = { type, message };
  };

  res.locals.flash = req.session.flash || null;
  delete req.session.flash;

  next();
}

module.exports = {
  injectUser,
  flashMiddleware
};
