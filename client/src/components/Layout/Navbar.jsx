import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import NotificationBell from '../Notifications/NotificationBell';
import { Sun, Moon, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard',      path: '/dashboard'      },
    { name: 'Materials',      path: '/materials'      },
    { name: 'Flashcards',     path: '/flashcards'     },
    { name: 'Quizzes',        path: '/quiz'           },
    { name: 'Study Plan',     path: '/studyplan'      },
    { name: 'Resume Roadmap', path: '/resume-roadmap' },
    { name: 'Progress',       path: '/progress'       },
    { name: 'Leaderboard',    path: '/leaderboard'    },
  ];

  return (
    <nav
      style={{
        background: 'var(--navbar-bg)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        margin: '24px 32px 0',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: '24px',
        zIndex: 40,
        boxShadow: 'var(--card-shadow)',
      }}
    >
      {/* Logo + Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <h1
          className="text-2xl font-black font-heading tracking-tighter"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          FLASHMASTER
        </h1>

        <div className="hidden lg:flex items-center" style={{ gap: '4px' }}>
          {navLinks.map(link => (
            <NavLink
              key={link.name}
              to={link.path}
              style={({ isActive }) => ({
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '0.82rem',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.2s',
                background:  isActive ? 'rgba(139,92,246,0.15)' : 'transparent',
                color:       isActive ? '#8b5cf6'               : 'var(--text-secondary)',
                border:      isActive ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent',
              })}
              onMouseEnter={e => {
                if (!e.currentTarget.dataset.active) {
                  e.currentTarget.style.background = 'var(--surface-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={e => {
                if (!e.currentTarget.classList.contains('active')) {
                  const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
                  e.currentTarget.style.background = isActive ? 'rgba(139,92,246,0.15)' : 'transparent';
                  e.currentTarget.style.color = isActive ? '#8b5cf6' : 'var(--text-secondary)';
                }
              }}
            >
              {link.name}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <NotificationBell />

        <button
          onClick={toggleTheme}
          style={{
            padding: '8px',
            borderRadius: '50%',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#8b5cf6'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              paddingLeft: '16px',
              borderLeft: '1px solid var(--border)',
              marginLeft: '4px',
            }}
          >
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                maxWidth: '100px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.name}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px',
                borderRadius: '50%',
                border: '1px solid rgba(239,68,68,0.25)',
                background: 'rgba(239,68,68,0.07)',
                color: '#f87171',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; }}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
