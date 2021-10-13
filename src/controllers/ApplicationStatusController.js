const helpers = require('../config/helpers')
const { QzApplicationStatus } = require('../db/models')

class ApplicationStatusController {

    static async getAllApplicationStatus(req, res) {
        try {

            const applicationStatuses = await QzApplicationStatus.find();

            let response = {
                status_code: 1,
                result: [applicationStatuses]
            }

            return helpers.SendSuccessResponse(res, response)
        } catch (err) {
            helpers.SendErrorsAsResponse(err, res)
        }
    }
}

module.exports = ApplicationStatusController
