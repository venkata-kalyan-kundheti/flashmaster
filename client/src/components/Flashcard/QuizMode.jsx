import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const QUIZ_KEYFRAMES = `
  @keyframes quiz-fade-up-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes quiz-card-subtle-in {
    from { opacity: 0.92; transform: translateY(6px) scale(0.995); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes quiz-result-badge-pop {
    0% { opacity: 0; transform: scale(0.7) rotate(-8deg); }
    70% { opacity: 1; transform: scale(1.08) rotate(2deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
  }

  @keyframes quiz-result-gold-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }

  @keyframes quiz-result-soft-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.04); opacity: 0.95; }
  }

  .quiz-question-animate {
    animation: quiz-card-subtle-in 220ms ease-out;
  }

  .quiz-options-animate {
    animation: quiz-fade-up-in 220ms ease-out;
  }

  .quiz-result-card-animate {
    animation: quiz-fade-up-in 280ms ease-out;
  }

  .quiz-result-emoji {
    animation: quiz-result-badge-pop 340ms ease-out;
  }

  .quiz-result-emoji--excellent {
    animation: quiz-result-badge-pop 340ms ease-out, quiz-result-gold-float 2.2s ease-in-out 340ms infinite;
  }

  .quiz-result-emoji--good {
    animation: quiz-result-badge-pop 340ms ease-out, quiz-result-soft-pulse 1.8s ease-in-out 340ms infinite;
  }
`;

function injectQuizKeyframes() {
  if (document.getElementById('quiz-mode-keyframes')) return;
  const style = document.createElement('style');
  style.id = 'quiz-mode-keyframes';
  style.textContent = QUIZ_KEYFRAMES;
  document.head.appendChild(style);
}

export default function QuizMode({ subject, flashcards, onFinish }) {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [options,       setOptions]       = useState([]);
  const [selectedOpt,   setSelectedOpt]   = useState(null);
  const [score,         setScore]         = useState(0);
  const [isFinished,    setIsFinished]    = useState(false);

  useEffect(() => {
    injectQuizKeyframes();
  }, []);

  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

  const quizCards = React.useMemo(() => {
    if (!flashcards || flashcards.length < 4) return flashcards || [];
    return shuffle(flashcards);
  }, [flashcards]);

  // Truncate long answers to a short option label
  const truncateOption = (text) => {
    if (!text) return '';
    const cleaned = text.replace(/^[\s•\-\*\d\.]+/, '').trim();
    const firstLine = cleaned.split(/[\n\r]/).filter(l => l.trim())[0] || cleaned;
    const firstSentence = firstLine.split(/(?<=[.!?])\s/)[0] || firstLine;
    if (firstSentence.length <= 120) return firstSentence;
    return firstSentence.slice(0, 117).trimEnd() + '...';
  };

  useEffect(() => {
    if (quizCards.length < 4) return;
    const currentCard = quizCards[currentQIndex];
    if (!currentCard) return;
    const wrongPool   = quizCards.filter((_, i) => i !== currentQIndex).map(f => f.answer);
    const wrong3      = shuffle(wrongPool).slice(0, 3);
    setOptions(shuffle([currentCard.answer, ...wrong3]));
    setSelectedOpt(null);
  }, [currentQIndex, quizCards]);

  const handleSelect = (opt) => {
    if (selectedOpt) return;
    setSelectedOpt(opt);
    const isCorrect = opt === quizCards[currentQIndex].answer;
    if (isCorrect) setScore(s => s + 1);
    setTimeout(() => {
      if (currentQIndex < quizCards.length - 1) {
        setCurrentQIndex(ci => ci + 1);
      } else {
        finishQuiz(isCorrect ? score + 1 : score);
      }
    }, 720);
  };

  const finishQuiz = async (finalScore) => {
    setIsFinished(true);
    try {
      await api.post('/progress/quiz-score', { subject, score: finalScore, total: quizCards.length });
      toast.success('Score saved!');
    } catch { toast.error('Failed to save score'); }
  };

  if (quizCards.length < 4) {
    return (
      <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
        You need at least 4 flashcards in this subject to take a quiz.
      </div>
    );
  }

  /* ── Results Screen ──────────────────────────────────────────── */
  if (isFinished) {
    const pct = (score / quizCards.length) * 100;
    const gradeInfo =
      pct >= 90 ? { grade: 'A', color: '#8b5cf6', glow: '0 0 40px rgba(139,92,246,0.5)' } :
      pct >= 70 ? { grade: 'B', color: '#14b8a6', glow: '0 0 40px rgba(20,184,166,0.4)' } :
      pct >= 50 ? { grade: 'C', color: '#f59e0b', glow: '0 0 40px rgba(245,158,11,0.4)' } :
                  { grade: 'F', color: '#f87171', glow: '0 0 40px rgba(248,113,113,0.4)' };

    const resultVisual =
      pct >= 90 ? { emoji: '🏆', cls: 'quiz-result-emoji--excellent', note: 'Outstanding performance' } :
      pct >= 75 ? { emoji: '🎯', cls: 'quiz-result-emoji--good',      note: 'Great job' } :
      pct >= 50 ? { emoji: '👍', cls: '',                             note: 'Good effort' } :
                  { emoji: '📘', cls: '',                             note: 'Keep practicing' };

    return (
      <div
        className="glass-card p-12 text-center max-w-lg mx-auto quiz-result-card-animate"
        style={{ boxShadow: '0 16px 60px rgba(0,0,0,0.5)' }}
      >
        <div
          className={`quiz-result-emoji ${resultVisual.cls}`}
          style={{ fontSize: '2.8rem', lineHeight: 1, marginBottom: '10px' }}
        >
          {resultVisual.emoji}
        </div>

        <h2 className="text-3xl font-heading font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          Quiz Completed!
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.9rem' }}>
          Subject: {subject} • {resultVisual.note}
        </p>

        <div style={{
          fontSize: '6rem',
          fontWeight: 900,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          color: gradeInfo.color,
          textShadow: gradeInfo.glow,
          lineHeight: 1,
          marginBottom: '24px',
        }}>
          {gradeInfo.grade}
        </div>

        <p
          className="text-xl"
          style={{
            color: 'var(--text-primary)',
            borderTop: '1px solid var(--border)',
            paddingTop: '20px',
            marginBottom: '28px',
          }}
        >
          Score: <strong style={{ color: gradeInfo.color }}>{score} / {quizCards.length}</strong>
          <span style={{ color: 'var(--text-muted)', marginLeft: '8px', fontSize: '0.9rem' }}>
            ({pct.toFixed(0)}%)
          </span>
        </p>

        <button
          onClick={onFinish}
          style={{
            padding: '11px 32px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            color: 'var(--text-primary)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'; e.currentTarget.style.background = 'var(--surface-hover)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; }}
        >
          ← Back to Quizzes
        </button>
      </div>
    );
  }

  /* ── Quiz Question Screen ────────────────────────────────────── */
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', width: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <span style={{ color: '#8b5cf6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem' }}>
          {subject}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>
          Question {currentQIndex + 1} of {quizCards.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '6px', background: 'var(--surface)', borderRadius: '999px', marginBottom: '28px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${(currentQIndex / quizCards.length) * 100}%`,
          background: 'linear-gradient(90deg, #6d28d9, #8b5cf6)',
          borderRadius: '999px',
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Question Card */}
      <div
        key={`q-${currentQIndex}`}
        className="glass-card quiz-question-animate"
        style={{
          padding: '40px',
          marginBottom: '20px',
          minHeight: '180px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          borderColor: 'rgba(139,92,246,0.25)',
        }}
      >
        <h2
          className="text-2xl font-heading"
          style={{ color: 'var(--text-primary)', lineHeight: 1.45, fontWeight: 700 }}
        >
          {quizCards[currentQIndex]?.question}
        </h2>
      </div>

      {/* Answer Options */}
      <div key={`o-${currentQIndex}`} className="grid grid-cols-1 md:grid-cols-2 gap-3 quiz-options-animate">
        {options.map((opt, i) => {
          const isCorrectOpt = opt === quizCards[currentQIndex].answer;
          const isPickedWrong = selectedOpt && opt === selectedOpt && !isCorrectOpt;
          const isDimmed = selectedOpt && !isCorrectOpt && opt !== selectedOpt;

          const bg      = selectedOpt
            ? isCorrectOpt    ? 'rgba(20,184,166,0.18)'   : isPickedWrong ? 'rgba(239,68,68,0.18)' : 'var(--surface)'
            : 'var(--surface)';
          const border  = selectedOpt
            ? isCorrectOpt    ? 'rgba(20,184,166,0.6)'    : isPickedWrong ? 'rgba(239,68,68,0.6)'  : 'var(--border)'
            : 'var(--border)';
          const textCol = selectedOpt
            ? isCorrectOpt    ? '#34d399'                 : isPickedWrong ? '#f87171'              : 'var(--text-muted)'
            : 'var(--text-primary)';

          return (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              disabled={!!selectedOpt}
              style={{
                padding: '18px 20px',
                borderRadius: '14px',
                border: `1px solid ${border}`,
                background: bg,
                color: textCol,
                textAlign: 'left',
                cursor: selectedOpt ? 'default' : 'pointer',
                opacity: isDimmed ? 0.4 : 1,
                transition: 'all 0.25s',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                lineHeight: 1.5,
                minHeight: '60px',
                display: 'flex',
                alignItems: 'center',
                fontWeight: selectedOpt && isCorrectOpt ? 700 : 400,
                boxShadow: selectedOpt && isCorrectOpt ? '0 0 20px rgba(20,184,166,0.25)' : 'none',
              }}
              onMouseEnter={e => { if (!selectedOpt) { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.45)'; e.currentTarget.style.background = 'var(--surface-hover)'; } }}
              onMouseLeave={e => { if (!selectedOpt) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; } }}
            >
              {truncateOption(opt)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
