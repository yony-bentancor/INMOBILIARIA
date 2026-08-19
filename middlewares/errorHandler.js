function errorHandler(err, req, res, next) {
  console.error("❌ Error no controlado:", err);

  const status = err.status || 500;

  res.status(status).render("error", {
    title: "Error",
    status,
    message:
      process.env.NODE_ENV === "production"
        ? "Ocurrió un error inesperado."
        : err.message
  });
}

module.exports = errorHandler;
