const userEmploymentRule = require("./validation-rules/userEmploymentRule");

const { ValidateModel } = require("../../middlewares");

const UpdateUserEmploymentValidator = [userEmploymentRule.UpdateUserEmploymentRule, ValidateModel];

const AddUserEmploymentValidator = [userEmploymentRule.AddUserEmploymentRule, ValidateModel];

const GetUserEmploymentsByUserIdValidator = [userEmploymentRule.GetUserEmploymentsByUserIdRule, ValidateModel];

const DeleteUserEmploymentRule = [userEmploymentRule.DeleteUserEmploymentRule, ValidateModel];

module.exports = { UpdateUserEmploymentValidator, AddUserEmploymentValidator, GetUserEmploymentsByUserIdValidator, DeleteUserEmploymentRule };
