import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import PomodoroTimer from '../components/Pomodoro/PomodoroTimer';
import { useNavigate } from 'react-router-dom';

export default function StudentHome() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
      <div className="glass-card p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-black mb-2 text-th-text">Welcome back, {user?.name}! 👋</h1>
          <p className="text-base sm:text-lg text-th-muted tracking-wide max-w-xl">
             Ready to crush your exams? You have a <strong className="text-th-text">{user?.streak || 0} day streak</strong> going. 
             Review your flashcards or start a focused study session now!
          </p>
          <div className="flex gap-4 mt-6">
             <button onClick={() => navigate('/materials')} className="btn btn-primary btn-pill">Upload Material</button>
             <button onClick={() => navigate('/quiz')} className="btn btn-secondary btn-pill">Take Quiz</button>
          </div>
        </div>
        <div>
           <PomodoroTimer />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div onClick={() => navigate('/studyplan')} className="glass-card p-6 hover:border-primary/50 cursor-pointer transition-all group hover:-translate-y-1">
            <h3 className="text-xl font-heading font-bold mb-2 group-hover:text-primary transition-colors text-th-text">📅 Gemini Study Planner</h3>
            <p className="text-sm text-th-muted">Generate a Gemini-powered study schedule before exam day.</p>
         </div>
         <div onClick={() => navigate('/progress')} className="glass-card p-6 hover:border-secondary/50 cursor-pointer transition-all group hover:-translate-y-1">
            <h3 className="text-xl font-heading font-bold mb-2 group-hover:text-secondary transition-colors text-th-text">📊 Progress</h3>
            <p className="text-sm text-th-muted">Track your learning curve and quiz scores.</p>
         </div>
         <div onClick={() => navigate('/leaderboard')} className="glass-card p-6 hover:border-accent/50 cursor-pointer transition-all group hover:-translate-y-1">
            <h3 className="text-xl font-heading font-bold mb-2 group-hover:text-accent transition-colors text-th-text">🏆 Leaderboard</h3>
            <p className="text-sm text-th-muted">See where you stand against top students.</p>
         </div>
      </div>
    </div>
  );
}
