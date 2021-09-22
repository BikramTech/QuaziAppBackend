const helpers = require('../config/helpers')
const { QzEmployment, QzUserApplications } = require('../db/models')
const mongoose = require('mongoose')

class JobListingController {
  static async addJobListing(req, res) {
    try {
      const {
        job_name,
        job_description,
        job_location,
        job_type_id,
        company_name,
        posted_by,
        listing_type
      } = req.body

      const employmentModel = new QzEmployment({
        job_name,
        job_description,
        job_location,
        job_type_id,
        company_name,
        posted_by,
        is_active: true,
        listing_type
      })

      await employmentModel.save()

      let response = {
        status_code: 1,
        message: 'Employment details succesfully added',
        result: []
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async getJobListingById(req, res) {
    try {
      const employmentModel = await QzEmployment.aggregate([
        { "$match": { "_id": req.params.id } },
        {
          $lookup: {
            from: "qz_job_types",
            localField: "job_type_id",
            foreignField: "_id",
            as: "job_type_details"
          },

        },
        {
          $addFields: {
            "job_type_name": { $arrayElemAt: ["$job_type_details.name", 0] }
          }
        },
        {
          $project: { "job_type_details": 0 }
        }
      ])

      if (!employmentModel.length) {
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'No record with the provided job type id'
        )
      }

      let response = {
        status_code: 1,
        result: employmentModel
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async getJobListingPagedList(req, res) {
    try {
      const employmentModel = await QzEmployment.aggregate([
        { "$match": { "posted_by": req.params.id } },
        {
          $lookup: {
            from: "qz_job_types",
            localField: "job_type_id",
            foreignField: "_id",
            as: "job_type_details"
          }
        },
        {
          $lookup: {
            from: "qz_user_applications",
            localField: "_id",
            foreignField: "job_id",
            as: "user_application_details"
          }
        },
        {
          $unwind: {
            path: "$user_application_details",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            "job_type_name": { $arrayElemAt: ["$job_type_details.name", 0] },
            "user_id": { $toString: "$user_application_details.user_id" }
          }
        },
        {
          $lookup: {
            from: "qz_user_profiles",
            localField: "user_application_details.user_id",
            foreignField: "user_id",
            as: "user_details"
          }
        },
        {
          $unwind: {
            path: "$user_details",
            preserveNullAndEmptyArrays: true
          }
        },
        { $set: { "user_details.applied_on": "$user_application_details.creation_date" } },
        { $unset: ["job_type_details", "user_details._id", "user_details.dob", "user_details.countryCode", "user_details.education", "user_details.experience", "user_details.languages", "user_details.marital_status", "user_details.profile_pic", "user_details.profile_summary", "user_details.residential_address", "user_details.resume_file", "user_details.skills", "user_details.social_id", "user_details.social_type", "user_details.updated_at", "user_details.description"] },
        {
          $group: {
            _id: "$_id",
            "job_name": { "$first": "$job_name" },
            "job_description": { "$first": "$job_description" },
            "job_location": { "$first": "$job_location" },
            "job_type_id": { "$first": "$job_type_id" },
            "company_name": { "$first": "$company_name" },
            "posted_by": { "$first": "$posted_by" },
            "creation_date": { "$first": "$creation_date" },
            "last_update_date": { "$first": "$last_update_date" },
            "is_active": { "$first": "$is_active" },
            "job_type_name": { "$first": "$job_type_name" },
            "users": { "$push": "$user_details" }
          }
        }
      ])

      if (!employmentModel.length) {
        return helpers.SendErrorsAsResponse(null, res, 'No records!')
      }

      let response = {
        status_code: 1,
        result: employmentModel
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async getActiveJobListingPagedList(req, res) {
    try {
      let userApplication = await QzUserApplications.aggregate([
        {
          $match: {
            user_id: req.user.userId
          }
        },
        {
          $group: {
            _id: null,
            applied_job_ids: {
              $push: '$job_id'
            }
          }
        }
      ])

      let applied_job_ids = []
      const doesUserHaveSomeAlreadyAppliedJobs =
        userApplication[0] &&
        userApplication[0].applied_job_ids &&
        userApplication[0].applied_job_ids.length

      if (doesUserHaveSomeAlreadyAppliedJobs) {
        applied_job_ids = userApplication[0].applied_job_ids.map(x =>
          x.toString()
        )
        applied_job_ids = [...new Set(applied_job_ids)]
      }

      let employmentModel = await QzEmployment.aggregate([
        { "$match": { "is_active": true } },
        {
          $lookup: {
            from: "qz_job_types",
            localField: "job_type_id",
            foreignField: "_id",
            as: "job_type_details"
          },

        },
        {
          $addFields: {
            "job_type_name": { $arrayElemAt: ["$job_type_details.name", 0] }
          }
        },
        {
          $project: { "job_type_details": 0 }
        }
      ])

      if (doesUserHaveSomeAlreadyAppliedJobs) {
        employmentModel = employmentModel.map(x => {
          const isAlreadyAppliedJob = applied_job_ids.includes(x._id.toString())
          x.is_already_applied = isAlreadyAppliedJob
          return x
        })
      }

      if (!employmentModel.length) {
        return helpers.SendErrorsAsResponse(null, res, 'No records!')
      }

      let response = {
        status_code: 1,
        result: employmentModel
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async updateJobListing(req, res) {
    try {
      const {
        job_name,
        job_description,
        job_location,
        job_type_id,
        company_name,
        is_active
      } = req.body
      const last_update_date = new Date().toISOString()

      const qzEmploymentUpdatedResult = await QzEmployment.findByIdAndUpdate(
        req.params.id,
        {
          job_name,
          job_description,
          job_location,
          job_type_id,
          company_name,
          last_update_date,
          is_active
        },
        { new: true }
      )

      if (!qzEmploymentUpdatedResult)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'No record exists with the provided id'
        )

      let response = {
        status_code: 1,
        message: 'Employment details successfully updated',
        result: []
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async deleteJobListing(req, res) {
    try {
      const employmentDeletedResult = await QzEmployment.findByIdAndDelete(
        req.params.id
      )

      if (!employmentDeletedResult)
        return helpers.SendErrorsAsResponse(
          null,
          res,
          'No record exists with the provided id'
        )

      let response = {
        status_code: 1,
        message: 'Employment details successfully deleted',
        result: []
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async getJobsForOpenListing(req, res) {
    try {
      const employmentModel = await QzEmployment.aggregate([
        { "$match": { "is_active": true } },
        {
          $lookup: {
            from: "qz_job_types",
            localField: "job_type_id",
            foreignField: "_id",
            as: "job_type_details"
          },

        },
        {
          $addFields: {
            "job_type_name": { $arrayElemAt: ["$job_type_details.name", 0] }
          }
        },
        {
          $project: { "job_type_details": 0 }
        },
        {
          $limit: 10
        }
      ])

      if (!employmentModel.length) {
        return helpers.SendErrorsAsResponse(null, res, 'No records!')
      }

      let response = {
        status_code: 1,
        result: employmentModel
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }
}

module.exports = JobListingController
