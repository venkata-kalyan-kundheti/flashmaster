import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import ProgressChart from '../components/Progress/ProgressChart';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Progress() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     const fetchData = async () => {
         try {
             const res = await api.get('/progress');
             setData(res.data);
         } catch(err) {
             console.error('Failed to grab progress data');
         } finally {
             setLoading(false);
         }
     };
     fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-8 max-w-6xl mx-auto">
        <LoadingSpinner message="Loading progress data..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-4xl font-heading font-bold mb-8 text-th-text">Performance & Progress</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
         <div className="glass-card p-4 text-center">
            <span className="text-th-muted text-sm uppercase tracking-widest block mb-1">Total Cards</span>
            <span className="text-3xl font-bold font-heading text-th-text">{data?.totalFlashcards || 0}</span>
         </div>
         <div className="glass-card p-4 text-center">
            <span className="text-th-muted text-sm uppercase tracking-widest block mb-1">Reviewed</span>
            <span className="text-3xl font-bold font-heading text-primary">{data?.reviewedCards || 0}</span>
         </div>
         <div className="glass-card p-4 text-center">
            <span className="text-th-muted text-sm uppercase tracking-widest block mb-1">Study Time</span>
            <span className="text-3xl font-bold font-heading text-secondary">{Math.floor((data?.studyMinutes || 0) / 60)}h {(data?.studyMinutes || 0)%60}m</span>
         </div>
         <div className="glass-card p-4 text-center">
            <span className="text-th-muted text-sm uppercase tracking-widest block mb-1">Quizzes Taken</span>
            <span className="text-3xl font-bold font-heading text-accent">{data?.quizScores?.length || 0}</span>
         </div>
      </div>

      <ProgressChart data={data} />
    </div>
  );
}
