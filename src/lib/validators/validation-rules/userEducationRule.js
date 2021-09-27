const { check } = require('express-validator')

const AddUserEducationRule = [
    check('user_id').isMongoId().withMessage('Invalid User Id'),
    check('name').not().isEmpty().withMessage('Name is required'),
    check('field_of_study').not().isEmpty().withMessage('Field of study is required'),
    check('institute_name').not().isEmpty().withMessage('Institute Name is required'),
    check('country').not().isEmpty().withMessage('Country is required'),
]

const IdRule = [
    check('id').isMongoId().withMessage('Invalid user education id')
]

module.exports = {
    AddUserEducationRule,
    IdRule
}
