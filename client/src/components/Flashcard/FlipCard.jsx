import { useState } from 'react';
import { useVoiceRead } from '../../hooks/useVoiceRead';
import renderFormattedText from '../../utils/renderFormattedText';

export default function FlipCard({ card, onDifficultyChange }) {
  const [flipped, setFlipped] = useState(false);
  const { read } = useVoiceRead();

  return (
    <div
      className="card-scene"
      onClick={() => setFlipped(!flipped)}
    >
      <div className={`card-inner ${flipped ? 'flipped' : ''}`}>

        {/* Front — Question */}
        <div className="card-face card-front">
          <span className="card-label">{card.subject}</span>
          <div className="card-content-scroll">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%' }}>
              <p className="card-question-text">
                {card.question}
              </p>
            </div>
          </div>
          <span className="card-hint">Tap to reveal answer</span>
        </div>

        {/* Back — Answer */}
        <div className="card-face card-back">
          <div className="card-content-scroll card-answer-area">
            {renderFormattedText(card.answer)}
          </div>

          {/* Mark difficulty */}
          <span style={{ fontSize: '0.7rem', color: 'rgba(238,240,255,0.4)', marginTop: '8px', flexShrink: 0 }}>Mark difficulty level:</span>

          {/* Difficulty badges */}
          <div className="card-badges" onClick={e => e.stopPropagation()}>
            {['easy', 'medium', 'hard'].map(level => (
              <button
                key={level}
                onClick={() => onDifficultyChange(card._id, level)}
                className={`badge-${level} card-badge-btn`}
                style={{
                  opacity: card.difficulty === level ? 1 : 0.55,
                  transform: card.difficulty === level ? 'scale(1.07)' : 'scale(1)',
                }}
              >
                {level}
              </button>
            ))}
          </div>

          {/* Voice read */}
          <button
            onClick={e => { e.stopPropagation(); read(card.question + '. ' + card.answer); }}
            className="card-voice-btn"
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(238,240,255,0.9)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(238,240,255,0.5)')}
          >
            🔊 Read aloud
          </button>
        </div>

      </div>
    </div>
  );
}
