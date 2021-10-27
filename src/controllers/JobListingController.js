const helpers = require('../config/helpers')
const { QzEmployment, QzUserApplications, QzUserProfile } = require('../db/models')
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
        listing_type,
        skills
      } = req.body

      const employmentModel = new QzEmployment({
        job_name,
        job_description,
        job_location,
        job_type_id,
        company_name,
        posted_by,
        is_active: true,
        listing_type,
        skills
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
        { $match: { _id: mongoose.Types.ObjectId(req.params.id) } },
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
        { $addFields: { posted_by_id: { $toObjectId: '$posted_by' } } },
        {
          $lookup: {
            from: 'qz_cr_user_profiles',
            localField: 'posted_by_id',
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
          $unset: ['posted_user_details', 'posted_by_id']
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
            skills: { $first: '$skills' },
            job_type_name: { $first: '$job_type_name' },
            users: { $push: '$user_details' }
          }
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
      const { location, jobType, keyword } = req.body

      const sortBy = req.body.sortBy || 'creation_date'
      const sortOrder = req.body.sortOrder || -1
      const recordsPerPage = req.body.recordsPerPage || 10
      const pageNumber = req.body.pageNumber || 0

      let sortObject = '{' + '"' + sortBy + '": ' + sortOrder + '}'
      sortObject = JSON.parse(sortObject)
      const recordsToSkip = parseInt(pageNumber) * parseInt(recordsPerPage)

      const query = JobListingController.getSearchJobQuery(
        location,
        jobType,
        keyword
      )

      const jobDetails = await QzEmployment.aggregate([
        { $match: { posted_by: req.params.id } },
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
            skills: { $first: '$skills' },
            job_type_name: { $first: '$job_type_name' },
            users: { $push: '$user_details' },
            posted_by_user: { $first: '$posted_by_user' },
            listing_type: { $first: '$listing_type' }
          }
        },
        {
          $match: query
        },
        { $sort: sortObject },
        { $skip: recordsToSkip },
        { $limit: parseInt(recordsPerPage) }
      ])

      let searchedJobsCount = await QzEmployment.aggregate([
        { $match: { posted_by: req.params.id } },
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

      if (!jobDetails.length) {
        let noDataResponse = {
          status_code: 2,
          result: [
            {
              jobDetails: [],
              total_jobs_count: 0
            }
          ],
          message: 'No Records found!'
        }
        return helpers.SendSuccessResponse(res, noDataResponse)
      }

      let response = {
        status_code: 1,
        result: [
          {
            jobDetails,
            total_jobs_count: searchedJobsCount[0].total_jobs_count
          }
        ]
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async getActiveJobListingPagedList(req, res) {
    try {
      const { location, jobType, keyword } = req.body
      const sortBy = req.body.sortBy || 'creation_date'
      const sortOrder = req.body.sortOrder || -1
      const recordsPerPage = req.body.recordsPerPage || 10
      const pageNumber = req.body.pageNumber || 0

      let sortObject = '{' + '"' + sortBy + '": ' + sortOrder + '}'
      sortObject = JSON.parse(sortObject)
      const recordsToSkip = parseInt(pageNumber) * parseInt(recordsPerPage)

      const query = JobListingController.getSearchJobQuery(
        location,
        jobType,
        keyword
      )
      if (!query['$and']) query['$and'] = []
      query['$and'].push({ is_active: true })
      // query['$and'].push({ listing_type: 'job' });
      // const locationRegex = new RegExp(`^.*${location}.*$`, 'is')
      // const jobTypeRegex = new RegExp(`^.*${jobType}.*$`, 'is')
      // query['$or'].push({ job_location: locationRegex })
      // query['$or'].push({ job_type_name: jobTypeRegex })

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

      let jobDetails = await QzEmployment.aggregate([
        { $match: query },
        { $addFields: { jobTypeId: { $toObjectId: '$job_type_id' } } },
        {
          $lookup: {
            from: 'qz_job_types',
            localField: 'jobTypeId',
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
        { $addFields: { posted_by_id: { $toObjectId: '$posted_by' } } },
        {
          $lookup: {
            from: 'qz_cr_user_profiles',
            localField: 'posted_by_id',
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
        { $sort: sortObject },
        { $skip: recordsToSkip },
        { $limit: parseInt(recordsPerPage) }
      ])

      if (doesUserHaveSomeAlreadyAppliedJobs) {
        jobDetails = jobDetails.map(x => {
          const isAlreadyAppliedJob = applied_job_ids.includes(x._id.toString())
          x.is_already_applied = isAlreadyAppliedJob
          return x
        })
      }

      if (!jobDetails.length) {
        let noDataResponse = {
          status_code: 2,
          result: [
            {
              jobDetails: [],
              total_jobs_count: 0
            }
          ],
          message: 'No Records found!'
        }
        return helpers.SendSuccessResponse(res, noDataResponse)
      }

      let response = {
        status_code: 1,
        result: [
          {
            jobDetails,
            total_jobs_count: searchedJobsCount[0].total_jobs_count
          }
        ]
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
        is_active,
        skills
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
          is_active,
          skills
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
      const sortBy = req.body.sortBy || 'creation_date'
      const sortOrder = req.body.sortOrder || -1
      const recordsPerPage = req.body.recordsPerPage || 10
      const pageNumber = req.body.pageNumber || 0

      let sortObject = '{' + '"' + sortBy + '": ' + sortOrder + '}'
      sortObject = JSON.parse(sortObject)
      const recordsToSkip = parseInt(pageNumber) * parseInt(recordsPerPage)

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
        { $sort: sortObject },
        { $skip: recordsToSkip },
        { $limit: parseInt(recordsPerPage) }
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

  static async searchJobs(req, res) {
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
      if (!query['$and']) query['$and'] = []
      query['$and'].push({ is_active: true })

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
        }
      ])

      if (!searchedJobsCount.length) {
        return helpers.SendErrorsAsResponse(null, res, 'No records')
      }

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
        { $addFields: { posted_by_id: { $toObjectId: '$posted_by' } } },
        {
          $lookup: {
            from: 'qz_cr_user_profiles',
            localField: 'posted_by_id',
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
          $unset: ['posted_user_details', 'posted_by_id']
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
            total_jobs_count: searchedJobsCount.length
          }
        ]
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static keywordBasedJobSearchQuery(keyword) {
    let orQuery = {}
    orQuery['$or'] = []
    if (keyword) {
      const likeRegex = new RegExp(`^.*${keyword}.*$`, 'is')
      orQuery['$or'].push({ job_name: likeRegex })
      orQuery['$or'].push({ job_description: likeRegex })
      orQuery['$or'].push({ job_location: likeRegex })
      orQuery['$or'].push({ company_name: likeRegex })
      orQuery['$or'].push({ listing_type: likeRegex })
      orQuery['$or'].push({ job_type_name: likeRegex })
    }
    return orQuery
  }

  static getSearchJobQuery(location, jobtype, keyword) {
    let query = {}

    if (location || jobtype) {
      query['$and'] = []
    }

    if (location) {
      query['$and'].push({
        job_location: { $regex: location, $options: 'i' }
      })
    }
    // if (jobtype) {
    //   query['$and'].push({
    //     'qz_job_types.name': { $regex: jobtype, $options: 'i' }
    //   })
    // }
    if (jobtype) {
      query['$and'].push({
        job_type_id: { $regex: jobtype, $options: 'i' }
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

  static async getActiveInternshipListingPagedList(req, res) {
    try {
      const { location, job_type, keyword } = req.body
      const sortBy = req.body.sortBy || 'creation_date'
      const sortOrder = req.body.sortOrder || -1
      const recordsPerPage = req.body.recordsPerPage || 10
      const pageNumber = req.body.pageNumber || 0

      let sortObject = '{' + '"' + sortBy + '": ' + sortOrder + '}'
      sortObject = JSON.parse(sortObject)
      const recordsToSkip = parseInt(pageNumber) * parseInt(recordsPerPage)

      const query = JobListingController.keywordBasedJobSearchQuery(keyword)
      query['$and'] = []
      query['$and'].push({ is_active: true })
      query['$and'].push({ listing_type: 'internship' })
      const locationRegex = new RegExp(`^.*${location}.*$`, 'is')
      const jobTypeRegex = new RegExp(`^.*${job_type}.*$`, 'is')
      query['$or'].push({ job_location: locationRegex })
      query['$or'].push({ job_type_name: jobTypeRegex })

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
        { $match: query },
        { $addFields: { jobTypeId: { $toObjectId: '$job_type_id' } } },
        {
          $lookup: {
            from: 'qz_job_types',
            localField: 'jobTypeId',
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
        { $addFields: { posted_by_id: { $toObjectId: '$posted_by' } } },
        {
          $lookup: {
            from: 'qz_cr_user_profiles',
            localField: 'posted_by_id',
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
        { $sort: sortObject },
        { $skip: recordsToSkip },
        { $limit: parseInt(recordsPerPage) }
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

  static async getActiveWorkshopListingPagedList(req, res) {
    try {
      const { location, job_type, keyword } = req.body
      const sortBy = req.body.sortBy || 'creation_date'
      const sortOrder = req.body.sortOrder || -1
      const recordsPerPage = req.body.recordsPerPage || 10
      const pageNumber = req.body.pageNumber || 0

      let sortObject = '{' + '"' + sortBy + '": ' + sortOrder + '}'
      sortObject = JSON.parse(sortObject)
      const recordsToSkip = parseInt(pageNumber) * parseInt(recordsPerPage)

      const query = JobListingController.keywordBasedJobSearchQuery(keyword)
      query['$and'] = []
      query['$and'].push({ is_active: true })
      query['$and'].push({ listing_type: 'workshop' })
      const locationRegex = new RegExp(`^.*${location}.*$`, 'is')
      const jobTypeRegex = new RegExp(`^.*${job_type}.*$`, 'is')
      query['$or'].push({ job_location: locationRegex })
      query['$or'].push({ job_type_name: jobTypeRegex })

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
        { $match: query },
        { $addFields: { jobTypeId: { $toObjectId: '$job_type_id' } } },
        {
          $lookup: {
            from: 'qz_job_types',
            localField: 'jobTypeId',
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
        { $addFields: { posted_by_id: { $toObjectId: '$posted_by' } } },
        {
          $lookup: {
            from: 'qz_cr_user_profiles',
            localField: 'posted_by_id',
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
        { $sort: sortObject },
        { $skip: recordsToSkip },
        { $limit: parseInt(recordsPerPage) }
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

  static async getJobLocationSuggestions(req, res) {
    try {
      const { keyword } = req.params

      if (!keyword) {
        let response = {
          status_code: 1,
          result: []
        }

        return helpers.SendSuccessResponse(res, response)
      }

      const searchLocationRegex = new RegExp(`^.*${keyword}.*$`, 'is')

      const locationSuggestionsResult = await QzEmployment.aggregate([
        {
          $match: { $or: [{ job_location: searchLocationRegex }] }
        },
        {
          $group: {
            _id: null,
            job_locations: { $addToSet: { $toUpper: '$job_location' } }
          }
        }
      ])

      if (!locationSuggestionsResult || !locationSuggestionsResult.length) {
        let response = {
          status_code: 1,
          result: []
        }

        return helpers.SendSuccessResponse(res, response)
      }

      let response = {
        status_code: 1,
        result: locationSuggestionsResult[0].job_locations
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }

  static async getRecommendedJobsForUser(req, res) {
    try {
      const sortBy = req.body.sortBy || 'created_at'
      const sortOrder = req.body.sortOrder || -1
      const recordsPerPage = req.body.recordsPerPage || 10
      const pageNumber = req.body.pageNumber || 0

      let sortObject = '{' + '"' + sortBy + '": ' + sortOrder + '}'
      sortObject = JSON.parse(sortObject)
      const recordsToSkip = parseInt(pageNumber) * parseInt(recordsPerPage)

      const { userId } = req.user;
      const { location, jobType, keyword } = req.body;

      let query = JobListingController.getSearchJobQuery(
        location,
        jobType,
        keyword
      )
      if (!query['$and']) query['$and'] = []
      query['$and'].push({ is_active: true });

      let userProfileResult = await QzUserProfile.aggregate([
        {
          $match: {
            "user_id": userId
          }
        }
      ]);



      if (!userProfileResult || !userProfileResult.length) {
        let response = {
          status_code: 1,
          result: []
        }

        return helpers.SendSuccessResponse(res, response)
      }

      const userSkillsRegex = userProfileResult[0].skills.join(",").split(".").join(",").split(",").map(skill => {
        return new RegExp(`^.*${skill}.*$`, 'is');
      });


      let relevant_skills_jobs = await QzEmployment.aggregate([
        {
          "$match": {
            "$or": [{ "skills": { $in: userSkillsRegex } }, { "job_description": { $in: userSkillsRegex } }]
          }
        },
        { "$match": query },
        { $sort: sortObject },
        { $skip: recordsToSkip },
        { $limit: parseInt(recordsPerPage) }
      ])

      let total_jobs_count = await QzEmployment.aggregate([
        { "$match": { "$or": [{ "skills": { $in: userSkillsRegex } }, { "job_description": { $in: userSkillsRegex } },] } },
        { "$match": query },
        {
          $count: 'total_jobs_count'
        }
      ]);

      total_jobs_count = total_jobs_count[0]?.total_jobs_count;

      if (total_jobs_count > 0) {
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

          relevant_skills_jobs = relevant_skills_jobs.map(x => {
            const isAlreadyAppliedJob = applied_job_ids.includes(x._id.toString())
            x.is_already_applied = isAlreadyAppliedJob
            return x
          })
        }

      }

      let response = {
        status_code: 1,
        result: { relevant_skills_jobs, total_jobs_count }
      }

      return helpers.SendSuccessResponse(res, response)
    } catch (err) {
      helpers.SendErrorsAsResponse(err, res)
    }
  }
}

module.exports = JobListingController
