import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import ProgressChart from '../components/Progress/ProgressChart';

const statCards = [
  { label: 'Total Cards',   key: d => d?.totalFlashcards || 0,                                             color: 'var(--text-primary)',   accent: null },
  { label: 'Reviewed',      key: d => d?.reviewedCards || 0,                                               color: '#8b5cf6',               accent: 'rgba(139,92,246,0.12)' },
  { label: 'Study Time',    key: d => `${Math.floor((d?.studyMinutes||0)/60)}h ${(d?.studyMinutes||0)%60}m`, color: '#14b8a6',             accent: 'rgba(20,184,166,0.10)' },
  { label: 'Quizzes Taken', key: d => d?.quizScores?.length || 0,                                         color: '#ec4899',               accent: 'rgba(236,72,153,0.10)' },
];

export default function Progress() {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/progress');
        setData(res.data);
      } catch { console.error('Failed to grab progress data'); }
    })();
  }, []);

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <h1
        className="text-4xl font-heading font-bold mb-8"
        style={{ color: 'var(--text-primary)' }}
      >
        Performance &amp; Progress
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, key, color, accent }) => (
          <div
            key={label}
            className="glass-card p-4 text-center"
            style={accent ? { borderColor: accent.replace('0.1', '0.25') } : {}}
          >
            <span
              className="text-xs uppercase tracking-widest block mb-2 font-semibold"
              style={{ color: 'var(--text-muted)' }}
            >
              {label}
            </span>
            <span
              className="text-3xl font-bold font-heading"
              style={{ color }}
            >
              {key(data)}
            </span>
          </div>
        ))}
      </div>

      <ProgressChart data={data} />
    </div>
  );
}
