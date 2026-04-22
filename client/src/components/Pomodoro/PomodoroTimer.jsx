import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';

export default function PomodoroTimer() {
  const [mode,    setMode]    = useState('work');
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const intervalRef           = useRef(null);

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
            new Audio('/notification.mp3').play().catch(() => {});
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const mins     = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs     = String(seconds % 60).padStart(2, '0');
  const progress = ((TIMES[mode] - seconds) / TIMES[mode]) * 100;
  const accent   = mode === 'work' ? '#8b5cf6' : '#14b8a6';
  const glowClr  = mode === 'work' ? 'rgba(139,92,246,0.35)' : 'rgba(20,184,166,0.3)';

  return (
    <div
      className="glass-card p-6 text-center"
      style={{ minWidth: '200px' }}
    >
      {/* Mode Tabs */}
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '20px' }}>
        {[
          { key: 'work',  label: 'Focus'  },
          { key: 'break', label: 'Break'  },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setMode(key); setSeconds(TIMES[key]); setRunning(false); }}
            style={{
              padding: '5px 16px',
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: mode === key
                ? (key === 'work' ? 'rgba(139,92,246,0.25)' : 'rgba(20,184,166,0.22)')
                : 'var(--surface)',
              color: mode === key ? (key === 'work' ? '#a78bfa' : '#34d399') : 'var(--text-muted)',
              border: `1px solid ${mode === key
                ? (key === 'work' ? 'rgba(139,92,246,0.4)' : 'rgba(20,184,166,0.4)')
                : 'var(--border)'}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Circular Timer */}
      <div style={{ position: 'relative', width: '128px', height: '128px', margin: '0 auto 20px' }}>
        <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="var(--surface)" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="45" fill="none"
            stroke={accent} strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="283"
            strokeDashoffset={283 - (283 * progress) / 100}
            style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 6px ${glowClr})` }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span
            className="font-heading font-bold"
            style={{ fontSize: '1.6rem', color: 'var(--text-primary)', letterSpacing: '0.03em' }}
          >
            {mins}:{secs}
          </span>
        </div>
      </div>

      {/* Start / Pause */}
      <button
        onClick={() => setRunning(r => !r)}
        style={{
          padding: '10px 32px',
          borderRadius: '999px',
          border: 'none',
          background: `linear-gradient(135deg, ${mode === 'work' ? '#6d28d9, #8b5cf6' : '#0f766e, #14b8a6'})`,
          color: '#fff',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700,
          fontSize: '0.9rem',
          cursor: 'pointer',
          boxShadow: `0 4px 16px ${glowClr}`,
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.boxShadow = `0 6px 22px ${glowClr}`; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = `0 4px 16px ${glowClr}`; }}
        onMouseDown={e  => { e.currentTarget.style.transform = 'scale(0.96)'; }}
        onMouseUp={e    => { e.currentTarget.style.transform = 'scale(1.06)'; }}
      >
        {running ? '⏸ Pause' : '▶ Start'}
      </button>
    </div>
  );
}
