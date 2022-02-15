const helpers = require("../config/helpers");
const { QzPaymentPlans } = require("../db/models");
const config = require("../config/appConfig");
const stripe = require('stripe')(config.stripe.secret_key) 


class PaymentPlanController {
    static async addPaymentPlan(req, res) {
        try {

            const paymentPlanModel = await new QzPaymentPlans(req.body);

             

             stripe.products.create({
                name: paymentPlanModel.name,
                active: paymentPlanModel.is_active,
                metadata: req.body
            }).then(async resp => {

                stripe.prices.create({
                    product: resp.id,
                    unit_amount: paymentPlanModel.price * 100,
                    currency: config.stripe.currency,
                    active: true,
                }).then(async plansResp => {
                    
                    paymentPlanModel.plan_id = plansResp.id;

                    await paymentPlanModel.save();

                    let response = {
                        status_code: 1,
                        message: "Payment plan has been added successfully!",
                        result: [],
                    };
        
                    return helpers.SendSuccessResponse(res, response);
                })
                
            })

            
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
