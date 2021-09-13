const { check } = require('express-validator')

const UpdateUserEmploymentRule = [
  check('id')
    .isMongoId()
    .withMessage('Invalid user employment id'),
  check('employer')
    .not()
    .isEmpty()
    .withMessage('Employer is required'),
  check('designation')
    .not()
    .isEmpty()
    .withMessage('Designation is required')
]

const GetUserEmploymentsByUserIdRule = [
  check('user_id')
    .isMongoId()
    .withMessage('Invalid user  id')
]

const DeleteUserEmploymentRule = [
  check('id')
    .isMongoId()
    .withMessage('Invalid user employment id')
]

module.exports = {
  UpdateUserEmploymentRule,
  GetUserEmploymentsByUserIdRule,
  DeleteUserEmploymentRule
}
