const jobListingValidationRule = require("./validation-rules/jobListingValidationRule");
const { ValidateModel } = require("../../middlewares");

const AddJobListingValidator = [jobListingValidationRule.AddJobListingRule, ValidateModel];
const UpdateJobListingValidator = [jobListingValidationRule.UpdateJobListingRule, ValidateModel];
const GetJobListingByIdValidator = [jobListingValidationRule.GetJobListingByIdRule, ValidateModel];
const GetJobListingPagedListValidator = [jobListingValidationRule.GetJobListingPagedListRule, ValidateModel];
const DeleteJobListingValidator = [jobListingValidationRule.DeleteJobListingRule, ValidateModel];

module.exports = {
    AddJobListingValidator,
    UpdateJobListingValidator,
    GetJobListingByIdValidator,
    GetJobListingPagedListValidator,
    DeleteJobListingValidator
}