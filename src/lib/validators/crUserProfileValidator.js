const crUserProfileValidateRule = require('./validation-rules/userProfileRule')
const { ValidateModel } = require('../../middlewares')

const CrUserProfileUpdateValidator = [
  crUserProfileValidateRule.UpdateCrUserProfileRule,
  ValidateModel
]

module.exports = {
  CrUserProfileUpdateValidator
}
