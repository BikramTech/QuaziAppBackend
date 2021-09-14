const userApplicationRule = require("./validation-rules/userApplicationRule");

const { ValidateModel } = require("../../middlewares");

const AddUserApplicationValidator = [userApplicationRule.AddUserApplicationRule, ValidateModel];
const GetUserApplicationsByUserIdValidator = [userApplicationRule.GetUserApplicationsByUserIdRule, ValidateModel];
const DeleteUserApplicationValidator = [userApplicationRule.DeleteUserApplicationRule, ValidateModel];

module.exports = { AddUserApplicationValidator, GetUserApplicationsByUserIdValidator, DeleteUserApplicationValidator };
