# FLASHMASTER — Exam Helper App
## Complete Build Instructions for Antigravity

---

## 🧠 Project Overview

FLASHMASTER is a full-stack MERN web application that helps students prepare for exams. Students upload study materials (PDFs, images, text), the system uses **Gemini AI** to generate smart flashcards, and students can revise, track progress, take quizzes, and follow personalized study plans.

**Stack:** MongoDB + Express.js + React.js (Vite) + Node.js  
**UI Style:** Glassmorphism with gradient cards — dark, premium, modern  
**Auth:** JWT + bcrypt with role-based access (student / admin)

---

## 📁 Folder Structure to Create

```
flashmaster/
├── client/                          ← React + Vite frontend
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── Flashcard/
│       │   │   ├── FlipCard.jsx         ← 3D flip animation component
│       │   │   ├── DeckView.jsx         ← Full deck revision view
│       │   │   └── QuizMode.jsx         ← Quiz from flashcards
│       │   ├── Dashboard/
│       │   │   ├── StudentDashboard.jsx
│       │   │   └── StatsCard.jsx
│       │   ├── StudyPlan/
│       │   │   ├── PlanForm.jsx
│       │   │   └── PlanCalendar.jsx
│       │   ├── Progress/
│       │   │   └── ProgressChart.jsx
│       │   ├── Notifications/
│       │   │   └── NotificationBell.jsx
│       │   ├── Pomodoro/
│       │   │   └── PomodoroTimer.jsx
│       │   ├── Leaderboard/
│       │   │   └── Leaderboard.jsx
│       │   └── Layout/
│       │       ├── Navbar.jsx
│       │       ├── Sidebar.jsx
│       │       └── AdminLayout.jsx
│       ├── pages/
│       │   ├── Landing.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── StudentHome.jsx
│       │   ├── Materials.jsx
│       │   ├── Flashcards.jsx
│       │   ├── StudyPlan.jsx
│       │   ├── Progress.jsx
│       │   ├── Quiz.jsx
│       │   ├── LeaderboardPage.jsx
│       │   └── admin/
│       │       ├── AdminDashboard.jsx
│       │       ├── AdminUsers.jsx
│       │       ├── AdminMaterials.jsx
│       │       └── AdminReports.jsx
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── ThemeContext.jsx
│       ├── hooks/
│       │   └── useFlashcards.js
│       ├── utils/
│       │   └── api.js                   ← Axios base instance
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│
├── server/                          ← Node.js + Express backend
│   ├── config/
│   │   └── db.js                        ← MongoDB connection
│   ├── models/
│   │   ├── User.js
│   │   ├── Material.js
│   │   ├── Flashcard.js
│   │   ├── StudyPlan.js
│   │   ├── Progress.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── materials.js
│   │   ├── flashcards.js
│   │   ├── studyplans.js
│   │   ├── progress.js
│   │   ├── notifications.js
│   │   ├── leaderboard.js
│   │   └── admin.js
│   ├── middleware/
│   │   ├── auth.js                      ← verifyToken middleware
│   │   └── role.js                      ← requireAdmin middleware
│   ├── utils/
│   │   ├── pdfParser.js                 ← pdf-parse text extraction
│   │   ├── ocrHelper.js                 ← Tesseract.js OCR for images
│   │   └── geminiHelper.js              ← Gemini API flashcard generation
│   ├── uploads/                         ← Multer stores files here
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── README.md
```

---

## 🔑 Environment Variables

Create `server/.env` with the following. The user will fill in actual values:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
GEMINI_API_KEY=your_gemini_api_key_from_google_ai_studio
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🎨 UI Design System — Glassmorphism

### Core Design Rules (Apply Everywhere)

- **Background:** Deep dark gradient — `linear-gradient(135deg, #0f0c29, #302b63, #24243e)`
- **Cards:** `background: rgba(255,255,255,0.05)`, `backdrop-filter: blur(20px)`, `border: 1px solid rgba(255,255,255,0.1)`, `border-radius: 20px`
- **Accent colors:** Purple `#a855f7`, Teal `#14b8a6`, Pink `#ec4899`, Amber `#f59e0b`
- **Text:** Primary `#ffffff`, Secondary `rgba(255,255,255,0.7)`, Muted `rgba(255,255,255,0.4)`
- **Fonts:** Use `'Plus Jakarta Sans'` for headings, `'Inter'` for body — import from Google Fonts
- **Buttons:** Gradient backgrounds with `hover:scale(1.02)` and `box-shadow` glow effects
- **Dark mode toggle:** Supported. Light mode uses `#f8fafc` background with same glass cards using `rgba(0,0,0,0.04)` tint

### Tailwind CSS Config (tailwind.config.js)

```js
export default {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#a855f7',
        secondary: '#14b8a6',
        accent: '#ec4899',
        surface: 'rgba(255,255,255,0.05)',
      },
      backdropBlur: { glass: '20px' },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.37)',
        glow: '0 0 20px rgba(168,85,247,0.4)',
        'glow-teal': '0 0 20px rgba(20,184,166,0.4)',
      },
    },
  },
}
```

### Global CSS (index.css)

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  min-height: 100vh;
  color: #ffffff;
}

body.light {
  background: linear-gradient(135deg, #f0e6ff 0%, #e0f2fe 50%, #f0fdf4 100%);
  color: #1e1b4b;
}

.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.37);
}

/* 3D Flip Card */
.card-scene {
  perspective: 1200px;
}
.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}
.card-inner.flipped {
  transform: rotateY(180deg);
}
.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}
.card-front {
  background: linear-gradient(135deg, rgba(168,85,247,0.3), rgba(20,184,166,0.2));
  border: 1px solid rgba(168,85,247,0.4);
}
.card-back {
  background: linear-gradient(135deg, rgba(20,184,166,0.3), rgba(236,72,153,0.2));
  border: 1px solid rgba(20,184,166,0.4);
  transform: rotateY(180deg);
}

/* Difficulty badge colors */
.badge-easy   { background: rgba(20,184,166,0.2); color: #14b8a6; border: 1px solid rgba(20,184,166,0.4); }
.badge-medium { background: rgba(245,158,11,0.2); color: #f59e0b; border: 1px solid rgba(245,158,11,0.4); }
.badge-hard   { background: rgba(239,68,68,0.2);  color: #ef4444; border: 1px solid rgba(239,68,68,0.4); }

/* Smooth transitions */
* { transition-property: background, border, box-shadow, color; transition-duration: 0.2s; }
```

---

## 🗄️ MongoDB Schemas (Mongoose)

### User.js
```js
const UserSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true },
  role:      { type: String, enum: ['student', 'admin'], default: 'student' },
  avatar:    { type: String, default: '' },
  isActive:  { type: Boolean, default: true },
  lastLogin: { type: Date },
  streak:    { type: Number, default: 0 },
  lastStudyDate: { type: Date },
}, { timestamps: true });
```

### Material.js
```js
const MaterialSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject:   { type: String, required: true },
  topic:     { type: String, default: '' },
  title:     { type: String, required: true },
  fileUrl:   { type: String, required: true },
  fileType:  { type: String, enum: ['pdf', 'image', 'text'], required: true },
  fileSize:  { type: Number },
  summary:   { type: String, default: '' },
  flashcardsGenerated: { type: Boolean, default: false },
}, { timestamps: true });
```

### Flashcard.js
```js
const FlashcardSchema = new mongoose.Schema({
  materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject:    { type: String, required: true },
  question:   { type: String, required: true },
  answer:     { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  isReviewed: { type: Boolean, default: false },
  reviewCount: { type: Number, default: 0 },
}, { timestamps: true });
```

### StudyPlan.js
```js
const StudyPlanSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject:        { type: String, required: true },
  examDate:       { type: Date, required: true },
  dailyStudyHours:{ type: Number, required: true },
  chapters:       [{ name: String, isCompleted: Boolean, scheduledDate: Date }],
  schedule:       [{ date: Date, tasks: [String], isCompleted: Boolean }],
  isActive:       { type: Boolean, default: true },
}, { timestamps: true });
```

### Progress.js
```js
const ProgressSchema = new mongoose.Schema({
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalFlashcards: { type: Number, default: 0 },
  reviewedCards:   { type: Number, default: 0 },
  completedTopics: { type: Number, default: 0 },
  pendingTopics:   { type: Number, default: 0 },
  easyCount:       { type: Number, default: 0 },
  mediumCount:     { type: Number, default: 0 },
  hardCount:       { type: Number, default: 0 },
  revisionStatus:  { type: String, enum: ['Not Started', 'In Progress', 'Completed'], default: 'Not Started' },
  quizScores:      [{ subject: String, score: Number, total: Number, date: Date }],
  studyMinutes:    { type: Number, default: 0 },
}, { timestamps: true });
```

### Notification.js
```js
const NotificationSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  type:    { type: String, enum: ['reminder', 'achievement', 'system'], default: 'reminder' },
  isRead:  { type: Boolean, default: false },
}, { timestamps: true });
```

---

## 🔐 Authentication

### server/middleware/auth.js
```js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

### server/middleware/role.js
```js
module.exports = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
```

### Auth Routes — POST /api/auth/register
- Hash password with bcrypt (salt rounds: 12)
- Save user to DB
- Return JWT token + user object (without password)

### Auth Routes — POST /api/auth/login
- Find user by email
- Compare password with bcrypt
- Update lastLogin
- Return JWT token + user object

### JWT Payload structure:
```js
{ id: user._id, email: user.email, role: user.role, name: user.name }
```

---

## ⚡ Flashcard Generation with Gemini AI

### server/utils/pdfParser.js
```js
const pdfParse = require('pdf-parse');
const fs = require('fs');

async function extractTextFromPDF(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text.slice(0, 8000); // limit to avoid token overflow
}

module.exports = { extractTextFromPDF };
```

### server/utils/ocrHelper.js (for image uploads)
```js
const Tesseract = require('tesseract.js');

async function extractTextFromImage(filePath) {
  const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
  return text.slice(0, 8000);
}

module.exports = { extractTextFromImage };
```

### server/utils/geminiHelper.js
```js
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateFlashcards(text, subject) {
  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

  const prompt = `
You are an expert study assistant. Based on the following study material about "${subject}", 
generate exactly 10 high-quality flashcards for exam preparation.

Return ONLY a valid JSON array. No markdown, no explanation, no backticks.
Format:
[
  {
    "question": "Clear, specific question",
    "answer": "Concise, accurate answer (2-4 sentences max)",
    "difficulty": "easy" | "medium" | "hard"
  }
]

Study material:
${text}
`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  // Strip any accidental markdown fences
  const clean = response.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

async function generateSummary(text, subject) {
  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
  const prompt = `Summarize the following ${subject} study material in exactly 5 bullet points. Be concise.\n\n${text}`;
  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = { generateFlashcards, generateSummary };
```

### Flashcard Generation Route — POST /api/flashcards/generate/:materialId
```
1. Find material by ID, verify it belongs to the requesting user
2. Read file from uploads folder using material.fileUrl
3. If fileType === 'pdf'   → extractTextFromPDF(filePath)
4. If fileType === 'image' → extractTextFromImage(filePath)
5. If fileType === 'text'  → fs.readFileSync(filePath, 'utf8')
6. Call generateFlashcards(text, material.subject)
7. Call generateSummary(text, material.subject) — save to material.summary
8. Save all flashcards to DB with materialId and userId
9. Update material.flashcardsGenerated = true
10. Return the flashcards array
```

---

## 📦 NPM Packages to Install

### Backend (server/)
```bash
npm install express mongoose dotenv bcryptjs jsonwebtoken
npm install multer pdf-parse tesseract.js
npm install @google/generative-ai
npm install cors helmet morgan express-rate-limit
npm install node-cron
npm install nodemon --save-dev
```

### Frontend (client/)
```bash
npm create vite@latest client -- --template react
cd client
npm install axios react-router-dom
npm install tailwindcss postcss autoprefixer
npm install recharts
npm install react-dropzone
npm install react-hot-toast
npm install react-calendar
npm install framer-motion
npm install lucide-react
```

---

## 🚀 All API Routes

### Auth Routes — /api/auth
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /register | None | Register new student |
| POST | /login | None | Login, returns JWT |
| GET | /me | Student | Get current user profile |
| PUT | /me | Student | Update profile |

### Material Routes — /api/materials
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | / | Student | Get all materials for user |
| POST | /upload | Student | Upload file (multipart/form-data) |
| DELETE | /:id | Student | Delete material + its flashcards |

### Flashcard Routes — /api/flashcards
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | / | Student | Get all flashcards for user |
| GET | /material/:materialId | Student | Get flashcards for one material |
| POST | /generate/:materialId | Student | Trigger Gemini AI generation |
| PATCH | /:id/difficulty | Student | Mark easy / medium / hard |
| PATCH | /:id/reviewed | Student | Mark as reviewed |

### Study Plan Routes — /api/studyplans
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | / | Student | Get all study plans |
| POST | / | Student | Create plan, auto-generate schedule |
| PATCH | /:id/day/:dayIndex | Student | Mark a day as complete |
| DELETE | /:id | Student | Delete plan |

### Progress Routes — /api/progress
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | / | Student | Get progress stats |
| POST | /quiz-score | Student | Save quiz result |
| POST | /study-time | Student | Log study minutes |

### Notification Routes — /api/notifications
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | / | Student | Get all notifications |
| PATCH | /:id/read | Student | Mark one as read |
| PATCH | /read-all | Student | Mark all as read |

### Leaderboard Routes — /api/leaderboard
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | / | Student | Get top 10 students by reviewed cards |

### Admin Routes — /api/admin (requires admin role)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | /users | Admin | All users with stats |
| PATCH | /users/:id/toggle | Admin | Enable / disable user |
| GET | /materials | Admin | All uploaded materials |
| DELETE | /materials/:id | Admin | Delete flagged material |
| GET | /stats | Admin | Platform-wide statistics |
| GET | /reports | Admin | Activity reports |

---

## 🃏 Flashcard UI Component — FlipCard.jsx

```jsx
import { useState } from 'react';

export default function FlipCard({ card, onDifficultyChange, onVoiceRead }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="card-scene w-full h-72 cursor-pointer" onClick={() => setFlipped(!flipped)}>
      <div className={`card-inner w-full h-full ${flipped ? 'flipped' : ''}`}>

        {/* Front — Question */}
        <div className="card-face card-front">
          <span className="text-xs uppercase tracking-widest text-purple-300 mb-4 font-semibold">
            {card.subject}
          </span>
          <p className="text-xl font-heading text-white text-center leading-relaxed">
            {card.question}
          </p>
          <span className="mt-6 text-xs text-white/40">Tap to reveal answer</span>
        </div>

        {/* Back — Answer */}
        <div className="card-face card-back">
          <p className="text-lg text-white text-center leading-relaxed mb-6">
            {card.answer}
          </p>

          {/* Difficulty buttons */}
          <div className="flex gap-3" onClick={e => e.stopPropagation()}>
            {['easy', 'medium', 'hard'].map(level => (
              <button
                key={level}
                onClick={() => onDifficultyChange(card._id, level)}
                className={`badge-${level} px-4 py-1.5 rounded-full text-sm font-medium capitalize
                  ${card.difficulty === level ? 'opacity-100 scale-105' : 'opacity-60'}
                  hover:opacity-100 hover:scale-105 transition-all`}
              >
                {level}
              </button>
            ))}
          </div>

          {/* Voice read button */}
          <button
            onClick={e => { e.stopPropagation(); onVoiceRead(card.question + '. ' + card.answer); }}
            className="mt-4 text-xs text-white/50 hover:text-white/90 flex items-center gap-1"
          >
            🔊 Read aloud
          </button>
        </div>

      </div>
    </div>
  );
}
```

### Voice Reading Hook (Web Speech API — zero install)
```js
export function useVoiceRead() {
  const read = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };
  return { read };
}
```

---

## 🍅 Pomodoro Timer Component

```jsx
import { useState, useEffect, useRef } from 'react';

export default function PomodoroTimer() {
  const [mode, setMode] = useState('work');   // 'work' | 'break'
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  const TIMES = { work: 25 * 60, break: 5 * 60 };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            const next = mode === 'work' ? 'break' : 'work';
            setMode(next);
            setSeconds(TIMES[next]);
            new Audio('/notification.mp3').play().catch(() => {});
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  const progress = ((TIMES[mode] - seconds) / TIMES[mode]) * 100;

  return (
    <div className="glass-card p-6 text-center">
      <div className="flex gap-2 justify-center mb-4">
        {['work', 'break'].map(m => (
          <button key={m} onClick={() => { setMode(m); setSeconds(TIMES[m]); setRunning(false); }}
            className={`px-4 py-1.5 rounded-full text-sm capitalize transition-all
              ${mode === m ? 'bg-purple-500 text-white' : 'text-white/50 hover:text-white'}`}>
            {m === 'work' ? 'Focus' : 'Break'}
          </button>
        ))}
      </div>

      {/* Circular progress */}
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6"/>
          <circle cx="50" cy="50" r="45" fill="none"
            stroke={mode === 'work' ? '#a855f7' : '#14b8a6'} strokeWidth="6"
            strokeLinecap="round" strokeDasharray="283"
            strokeDashoffset={283 - (283 * progress) / 100}
            style={{ transition: 'stroke-dashoffset 1s linear' }}/>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-heading font-bold">{mins}:{secs}</span>
        </div>
      </div>

      <button onClick={() => setRunning(!running)}
        className="px-8 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500
          text-white font-medium hover:shadow-glow transition-all active:scale-95">
        {running ? 'Pause' : 'Start'}
      </button>
    </div>
  );
}
```

---

## 🏆 Leaderboard

### Backend — GET /api/leaderboard
```js
router.get('/', verifyToken, async (req, res) => {
  const leaders = await Progress.find()
    .populate('userId', 'name avatar')
    .sort({ reviewedCards: -1 })
    .limit(10);
  res.json(leaders);
});
```

### Frontend Leaderboard Component
- Show top 10 students in a glass card table
- Rank 1 gets a gold crown 👑, rank 2 silver, rank 3 bronze
- Columns: Rank | Name | Cards Reviewed | Subjects | Study Minutes
- Highlight current logged-in user's row with a purple glow border

---

## 📊 Progress & Charts

Use **Recharts** for all charts:

- **Bar chart** — flashcards per subject (easy/medium/hard stacked bars)
- **Donut chart** — overall completion percentage
- **Line chart** — daily study activity over the last 7 days

All charts must use the same purple/teal/pink color palette from the design system.

---

## 🔔 Notification System

### Backend Cron Job (node-cron) — runs daily at 8 AM
```js
const cron = require('node-cron');

cron.schedule('0 8 * * *', async () => {
  const students = await User.find({ role: 'student', isActive: true });
  for (const student of students) {
    const pending = await Progress.findOne({ userId: student._id });
    if (pending && pending.pendingTopics > 0) {
      await Notification.create({
        userId: student._id,
        title: 'Daily Study Reminder',
        message: `You have ${pending.pendingTopics} pending topics. Keep going!`,
        type: 'reminder',
      });
    }
  }
});
```

### Frontend Notification Bell
- Show unread count badge on bell icon in navbar
- Click to open dropdown with last 5 notifications
- Mark all as read button
- Auto-refresh every 60 seconds using setInterval

---

## 🎮 Quiz Mode

### QuizMode.jsx Logic
```
1. Get flashcards for a subject (minimum 4 required)
2. For each flashcard:
   - Correct answer = card.answer
   - Wrong options = 3 random answers from other cards of same subject
   - Shuffle all 4 options
3. Student selects an option
4. Show green highlight for correct, red for wrong
5. After all questions → show score screen
6. POST score to /api/progress/quiz-score
```

### Quiz UI
- Full-screen modal overlay with glass card design
- Progress bar showing question X of Y
- Options as large clickable cards (not radio buttons)
- Animated correct/wrong feedback before moving to next
- Final score with grade: A (90%+), B (70%+), C (50%+), F (below 50%)

---

## 🧑‍💼 Admin Dashboard

Admin must have a completely separate layout — different sidebar, different routes.

### Admin sidebar links:
- Overview (stats cards)
- Users Management
- Uploaded Materials
- Reports
- Notifications Manager

### Admin stats cards to show:
- Total registered students
- Total uploaded materials
- Total flashcards generated
- Total quiz attempts today

### Admin users table:
- Name, Email, Role, Status (Active/Disabled), Last Login, Actions
- Toggle active/inactive with a switch

---

## 🌙 Dark Mode Implementation

```jsx
// context/ThemeContext.jsx
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => 
    localStorage.getItem('theme') !== 'light'
  );
  
  useEffect(() => {
    document.body.classList.toggle('light', !dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

Dark mode toggle button: sun/moon icon in navbar, uses `useTheme().toggle()`.

---

## 🖥️ Page-by-Page UI Requirements

### Landing Page (/)
- Full-screen hero with animated gradient background
- App name "FLASHMASTER" in large gradient heading font
- Subtitle and two CTA buttons: "Get Started" and "See How It Works"
- 3 feature highlight cards below hero (glassmorphism)
- No navbar — just a minimal header with login link

### Student Dashboard (/dashboard)
- Welcome message with student name
- 4 stats cards at top: Total Cards, Reviewed, Pending Topics, Study Streak
- Today's study plan widget
- Recent flashcards (last 5 reviewed)
- Pomodoro timer widget on the right
- Notification panel

### Materials Page (/materials)
- Upload area at top (react-dropzone, drag-and-drop)
- Subject filter tabs
- Grid of material cards — each shows: filename, subject, fileType badge, date, and action buttons (View / Generate Flashcards / Delete)
- Loading spinner while Gemini generates cards
- Success toast with count of cards generated

### Flashcards Page (/flashcards)
- Filter by subject and difficulty
- DeckView: one big flip card in center, previous/next arrows, counter "Card 3 of 24"
- Sidebar showing all card titles for quick jump
- Voice read button on each card
- Progress mini-bar showing how many reviewed in session

### Study Plan Page (/study-plan)
- Form to create plan (subject, exam date, hours/day, chapter list)
- Calendar showing scheduled chapters per day
- List of all active plans with countdown to exam date

### Quiz Page (/quiz)
- Subject selector to start quiz
- Full quiz UI as described in Quiz Mode section above

### Leaderboard Page (/leaderboard)
- Table as described in Leaderboard section above
- Student's own rank highlighted even if not in top 10

---

## 🔧 server.js Setup

```js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/materials',     require('./routes/materials'));
app.use('/api/flashcards',    require('./routes/flashcards'));
app.use('/api/studyplans',    require('./routes/studyplans'));
app.use('/api/progress',      require('./routes/progress'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/leaderboard',   require('./routes/leaderboard'));
app.use('/api/admin',         require('./routes/admin'));

// Connect DB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
    // Start cron jobs
    require('./utils/cronJobs');
  })
  .catch(err => { console.error(err); process.exit(1); });
```

---

## ✅ Build Checklist for Antigravity

### Phase 1 — Foundation
- [ ] Project scaffold (Vite + Express)
- [ ] MongoDB connection
- [ ] All 6 Mongoose models
- [ ] JWT auth (register + login)
- [ ] Auth middleware + role middleware
- [ ] React AuthContext
- [ ] Protected routes in React Router
- [ ] Login & Register pages with glassmorphism UI

### Phase 2 — Core Features
- [ ] File upload with Multer
- [ ] pdf-parse text extraction
- [ ] Tesseract.js OCR for images
- [ ] Gemini flashcard generation API
- [ ] Gemini summary generation
- [ ] All flashcard CRUD routes
- [ ] FlipCard component with 3D animation
- [ ] DeckView with navigation
- [ ] Difficulty marking

### Phase 3 — Study Features
- [ ] Study plan creation with auto-schedule
- [ ] Calendar view of study plan
- [ ] Progress tracking auto-update
- [ ] Recharts dashboard charts
- [ ] Quiz mode with 4-option MCQ
- [ ] Quiz score saving

### Phase 4 — Optional Features
- [ ] Pomodoro timer with circular progress
- [ ] Voice reading (Web Speech API)
- [ ] Leaderboard (top 10 students)
- [ ] Notification bell + unread count
- [ ] node-cron daily reminders
- [ ] Dark mode toggle

### Phase 5 — Admin & Polish
- [ ] Admin dashboard layout
- [ ] Admin users table with toggle
- [ ] Admin materials overview
- [ ] Admin stats cards
- [ ] Loading states everywhere
- [ ] Error handling with react-hot-toast
- [ ] Responsive mobile layout
- [ ] README with setup instructions

---

## 🔑 User Will Provide Later

The following keys/credentials will be provided by the user after initial UI build:

1. **MONGO_URI** — MongoDB Atlas connection string
2. **JWT_SECRET** — any random 32+ character string
3. **GEMINI_API_KEY** — from Google AI Studio (aistudio.google.com), free tier

Do not hardcode any of these. Keep them in `.env` only.

---

## 📝 Final Notes for Antigravity

- Always use `ObjectId` references between collections — never store IDs as plain strings
- Every protected API route must use `verifyToken` middleware
- Every admin API route must use both `verifyToken` AND `requireAdmin` middleware
- Flashcard generation is async — show a loading spinner while Gemini processes
- All file uploads go to `server/uploads/` — serve them as static files
- Use `react-hot-toast` for all success/error notifications (not browser alerts)
- All forms need proper validation (frontend + backend)
- The Pomodoro timer must persist its state in React state (not localStorage)
- Keep all API calls in `client/src/utils/api.js` using an Axios instance with the base URL and auth header interceptor

