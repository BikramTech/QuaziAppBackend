var router = require("express").Router();
const { AccountController } = require("../../controllers");
const { Authorize, DocUpload } = require("../../apiAttributes");

const DocumentUpload = DocUpload.fields([
    { name: "profile_pic", maxCount: 1 },
    { name: "resume_file", maxCount: 1 },
]);

router.post("/Signup", DocumentUpload, AccountController.userSignup);
router.post("/Login", AccountController.userLogin);
router.post("/SocialLoginValidation", AccountController.socialLoginValidation);
router.post("/EmailVerification", AccountController.emailVerification);
router.post("/SocialLogin", DocumentUpload, AccountController.socialLogin);
router.patch("/ProfileUpdate/:id", [Authorize, DocumentUpload], AccountController.profileUpdate);
router.get("/Details/:id", Authorize, AccountController.details);
router.patch("/ForgotPassword", AccountController.forgotPassword);
router.patch("/ChangePassword/:id", Authorize, AccountController.changePassword);
router.post("/SendOtp", Authorize, AccountController.sendOtp);
router.patch("/ChangeStatus/:id", Authorize, AccountController.changeStatus);

module.exports = router;
