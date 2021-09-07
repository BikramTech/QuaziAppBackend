//const Joi = require("joi");
const mongoose = require("mongoose");

const xx_qz_key_skills = mongoose.model(
  "xx_qz_key_skills",
  new mongoose.Schema({
    skill_name: {
      type: String,
      default: null,
      minlength: 2,
    },
    created: {
      type: Date,
      default: Date.now,
    },
    updated: {
      type: Date,
      default: Date.now,
    },
  })
);

exports.xx_qz_key_skills = xx_qz_key_skills;
