var router = require('express').Router()
const { UserController } = require('../../controllers')
const { Authorize, DocUpload, ValidateModel } = require("../../middlewares");
const { LoginValidationRules, EmailVerificationValidationRules } = require("../../lib/validation-rules/auth");
const { email } = require("../../lib/validation-rules/common");

const DocumentUpload = DocUpload.fields([
  { name: 'profile_pic', maxCount: 1 },
  { name: 'resume_file', maxCount: 1 }
])

// User Signup & login routes
router.post('/Signup', [email, ValidateModel], UserController.userSignup);
router.post('/Login', [LoginValidationRules, ValidateModel], UserController.userLogin);
// router.post('/SocialLoginValidation', UserController.socialLoginValidation);
router.post('/EmailVerification', [EmailVerificationValidationRules, ValidateModel], UserController.emailVerification);
router.post('/SocialLogin', UserController.socialLogin);
router.patch('/ProfileUpdate/:id', [Authorize, DocumentUpload], UserController.profileUpdate);
router.get('/Details/:id', Authorize, UserController.details);
router.post('/ForgotPassword', UserController.forgotPassword);
router.patch('/ChangePassword/:id', Authorize, UserController.changePassword);
router.post('/SendOtp', UserController.sendOtp);
router.patch('/ChangeStatus/:id', Authorize, UserController.changeStatus);

//User Employment routes
router.post('/AddUserEmployment', Authorize, UserController.AddUserEmployment);
router.get('/GetUserEmploymentsByUserId/:user_id', Authorize, UserController.GetUserEmploymentsByUserId);
router.post('/UpdateUserEmployment/:id', Authorize, UserController.UpdateUserEmployment);
router.get('/DeleteUserEmployment/:id', Authorize, UserController.DeleteUserEmployment);

//User Projects routes
router.post('/AddUserProject', Authorize, UserController.AddUserProject);
router.get('/GetUserProjectsByUserId/:user_id', Authorize, UserController.GetUserProjectsByUserId);
router.post('/UpdateUserProject/:id', Authorize, UserController.UpdateUserProject);
router.get('/DeleteUserProject/:id', Authorize, UserController.DeleteUserProject);

//User Certification routes
router.post('/AddUserCertification', Authorize, UserController.AddUserCertification);
router.get('/GetUserCertificationsByUserId/:user_id', Authorize, UserController.GetUserCertificationsByUserId);
router.post('/UpdateUserCertification/:id', Authorize, UserController.UpdateUserCertification);
router.get('/DeleteUserCertification:id', Authorize, UserController.DeleteUserCertification);

//User Applications routes
router.post('/AddUserApplication', Authorize, UserController.AddUserApplication);
router.get('/GetUserApplicationsByUserId/:user_id', Authorize, UserController.GetUserApplicationsByUserId);
// router.post('/UpdateUserApplicationStatus/:id', Authorize, UserController.UpdateUserApplicationStatus); // Need to move this route to the corporate module later
router.get('/DeleteUserApplication:id', Authorize, UserController.DeleteUserApplication);

module.exports = router
