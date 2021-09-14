const crUserProfileValidateRule = require("./validation-rules/userProfileRule");
const { ValidateModel } = require("../../middlewares");

const CrUserProfileUpdateValidator = [crUserProfileValidateRule.UpdateUserProfileRule, ValidateModel];

module.exports = {
    CrUserProfileUpdateValidator
}