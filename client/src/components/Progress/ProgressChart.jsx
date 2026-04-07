import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function ProgressChart({ data }) {
  if (!data) return <div className="text-white/50">Loading metrics...</div>;

  const difficultyData = [
    { name: 'Easy', value: data.easyCount, color: '#14b8a6' },
    { name: 'Medium', value: data.mediumCount, color: '#f59e0b' },
    { name: 'Hard', value: data.hardCount, color: '#ef4444' }
  ].filter(d => d.value > 0);

  const reviewCompletion = [
    { name: 'Reviewed', value: data.reviewedCards, color: '#a855f7' },
    { name: 'Unreviewed', value: Math.max(0, data.totalFlashcards - data.reviewedCards), color: 'rgba(255,255,255,0.1)' }
  ];

  // Map quiz scores into a unified chart
  const quizScores = data.quizScores.slice(-10).map((qs, i) => ({
     name: `Quiz ${i+1}`,
     percentage: (qs.score / qs.total) * 100,
     subject: qs.subject
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      {/* Cards Difficulty Breakdown */}
      <div className="glass-card p-6 flex flex-col items-center">
         <h3 className="text-lg mb-6 font-semibold w-full text-left">Difficulty Focus</h3>
         {difficultyData.length > 0 ? (
         <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={difficultyData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} stroke="rgba(255,255,255,0.1)">
                {difficultyData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }}/>
            </PieChart>
         </ResponsiveContainer>
         ) : <p className="text-white/30 my-auto text-sm">No flashcards rated yet.</p>}
      </div>

      {/* Completion Donut */}
      <div className="glass-card p-6 flex flex-col items-center">
         <h3 className="text-lg mb-6 font-semibold w-full text-left">Deck Review Completion</h3>
         {data.totalFlashcards > 0 ? (
         <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={reviewCompletion} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} stroke="rgba(255,255,255,0.1)">
                {reviewCompletion.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }}/>
            </PieChart>
         </ResponsiveContainer>
         ) : <p className="text-white/30 my-auto text-sm">No flashcards generated.</p>}
         {data.totalFlashcards > 0 && <span className="absolute mt-24 text-2xl font-bold font-heading">{Math.round((data.reviewedCards / data.totalFlashcards)*100)}%</span>}
      </div>

       {/* Quiz Scores */}
       <div className="glass-card p-6 md:col-span-2 lg:col-span-1 flex flex-col">
         <h3 className="text-lg mb-6 font-semibold w-full text-left">Recent Quiz Performance (%)</h3>
         {quizScores.length > 0 ? (
         <ResponsiveContainer width="100%" height={200}>
            <LineChart data={quizScores}>
               <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{fontSize: 12}} />
               <YAxis stroke="rgba(255,255,255,0.3)" tick={{fontSize: 12}} />
               <Tooltip contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }} />
               <Line type="monotone" dataKey="percentage" stroke="#ec4899" strokeWidth={3} dot={{r: 4, fill: '#ec4899'}} />
            </LineChart>
         </ResponsiveContainer>
         ) : <p className="text-white/30 my-auto text-center text-sm">No quizzes taken yet.</p>}
      </div>

    </div>
  );
}
