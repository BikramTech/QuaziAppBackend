const mongoose = require('mongoose')

const QzUserProfileSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: [true, "User Id is required"]
  },
  first_name: {
    type: String,
    required: [true, "First Name is required"],
    minlength: 2,
    maxlength: 50
  },
  last_name: {
    type: String,
    required: [true, "Last Name is required"],
    minlength: 2,
    maxlength: 50
  },
  countryCode: {
    type: String,
    required: [true, "Country Code is required"],
    minlength: 2,
    maxlength: 5
  },
  dob: {
    type: Date,
    default: null,
    required: [true, "Date of birth is required"]
  },
  gender: {
    type: String,
    default: null
  },
  residential_address: {
    type: String,
    default: null,
    required: [true, "Residential Address is required"]
  },
  profile_summary: {
    type: String,
    default: null,
    required: [true, "Profile Summary is required"]
  },
  skills: {
    type: Array,
    ref: 'xx_qz_key_skills',
    default: null,
    required: [true, "Skills are required"]
  },
  social_type: {
    type: Number,
    enum: [1, 2, 3]
  },
  marital_status: {
    type: Number,
    enum: [1, 2]
  },
  languages: {
    type: Array,
    default: null
  },
  social_id: {
    type: String,
    default: null
  },
  resume_file: {
    type: String,
    default: null
  },
  education: {
    type: String,
    default: null
  },
  experience: {
    type: String,
    default: null
  },
  project_undertaken: {
    type: String,
    default: null
  },
  role: {
    type: Number,
    default: 1
  },
  status: {
    type: Boolean,
    default: true
  },
  // is_email_verified: {
  //     type: Boolean,
  //     default: false,
  // },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  agreement_terms_conditions: {
    type: Number,
    enum: [1, 2]
  },
  profile_pic: {
    type: String,
    required: [true, "Profile Pic is required"]
  }
})

const QzUserProfile = mongoose.model('Qz_User_Profile', QzUserProfileSchema)

module.exports = QzUserProfile
