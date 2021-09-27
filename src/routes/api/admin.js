var router = require('express').Router();
const { Authorize } = require('../../middlewares');
const { TermsConditionsController } = require("../../controllers")

router.post('/AddTermsConditions', Authorize, TermsConditionsController.addTermsAndConditions)
router.get('/GetTermsConditions', TermsConditionsController.getTermsAndConditions)

module.exports = router
