const mongoose = require('mongoose');

const TOPICS = ['childhood', 'family', 'education', 'career', 'relationships', 'beliefs', 'achievements', 'challenges', 'legacy'];

const questionSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  text: { type: String, required: true },
  topic: { type: String, enum: TOPICS, required: true },
  status: { type: String, enum: ['pending', 'answered'], default: 'pending' },
  generatedFrom: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Question', questionSchema);
