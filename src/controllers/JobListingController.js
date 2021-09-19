const helpers = require('../config/helpers')
const { QzEmployment, QzUserApplications } = require('../db/models')
const mongoose = require("mongoose");

class JobListingController {
  static async addJobListing(req, res) {
    try {
      const {
        job_name,
        job_description,
        job_location,
        job_type_id,
        company_name,
        posted_by
      } = req.body

      const employmentModel = new QzEmployment({
        job_name,
        job_description,
        job_location,
        job_type_id,
        company_name,
        posted_by
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
      const employmentModel = await QzEmployment.find({
        _id: req.params.id
      })

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
      const employmentModel = await QzEmployment.find({
        posted_by: req.params.id
      })

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
      const employmentModel = await QzEmployment.find({ is_active: true })

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
      let userApplication = await QzUserApplications.aggregate(
        [
          {
            "$match": {
              "user_id": req?.user.userId
            }
          },
          {
            "$group": {
              "_id": null,
              "applied_job_ids": {
                "$push": "$job_id"
              }
            }
          },
          { "$limit": 10 }
        ]
      );

      let applied_job_ids = [];
      const doesUserHaveSomeAlreadyAppliedJobs = userApplication[0] && userApplication[0].applied_job_ids && userApplication[0].applied_job_ids.length;

      if (doesUserHaveSomeAlreadyAppliedJobs) {
        applied_job_ids = userApplication[0].applied_job_ids.map(x => x.toString());
        applied_job_ids = [...new Set(applied_job_ids)];
      }


      let employmentModel = await QzEmployment.aggregate([
        { "$match": { "is_active": true } }
      ])

      if (doesUserHaveSomeAlreadyAppliedJobs) {
        employmentModel = employmentModel.map(x => {
          const isAlreadyAppliedJob = applied_job_ids.includes(x._id.toString());
          x.is_already_applied = isAlreadyAppliedJob;
          return x;
        });
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
