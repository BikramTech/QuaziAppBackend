const helpers = require("../config/helpers");
const config = require("../config/appConfig");
const stripe = require('stripe')(config.stripe.secret_key) 

class PaymentsController {
    static async RenderPaymentsGatewayView(req, res) {
        try {

            const { email, plan_id } = req.body;
            
            const session = await stripe.checkout.sessions.create({
              mode: 'payment',
              customer_email:email,
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
            
            return res.redirect(303, session.url);
        } catch (err) {
            return helpers.SendErrorsAsResponse(err, res);
        }
    }

    static async CheckoutSuccess(req, res) {
        try {
            const { session_id } = req.query;
            let session = await stripe.checkout.sessions.retrieve(session_id);
            session = {...session, amount_total: session.amount_total / 100, amount_subtotal: session.amount_subtotal / 100}
            return res.send(session);
        } catch (err) {
            return helpers.SendErrorsAsResponse(err, res);
        }
    }
    
}

module.exports = PaymentsController;
