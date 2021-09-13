const mongoose = require("mongoose");

const QzSkillsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

const QzSkills = mongoose.model("Qz_Key_Skills", QzSkillsSchema);

module.exports = QzSkills;
