import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import PlanForm from '../components/StudyPlan/PlanForm';
import PlanCalendar from '../components/StudyPlan/PlanCalendar';
import toast from 'react-hot-toast';

export default function StudyPlan() {
  const [plans, setPlans] = useState([]);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/studyplans');
      setPlans(res.data);
    } catch {
      toast.error('Failed to load plans');
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleTaskComplete = async (planId, dayId) => {
    try {
      await api.patch(`/studyplans/${planId}/day/${dayId}`, {});
      toast.success('Awesome work!');
      fetchPlans();
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handlePlanDelete = async (planId) => {
    try {
       await api.delete(`/studyplans/${planId}`);
       toast.success('Study plan deleted');
       fetchPlans();
    } catch {
       toast.error('Failed to delete plan');
    }
  }

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto space-y-12">
      <div>
        <h1 className="text-4xl font-heading font-bold mb-2">My Study Plan</h1>
        <p className="text-white/60">Generate an AI-optimized schedule up to your exam dates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
           <PlanForm onPlanCreated={plan => setPlans([...plans, plan])} />
           
           <div className="space-y-4">
              <h3 className="font-heading font-semibold text-lg text-white/80">Active Plans</h3>
              {plans.map(p => (
                 <div key={p._id} className="relative glass-card p-4 group">
                    <button onClick={() => handlePlanDelete(p._id)} className="absolute top-2 right-2 text-white/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">✖</button>
                    <h4 className="font-bold text-accent">{p.subject}</h4>
                    <p className="text-xs text-white/60 mt-1">Exam: {new Date(p.examDate).toLocaleDateString()}</p>
                 </div>
              ))}
              {plans.length === 0 && <p className="text-sm text-white/40">No plans active.</p>}
           </div>
        </div>

        <div className="lg:col-span-2">
           <PlanCalendar plans={plans} onTaskComplete={handleTaskComplete} />
        </div>
      </div>
    </div>
  );
}
