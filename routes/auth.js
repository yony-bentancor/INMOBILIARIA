const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.get("/register", (req, res) => {
  if (req.session.user) return res.redirect("/dashboard");

  res.render("auth/register", {
    title: "Crear cuenta"
  });
});

router.post("/register", async (req, res, next) => {
  try {
    if (!process.env.MONGO_URI) {
      req.flash("error", "MongoDB no está configurado.");
      return res.redirect("/auth/register");
    }

    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      req.flash("error", "Completá todos los campos obligatorios.");
      return res.redirect("/auth/register");
    }

    if (password.length < 8) {
      req.flash("error", "La contraseña debe tener al menos 8 caracteres.");
      return res.redirect("/auth/register");
    }

    if (password !== confirmPassword) {
      req.flash("error", "Las contraseñas no coinciden.");
      return res.redirect("/auth/register");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const exists = await User.findOne({ email: normalizedEmail });

    if (exists) {
      req.flash("error", "Ese email ya está registrado.");
      return res.redirect("/auth/login");
    }

    const passwordHash = await User.hashPassword(password);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "user"
    });

    req.session.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    };

    req.flash("success", "Cuenta creada correctamente.");
    res.redirect("/dashboard");
  } catch (error) {
    next(error);
  }
});

router.get("/login", (req, res) => {
  if (req.session.user) return res.redirect("/dashboard");

  res.render("auth/login", {
    title: "Iniciar sesión"
  });
});

router.post("/login", async (req, res, next) => {
  try {
    if (!process.env.MONGO_URI) {
      req.flash("error", "MongoDB no está configurado.");
      return res.redirect("/auth/login");
    }

    const { email, password } = req.body;

    const user = await User.findOne({
      email: String(email || "").trim().toLowerCase()
    });

    if (!user || !user.active) {
      req.flash("error", "Email o contraseña incorrectos.");
      return res.redirect("/auth/login");
    }

    const valid = await user.comparePassword(password || "");

    if (!valid) {
      req.flash("error", "Email o contraseña incorrectos.");
      return res.redirect("/auth/login");
    }

    req.session.regenerate((error) => {
      if (error) return next(error);

      req.session.user = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      };

      req.flash("success", `Bienvenido, ${user.name}.`);

      if (user.role === "admin") {
        return res.redirect("/admin");
      }

      res.redirect("/dashboard");
    });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

module.exports = router;
