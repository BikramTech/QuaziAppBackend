const helpers = require('../config/helpers');
const { QzTermsConditions } = require("../db/models");
const mongoose = require('mongoose')

class TermsConditionsController {

    static async addTermsAndConditions(req, res) {
        try {
            const { description } = req.body;

            if (!description)
                return helpers.SendErrorsAsResponse(
                    null,
                    res,
                    'Please provide description for new terms and conditions'
                )

            const termsConditionsModel = new QzTermsConditions({ description });
            await termsConditionsModel.validate();

            await QzTermsConditions.deleteMany({});
            await termsConditionsModel.save();

            let response = {
                status_code: 1,
                message: 'Terms and Conditions succesfully updated',
                result: []
            }

            return helpers.SendSuccessResponse(res, response)
        } catch (err) {
            helpers.SendErrorsAsResponse(err, res)
        }
    }

    static async getTermsAndConditions(req, res) {

        try {
            const termsConditionsResult = await QzTermsConditions.aggregate([{ $skip: 0 }]);

            if (!termsConditionsResult || !termsConditionsResult.length) {

                let response = {
                    status_code: 1,
                    message: 'No terms and conditions exists',
                    result: []
                }

                return helpers.SendSuccessResponse(
                    res,
                    response
                )
            }


            let response = {
                status_code: 1,
                result: [termsConditionsResult[0].description]
            }

            return helpers.SendSuccessResponse(res, response)
        } catch (err) {
            helpers.SendErrorsAsResponse(err, res)
        }
    }
}

module.exports = TermsConditionsController;