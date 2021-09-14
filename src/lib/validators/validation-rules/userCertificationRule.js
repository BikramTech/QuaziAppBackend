const { check } = require("express-validator");


const UpdateUserCertificationRules = [
  check("id").isMongoId().withMessage("Invalid user certificate id"),
  check("user_id").isMongoId().withMessage("Invalid user id"),
  check("certification_name").not().isEmpty().withMessage("Certification Name is required"),
  check("certification_from").not().isEmpty().withMessage("Certification From is required"),
  check("year_of_completion_date").not().isEmpty().withMessage("Year Of Completion is required")
];

const AddUserCertificationRule = [
  check("user_id").isMongoId().withMessage("Invalid user id"),
  check("certification_name").not().isEmpty().withMessage("Certification Name is required"),
  check("certification_from").not().isEmpty().withMessage("Certification From is required"),
  check("year_of_completion_date").not().isEmpty().withMessage("Year Of Completion is required")
];

const GetUserCertificationsByUserIdRule = [check("user_id").isMongoId().withMessage("Invalid user id")];

const DeleteUserCertificationRule = [check("id").isMongoId().withMessage("Invalid user certification id")]

module.exports = {
  AddUserCertificationRule,
  UpdateUserCertificationRules,
  GetUserCertificationsByUserIdRule,
  DeleteUserCertificationRule
};
