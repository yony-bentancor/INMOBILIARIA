require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const nunjucks = require('nunjucks');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

nunjucks.configure(path.join(__dirname, 'views'), {
  autoescape: true,
  express: app,
  noCache: process.env.NODE_ENV !== 'production'
});
app.set('view engine', 'njk');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'qcasa-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 1000 * 60 * 60 * 8 }
}));

app.use((req, res, next) => {
  res.locals.sessionUser = req.session.user || null;
  next();
});

app.use('/', require('./routes/index'));
app.use('/', require('./routes/complaint'));
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/dashboard'));

app.use((req, res) => res.status(404).render('tenant/not-found.njk', { minimal: true }));

async function start() {
  await connectDB();
  app.listen(PORT, () => console.log(`🏠 QCASA funcionando en http://localhost:${PORT}`));
}

if (require.main === module) start();

module.exports = app;
