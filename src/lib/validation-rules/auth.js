const { check } = require("express-validator");
const { email } = require('./common');

const LoginValidationRules = [check("email").not().isEmpty().withMessage("Please enter atleast one of email or mobile number or user name"), check("password").not().isEmpty().withMessage("Invalid password")];

const EmailVerificationValidationRules = [email, check("email").not().isEmpty().withMessage("Please enter email to verify"), check("otp").not().isEmpty().withMessage("Please enter otp")];

const SocialLoginValidationRules = [email, check("email").not().isEmpty().withMessage("Please enter email"), check("mobile_no").not().isEmpty().withMessage("Please enter mobile number")]

module.exports = { LoginValidationRules, EmailVerificationValidationRules, SocialLoginValidationRules };
