const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { appConfig } = require("../../config")

const QzUserSkillsSchema = new mongoose.Schema({
    _id: {
        type: Number
    },
    name: {
        type: String,
        required: true
    }
});

QzUserSkillsSchema.methods.generateAuthToken = () => {
    const token = jwt.sign({ _id: this._id }, appConfig.auth.jwt_secret);
    return token;
};

const QzUserSkills = mongoose.model("Qz_Key_Skills", QzUserSkillsSchema);

module.exports = QzUserSkills;
