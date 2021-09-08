const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const constants = require('./src/lib/constants')
const db = require('./src/db/dbConnection')

const isProduction = process.env.NODE_ENV === constants.environment.production

const app = express()

// Morgan logger to log http logs
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

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

const server = app.listen(process.env.DEV_APP_PORT || 3000, function () {
  console.log('Listening on port ' + server.address().port)
  db.initDb()
})

module.exports = app
