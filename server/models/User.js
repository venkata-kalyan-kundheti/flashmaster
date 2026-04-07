const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true },
  role:      { type: String, enum: ['student', 'admin'], default: 'student' },
  avatar:    { type: String, default: '' },
  isActive:  { type: Boolean, default: true },
  lastLogin: { type: Date },
  streak:    { type: Number, default: 0 },
  lastStudyDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
