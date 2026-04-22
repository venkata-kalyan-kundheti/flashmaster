import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast, { Toaster } from 'react-hot-toast';
import { Users, BookOpen, Layers, Brain, TrendingUp, Calendar, Award, UserPlus } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch (err) {
        toast.error('Failed to load admin stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-8 max-w-7xl mx-auto">
        <LoadingSpinner message="Loading dashboard..." />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Students', value: stats?.totalUsers || 0, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Active Users', value: stats?.activeUsers || 0, icon: TrendingUp, color: 'text-secondary', bg: 'bg-secondary/10' },
    { label: 'Disabled Users', value: stats?.disabledUsers || 0, icon: Users, color: 'text-red-400', bg: 'bg-red-400/10' },
    { label: 'New This Week', value: stats?.recentSignups || 0, icon: UserPlus, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Total Materials', value: stats?.totalMaterials || 0, icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Total Flashcards', value: stats?.totalFlashcards || 0, icon: Layers, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Study Plans', value: stats?.totalStudyPlans || 0, icon: Calendar, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Quizzes Taken', value: stats?.totalQuizzesTaken || 0, icon: Brain, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <Toaster position="top-right" toastOptions={{ style: { background: 'var(--surface)', backdropFilter: 'blur(10px)', color: 'var(--text-primary)', border: '1px solid var(--border)' } }} />

      <div>
        <h1 className="text-3xl sm:text-4xl font-heading font-black text-th-text">Platform Overview</h1>
        <p className="text-th-muted mt-1">Monitor your platform's health and student activity.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="glass-card p-5 flex flex-col gap-3 hover:-translate-y-0.5 transition-all">
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
              <card.icon size={20} className={card.color} />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading text-th-text">{card.value}</p>
              <p className="text-xs text-th-muted uppercase tracking-wider mt-0.5">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Avg Quiz + Top Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Avg Quiz Performance */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-heading font-semibold text-th-text mb-4 flex items-center gap-2">
            <Award size={20} className="text-accent" /> Average Quiz Score
          </h3>
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgb(var(--th-surface) / 0.1)" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none"
                  stroke={stats?.avgQuizPercentage >= 70 ? '#14b8a6' : stats?.avgQuizPercentage >= 50 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * (stats?.avgQuizPercentage || 0)) / 100}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold font-heading text-th-text">{stats?.avgQuizPercentage || 0}%</span>
              </div>
            </div>
            <div>
              <p className="text-th-muted text-sm">Across all {stats?.totalQuizzesTaken || 0} quizzes taken by students on the platform.</p>
            </div>
          </div>
        </div>

        {/* Top Subjects */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-heading font-semibold text-th-text mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-primary" /> Top Subjects
          </h3>
          {stats?.topSubjects?.length > 0 ? (
            <div className="space-y-3">
              {stats.topSubjects.map((sub, i) => (
                <div key={sub.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center ${i === 0 ? 'bg-primary/20 text-primary' :
                        i === 1 ? 'bg-secondary/20 text-secondary' :
                          'bg-th-surface/10 text-th-muted'
                      }`}>{i + 1}</span>
                    <span className="text-th-text font-medium">{sub.name}</span>
                  </div>
                  <span className="text-th-muted text-sm">{sub.count} materials</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-th-muted text-sm">No materials uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
