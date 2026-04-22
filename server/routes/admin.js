const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const User = require('../models/User');
const Material = require('../models/Material');
const Flashcard = require('../models/Flashcard');
const Progress = require('../models/Progress');
const StudyPlan = require('../models/StudyPlan');

// All routes require auth + admin role
router.use(auth, role);

// ────────────────────────────────────────────
// GET /api/admin/stats — Platform-wide statistics
// ────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalMaterials, totalFlashcards, totalStudyPlans] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Material.countDocuments(),
      Flashcard.countDocuments(),
      StudyPlan.countDocuments(),
    ]);

    const activeUsers = await User.countDocuments({ role: 'student', isActive: true });
    const disabledUsers = await User.countDocuments({ role: 'student', isActive: false });

    // Recent signups (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSignups = await User.countDocuments({ role: 'student', createdAt: { $gte: weekAgo } });

    // Aggregate quiz scores across all students
    const allProgress = await Progress.find({});
    let totalQuizzesTaken = 0;
    let totalQuizScore = 0;
    let totalQuizTotal = 0;
    allProgress.forEach(p => {
      totalQuizzesTaken += p.quizScores?.length || 0;
      p.quizScores?.forEach(q => {
        totalQuizScore += q.score;
        totalQuizTotal += q.total;
      });
    });
    const avgQuizPercentage = totalQuizTotal > 0 ? Math.round((totalQuizScore / totalQuizTotal) * 100) : 0;

    // Top subjects by material count
    const subjectAgg = await Material.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalUsers,
      activeUsers,
      disabledUsers,
      recentSignups,
      totalMaterials,
      totalFlashcards,
      totalStudyPlans,
      totalQuizzesTaken,
      avgQuizPercentage,
      topSubjects: subjectAgg.map(s => ({ name: s._id, count: s.count })),
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ message: 'Failed to load stats' });
  }
});

// ────────────────────────────────────────────
// GET /api/admin/users — List all students
// ────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });

    // Attach progress stats for each user
    const userIds = users.map(u => u._id);
    const progressDocs = await Progress.find({ userId: { $in: userIds } });
    const materialCounts = await Material.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } }
    ]);
    const flashcardCounts = await Flashcard.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } }
    ]);

    const enrichedUsers = users.map(u => {
      const progress = progressDocs.find(p => p.userId.toString() === u._id.toString());
      const matCount = materialCounts.find(m => m._id.toString() === u._id.toString());
      const fcCount = flashcardCounts.find(f => f._id.toString() === u._id.toString());
      return {
        ...u.toObject(),
        materialsCount: matCount?.count || 0,
        flashcardsCount: fcCount?.count || 0,
        quizzesTaken: progress?.quizScores?.length || 0,
        reviewedCards: progress?.reviewedCards || 0,
      };
    });

    res.json(enrichedUsers);
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ message: 'Failed to load users' });
  }
});

// ────────────────────────────────────────────
// PATCH /api/admin/users/:id/toggle — Toggle active/disabled
// ────────────────────────────────────────────
router.patch('/users/:id/toggle', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot toggle admin accounts' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `User ${user.isActive ? 'activated' : 'disabled'} successfully`, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle user' });
  }
});

// ────────────────────────────────────────────
// DELETE /api/admin/users/:id — Delete a student
// ────────────────────────────────────────────
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot delete admin accounts' });

    // Clean up related data
    await Promise.all([
      Material.deleteMany({ userId: user._id }),
      Flashcard.deleteMany({ userId: user._id }),
      Progress.deleteMany({ userId: user._id }),
      StudyPlan.deleteMany({ userId: user._id }),
    ]);

    await User.findByIdAndDelete(user._id);

    res.json({ message: 'User and all related data deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// ────────────────────────────────────────────
// GET /api/admin/materials — All materials across platform
// ────────────────────────────────────────────
router.get('/materials', async (req, res) => {
  try {
    const materials = await Material.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load materials' });
  }
});

// ────────────────────────────────────────────
// DELETE /api/admin/materials/:id — Delete any material
// ────────────────────────────────────────────
router.delete('/materials/:id', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material not found' });

    // Delete associated flashcards
    await Flashcard.deleteMany({ materialId: material._id });
    await Material.findByIdAndDelete(material._id);

    res.json({ message: 'Material and associated flashcards deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete material' });
  }
});

module.exports = router;
