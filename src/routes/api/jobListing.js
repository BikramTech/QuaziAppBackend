const router = require('express').Router()
const { Authorize } = require('../../middlewares')
const { JobListingController } = require('../../controllers')
const { AddJobListingValidator, UpdateJobListingValidator, GetJobListingByIdValidator, GetJobListingPagedListValidator, DeleteJobListingValidator } = require("../../lib/validators/jobListingValidator");

router.post('/AddJobListing', [Authorize, AddJobListingValidator], JobListingController.addJobListing)
router.get('/GetJobListingById/:id', Authorize, JobListingController.getJobListingById)
router.post('/GetJobListingPagedList/:id', Authorize, JobListingController.getJobListingPagedList)
router.post('/GetActiveJobListingPagedList', Authorize, JobListingController.getActiveJobListingPagedList)
router.post('/getActiveInternshipListingPagedList', Authorize, JobListingController.getActiveInternshipListingPagedList)
router.post('/getActiveWorkshopListingPagedList', Authorize, JobListingController.getActiveWorkshopListingPagedList)
router.post('/getJobsForOpenListing', JobListingController.getJobsForOpenListing)
router.patch('/UpdateJobListing/:id', [Authorize, UpdateJobListingValidator], JobListingController.updateJobListing)
router.delete('/DeleteJobListing/:id', [Authorize, DeleteJobListingValidator], JobListingController.deleteJobListing)
router.post('/SearchJobs', JobListingController.searchJobs);
router.get('/GetJobLocationSuggestions/:keyword', JobListingController.getJobLocationSuggestions);
router.post('/GetRecommendedJobsForUser', [Authorize], JobListingController.getRecommendedJobsForUser);

module.exports = router
