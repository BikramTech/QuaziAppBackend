const { check } = require('express-validator')

const UpdateUserEmploymentRule = [
  check('id').isMongoId().withMessage('Invalid user employment id'),
  check('user_id').not().isEmpty().withMessage('User Id is required'),
  check('employer').not().isEmpty().withMessage('Employer is required'),
  check('designation').not().isEmpty().withMessage('Designation is required')
]

const AddUserEmploymentRule = [
  check('user_id').isMongoId().withMessage('Invalid User Id'),
  check('employer').not().isEmpty().withMessage('Employer is required'),
  check('designation').not().isEmpty().withMessage('Designation is required')
]

const GetUserEmploymentsByUserIdRule = [
  check('user_id').isMongoId().withMessage('Invalid user  id')
]

const DeleteUserEmploymentRule = [
  check('id').isMongoId().withMessage('Invalid user employment id')
]

module.exports = {
  AddUserEmploymentRule,
  UpdateUserEmploymentRule,
  GetUserEmploymentsByUserIdRule,
  DeleteUserEmploymentRule
}
