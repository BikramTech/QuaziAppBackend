const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const helmet = require("helmet");
const passport = require("passport");
const compression = require("compression");

const constants = require('./src/lib/constants')
const db = require('./src/db/dbConnection')
const cors = require("cors");

const isProduction = process.env.NODE_ENV === constants.environment.production

const app = express()

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(cors());
app.options("*", cors());

// Morgan logger to log http logs
app.use(logger('dev'))
app.use(helmet());
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: false, limit: '5mb' }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname)));
app.use(compression());

app.use(passport.initialize());
require("./src/middlewares/jwtStrategy")(passport);

app.use(require('./src/routes'))

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('the url not found')
  err.status = 404
  next(err)
})

// error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500)

  res.json({
    errors: {
      message: err.message,
      error: err
    }
  })
})

global.__baseDirectory = __dirname;

const server = app.listen(process.env.DEV_APP_PORT || 3000, function () {
  console.log('Listening on port ' + server.address().port)
  db.initDb()
})

module.exports = app
