const helpers = require('../config/helpers')
const { QzEmployment, QzUserApplications } = require('../db/models')
const mongoose = require('mongoose')

class JobListingController {
  static async addJobListing (req, res) {
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

  static async getJobListingById (req, res) {
    try {
      const employmentModel = await QzEmployment.aggregate([
        { $match: { _id: req.params.id } },
        {
          $lookup: {
            from: 'qz_job_types',
            localField: 'job_type_id',
            foreignField: '_id',
            as: 'job_type_details'
          }
        },
        {
          $addFields: {
            job_type_name: { $arrayElemAt: ['$job_type_details.name', 0] }
          }
        },
        {
          $project: { job_type_details: 0 }
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

  static async getJobListingPagedList (req, res) {
    try {
      const sortBy = 'creation_date'
      const sortOrder = -1
      let sortObject = '{' + '"' + sortBy + '": ' + sortOrder + '}'
      sortObject = JSON.parse(sortObject)
      const employmentModel = await QzEmployment.aggregate([
        {
          $lookup: {
            from: 'qz_job_types',
            localField: 'job_type_id',
            foreignField: '_id',
            as: 'job_type_details'
          }
        },
        {
          $lookup: {
            from: 'qz_user_applications',
            localField: '_id',
            foreignField: 'job_id',
            as: 'user_application_details'
          }
        },
        {
          $unwind: {
            path: '$user_application_details',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            job_type_name: { $arrayElemAt: ['$job_type_details.name', 0] },
            user_id: { $toString: '$user_application_details.user_id' }
          }
        },
        {
          $lookup: {
            from: 'qz_user_profiles',
            localField: 'user_application_details.user_id',
            foreignField: 'user_id',
            as: 'user_details'
          }
        },
        {
          $unwind: {
            path: '$user_details',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'qz_cr_user_profiles',
            localField: 'user_application_details.posted_by',
            foreignField: 'user_id',
            as: 'posted_user_details'
          }
        },
        {
          $addFields: {
            posted_by_user: {
              $arrayElemAt: ['$posted_user_details.company_name', 0]
            }
          }
        },
        {
          $set: {
            'user_details.applied_on': '$user_application_details.creation_date'
          }
        },
        {
          $unset: [
            'job_type_details',
            'user_details._id',
            'user_details.dob',
            'user_details.countryCode',
            'user_details.education',
            'user_details.experience',
            'user_details.languages',
            'user_details.marital_status',
            'user_details.profile_pic',
            'user_details.profile_summary',
            'user_details.residential_address',
            'user_details.resume_file',
            'user_details.skills',
            'user_details.social_id',
            'user_details.social_type',
            'user_details.updated_at',
            'user_details.description'
          ]
        },
        {
          $group: {
            _id: '$_id',
            job_name: { $first: '$job_name' },
            job_description: { $first: '$job_description' },
            job_location: { $first: '$job_location' },
            job_type_id: { $first: '$job_type_id' },
            company_name: { $first: '$company_name' },
            posted_by: { $first: '$posted_by' },
            creation_date: { $first: '$creation_date' },
            last_update_date: { $first: '$last_update_date' },
            is_active: { $first: '$is_active' },
            job_type_name: { $first: '$job_type_name' },
            users: { $push: '$user_details' },
            posted_by_user: { $first: '$posted_by_user' }
          }
        },
        { $sort: sortObject }
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

  static async getActiveJobListingPagedList (req, res) {
    try {
      const sortBy = 'creation_date'
      const sortOrder = -1
      let sortObject = '{' + '"' + sortBy + '": ' + sortOrder + '}'
      sortObject = JSON.parse(sortObject)
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
        { $match: { $and: [{ is_active: true }, { listing_type: 'job' }] } },
        {
          $lookup: {
            from: 'qz_job_types',
            localField: 'job_type_id',
            foreignField: '_id',
            as: 'job_type_details'
          }
        },
        {
          $addFields: {
            job_type_name: { $arrayElemAt: ['$job_type_details.name', 0] }
          }
        },
        {
          $project: { job_type_details: 0 }
        },
        {
          $lookup: {
            from: 'qz_cr_user_profiles',
            localField: 'user_application_details.posted_by',
            foreignField: 'user_id',
            as: 'posted_user_details'
          }
        },
        {
          $addFields: {
            posted_by_user: {
              $arrayElemAt: ['$posted_user_details.company_name', 0]
            }
          }
        },
        { $sort: sortObject }
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

  static async updateJobListing (req, res) {
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

  static async deleteJobListing (req, res) {
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

  static async getJobsForOpenListing (req, res) {
    try {
      const employmentModel = await QzEmployment.aggregate([
        { $match: { is_active: true } },
        {
          $lookup: {
            from: 'qz_job_types',
            localField: 'job_type_id',
            foreignField: '_id',
            as: 'job_type_details'
          }
        },
        {
          $addFields: {
            job_type_name: { $arrayElemAt: ['$job_type_details.name', 0] }
          }
        },
        {
          $project: { job_type_details: 0 }
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

  static async searchJobs (req, res) {
    try {
      const { location, jobType, keyword } = req.body

      const sortBy = req.body.sortBy || 'creation_date'
      const sortOrder = req.body.sortOrder || -1
      const recordsPerPage = req.body.recordsPerPage || 10
      const pageNumber = req.body.pageNumber || 0

      let sortObject = '{' + '"' + sortBy + '": ' + sortOrder + '}'
      sortObject = JSON.parse(sortObject)
      const recordsToSkip = parseInt(pageNumber) * parseInt(recordsPerPage)

      let query = JobListingController.getSearchJobQuery(
        location,
        jobType,
        keyword
      )

      let searchedJobsCount = await QzEmployment.aggregate([
        {
          $addFields: {
            job_type_objectid: { $toObjectId: '$job_type_id' }
          }
        },
        {
          $lookup: {
            from: 'qz_job_types',
            localField: 'job_type_objectid',
            foreignField: '_id',
            as: 'qz_job_types'
          }
        },
        {
          $addFields: {
            job_type: {
              $arrayElemAt: ['$qz_job_types.name', 0]
            }
          }
        },
        {
          $match: query
        },
        {
          $project: {
            qz_job_types: 0
          }
        },
        {
          $count: 'total_jobs_count'
        }
      ])

      let searchedJobs = await QzEmployment.aggregate([
        {
          $addFields: {
            job_type_objectid: { $toObjectId: '$job_type_id' }
          }
        },
        {
          $lookup: {
            from: 'qz_job_types',
            localField: 'job_type_objectid',
            foreignField: '_id',
            as: 'qz_job_types'
          }
        },
        {
          $addFields: {
            job_type_name: {
              $arrayElemAt: ['$qz_job_types.name', 0]
            }
          }
        },
        {
          $match: query
        },
        {
          $project: {
            qz_job_types: 0
          }
        },
        { $sort: sortObject },
        { $skip: recordsToSkip },
        { $limit: parseInt(recordsPerPage) }
      ])

      let response = {
        status_code: 1,
        result: [
          {
            searchedJobs,
            total_jobs_count: searchedJobsCount[0].total_jobs_count
          }
        ]
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static getSearchJobQuery (location, jobtype, keyword) {
    let query = {}

    if (location || jobtype) {
      query['$and'] = []
    }

    if (location) {
      query['$and'].push({
        job_location: { $regex: location, $options: 'i' }
      })
    }
    if (jobtype) {
      query['$and'].push({
        'qz_job_types.name': { $regex: jobtype, $options: 'i' }
      })
    }
    if (keyword) {
      let orQuery = {}
      orQuery['$or'] = []

      const likeRegex = new RegExp(`^.*${keyword}.*$`, 'is')
      orQuery['$or'].push({ job_name: likeRegex })
      orQuery['$or'].push({ job_description: likeRegex })
      orQuery['$or'].push({ job_location: likeRegex })
      orQuery['$or'].push({ company_name: likeRegex })
      orQuery['$or'].push({ listing_type: likeRegex })

      let andQuery = query['$and']

      if (andQuery) {
        andQuery.push(orQuery)
      } else {
        query = orQuery
      }
    }
    return query
  }

  static async getActiveInternshipListingPagedList (req, res) {
    try {
      const sortBy = 'creation_date'
      const sortOrder = -1
      let sortObject = '{' + '"' + sortBy + '": ' + sortOrder + '}'
      sortObject = JSON.parse(sortObject)
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
        {
          $match: {
            $and: [{ is_active: true }, { listing_type: 'internship' }]
          }
        },
        {
          $lookup: {
            from: 'qz_job_types',
            localField: 'job_type_id',
            foreignField: '_id',
            as: 'job_type_details'
          }
        },
        {
          $addFields: {
            job_type_name: { $arrayElemAt: ['$job_type_details.name', 0] }
          }
        },
        {
          $project: { job_type_details: 0 }
        },
        {
          $lookup: {
            from: 'qz_cr_user_profiles',
            localField: 'user_application_details.posted_by',
            foreignField: 'user_id',
            as: 'posted_user_details'
          }
        },
        {
          $addFields: {
            posted_by_user: {
              $arrayElemAt: ['$posted_user_details.company_name', 0]
            }
          }
        },
        { $sort: sortObject }
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

  static async getActiveWorkshopListingPagedList (req, res) {
    try {
      const sortBy = 'creation_date'
      const sortOrder = -1
      let sortObject = '{' + '"' + sortBy + '": ' + sortOrder + '}'
      sortObject = JSON.parse(sortObject)
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
        {
          $match: { $and: [{ is_active: true }, { listing_type: 'workshop' }] }
        },
        {
          $lookup: {
            from: 'qz_job_types',
            localField: 'job_type_id',
            foreignField: '_id',
            as: 'job_type_details'
          }
        },
        {
          $addFields: {
            job_type_name: { $arrayElemAt: ['$job_type_details.name', 0] }
          }
        },
        {
          $project: { job_type_details: 0 }
        },
        {
          $lookup: {
            from: 'qz_cr_user_profiles',
            localField: 'user_application_details.posted_by',
            foreignField: 'user_id',
            as: 'posted_user_details'
          }
        },
        {
          $addFields: {
            posted_by_user: {
              $arrayElemAt: ['$posted_user_details.company_name', 0]
            }
          }
        },
        { $sort: sortObject }
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
}

module.exports = JobListingController
