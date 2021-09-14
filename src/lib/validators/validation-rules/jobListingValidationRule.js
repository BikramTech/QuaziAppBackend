const { check } = require("express-validator");


const AddJobListingRule = [
    check('job_name').not().isEmpty().withMessage('Job Name is required'),
    check('job_description').not().isEmpty().withMessage('Job Description is required'),
    check("id").isMongoId().withMessage("Invalid job  id"),
    check('job_type_id').not().isEmpty().withMessage('Invalid Job Type Id'),
    check('company_name').not().isEmpty().withMessage('company name is required'),
    check("posted_by").isMongoId().withMessage("Invalid posted_by")
];

const GetJobListingByIdRule = [
    check("id").isMongoId().withMessage("Invalid job  id"),
    check('job_name').not().isEmpty().withMessage('Job Name is required'),
    check('job_description').not().isEmpty().withMessage('Job Description is required'),
    check("id").isMongoId().withMessage("Invalid job type id"),
    check('job_type_id').not().isEmpty().withMessage('Invalid Job Type Id'),
    check('company_name').not().isEmpty().withMessage('company name is required'),
    check("posted_by").isMongoId().withMessage("Invalid posted_by")
];

const GetJobListingPagedListRule = [check("id").isMongoId().withMessage("Invalid job  id"), check('name').not().isEmpty().withMessage('name is required')];

const UpdateJobListingRule = [check("id").isMongoId().withMessage("Invalid job id")];
const DeleteJobListingRule = [check("id").isMongoId().withMessage("Invalid job id")];

module.exports = {
    AddJobListingRule,
    GetJobListingByIdRule,
    GetJobListingPagedListRule,
    UpdateJobListingRule,
    DeleteJobListingRule
};
