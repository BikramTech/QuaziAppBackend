const { check } = require("express-validator");


const AddCompanyTypeRule = [check('name').not().isEmpty().withMessage('name is required')];

const GetCompanyTypeByJobTypeIdRule = [check("id").isMongoId().withMessage("Invalid company type id")];

const UpdateCompanyTypeRule = [check("id").isMongoId().withMessage("Invalid company type id"), check('name').not().isEmpty().withMessage('name is required')];

const DeleteCompanyTypeRule = [check("id").isMongoId().withMessage("Invalid company type id")];

module.exports = {
    AddCompanyTypeRule,
    GetCompanyTypeByJobTypeIdRule,
    UpdateCompanyTypeRule,
    DeleteCompanyTypeRule
};
