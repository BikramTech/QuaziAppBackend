const { check } = require('express-validator')

const AddUserApplicationRule = [
  check('job_id')
    .isMongoId()
    .withMessage('Invalid job id')
  // check("status_id").isMongoId().withMessage("Invalid status id"),
]

const GetUserApplicationsByUserIdRule = [
  check('user_id')
    .isMongoId()
    .withMessage('Invalid user id')
]

const DeleteUserApplicationRule = [
  check('id')
    .isMongoId()
    .withMessage('Invalid user application id')
];

const ChangeUserApplicationRule = [
  check('job_id')
    .isMongoId()
    .withMessage('Invalid job id'),
  check('user_id')
    .isMongoId()
    .withMessage('Invalid user id'),
  check('status_id')
    .isMongoId()
    .withMessage('Invalid status id'),
];

module.exports = {
  AddUserApplicationRule,
  GetUserApplicationsByUserIdRule,
  DeleteUserApplicationRule,
  ChangeUserApplicationRule
}
