const helpers = require('../config/helpers')
const { QzCompanyTypes, QzEmployment, QzCrUserProfile } = require('../db/models')

class CompanyController {
  static async addCompanyType(req, res) {
    try {
      const { name } = req.body

      const companyTypeModel = await new QzCompanyTypes({
        name
      })

      await companyTypeModel.save()

      let response = {
        status_code: 1,
        message: 'Company Type has been added successfully!',
        result: []
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      return helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async getCompanyTypeByCompanyTypeId(req, res) {
    try {
      const companyType = await QzCompanyTypes.findById(req.params.id)

      if (!companyType) {
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'No record with the provided company type id'
        )
      }

      let response = {
        status_code: 1,
        result: companyType
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async getCompanyTypesList(req, res) {
    try {
      const companyTypes = await QzCompanyTypes.find()

      if (!companyTypes.length) {
        return helpers.SendErrorsAsResponse(null, res, 'No records!')
      }

      let response = {
        status_code: 1,
        result: companyTypes
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async getActiveCompanyTypesList(req, res) {
    try {
      const companyTypes = await QzCompanyTypes.find({ is_active: true })

      if (!companyTypes.length) {
        return helpers.SendErrorsAsResponse(null, res, 'No records!')
      }

      let response = {
        status_code: 1,
        result: companyTypes
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async updateCompanyType(req, res) {
    try {
      const { name, is_active } = req.body

      const qzCompanyTypeUpdatedResult = await QzCompanyTypes.findByIdAndUpdate(
        req.params.id,
        {
          name,
          is_active
        },
        { new: true }
      )

      if (!qzCompanyTypeUpdatedResult)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'No record exists with the provided id'
        )

      let response = {
        status_code: 1,
        message: 'Company Type successfully updated',
        result: []
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async deleteCompanyType(req, res) {
    try {
      const companyTypeDeletedResult = await QzCompanyTypes.findByIdAndDelete(
        req.params.id
      )

      if (!companyTypeDeletedResult)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'No record exists with the provided id'
        )

      let response = {
        status_code: 1,
        message: 'Company Type successfully deleted',
        result: []
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async getActiveCompaniesWithJobsCount(req, res) {
    try {
      const companiesResult = await QzCrUserProfile.aggregate([
        { $match: { is_active: true } },
        { $addFields: { "company_id": { $toString: "$user_id" } } },
        {
          $lookup: {
            from: "qz_employments",
            localField: "company_id",
            foreignField: "posted_by",
            as: "posted_jobs"
          }
        },
        {
          $project: {
            "company_id": "$company_id", "company_name": "$company_name", "posted_jobs_count": { "$size": "$posted_jobs" }
          }
        }
      ]);

      if (!companiesResult)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'No record exists with the provided id'
        )

      let response = {
        status_code: 1,
        message: '',
        result: [companiesResult]
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async getActiveJobsByCompanyId(req, res) {
    try {
      const jobsResult = await QzEmployment.aggregate([
        { $match: { posted_by: req.params.id } }
      ]);

      if (!jobsResult)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'No record exists with the provided id'
        )

      let response = {
        status_code: 1,
        message: '',
        result: [jobsResult]
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }
}

module.exports = CompanyController
