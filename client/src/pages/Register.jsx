import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const inputStyle = {
  width: '100%',
  background: 'var(--input-bg)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '12px 16px',
  color: 'var(--input-text)',
  fontSize: '0.92rem',
  outline: 'none',
  transition: 'border-color 0.2s',
};

const Register = () => {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const { register }            = useContext(AuthContext);
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div
        className="glass-card p-8 w-full max-w-md"
        style={{ boxShadow: '0 8px 48px rgba(139,92,246,0.18)' }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-heading font-black tracking-tight mb-1"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            FLASHMASTER
          </h1>
          <h2
            className="text-2xl font-heading font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Create Account
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
            Start your learning journey today
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '10px',
              padding: '10px 14px',
              color: '#f87171',
              fontSize: '0.875rem',
              textAlign: 'center',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[
            { label: 'Full Name',       type: 'text',     value: name,     set: setName,     placeholder: 'Enter your name'     },
            { label: 'Email Address',   type: 'email',    value: email,    set: setEmail,    placeholder: 'Enter your email'    },
            { label: 'Password',        type: 'password', value: password, set: setPassword, placeholder: 'Create a password'   },
          ].map(({ label, type, value, set, placeholder }) => (
            <div key={label}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--label-color)', marginBottom: '8px' }}>
                {label}
              </label>
              <input
                type={type}
                value={value}
                onChange={e => set(e.target.value)}
                required
                placeholder={placeholder}
                style={inputStyle}
                onFocus={e  => (e.target.style.borderColor = 'var(--border-focus)')}
                onBlur={e   => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
          ))}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '13px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(139,92,246,0.4)',
              transition: 'transform 0.18s, box-shadow 0.18s',
              marginTop: '4px',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(139,92,246,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(139,92,246,0.4)'; }}
          >
            Create Account
          </button>
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#8b5cf6', fontWeight: 600, textDecoration: 'none' }}>
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
