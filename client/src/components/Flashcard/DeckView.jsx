import React, { useState } from 'react';
import FlipCard from './FlipCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function DeckView({ flashcards, onDifficultyChange, onVoiceRead }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!flashcards || flashcards.length === 0) {
    return <div className="text-center text-white/60 py-12">No flashcards available in this deck.</div>;
  }

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-4 px-4 text-white/60 text-sm">
        <span>Card {currentIndex + 1} of {flashcards.length}</span>
        <span>{flashcards[currentIndex].difficulty}</span>
      </div>
      
      <div className="w-full relative px-12">
        {/* Navigation Buttons */}
        <button 
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/5 text-white disabled:opacity-30 hover:bg-white/10 transition-all"
        >
          <ChevronLeft size={24} />
        </button>

        <FlipCard 
          card={flashcards[currentIndex]} 
          onDifficultyChange={onDifficultyChange} 
          onVoiceRead={onVoiceRead} 
        />

        <button 
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/5 text-white disabled:opacity-30 hover:bg-white/10 transition-all"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 mt-8">
        {flashcards.map((f, i) => (
          <div 
            key={f._id} 
            className={`h-2 rounded-full transition-all ${i === currentIndex ? 'w-6 bg-primary' : 'w-2 bg-white/20'}`}
          />
        ))}
      </div>
    </div>
  );
}
