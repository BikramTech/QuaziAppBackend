var router = require('express').Router()
const { CorporateUserController } = require('../../controllers')
const { Authorize } = require('../../middlewares')
const {
  CrUserSignupLoginValidator,
  EmailVerificationValidator,
  ChangePasswordValidator,
  LoginValidator,
  UserIdValidator
} = require('../../lib/validators/authValidator')
const { EmailValidator } = require('../../lib/validators/commonValidator')
const {
  CrUserProfileUpdateValidator
} = require('../../lib/validators/crUserProfileValidator')

// User Signup & login routes
router.post('/Login', LoginValidator, CorporateUserController.userLogin)
router.post(
  '/Signup',
  CrUserSignupLoginValidator,
  CorporateUserController.userSignup
)
router.post(
  '/EmailVerification',
  EmailVerificationValidator,
  CorporateUserController.emailVerification
)
router.patch(
  '/ProfileUpdate/:id',
  [Authorize, CrUserProfileUpdateValidator],
  CorporateUserController.userProfileUpdate
)
router.post(
  '/ForgotPassword',
  EmailValidator,
  CorporateUserController.forgotPassword
)
router.patch(
  '/ChangePassword/:id',
  [Authorize, ChangePasswordValidator],
  CorporateUserController.changePassword
)

router.get(
  '/Details/:id',
  [Authorize, UserIdValidator],
  CorporateUserController.details
)

module.exports = router
