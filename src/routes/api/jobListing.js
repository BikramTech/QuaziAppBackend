const router = require('express').Router()
const { Authorize } = require('../../middlewares')
const { JobListingController } = require('../../controllers')
const { AddJobListingValidator, UpdateJobListingValidator, GetJobListingByIdValidator, GetJobListingPagedListValidator, DeleteJobListingValidator } = require("../../lib/validators/jobListingValidator");

router.post('/AddJobListing', [Authorize, AddJobListingValidator], JobListingController.addJobListing)
router.get('/GetJobListingById/:id', [Authorize, GetJobListingByIdValidator], JobListingController.getJobListingById)
router.get('/GetJobListingPagedList/:id', [Authorize, GetJobListingPagedListValidator], JobListingController.getJobListingPagedList)
router.get('/GetActiveJobListingPagedList', Authorize, JobListingController.getActiveJobListingPagedList)
router.patch('/UpdateJobListing/:id', [Authorize, UpdateJobListingValidator], JobListingController.updateJobListing)
router.delete('/DeleteJobListing/:id', [Authorize, DeleteJobListingValidator], JobListingController.deleteJobListing)

module.exports = router
