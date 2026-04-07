import React, { useState, useEffect, useRef } from 'react';

export default function PomodoroTimer() {
  const [mode, setMode] = useState('work');   // 'work' | 'break'
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  const TIMES = { work: 25 * 60, break: 5 * 60 };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            const next = mode === 'work' ? 'break' : 'work';
            setMode(next);
            setSeconds(TIMES[next]);
            new Audio('/notification.mp3').play().catch(() => {});
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  const progress = ((TIMES[mode] - seconds) / TIMES[mode]) * 100;

  return (
    <div className="glass-card p-6 text-center">
      <div className="flex gap-2 justify-center mb-4">
        {['work', 'break'].map(m => (
          <button key={m} onClick={() => { setMode(m); setSeconds(TIMES[m]); setRunning(false); }}
            className={`px-4 py-1.5 rounded-full text-sm capitalize transition-all
              ${mode === m ? 'bg-purple-500 text-white' : 'text-white/50 hover:text-white'}`}>
            {m === 'work' ? 'Focus' : 'Break'}
          </button>
        ))}
      </div>

      {/* Circular progress */}
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6"/>
          <circle cx="50" cy="50" r="45" fill="none"
            stroke={mode === 'work' ? '#a855f7' : '#14b8a6'} strokeWidth="6"
            strokeLinecap="round" strokeDasharray="283"
            strokeDashoffset={283 - (283 * progress) / 100}
            style={{ transition: 'stroke-dashoffset 1s linear' }}/>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-heading font-bold">{mins}:{secs}</span>
        </div>
      </div>

      <button onClick={() => setRunning(!running)}
        className="px-8 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500
          text-white font-medium hover:shadow-glow transition-all active:scale-95">
        {running ? 'Pause' : 'Start'}
      </button>
    </div>
  );
}
