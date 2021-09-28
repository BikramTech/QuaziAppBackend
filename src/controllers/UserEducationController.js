const helpers = require('../config/helpers')
const { QzUserEducation } = require('../db/models')
const mongoose = require('mongoose')

class UserEducationController {
  static async AddUserEducation (req, res) {
    try {
      const {
        name,
        field_of_study,
        institute_name,
        country,
        user_id,
        year_of_passing,
        course_type
      } = req.body

      const userEducationModel = new QzUserEducation({
        name,
        field_of_study,
        institute_name,
        country,
        year_of_passing,
        course_type
      })
      userEducationModel._doc.user_id = mongoose.Types.ObjectId(user_id)

      await userEducationModel.save()

      let response = {
        status_code: 1,
        message: 'User Profile education succesfully added',
        result: [userEducationModel]
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async GetUserEducationByUserId (req, res) {
    try {
      const userEducationModel = await QzUserEducation.find({
        user_id: req.user.userId
      })

      if (!userEducationModel.length) {
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'No record with the provided job type id'
        )
      }

      let response = {
        status_code: 1,
        result: [userEducationModel]
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async GetUserEducations (req, res) {
    try {
      const userEducationModel = await QzUserEducation.find()

      if (!userEducationModel.length) {
        return helpers.SendErrorsAsResponse(null, res, 'No records!')
      }

      let response = {
        status_code: 1,
        result: [userEducationModel]
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async UpdateUserEducation (req, res) {
    try {
      const {
        name,
        field_of_study,
        institute_name,
        country,
        year_of_passing,
        course_type
      } = req.body

      const userEducationModel = new QzUserEducation(req.body)
      await userEducationModel.validate()

      const qzUserEducationUpdatedResult = await QzUserEducation.findByIdAndUpdate(
        req.params.id,
        {
          name,
          field_of_study,
          institute_name,
          country,
          year_of_passing,
          course_type
        },
        { new: true }
      )

      if (!qzUserEducationUpdatedResult)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'No record exists with the provided id'
        )

      let response = {
        status_code: 1,
        message: 'User  education successfully updated',
        result: []
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async DeleteUserEducation (req, res) {
    try {
      const userEducationDeletedResult = await QzUserEducation.findByIdAndDelete(
        req.params.id
      )

      if (!userEducationDeletedResult)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'No record exists with the provided id'
        )

      let response = {
        status_code: 1,
        message: 'User  Education successfully deleted',
        result: []
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }
}

module.exports = UserEducationController
