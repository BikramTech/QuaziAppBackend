const mongoose = require("mongoose");

const QzUserApplicationsSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: [true, "User Id is required"]
    },
    job_id: {
        type: String,
        required: [true, "Job Id is required"]
    },
    creation_date: {
        type: Date,
        default: new Date().toISOString()
    },
    last_updated_date: {
        type: Date,
        default: new Date().toISOString()
    },
    status_id: {
        type: String,
        required: [true, "Status Id is required"]
    }
});

const QzUserApplications = mongoose.model("Qz_User_Applications", QzUserApplicationsSchema);

module.exports = QzUserApplications;
