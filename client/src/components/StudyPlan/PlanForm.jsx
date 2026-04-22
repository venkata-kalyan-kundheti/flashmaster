import React, { useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function PlanForm({ onPlanCreated }) {
  const [subject, setSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [dailyHours, setDailyHours] = useState('');
  const [chaptersInput, setChaptersInput] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !examDate || !dailyHours || !chaptersInput) {
      return toast.error('Please fill all fields');
    }

    const chapters = chaptersInput.split(',').map(c => ({ name: c.trim() })).filter(c => c.name !== '');

    const loadingToast = toast.loading('Gemini is generating your study plan...');
    try {
      const res = await api.post('/studyplans', {
        subject,
        examDate,
        dailyStudyHours: Number(dailyHours),
        chapters
      });
      toast.success('Gemini study plan created!', { id: loadingToast });
      onPlanCreated(res.data);
      setSubject(''); setExamDate(''); setDailyHours(''); setChaptersInput('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create plan', { id: loadingToast });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
      <h3 className="text-xl font-heading font-semibold text-primary mb-4">Create New Plan</h3>
      
      <div>
        <label className="block text-sm text-th-muted mb-1">Subject</label>
        <input value={subject} onChange={e=>setSubject(e.target.value)} type="text" className="input" placeholder="e.g. History" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-th-muted mb-1">Exam Date</label>
          <input value={examDate} onChange={e=>setExamDate(e.target.value)} type="date" className="input" />
        </div>
        <div>
           <label className="block text-sm text-th-muted mb-1">Daily Hours</label>
           <input value={dailyHours} onChange={e=>setDailyHours(e.target.value)} type="number" min="1" max="16" className="input" placeholder="e.g. 2" />
        </div>
      </div>

      <div>
         <label className="block text-sm text-th-muted mb-1">Chapters (comma separated)</label>
         <textarea value={chaptersInput} onChange={e=>setChaptersInput(e.target.value)} rows="3" className="input resize-none" placeholder="Intro, Chapter 1, Advanced Topics..."></textarea>
      </div>

      <button type="submit" className="btn btn-primary w-full">Generate with Gemini</button>
    </form>
  );
}
