import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login'; // AuthPage — contains both login & register flip
import Materials from './pages/Materials';
import Flashcards from './pages/Flashcards';
import StudyPlan from './pages/StudyPlan';
import Progress from './pages/Progress';
import Quiz from './pages/Quiz';
import StudentHome from './pages/StudentHome';
import LeaderboardPage from './pages/LeaderboardPage';
import ResumeRoadmap from './pages/ResumeRoadmap';
import Navbar from './components/Layout/Navbar';
import AdminNavbar from './components/Layout/AdminNavbar';
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminMaterials from './pages/admin/AdminMaterials';

// Protected Route wrapper — students only
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen flex items-center justify-center text-th-muted animate-pulse">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  return <><Navbar />{children}</>;
};

// Admin Route wrapper
const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen flex items-center justify-center text-th-muted animate-pulse">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" />;
  return <><AdminNavbar />{children}</>;
};

// Smart redirect from root based on role
const RootRedirect = () => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen flex items-center justify-center text-th-muted animate-pulse">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Login />} />
            
            {/* Student Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><StudentHome /></ProtectedRoute>} />
            <Route path="/materials" element={<ProtectedRoute><Materials /></ProtectedRoute>} />
            <Route path="/flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
            <Route path="/studyplan" element={<ProtectedRoute><StudyPlan /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
            <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
            <Route path="/resume-roadmap" element={<ProtectedRoute><ResumeRoadmap /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminOverview /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/materials" element={<AdminRoute><AdminMaterials /></AdminRoute>} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
