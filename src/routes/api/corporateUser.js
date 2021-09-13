var router = require('express').Router()
const { CorporateUserController } = require('../../controllers')
const { Authorize, ValidateModel } = require('../../middlewares')
const { CrUserSignupLoginValidator, EmailVerificationValidator } = require('../../lib/validators/authValidator')

// User Signup & login routes
router.post('/Signup', CrUserSignupLoginValidator, CorporateUserController.userSignup);
router.post('/EmailVerification', EmailVerificationValidator, CorporateUserController.emailVerification);
router.post('/ProfileUpdate', Authorize, CorporateUserController.userProfileUpdate);

module.exports = router
