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
      <button onClick={() => setShowDropdown(!showDropdown)} className="relative p-2 text-white/70 hover:text-white transition-all">
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 glass-card p-4 shadow-xl z-50">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-heading font-semibold text-white">Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-primary hover:text-white transition-all">Mark all read</button>
            )}
          </div>
          
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {notifications.length === 0 ? (
               <p className="text-sm text-white/40 text-center py-4">No notifications</p>
            ) : (
               notifications.map(n => (
                 <div key={n._id} onClick={() => !n.isRead && markAsRead(n._id)} className={`p-3 rounded-xl border transition-all cursor-pointer ${n.isRead ? 'bg-white/5 border-white/5 opacity-60' : 'bg-primary/20 border-primary shadow-glow-teal'}`}>
                   <p className="text-sm font-bold text-white tracking-wide">{n.title}</p>
                   <p className="text-xs text-white/70 mt-1 line-clamp-2">{n.message}</p>
                 </div>
               ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
