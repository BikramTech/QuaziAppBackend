const userCertificationRule = require("./validation-rules/userCertificationRule");

const { ValidateModel } = require("../../middlewares");

const AddUserCertificationValidator = [userCertificationRule.AddUserCertificationRule, ValidateModel];
const UpdateUserCertificationValidator = [userCertificationRule.UpdateUserCertificationRules, ValidateModel];
const GetUserCertificationsByUserIdValidator = [userCertificationRule.GetUserCertificationsByUserIdRule, ValidateModel];
const DeleteUserCertificationValidator = [userCertificationRule.DeleteUserCertificationRule, ValidateModel];

module.exports = { AddUserCertificationValidator, UpdateUserCertificationValidator, GetUserCertificationsByUserIdValidator, DeleteUserCertificationValidator };
