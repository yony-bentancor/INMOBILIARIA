const express = require("express");
const Item = require("../models/Item");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    let latestItems = [];

    if (process.env.MONGO_URI) {
      latestItems = await Item.find({ active: true })
        .sort({ createdAt: -1 })
        .limit(6)
        .lean();
    }

    res.render("index", {
      title: "Inicio",
      latestItems
    });
  } catch (error) {
    next(error);
  }
});

router.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    req.flash("error", "Debés iniciar sesión.");
    return res.redirect("/auth/login");
  }

  res.render("dashboard", {
    title: "Mi panel"
  });
});

module.exports = router;
