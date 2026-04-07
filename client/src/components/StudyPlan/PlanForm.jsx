import React, { useState } from 'react';
import axios from 'axios';
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

    const loadingToast = toast.loading('Generating schedule...');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/studyplans`, {
        subject,
        examDate,
        dailyStudyHours: Number(dailyHours),
        chapters
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Study Plan Created!', { id: loadingToast });
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
        <label className="block text-sm text-white/70 mb-1">Subject</label>
        <input value={subject} onChange={e=>setSubject(e.target.value)} type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-primary text-white" placeholder="e.g. History" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/70 mb-1">Exam Date</label>
          <input value={examDate} onChange={e=>setExamDate(e.target.value)} type="date" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-primary text-white" />
        </div>
        <div>
           <label className="block text-sm text-white/70 mb-1">Daily Hours</label>
           <input value={dailyHours} onChange={e=>setDailyHours(e.target.value)} type="number" min="1" max="16" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-primary text-white" placeholder="e.g. 2" />
        </div>
      </div>

      <div>
         <label className="block text-sm text-white/70 mb-1">Chapters (comma separated)</label>
         <textarea value={chaptersInput} onChange={e=>setChaptersInput(e.target.value)} rows="3" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-primary text-white resize-none" placeholder="Intro, Chapter 1, Advanced Topics..."></textarea>
      </div>

      <button type="submit" className="w-full py-3 bg-gradient-to-r from-primary to-accent rounded-lg text-white font-semibold hover:scale-[1.02] transition-all">Generate Auto-Schedule</button>
    </form>
  );
}
