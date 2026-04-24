import React from 'react';

/**
 * Premium circular loading spinner with animated gradient ring.
 * @param {string}  message  - Optional loading message
 * @param {string}  size     - 'sm' | 'md' | 'lg' (default: 'md')
 * @param {boolean} fullPage - If true, centers in full viewport height
 */
export default function LoadingSpinner({ message = 'Loading...', size = 'md', fullPage = true }) {
  const sizes = {
    sm: { ring: 32, border: 3, text: '0.75rem', glow: 48 },
    md: { ring: 48, border: 3.5, text: '0.85rem', glow: 64 },
    lg: { ring: 64, border: 4, text: '0.95rem', glow: 80 },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        minHeight: fullPage ? '60vh' : undefined,
        padding: fullPage ? 0 : '48px 0',
      }}
    >
      <div style={{ position: 'relative', width: s.ring, height: s.ring }}>
        {/* Outer glow pulse */}
        <div
          style={{
            position: 'absolute',
            inset: `-${(s.glow - s.ring) / 2}px`,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)',
            animation: 'spinnerPulse 2s ease-in-out infinite',
          }}
        />
        {/* Spinning ring */}
        <svg
          width={s.ring}
          height={s.ring}
          viewBox={`0 0 ${s.ring} ${s.ring}`}
          style={{ animation: 'spinnerRotate 0.85s linear infinite' }}
        >
          <defs>
            <linearGradient id="spinnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>
          <circle
            cx={s.ring / 2}
            cy={s.ring / 2}
            r={(s.ring - s.border * 2) / 2}
            fill="none"
            stroke="var(--border, rgba(120,130,200,0.12))"
            strokeWidth={s.border}
          />
          <circle
            cx={s.ring / 2}
            cy={s.ring / 2}
            r={(s.ring - s.border * 2) / 2}
            fill="none"
            stroke="url(#spinnerGrad)"
            strokeWidth={s.border}
            strokeLinecap="round"
            strokeDasharray={`${Math.PI * (s.ring - s.border * 2) * 0.3} ${Math.PI * (s.ring - s.border * 2) * 0.7}`}
          />
        </svg>
      </div>
      {message && (
        <p
          style={{
            fontSize: s.text,
            color: 'var(--text-muted, #9da8d8)',
            fontWeight: 500,
            letterSpacing: '0.03em',
            animation: 'spinnerPulse 2s ease-in-out infinite',
          }}
        >
          {message}
        </p>
      )}

      {/* Inject keyframes once */}
      <style>{`
        @keyframes spinnerRotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes spinnerPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
