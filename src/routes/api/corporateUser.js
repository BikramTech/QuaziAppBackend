var router = require('express').Router()
const { CorporateUserController } = require('../../controllers')
const { Authorize, ValidateModel } = require('../../middlewares')
const { CrUserSignupLoginValidationRules, EmailVerificationValidationRules } = require('../../lib/validation-rules/auth')
const { email } = require('../../lib/validation-rules/common')

// User Signup & login routes
router.post('/Signup', [CrUserSignupLoginValidationRules, ValidateModel], CorporateUserController.userSignup);
router.post('/EmailVerification', [EmailVerificationValidationRules, ValidateModel], CorporateUserController.emailVerification);
router.post('/ProfileUpdate', Authorize, CorporateUserController.userProfileUpdate);

module.exports = router
