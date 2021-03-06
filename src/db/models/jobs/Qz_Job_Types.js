const mongoose = require("mongoose")

const QzJobTypesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        enum: ["Full Time", "Part Time"]
    },
    is_active: {
        type: Boolean,
        default: true
    }
});

const QzJobTypes = mongoose.model("Qz_Job_Types", QzJobTypesSchema);
module.exports = QzJobTypes;