import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { Bell } from 'lucide-react';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown,  setShowDropdown]  = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 60000);
    return () => clearInterval(interval);
  }, []);

  /* Close dropdown when clicking outside */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
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
    <div style={{ position: 'relative' }} ref={dropdownRef}>

      {/* ── Bell Button ───────────────────────────────────────── */}
      <button
        onClick={() => setShowDropdown(v => !v)}
        style={{
          position: 'relative',
          padding: '8px',
          borderRadius: '50%',
          border: '1px solid var(--border)',
          background: showDropdown ? 'var(--surface-hover)' : 'var(--surface)',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.borderColor = 'var(--border)';
        }}
        title="Notifications"
      >
        <Bell size={18} />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
            color: '#fff',
            fontSize: '9px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(236,72,153,0.5)',
            lineHeight: 1,
            border: '1.5px solid var(--bg-primary)',
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown Panel ────────────────────────────────────── */}
      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 10px)',
            width: '320px',
            background: 'var(--navbar-bg)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid var(--border)',
            borderRadius: '18px',
            padding: '16px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
            zIndex: 100,
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4
              className="font-heading font-bold"
              style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}
            >
              🔔 Notifications
            </h4>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#8b5cf6',
                  background: 'rgba(139,92,246,0.1)',
                  border: '1px solid rgba(139,92,246,0.25)',
                  borderRadius: '8px',
                  padding: '3px 10px',
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.1)'; }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--border)', marginBottom: '12px' }} />

          {/* List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                textAlign: 'center',
                padding: '24px 0',
              }}>
                You're all caught up! 🎉
              </p>
            ) : (
              notifications.map(n => (
                <div
                  key={n._id}
                  onClick={() => !n.isRead && markAsRead(n._id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    cursor: n.isRead ? 'default' : 'pointer',
                    border: `1px solid ${n.isRead ? 'var(--border)' : 'rgba(139,92,246,0.35)'}`,
                    background: n.isRead
                      ? 'var(--surface)'
                      : 'rgba(139,92,246,0.09)',
                    opacity: n.isRead ? 0.65 : 1,
                    transition: 'all 0.18s',
                  }}
                  onMouseEnter={e => {
                    if (!n.isRead) e.currentTarget.style.background = 'rgba(139,92,246,0.15)';
                  }}
                  onMouseLeave={e => {
                    if (!n.isRead) e.currentTarget.style.background = 'rgba(139,92,246,0.09)';
                  }}
                >
                  {/* Unread dot */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    {!n.isRead && (
                      <div style={{
                        width: '7px', height: '7px', flexShrink: 0,
                        borderRadius: '50%',
                        background: '#8b5cf6',
                        marginTop: '5px',
                        boxShadow: '0 0 6px rgba(139,92,246,0.6)',
                      }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        letterSpacing: '0.01em',
                        marginBottom: '3px',
                      }}>
                        {n.title}
                      </p>
                      <p style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {n.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
