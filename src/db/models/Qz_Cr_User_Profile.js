const mongoose = require('mongoose')

const QzCrUserProfileSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: [true, "User Id is required"]
    },
    first_name: {
        type: String,
        required: [true, "First Name is required"],
        minlength: 2,
        maxlength: 50
    },
    last_name: {
        type: String,
        required: [true, "Last Name is required"],
        minlength: 2,
        maxlength: 50
    },
    company_name: {
        type: String,
        required: [true, "Company Name is required"],
        minlength: 2,
        maxlength: 50
    },
    company_registration_number: {
        type: String,
        required: [true, "Company Registration Number is required"],
        minlength: 2,
        maxlength: 50
    },
    company_hq: {
        type: String,
        required: [true, "Company Hq is required"],
        minlength: 2,
        maxlength: 50
    },
    company_profile: {
        type: String,
        required: [true, "Company Profile is required"],
        minlength: 2,
        maxlength: 50
    },
    complete_address: {
        type: String,
        required: [true, "Company Address is required"],
        minlength: 2,
        maxlength: 50
    },
    company_type_id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: [true, "Company Type Id is required"],
    },
    agreement_terms_conditions: {
        type: Number,
        enum: [1, 2],
        required: [true, "Agreement Terms & Conditions is required"],
    },
    is_active: {
        type: Boolean,
        default: true
    }
})

const QzCrUserProfile = mongoose.model('Qz_Cr_User_Profile', QzCrUserProfileSchema)

module.exports = QzCrUserProfile
