import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Materials from './pages/Materials';
import StudyPlan from './pages/StudyPlan';
import Progress from './pages/Progress';
import Quiz from './pages/Quiz';
import StudentHome from './pages/StudentHome';
import LeaderboardPage from './pages/LeaderboardPage';
import Navbar from './components/Layout/Navbar';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? <><Navbar />{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <StudentHome />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/materials" 
              element={
                <ProtectedRoute>
                  <Materials />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/studyplan" 
              element={
                <ProtectedRoute>
                  <StudyPlan />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/progress" 
              element={
                <ProtectedRoute>
                  <Progress />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quiz" 
              element={
                <ProtectedRoute>
                  <Quiz />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/leaderboard" 
              element={
                <ProtectedRoute>
                  <LeaderboardPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

