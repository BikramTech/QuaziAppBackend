const jobTypeValidationRule = require("./validation-rules/jobTypeValidationRule");
const { ValidateModel } = require("../../middlewares");

const AddJobTypeValidator = [jobTypeValidationRule.AddJobTypeRule, ValidateModel];
const GetJobTypeByJobTypeIdValidator = [jobTypeValidationRule.GetJobTypeByJobTypeIdRule, ValidateModel];
const UpdateJobTypeValidator = [jobTypeValidationRule.UpdateJobTypeRule, ValidateModel];
const DeleteJobTypeValidator = [jobTypeValidationRule.DeleteJobTypeRule, ValidateModel];

module.exports = {
    AddJobTypeValidator,
    GetJobTypeByJobTypeIdValidator,
    UpdateJobTypeValidator,
    DeleteJobTypeValidator
}