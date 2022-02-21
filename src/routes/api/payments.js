var router = require('express').Router();
const { Authorize } = require('../../middlewares')
const { PaymentsController } = require("../../controllers")

router.get('/quazi-payment', PaymentsController.RenderPaymentsGatewayView)
router.get('/quazi-payment-success', [Authorize], PaymentsController.CheckoutSuccess)

module.exports = router