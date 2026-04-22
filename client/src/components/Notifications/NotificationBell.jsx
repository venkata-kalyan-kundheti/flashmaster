import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Bell } from 'lucide-react';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 60000); // 60 seconds
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    await api.patch(`/notifications/${id}/read`, {});
    fetchNotifs();
  };

  const markAllRead = async () => {
    await api.patch('/notifications/read-all', {});
    fetchNotifs();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <button onClick={() => setShowDropdown(!showDropdown)} className="btn btn-ghost btn-sm relative">
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 glass-card p-4 shadow-xl z-50">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-heading font-semibold text-th-text">Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-primary hover:text-accent transition-all font-medium">Mark all read</button>
            )}
          </div>
          
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {notifications.length === 0 ? (
               <p className="text-sm text-th-muted text-center py-4">No notifications</p>
            ) : (
               notifications.map(n => (
                 <div key={n._id} onClick={() => !n.isRead && markAsRead(n._id)} className={`p-3 rounded-xl border transition-all cursor-pointer ${n.isRead ? 'bg-th-surface/5 border-th-border/5 opacity-60' : 'bg-primary/15 border-primary/30 shadow-glow'}`}>
                   <p className="text-sm font-bold text-th-text tracking-wide">{n.title}</p>
                   <p className="text-xs text-th-muted mt-1 line-clamp-2">{n.message}</p>
                 </div>
               ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
