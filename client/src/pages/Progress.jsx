import React, { useEffect, useRef, useState } from 'react';
import api from '../utils/api';
import ProgressChart from '../components/Progress/ProgressChart';
import LoadingSpinner from '../components/LoadingSpinner';
import { STUDY_TIME_RECORDED_EVENT, usePomodoro } from '../context/PomodoroContext';

const formatHMS = (totalSeconds) => {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function Progress() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentRecordedSeconds, setRecentRecordedSeconds] = useState(0);
  const serverStudySecondsRef = useRef(0);
  const { currentFocusElapsedSec } = usePomodoro();

  const storedStudySeconds = Math.max(0, Math.floor((data?.studyMinutes || 0) * 60));
  const totalStudySeconds = storedStudySeconds + recentRecordedSeconds + currentFocusElapsedSec;

  const statCards = [
    { label: 'Total Cards', value: data?.totalFlashcards || 0, color: 'var(--text-primary)', accent: null },
    { label: 'Reviewed', value: data?.reviewedCards || 0, color: '#8b5cf6', accent: 'rgba(139,92,246,0.12)' },
    { label: 'Study Time', value: formatHMS(totalStudySeconds), color: '#14b8a6', accent: 'rgba(20,184,166,0.10)' },
    { label: 'Quizzes Taken', value: data?.quizScores?.length || 0, color: '#ec4899', accent: 'rgba(236,72,153,0.10)' },
  ];

  useEffect(() => {
    const fetchProgress = async (silent = false) => {
      try {
        const res = await api.get('/progress');

        const nextStudySeconds = Math.max(0, Math.floor((res.data?.studyMinutes || 0) * 60));
        const syncedDelta = Math.max(0, nextStudySeconds - serverStudySecondsRef.current);
        serverStudySecondsRef.current = nextStudySeconds;

        if (syncedDelta > 0) {
          setRecentRecordedSeconds((prev) => Math.max(0, prev - syncedDelta));
        }

        setData(res.data);
      } catch { console.error('Failed to grab progress data'); }
      finally {
        if (!silent) setLoading(false);
      }
    };

    fetchProgress();

    const interval = setInterval(() => {
      fetchProgress(true);
    }, 15000);

    const handleStudyTimeRecorded = (event) => {
      const seconds = Number(event?.detail?.seconds);
      if (Number.isFinite(seconds) && seconds > 0) {
        setRecentRecordedSeconds((prev) => prev + Math.floor(seconds));
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchProgress(true);
      }
    };

    window.addEventListener(STUDY_TIME_RECORDED_EVENT, handleStudyTimeRecorded);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener(STUDY_TIME_RECORDED_EVENT, handleStudyTimeRecorded);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-8 max-w-6xl mx-auto">
        <LoadingSpinner message="Loading your progress..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <h1
        className="text-4xl font-heading font-bold mb-8"
        style={{ color: 'var(--text-primary)' }}
      >
        Performance &amp; Progress
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, color, accent }) => (
          <div
            key={label}
            className="glass-card p-4 text-center"
            style={accent ? { borderColor: accent.replace('0.1', '0.25') } : {}}
          >
            <span
              className="text-xs uppercase tracking-widest block mb-2 font-semibold"
              style={{ color: 'var(--text-muted)' }}
            >
              {label}
            </span>
            <span
              className="text-3xl font-bold font-heading"
              style={{ color }}
            >
              {value}
            </span>
            {label === 'Study Time' && (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '6px' }}>
                HH:MM:SS
              </div>
            )}
          </div>
        ))}
      </div>

      <ProgressChart data={data} />
    </div>
  );
}
