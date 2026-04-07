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
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Materials', path: '/materials' },
    { name: 'Quizzes', path: '/quiz' },
    { name: 'Study Plan', path: '/studyplan' },
    { name: 'Progress', path: '/progress' },
    { name: 'Leaderboard', path: '/leaderboard' },
  ];

  return (
    <nav className="glass-card mx-8 mt-6 px-6 py-4 flex items-center justify-between sticky top-6 z-40 rounded-3xl">
      <div className="flex items-center gap-8">
        <h1 className="text-2xl font-black font-heading tracking-tighter bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">
          FLASHMASTER
        </h1>
        
        <div className="hidden lg:flex items-center gap-2">
          {navLinks.map(link => (
            <NavLink 
              key={link.name} 
              to={link.path}
              className={({ isActive }) => `px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive ? 'bg-primary/20 text-primary' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.name}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />
        
        <button onClick={toggleTheme} className="p-2 text-white/70 hover:text-secondary hover:bg-secondary/10 rounded-full transition-all">
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {user && (
           <div className="flex items-center gap-4 pl-4 border-l border-white/10 ml-2">
             <span className="text-sm font-semibold truncate max-w-[100px]">{user.name}</span>
             <button onClick={handleLogout} className="p-2 text-red-400 hover:bg-red-400/10 rounded-full transition-all">
               <LogOut size={20} />
             </button>
           </div>
        )}
      </div>
    </nav>
  );
}
