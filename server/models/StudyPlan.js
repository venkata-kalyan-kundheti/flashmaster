const mongoose = require('mongoose');

const StudyPlanSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject:        { type: String, required: true },
  examDate:       { type: Date, required: true },
  dailyStudyHours:{ type: Number, required: true },
  chapters:       [{ name: String, isCompleted: Boolean, scheduledDate: Date }],
  schedule:       [{ date: Date, tasks: [String], isCompleted: Boolean }],
  isActive:       { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('StudyPlan', StudyPlanSchema);
