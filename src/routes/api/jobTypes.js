var router = require('express').Router();
const { Authorize } = require('../../middlewares');
const { JobTypesController } = require('../../controllers');


router.post('/AddJobType', Authorize, JobTypesController.addJobType)
router.get('/GetJobTypeByJobTypeId/:id', Authorize, JobTypesController.getJobTypeByJobTypeId)
router.get('/GetJobType', Authorize, JobTypesController.getJobType)
router.post('/UpdateJobType/:id', Authorize, JobTypesController.updateJobType)
router.delete('/DeleteJobType/:id', Authorize, JobTypesController.deleteJobType)

module.exports = router
