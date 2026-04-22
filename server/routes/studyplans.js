const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const StudyPlan = require('../models/StudyPlan');
const { generateStudyPlan } = require('../utils/geminiHelper');

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
    if (!subject || !examDate || !dailyStudyHours || !Array.isArray(chapters) || chapters.length === 0) {
      return res.status(400).json({ message: 'subject, examDate, dailyStudyHours and chapters are required' });
    }

    const chapterNames = chapters
      .map((c) => (typeof c?.name === 'string' ? c.name.trim() : ''))
      .filter(Boolean);

    if (chapterNames.length === 0) {
      return res.status(400).json({ message: 'At least one valid chapter is required' });
    }

    const start = new Date();
    const end = new Date(examDate);
    const timeDiff = end.getTime() - start.getTime();
    const daysAvailable = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysAvailable <= 0) {
      return res.status(400).json({ message: 'Exam date must be in the future' });
    }

    const aiPlan = await generateStudyPlan(subject, examDate, Number(dailyStudyHours), chapterNames);

    const normalizedChapters = (aiPlan.chapters.length > 0 ? aiPlan.chapters : chapterNames).map((name) => ({
      name,
      isCompleted: false,
    }));

    const schedule = aiPlan.schedule.map((day) => ({
      date: new Date(day.date),
      tasks: day.tasks,
      isCompleted: false,
    })).filter((day) => !Number.isNaN(day.date.getTime()));

    if (schedule.length === 0) {
      return res.status(500).json({ message: 'Gemini returned an invalid schedule. Please try again.' });
    }

    const plan = new StudyPlan({
      userId: req.user.id,
      subject,
      examDate,
      dailyStudyHours: Number(dailyStudyHours),
      chapters: normalizedChapters,
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
