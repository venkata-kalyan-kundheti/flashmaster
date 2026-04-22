import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import QuizMode from '../components/Flashcard/QuizMode';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Quiz() {
  const [flashcards, setFlashcards] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [activeSubject, setActiveSubject] = useState(null);
  const [loading, setLoading] = useState(true);

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
       } finally {
          setLoading(false);
       }
    };
    fetchCards();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-8 max-w-5xl mx-auto">
        <LoadingSpinner message="Loading quiz topics..." />
      </div>
    );
  }

  if (activeSubject) {
     return (
        <div className="min-h-screen p-4 sm:p-8 flex items-center justify-center">
           <QuizMode 
              subject={activeSubject} 
              flashcards={flashcards.filter(f => f.subject === activeSubject)} 
              onFinish={() => setActiveSubject(null)} 
           />
        </div>
     )
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-5xl mx-auto">
      <h1 className="text-4xl font-heading font-bold mb-2 text-th-text">Quiz Arena</h1>
      <p className="text-th-muted mb-12">Select a subject to start testing your knowledge. You need at least 4 flashcards to take a quiz.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {subjects.map(sub => (
            <div key={sub.name} className="glass-card p-6 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-all group">
               <h3 className="text-2xl font-bold font-heading mb-2 text-primary">{sub.name}</h3>
               <p className="text-sm text-th-muted mb-6">{sub.count} Cards Available</p>
               <button 
                  onClick={() => setActiveSubject(sub.name)}
                  disabled={sub.count < 4}
                  className="btn btn-primary btn-pill disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed disabled:hover:transform-none"
               >
                 {sub.count >= 4 ? 'Start Quiz' : 'Need more cards'}
               </button>
            </div>
         ))}
         {subjects.length === 0 && <p className="text-th-muted col-span-full">No topics available. Upload materials or generate flashcards first.</p>}
      </div>
    </div>
  );
}
