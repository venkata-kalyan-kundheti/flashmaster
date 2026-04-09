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

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-heading font-bold mb-2 text-center">Trophy Room</h1>
      <p className="text-white/60 mb-12 text-center">Top 10 students with the highest reviewed cards score.</p>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 text-xs tracking-widest text-white/50 uppercase font-semibold">Rank</th>
              <th className="px-6 py-4 text-xs tracking-widest text-white/50 uppercase font-semibold">Student</th>
              <th className="px-6 py-4 text-xs tracking-widest text-white/50 uppercase font-semibold text-right">Cards Reviewed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {leaders.map((student, i) => {
               let crown = '';
               if (i === 0) crown = '👑';
               if (i === 1) crown = '🥈';
               if (i === 2) crown = '🥉';

               return (
                <tr key={student._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-lg font-heading font-bold">
                     {crown} {i > 2 && `#${i+1}`}
                  </td>
                  <td className="px-6 py-4 font-semibold">
                     {student.userId?.name || 'Anonymous User'}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-primary">
                     {student.reviewedCards}
                  </td>
                </tr>
               )
            })}
            {leaders.length === 0 && (
                <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-white/40">No rank data available yet.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
