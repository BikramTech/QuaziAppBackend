const { check } = require("express-validator");
const { email } = require('./common');

const LoginValidationRules = [check("email").not().isEmpty().withMessage("Please enter atleast one of email or mobile number or user name"), check("password").not().isEmpty().withMessage("Invalid password")];

const EmailVerificationValidationRules = [email, check("email").not().isEmpty().withMessage("Please enter email to verify"), check("otp").not().isEmpty().withMessage("Please enter otp")];

const CrUserSignupLoginValidationRules = [email, check("email").not().isEmpty().withMessage("Please enter email"), check("user_name").not().isEmpty().withMessage("Please enter user name"), check("password").not().isEmpty().withMessage("Please enter password")];

module.exports = { LoginValidationRules, EmailVerificationValidationRules, CrUserSignupLoginValidationRules };
