const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const bcrypt = require('bcrypt')

const QzUserRegistrationSchema = new mongoose.Schema({
  user_name: {
    type: String,
    required: [true, 'User name is required.'],
    unique: [true, 'User name is already registered!']
  },
  mobile_no: {
    type: String,
    required: [true, 'Mobile number is required.'],
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
  }
})

QzUserRegistrationSchema.plugin(uniqueValidator)

QzUserRegistrationSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.jwt_secret, {
    expiresIn: process.env.jwt_expiresin
  })
  return token
}

QzUserRegistrationSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

const Qz_User_Registration = mongoose.model(
  'Qz_User_Registration',
  QzUserRegistrationSchema
)

module.exports = Qz_User_Registration
