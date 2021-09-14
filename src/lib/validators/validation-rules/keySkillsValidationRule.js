const { check } = require("express-validator");


const AddKeySkillRule = [check('name').not().isEmpty().withMessage('name is required')];

const GetKeySkillByIdRule = [check("id").isMongoId().withMessage("Invalid skill id")];

const UpdateKeySkillRule = [check("id").isMongoId().withMessage("Invalid skill id"), check('name').not().isEmpty().withMessage('name is required')];

const DeleteKeySkillRule = [check("id").isMongoId().withMessage("Invalid skill id")];

module.exports = {
    AddKeySkillRule,
    GetKeySkillByIdRule,
    UpdateKeySkillRule,
    DeleteKeySkillRule
};
