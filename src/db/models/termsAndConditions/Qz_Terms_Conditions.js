const mongoose = require("mongoose");

const QzTermsConditionsSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, "Description is required"]
    }
});

const QzTermsConditions = mongoose.model("qz_terms_conditions", QzTermsConditionsSchema);
module.exports = QzTermsConditions;