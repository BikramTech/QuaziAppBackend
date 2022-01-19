var router = require("express").Router();
const { UserController } = require("../../controllers");
const { Authorize, DocUpload } = require("../../middlewares");

const { LoginValidator, EmailVerificationValidator, UserIdValidator, ChangePasswordValidator } = require("../../lib/validators/authValidator");
const { EmailValidator } = require("../../lib/validators/commonValidator");
const { UserProfileUpdateValidator } = require("../../lib/validators/userProfileValidator");
const { AddUserEmploymentValidator, UpdateUserEmploymentValidator, GetUserEmploymentsByUserIdValidator, DeleteUserEmploymentRule } = require("../../lib/validators/userEmployementValidator");
const { AddUserCertificationValidator, UpdateUserCertificationValidator, GetUserCertificationsByUserIdValidator, DeleteUserCertificationValidator } = require("../../lib/validators/userCertificationValidator");
const { AddUserProjectsValidator, UpdateUserProjectsValidator, GetUserProjectsByUserIdValidator, DeleteUserProjectsValidator } = require("../../lib/validators/userProjectsValidator");
const { AddUserApplicationValidator, GetUserApplicationsByUserIdValidator, DeleteUserApplicationValidator, ChangeUserApplicationValidator } = require("../../lib/validators/userApplicationValidator");

const DocumentUpload = DocUpload.fields([
  { name: "profile_pic", maxCount: 1 },
  { name: "resume_file", maxCount: 1 },
]);

// User Signup & login routes
router.post("/Signup", [EmailValidator], UserController.userSignup);
router.post("/Login", LoginValidator, UserController.userLogin);
// router.post('/SocialLoginValidation', UserController.socialLoginValidation);
router.post("/EmailVerification", EmailVerificationValidator, UserController.emailVerification);
router.post("/SocialLogin", EmailValidator, UserController.socialLogin);
router.patch("/ProfileUpdate/:id", [Authorize, UserProfileUpdateValidator, DocumentUpload], UserController.profileUpdate);
router.get("/Details/:id", [Authorize, UserIdValidator], UserController.details);
router.post("/ForgotPassword", EmailValidator, UserController.forgotPassword);
router.patch("/ChangePassword/:id", [Authorize, ChangePasswordValidator], UserController.changePassword);
router.post("/SendOtp", EmailValidator, UserController.sendOtp);
router.patch("/ChangeStatus/:id", [Authorize, UserIdValidator], UserController.changeStatus);
router.post("/SaveDeviceToken",  UserIdValidator, UserController.saveDeviceToken);
router.post("/GetUsers", [Authorize], UserController.getUsers);

//User Employment routes
router.post("/AddUserEmployment", [Authorize, AddUserEmploymentValidator], UserController.AddUserEmployment);
router.get("/GetUserEmploymentsByUserId/:user_id", [Authorize, GetUserEmploymentsByUserIdValidator], UserController.GetUserEmploymentsByUserId);
router.post("/UpdateUserEmployment/:id", [Authorize, UpdateUserEmploymentValidator], UserController.UpdateUserEmployment);
router.delete("/DeleteUserEmployment/:id", [Authorize, DeleteUserEmploymentRule], UserController.DeleteUserEmployment);

//User Projects routes
router.post("/AddUserProject", [Authorize, AddUserProjectsValidator], UserController.AddUserProject);
router.get("/GetUserProjectsByUserId/:user_id", [Authorize, GetUserProjectsByUserIdValidator], UserController.GetUserProjectsByUserId);
router.post("/UpdateUserProject/:id", [Authorize, UpdateUserProjectsValidator], UserController.UpdateUserProject);
router.delete("/DeleteUserProject/:id", [Authorize, DeleteUserProjectsValidator], UserController.DeleteUserProject);

//User Certification routes
router.post("/AddUserCertification", [Authorize, AddUserCertificationValidator], UserController.AddUserCertification);
router.get("/GetUserCertificationsByUserId/:user_id", [Authorize, GetUserCertificationsByUserIdValidator], UserController.GetUserCertificationsByUserId);
router.post("/UpdateUserCertification/:id", [Authorize, UpdateUserCertificationValidator], UserController.UpdateUserCertification);
router.delete("/DeleteUserCertification/:id", [Authorize, DeleteUserCertificationValidator], UserController.DeleteUserCertification);

//User Applications routes
router.post("/AddUserApplication", [ AddUserApplicationValidator], UserController.AddUserApplication);
router.get("/GetUserApplicationsByUserId/:user_id", [Authorize, GetUserApplicationsByUserIdValidator], UserController.GetUserApplicationsByUserId);
// router.post('/UpdateUserApplicationStatus/:id', Authorize, UserController.UpdateUserApplicationStatus); // Need to move this route to the corporate module later
router.delete("/DeleteUserApplication/:id", [Authorize, DeleteUserApplicationValidator], UserController.DeleteUserApplication);
router.post("/ChangeUserApplicationStatus", [Authorize, ChangeUserApplicationValidator], UserController.changeUserApplicationStatus);

module.exports = router;
