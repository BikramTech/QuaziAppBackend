const mongoose = require("mongoose");

const QzUserTransactionsSchema = new mongoose.Schema({
    plan_id: {
        type: String
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
    },
    user_id: {
        type: String,
    },
    transaction_date: {
        type: Date
    }
});

const QzUserTransactions = mongoose.model("Qz_User_Transactions", QzUserTransactionsSchema);

module.exports = QzUserTransactions;
