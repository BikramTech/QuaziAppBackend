var FCM = require('fcm-node');
var serverKey = require("../../../quazinotificationserver.private_key.json");
var fcm = new FCM(serverKey);

class FcmNotificationService {
    static sendNotificationToDevice (device_token, data, notificationTitle, notificationBody) {
        var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
            to: device_token,
            
            notification: {
                title: notificationTitle, 
                body: notificationBody
            },
            
            data
        };
        
        fcm.send(message, function(err, response){
            if (err) {
                console.log("Something has gone wrong!");
            } else {
                console.log("Successfully sent with response: ", response);
            }
        });
    }
}

module.exports = FcmNotificationService