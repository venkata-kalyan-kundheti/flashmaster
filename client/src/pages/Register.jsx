import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/dashboard'); // or redirect to login depending on flow
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-md">
        <h2 className="text-3xl font-heading font-bold text-center mb-8 text-th-text">Create Account</h2>
        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-th-muted mb-2">Full Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              className="input"
              placeholder="Enter your name"
            />
          </div>
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
              placeholder="Create a password"
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
                Creating account...
              </span>
            ) : 'Register'}
          </button>
        </form>
        <p className="mt-6 text-center text-th-muted text-sm">
          Already have an account? <Link to="/login" className="text-primary hover:text-accent transition-colors font-semibold">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
