const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const StudyPlan = require('../models/StudyPlan');
const Material = require('../models/Material');
const fs = require('fs');
const { extractTextFromPDF } = require('../utils/pdfParser');
const { extractTextFromImage } = require('../utils/ocrHelper');
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
    const { examDate, dailyStudyHours, materialId } = req.body;
    if (!materialId || !examDate || !dailyStudyHours) {
      return res.status(400).json({ message: 'materialId, examDate, and dailyStudyHours are required' });
    }

    const material = await Material.findOne({ _id: materialId, userId: req.user.id });
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    const start = new Date();
    const end = new Date(examDate);
    const timeDiff = end.getTime() - start.getTime();
    const daysAvailable = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysAvailable <= 0) {
      return res.status(400).json({ message: 'Exam date must be in the future' });
    }

    const filePath = material.fileUrl;
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ message: 'Material file not found on server' });
    }

    let text = '';
    if (material.fileType === 'pdf') {
      text = await extractTextFromPDF(filePath);
    } else if (material.fileType === 'image') {
      text = await extractTextFromImage(filePath);
    } else if (material.fileType === 'text') {
      text = fs.readFileSync(filePath, 'utf8');
      text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n\n\n+/g, '\n\n').slice(0, 15000);
    } else {
      return res.status(400).json({ message: 'Unsupported file type for study plan generation' });
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Could not extract text from the material.' });
    }

    const aiPlan = await generateStudyPlan(material.subject, examDate, Number(dailyStudyHours), text);

    const normalizedChapters = aiPlan.chapters.map((name) => ({
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
      subject: material.subject,
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

      const completedDays = plan.schedule.filter((s) => s.isCompleted).length;
      const chapterCount = plan.chapters.length;
      const completedChapterCount = Math.min(completedDays, chapterCount);

      plan.chapters.forEach((chapter, index) => {
        chapter.isCompleted = index < completedChapterCount;
      });

      await plan.save();
    }
    
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/complete', verifyToken, async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ _id: req.params.id, userId: req.user.id });
    if (!plan) return res.status(404).json({ message: 'Not found' });

    plan.isActive = false;
    plan.schedule.forEach((day) => {
      day.isCompleted = true;
    });
    plan.chapters.forEach((chapter) => {
      chapter.isCompleted = true;
    });

    await plan.save();
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
