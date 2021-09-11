const mongoose = require("mongoose");

const QzUserSkillsSchema = new mongoose.Schema({
    _id: {
        type: Number
    },
    name: {
        type: String,
        required: true
    }
});

const QzUserSkills = mongoose.model("Qz_Key_Skills", QzUserSkillsSchema);

module.exports = QzUserSkills;
