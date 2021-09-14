const userProjectsRule = require("./validation-rules/userProjectsRule");
const { ValidateModel } = require("../../middlewares");

const UpdateUserProjectsValidator = [userProjectsRule.UpdateUserProjectRule, ValidateModel];

const AddUserProjectsValidator = [userProjectsRule.AddUserProjectRule, ValidateModel];

const GetUserProjectsByUserIdValidator = [userProjectsRule.GetUserProjectsByUserIdRule, ValidateModel];

const DeleteUserProjectsValidator = [userProjectsRule.DeleteUserProjectRule, ValidateModel];

module.exports = { UpdateUserProjectsValidator, AddUserProjectsValidator, GetUserProjectsByUserIdValidator, DeleteUserProjectsValidator };
