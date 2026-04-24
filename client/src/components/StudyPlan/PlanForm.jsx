import React, { useState, useEffect } from 'react';
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
  const [materials, setMaterials] = useState([]);
  const [materialId, setMaterialId] = useState('');
  const [examDate, setExamDate] = useState('');
  const [dailyHours, setDailyHours] = useState('');
  const [focus, setFocus] = useState({});

  useEffect(() => {
    api.get('/materials').then(res => setMaterials(res.data)).catch(() => {});
  }, []);

  const onF = k => setFocus(f => ({ ...f, [k]: true }));
  const onB = k => setFocus(f => ({ ...f, [k]: false }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!materialId || !examDate || !dailyHours)
      return toast.error('Please fill all fields');

    const loadingToast = toast.loading('Reading document & generating schedule...');
    try {
      const res = await api.post('/studyplans', {
        materialId,
        examDate,
        dailyStudyHours: Number(dailyHours),
      });
      toast.success('Study Plan Created!', { id: loadingToast });
      onPlanCreated(res.data);
      setMaterialId(''); setExamDate(''); setDailyHours('');
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
        <label style={labelStyle}>Select Document</label>
        <select
          value={materialId} onChange={e => setMaterialId(e.target.value)}
          style={fieldStyle(focus.m)}
          onFocus={() => onF('m')} onBlur={() => onB('m')}
        >
          <option value="" disabled>-- Choose an uploaded material --</option>
          {materials.map(m => (
            <option key={m._id} value={m._id}>{m.title} ({m.subject})</option>
          ))}
        </select>
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