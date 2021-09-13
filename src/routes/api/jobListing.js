const router = require('express').Router()
const { Authorize } = require('../../middlewares');
const { JobListingController } = require('../../controllers');

router.post('/AddJobListing', Authorize, JobListingController.addJobListing)
router.get('/GetJobListingById/:id', Authorize, JobListingController.getJobListingById)
router.get('/GetJobListingPagedList', Authorize, JobListingController.getJobListingPagedList)
router.get('/GetActiveJobListingPagedList', Authorize, JobListingController.getActiveJobListingPagedList)
router.post('/UpdateJobListing/:id', Authorize, JobListingController.updateJobListing)
router.delete('/DeleteJobListing/:id', Authorize, JobListingController.deleteJobListing)

module.exports = router
