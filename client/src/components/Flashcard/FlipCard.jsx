import { useState } from 'react';
import { useVoiceRead } from '../../hooks/useVoiceRead';

export default function FlipCard({ card, onDifficultyChange }) {
  const [flipped, setFlipped] = useState(false);
  const { read } = useVoiceRead();

  return (
    <div
      className="card-scene w-full h-72 cursor-pointer"
      onClick={() => setFlipped(!flipped)}
    >
      <div className={`card-inner w-full h-full ${flipped ? 'flipped' : ''}`}>

        {/* Front — Question */}
        <div className="card-face card-front">
          <span style={{
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: '#a78bfa',
            marginBottom: '16px',
            fontWeight: 700,
          }}>
            {card.subject}
          </span>
          <p style={{
            fontSize: '1.15rem',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 600,
            textAlign: 'center',
            lineHeight: 1.55,
            color: '#eef0ff',
          }}>
            {card.question}
          </p>
          <span style={{
            marginTop: '24px',
            fontSize: '0.75rem',
            color: 'rgba(238,240,255,0.4)',
          }}>
            Tap to reveal answer
          </span>
        </div>

        {/* Back — Answer */}
        <div className="card-face card-back">
          <p style={{
            fontSize: '1rem',
            textAlign: 'center',
            lineHeight: 1.65,
            marginBottom: '20px',
            maxHeight: '140px',
            overflowY: 'auto',
            color: '#eef0ff',
            fontWeight: 500,
          }}>
            {card.answer}
          </p>

          {/* Difficulty badges */}
          <div className="flex gap-3" onClick={e => e.stopPropagation()}>
            {['easy', 'medium', 'hard'].map(level => (
              <button
                key={level}
                onClick={() => onDifficultyChange(card._id, level)}
                className={`badge-${level} px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-all`}
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
            style={{
              marginTop: '14px',
              fontSize: '0.75rem',
              color: 'rgba(238,240,255,0.5)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'color 0.18s',
            }}
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
