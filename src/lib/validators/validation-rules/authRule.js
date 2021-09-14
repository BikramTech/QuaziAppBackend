const { check } = require("express-validator");
const { email } = require("./commonRule");

const LoginValidationRules = [
  check("email").not().isEmpty().withMessage("Please enter atleast one of email or mobile number or user name"),
  check("password").not().isEmpty().withMessage("Invalid password")
];

const EmailVerificationValidationRules = [
  email,
  check("email").not().isEmpty().withMessage("Please enter email to verify"),
  check("otp").isNumeric().withMessage("otp must be a numeric").isLength({ min: 6, max: 6 }).withMessage("Invalid otp").toInt()
];

const UserSignupLoginValidationRules = [
  email,
  check("email").not().isEmpty().withMessage("Please enter email"),
  check("user_name").not().isEmpty().withMessage("Please enter user name"),
  check("password").not().isEmpty().withMessage("Please enter password"),
];

const CrUserSignupLoginValidationRules = [
  email,
  check("email").not().isEmpty().withMessage("Please enter email"),
  check("user_name").not().isEmpty().withMessage("Please enter user name"),
  check("password").not().isEmpty().withMessage("Please enter password"),
];

const UserIdValidationRule = [check("id").isMongoId().withMessage("Invalid User Id")];

const ChangePasswordValidationRule = [check("id").isMongoId().withMessage("Invalid User Id"), check("newPassword").not().isEmpty().withMessage("Please enter new password")];

module.exports = {
  LoginValidationRules,
  EmailVerificationValidationRules,
  UserSignupLoginValidationRules,
  CrUserSignupLoginValidationRules,
  UserIdValidationRule,
  ChangePasswordValidationRule
};
