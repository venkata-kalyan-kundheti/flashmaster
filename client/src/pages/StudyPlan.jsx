import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import PlanForm from '../components/StudyPlan/PlanForm';
import PlanCalendar from '../components/StudyPlan/PlanCalendar';
import toast, { Toaster } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

export default function StudyPlan() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/studyplans');
      setPlans(res.data);
    } catch {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

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
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 max-w-6xl mx-auto">
        <LoadingSpinner message="Loading study plans..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      <Toaster position="top-center" />
      <div>
        <h1 className="text-4xl font-heading font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          My Study Plan
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Generate an AI-optimized schedule up to your exam dates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <PlanForm onPlanCreated={plan => setPlans([...plans, plan])} />

          <div>
            <h3
              className="font-heading font-semibold text-lg"
              style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}
            >
              Active Plans
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {plans.map(p => (
                <div
                  key={p._id}
                  className="glass-card p-4"
                  style={{ position: 'relative' }}
                >
                  <button
                    onClick={() => handlePlanDelete(p._id)}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      opacity: 0.5,
                      transition: 'opacity 0.2s, color 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = '#f87171'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = 0.5; e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    ✖
                  </button>
                  <h4 className="font-bold" style={{ color: '#ec4899' }}>{p.subject}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Exam: {new Date(p.examDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {plans.length === 0 && (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No plans active.</p>
              )}
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="lg:col-span-2">
          <PlanCalendar plans={plans} onTaskComplete={handleTaskComplete} />
        </div>
      </div>
    </div>
  );
}
