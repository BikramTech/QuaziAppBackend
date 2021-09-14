const { check } = require('express-validator');


const UpdateCrUserProfileRule = [
    check('user_id').isMongoId().withMessage('Invalid User Id'),
    check('first_name').not().isEmpty().withMessage('First Name is required'),
    check('company_name').not().isEmpty().withMessage('Company Name is required'),
    check('last_name').not().isEmpty().withMessage('Last Name is required'),
    check('company_registration_number').not().isEmpty().withMessage('Company Registration Number is required'),
    check('company_hq').not().isEmpty().withMessage('Company Headquarter is required'),
    check('company_profile').not().isEmpty().withMessage('Company Profile is required'),
    check('company_address').not().isEmpty().withMessage('Company Address is required'),
    check('company_type_id').isMongoId().withMessage('Invalid Company Type Id'),
    check('agreement_terms_conditions').not().isEmpty().withMessage('Agreement Terms & Conditions is required')
];

module.exports = {
    UpdateCrUserProfileRule
}
