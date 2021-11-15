const { appConfig } = require('../../config')
const { account_sid, account_auth_token, message_service_id } = appConfig.twilio;
const twilioClient = require('twilio')(account_sid, account_auth_token);

class SmsService {

    static async SendSms(recieverMobileNumber, messageText) {
        return twilioClient.messages
            .create({
                body: messageText,
                messagingServiceSid: message_service_id,
                to: recieverMobileNumber
            })
    }

}

module.exports = SmsService;