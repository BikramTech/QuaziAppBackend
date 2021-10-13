var router = require('express').Router();
const { Authorize } = require('../../middlewares')
const { PaymentPlanController } = require("../../controllers")

router.post('/AddPaymentPlan', [Authorize], PaymentPlanController.addPaymentPlan)
router.get('/GetPaymentPlans', PaymentPlanController.getPaymentPlans)

module.exports = router
