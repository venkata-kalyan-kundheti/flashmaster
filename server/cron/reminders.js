const cron = require('node-cron');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Notification = require('../models/Notification');

const initCronJobs = () => {
  // Run daily at 8 AM
  cron.schedule('0 8 * * *', async () => {
    try {
      const students = await User.find({ role: 'student', isActive: true });
      for (const student of students) {
        const pending = await Progress.findOne({ userId: student._id });
        if (pending && (pending.totalFlashcards - pending.reviewedCards > 0)) {
          const unreviewed = pending.totalFlashcards - pending.reviewedCards;
          await Notification.create({
            userId: student._id,
            title: 'Daily Study Reminder',
            message: `You have ${unreviewed} unreviewed flashcards. Keep going and maintain your streak!`,
            type: 'reminder',
          });
        }
      }
      console.log('Daily reminder cron job executed');
    } catch(err) {
      console.error('Cron job error:', err);
    }
  });
};

module.exports = initCronJobs;
