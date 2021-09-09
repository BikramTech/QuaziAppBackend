var router = require('express').Router()
const { UserController } = require('../../controllers')
const { Authorize, DocUpload } = require('../../apiAttributes')

const DocumentUpload = DocUpload.fields([
  { name: 'profile_pic', maxCount: 1 },
  { name: 'resume_file', maxCount: 1 }
])

router.post('/Signup', DocumentUpload, UserController.userSignup)
router.post('/Login', UserController.userLogin)
router.post('/SocialLoginValidation', UserController.socialLoginValidation)
router.post('/EmailVerification', UserController.emailVerification)
router.post('/SocialLogin', DocumentUpload, UserController.socialLogin)
router.patch(
  '/ProfileUpdate/:id',
  [Authorize, DocumentUpload],
  UserController.profileUpdate
)
router.get('/Details/:id', Authorize, UserController.details)
router.post('/ForgotPassword', UserController.forgotPassword)
router.patch('/ChangePassword/:id', Authorize, UserController.changePassword)
router.post('/SendOtp', Authorize, UserController.sendOtp)
router.patch('/ChangeStatus/:id', Authorize, UserController.changeStatus)

module.exports = router
