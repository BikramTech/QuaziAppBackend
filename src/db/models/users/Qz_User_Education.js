const mongoose = require("mongoose");

const QzUserEducationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    field_of_study: {
        type: String,
        required: [true, "Field of study is required"]
    },
    institute_name: {
        type: String,
        required: [true, "Institute name is required"]
    },
    country: {
        type: String,
        required: [true, "Country is required"]
    },
    user_id: {
        type: mongoose.Types.ObjectId,
        required: [true, "User Id is required"]
    }
});

const QzUserEducation = mongoose.model("qz_user_education", QzUserEducationSchema);
module.exports = QzUserEducation;