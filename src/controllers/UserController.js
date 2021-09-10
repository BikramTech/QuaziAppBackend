const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const { MailService } = require('../lib/services')
const helpers = require('../config/helpers')
const { QzUserRegistration, QzUserProfile } = require('../db/models')



class UserController {
  static async userSignup(req, res) {

    try {
      const {
        user_name,
        email,
        mobile_no,
        first_name,
        last_name,
        countryCode,
        residential_address,
        description,
        education,
        experience,
        gender,
        dob,
        profile_summary,
        skills,
        marital_status,
        languages,
        agreement_terms_conditions,
        social_id,
        social_type
      } = req.body

      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(req.body.password, salt)

      const userRegistrationResult = await new QzUserRegistration({
        user_name,
        email,
        password: hashedPassword,
        mobile_no
      })

      await userRegistrationResult.validate()

      const OTP = helpers.GenerateSixDigitCode();

      const userProfile = new QzUserProfile({
        user_id: userRegistrationResult._id,
        skills,
        first_name,
        last_name,
        profile_summary,
        countryCode,
        residential_address,
        description,
        education,
        experience,
        gender,
        dob,
        otp: OTP,
        description,
        languages,
        marital_status,
        agreement_terms_conditions,
        social_id,
        social_type,
        profile_pic:
          req?.files && req.files?.profile_pic
            ? req.files?.profile_pic[0].path
            : null,
        resume_file:
          req?.files && req.files?.resume_file
            ? req.files?.resume_file[0].path
            : null
      })

      await userProfile.validate()

      await userRegistrationResult.save()
      await userProfile.save()

      await MailService.sendMail(email, 'OTP For Quazi App Registration', OTP)

      const token = userProfile.generateAuthToken()
      const {
        password,
        _id,
        ...userRegistrationDoc
      } = userRegistrationResult._doc;
      const { _id: userId, ...userProfileDoc } = userProfile._doc;

      let response = {
        status_code: 1,
        message: 'Your account registration is successful',
        result: [{ ...userRegistrationDoc, ...userProfileDoc }]
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
      user = await QzUserRegistration.findOne({ mobile_no: email })
    } else if (email.match(regexEmail)) {
      user = await QzUserRegistration.findOne({
        email: { $regex: email, $options: 'i' }
      })
    } else {
      user = await QzUserRegistration.findOne({ user_name: email })
    }

    if (!user) {
      return helpers.SendErrorsAsResponse(
        null,
        res,
        'Invalid username or password.'
      )
    }

    let userProfile = await QzUserProfile.findOne({ user_id: user._id })
    if (
      userProfile &&
      (!userProfile.status || !userProfile.is_email_verified)
    ) {
      return helpers.SendErrorsAsResponse(
        null,
        res,
        !userProfile.status
          ? 'Your account is inactive. Please contact administrator!'
          : !userProfile.is_email_verified
            ? 'Please verify your email.'
            : ''
      )
    }

    const isValidPassword = await user.comparePassword(req.body.password);

    if (!isValidPassword)
      return helpers.SendErrorsAsResponse(
        null,
        res,
        'Invalid username or password.'
      )

    const token = user.generateAuthToken()

    const { password, _id, ...userDoc } = user._doc;
    const { _id: userId, ...userProfileDoc } = userProfile._doc;

    let response = {
      status_code: 1,
      message: 'Your login is successful',
      result: [{ ...userDoc, ...userProfileDoc }]
    }

    return helpers.SendSuccessResponseWithAuthHeader(res, token, response)
  }

  static async socialLoginValidation(req, res) {

    const { email } = req.body
    let user = ''

    try {
      if (!email) {
        return helpers.SendErrorsAsResponse(null, res, 'Email is required')
      }
      user = await QzUserRegistration.findOne({
        email: { $regex: email, $options: 'i' }
      })

      if (!user) {
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'The Email you entered does not exist.'
        )
      }
      let userProfile = await QzUserProfile.findOne({ user_id: user._id })
      if (userProfile && !userProfile.status) {
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'Your account is inactive. Please contact administrator!'
        )
      }

      const token = user.generateAuthToken()

      const { _id, password, ...userDoc } = user._doc
      const { _id: userId, ...userProfileDoc } = userProfile._doc;

      let response = {
        status_code: 1,
        message: 'This Email is already registered',
        result: [{ ...userDoc, ...userProfileDoc }]
      }

      return helpers.SendSuccessResponseWithAuthHeader(res, token, response)
    } catch (err) {
      return helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async emailVerification(req, res) {

    const { email, otp } = req.body

    try {


      const userResult = await QzUserRegistration.findOne({
        email
      })

      const userProfileResult = await QzUserProfile.findOne({
        user_id: userResult._id
      })

      if (!userProfileResult) {
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'The email you entered does not exist.'
        )
      }
      if (!userProfileResult.status)
        helpers.SendErrorsAsResponse(
          null,
          res,
          'Your account is inactive. Please contact administrator!'
        )

      let response = ''

      if (userProfileResult.otp && !userProfileResult.is_email_verified) {
        if (userProfileResult.otp === otp) {
          const { modifiedCount } = await userProfileResult.updateOne({
            is_email_verified: true
          })

          if (modifiedCount) {
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

  static async socialLogin(req, res) {
    try {
      const { mobile_no, email, user_name } = req.body

      let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

      if (!email) {
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'Please enter email'
        )
      }
      else if (!email.match(regexEmail)) {
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'Please enter a valid email'
        )
      }

      let userDetails = await QzUserRegistration.findOne({
        email: { $regex: email, $options: 'i' }
      })

      if (userDetails)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'Email is Already Registered.'
        )


      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(req.body.password, salt)

      const user = await new QzUserRegistration({
        user_name,
        email,
        password: hashedPassword,
        mobile_no
      })

      await user.validate()

      const OTP = helpers.GenerateSixDigitCode()

      const userProfile = new QzUserProfile({
        user_id: user._id,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        countryCode: req.body.countryCode,
        social_id: req.body.social_id,
        social_type: req.body.social_type,
        profile_pic:
          req?.files && req.files?.profile_pic
            ? req.files.profile_pic[0].path
            : null,
        otp: OTP,
        dob: req.body.dob,
        residential_address: req.body.residential_address,
        profile_summary: req.body.profile_summary,
        is_email_verified: true
      })

      await userProfile.validate()

      await user.save()
      await userProfile.save()

      const token = user.generateAuthToken()
      const { password, _id, ...userDoc } = user._doc
      const { _id: userId, ...userProfileDoc } = userProfile._doc;

      let response = {
        status_code: 1,
        message: 'User is registered successfully!',
        result: [{ ...userDoc, ...userProfileDoc }]
      }

      return helpers.SendSuccessResponseWithAuthHeader(res, token, response)
    } catch (err) {
      return helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async profileUpdate(req, res) {
    try {

      const {
        first_name,
        last_name,
        countryCode,
        residential_address,
        description,
        education,
        experience,
        dob,
        profile_summary,
        skills,
        marital_status,
        languages,
        social_id,
        social_type
      } = req.body

      const user = await QzUserProfile.findOneAndUpdate(
        { user_id: req.params.id },
        {
          skills,
          first_name,
          last_name,
          profile_summary,
          countryCode,
          residential_address,
          description,
          education,
          experience,
          dob,
          description,
          languages,
          marital_status,
          social_id,
          social_type,
          profile_pic:
            req?.files && req.files?.profile_pic
              ? req.files?.profile_pic[0].path
              : null,
          resume_file:
            req?.files && req.files?.resume_file
              ? req.files?.resume_file[0].path
              : null,
          updated_at: new Date()
        },
        { new: true }
      );

      if (!user)

        return helpers.SendErrorsAsResponse(null, res, "The user with the given ID was not found.");

      const token = user.generateAuthToken()

      let response = {
        status_code: 1,
        message: 'User Profile Succesfully Updated',
        result: []
      }

      return helpers.SendSuccessResponseWithAuthHeader(res, token, response);

    } catch (err) {
      return helpers.SendErrorsAsResponse(err, res);
    }
  }

  static async details(req, res) {
    try {
      const user = await QzUserRegistration.findById(req.params.id)
      if (!user)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'The user with the given ID was not found.'
        )
      let userProfile = await QzUserProfile.findOne({ user_id: user._id })

      const { password, _id, ...userDoc } = user._doc
      const { _id: userId, ...userProfileDoc } = userProfile._doc

      let response = {
        status_code: 1,
        message: 'User Details Successfully Fetched',
        result: [{ ...userDoc, ...userProfileDoc }]
      }
      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      return helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async forgotPassword(req, res) {
    try {
      const user = await QzUserRegistration.findOne({ email: req.body.email })

      if (!user)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'The Email provided is Invalid'
        )

      let password = req.body.newPassword
      const salt = await bcrypt.genSalt(10)
      password = await bcrypt.hash(password, salt)

      await QzUserRegistration.findByIdAndUpdate(
        user._id,
        {
          password: password,
          updated: new Date()
        },
        { new: true }
      )

      await MailService.sendMail(
        user.email,
        'Password reset mail from Quazi',
        'Your password has been reset successfully '
      )

      let response = {
        status_code: 1,
        message: 'Password reset successful.',
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
      const salt = await bcrypt.genSalt(10)
      password = await bcrypt.hash(password, salt)

      const userDetails = await QzUserRegistration.findById(req.params.id)

      if (!userDetails)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'The ID Provided is Invalid'
        )

      const validPassword = await userDetails.comparePassword(req.body.oldPassword);

      if (!validPassword)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'Old password doesnot match with our records.'
        )

      const user = await QzUserRegistration.findByIdAndUpdate(
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

  static async sendOtp(req, res) {
    try {
      const { email } = req.body
      let OTP = helpers.GenerateSixDigitCode()

      const user = await QzUserRegistration.findOne({ email }).select({
        _id: 1
      })
      if (!user)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'The user with the given Email was not found.'
        )
      let response

      MailService.sendMail(email, 'OTP For Quazi', OTP)
        .then(resp => {
          console.log('Email sent successfully')
          response = {
            status_code: 1,
            message: 'OTP Sent Successfully',
            result: []
          }
          return helpers.SendSuccessResponse(res, response)
        })
        .catch(err)
      {
        return helpers.SendErrorsAsResponse(null, res, 'Failed to send OTP')
      }
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
      let status = req.body.status;

      const user = await QzUserProfile.findByIdAndUpdate(
        req.params.id,
        {
          status: status,
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
}

module.exports = UserController
