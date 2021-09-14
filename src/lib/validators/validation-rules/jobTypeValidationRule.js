const { check } = require("express-validator");


const AddJobTypeRule = [check('name').not().isEmpty().withMessage('name is required')];

const GetJobTypeByJobTypeIdRule = [check("id").isMongoId().withMessage("Invalid job type id")];

const UpdateJobTypeRule = [check("id").isMongoId().withMessage("Invalid job type id"), check('name').not().isEmpty().withMessage('name is required')];

const DeleteJobTypeRule = [check("id").isMongoId().withMessage("Invalid job type id")];

module.exports = {
    AddJobTypeRule,
    GetJobTypeByJobTypeIdRule,
    UpdateJobTypeRule,
    DeleteJobTypeRule
};
