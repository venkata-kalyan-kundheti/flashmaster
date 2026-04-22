import { useState } from 'react';
import { useVoiceRead } from '../../hooks/useVoiceRead';
import renderFormattedText from '../../utils/renderFormattedText';

export default function FlipCard({ card, onDifficultyChange }) {
  const [flipped, setFlipped] = useState(false);
  const { read } = useVoiceRead();

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
          <div className="overflow-y-auto max-h-[150px] mb-4 w-full px-1">
            {renderFormattedText(card.answer)}
          </div>

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
            onClick={e => { e.stopPropagation(); read(card.question + '. ' + card.answer); }}
            className="mt-4 text-xs text-white/50 hover:text-white/90 flex items-center gap-1"
          >
            🔊 Read aloud
          </button>
        </div>

      </div>
    </div>
  );
}
