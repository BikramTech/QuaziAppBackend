const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const { appConfig, helpers } = require('../../../config')

const QzUserRegistrationSchema = new mongoose.Schema({
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
  },
  device_tokens: {
    type: Array,
    default: []
  }
})

QzUserRegistrationSchema.plugin(uniqueValidator)

QzUserRegistrationSchema.methods.generateAuthToken = jwt_payload => {
  const token = jwt.sign(jwt_payload, appConfig.auth.jwt_secret, {
    expiresIn: appConfig.auth.jwt_expires_in
  })
  return token
}

QzUserRegistrationSchema.methods.comparePassword = function (password) {
  return helpers.CompareEncryptedTextWithPlainText(password, this.password);
}

const Qz_User_Registration = mongoose.model(
  'Qz_User_Registration',
  QzUserRegistrationSchema
)

module.exports = Qz_User_Registration
