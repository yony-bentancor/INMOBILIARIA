const express = require("express");
const User = require("../models/User");
const Item = require("../models/Item");
const { requireAdmin } = require("../middlewares/auth");

const router = express.Router();

router.use(requireAdmin);

router.get("/", async (req, res, next) => {
  try {
    const [usersCount, itemsCount, adminsCount, latestUsers] = await Promise.all([
      User.countDocuments(),
      Item.countDocuments(),
      User.countDocuments({ role: "admin" }),
      User.find().sort({ createdAt: -1 }).limit(5).lean()
    ]);

    res.render("admin/index", {
      title: "Administración",
      stats: {
        usersCount,
        itemsCount,
        adminsCount
      },
      latestUsers
    });
  } catch (error) {
    next(error);
  }
});

router.get("/users", async (req, res, next) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .lean();

    res.render("admin/users", {
      title: "Usuarios",
      users
    });
  } catch (error) {
    next(error);
  }
});

router.post("/users/:id/toggle-active", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      req.flash("error", "Usuario no encontrado.");
      return res.redirect("/admin/users");
    }

    if (user._id.toString() === req.session.user.id) {
      req.flash("error", "No podés desactivar tu propia cuenta.");
      return res.redirect("/admin/users");
    }

    user.active = !user.active;
    await user.save();

    req.flash("success", "Estado del usuario actualizado.");
    res.redirect("/admin/users");
  } catch (error) {
    next(error);
  }
});

router.post("/users/:id/toggle-role", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      req.flash("error", "Usuario no encontrado.");
      return res.redirect("/admin/users");
    }

    if (user._id.toString() === req.session.user.id) {
      req.flash("error", "No podés cambiar tu propio rol desde aquí.");
      return res.redirect("/admin/users");
    }

    user.role = user.role === "admin" ? "user" : "admin";
    await user.save();

    req.flash("success", "Rol actualizado.");
    res.redirect("/admin/users");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
