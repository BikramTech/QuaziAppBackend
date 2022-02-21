const helpers = require("../config/helpers");
const config = require("../config/appConfig");
const { QzUserTransactions } = require("../db/models");
const stripe = require('stripe')(config.stripe.secret_key)

class PaymentsController {
    static async RenderPaymentsGatewayView(req, res) {
        try {
            const { email, plan_id } = req.body;
            // const email = 'sunil@gmail.com';
            // const plan_id = "price_1KTYXjA5SY6LLtq2Nn2Fo16e"
            // const user_id = "613edfffe6d0428eb0cf9657"
            const session = await stripe.checkout.sessions.create({
                mode: 'payment',
                customer_email: email,
                line_items: [
                    {
                        price: plan_id,
                        quantity: 1
                    },
                ],
                // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
                success_url: `${config.stripe.success_url}?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${config.stripe.cancel_url}`,
                // automatic_tax: {enabled: true},
            });
            res.send(session);
        } catch (err) {
            return helpers.SendErrorsAsResponse(err, res);
        }
    }

    static async CheckoutSuccess(req, res) {
        try {
            const { session_id, user_id, plan_id } = req.body;
            let session = await stripe.checkout.sessions.retrieve(session_id);
            if (session && session.status == 'complete') {
                var transLog = await PaymentsController.addTransactionLog(user_id, plan_id, session.amount_subtotal / 100);
            }
            session = { ...session, amount_total: session.amount_total / 100, amount_subtotal: session.amount_subtotal / 100 }
            return res.send(session);
        } catch (err) {
            return helpers.SendErrorsAsResponse(err, res);
        }
    }

    static async addTransactionLog(user_id, plan_id, price) {
        try {
            const transactions = new QzUserTransactions({
                plan_id: plan_id,
                user_id: user_id,
                price: price,
                transaction_date: new Date()
            })

            await transactions.save()

            let response = {
                status_code: 1,
                message: 'Transaction log has been added successfully',
                result: []
            }

            return response;
        } catch (err) {
            helpers.SendErrorsAsResponse(err, res)
        }
    }

}

module.exports = PaymentsController;
