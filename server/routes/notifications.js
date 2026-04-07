const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const Notification = require('../models/Notification');

router.get('/', verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(10);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/read', verifyToken, async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );
    res.json(notif);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/read-all', verifyToken, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    res.json({ message: 'All marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
