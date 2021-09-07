const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { appConfig } = require("../../config")

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  last_name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  user_name: {
    type: String,
    maxlength: 50,
    default:null
  },
  countryCode: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 5,
  },
  mobile_no: {
    type: Number,
    unique: true,
    required: true,
    minlength: 5,
    maxlength: 15,
  },
  password: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  dob: {
    type: Date,
    default: null,
  },
  gender: {
    type: String,
    default: null,
  },
  image: {
    type: String,
    default: null,
  },
  address: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    default: null,
  },
  summary: {
    type: String,
    default: null,
  },
  skill_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "xx_qz_key_skills",
    default: null,
  },
  description: {
    type: String,
    default: null,
  },
  social_type: {
    type: Number,
    enum: [1,2,3],
  },
  maritial_staus: {
    type: Number,
    enum: [1,2],
  },
  languages: {
    type: String,
    default: null,
  },
  social_id: {
    type: String,
    default: null,
  },
  resume: {
    type: String,
    default: null,
  },
  education: {
    type: String,
    default: null,
  },
  experince: {
    type: String,
    default: null,
  },
  project_undertaken: {
    type: String,
    default: null,
  },
  otp: {
    type: String,
    default: null,
    maxlength:6,
    minlength:6
  },
  role: {
    type: Number,
    default: 1,
  },
  status: {
    type: Number,
    default: 1,
    enum: [1,2],
  },
  is_email_verified: {
    type: Number,
    default: 0,
    enum: [0, 1],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});
userSchema.methods.generateAuthToken = () => {
  const token = jwt.sign({ _id: this._id }, appConfig.auth.jwt_secret);
  return token;
};

const xx_qz_user = mongoose.model("xx_qz_user", userSchema);

module.exports = xx_qz_user;
