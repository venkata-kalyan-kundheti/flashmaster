import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/* ── Shared input style ────────────────────────────────────── */
const inp = (focused) => ({
  width: '100%',
  background: 'var(--input-bg)',
  border: `1px solid ${focused ? 'var(--border-focus)' : 'var(--border)'}`,
  borderRadius: '12px',
  padding: '12px 16px',
  color: 'var(--input-text)',
  fontSize: '0.92rem',
  outline: 'none',
  transition: 'border-color 0.2s',
});

const labelStyle = {
  display: 'block',
  fontSize: '0.78rem',
  fontWeight: 600,
  letterSpacing: '0.03em',
  color: 'var(--label-color)',
  marginBottom: '7px',
  textTransform: 'uppercase',
};

const submitBtn = {
  width: '100%',
  padding: '13px',
  background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 55%, #ec4899 100%)',
  border: 'none',
  borderRadius: '12px',
  color: '#fff',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: '0.95rem',
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 4px 20px rgba(139,92,246,0.42)',
  transition: 'transform 0.18s, box-shadow 0.18s',
  marginTop: '4px',
};

/* ── Card dimensions (kept identical for both faces) ──────── */
const CARD_H = '560px';

export default function AuthPage() {
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  /* Which face is showing */
  const [flipped, setFlipped] = useState(false);

  /* Login state */
  const [loginEmail,    setLoginEmail]    = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError,    setLoginError]    = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  /* Register state */
  const [regName,     setRegName]     = useState('');
  const [regEmail,    setRegEmail]    = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError,    setRegError]    = useState('');

  /* focus tracking for border highlight */
  const [focus, setFocus] = useState({});
  const onFocus = (k) => setFocus(f => ({ ...f, [k]: true  }));
  const onBlur  = (k) => setFocus(f => ({ ...f, [k]: false }));

  const flip = () => {
    setLoginError('');
    setRegError('');
    setFlipped(f => !f);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
      navigate('/dashboard');
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    try {
      await register(regName, regEmail, regPassword);
      navigate('/dashboard');
    } catch (err) {
      setRegError(err.response?.data?.message || 'Registration failed');
    }
  };

  /* ── Logo (shared) ──────────────────────────────────────── */
  const Logo = () => (
    <div style={{ textAlign: 'center', marginBottom: '28px' }}>
      <h1
        className="text-3xl font-heading font-black tracking-tight"
        style={{
          background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '4px',
        }}
      >
        FLASHMASTER
      </h1>
    </div>
  );

  const ErrorBox = ({ msg }) => msg ? (
    <div style={{
      background: 'rgba(239,68,68,0.10)',
      border: '1px solid rgba(239,68,68,0.28)',
      borderRadius: '10px',
      padding: '10px 14px',
      color: '#f87171',
      fontSize: '0.85rem',
      textAlign: 'center',
      marginBottom: '16px',
    }}>
      {msg}
    </div>
  ) : null;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ perspective: '1400px' }}
    >
      {/* Inject flip keyframes */}
      <style>{`
        .auth-card-inner {
          position: relative;
          width: 100%;
          max-width: 440px;
          height: ${CARD_H};
          transform-style: preserve-3d;
          transition: transform 0.65s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .auth-card-inner.flipped {
          transform: rotateY(180deg);
        }
        .auth-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 24px;
          padding: 40px 36px;
          overflow-y: auto;
        }
        .auth-face-back {
          transform: rotateY(180deg);
        }
        /* hide scrollbar cosmetically */
        .auth-face::-webkit-scrollbar { display: none; }

        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: loginSpin 0.7s linear infinite;
        }

        @keyframes loginSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="auth-card-inner" style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>

        {/* ════ FRONT — Sign In ════════════════════════════════ */}
        <div
          className="auth-face glass-card"
          style={{ boxShadow: '0 12px 56px rgba(139,92,246,0.20)' }}
        >
          <Logo />

          <h2 className="text-2xl font-heading font-bold" style={{ color: 'var(--text-primary)', textAlign: 'center', marginBottom: '6px' }}>
            Welcome Back
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', marginBottom: '28px' }}>
            Sign in to continue learning
          </p>

          <ErrorBox msg={loginError} />

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email" value={loginEmail} required placeholder="you@example.com"
                onChange={e => setLoginEmail(e.target.value)}
                onFocus={() => onFocus('le')} onBlur={() => onBlur('le')}
                style={inp(focus.le)}
                disabled={loginSubmitting}
              />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password" value={loginPassword} required placeholder="••••••••"
                onChange={e => setLoginPassword(e.target.value)}
                onFocus={() => onFocus('lp')} onBlur={() => onBlur('lp')}
                style={inp(focus.lp)}
                disabled={loginSubmitting}
              />
            </div>

            <button
              type="submit"
              style={{
                ...submitBtn,
                opacity: loginSubmitting ? 0.85 : 1,
                cursor: loginSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
              disabled={loginSubmitting}
              onMouseEnter={e => {
                if (loginSubmitting) return;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(139,92,246,0.55)';
              }}
              onMouseLeave={e => {
                if (loginSubmitting) return;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(139,92,246,0.42)';
              }}
            >
              {loginSubmitting && <span className="btn-spinner" aria-hidden="true" />}
              {loginSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <button
              onClick={flip}
              style={{ background: 'none', border: 'none', color: '#8b5cf6', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', padding: 0 }}
            >
              Create one →
            </button>
          </p>
        </div>

        {/* ════ BACK — Sign Up ═════════════════════════════════ */}
        <div
          className="auth-face auth-face-back glass-card"
          style={{ boxShadow: '0 12px 56px rgba(236,72,153,0.18)' }}
        >
          <Logo />

          <h2 className="text-2xl font-heading font-bold" style={{ color: 'var(--text-primary)', textAlign: 'center', marginBottom: '6px' }}>
            Create Account
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', marginBottom: '28px' }}>
            Start your learning journey today
          </p>

          <ErrorBox msg={regError} />

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text" value={regName} required placeholder="Your name"
                onChange={e => setRegName(e.target.value)}
                onFocus={() => onFocus('rn')} onBlur={() => onBlur('rn')}
                style={inp(focus.rn)}
              />
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email" value={regEmail} required placeholder="you@example.com"
                onChange={e => setRegEmail(e.target.value)}
                onFocus={() => onFocus('re')} onBlur={() => onBlur('re')}
                style={inp(focus.re)}
              />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password" value={regPassword} required placeholder="••••••••"
                onChange={e => setRegPassword(e.target.value)}
                onFocus={() => onFocus('rp')} onBlur={() => onBlur('rp')}
                style={inp(focus.rp)}
              />
            </div>

            <button
              type="submit" style={{ ...submitBtn, background: 'linear-gradient(135deg, #db2777 0%, #a855f7 55%, #7c3aed 100%)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(236,72,153,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = '0 4px 20px rgba(139,92,246,0.42)'; }}
            >
              Create Account
            </button>
          </form>

          <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <button
              onClick={flip}
              style={{ background: 'none', border: 'none', color: '#8b5cf6', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', padding: 0 }}
            >
              ← Sign In
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
