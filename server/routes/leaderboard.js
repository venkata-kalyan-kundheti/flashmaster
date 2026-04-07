const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const Progress = require('../models/Progress');

router.get('/', verifyToken, async (req, res) => {
  try {
    const leaders = await Progress.find()
      .populate('userId', 'name avatar')
      .sort({ reviewedCards: -1 })
      .limit(10);
    res.json(leaders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
