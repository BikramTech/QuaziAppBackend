const mongoose = require("mongoose");

const QzPaymentPlansSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
    },
    type: {
        type: String,
        required: [true, "Type is required"],
    },
    duration: {
        type: String,
    },
    is_active: {
        type: Boolean,
        default: true,
    },
    keyBenefits: {
        type: Array,
    },
});

const QzPaymentPlans = mongoose.model("Qz_Payment_Plans", QzPaymentPlansSchema);

module.exports = QzPaymentPlans;
