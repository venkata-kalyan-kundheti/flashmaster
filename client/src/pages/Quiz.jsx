import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import QuizMode from '../components/Flashcard/QuizMode';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Quiz() {
  const [flashcards, setFlashcards]       = useState([]);
  const [subjects, setSubjects]           = useState([]);
  const [activeSubject, setActiveSubject] = useState(null);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res   = await api.get('/flashcards');
        const cards = res.data;
        setFlashcards(cards);
        const uniqueSubjects = [...new Set(cards.map(c => c.subject))];
        setSubjects(uniqueSubjects.map(sub => ({
          name:  sub,
          count: cards.filter(c => c.subject === sub).length,
        })));
      } catch {
        toast.error('Failed to load flashcards');
      } finally {
        setLoading(false);
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
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8 max-w-5xl mx-auto">
        <LoadingSpinner message="Loading quizzes..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto">
      <h1 className="text-4xl font-heading font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
        Quiz Arena
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '48px', fontSize: '0.95rem' }}>
        Select a subject to start testing your knowledge. You need at least 4 flashcards to take a quiz.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subjects.map(sub => (
          <div
            key={sub.name}
            className="glass-card p-6 flex flex-col items-center justify-center text-center"
            style={{ transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <h3 className="text-2xl font-bold font-heading mb-2" style={{ color: '#8b5cf6' }}>{sub.name}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              {sub.count} Cards Available
            </p>
            <button
              onClick={() => setActiveSubject(sub.name)}
              disabled={sub.count < 4}
              style={{
                padding: '9px 28px',
                borderRadius: '999px',
                border: 'none',
                background: sub.count >= 4
                  ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                  : 'var(--surface)',
                color: sub.count >= 4 ? '#fff' : 'var(--text-muted)',
                fontWeight: 700,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '0.875rem',
                cursor: sub.count >= 4 ? 'pointer' : 'not-allowed',
                opacity: sub.count < 4 ? 0.45 : 1,
                boxShadow: sub.count >= 4 ? '0 4px 16px rgba(139,92,246,0.35)' : 'none',
                transition: 'all 0.18s',
              }}
              onMouseEnter={e => { if (sub.count >= 4) { e.currentTarget.style.transform = 'scale(1.05)'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {sub.count >= 4 ? 'Start Quiz' : 'Need more cards'}
            </button>
          </div>
        ))}
        {subjects.length === 0 && (
          <p className="col-span-full text-center py-12" style={{ color: 'var(--text-muted)' }}>
            No topics available. Upload materials or generate flashcards first.
          </p>
        )}
      </div>
    </div>
  );
}
