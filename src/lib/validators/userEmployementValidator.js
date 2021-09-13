const userEmploymentRule = require("./validation-rules/userEmploymentRule");

const { ValidateModel } = require("../../middlewares");

const UpdateUserEmploymentValidator = [
  userEmploymentRule.UpdateUserEmploymentRule,
  ValidateModel,
];

module.exports = { UpdateUserEmploymentValidator };
