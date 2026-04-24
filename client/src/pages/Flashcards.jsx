import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import renderFormattedText from '../utils/renderFormattedText';
import { Toaster } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const toastStyle = {
  style: {
    background: 'var(--surface)',
    backdropFilter: 'blur(12px)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
  },
};

/* ── Inject keyframe CSS once ─────────────────────────────────── */
const KEYFRAMES = `
  @keyframes card-turn-out-left {
    0%   { transform: perspective(1000px) rotateY(0deg);   opacity: 1; }
    100% { transform: perspective(1000px) rotateY(-90deg); opacity: 0; }
  }
  @keyframes card-turn-in-right {
    0%   { transform: perspective(1000px) rotateY(90deg);  opacity: 0; }
    100% { transform: perspective(1000px) rotateY(0deg);   opacity: 1; }
  }
  @keyframes card-turn-out-right {
    0%   { transform: perspective(1000px) rotateY(0deg);  opacity: 1; }
    100% { transform: perspective(1000px) rotateY(90deg); opacity: 0; }
  }
  @keyframes card-turn-in-left {
    0%   { transform: perspective(1000px) rotateY(-90deg); opacity: 0; }
    100% { transform: perspective(1000px) rotateY(0deg);   opacity: 1; }
  }
`;

function injectKeyframes() {
  if (document.getElementById('fc-keyframes')) return;
  const style = document.createElement('style');
  style.id = 'fc-keyframes';
  style.textContent = KEYFRAMES;
  document.head.appendChild(style);
}

export default function Flashcards() {
  const [flashcards, setFlashcards]             = useState([]);
  const [subjects, setSubjects]                 = useState([]);
  const [activeSubject, setActiveSubject]       = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped]               = useState(false);
  const [reviewedIds, setReviewedIds]           = useState(new Set());
  const [loading, setLoading]                   = useState(true);

  /* Turn animation state */
  const [animating, setAnimating]   = useState(false);
  const [animStyle, setAnimStyle]   = useState({});
  const [displayIdx, setDisplayIdx] = useState(0); // what's actually rendered
  const cardRef                     = useRef(null);

  useEffect(() => {
    injectKeyframes();
  }, []);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res   = await api.get('/flashcards');
        const cards = res.data;
        setFlashcards(cards);
        // Track already-reviewed cards
        setReviewedIds(new Set(cards.filter(c => c.isReviewed).map(c => c._id)));
        const uniqueSubjects = [...new Set(cards.map(c => c.subject))];
        setSubjects(uniqueSubjects.map(sub => ({
          name:  sub,
          count: cards.filter(c => c.subject === sub).length,
        })));
      } catch {
        toast.error('Failed to load flashcards');
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-8 max-w-5xl mx-auto">
        <Toaster position="top-right" toastOptions={toastStyle} />
        <LoadingSpinner message="Loading flashcards..." />
      </div>
    );
  }

  const subjectCards = activeSubject ? flashcards.filter(f => f.subject === activeSubject) : [];
  const currentCard  = subjectCards[displayIdx];

  const handleDifficultyChange = async (newDifficulty) => {
    if (!currentCard) return;
    try {
      await api.patch(`/flashcards/${currentCard._id}/difficulty`, { difficulty: newDifficulty });
      // Update the flashcards array directly so currentCard.difficulty reflects the change
      setFlashcards(prev => prev.map(fc =>
        fc._id === currentCard._id ? { ...fc, difficulty: newDifficulty } : fc
      ));
      toast.success(`Marked as ${newDifficulty}!`);
    } catch {
      toast.error('Failed to update difficulty');
    }
  };

  const markAsReviewed = async (cardId) => {
    if (reviewedIds.has(cardId)) return;
    try {
      await api.patch(`/flashcards/${cardId}/reviewed`);
      setReviewedIds(prev => new Set(prev).add(cardId));
    } catch {
      // Silent fail — don't block the user experience
    }
  };

  /* ─── Card Turn Animation ─────────────────────────────────── */
  const navigateTo = (nextIdx, direction /* 'next' | 'prev' */) => {
    if (animating || nextIdx < 0 || nextIdx >= subjectCards.length) return;
    setAnimating(true);
    setIsFlipped(false);

    const outAnim = direction === 'next' ? 'card-turn-out-left' : 'card-turn-out-right';
    const inAnim  = direction === 'next' ? 'card-turn-in-right' : 'card-turn-in-left';
    const dur     = 260; // ms per half

    /* Phase 1: turn current card out */
    setAnimStyle({
      animation: `${outAnim} ${dur}ms cubic-bezier(0.4,0,0.2,1) forwards`,
    });

    setTimeout(() => {
      /* Swap content mid-flip */
      setDisplayIdx(nextIdx);
      setCurrentCardIndex(nextIdx);

      /* Phase 2: turn new card in */
      setAnimStyle({
        animation: `${inAnim} ${dur}ms cubic-bezier(0.4,0,0.2,1) forwards`,
      });

      setTimeout(() => {
        setAnimStyle({});
        setAnimating(false);
      }, dur);
    }, dur);
  };

  const handleNext = () => navigateTo(currentCardIndex + 1, 'next');
  const handlePrev = () => navigateTo(currentCardIndex - 1, 'prev');

  /* ── Subject Picker ──────────────────────────────────────── */
  if (!activeSubject) {
    return (
      <div className="min-h-screen p-8 max-w-5xl mx-auto">
        <Toaster position="top-right" toastOptions={toastStyle} />
        <h1 className="text-4xl font-heading font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          📚 Flashcards
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '48px' }}>
          Click on a subject to study its flashcards
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subjects.map(sub => (
            <button
              key={sub.name}
              onClick={() => {
                setActiveSubject(sub.name);
                setCurrentCardIndex(0);
                setDisplayIdx(0);
                setIsFlipped(false);
                setAnimStyle({});
              }}
              className="glass-card p-6 text-left"
              style={{ border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s', background: 'none', width: '100%' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.45)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)';           e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <h3 className="text-2xl font-bold font-heading mb-2" style={{ color: '#8b5cf6' }}>{sub.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{sub.count} Cards Available</p>
            </button>
          ))}
          {subjects.length === 0 && (
            <p className="col-span-full text-center py-12" style={{ color: 'var(--text-muted)' }}>
              No flashcards yet. Upload materials and generate them first!
            </p>
          )}
        </div>
      </div>
    );
  }

  /* ── Study View ──────────────────────────────────────────── */
  const diffColors = {
    easy:   { active: 'rgba(20,184,166,0.2)',  border: 'rgba(20,184,166,0.5)',  text: '#5eead4' },
    medium: { active: 'rgba(234,179,8,0.2)',   border: 'rgba(234,179,8,0.5)',   text: '#fbbf24' },
    hard:   { active: 'rgba(239,68,68,0.2)',   border: 'rgba(239,68,68,0.5)',   text: '#f87171' },
  };

  return (
    <div className="min-h-screen p-8 max-w-3xl mx-auto">
      <Toaster position="top-right" toastOptions={toastStyle} />

      <button
        onClick={() => setActiveSubject(null)}
        style={{ color: 'var(--text-secondary)', marginBottom: '32px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 500 }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
      >
        ← Back to Subjects
      </button>

      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="text-3xl font-heading font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{activeSubject}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Card {displayIdx + 1} of {subjectCards.length}</p>
        </div>
        {currentCard?.difficulty && (
          <span style={{
            padding: '5px 14px',
            borderRadius: '10px',
            fontSize: '0.8rem',
            fontWeight: 600,
            textTransform: 'capitalize',
            background: currentCard.difficulty === 'easy' ? 'rgba(20,184,166,0.15)' :
                         currentCard.difficulty === 'hard' ? 'rgba(239,68,68,0.15)' :
                         'rgba(234,179,8,0.15)',
            color: currentCard.difficulty === 'easy' ? '#5eead4' :
                   currentCard.difficulty === 'hard' ? '#f87171' :
                   '#fbbf24',
            border: `1px solid ${currentCard.difficulty === 'easy' ? 'rgba(20,184,166,0.3)' :
                                  currentCard.difficulty === 'hard' ? 'rgba(239,68,68,0.3)' :
                                  'rgba(234,179,8,0.3)'}`,
          }}>
            {currentCard.difficulty === 'easy' ? '🟢' : currentCard.difficulty === 'hard' ? '🔴' : '🟡'} {currentCard.difficulty}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '6px', background: 'var(--surface)', borderRadius: '999px', marginBottom: '32px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          borderRadius: '999px',
          background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
          width: `${((displayIdx + 1) / subjectCards.length) * 100}%`,
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* ── Layout: ← Card → with nav buttons on sides ──────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>

        {/* Left Nav Button */}
        <button
          onClick={handlePrev}
          disabled={displayIdx === 0 || animating}
          style={{
            flexShrink: 0,
            width: '50px',
            height: '50px',
            borderRadius: '14px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            backdropFilter: 'blur(12px)',
            color: displayIdx === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
            cursor: displayIdx === 0 || animating ? 'not-allowed' : 'pointer',
            opacity: displayIdx === 0 ? 0.3 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
          }}
          onMouseEnter={e => { if (displayIdx > 0 && !animating) { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; e.currentTarget.style.background = 'rgba(139,92,246,0.12)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(139,92,246,0.2)'; e.currentTarget.style.transform = 'scale(1.08)'; } }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.15)'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          ←
        </button>

        {/* Card */}
        <div style={{ flex: 1, minWidth: 0, perspective: '1400px' }}>
          <div
            ref={cardRef}
            style={{
              minHeight: '420px',
              transformOrigin: 'center center',
              willChange: 'transform',
              ...animStyle,
            }}
          >
            <div
              className={`card-inner ${isFlipped ? 'flipped' : ''}`}
              onClick={() => {
                if (animating) return;
                const willFlip = !isFlipped;
                setIsFlipped(willFlip);
                if (willFlip && currentCard) {
                  markAsReviewed(currentCard._id);
                }
              }}
              style={{
                cursor: animating ? 'default' : 'pointer',
                width: '100%',
                height: '100%',
                position: 'relative',
                minHeight: '420px',
              }}
            >
              {/* FRONT FACE (Question) */}
              <div
                className="card-face glass-card"
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '32px 28px',
                  borderColor: 'rgba(139,92,246,0.25)',
                }}
              >
                <p style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  ❓ Question
                </p>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', overflow: 'hidden' }}>
                  <h2 className="font-heading font-bold" style={{ color: 'var(--text-primary)', lineHeight: 1.4, fontSize: 'clamp(1.1rem, 3vw, 1.8rem)' }}>
                    {currentCard?.question}
                  </h2>
                </div>
                <p style={{ color: 'var(--text-muted)', marginTop: '16px', fontSize: '0.8rem' }}>
                  {animating ? '' : 'Click to flip'}
                </p>
              </div>

              {/* BACK FACE (Answer) */}
              <div
                className="card-face glass-card"
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '24px 28px',
                  borderColor: 'rgba(20,184,166,0.35)',
                  transform: 'rotateY(180deg)',
                  overflow: 'hidden',
                }}
              >
                <p style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a78bfa', marginBottom: '12px', fontWeight: 700, flexShrink: 0 }}>
                  ✦ Answer
                </p>

                {/* Scrollable answer content */}
                <div
                  style={{
                    flex: 1,
                    width: '100%',
                    overflowY: 'auto',
                    minHeight: 0,
                    paddingRight: '6px',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(167, 139, 250, 0.35) transparent',
                  }}
                  className="flashcard-answer-scroll"
                  onClick={e => e.stopPropagation()}
                  onWheel={e => e.stopPropagation()}
                >
                  {currentCard && renderFormattedText(currentCard.answer)}
                </div>

                <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: '0.8rem', flexShrink: 0 }}>
                  {animating ? '' : 'Click to flip'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Nav Button */}
        <button
          onClick={handleNext}
          disabled={displayIdx === subjectCards.length - 1 || animating}
          style={{
            flexShrink: 0,
            width: '50px',
            height: '50px',
            borderRadius: '14px',
            border: 'none',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            color: '#fff',
            cursor: displayIdx === subjectCards.length - 1 || animating ? 'not-allowed' : 'pointer',
            opacity: displayIdx === subjectCards.length - 1 ? 0.3 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            fontWeight: 700,
            transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 16px rgba(139,92,246,0.35)',
          }}
          onMouseEnter={e => { if (displayIdx < subjectCards.length - 1 && !animating) { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(139,92,246,0.5)'; } }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(139,92,246,0.35)'; }}
        >
          →
        </button>
      </div>

      {/* Difficulty Controls */}
      <div className="glass-card p-5" style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Mark difficulty level:</p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {['easy', 'medium', 'hard'].map(d => {
            const c        = diffColors[d];
            const isActive = currentCard?.difficulty === d;
            return (
              <button
                key={d}
                onClick={() => handleDifficultyChange(d)}
                style={{
                  padding: '7px 18px',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  border: `1px solid ${isActive ? c.border : 'var(--border)'}`,
                  background: isActive ? c.active : 'var(--surface)',
                  color: isActive ? c.text : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                }}
              >
                {d === 'easy' ? '🟢' : d === 'medium' ? '🟡' : '🔴'} {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
