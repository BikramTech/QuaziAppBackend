var router = require("express").Router();
const { UserController } = require("../../controllers");
const { Authorize, DocUpload, ValidateModel } = require("../../middlewares");

const {
  UpdateUserCertificationValidator,
} = require("../../lib/validators/userCertificationValidator");

const {
  LoginValidator,
  EmailVerificationValidator,
} = require("../../lib/validators/authValidator");
const { EmailValidator } = require("../../lib/validators/commonValidator");

const {
  UpdateUserEmploymentValidator,
} = require("../../lib/validators/userEmployementValidator");

const DocumentUpload = DocUpload.fields([
  { name: "profile_pic", maxCount: 1 },
  { name: "resume_file", maxCount: 1 },
]);

// User Signup & login routes
router.post("/Signup", [EmailValidator], UserController.userSignup);
router.post("/Login", LoginValidator, UserController.userLogin);
// router.post('/SocialLoginValidation', UserController.socialLoginValidation);
router.post(
  "/EmailVerification",
  EmailVerificationValidator,
  UserController.emailVerification
);
router.post("/SocialLogin", UserController.socialLogin);
router.patch(
  "/ProfileUpdate/:id",
  [Authorize, DocumentUpload],
  UserController.profileUpdate
);
router.get("/Details/:id", Authorize, UserController.details);
router.post("/ForgotPassword", UserController.forgotPassword);
router.patch("/ChangePassword/:id", Authorize, UserController.changePassword);
router.post("/SendOtp", UserController.sendOtp);
router.patch("/ChangeStatus/:id", Authorize, UserController.changeStatus);

//User Employment routes
router.post("/AddUserEmployment", Authorize, UserController.AddUserEmployment);
router.get(
  "/GetUserEmploymentsByUserId/:user_id",
  Authorize,
  UserController.GetUserEmploymentsByUserId
);
router.post(
  "/UpdateUserEmployment/:id",
  [UpdateUserEmploymentValidator],
  UserController.UpdateUserEmployment
);
router.delete(
  "/DeleteUserEmployment/:id",
  Authorize,
  UserController.DeleteUserEmployment
);

//User Projects routes
router.post("/AddUserProject", Authorize, UserController.AddUserProject);
router.get(
  "/GetUserProjectsByUserId/:user_id",
  Authorize,
  UserController.GetUserProjectsByUserId
);
router.post(
  "/UpdateUserProject/:id",
  Authorize,
  UserController.UpdateUserProject
);
router.delete(
  "/DeleteUserProject/:id",
  Authorize,
  UserController.DeleteUserProject
);

//User Certification routes
router.post(
  "/AddUserCertification",
  Authorize,
  UserController.AddUserCertification
);
router.get(
  "/GetUserCertificationsByUserId/:user_id",
  Authorize,
  UserController.GetUserCertificationsByUserId
);
router.post(
  "/UpdateUserCertification/:id",
  [Authorize, UpdateUserCertificationValidator],
  UserController.UpdateUserCertification
);
router.delete(
  "/DeleteUserCertification/:id",
  Authorize,
  UserController.DeleteUserCertification
);

//User Applications routes
router.post(
  "/AddUserApplication",
  Authorize,
  UserController.AddUserApplication
);
router.get(
  "/GetUserApplicationsByUserId/:user_id",
  Authorize,
  UserController.GetUserApplicationsByUserId
);
// router.post('/UpdateUserApplicationStatus/:id', Authorize, UserController.UpdateUserApplicationStatus); // Need to move this route to the corporate module later
router.delete(
  "/DeleteUserApplication/:id",
  Authorize,
  UserController.DeleteUserApplication
);

module.exports = router;
