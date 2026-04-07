import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import PomodoroTimer from '../components/Pomodoro/PomodoroTimer';
import { useNavigate } from 'react-router-dom';

export default function StudentHome() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto space-y-8">
      <div className="glass-card p-10 flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <div>
          <h1 className="text-4xl font-heading font-black mb-2">Welcome back, {user?.name}! 👋</h1>
          <p className="text-lg text-white/70 tracking-wide max-w-xl">
             Ready to crush your exams? You have a <strong>{user?.streak || 0} day streak</strong> going. 
             Review your flashcards or start a focused study session now!
          </p>
          <div className="flex gap-4 mt-6">
             <button onClick={() => navigate('/materials')} className="px-6 py-2 bg-gradient-to-r from-primary to-accent rounded-full text-white font-semibold hover:scale-105 shadow-glow transition-all">Upload Material</button>
             <button onClick={() => navigate('/quiz')} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white font-semibold border border-white/20 transition-all">Take Quiz</button>
          </div>
        </div>
        <div>
           <PomodoroTimer />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div onClick={() => navigate('/studyplan')} className="glass-card p-6 hover:border-primary/50 cursor-pointer transition-colors group">
            <h3 className="text-xl font-heading font-bold mb-2 group-hover:text-primary transition-colors">📅 Study Planner</h3>
            <p className="text-sm text-white/50">Auto-schedule your chapters before exam day.</p>
         </div>
         <div onClick={() => navigate('/progress')} className="glass-card p-6 hover:border-secondary/50 cursor-pointer transition-colors group">
            <h3 className="text-xl font-heading font-bold mb-2 group-hover:text-secondary transition-colors">📊 Progress</h3>
            <p className="text-sm text-white/50">Track your learning curve and quiz scores.</p>
         </div>
         <div onClick={() => navigate('/leaderboard')} className="glass-card p-6 hover:border-accent/50 cursor-pointer transition-colors group">
            <h3 className="text-xl font-heading font-bold mb-2 group-hover:text-accent transition-colors">🏆 Leaderboard</h3>
            <p className="text-sm text-white/50">See where you stand against top students.</p>
         </div>
      </div>
    </div>
  );
}
