const express = require("express");
const Item = require("../models/Item");
const { requireAuth } = require("../middlewares/auth");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    if (!process.env.MONGO_URI) {
      return res.render("items/list", {
        title: "Elementos",
        items: [],
        dbDisabled: true
      });
    }

    const filter = { active: true };

    if (req.query.kind) {
      filter.kind = req.query.kind;
    }

    const items = await Item.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.render("items/list", {
      title: "Elementos",
      items,
      dbDisabled: false
    });
  } catch (error) {
    next(error);
  }
});

router.get("/new", requireAuth, (req, res) => {
  res.render("items/form", {
    title: "Nuevo elemento",
    item: null,
    formAction: "/items",
    method: "POST"
  });
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { kind, title, description, price, imageUrl } = req.body;

    await Item.create({
      kind,
      title,
      description,
      price: Number(price || 0),
      imageUrl,
      createdBy: req.session.user.id
    });

    req.flash("success", "Elemento creado correctamente.");
    res.redirect("/items");
  } catch (error) {
    next(error);
  }
});

router.get("/:id/edit", requireAuth, async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).lean();

    if (!item) {
      req.flash("error", "Elemento no encontrado.");
      return res.redirect("/items");
    }

    const isOwner =
      item.createdBy &&
      item.createdBy.toString() === req.session.user.id;

    if (!isOwner && req.session.user.role !== "admin") {
      req.flash("error", "No tenés permisos para editar este elemento.");
      return res.redirect("/items");
    }

    res.render("items/form", {
      title: "Editar elemento",
      item,
      formAction: `/items/${item._id}?_method=PUT`,
      method: "POST"
    });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      req.flash("error", "Elemento no encontrado.");
      return res.redirect("/items");
    }

    const isOwner =
      item.createdBy &&
      item.createdBy.toString() === req.session.user.id;

    if (!isOwner && req.session.user.role !== "admin") {
      req.flash("error", "No tenés permisos para editar este elemento.");
      return res.redirect("/items");
    }

    item.kind = req.body.kind;
    item.title = req.body.title;
    item.description = req.body.description;
    item.price = Number(req.body.price || 0);
    item.imageUrl = req.body.imageUrl;

    await item.save();

    req.flash("success", "Elemento actualizado.");
    res.redirect("/items");
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      req.flash("error", "Elemento no encontrado.");
      return res.redirect("/items");
    }

    const isOwner =
      item.createdBy &&
      item.createdBy.toString() === req.session.user.id;

    if (!isOwner && req.session.user.role !== "admin") {
      req.flash("error", "No tenés permisos para eliminar este elemento.");
      return res.redirect("/items");
    }

    await item.deleteOne();

    req.flash("success", "Elemento eliminado.");
    res.redirect("/items");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
