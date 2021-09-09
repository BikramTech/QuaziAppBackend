// const { User } = require("../db/models");
const mongoose = require('mongoose')
const { MailService } = require('../lib/services')
const helpers = require('../config/helpers')
const xx_qz_user = require('../db/models/xx_qz_user')
const { QzUserRegistration, QzUserProfile, QzKeySkills } = require('../db/models')
const bcrypt = require('bcrypt')


class UserController {
  static async userSignup(req, res) {
    // skills work pending!
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

      let selectedSkills = await QzKeySkills.find({ id: { "$in": skills } });

      if (selectedSkills && selectedSkills?.length) {
        selectedSkills = selectedSkills.map(x => x._doc).map(({ _id, name }) => { return { skill_id: _id, skill_name: name } });
      }

      const userProfile = new QzUserProfile({
        user_id: userRegistrationResult._id,
        skills: selectedSkills,
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
      } = userRegistrationResult._doc

      let response = {
        status_code: 1,
        message: 'Succesfully Signed Up',
        result: [{ ...userRegistrationDoc, ...userProfile._doc }]
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

    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword)
      return helpers.SendErrorsAsResponse(
        null,
        res,
        'Invalid username or password.'
      )

    const token = user.generateAuthToken()

    const { password, _id, ...userDoc } = user._doc

    let response = {
      status_code: 1,
      message: 'Your login is successful',
      result: [{ ...userDoc, ...userProfile._doc }]
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

      const { password, ...userDoc } = user._doc

      let response = {
        status_code: 1,
        message: 'This Email is already registered',
        result: [{ ...userDoc, ...userProfile._doc }]
      }

      return helpers.SendSuccessResponseWithAuthHeader(res, token, response)
    } catch (err) {
      return helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async emailVerification(req, res) {
    const { email, otp } = req.body

    try {
      if (!email)
        return helpers.SendErrorsAsResponse(null, res, 'Email is required')

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
      if (userProfileResult.status === 2)
        helpers.SendErrorsAsResponse(
          null,
          res,
          'Your account is inactive. Please contact administrator!'
        )

      let response = ''

      if (userProfileResult.otp && !userProfileResult.is_email_verified) {
        if (userProfileResult.otp === otp) {
          const { modifiedCount } = await userProfileResult.updateOne({
            is_email_verified: 1
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

      if (!email) {
        return helpers.SendErrorsAsResponse(null, res, 'email required')
      }

      if (!mobile_no) {
        return helpers.SendErrorsAsResponse(null, res, 'mobile number required')
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

      let mobile = await QzUserRegistration.findOne({
        mobile_no
      })

      if (mobile)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'Mobile Number is Already Registered.'
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

      let userProfile = ''
      if (!req.files) {
        userProfile = new QzUserProfile({
          user_id: user._id,
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          countryCode: req.body.countryCode,
          social_id: req.body.social_id,
          social_type: req.body.social_type,
          otp: OTP,
          dob: req.body.dob,
          residential_address: req.body.residential_address,
          profile_summary: req.body.profile_summary,
          is_email_verified: true
        })
      } else {
        userProfile = new QzUserProfile({
          user_id: user._id,
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          countryCode: req.body.countryCode,
          social_id: req.body.social_id,
          social_type: req.body.social_type,
          profile_pic:
            req.files && req.files?.profile_pic
              ? req.files.profile_pic[0].path
              : null,
          otp: OTP,
          dob: req.body.dob,
          residential_address: req.body.residential_address,
          profile_summary: req.body.profile_summary,
          is_email_verified: true
        })
      }

      await userProfile.validate()

      await user.save()
      await userProfile.save()

      const token = user.generateAuthToken()
      const { password, _id, ...userDoc } = user._doc

      let response = {
        status_code: 1,
        message: 'User is registered successfully!',
        result: [{ ...userDoc, ...userProfile._doc }]
      }

      return helpers.SendSuccessResponseWithAuthHeader(res, token, response)
    } catch (err) {
      return helpers.SendErrorsAsResponse(err, res)
    }
  }

  // pending work with this api
  static async profileUpdate(req, res) {
    try {
      if (Object.keys(req.files).length === 0) {
        const user = await xx_qz_user.findByIdAndUpdate(
          req.params.id,
          {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            countryCode: req.body.countryCode,
            mobile_no: req.body.mobile_no,
            address: req.body.address,
            user_name: req.body.user_name,
            description: req.body.description,
            education: req.body.education,
            experience: req.body.experience,
            gender: req.body.gender,
            dob: req.body.dob,
            password: req.body.password,
            email: req.body.email,
            summary: req.body.summary,
            skill_id: req.body.skill_id,
            maritial_status: req.body.maritial_status,
            languages: req.body.languages,
            social_id: req.body.social_id,
            social_type: req.body.social_type,
            project_undertaken: req.body.project_undertaken,
            updated: new Date()
          },
          { new: true }
        )

        if (!user)
          return res.status(404).send({
            status_code: 4,
            message: 'The user with the given ID was not found.',
            result: []
          })

        let response = {
          status_code: 1,
          message: 'User Profile Succesfully Updated',
          result: [user]
        }

        res.status(200).send(response)
      } else {
        const user = await xx_qz_user.findByIdAndUpdate(
          req.params.id,
          {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            countryCode: req.body.countryCode,
            mobile_no: req.body.mobile_no,
            address: req.body.address,
            user_name: req.body.user_name,
            description: req.body.description,
            education: req.body.education,
            experience: req.body.experience,
            gender: req.body.gender,
            dob: req.body.dob,
            password: req.body.password,
            email: req.body.email,
            summary: req.body.summary,
            skill_id: req.body.skill_id,
            maritial_status: req.body.maritial_status,
            languages: req.body.languages,
            social_id: req.body.social_id,
            social_type: req.body.social_type,
            project_undertaken: req.body.project_undertaken,
            image: req.files.image[0].path,
            resume: req.files.resume[0].path,
            updated: new Date()
          },
          { new: true }
        )

        if (!user)
          return res.status(404).send({
            status_code: 4,
            message: 'The user with the given ID was not found.',
            result: []
          })

        let response = {
          status_code: 1,
          message: 'User Profile Succesfully Updated',
          result: [user]
        }

        res.status(200).send(response)
      }
    } catch (err) {
      res.status(400).send({ status_code: 2, message: err.message, result: [] })
      console.log('user Profile update', err.message)
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

      let response = {
        status_code: 1,
        message: 'User Details Successfully Fetched',
        result: [{ ...userDoc, ...userProfile._doc }]
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

      const validPassword = await bcrypt.compare(
        req.body.oldPassword,
        userDetails.password
      )
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
        result: [user]
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
      let status = req.body.status
      status = status.toLowerCase()

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
        result: [
          {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            countryCode: user.countryCode,
            address: user.address,
            countryOfBirth: user.countryOfBirth,
            cityOfBirth: user.cityOfBirth,
            roleID: user.roleID,
            status: user.status,
            image: user.image,
            dob: user.dob,
            gender: user.gender,
            created: user.created,
            updated: user.updated
          }
        ]
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      return helpers.SendErrorsAsResponse(err, res, null)
    }
  }
}

module.exports = UserController
