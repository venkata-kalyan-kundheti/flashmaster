const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const Progress = require('../models/Progress');
const Flashcard = require('../models/Flashcard');

router.get('/', verifyToken, async (req, res) => {
  try {
    let progress = await Progress.findOne({ userId: req.user.id });
    if (!progress) {
      progress = await Progress.create({ userId: req.user.id });
    }
    
    // Sync with flashcards
    const flashcards = await Flashcard.find({ userId: req.user.id });
    progress.totalFlashcards = flashcards.length;
    progress.easyCount = flashcards.filter(f => f.difficulty === 'easy').length;
    progress.mediumCount = flashcards.filter(f => f.difficulty === 'medium').length;
    progress.hardCount = flashcards.filter(f => f.difficulty === 'hard').length;
    progress.reviewedCards = flashcards.filter(f => f.isReviewed).length;

    // Compute topic-level progress
    const subjects = [...new Set(flashcards.map(f => f.subject))];
    let completed = 0;
    let pending = 0;
    subjects.forEach(sub => {
      const subCards = flashcards.filter(f => f.subject === sub);
      const allReviewed = subCards.every(f => f.isReviewed);
      if (allReviewed) completed++;
      else pending++;
    });
    progress.completedTopics = completed;
    progress.pendingTopics = pending;

    // Update revision status
    if (progress.totalFlashcards === 0) {
      progress.revisionStatus = 'Not Started';
    } else if (progress.reviewedCards >= progress.totalFlashcards) {
      progress.revisionStatus = 'Completed';
    } else if (progress.reviewedCards > 0) {
      progress.revisionStatus = 'In Progress';
    } else {
      progress.revisionStatus = 'Not Started';
    }
    
    await progress.save();
    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/quiz-score', verifyToken, async (req, res) => {
  try {
    const { subject, score, total } = req.body;
    let progress = await Progress.findOne({ userId: req.user.id });
    if (!progress) {
       progress = await Progress.create({ userId: req.user.id });
    }
    
    progress.quizScores.push({ subject, score, total, date: new Date() });
    await progress.save();
    
    res.status(201).json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/study-time', verifyToken, async (req, res) => {
  try {
    const { minutes } = req.body;
    let progress = await Progress.findOne({ userId: req.user.id });
    if (!progress) {
       progress = await Progress.create({ userId: req.user.id });
    }
    progress.studyMinutes += Number(minutes);
    await progress.save();
    
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
