const mongoose = require('mongoose')

const QzEmploymentSchema = new mongoose.Schema({
  job_name: {
    type: String,
    required: [true, 'Job name is required']
  },
  job_description: {
    type: String,
    required: [true, 'Job description is required']
  },
  job_location: {
    type: String,
    required: [true, 'Job location is required']
  },
  job_type_id: {
    type: String,
    required: [true, 'Job type id is required']
  },
  company_name: {
    type: String,
    required: [true, 'Company name is required']
  },
  posted_by: {
    type: String,
    required: [true, 'Posted By is required']
  },
  creation_date: {
    type: Date,
    default: new Date().toISOString()
  },
  last_update_date: {
    type: Date,
    default: new Date().toISOString()
  },
  is_active: {
    type: Boolean,
    default: true
  },
  listing_type: {
    type: String,
    required: [true, 'Listing type is required'],
    enum: ['job', 'internship', 'workshop']
  }
})

const QzEmployment = mongoose.model('Qz_Employment', QzEmploymentSchema)
module.exports = QzEmployment
