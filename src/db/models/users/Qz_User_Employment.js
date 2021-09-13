const mongoose = require("mongoose");

const QzUserEmploymentSchema = new mongoose.Schema({
    user_id: {
        type: String
    },
    employer: {
        type: String,
        required: [true, 'Employer is required']
    },
    designation: {
        type: String,
        required: [true, 'Designation is required']
    },
    start_date: {
        type: Date
    },
    end_date: {
        type: Date
    }
});

const QzUserEmployment = mongoose.model("Qz_User_Employment", QzUserEmploymentSchema);

module.exports = QzUserEmployment;
