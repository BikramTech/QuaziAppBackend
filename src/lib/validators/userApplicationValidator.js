const userApplicationRule = require("./validation-rules/userApplicationRule");

const { ValidateModel } = require("../../middlewares");

const AddUserApplicationValidator = [userApplicationRule.AddUserApplicationRule, ValidateModel];
const GetUserApplicationsByUserIdValidator = [userApplicationRule.GetUserApplicationsByUserIdRule, ValidateModel];
const DeleteUserApplicationValidator = [userApplicationRule.DeleteUserApplicationRule, ValidateModel];
const ChangeUserApplicationValidator = [userApplicationRule.ChangeUserApplicationRule, ValidateModel];

module.exports = { AddUserApplicationValidator, GetUserApplicationsByUserIdValidator, DeleteUserApplicationValidator, ChangeUserApplicationValidator };
