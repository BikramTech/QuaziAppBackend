var router = require('express').Router();
const { Authorize } = require('../../middlewares');
const { ApplicationStatusController } = require("../../controllers")

router.get('/GetApplicationStatus', [Authorize], ApplicationStatusController.getAllApplicationStatus);

module.exports = router
