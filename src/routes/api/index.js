var router = require('express').Router()

router.use('/user', require('./user'));
router.use('/corporate-user', require('./corporateUser'));
router.use('/company', require('./company'));
router.use('/job-types', require('./jobTypes'));
router.use('/job-listing', require('./jobListing'));

module.exports = router
