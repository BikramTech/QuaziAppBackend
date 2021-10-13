var router = require('express').Router()

router.use('/user', require('./user'));
router.use('/corporate-user', require('./corporateUser'));
router.use('/company', require('./company'));
router.use('/job-types', require('./jobTypes'));
router.use('/job-listing', require('./jobListing'));
router.use('/skills', require('./skills'));
router.use('/user-education', require('./userEducation'));
router.use('/admin', require('./admin'));
router.use('/application-status', require('./applicationStatus'));
router.use('/payment-plans', require('./paymentPlans'));

module.exports = router
