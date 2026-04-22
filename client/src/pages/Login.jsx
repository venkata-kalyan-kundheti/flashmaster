import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, redirect based on role
  React.useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await login(email, password);
      // Role-based redirect after login
      const loggedUser = res || {};
      if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-md">
        <h2 className="text-3xl font-heading font-bold text-center mb-2 text-th-text">Welcome Back</h2>
        <p className="text-center text-th-muted mb-8 text-sm">Sign in to your account to continue</p>
        {error && (
          <div className="bg-red-400/10 border border-red-400/30 rounded-xl px-4 py-3 mb-6">
            <p className="text-red-400 text-center text-sm font-medium">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-th-muted mb-2">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="input"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-th-muted mb-2">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="input"
              placeholder="Enter your password"
            />
          </div>
          <button 
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-lg w-full disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : 'Login'}
          </button>
        </form>
        <p className="mt-6 text-center text-th-muted text-sm">
          Don't have an account? <Link to="/register" className="text-primary hover:text-accent transition-colors font-semibold">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
