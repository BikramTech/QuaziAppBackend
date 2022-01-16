const mongoose = require('mongoose')

const { MailService, SmsService } = require('../lib/services')
const helpers = require('../config/helpers')
const appConfig = require('../config/appConfig')
const jwt = require('jsonwebtoken')
const {
  QzCrUserRegistration,
  QzCrUserProfile,
  QzUserRegistration
} = require('../db/models')

class CorporateUserController {
  static async userSignup(req, res) {
    try {
      const { user_name, email, mobile_no } = req.body

      const encryptedPassword = helpers.GetEncryptedText(req.body.password)

      const emailVerificationOtp = helpers.GenerateSixDigitCode()

      const userRegistrationResult = await new QzCrUserRegistration({
        user_name,
        email,
        password: encryptedPassword,
        mobile_no,
        otp: emailVerificationOtp
      })

      await userRegistrationResult.save()

      await MailService.sendMail(
        email,
        'OTP For Quazi App Registration',
        emailVerificationOtp
      )
      await SmsService.SendSms(mobile_no, `OTP For Quazi App Registration is ${emailVerificationOtp}`);

      const token = userRegistrationResult.generateAuthToken()
      const {
        password,
        _id,
        otp,
        ...userRegistrationDoc
      } = userRegistrationResult._doc

      let response = {
        status_code: 1,
        message:
          'Your account registration is successful and an OTP has been sent to your email for verification',
        result: [{ ...userRegistrationDoc, user_id: _id }]
      }

      return helpers.SendSuccessResponseWithAuthHeader(res, token, response)
    } catch (err) {
      return helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async emailVerification(req, res) {
    const { email, otp } = req.body

    try {
      const userResult = await QzCrUserRegistration.findOne({
        email
      })

      let response = ''

      if (userResult && userResult.otp && !userResult.is_email_verified) {
        if (parseInt(userResult.otp) === parseInt(otp)) {
          const updatedUserResult = await userResult.updateOne(
            {
              is_email_verified: true
            },
            { new: true }
          )

          if (updatedUserResult) {
            response = {
              status_code: 1,
              message: 'Your account has been verified!'
            }
            return helpers.SendSuccessResponse(res, response)
          }

          return helpers.SendErrorsAsResponse(
            null,
            res,
            'Error occured while email verification, please try again!'
          )
        }

        return helpers.SendErrorsAsResponse(
          null,
          res,
          'Email verification failed, invalid OTP!'
        )
      }

      return helpers.SendErrorsAsResponse(
        null,
        res,
        'Account is already verified!'
      )
    } catch (err) {
      return helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async userProfileUpdate(req, res) {
    try {
      const {
        first_name,
        last_name,
        company_name,
        company_registration_number,
        company_hq,
        company_profile,
        complete_address,
        company_type_id,
        agreement_terms_conditions
      } = req.body

      await QzCrUserProfile.findOneAndUpdate(
        { user_id: req.params.id },
        {
          first_name,
          last_name,
          company_name,
          company_registration_number,
          company_hq,
          company_profile,
          complete_address,
          company_type_id,
          agreement_terms_conditions,
          is_active: true
        },
        { new: true, upsert: true }
      )

      const token = jwt.sign(
        { _id: req.params.id },
        appConfig.auth.jwt_secret,
        { expiresIn: appConfig.auth.jwt_expires_in }
      )

      let response = {
        status_code: 1,
        message: 'Corporate User Profile Successfully Updated',
        result: []
      }

      return helpers.SendSuccessResponseWithAuthHeader(res, token, response)
    } catch (err) {
      return helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async userLogin(req, res) {
    let user = {}
    let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    const { email } = req.body

    if (!email) {
      return helpers.SendErrorsAsResponse(
        null,
        res,
        'Please enter atleast one of email or mobile number or user name'
      )
    }

    if (!Number.isNaN(Number.parseInt(email))) {
      user = await QzCrUserRegistration.findOne({ mobile_no: email })
    } else if (email.match(regexEmail)) {
      user = await QzCrUserRegistration.findOne({
        email: { $regex: email, $options: 'i' }
      })
    } else {
      user = await QzCrUserRegistration.findOne({ user_name: email })
    }

    if (!user) {
      return helpers.SendErrorsAsResponse(
        null,
        res,
        'Invalid username or password.'
      )
    }
    if (user && !user.is_email_verified) {
      return helpers.SendErrorsAsResponse(
        null,
        res,
        'Please verify your email to procced',
        3
      )
    }
    let userProfile = await QzCrUserProfile.findOne({ user_id: user._id })
    if (userProfile && (!userProfile.is_active || !user.is_email_verified)) {
      return helpers.SendErrorsAsResponse(
        null,
        res,
        !userProfile.is_active
          ? 'Your account is inactive. Please contact administrator!'
          : !userProfile.is_email_verified
            ? 'Please verify your email.'
            : ''
      )
    }

    const isValidPassword = user.comparePassword(req.body.password)

    if (!isValidPassword)
      return helpers.SendErrorsAsResponse(
        null,
        res,
        'Invalid username or password.'
      )

    const token = user.generateAuthToken({ _id: user._doc._id })

    const { password, otp, is_email_verified, _id, ...userDoc } = user._doc
    let userResult = userDoc
    if (userProfile) {
      const { _id: userId, ...userProfileDoc } = userProfile._doc
      userResult = { ...userDoc, ...userProfileDoc, is_profile_complete: true }
    } else {
      userResult = { ...userResult, is_profile_complete: false, user_id: _id }
    }
    let response = {
      status_code: 1,
      message: 'Your login is successful',
      result: [userResult]
    }

    return helpers.SendSuccessResponseWithAuthHeader(res, token, response)
  }

  static async forgotPassword(req, res) {
    try {
      const user = await QzCrUserRegistration.findOne({ email: req.body.email })

      if (!user)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'The Email provided is Invalid'
        )

      const decryptedPassword = helpers.GetDecryptedText(user._doc.password)

      var emailResponse = MailService.sendMail(
        user.email,
        'Password forgot mail from Quazi',
        `Your password for the quazi app is ${decryptedPassword}`
      )

      let response = {
        status_code: 1,
        message: 'Password has been sent on your registered email.',
        result: []
      }
      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      return helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async changePassword(req, res) {
    try {
      let password = req.body.newPassword

      password = helpers.GetEncryptedText(password)

      const userDetails = await QzCrUserRegistration.findById(req.params.id)

      if (!userDetails)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'The ID Provided is Invalid'
        )

      const validPassword = userDetails.comparePassword(req.body.oldPassword)

      if (!validPassword)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'Old password doesnot match with our records.'
        )

      const user = await QzCrUserRegistration.findByIdAndUpdate(
        req.params.id,
        {
          password: password,
          updated: new Date()
        },
        { new: true }
      )

      if (!user)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'The ID Provided is Invalid'
        )

      let response = {
        status_code: 1,
        message: 'Password Changed Successfully',
        result: []
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      return helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async details(req, res) {
    try {
      let user = await QzCrUserRegistration.findById(req.params.id)
      if (!user)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'The user with the given ID was not found.'
        )
      let userProfile = await QzCrUserProfile.findOne({
        user_id: req.params.id
      })

      const { password, otp, _id, ...userDoc } = user._doc

      if (userProfile) {
        const { _id: userId, ...userProfileDoc } = userProfile._doc
        user = { ...userDoc, ...userProfileDoc }
      }

      let response = {
        status_code: 1,
        message: 'User Details Successfully Fetched',
        result: [user]
      }
      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      return helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async sendOtp(req, res) {
    try {
      const { email, mobile_no } = req.body
      let OTP = helpers.GenerateSixDigitCode()

      const user = await QzCrUserRegistration.findOneAndUpdate(
        { email: email },
        {
          otp: OTP
        },
        { new: true, upsert: true }
      )
      if (!user)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'The user with the given Email was not found.'
        )

    
      let response

      await MailService.sendMail(email, 'OTP For Quazi', OTP);
      await SmsService.SendSms(mobile_no, `OTP For Quazi is ${OTP}`);

      console.log('Email sent successfully')
      response = {
        status_code: 1,
        message: 'OTP Sent Successfully',
        result: []
      }
      return helpers.SendSuccessResponse(res, response)
      
    } catch (err) {
      return helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async changeStatus(req, res) {
    try {
      if (req.body.status) {
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'Please Provide a Valid Argument in Body'
        )
      }
      let { is_active } = req.body

      const user = await QzCrUserProfile.findByIdAndUpdate(
        req.params.id,
        {
          is_active,
          updated: new Date()
        },
        { new: true }
      )

      if (!user)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'The id Provided is Invalid'
        )

      let response = {
        status_code: 1,
        message: 'Status Changed Successfully',
        result: []
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      return helpers.SendErrorsAsResponse(err, res, null)
    }
  }

  static async saveDeviceToken(req, res) {
    try {
      const { id, device_token } = req.body

      const userRegistrationResult = await  QzCrUserRegistration.findById(id);

      if(userRegistrationResult)
      {
        if(userRegistrationResult.device_tokens && userRegistrationResult.device_tokens.length)
        {
          const isDeviceTokenExistsAlready = userRegistrationResult.device_tokens.filter(x => x === device_token).length > 0;

          if(!isDeviceTokenExistsAlready)
          {
            const deviceTokens = [...userRegistrationResult.device_tokens, device_token]
            await userRegistrationResult.updateOne({device_tokens: deviceTokens});

            let response = {
              status_code: 1,
              message:
                'New Device token saved successfully',
              result: []
            }
      
            return helpers.SendSuccessResponse(res, response)
          }

          return helpers.SendErrorsAsResponse(
            null,
            res,
            'This device token exists already')
        }
        else
        {
          await userRegistrationResult.updateOne({device_tokens: [device_token]});
        }
      }
      return helpers.SendErrorsAsResponse(
        null,
        res,
        'User Not found!')
      
    } catch (err) {
      return helpers.SendErrorsAsResponse(err, res)
    }
  }
}

module.exports = CorporateUserController
