import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import PomodoroTimer from '../components/Pomodoro/PomodoroTimer';
import { useNavigate } from 'react-router-dom';

export default function StudentHome() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const cards = [
    {
      icon: '📅',
      title: 'Study Planner',
      description: 'Auto-schedule your chapters before exam day.',
      path: '/studyplan',
      accent: '#8b5cf6',
      accentBg: 'rgba(139,92,246,0.08)',
      accentBorder: 'rgba(139,92,246,0.25)',
    },
    {
      icon: '📊',
      title: 'Progress',
      description: 'Track your learning curve and quiz scores.',
      path: '/progress',
      accent: '#14b8a6',
      accentBg: 'rgba(20,184,166,0.08)',
      accentBorder: 'rgba(20,184,166,0.25)',
    },
    {
      icon: '🏆',
      title: 'Leaderboard',
      description: 'See where you stand against top students.',
      path: '/leaderboard',
      accent: '#ec4899',
      accentBg: 'rgba(236,72,153,0.08)',
      accentBorder: 'rgba(236,72,153,0.25)',
    },
  ];

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <div
        className="glass-card p-10 flex flex-col md:flex-row items-center justify-between gap-8"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(236,72,153,0.08) 100%)',
          borderColor: 'rgba(139,92,246,0.2)',
        }}
      >
        <div>
          <h1
            className="text-4xl font-heading font-black mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Welcome back, {user?.name}! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.65', maxWidth: '480px' }}>
            Ready to crush your exams? You have a{' '}
            <strong style={{ color: '#8b5cf6' }}>{user?.streak || 0} day streak</strong> going.
            Review your flashcards or start a focused study session now!
          </p>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/materials')}
              style={{
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                border: 'none',
                borderRadius: '999px',
                color: '#fff',
                fontWeight: 700,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(139,92,246,0.4)',
                transition: 'transform 0.18s, box-shadow 0.18s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(139,92,246,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(139,92,246,0.4)'; }}
            >
              Upload Material
            </button>

            <button
              onClick={() => navigate('/quiz')}
              style={{
                padding: '10px 24px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '999px',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.18s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              Take a Quiz
            </button>
          </div>
        </div>

        <PomodoroTimer />
      </div>

      {/* ── Quick-Access Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map(({ icon, title, description, path, accent, accentBg, accentBorder }) => (
          <div
            key={path}
            onClick={() => navigate(path)}
            className="glass-card p-6 cursor-pointer"
            style={{ transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s' }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = accentBorder;
              e.currentTarget.style.boxShadow = `0 8px 32px ${accentBg}`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'var(--card-shadow)';
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: accentBg,
                border: `1px solid ${accentBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                marginBottom: '14px',
              }}
            >
              {icon}
            </div>
            <h3
              className="text-xl font-heading font-bold mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              {title}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.55' }}>
              {description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
