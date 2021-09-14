const mongoose = require("mongoose");

const QzUserProjectsSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: [true, "User Id is required"]
    },
    project_title: {
        type: String,
        required: [true, "Project Title is required"]
    },
    client_name: {
        type: String,
        required: [true, "Client Name is required"]
    },
    project_description: {
        type: String,
        required: [true, "Project Description is required"]
    },
    start_date: {
        type: Date
    },
    end_date: {
        type: Date
    }
});

const QzUserProjects = mongoose.model("Qz_User_Projects", QzUserProjectsSchema);

module.exports = QzUserProjects;
