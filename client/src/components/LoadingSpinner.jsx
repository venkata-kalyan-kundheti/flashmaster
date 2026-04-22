import React from 'react';

/**
 * Reusable loading spinner with animated gradient ring.
 * @param {string} message - Optional loading message
 * @param {string} size - 'sm' | 'md' | 'lg' (default: 'md')
 * @param {boolean} fullPage - If true, centers in full viewport height
 */
export default function LoadingSpinner({ message = 'Loading...', size = 'md', fullPage = true }) {
  const sizes = {
    sm: { ring: 'w-8 h-8', border: 'border-[3px]', text: 'text-xs' },
    md: { ring: 'w-12 h-12', border: 'border-[3px]', text: 'text-sm' },
    lg: { ring: 'w-16 h-16', border: 'border-4', text: 'text-base' },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${fullPage ? 'min-h-[60vh]' : 'py-12'}`}>
      <div className="relative">
        {/* Outer glow */}
        <div className={`${s.ring} rounded-full absolute inset-0 bg-gradient-to-tr from-primary/30 to-accent/30 blur-lg animate-pulse`} />
        {/* Spinning ring */}
        <div
          className={`${s.ring} ${s.border} rounded-full border-th-border/10 border-t-primary border-r-accent animate-spin`}
          style={{ animationDuration: '0.8s' }}
        />
      </div>
      {message && (
        <p className={`${s.text} text-th-muted animate-pulse font-medium tracking-wide`}>
          {message}
        </p>
      )}
    </div>
  );
}
