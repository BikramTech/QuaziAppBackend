const authRule = require("./validation-rules/authRule");

const { ValidateModel } = require("../../middlewares");

const LoginValidator = [authRule.LoginValidationRules, ValidateModel];

const EmailVerificationValidator = [authRule.EmailVerificationValidationRules, ValidateModel];

const CrUserSignupLoginValidator = [authRule.CrUserSignupLoginValidationRules, ValidateModel];

module.exports = { LoginValidator, EmailVerificationValidator, CrUserSignupLoginValidator };