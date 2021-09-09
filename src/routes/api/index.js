var router = require('express').Router()

router.use('/user', require('./account'))

module.exports = router
