import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const res = await api.get('/leaderboard');
        setLeaders(res.data);
      } catch {
        toast.error('Failed to load leaderboard');
      }
    };
    fetchLeaders();
  }, []);

  const medals = ['👑', '🥈', '🥉'];

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-heading font-bold mb-2 text-center" style={{ color: 'var(--text-primary)' }}>
        Trophy Room
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '48px', textAlign: 'center', fontSize: '0.95rem' }}>
        Top 10 students with the highest reviewed cards score.
      </p>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
              {['Rank', 'Student', 'Cards Reviewed'].map((h, i) => (
                <th
                  key={h}
                  style={{
                    padding: '14px 24px',
                    fontSize: '0.7rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textAlign: i === 2 ? 'right' : 'left',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leaders.map((student, i) => (
              <tr
                key={student._id}
                style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '16px 24px', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {i < 3 ? medals[i] : `#${i + 1}`}
                </td>
                <td style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {student.userId?.name || 'Anonymous User'}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 700, color: '#8b5cf6', fontSize: '1rem' }}>
                  {student.reviewedCards}
                </td>
              </tr>
            ))}
            {leaders.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}
                >
                  No rank data available yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
