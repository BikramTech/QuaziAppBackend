const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const { MailService } = require('../lib/services')
const helpers = require('../config/helpers')
const appConfig = require('../config/appConfig')
const jwt = require('jsonwebtoken')
const {
  QzUserRegistration,
  QzUserProfile,
  QzUserEmployment,
  QzUserProjects,
  QzUserCertification,
  QzUserApplications
} = require('../db/models')

class UserController {
  static async userSignup (req, res) {
    try {
      const { user_name, email, mobile_no } = req.body

      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(req.body.password, salt)

      const emailVerificationOtp = helpers.GenerateSixDigitCode()

      const userRegistrationResult = await new QzUserRegistration({
        user_name,
        email,
        password: hashedPassword,
        mobile_no,
        otp: emailVerificationOtp
      })

      await userRegistrationResult.save()

      await MailService.sendMail(
        email,
        'OTP For Quazi App Registration',
        emailVerificationOtp
      )

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

  static async userLogin (req, res) {
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
    if (user && !user.is_email_verified) {
      return helpers.SendErrorsAsResponse(
        null,
        res,
        'Please verify your email to procced'
      )
    }
    let userProfile = await QzUserProfile.findOne({ user_id: user._id })
    if (userProfile && (!userProfile.status || !user.is_email_verified)) {
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

    const isValidPassword = await user.comparePassword(req.body.password)

    if (!isValidPassword)
      return helpers.SendErrorsAsResponse(
        null,
        res,
        'Invalid username or password.'
      )

    const token = user.generateAuthToken()

    const { password, otp, is_email_verified, _id, ...userDoc } = user._doc
    let userResult = userDoc
    if (userProfile) {
      const { _id: userId, ...userProfileDoc } = userProfile._doc
      userResult = [
        { ...userDoc, ...userProfileDoc, is_profile_complete: true }
      ]
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

  // static async socialLoginValidation(req, res) {
  //   const { email } = req.body
  //   let user = ''

  //   try {
  //     if (!email) {
  //       return helpers.SendErrorsAsResponse(null, res, 'Email is required')
  //     }
  //     user = await QzUserRegistration.findOne({
  //       email: { $regex: email, $options: 'i' }
  //     })

  //     if (!user) {
  //       return helpers.SendErrorsAsResponse(
  //         null,
  //         res,
  //         'The Email you entered does not exist.'
  //       )
  //     }
  //     let userProfile = await QzUserProfile.findOne({ user_id: user._id })
  //     if (userProfile && !userProfile.status) {
  //       return helpers.SendErrorsAsResponse(
  //         null,
  //         res,
  //         'Your account is inactive. Please contact administrator!'
  //       )
  //     }

  //     const token = user.generateAuthToken()

  //     const { _id, password, ...userDoc } = user._doc
  //     const { _id: userId, ...userProfileDoc } = userProfile._doc

  //     let response = {
  //       status_code: 1,
  //       message: 'This Email is already registered',
  //       result: [{ ...userDoc, ...userProfileDoc }]
  //     }

  //     return helpers.SendSuccessResponseWithAuthHeader(res, token, response)
  //   } catch (err) {
  //     return helpers.SendErrorsAsResponse(err, res)
  //   }
  // }

  static async emailVerification (req, res) {
    const { email, otp } = req.body

    try {
      const userResult = await QzUserRegistration.findOne({
        email
      })

      // const userProfileResult = await QzUserProfile.findOne({
      //   user_id: userResult._id
      // })

      // if (!userProfileResult) {
      //   return helpers.SendErrorsAsResponse(
      //     null,
      //     res,
      //     'The email you entered does not exist.'
      //   )
      // }

      // if (userProfileResult && !userProfileResult.status)
      //   helpers.SendErrorsAsResponse(
      //     null,
      //     res,
      //     'Your account is inactive. Please contact administrator!'
      //   )

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

  static async socialLogin (req, res) {
    try {
      const { email } = req.body

      let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

      if (!email) {
        return helpers.SendErrorsAsResponse(null, res, 'Please enter email')
      } else if (!email.match(regexEmail)) {
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'Please enter a valid email'
        )
      }

      let userDetails = await QzUserRegistration.findOne({
        email: { $regex: email, $options: 'i' }
      })

      if (userDetails) {
        let userProfile = await QzUserProfile.findOne({
          user_id: userDetails._doc._id
        })

        const {
          password,
          otp,
          is_email_verified,
          ...userDetailsDoc
        } = userDetails._doc

        if (userProfile) {
          const { _id, ...userProfileDoc } = userProfile._doc
          const { _id: userId, ...neededUserDetailsDoc } = userDetailsDoc
          userDetails = {
            ...neededUserDetailsDoc,
            ...userProfileDoc,
            is_profile_complete: true
          }
        } else {
          const { _id, ...neededUserDetailsDoc } = userDetailsDoc
          userDetails = {
            ...neededUserDetailsDoc,
            user_id: _id,
            is_profile_complete: false
          }
        }

        const token = jwt.sign(
          { _id: userDetails.user_id },
          appConfig.auth.jwt_secret,
          { expiresIn: appConfig.auth.jwt_expires_in }
        )

        let response = {
          status_code: 1,
          message: 'Your social login is successful',
          result: [userDetails]
        }

        return helpers.SendSuccessResponseWithAuthHeader(res, token, response)
      }

      var randomPassword = helpers.GenerateSixDigitCode().toString()
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(randomPassword, salt)

      let user = await new QzUserRegistration({
        user_name: email,
        email,
        password: hashedPassword
      })

      await user.save()

      const userToken = user.generateAuthToken()
      const { password, is_email_verified, _id, ...userDoc } = user._doc
      user = { ...userDoc, user_id: _id }

      let response = {
        status_code: 1,
        message: 'User is registered successfully!',
        result: [user]
      }

      return helpers.SendSuccessResponseWithAuthHeader(res, userToken, response)
    } catch (err) {
      return helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async profileUpdate (req, res) {
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
            req.files && req.files.profile_pic
              ? req.files.profile_pic[0].path
              : null,
          resume_file:
            req.files && req.files.resume_file
              ? req.files.resume_file[0].path
              : null,
          updated_at: new Date()
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
        message: 'User Profile Successfully Updated',
        result: []
      }

      return helpers.SendSuccessResponseWithAuthHeader(res, token, response)
    } catch (err) {
      return helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async details (req, res) {
    try {
      let user = await QzUserRegistration.findById(req.params.id)
      if (!user)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'The user with the given ID was not found.'
        )
      let userProfile = await QzUserProfile.findOne({ user_id: user._id })

      const { password, otp, _id, ...userDoc } = user._doc

      if (userProfile) {
        const { _id: userId, ...userProfileDoc } = userProfile._doc
        user = [{ ...userDoc, ...userProfileDoc }]
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

  static async forgotPassword (req, res) {
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

  static async changePassword (req, res) {
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

      const validPassword = await userDetails.comparePassword(
        req.body.oldPassword
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
        result: []
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      return helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async sendOtp (req, res) {
    try {
      const { email } = req.body
      let OTP = helpers.GenerateSixDigitCode()

      const user = await QzUserRegistration.findOne({ email })
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
        .catch(err => {
          return helpers.SendErrorsAsResponse(err, res, 'Failed to send OTP')
        })
    } catch (err) {
      return helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async changeStatus (req, res) {
    try {
      if (req.body.status) {
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'Please Provide a Valid Argument in Body'
        )
      }
      let status = req.body.status

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

  // User Employment Api Starts :-

  static async AddUserEmployment (req, res) {
    try {
      const { user_id, employer, designation, start_date, end_date } = req.body

      const userEmploymentModel = new QzUserEmployment({
        user_id,
        employer,
        designation,
        start_date,
        end_date
      })

      await userEmploymentModel.save()

      let response = {
        status_code: 1,
        message: 'User employment succesfully added',
        result: []
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async GetUserEmploymentsByUserId (req, res) {
    try {
      const userEmployments = await QzUserEmployment.find({
        user_id: req.params.user_id
      })

      let response = {
        status_code: 1,
        result: [userEmployments]
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async UpdateUserEmployment (req, res) {
    try {
      const { employer, designation, start_date, end_date } = req.body

      const userUpdatedResult = await QzUserEmployment.findByIdAndUpdate(
        req.params.id,
        { employer, designation, start_date, end_date },
        { new: true }
      )

      if (!userUpdatedResult)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'No record exists with the provided id'
        )

      let response = {
        status_code: 1,
        message: 'User employment successfully updated',
        result: []
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async DeleteUserEmployment (req, res) {
    try {
      const userEmploymentDeletedResult = await QzUserEmployment.findByIdAndDelete(
        req.params.id
      )

      if (!userEmploymentDeletedResult)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'No record exists with the provided id'
        )

      let response = {
        status_code: 1,
        message: 'User employment successfully deleted',
        result: []
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  // User Projects Api Starts :-

  static async AddUserProject (req, res) {
    try {
      const {
        user_id,
        project_title,
        client_name,
        project_description,
        start_date,
        end_date
      } = req.body

      const userProjectModel = new QzUserProjects({
        user_id,
        project_title,
        client_name,
        project_description,
        start_date,
        end_date
      })

      await userProjectModel.save()

      let response = {
        status_code: 1,
        message: 'User project succesfully added',
        result: []
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async GetUserProjectsByUserId (req, res) {
    try {
      const userProjects = await QzUserProjects.find({
        user_id: req.params.user_id
      })

      if (!userProjects.length) {
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'No record with the provided user id'
        )
      }

      let response = {
        status_code: 1,
        result: [userProjects]
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async UpdateUserProject (req, res) {
    try {
      const {
        project_title,
        client_name,
        project_description,
        start_date,
        end_date
      } = req.body

      const userProjectResult = await QzUserProjects.findByIdAndUpdate(
        req.params.id,
        {
          project_title,
          client_name,
          project_description,
          start_date,
          end_date
        },
        { new: true }
      )

      if (!userProjectResult)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'No record exists with the provided id'
        )

      let response = {
        status_code: 1,
        message: 'User project successfully updated',
        result: []
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async DeleteUserProject (req, res) {
    try {
      const userProjectDeletedResult = await QzUserProjects.findByIdAndDelete(
        req.params.id
      )

      if (!userProjectDeletedResult)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'No record exists with the provided id'
        )

      let response = {
        status_code: 1,
        message: 'User project successfully deleted',
        result: []
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  // User Certification Api Starts :-

  static async AddUserCertification (req, res) {
    try {
      const {
        user_id,
        certification_name,
        certification_from,
        valid_till_date,
        year_of_completion_date
      } = req.body

      const userCertificationModel = new QzUserCertification({
        user_id,
        certification_name,
        certification_from,
        valid_till_date,
        year_of_completion_date
      })

      await userCertificationModel.save()

      let response = {
        status_code: 1,
        message: 'User certification succesfully added',
        result: []
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async GetUserCertificationsByUserId (req, res) {
    try {
      const userCertifications = await QzUserCertification.find({
        user_id: req.params.user_id
      })

      if (!userCertifications.length) {
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'No record with the provided user id'
        )
      }

      let response = {
        status_code: 1,
        result: [userCertifications]
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async UpdateUserCertification (req, res) {
    try {
      const {
        certification_name,
        certification_from,
        valid_till_date,
        year_of_completion_date
      } = req.body

      const userCertificationUpdatedResult = await QzUserCertification.findByIdAndUpdate(
        req.params.id,
        {
          certification_name,
          certification_from,
          valid_till_date,
          year_of_completion_date
        },
        { new: true }
      )

      if (!userCertificationUpdatedResult)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'No record exists with the provided id'
        )

      let response = {
        status_code: 1,
        message: 'User certification successfully updated',
        result: []
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async DeleteUserCertification (req, res) {
    try {
      const userCertificationDeletedResult = await QzUserCertification.findByIdAndDelete(
        req.params.id
      )

      if (!userCertificationDeletedResult)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'No record exists with the provided id'
        )

      let response = {
        status_code: 1,
        message: 'User certification successfully deleted',
        result: []
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  // User Applications Api Starts :-

  static async AddUserApplication (req, res) {
    try {
      const { user_id, job_id, status_id } = req.body
      const last_update_date = new Date().toISOString()

      const userApplicationsModel = new QzUserApplications({
        user_id,
        job_id,
        status_id,
        last_update_date
      })

      await userApplicationsModel.save()

      let response = {
        status_code: 1,
        message: 'User application succesfully added',
        result: []
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async GetUserApplicationsByUserId (req, res) {
    try {
      const userApplications = await QzUserApplications.find({
        user_id: req.params.user_id
      })

      if (!userApplications.length) {
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'No record with the provided user id'
        )
      }

      let response = {
        status_code: 1,
        result: [userApplications]
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async DeleteUserApplication (req, res) {
    try {
      const userApplicationDeletedResult = await QzUserApplications.findByIdAndDelete(
        req.params.id
      )

      if (!userApplicationDeletedResult)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'No record exists with the provided id'
        )

      let response = {
        status_code: 1,
        message: 'User application successfully deleted',
        result: []
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }
}

module.exports = UserController
