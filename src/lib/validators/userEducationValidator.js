const userEducationRule = require("./validation-rules/userEducationRule");

const { ValidateModel } = require("../../middlewares");

const AddUserEducationValidator = [userEducationRule.AddUserEducationRule, ValidateModel];
const IdValidator = [userEducationRule.IdRule, ValidateModel];

module.exports = { AddUserEducationValidator, IdValidator };
