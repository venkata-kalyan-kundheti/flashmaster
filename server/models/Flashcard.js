const mongoose = require('mongoose');

const FlashcardSchema = new mongoose.Schema({
  materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject:    { type: String, required: true },
  topic:      { type: String, default: '' },
  question:   { type: String, required: true },
  answer:     { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  markedForRevision: { type: Boolean, default: false },
  isReviewed: { type: Boolean, default: false },
  reviewCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Flashcard', FlashcardSchema);
