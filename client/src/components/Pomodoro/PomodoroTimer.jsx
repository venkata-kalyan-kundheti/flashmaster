import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';

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
            // Log study time when a work session completes
            if (mode === 'work') {
              api.post('/progress/study-time', { minutes: 25 }).catch(() => {});
            }
            setMode(next);
            setSeconds(TIMES[next]);
            new Audio('/notification.mp3').play().catch(() => { });
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
            className={`btn btn-sm btn-pill capitalize transition-all
              ${mode === m ? 'bg-primary text-white border-primary' : 'btn-ghost'}`}>
            {m === 'work' ? 'Focus' : 'Break'}
          </button>
        ))}
      </div>

      {/* Circular progress */}
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgb(var(--th-surface) / 0.1)" strokeWidth="6" />
          <circle cx="50" cy="50" r="45" fill="none"
            stroke={mode === 'work' ? '#a855f7' : '#14b8a6'} strokeWidth="6"
            strokeLinecap="round" strokeDasharray="283"
            strokeDashoffset={283 - (283 * progress) / 100}
            style={{ transition: 'stroke-dashoffset 1s linear' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-heading font-bold text-th-text">{mins}:{secs}</span>
        </div>
      </div>

      <button onClick={() => setRunning(!running)}
        className="btn btn-primary btn-pill">
        {running ? 'Pause' : 'Start'}
      </button>
    </div>
  );
}
