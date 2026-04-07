import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProgressChart from '../components/Progress/ProgressChart';

export default function Progress() {
  const [data, setData] = useState(null);

  useEffect(() => {
     const fetchData = async () => {
         try {
             const res = await axios.get(`${import.meta.env.VITE_API_URL}/progress`, {
                 headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
             });
             setData(res.data);
         } catch(err) {
             console.error('Failed to grab progress data');
         }
     };
     fetchData();
  }, []);

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-4xl font-heading font-bold mb-8">Performance & Progress</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
         <div className="glass-card p-4 text-center">
            <span className="text-white/60 text-sm uppercase tracking-widest block mb-1">Total Cards</span>
            <span className="text-3xl font-bold font-heading">{data?.totalFlashcards || 0}</span>
         </div>
         <div className="glass-card p-4 text-center">
            <span className="text-white/60 text-sm uppercase tracking-widest block mb-1">Reviewed</span>
            <span className="text-3xl font-bold font-heading text-primary">{data?.reviewedCards || 0}</span>
         </div>
         <div className="glass-card p-4 text-center">
            <span className="text-white/60 text-sm uppercase tracking-widest block mb-1">Study Time</span>
            <span className="text-3xl font-bold font-heading text-secondary">{Math.floor((data?.studyMinutes || 0) / 60)}h {(data?.studyMinutes || 0)%60}m</span>
         </div>
         <div className="glass-card p-4 text-center">
            <span className="text-white/60 text-sm uppercase tracking-widest block mb-1">Quizzes Taken</span>
            <span className="text-3xl font-bold font-heading text-accent">{data?.quizScores?.length || 0}</span>
         </div>
      </div>

      <ProgressChart data={data} />
    </div>
  );
}
