import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

export default function Flashcards() {
  const [flashcards, setFlashcards] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [activeSubject, setActiveSubject] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [difficulty, setDifficulty] = useState({});

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await api.get('/flashcards');
        const cards = res.data;
        setFlashcards(cards);
        
        const uniqueSubjects = [...new Set(cards.map(c => c.subject))];
        setSubjects(uniqueSubjects.map(sub => ({
          name: sub,
          count: cards.filter(c => c.subject === sub).length
        })));
      } catch (err) {
        toast.error('Failed to load flashcards');
      }
    };
    fetchCards();
  }, []);

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

  if (!activeSubject) {
    return (
      <div className="min-h-screen p-8 max-w-5xl mx-auto">
        <Toaster position="top-right" toastOptions={{ style: { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}}/>
        <h1 className="text-4xl font-heading font-bold mb-2">📚 Flashcards</h1>
        <p className="text-white/60 mb-12">Click on a subject to study its flashcards</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subjects.map(sub => (
            <button
              key={sub.name}
              onClick={() => {
                setActiveSubject(sub.name);
                setCurrentCardIndex(0);
                setIsFlipped(false);
              }}
              className="glass-card p-6 hover:border-primary/50 hover:scale-[1.02] transition-all text-left group"
            >
              <h3 className="text-2xl font-bold font-heading mb-2 text-primary group-hover:text-white transition-colors">{sub.name}</h3>
              <p className="text-white/60">{sub.count} Cards Available</p>
            </button>
          ))}
          {subjects.length === 0 && (
            <p className="text-white/40 col-span-full text-center">No flashcards yet. Upload materials and generate them first!</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-3xl mx-auto">
      <Toaster position="top-right" toastOptions={{ style: { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}}/>
      
      <button
        onClick={() => setActiveSubject(null)}
        className="text-white/60 hover:text-white mb-8 flex items-center gap-2 transition-colors"
      >
        ← Back to Subjects
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold mb-2">{activeSubject}</h1>
        <p className="text-white/60">Card {currentCardIndex + 1} of {subjectCards.length}</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/5 h-2 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300" 
          style={{ width: `${((currentCardIndex + 1) / subjectCards.length) * 100}%` }}
        ></div>
      </div>

      {/* Flashcard */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="glass-card p-8 min-h-[400px] flex items-center justify-center cursor-pointer hover:border-primary/50 transition-all transform hover:scale-[1.02] mb-8"
      >
        <div className="text-center">
          <p className="text-sm text-white/50 uppercase tracking-widest mb-4">
            {isFlipped ? '📝 Answer' : '❓ Question'}
          </p>
          <h2 className="text-3xl font-heading font-bold leading-relaxed">
            {isFlipped ? currentCard?.answer : currentCard?.question}
          </h2>
          <p className="text-white/40 mt-6 text-sm">Click to flip</p>
        </div>
      </div>

      {/* Difficulty Controls */}
      <div className="glass-card p-6 mb-8">
        <p className="text-sm text-white/60 mb-3">Mark difficulty level:</p>
        <div className="flex gap-3">
          <button
            onClick={() => handleDifficultyChange('easy')}
            className={`px-4 py-2 rounded-lg transition-all ${
              difficulty[currentCard?._id] === 'easy'
                ? 'bg-green-500/30 border border-green-500/50 text-green-300'
                : 'bg-white/5 border border-white/10 hover:border-green-500/30 text-white/60 hover:text-white'
            }`}
          >
            🟢 Easy
          </button>
          <button
            onClick={() => handleDifficultyChange('medium')}
            className={`px-4 py-2 rounded-lg transition-all ${
              difficulty[currentCard?._id] === 'medium'
                ? 'bg-yellow-500/30 border border-yellow-500/50 text-yellow-300'
                : 'bg-white/5 border border-white/10 hover:border-yellow-500/30 text-white/60 hover:text-white'
            }`}
          >
            🟡 Medium
          </button>
          <button
            onClick={() => handleDifficultyChange('hard')}
            className={`px-4 py-2 rounded-lg transition-all ${
              difficulty[currentCard?._id] === 'hard'
                ? 'bg-red-500/30 border border-red-500/50 text-red-300'
                : 'bg-white/5 border border-white/10 hover:border-red-500/30 text-white/60 hover:text-white'
            }`}
          >
            🔴 Hard
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={handlePrev}
          disabled={currentCardIndex === 0}
          className="px-6 py-3 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-lg transition-all disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentCardIndex === subjectCards.length - 1}
          className="px-6 py-3 bg-primary hover:bg-primary/80 disabled:opacity-30 rounded-lg transition-all disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
