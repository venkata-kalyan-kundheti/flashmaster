import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import QuizMode from '../components/Flashcard/QuizMode';

export default function Quiz() {
  const [flashcards, setFlashcards] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [activeSubject, setActiveSubject] = useState(null);

  useEffect(() => {
    const fetchCards = async () => {
       try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/flashcards`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
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

  if (activeSubject) {
     return (
        <div className="min-h-screen p-8 flex items-center justify-center">
           <QuizMode 
              subject={activeSubject} 
              flashcards={flashcards.filter(f => f.subject === activeSubject)} 
              onFinish={() => setActiveSubject(null)} 
           />
        </div>
     )
  }

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto">
      <h1 className="text-4xl font-heading font-bold mb-2">Quiz Arena</h1>
      <p className="text-white/60 mb-12">Select a subject to start testing your knowledge. You need at least 4 flashcards to take a quiz.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {subjects.map(sub => (
            <div key={sub.name} className="glass-card p-6 flex flex-col items-center justify-center text-center hover:scale-[1.02] transition-all group">
               <h3 className="text-2xl font-bold font-heading mb-2 text-primary">{sub.name}</h3>
               <p className="text-sm text-white/50 mb-6">{sub.count} Cards Available</p>
               <button 
                  onClick={() => setActiveSubject(sub.name)}
                  disabled={sub.count < 4}
                  className="px-6 py-2 bg-gradient-to-r from-primary to-accent rounded-full text-white font-semibold disabled:opacity-30 disabled:grayscale transition-all shadow-glass"
               >
                 {sub.count >= 4 ? 'Start Quiz' : 'Need more cards'}
               </button>
            </div>
         ))}
         {subjects.length === 0 && <p className="text-white/40 col-span-full">No topics available. Upload materials or generate flashcards first.</p>}
      </div>
    </div>
  );
}
