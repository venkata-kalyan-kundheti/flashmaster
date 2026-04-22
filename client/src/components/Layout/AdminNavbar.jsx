import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { Sun, Moon, LogOut, Shield } from 'lucide-react';

export default function AdminNavbar() {
  const { user, logout } = useContext(AuthContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Overview', path: '/admin' },
    { name: 'Users', path: '/admin/users' },
    { name: 'Materials', path: '/admin/materials' },
  ];

  return (
    <nav className="glass-card mx-4 sm:mx-8 mt-6 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-6 z-40 rounded-3xl">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <Shield size={22} className="text-accent" />
          <h1 className="text-xl font-black font-heading tracking-tighter bg-gradient-to-r from-accent to-primary text-transparent bg-clip-text">
            ADMIN PANEL
          </h1>
        </div>
        
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <NavLink 
              key={link.name} 
              to={link.path}
              end={link.path === '/admin'}
              className={({ isActive }) => `px-4 py-2 rounded-xl text-sm font-medium transition-all border border-transparent ${
                isActive 
                  ? 'bg-accent/15 text-accent border-accent/20 font-semibold' 
                  : 'text-th-muted hover:text-th-text hover:bg-th-surface/8'
              }`}
            >
              {link.name}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={toggleTheme} 
          className="btn btn-ghost btn-sm btn-pill"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-th-border/10 ml-1">
            <span className="text-sm font-semibold truncate max-w-[100px] text-th-text">{user.name}</span>
            <button 
              onClick={handleLogout} 
              className="btn btn-danger btn-sm btn-pill"
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
