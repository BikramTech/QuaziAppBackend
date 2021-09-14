const keySkillValidationRule = require("./validation-rules/keySkillsValidationRule");

const { ValidateModel } = require("../../middlewares");

const AddKeySkillRuleValidator = [keySkillValidationRule.AddKeySkillRule, ValidateModel];
const UpdateKeySkillValidator = [keySkillValidationRule.UpdateKeySkillRule, ValidateModel];
const GetKeySkillByIdRuleValidator = [keySkillValidationRule.GetKeySkillByIdRule, ValidateModel];
const DeleteKeySkillRuleValidator = [keySkillValidationRule.DeleteKeySkillRule, ValidateModel];

module.exports = { AddKeySkillRuleValidator, GetKeySkillByIdRuleValidator, DeleteKeySkillRuleValidator, UpdateKeySkillValidator };
