const userCertificationRule = require("./validation-rules/userCertificationRule");

const { ValidateModel } = require("../../middlewares");

const UpdateUserCertificationValidator = [
  userCertificationRule.UpdateUserCertificationRules,
  ValidateModel,
];

module.exports = { UpdateUserCertificationValidator };
