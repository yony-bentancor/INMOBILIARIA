require("dotenv").config();

const path = require("path");
const express = require("express");
const nunjucks = require("nunjucks");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const methodOverride = require("method-override");

const connectDB = require("./config/db");
const { injectUser, flashMiddleware } = require("./middlewares/appLocals");
const errorHandler = require("./middlewares/errorHandler");

const indexRoutes = require("./routes/index");
const authRoutes = require("./routes/auth");
const itemRoutes = require("./routes/items");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  app.set("trust proxy", 1);
}

nunjucks.configure(path.join(__dirname, "views"), {
  autoescape: true,
  express: app,
  noCache: !isProduction
});

app.set("view engine", "njk");

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(compression());
app.use(morgan(isProduction ? "combined" : "dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const sessionConfig = {
  secret: process.env.SESSION_SECRET || "solo-desarrollo-cambiar",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
};

if (process.env.MONGO_URI) {
  sessionConfig.store = MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 60 * 60 * 24 * 7
  });
} else {
  console.warn("⚠️ MONGO_URI no configurado: las sesiones usarán memoria temporal.");
}

app.use(session(sessionConfig));
app.use(flashMiddleware);
app.use(injectUser);

app.use("/", indexRoutes);
app.use("/auth", authRoutes);
app.use("/items", itemRoutes);
app.use("/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).render("404", {
    title: "Página no encontrada"
  });
});

app.use(errorHandler);

async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
}

start();

module.exports = app;
