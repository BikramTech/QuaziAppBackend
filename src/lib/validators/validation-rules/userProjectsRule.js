const { check } = require('express-validator');

const UpdateUserProjectRule = [
    check('id').isMongoId().withMessage('Invalid user project id'),
    check('user_id').isMongoId().withMessage('Invalid User Id'),
    check('project_title').not().isEmpty().withMessage('Project Title is required'),
    check('client_name').not().isEmpty().withMessage('Client Name is required'),
    check('project_description').not().isEmpty().withMessage('Project Description is required')
]

const AddUserProjectRule = [
    check('user_id').isMongoId().withMessage('Invalid User Id'),
    check('project_title').not().isEmpty().withMessage('Project Title is required'),
    check('client_name').not().isEmpty().withMessage('Client Name is required'),
    check('project_description').not().isEmpty().withMessage('Project Description is required')
]

const GetUserProjectsByUserIdRule = [check('user_id').isMongoId().withMessage('Invalid user id')]

const DeleteUserProjectRule = [check('id').isMongoId().withMessage('Invalid user employment id')]

module.exports = {
    AddUserProjectRule,
    UpdateUserProjectRule,
    GetUserProjectsByUserIdRule,
    DeleteUserProjectRule
}
