const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalFlashcards: { type: Number, default: 0 },
  reviewedCards:   { type: Number, default: 0 },
  completedTopics: { type: Number, default: 0 },
  pendingTopics:   { type: Number, default: 0 },
  easyCount:       { type: Number, default: 0 },
  mediumCount:     { type: Number, default: 0 },
  hardCount:       { type: Number, default: 0 },
  revisionStatus:  { type: String, enum: ['Not Started', 'In Progress', 'Completed'], default: 'Not Started' },
  quizScores:      [{ subject: String, score: Number, total: Number, date: Date }],
  studyMinutes:    { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Progress', ProgressSchema);
