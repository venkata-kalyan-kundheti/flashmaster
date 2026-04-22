import React, { useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const fieldStyle = (focused) => ({
  width: '100%',
  background: 'var(--input-bg)',
  border: `1px solid ${focused ? 'var(--border-focus)' : 'var(--border)'}`,
  borderRadius: '10px',
  padding: '11px 14px',
  color: 'var(--input-text)',
  fontSize: '0.875rem',
  outline: 'none',
  transition: 'border-color 0.2s',
  fontFamily: "'Inter', sans-serif",
});

const labelStyle = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--label-color)',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

export default function PlanForm({ onPlanCreated }) {
  const [subject,       setSubject]       = useState('');
  const [examDate,      setExamDate]      = useState('');
  const [dailyHours,    setDailyHours]    = useState('');
  const [chaptersInput, setChaptersInput] = useState('');
  const [focus,         setFocus]         = useState({});

  const onF = k => setFocus(f => ({ ...f, [k]: true  }));
  const onB = k => setFocus(f => ({ ...f, [k]: false }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !examDate || !dailyHours || !chaptersInput)
      return toast.error('Please fill all fields');

    const chapters = chaptersInput
      .split(',')
      .map(c => ({ name: c.trim() }))
      .filter(c => c.name !== '');

    const loadingToast = toast.loading('Generating schedule...');
    try {
      const res = await api.post('/studyplans', {
        subject,
        examDate,
        dailyStudyHours: Number(dailyHours),
        chapters,
      });
      toast.success('Study Plan Created!', { id: loadingToast });
      onPlanCreated(res.data);
      setSubject(''); setExamDate(''); setDailyHours(''); setChaptersInput('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create plan', { id: loadingToast });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3
        className="text-xl font-heading font-semibold"
        style={{ color: '#8b5cf6', marginBottom: '4px' }}
      >
        Create New Plan
      </h3>

      <div>
        <label style={labelStyle}>Subject</label>
        <input
          value={subject} onChange={e => setSubject(e.target.value)}
          type="text" placeholder="e.g. History"
          style={fieldStyle(focus.s)}
          onFocus={() => onF('s')} onBlur={() => onB('s')}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label style={labelStyle}>Exam Date</label>
          <input
            value={examDate} onChange={e => setExamDate(e.target.value)}
            type="date"
            style={fieldStyle(focus.d)}
            onFocus={() => onF('d')} onBlur={() => onB('d')}
          />
        </div>
        <div>
          <label style={labelStyle}>Daily Hours</label>
          <input
            value={dailyHours} onChange={e => setDailyHours(e.target.value)}
            type="number" min="1" max="16" placeholder="e.g. 2"
            style={fieldStyle(focus.h)}
            onFocus={() => onF('h')} onBlur={() => onB('h')}
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Chapters (comma separated)</label>
        <textarea
          value={chaptersInput} onChange={e => setChaptersInput(e.target.value)}
          rows="3" placeholder="Intro, Chapter 1, Advanced Topics..."
          style={{ ...fieldStyle(focus.c), resize: 'none' }}
          onFocus={() => onF('c')} onBlur={() => onB('c')}
        />
      </div>

      <button
        type="submit"
        style={{
          width: '100%',
          padding: '12px',
          background: 'linear-gradient(135deg, #6d28d9, #8b5cf6, #ec4899)',
          border: 'none',
          borderRadius: '12px',
          color: '#fff',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '0.9rem',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 4px 18px rgba(109,40,217,0.38)',
          transition: 'transform 0.18s, box-shadow 0.18s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(109,40,217,0.5)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(109,40,217,0.38)'; }}
      >
        ✨ Generate Auto-Schedule
      </button>
    </form>
  );
}
