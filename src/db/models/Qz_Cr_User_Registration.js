const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const bcrypt = require('bcrypt')
const { appConfig } = require('../../config')

const QzCrUserRegistrationSchema = new mongoose.Schema({
    user_name: {
        type: String,
        required: [true, 'User name is required.'],
        unique: [true, 'User name is already registered!']
    },
    mobile_no: {
        type: String,
        unique: [true, 'Mobile number is already registered!']
    },
    email: {
        type: String,
        required: [true, 'Email is required.'],
        index: true,
        unique: [true, 'Email is already registered!']
    },
    password: {
        type: String,
        required: [true, 'Password is required.']
    },
    otp: {
        type: Number
    },
    is_email_verified: {
        type: Boolean,
        default: false
    }
})

QzCrUserRegistrationSchema.plugin(uniqueValidator)

QzCrUserRegistrationSchema.methods.generateAuthToken = () => {
    const token = jwt.sign({ _id: this._id }, appConfig.auth.jwt_secret, {
        expiresIn: appConfig.auth.jwt_expires_in
    })
    return token
}

QzCrUserRegistrationSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password)
}

const Qz_Cr_User_Registration = mongoose.model(
    'Qz_Cr_User_Registration',
    QzCrUserRegistrationSchema
)

module.exports = Qz_Cr_User_Registration;
