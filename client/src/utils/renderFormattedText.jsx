import React from 'react';

/**
 * Renders text with bullet points (•, -, *) as styled list items.
 * Handles BOTH newline-separated bullets AND inline bullets (e.g. "• point1 • point2").
 * Sub-points (indented with spaces/tabs before - or *) get smaller indent styling.
 * Falls back to plain paragraph for text without bullet markers.
 */
export default function renderFormattedText(text) {
  if (!text) return null;

  // Pre-process: if the text has inline bullets (• or – used as separators)
  // without newlines, split them into separate lines first
  let processed = text;

  // Split on inline bullet markers: • or sequences like " - " mid-sentence
  // Only do this if the text is mostly a single line (no newlines or very few)
  const newlineCount = (processed.match(/\n/g) || []).length;
  const bulletCharCount = (processed.match(/•/g) || []).length;

  if (bulletCharCount >= 2 && newlineCount < bulletCharCount) {
    // Text has inline • bullets — split them into newline-separated bullets
    processed = processed.replace(/\s*•\s*/g, '\n• ');
  }

  // Also handle " – " (en-dash) used as bullet separators
  const enDashCount = (processed.match(/\s–\s/g) || []).length;
  if (enDashCount >= 2 && newlineCount < enDashCount) {
    processed = processed.replace(/\s–\s/g, '\n– ');
  }

  const lines = processed.split('\n').filter(line => line.trim().length > 0);

  // Check if any line starts with a bullet marker
  const hasBullets = lines.some(line => /^\s*[•–\-\*]\s/.test(line.trim()) || /^\s{2,}[\-\*]\s/.test(line));

  if (!hasBullets) {
    // No bullets found — render as plain text with word wrapping
    return (
      <p style={{
        fontSize: '0.9rem',
        fontWeight: 500,
        lineHeight: 1.65,
        textAlign: 'left',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        width: '100%',
      }}>
        {text}
      </p>
    );
  }

  return (
    <ul style={{
      textAlign: 'left',
      width: '100%',
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        // Detect sub-point: line starts with spaces/tabs then - or *
        const isSubPoint = /^\s{2,}[\-\*]/.test(line) || trimmed.startsWith('–');
        // Clean the bullet marker
        const cleanText = trimmed.replace(/^[•–\-\*]\s*/, '').trim();

        if (!cleanText) return null;

        if (isSubPoint || (trimmed.startsWith('-') && i > 0)) {
          return (
            <li key={i} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              marginLeft: '16px',
            }}>
              <span style={{
                color: '#a78bfa',
                marginTop: '2px',
                flexShrink: 0,
                fontSize: '0.7rem',
              }}>▸</span>
              <span style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                wordBreak: 'break-word',
              }}>{cleanText}</span>
            </li>
          );
        }

        return (
          <li key={i} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}>
            <span style={{
              color: '#8b5cf6',
              marginTop: '4px',
              flexShrink: 0,
              fontSize: '0.55rem',
            }}>●</span>
            <span style={{
              fontSize: '0.88rem',
              fontWeight: 500,
              lineHeight: 1.6,
              wordBreak: 'break-word',
            }}>{cleanText}</span>
          </li>
        );
      })}
    </ul>
  );
}
