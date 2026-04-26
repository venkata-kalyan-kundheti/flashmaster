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

  const handlePlanComplete = async (planId) => {
    try {
      await api.patch(`/studyplans/${planId}/complete`, {});
      toast.success('Plan marked as completed');
      fetchPlans();
    } catch {
      toast.error('Failed to complete plan');
    }
  };

  const activePlans = plans.filter(p => p.isActive);
  const completedPlans = plans.filter(p => !p.isActive);

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
              {activePlans.map(p => (
                <div
                  key={p._id}
                  className="glass-card p-4"
                  style={{ position: 'relative' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '10px',
                      marginBottom: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', minWidth: 0, flex: '1 1 220px' }}>
                      <h4 className="font-bold" style={{ color: '#ec4899' }}>{p.subject}</h4>
                      <span style={{ fontSize: '0.72rem', color: '#14b8a6', border: '1px solid rgba(20,184,166,0.35)', background: 'rgba(20,184,166,0.12)', borderRadius: '999px', padding: '2px 8px', fontWeight: 600 }}>
                        Active
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handlePlanComplete(p._id)}
                        title="Mark this full plan as completed"
                        aria-label="Complete this plan"
                        style={{
                          border: '1px solid rgba(20,184,166,0.35)',
                          background: 'rgba(20,184,166,0.1)',
                          color: '#14b8a6',
                          borderRadius: '8px',
                          padding: '4px 10px',
                          cursor: 'pointer',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          transition: 'all 0.18s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(20,184,166,0.2)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(20,184,166,0.1)'; }}
                      >
                        Complete Plan
                      </button>

                      <button
                        onClick={() => handlePlanDelete(p._id)}
                        title="Delete this plan permanently"
                        aria-label="Delete this plan"
                        style={{
                          border: 'none',
                          background: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          opacity: 0.7,
                          transition: 'opacity 0.2s, color 0.2s',
                          padding: '4px 0',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = '#f87171'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = 0.7; e.currentTarget.style.color = 'var(--text-muted)'; }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Exam: {new Date(p.examDate).toLocaleDateString()}
                  </p>

                  <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(p.chapters || []).slice(0, 8).map((chapter, idx) => {
                      const chapterName = chapter?.name || `Topic ${idx + 1}`;
                      const isChapterCompleted = !!chapter?.isCompleted;
                      return (
                        <span
                          key={`${p._id}-chapter-${idx}`}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: isChapterCompleted ? '#0f766e' : 'var(--text-secondary)',
                            background: isChapterCompleted ? 'rgba(16,185,129,0.16)' : 'var(--surface)',
                            border: `1px solid ${isChapterCompleted ? 'rgba(16,185,129,0.45)' : 'var(--border)'}`,
                            maxWidth: '100%',
                            whiteSpace: 'normal',
                            overflowWrap: 'anywhere',
                            wordBreak: 'break-word',
                            lineHeight: 1.3,
                          }}
                          title={chapterName}
                        >
                          {chapterName}
                        </span>
                      );
                    })}
                    {(p.chapters || []).length > 8 && (
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: '#8b5cf6',
                          background: 'rgba(139,92,246,0.12)',
                          border: '1px solid rgba(139,92,246,0.28)',
                        }}
                      >
                        +{p.chapters.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {activePlans.length === 0 && (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No plans active.</p>
              )}

              {completedPlans.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                    Completed Plans
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {completedPlans.map(p => (
                      <div key={`done-${p._id}`} className="glass-card p-3" style={{ opacity: 0.78 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <h4 className="font-bold" style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>{p.subject}</h4>
                          <span style={{ fontSize: '0.72rem', color: '#14b8a6', fontWeight: 700 }}>Completed</span>
                        </div>
                        <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Exam: {new Date(p.examDate).toLocaleDateString()}
                        </p>
                        <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {(p.chapters || []).slice(0, 8).map((chapter, idx) => {
                            const chapterName = chapter?.name || `Topic ${idx + 1}`;
                            return (
                              <span
                                key={`done-${p._id}-chapter-${idx}`}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '999px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  color: '#0f766e',
                                  background: 'rgba(16,185,129,0.16)',
                                  border: '1px solid rgba(16,185,129,0.45)',
                                  maxWidth: '100%',
                                  whiteSpace: 'normal',
                                  overflowWrap: 'anywhere',
                                  wordBreak: 'break-word',
                                  lineHeight: 1.3,
                                }}
                              >
                                {chapterName}
                              </span>
                            );
                          })}
                          {(p.chapters || []).length > 8 && (
                            <span
                              style={{
                                padding: '4px 10px',
                                borderRadius: '999px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: '#0f766e',
                                background: 'rgba(16,185,129,0.16)',
                                border: '1px solid rgba(16,185,129,0.45)',
                              }}
                            >
                              +{p.chapters.length - 8} more
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="lg:col-span-2">
          <PlanCalendar plans={activePlans} onTaskComplete={handleTaskComplete} />
        </div>
      </div>
    </div>
  );
}
