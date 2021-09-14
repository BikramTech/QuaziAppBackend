const helpers = require('../config/helpers')
const { QzJobTypes } = require('../db/models')

class JobTypesController {
  static async addJobType (req, res) {
    try {
      const { name, is_active } = req.body

      const jobTypes = new QzJobTypes({
        name,
        is_active
      })

      await jobTypes.save()

      let response = {
        status_code: 1,
        message: 'Job Type succesfully added',
        result: []
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async getJobTypeByJobTypeId (req, res) {
    try {
      const jobType = await QzJobTypes.findById(req.params.id)

      if (!jobType) {
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'No record with the provided job type id'
        )
      }

      let response = {
        status_code: 1,
        result: jobType
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async getJobType (req, res) {
    try {
      const jobTypes = await QzJobTypes.find()

      if (!jobTypes.length) {
        return helpers.SendErrorsAsResponse(null, res, 'No records!')
      }

      let response = {
        status_code: 1,
        result: jobTypes
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async updateJobType (req, res) {
    try {
      const { name, is_active } = req.body

      const qzJobTypeUpdatedResult = await QzJobTypes.findByIdAndUpdate(
        req.params.id,
        {
          name,
          is_active
        },
        { new: true }
      )

      if (!qzJobTypeUpdatedResult)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'No record exists with the provided id'
        )

      let response = {
        status_code: 1,
        message: 'Job Type successfully updated',
        result: []
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async deleteJobType (req, res) {
    try {
      const jobTypeDeletedResult = await QzJobTypes.findByIdAndDelete(
        req.params.id
      )

      if (!jobTypeDeletedResult)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'No record exists with the provided id'
        )

      let response = {
        status_code: 1,
        message: 'Job Type successfully deleted',
        result: []
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }
}

module.exports = JobTypesController
