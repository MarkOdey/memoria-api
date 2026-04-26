const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: { type: String },
  birthplace: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Subject', subjectSchema);
