const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// ENV diagnostics — verify all critical variables are loaded
console.log('ENV CHECK - GEMINI KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('ENV CHECK - GEMINI KEY starts:', process.env.GEMINI_API_KEY?.substring(0, 8));
console.log('ENV CHECK - MONGO URI exists:', !!process.env.MONGO_URI);
console.log('ENV CHECK - JWT SECRET exists:', !!process.env.JWT_SECRET);
// console.log('ENV CHECK - CLOUDINARY_CLOUD_NAME exists:', !!process.env.CLOUDINARY_CLOUD_NAME); // Disabled

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());

// CORS - allow multiple Vite dev ports to avoid port mismatch issues
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Cron Jobs
require('./cron/reminders')();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/flashcards', require('./routes/flashcards'));
app.use('/api/studyplans', require('./routes/studyplans'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/resume', require('./routes/resume'));


// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
