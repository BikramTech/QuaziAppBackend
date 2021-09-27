var router = require('express').Router()
const { Authorize } = require('../../middlewares')
const { JobTypesController } = require('../../controllers')

const { AddJobTypeValidator, UpdateJobTypeValidator, GetJobTypeByJobTypeIdValidator, DeleteJobTypeValidator } = require("../../lib/validators/jobTypeValidator");

router.post('/AddJobType', [Authorize, AddJobTypeValidator], JobTypesController.addJobType)
router.get('/GetJobTypeByJobTypeId/:id', [Authorize, GetJobTypeByJobTypeIdValidator], JobTypesController.getJobTypeByJobTypeId)
router.get('/GetJobType', JobTypesController.getJobType)
router.post('/UpdateJobType/:id', [Authorize, UpdateJobTypeValidator], JobTypesController.updateJobType)
router.delete('/DeleteJobType/:id', [Authorize, DeleteJobTypeValidator], JobTypesController.deleteJobType)

module.exports = router
