import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function QuizMode({ subject, flashcards, onFinish }) {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  useEffect(() => {
    if (flashcards.length < 4) return;
    
    // Generate options for current question
    const currentCard = flashcards[currentQIndex];
    if (!currentCard) return;

    const wrongPool = flashcards.filter((f, i) => i !== currentQIndex).map(f => f.answer);
    const selectedWrong = shuffle(wrongPool).slice(0, 3);
    const allOptions = shuffle([currentCard.answer, ...selectedWrong]);
    
    setOptions(allOptions);
    setSelectedOpt(null);
  }, [currentQIndex, flashcards]);

  const handleSelect = (opt) => {
    if (selectedOpt) return; // Prevent multiple clicks
    setSelectedOpt(opt);

    const isCorrect = opt === flashcards[currentQIndex].answer;
    if (isCorrect) setScore(s => s + 1);

    setTimeout(() => {
      if (currentQIndex < flashcards.length - 1) {
        setCurrentQIndex(currentQIndex + 1);
      } else {
        finishQuiz(isCorrect ? score + 1 : score);
      }
    }, 1500);
  };

  const finishQuiz = async (finalScore) => {
    setIsFinished(true);
    try {
      await api.post('/progress/quiz-score', {
        subject,
        score: finalScore,
        total: flashcards.length
      });
      toast.success('Score saved!');
    } catch(err) {
      toast.error('Failed to save score');
    }
  };

  if (flashcards.length < 4) {
    return <div className="text-center p-8 text-white/50">You need at least 4 flashcards in this subject to take a quiz.</div>;
  }

  if (isFinished) {
    const percentage = (score / flashcards.length) * 100;
    let grade = 'F';
    let color = 'text-red-400';
    if (percentage >= 90) { grade = 'A'; color = 'text-primary'; }
    else if (percentage >= 70) { grade = 'B'; color = 'text-secondary'; }
    else if (percentage >= 50) { grade = 'C'; color = 'text-accent'; }

    return (
      <div className="glass-card p-12 text-center max-w-lg mx-auto transform transition-all animate-in fade-in zoom-in">
        <h2 className="text-3xl font-heading mb-2 text-white">Quiz Completed!</h2>
        <p className="text-white/60 mb-8">Subject: {subject}</p>
        <div className={`text-8xl font-bold font-heading mb-6 ${color} drop-shadow-glow`}>{grade}</div>
        <p className="text-xl mb-8 border-t border-white/10 pt-6">Score: <strong>{score} / {flashcards.length}</strong> ({percentage.toFixed(0)}%)</p>
        <button onClick={onFinish} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all">Back to Quizzes</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="mb-8 flex justify-between items-center text-white/50 text-sm font-semibold tracking-wider">
        <span className="uppercase">{subject}</span>
        <span>Question {currentQIndex + 1} of {flashcards.length}</span>
      </div>

      <div className="w-full bg-white/5 h-2 rounded-full mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 h-full bg-primary transition-all duration-300" style={{ width: `${((currentQIndex)/flashcards.length)*100}%`}}></div>
      </div>

      <div className="glass-card p-10 mb-8 min-h-[200px] flex items-center justify-center">
        <h2 className="text-3xl font-heading text-center leading-relaxed">{flashcards[currentQIndex]?.question}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((opt, i) => {
          let btnClass = "bg-white/5 border-white/10 hover:border-primary/50 hover:bg-white/10 text-white/80";
          
          if (selectedOpt) {
             const isCorrectChoice = opt === flashcards[currentQIndex].answer;
             if (isCorrectChoice) {
               btnClass = "bg-secondary/20 border-secondary text-secondary shadow-glow-teal";
             } else if (opt === selectedOpt) {
               btnClass = "bg-red-500/20 border-red-500 text-red-300";
             } else {
               btnClass = "bg-white/5 border-white/10 text-white/30";
             }
          }

          return (
            <button 
              key={i} 
              onClick={() => handleSelect(opt)}
              disabled={!!selectedOpt}
              className={`p-6 rounded-xl border text-left transition-all duration-300 min-h-[100px] flex items-center line-clamp-3 ${btnClass}`}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  );
}
