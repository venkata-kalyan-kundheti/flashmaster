const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject:   { type: String, required: true },
  topic:     { type: String, default: '' },
  title:     { type: String, required: true },
  fileUrl:   { type: String, required: true },
  fileType:  { type: String, enum: ['pdf', 'image', 'text'], required: true },
  fileSize:  { type: Number },
  // cloudinaryPublicId: { type: String, default: '' }, // Disabled
  // cloudinaryResourceType: { type: String, default: '' }, // Disabled
  summary:   { type: String, default: '' },
  flashcardsGenerated: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Material', MaterialSchema);
