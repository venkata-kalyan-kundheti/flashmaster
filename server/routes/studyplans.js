const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const StudyPlan = require('../models/StudyPlan');

router.get('/', verifyToken, async (req, res) => {
  try {
    const plans = await StudyPlan.find({ userId: req.user.id }).sort({ examDate: 1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { subject, examDate, dailyStudyHours, chapters } = req.body;
    
    // Auto-schedule logic
    const start = new Date();
    const end = new Date(examDate);
    const timeDiff = end.getTime() - start.getTime();
    const daysAvailable = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysAvailable <= 0) {
      return res.status(400).json({ message: 'Exam date must be in the future' });
    }

    const schedule = [];
    const chaptersPerDay = Math.ceil(chapters.length / daysAvailable);
    
    for (let i = 0; i < daysAvailable; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i + 1); // Future dates
      
      const tasks = chapters
        .slice(i * chaptersPerDay, (i + 1) * chaptersPerDay)
        .map(c => c.name);
        
      if (tasks.length > 0) {
        schedule.push({
          date: date,
          tasks: tasks,
          isCompleted: false
        });
      }
    }

    const plan = new StudyPlan({
      userId: req.user.id,
      subject,
      examDate,
      dailyStudyHours,
      chapters: chapters.map(c => ({ name: c.name, isCompleted: false })),
      schedule
    });

    await plan.save();
    res.status(201).json(plan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/day/:dayId', verifyToken, async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ _id: req.params.id, userId: req.user.id });
    if (!plan) return res.status(404).json({ message: 'Not found' });

    const day = plan.schedule.id(req.params.dayId);
    if (day) {
      day.isCompleted = true;
      await plan.save();
    }
    
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await StudyPlan.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Study plan deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
