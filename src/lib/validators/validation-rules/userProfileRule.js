const { check } = require('express-validator');


const UpdateUserProfileRule = [
    check('user_id').isMongoId().withMessage('Invalid User Id'),
    check('first_name').not().isEmpty().withMessage('First Name is required'),
    check('countryCode').not().isEmpty().withMessage('Country Code is required'),
    check('last_name').not().isEmpty().withMessage('Last Name is required'),
    check('dob').not().isEmpty().withMessage('Date Of Birth is required'),
    check('residential_address').not().isEmpty().withMessage('Residential Address is required'),
    check('profile_summary').not().isEmpty().withMessage('Project Summary is required'),
    check('skills').not().isEmpty().withMessage('Skills are required'),
    check('profile_pic').not().isEmpty().withMessage('Profile Pic is required'),
];

module.exports = {
    UpdateUserProfileRule
}
