const userProfileValidateRule = require("./validation-rules/userProfileRule");
const { ValidateModel } = require("../../middlewares");

const UserProfileUpdateValidator = [userProfileValidateRule.UpdateUserProfileRule, ValidateModel];

module.exports = {
    UserProfileUpdateValidator
}