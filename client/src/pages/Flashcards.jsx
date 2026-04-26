import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import renderFormattedText from '../utils/renderFormattedText';
import { Toaster } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { useVoiceRead } from '../hooks/useVoiceRead';

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
    0%   { transform: perspective(2000px) rotateY(0deg) scale(1);   opacity: 1; }
    100% { transform: perspective(2000px) rotateY(-72deg) scale(0.985); opacity: 0; }
  }
  @keyframes card-turn-in-right {
    0%   { transform: perspective(2000px) rotateY(72deg) scale(0.985);  opacity: 0; }
    100% { transform: perspective(2000px) rotateY(0deg) scale(1);   opacity: 1; }
  }
  @keyframes card-turn-out-right {
    0%   { transform: perspective(2000px) rotateY(0deg) scale(1);  opacity: 1; }
    100% { transform: perspective(2000px) rotateY(72deg) scale(0.985); opacity: 0; }
  }
  @keyframes card-turn-in-left {
    0%   { transform: perspective(2000px) rotateY(-72deg) scale(0.985); opacity: 0; }
    100% { transform: perspective(2000px) rotateY(0deg) scale(1);   opacity: 1; }
  }

  .flashcards-study-layout {
    display: grid;
    grid-template-columns: 260px minmax(0, 1fr);
    gap: 18px;
    align-items: start;
    transition: grid-template-columns 0.26s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .flashcards-study-layout.collapsed {
    grid-template-columns: 72px minmax(0, 1fr);
  }

  @media (max-width: 1024px) {
    .flashcards-study-layout,
    .flashcards-study-layout.collapsed {
      grid-template-columns: 1fr;
    }
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
  const [isTopicsCollapsed, setIsTopicsCollapsed] = useState(false);
  const [isRevisionFirstOrder, setIsRevisionFirstOrder] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const { read, stop, pause, resume, isSupported } = useVoiceRead();

  /* Turn animation state */
  const [animating, setAnimating]   = useState(false);
  const [animStyle, setAnimStyle]   = useState({});
  const [displayIdx, setDisplayIdx] = useState(0); // what's actually rendered
  const cardRef                     = useRef(null);
  const studyCardHeight             = 420;

  useEffect(() => {
    injectKeyframes();
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  useEffect(() => {
    setIsReading(false);
    setIsPaused(false);
    stop();
  }, [displayIdx, activeSubject, stop]);

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
  const topicCards = isRevisionFirstOrder
    ? [
        ...subjectCards.filter(card => card.markedForRevision),
        ...subjectCards.filter(card => !card.markedForRevision),
      ]
    : subjectCards;

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
      await api.patch(`/flashcards/${cardId}/reviewed`, {});
      setReviewedIds(prev => new Set(prev).add(cardId));
      setFlashcards(prev => prev.map(fc => (
        fc._id === cardId ? { ...fc, isReviewed: true } : fc
      )));
    } catch (error) {
      console.error('Failed to mark flashcard as reviewed:', error);
    }
  };

  const handleRevisionToggle = async () => {
    if (!currentCard) return;
    if (!currentCard._id) {
      toast.error('Flashcard id missing');
      return;
    }

    const nextValue = !currentCard.markedForRevision;

    try {
      await api.patch(`/flashcards/${currentCard._id}/reviewed`, {
        markedForRevision: nextValue,
      });

      setFlashcards(prev => prev.map(fc => (
        fc._id === currentCard._id ? { ...fc, markedForRevision: nextValue } : fc
      )));

      toast.success(nextValue ? 'Marked for revision' : 'Removed from revision');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update revision mark');
    }
  };

  /* ─── Card Turn Animation ─────────────────────────────────── */
  const navigateTo = (nextIdx, direction /* 'next' | 'prev' */) => {
    if (animating || nextIdx < 0 || nextIdx >= subjectCards.length) return;
    stop();
    setIsReading(false);
    setIsPaused(false);
    setAnimating(true);
    setIsFlipped(false);

    const outAnim = direction === 'next' ? 'card-turn-out-left' : 'card-turn-out-right';
    const inAnim  = direction === 'next' ? 'card-turn-in-right' : 'card-turn-in-left';
    const dur     = 205; // slightly quicker and gentler to reduce visible size jump

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

  const handleTopicJump = (nextIdx) => {
    if (nextIdx === displayIdx || animating) return;
    navigateTo(nextIdx, nextIdx > displayIdx ? 'next' : 'prev');
  };

  const readCurrentQuestion = () => {
    if (!voiceEnabled || !currentCard?.question) return;

    if (isFlipped) {
      setIsFlipped(false);
    }

    read(currentCard.question, {
      onStart: () => {
        setIsReading(true);
        setIsPaused(false);
      },
      onEnd: () => {
        setIsReading(false);
        setIsPaused(false);
      },
      onError: () => {
        setIsReading(false);
        setIsPaused(false);
      },
    });
  };

  const readCurrentAnswer = () => {
    if (!voiceEnabled || !currentCard?.answer) return;

    if (!isFlipped) {
      setIsFlipped(true);
      if (currentCard?._id) {
        markAsReviewed(currentCard._id);
      }
    }

    read(currentCard.answer, {
      onStart: () => {
        setIsReading(true);
        setIsPaused(false);
      },
      onEnd: () => {
        setIsReading(false);
        setIsPaused(false);
      },
      onError: () => {
        setIsReading(false);
        setIsPaused(false);
      },
    });
  };

  const togglePauseResume = () => {
    if (!isReading) return;

    if (isPaused) {
      resume();
      setIsPaused(false);
    } else {
      pause();
      setIsPaused(true);
    }
  };

  const getTopicLabel = (card, index) => {
    if (card?.topic && card.topic.trim()) {
      return card.topic
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .join(' ');
    }
    return `Topic ${index + 1}`;
  };

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
                setIsTopicsCollapsed(false);
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
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <Toaster position="top-right" toastOptions={toastStyle} />

      <button
        onClick={() => {
          setIsReading(false);
          setIsPaused(false);
          stop();
          setActiveSubject(null);
        }}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setIsRevisionFirstOrder(prev => !prev)}
            style={{
              padding: '7px 12px',
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: 600,
              border: `1px solid ${isRevisionFirstOrder ? 'rgba(139,92,246,0.55)' : 'var(--border)'}`,
              background: isRevisionFirstOrder ? 'rgba(139,92,246,0.18)' : 'var(--surface)',
              color: isRevisionFirstOrder ? '#c4b5fd' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.18s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '0.84rem' }}>⬆</span>
            {isRevisionFirstOrder ? 'Undo Top Order' : 'Move to Top'}
          </button>

          {isSupported && (
            <>
              <button
                onClick={() => {
                  setVoiceEnabled(prev => {
                    const next = !prev;
                    if (!next) {
                      setIsReading(false);
                      setIsPaused(false);
                      stop();
                    }
                    return next;
                  });
                }}
                style={{
                  padding: '7px 12px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: `1px solid ${voiceEnabled ? 'rgba(16,185,129,0.45)' : 'rgba(239,68,68,0.45)'}`,
                  background: voiceEnabled ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.14)',
                  color: voiceEnabled ? '#6ee7b7' : '#fca5a5',
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                }}
              >
                {voiceEnabled ? 'Voice ON' : 'Voice OFF'}
              </button>

              <button
                onClick={readCurrentQuestion}
                disabled={!voiceEnabled}
                style={{
                  padding: '7px 12px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  border: '1px solid rgba(59,130,246,0.35)',
                  background: voiceEnabled ? 'rgba(59,130,246,0.12)' : 'rgba(148,163,184,0.1)',
                  color: voiceEnabled ? '#93c5fd' : 'var(--text-muted)',
                  cursor: voiceEnabled ? 'pointer' : 'not-allowed',
                  transition: 'all 0.18s',
                }}
              >
                🔊 Read Question
              </button>

              <button
                onClick={readCurrentAnswer}
                disabled={!voiceEnabled}
                style={{
                  padding: '7px 12px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  border: '1px solid rgba(168,85,247,0.35)',
                  background: voiceEnabled ? 'rgba(168,85,247,0.14)' : 'rgba(148,163,184,0.1)',
                  color: voiceEnabled ? '#d8b4fe' : 'var(--text-muted)',
                  cursor: voiceEnabled ? 'pointer' : 'not-allowed',
                  transition: 'all 0.18s',
                }}
              >
                🗣 Read Answer
              </button>

              <button
                onClick={togglePauseResume}
                disabled={!isReading || !voiceEnabled}
                style={{
                  padding: '7px 12px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  border: '1px solid rgba(239,68,68,0.35)',
                  background: (isReading && voiceEnabled)
                    ? (isPaused ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.14)')
                    : 'rgba(148,163,184,0.1)',
                  color: (isReading && voiceEnabled)
                    ? (isPaused ? '#6ee7b7' : '#fca5a5')
                    : 'var(--text-muted)',
                  cursor: (isReading && voiceEnabled) ? 'pointer' : 'not-allowed',
                  transition: 'all 0.18s',
                }}
              >
                {isPaused ? '▶ Resume' : '⏸ Pause'}
              </button>
            </>
          )}

          <button
            onClick={handleRevisionToggle}
            style={{
              padding: '7px 12px',
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: 600,
              border: `1px solid ${currentCard?.markedForRevision ? 'rgba(245,158,11,0.55)' : 'var(--border)'}`,
              background: currentCard?.markedForRevision ? 'rgba(245,158,11,0.16)' : 'var(--surface)',
              color: currentCard?.markedForRevision ? '#fbbf24' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.18s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '0.84rem' }}>📌</span>
            {currentCard?.markedForRevision ? 'Unmark Revision' : 'Mark for Revision'}
          </button>

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

      <div className={`flashcards-study-layout ${isTopicsCollapsed ? 'collapsed' : ''}`} style={{ marginBottom: '24px' }}>
        <div
          className="glass-card"
          style={{
            padding: '12px',
            position: 'sticky',
            top: '92px',
            height: `${studyCardHeight}px`,
            maxHeight: `${studyCardHeight}px`,
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            {!isTopicsCollapsed && (
              <p style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Topics
              </p>
            )}
            <button
              onClick={() => setIsTopicsCollapsed(prev => !prev)}
              aria-label={isTopicsCollapsed ? 'Expand topics' : 'Collapse topics'}
              style={{
                marginLeft: 'auto',
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 700,
              }}
            >
              {isTopicsCollapsed ? '»' : '«'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: `${studyCardHeight - 56}px`, paddingRight: isTopicsCollapsed ? 0 : '2px' }}>
            {topicCards.map((card) => {
              const sourceIdx = subjectCards.findIndex(sourceCard => sourceCard._id === card._id);
              const isActive = sourceIdx === displayIdx;
              return (
                <button
                  key={card._id || sourceIdx}
                  onClick={() => handleTopicJump(sourceIdx)}
                  disabled={animating}
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    borderRadius: '12px',
                    border: `1px solid ${isActive ? 'rgba(139,92,246,0.5)' : 'var(--border)'}`,
                    background: isActive ? 'rgba(139,92,246,0.2)' : 'var(--surface)',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isTopicsCollapsed ? 'center' : 'flex-start',
                    gap: '10px',
                    padding: isTopicsCollapsed ? '10px 6px' : '10px 12px',
                    cursor: animating ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                  }}
                >
                  {isTopicsCollapsed ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{sourceIdx + 1}</span>
                      {card?.markedForRevision && (
                        <span title="Marked for revision" style={{ fontSize: '0.78rem', color: '#f59e0b' }}>📌</span>
                      )}
                    </span>
                  ) : (
                    <>
                      <span style={{
                        flexShrink: 0,
                        width: '20px',
                        height: '20px',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: isActive ? 'rgba(139,92,246,0.45)' : 'rgba(148,163,184,0.2)',
                        color: isActive ? '#fff' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {sourceIdx + 1}
                      </span>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: isActive ? 600 : 500,
                        lineHeight: 1.25,
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                      }}>
                        {getTopicLabel(card, sourceIdx)}
                        {card?.markedForRevision && (
                          <span style={{ marginLeft: '8px', fontSize: '0.78rem', color: '#f59e0b' }} title="Marked for revision">
                            📌
                          </span>
                        )}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ minWidth: 0 }}>
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
            <div style={{ flex: 1, minWidth: 0, perspective: '1400px', width: '100%', maxWidth: '780px', margin: '0 auto', transition: 'max-width 0.26s cubic-bezier(0.4, 0, 0.2, 1)' }}>
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
                    <p style={{ fontSize: '0.75rem', letterSpacing: '0.06em', color: '#a78bfa', marginBottom: '12px', fontWeight: 700, flexShrink: 0 }}>
                      ✦ {getTopicLabel(currentCard, displayIdx)}
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
        </div>
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
