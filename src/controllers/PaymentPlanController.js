const helpers = require("../config/helpers");
const { QzPaymentPlans } = require("../db/models");

class PaymentPlanController {
    static async addPaymentPlan(req, res) {
        try {

            const paymentPlanModel = await new QzPaymentPlans(req.body);

            await paymentPlanModel.save();

            let response = {
                status_code: 1,
                message: "Payment plan has been added successfully!",
                result: [],
            };

            return helpers.SendSuccessResponse(res, response);
        } catch (err) {
            return helpers.SendErrorsAsResponse(err, res);
        }
    }

    static async getPaymentPlans(req, res) {
        try {
            const paymentPlans = await QzPaymentPlans.find();

            if (!paymentPlans.length) {
                return helpers.SendErrorsAsResponse(null, res, "No records!");
            }

            let response = {
                status_code: 1,
                result: paymentPlans,
            };

            return helpers.SendSuccessResponse(res, response);
        } catch (err) {
            helpers.SendErrorsAsResponse(err, res);
        }
    }
}

module.exports = PaymentPlanController;
