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
             return day.isCompleted ? 'bg-secondary/30 rounded-full text-white' : 'bg-primary/30 rounded-full text-white';
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
      <div className="glass-card p-6">
        <style>{`
          .react-calendar { width: 100%; border: none; background: transparent; font-family: 'Inter', sans-serif; color: white; }
          .react-calendar__navigation button { color: white; border-radius: 8px; }
          .react-calendar__navigation button:enabled:hover, .react-calendar__navigation button:enabled:focus { background: rgba(255,255,255,0.1); }
          .react-calendar__month-view__days__day--weekend { color: #f87171; }
          .react-calendar__tile { color: white; padding: 1em 0.5em; }
          .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus { background: rgba(255,255,255,0.1); border-radius: 8px; }
          .react-calendar__tile--now { background: rgba(236,72,153,0.4); border-radius: 8px; }
          .react-calendar__tile--active { background: #a855f7 !important; color: white; border-radius: 8px; }
        `}</style>
        <Calendar onChange={setSelectedDate} value={selectedDate} tileClassName={tileClassName} />
      </div>

      <div className="glass-card p-6">
        <h3 className="text-xl font-heading font-semibold text-secondary mb-4">Tasks for {selectedDate.toDateString()}</h3>
        
        {getDayTasks().length === 0 ? (
          <p className="text-white/50">No tasks scheduled for this day. Free day! 🎉</p>
        ) : (
          <div className="space-y-4">
            {getDayTasks().map((t, i) => (
              <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex justify-between items-center mb-2">
                   <h4 className="font-bold text-primary">{t.subject}</h4>
                   {t.completed ? (
                      <span className="text-secondary text-sm">✅ Completed</span>
                   ) : (
                      <button onClick={() => onTaskComplete(t.planId, t.dayId)} className="px-3 py-1 bg-white/10 hover:bg-secondary/20 hover:text-secondary rounded-lg text-sm transition-all border border-white/20">Mark Complete</button>
                   )}
                </div>
                <ul className="list-disc list-inside text-sm text-white/80">
                  {t.tasks.map((taskName, j) => (
                    <li key={j} className={t.completed ? 'line-through text-white/40' : ''}>{taskName}</li>
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
