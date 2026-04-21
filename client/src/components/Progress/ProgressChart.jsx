import React from 'react';
import {
  PieChart, Pie, Cell,
  LineChart, Line,
  XAxis, YAxis, Tooltip,
  ResponsiveContainer,
} from 'recharts';

/* Theme-aware tooltip style — reads CSS variables at render time */
const tooltipStyle = {
  background: 'var(--navbar-bg)',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  color: 'var(--text-primary)',
  fontSize: '0.82rem',
  backdropFilter: 'blur(12px)',
};

const chartTitle = {
  fontSize: '1rem',
  fontWeight: 700,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  color: 'var(--text-primary)',
  marginBottom: '20px',
};

const emptyMsg = {
  color: 'var(--text-muted)',
  fontSize: '0.875rem',
  textAlign: 'center',
  margin: 'auto',
  paddingTop: '24px',
};

export default function ProgressChart({ data }) {
  if (!data) return (
    <div style={{ color: 'var(--text-muted)', padding: '24px' }}>Loading metrics…</div>
  );

  const difficultyData = [
    { name: 'Easy',   value: data.easyCount,   color: '#34d399' },
    { name: 'Medium', value: data.mediumCount,  color: '#fbbf24' },
    { name: 'Hard',   value: data.hardCount,    color: '#f87171' },
  ].filter(d => d.value > 0);

  const reviewCompletion = [
    { name: 'Reviewed',   value: data.reviewedCards,                                            color: '#8b5cf6' },
    { name: 'Unreviewed', value: Math.max(0, data.totalFlashcards - data.reviewedCards),        color: 'rgba(139,92,246,0.15)' },
  ];

  const quizScores = data.quizScores.slice(-10).map((qs, i) => ({
    name:       `Q${i + 1}`,
    percentage: Math.round((qs.score / qs.total) * 100),
    subject:    qs.subject,
  }));

  /* Tick style shared by both axes */
  const tick = { fill: 'var(--text-muted)', fontSize: 11 };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

      {/* ── Difficulty Breakdown ─────────────────────────────── */}
      <div className="glass-card p-6 flex flex-col">
        <h3 style={chartTitle}>Difficulty Focus</h3>
        {difficultyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={difficultyData} dataKey="value" nameKey="name"
                cx="50%" cy="50%" innerRadius={58} outerRadius={80}
                stroke="none"
              >
                {difficultyData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p style={emptyMsg}>No flashcards rated yet.</p>
        )}

        {/* Legend */}
        {difficultyData.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '12px' }}>
            {difficultyData.map(d => (
              <span key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, display: 'inline-block' }} />
                {d.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Completion Donut ─────────────────────────────────── */}
      <div className="glass-card p-6 flex flex-col" style={{ position: 'relative' }}>
        <h3 style={chartTitle}>Deck Review Completion</h3>
        {data.totalFlashcards > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={reviewCompletion} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" innerRadius={58} outerRadius={80}
                  stroke="none"
                >
                  {reviewCompletion.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, 10px)',
              textAlign: 'center',
              pointerEvents: 'none',
            }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#8b5cf6', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {Math.round((data.reviewedCards / data.totalFlashcards) * 100)}%
              </span>
            </div>
          </>
        ) : (
          <p style={emptyMsg}>No flashcards generated.</p>
        )}
      </div>

      {/* ── Quiz Performance Line Chart ──────────────────────── */}
      <div className="glass-card p-6 md:col-span-2 lg:col-span-1 flex flex-col">
        <h3 style={chartTitle}>Recent Quiz Performance (%)</h3>
        {quizScores.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={quizScores} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <XAxis dataKey="name" tick={tick} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={tick} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v) => [`${v}%`, 'Score']}
              />
              <Line
                type="monotone" dataKey="percentage"
                stroke="#ec4899" strokeWidth={2.5}
                dot={{ r: 4, fill: '#ec4899', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#ec4899', boxShadow: '0 0 10px rgba(236,72,153,0.5)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p style={emptyMsg}>No quizzes taken yet. Start one now!</p>
        )}
      </div>

    </div>
  );
}
