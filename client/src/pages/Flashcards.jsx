import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import renderFormattedText from '../utils/renderFormattedText';

export default function Flashcards() {
  const [flashcards, setFlashcards] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [activeSubject, setActiveSubject] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [difficulty, setDifficulty] = useState({});
  const [loading, setLoading] = useState(true);
  const [reviewedIds, setReviewedIds] = useState(new Set());

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await api.get('/flashcards');
        const cards = res.data;
        setFlashcards(cards);
        
        // Track already-reviewed cards
        const alreadyReviewed = new Set(cards.filter(c => c.isReviewed).map(c => c._id));
        setReviewedIds(alreadyReviewed);
        
        const uniqueSubjects = [...new Set(cards.map(c => c.subject))];
        setSubjects(uniqueSubjects.map(sub => ({
          name: sub,
          count: cards.filter(c => c.subject === sub).length
        })));
      } catch (err) {
        toast.error('Failed to load flashcards');
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  const markAsReviewed = async (cardId) => {
    if (reviewedIds.has(cardId)) return;
    try {
      await api.patch(`/flashcards/${cardId}/reviewed`);
      setReviewedIds(prev => new Set(prev).add(cardId));
    } catch (err) {
      // Silent fail — don't block the user experience
    }
  };

  const subjectCards = activeSubject 
    ? flashcards.filter(f => f.subject === activeSubject)
    : [];

  const currentCard = subjectCards[currentCardIndex];

  const handleDifficultyChange = async (newDifficulty) => {
    if (!currentCard) return;
    try {
      await api.patch(`/flashcards/${currentCard._id}/difficulty`, { difficulty: newDifficulty });
      setDifficulty(prev => ({ ...prev, [currentCard._id]: newDifficulty }));
      toast.success(`Marked as ${newDifficulty}!`);
    } catch (err) {
      toast.error('Failed to update difficulty');
    }
  };

  const handleNext = () => {
    if (currentCardIndex < subjectCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-8 max-w-5xl mx-auto">
        <Toaster position="top-right" toastOptions={{ style: { background: 'var(--th-tooltip-bg)', backdropFilter: 'blur(10px)', color: 'rgb(var(--th-text))', border: '1px solid var(--th-card-border)' }}}/>
        <LoadingSpinner message="Loading flashcards..." />
      </div>
    );
  }

  if (!activeSubject) {
    return (
      <div className="min-h-screen p-4 sm:p-8 max-w-5xl mx-auto">
        <Toaster position="top-right" toastOptions={{ style: { background: 'var(--th-tooltip-bg)', backdropFilter: 'blur(10px)', color: 'rgb(var(--th-text))', border: '1px solid var(--th-card-border)' }}}/>
        <h1 className="text-4xl font-heading font-bold mb-2 text-th-text">📚 Flashcards</h1>
        <p className="text-th-muted mb-12">Click on a subject to study its flashcards</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subjects.map(sub => (
            <button
              key={sub.name}
              onClick={() => {
                setActiveSubject(sub.name);
                setCurrentCardIndex(0);
                setIsFlipped(false);
              }}
              className="glass-card p-6 hover:border-primary/50 hover:-translate-y-1 transition-all text-left group"
            >
              <h3 className="text-2xl font-bold font-heading mb-2 text-primary group-hover:text-accent transition-colors">{sub.name}</h3>
              <p className="text-th-muted">{sub.count} Cards Available</p>
            </button>
          ))}
          {subjects.length === 0 && (
            <p className="text-th-muted col-span-full text-center">No flashcards yet. Upload materials and generate them first!</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-3xl mx-auto">
      <Toaster position="top-right" toastOptions={{ style: { background: 'var(--th-tooltip-bg)', backdropFilter: 'blur(10px)', color: 'rgb(var(--th-text))', border: '1px solid var(--th-card-border)' }}}/>
      
      <button
        onClick={() => setActiveSubject(null)}
        className="btn btn-ghost btn-sm mb-8"
      >
        ← Back to Subjects
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold mb-2 text-th-text">{activeSubject}</h1>
        <p className="text-th-muted">Card {currentCardIndex + 1} of {subjectCards.length}</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-th-surface/8 h-2 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 rounded-full" 
          style={{ width: `${((currentCardIndex + 1) / subjectCards.length) * 100}%` }}
        ></div>
      </div>

      {/* Flashcard with side navigation */}
      <div className="flex items-center gap-4 mb-8">
        {/* Previous Button */}
        <button
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          disabled={currentCardIndex === 0}
          className="btn btn-secondary w-12 h-12 !p-0 rounded-full flex-shrink-0 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:transform-none hover:scale-110 transition-all"
          title="Previous card"
        >
          ←
        </button>

        {/* Flashcard with 3D flip */}
        <div
          className="card-scene flex-1 cursor-pointer"
          style={{ height: '420px', perspective: '1200px' }}
          onClick={() => {
            const willFlip = !isFlipped;
            setIsFlipped(willFlip);
            if (willFlip && currentCard) {
              markAsReviewed(currentCard._id);
            }
          }}
        >
          <div
            className="card-inner w-full"
            style={{
              height: '420px',
              position: 'relative',
              transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front — Question */}
            <div
              className="card-face card-front"
              style={{
                position: 'absolute',
                inset: 0,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                padding: '1.5rem 2rem',
              }}
            >
              <p className="text-sm text-th-muted uppercase tracking-widest mb-3 text-center flex-shrink-0">
                ❓ Question
              </p>
              <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
                <h2 className="text-2xl font-heading font-bold leading-relaxed text-th-text text-center whitespace-pre-wrap break-words">
                  {currentCard?.question}
                </h2>
              </div>
              <p className="text-th-muted/50 mt-3 text-sm text-center flex-shrink-0">Click to flip</p>
            </div>

            {/* Back — Answer */}
            <div
              className="card-face card-back"
              style={{
                position: 'absolute',
                inset: 0,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                padding: '1.5rem 2rem',
                transform: 'rotateY(180deg)',
              }}
            >
              <p className="text-sm text-th-muted uppercase tracking-widest mb-3 text-center flex-shrink-0">
                📝 Answer
              </p>
              <div className="flex-1 overflow-y-auto px-1" style={{ minHeight: 0 }}>
                {renderFormattedText(currentCard?.answer)}
              </div>
              <p className="text-th-muted/50 mt-3 text-sm text-center flex-shrink-0">Click to flip</p>
            </div>
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          disabled={currentCardIndex === subjectCards.length - 1}
          className="btn btn-primary w-12 h-12 !p-0 rounded-full flex-shrink-0 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:transform-none hover:scale-110 transition-all"
          title="Next card"
        >
          →
        </button>
      </div>

      {/* Difficulty Controls */}
      <div className="glass-card p-6 mb-8">
        <p className="text-sm text-th-muted mb-3">Mark difficulty level:</p>
        <div className="flex gap-3">
          <button
            onClick={() => handleDifficultyChange('easy')}
            className={`btn btn-sm transition-all ${
              difficulty[currentCard?._id] === 'easy'
                ? 'bg-green-500/20 border-green-500/50 text-green-500'
                : 'btn-secondary hover:border-green-500/30 hover:text-green-500'
            }`}
          >
            🟢 Easy
          </button>
          <button
            onClick={() => handleDifficultyChange('medium')}
            className={`btn btn-sm transition-all ${
              difficulty[currentCard?._id] === 'medium'
                ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500'
                : 'btn-secondary hover:border-yellow-500/30 hover:text-yellow-500'
            }`}
          >
            🟡 Medium
          </button>
          <button
            onClick={() => handleDifficultyChange('hard')}
            className={`btn btn-sm transition-all ${
              difficulty[currentCard?._id] === 'hard'
                ? 'bg-red-500/20 border-red-500/50 text-red-500'
                : 'btn-secondary hover:border-red-500/30 hover:text-red-500'
            }`}
          >
            🔴 Hard
          </button>
        </div>
      </div>
    </div>
  );
}
