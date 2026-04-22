import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function PlanCalendar({ plans, onTaskComplete }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      for (const plan of plans) {
        for (const day of plan.schedule) {
          if (new Date(day.date).toDateString() === date.toDateString()) {
            return day.isCompleted ? 'cal-done' : 'cal-due';
          }
        }
      }
    }
  };

  const getDayTasks = () => {
    const tasks = [];
    plans.forEach(plan => {
      plan.schedule.forEach(day => {
        if (new Date(day.date).toDateString() === selectedDate.toDateString()) {
          tasks.push({ planId: plan._id, dayId: day._id, subject: plan.subject, tasks: day.tasks, completed: day.isCompleted });
        }
      });
    });
    return tasks;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

      {/* ── Calendar Card ─────────────────────────────────────── */}
      <div className="glass-card p-6">
        <style>{`
          /* Base calendar reset */
          .react-calendar {
            width: 100%;
            border: none;
            background: transparent;
            font-family: 'Inter', sans-serif;
            color: var(--text-primary);
          }
          /* Navigation */
          .react-calendar__navigation button {
            color: var(--text-primary);
            border-radius: 8px;
            font-weight: 600;
            background: transparent;
            min-width: 40px;
          }
          .react-calendar__navigation button:enabled:hover,
          .react-calendar__navigation button:enabled:focus {
            background: var(--surface-hover);
          }
          /* Weekday labels */
          .react-calendar__month-view__weekdays__weekday abbr {
            text-decoration: none;
            color: var(--text-muted);
            font-size: 0.72rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.06em;
          }
          /* Day tiles */
          .react-calendar__tile {
            color: var(--text-primary);
            padding: 0.75em 0.4em;
            border-radius: 8px;
            font-size: 0.85rem;
          }
          .react-calendar__tile:enabled:hover,
          .react-calendar__tile:enabled:focus {
            background: var(--surface-hover);
          }
          /* Weekend */
          .react-calendar__month-view__days__day--weekend {
            color: #f87171;
          }
          /* Today */
          .react-calendar__tile--now {
            background: rgba(236,72,153,0.18) !important;
            color: var(--text-primary) !important;
            font-weight: 700;
          }
          /* Selected */
          .react-calendar__tile--active {
            background: #8b5cf6 !important;
            color: #fff !important;
            font-weight: 700;
          }
          /* Neighbour month days */
          .react-calendar__month-view__days__day--neighboringMonth {
            color: var(--text-muted) !important;
          }
          /* Study day highlights */
          .cal-done {
            background: rgba(20,184,166,0.2) !important;
            border-radius: 50% !important;
            color: #14b8a6 !important;
            font-weight: 700;
          }
          .cal-due {
            background: rgba(139,92,246,0.2) !important;
            border-radius: 50% !important;
            color: #8b5cf6 !important;
            font-weight: 700;
          }
        `}</style>

        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileClassName={tileClassName}
        />
      </div>

      {/* ── Tasks Panel ───────────────────────────────────────── */}
      <div className="glass-card p-6">
        <h3
          className="text-xl font-heading font-semibold mb-4"
          style={{ color: '#14b8a6' }}
        >
          Tasks for {selectedDate.toDateString()}
        </h3>

        {getDayTasks().length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No tasks scheduled for this day. Free day! 🎉
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {getDayTasks().map((t, i) => (
              <div
                key={i}
                style={{
                  padding: '14px 16px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ fontWeight: 700, color: '#8b5cf6', fontSize: '0.95rem' }}>{t.subject}</h4>
                  {t.completed ? (
                    <span style={{ color: '#14b8a6', fontSize: '0.82rem', fontWeight: 600 }}>✅ Completed</span>
                  ) : (
                    <button
                      onClick={() => onTaskComplete(t.planId, t.dayId)}
                      style={{
                        padding: '5px 13px',
                        background: 'rgba(20,184,166,0.1)',
                        border: '1px solid rgba(20,184,166,0.3)',
                        borderRadius: '8px',
                        color: '#14b8a6',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.18s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(20,184,166,0.2)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(20,184,166,0.1)'; }}
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {t.tasks.map((taskName, j) => (
                    <li
                      key={j}
                      style={{
                        fontSize: '0.85rem',
                        color: t.completed ? 'var(--text-muted)' : 'var(--text-secondary)',
                        textDecoration: t.completed ? 'line-through' : 'none',
                        paddingLeft: '12px',
                        borderLeft: `2px solid ${t.completed ? 'rgba(20,184,166,0.3)' : 'rgba(139,92,246,0.35)'}`,
                      }}
                    >
                      {taskName}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
