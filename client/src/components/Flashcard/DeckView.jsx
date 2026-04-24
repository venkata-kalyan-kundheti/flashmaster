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

  const card = flashcards[currentIndex];

  return (
    <div className="deck-view-container">

      {/* Counter + difficulty */}
      <div className="deck-view-header">
        <span className="deck-view-counter">
          Card {currentIndex + 1} of {flashcards.length}
        </span>
        <span
          className="deck-view-difficulty"
          style={{
            color: card.difficulty === 'easy'   ? '#34d399' :
                   card.difficulty === 'medium' ? '#fbbf24' :
                   card.difficulty === 'hard'   ? '#f87171' :
                   'var(--text-muted)',
          }}
        >
          {card.difficulty || 'unrated'}
        </span>
      </div>

      {/* Card + nav arrows — arrows sit adjacent to the card */}
      <div className="deck-view-main">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`deck-nav-btn ${currentIndex === 0 ? 'deck-nav-btn--disabled' : ''}`}
          aria-label="Previous card"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="deck-view-card-wrapper">
          <FlipCard
            card={card}
            onDifficultyChange={onDifficultyChange}
            onVoiceRead={onVoiceRead}
          />
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          className={`deck-nav-btn ${currentIndex === flashcards.length - 1 ? 'deck-nav-btn--disabled' : ''}`}
          aria-label="Next card"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="deck-view-dots">
        {flashcards.map((_, i) => (
          <div
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`deck-dot ${i === currentIndex ? 'deck-dot--active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
