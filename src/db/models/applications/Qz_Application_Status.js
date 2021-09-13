const mongoose = require("mongoose");

const QzApplicationStatusSchema = new mongoose.Schema({
    status_name: {
        type: String,
        required: [true, "Status Name is required"]
    },
    is_active: {
        type: Boolean,
        default: true
    }
});

const QzApplicationStatus = mongoose.model("Qz_Application_Status", QzApplicationStatusSchema);

module.exports = QzApplicationStatus;
