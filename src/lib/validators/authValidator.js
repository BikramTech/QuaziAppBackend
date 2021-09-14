const authRule = require("./validation-rules/authRule");

const { ValidateModel } = require("../../middlewares");

const LoginValidator = [authRule.LoginValidationRules, ValidateModel];

const EmailVerificationValidator = [authRule.EmailVerificationValidationRules, ValidateModel];

const UserSignupLoginValidator = [authRule.UserSignupLoginValidationRules, ValidateModel];

const CrUserSignupLoginValidator = [authRule.CrUserSignupLoginValidationRules, ValidateModel];

const UserIdValidator = [authRule.UserIdValidationRule, ValidateModel];

module.exports = { LoginValidator, EmailVerificationValidator, CrUserSignupLoginValidator, UserSignupLoginValidator, UserIdValidator };