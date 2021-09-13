const mongoose = require("mongoose");

const QzUserCertificationSchema = new mongoose.Schema({
    user_id: {
        type: String
    },
    certification_name: {
        type: String,
        required: [true, "Certification Name is required"]
    },
    certification_from: {
        type: String,
        required: [true, "Certification From is required"]
    },
    valid_till_date: {
        type: Date
    },
    year_of_completion_date: {
        type: String,
        required: [true, "Year Of Completion is required"]
    }
});

const QzUserCertification = mongoose.model("Qz_User_Certification", QzUserCertificationSchema);

module.exports = QzUserCertification;
