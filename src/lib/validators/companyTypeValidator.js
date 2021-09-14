const companyTypeValidationRule = require("./validation-rules/companyTypeValidationRule");
const { ValidateModel } = require("../../middlewares");

const AddCompanyTypeValidator = [companyTypeValidationRule.AddCompanyTypeRule, ValidateModel];
const GetCompanyTypeByJobTypeIdValidator = [companyTypeValidationRule.GetCompanyTypeByJobTypeIdRule, ValidateModel];
const UpdateCompanyTypeValidator = [companyTypeValidationRule.UpdateCompanyTypeRule, ValidateModel];
const DeleteCompanyTypeValidator = [companyTypeValidationRule.DeleteCompanyTypeRule, ValidateModel];

module.exports = {
    AddCompanyTypeValidator,
    GetCompanyTypeByJobTypeIdValidator,
    UpdateCompanyTypeValidator,
    DeleteCompanyTypeValidator
}