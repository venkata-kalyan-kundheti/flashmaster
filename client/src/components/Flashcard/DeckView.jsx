import React, { useState } from 'react';
import FlipCard from './FlipCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function DeckView({ flashcards, onDifficultyChange, onVoiceRead }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!flashcards || flashcards.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '48px 0' }}>
        No flashcards available in this deck.
      </div>
    );
  }

  const handleNext = () => { if (currentIndex < flashcards.length - 1) setCurrentIndex(i => i + 1); };
  const handlePrev = () => { if (currentIndex > 0)                      setCurrentIndex(i => i - 1); };

  const navBtn = (disabled) => ({
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    padding: '8px',
    borderRadius: '50%',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text-secondary)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.3 : 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.18s',
  });

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* Counter + difficulty */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        width: '100%', marginBottom: '14px', padding: '0 16px',
      }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 500 }}>
          Card {currentIndex + 1} of {flashcards.length}
        </span>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'capitalize',
          padding: '3px 10px',
          borderRadius: '8px',
          background: 'var(--badge-bg)',
          border: '1px solid var(--border)',
          color: flashcards[currentIndex].difficulty === 'easy'   ? '#34d399' :
                 flashcards[currentIndex].difficulty === 'medium' ? '#fbbf24' :
                 flashcards[currentIndex].difficulty === 'hard'   ? '#f87171' :
                 'var(--text-muted)',
        }}>
          {flashcards[currentIndex].difficulty || 'unrated'}
        </span>
      </div>

      {/* Card + nav arrows */}
      <div style={{ width: '100%', position: 'relative', padding: '0 48px' }}>
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          style={{ ...navBtn(currentIndex === 0), left: 0 }}
          onMouseEnter={e => { if (currentIndex > 0) { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <ChevronLeft size={22} />
        </button>

        <FlipCard
          card={flashcards[currentIndex]}
          onDifficultyChange={onDifficultyChange}
          onVoiceRead={onVoiceRead}
        />

        <button
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          style={{ ...navBtn(currentIndex === flashcards.length - 1), right: 0 }}
          onMouseEnter={e => { if (currentIndex < flashcards.length - 1) { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Dot indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '28px' }}>
        {flashcards.map((_, i) => (
          <div
            key={i}
            onClick={() => setCurrentIndex(i)}
            style={{
              height: '7px',
              borderRadius: '999px',
              cursor: 'pointer',
              transition: 'all 0.25s',
              width:      i === currentIndex ? '22px' : '7px',
              background: i === currentIndex ? '#8b5cf6' : 'var(--border)',
              boxShadow:  i === currentIndex ? '0 0 8px rgba(139,92,246,0.5)' : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}
