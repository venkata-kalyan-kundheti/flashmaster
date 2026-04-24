import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { User, Lock, Eye, EyeOff, Save, Shield, CheckCircle, AlertCircle } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useContext(AuthContext);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newName, setNewName] = useState(user?.name || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!currentPassword) {
      setMessage({ type: 'error', text: 'Please enter your current password to verify.' });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    if (!newName.trim() && !newPassword) {
      setMessage({ type: 'error', text: 'Please provide a new name or password to update.' });
      return;
    }

    setLoading(true);
    try {
      const body = { currentPassword };
      if (newName.trim() && newName.trim() !== user?.name) body.newName = newName.trim();
      if (newPassword) body.newPassword = newPassword;

      const res = await api.put('/auth/profile', body);
      updateUser(res.data.token, res.data.user);

      setMessage({ type: 'success', text: 'Profile updated successfully! 🎉' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const labelStyle = {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: 'var(--label-color)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const inputWrapperStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    paddingRight: '48px',
    background: 'var(--input-bg)',
    border: '1.5px solid var(--border)',
    borderRadius: '14px',
    color: 'var(--input-text)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const eyeBtnStyle = {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s',
  };

  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* ── Header ───────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center' }}>
        {/* Avatar circle */}
        <div
          style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '2rem',
            fontWeight: 800,
            color: '#fff',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            boxShadow: '0 6px 28px rgba(139,92,246,0.35)',
          }}
        >
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <h1
          className="text-3xl font-heading font-black"
          style={{ color: 'var(--text-primary)', marginBottom: '6px' }}
        >
          My Profile
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Manage your account settings
        </p>
      </div>

      {/* ── Profile Card ─────────────────────────────────────────── */}
      <div
        className="glass-card"
        style={{ padding: '36px 32px', borderRadius: '24px' }}
      >
        {/* Info banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            background: 'rgba(139,92,246,0.08)',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '14px',
            marginBottom: '28px',
          }}
        >
          <Shield size={18} style={{ color: '#8b5cf6', flexShrink: 0 }} />
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Enter your <strong style={{ color: '#8b5cf6' }}>current password</strong> to verify your identity before making changes.
          </span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

          {/* ── Account Info section ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '4px' }}>
            <h2 style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              Account Information
            </h2>
            <div style={{
              padding: '12px 16px',
              background: 'var(--step-card-bg)',
              border: '1px solid var(--step-card-border)',
              borderRadius: '12px',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
            }}>
              📧 <strong style={{ color: 'var(--text-primary)' }}>{user?.email}</strong>
              <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>
                (cannot be changed)
              </span>
            </div>
          </div>

          {/* ── Current Password ── */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>
              <Lock size={15} /> Current Password <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={inputWrapperStyle}>
              <input
                type={showCurrentPw ? 'text' : 'password'}
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139,92,246,0.65)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                style={eyeBtnStyle}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#8b5cf6'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                {showCurrentPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* ── Divider ── */}
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0' }} />

          {/* ── New Name ── */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>
              <User size={15} /> Display Name
            </label>
            <div style={inputWrapperStyle}>
              <input
                type="text"
                placeholder="Enter new display name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{ ...inputStyle, paddingRight: '16px' }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139,92,246,0.65)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* ── New Password ── */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>
              <Lock size={15} /> New Password
            </label>
            <div style={inputWrapperStyle}>
              <input
                type={showNewPw ? 'text' : 'password'}
                placeholder="Leave blank to keep current"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139,92,246,0.65)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                style={eyeBtnStyle}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#8b5cf6'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* ── Confirm Password ── */}
          {newPassword && (
            <div style={inputGroupStyle}>
              <label style={labelStyle}>
                <Lock size={15} /> Confirm New Password
              </label>
              <div style={inputWrapperStyle}>
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    ...inputStyle,
                    borderColor: confirmPassword && confirmPassword !== newPassword
                      ? 'rgba(239,68,68,0.6)' : 'var(--border)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(139,92,246,0.65)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12)';
                  }}
                  onBlur={(e) => {
                    const match = confirmPassword === newPassword;
                    e.currentTarget.style.borderColor = match ? 'var(--border)' : 'rgba(239,68,68,0.6)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  style={eyeBtnStyle}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#8b5cf6'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <span style={{ fontSize: '0.78rem', color: '#f87171' }}>Passwords do not match</span>
              )}
            </div>
          )}

          {/* ── Status Message ── */}
          {message.text && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 500,
                animation: 'fadeSlideIn 0.3s ease',
                ...(message.type === 'success'
                  ? {
                      background: 'rgba(20,184,166,0.1)',
                      border: '1px solid rgba(20,184,166,0.3)',
                      color: '#5eead4',
                    }
                  : {
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      color: '#f87171',
                    }),
              }}
            >
              {message.type === 'success'
                ? <CheckCircle size={18} style={{ flexShrink: 0 }} />
                : <AlertCircle size={18} style={{ flexShrink: 0 }} />}
              {message.text}
            </div>
          )}

          {/* ── Save Button ── */}
          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '13px 28px',
              background: loading
                ? 'rgba(139,92,246,0.3)'
                : 'linear-gradient(135deg, #7c3aed, #a855f7)',
              border: 'none',
              borderRadius: '999px',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 18px rgba(139,92,246,0.4)',
              transition: 'transform 0.18s, box-shadow 0.18s',
              marginTop: '8px',
              width: '100%',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(139,92,246,0.55)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 18px rgba(139,92,246,0.4)';
            }}
          >
            {loading ? (
              <>
                <span className="animate-spin" style={{
                  width: '18px', height: '18px', borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  display: 'inline-block',
                }} />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </form>
      </div>

      {/* ── Inline keyframe animation ── */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
