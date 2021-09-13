const commonRule = require("./validation-rules/commonRule");

const { ValidateModel } = require("../../middlewares");

const EmailValidator = [commonRule.email, ValidateModel];

module.exports = { EmailValidator };
