import React from 'react';

/**
 * Renders text with bullet points (•, -, *) as styled list items.
 * Sub-points (indented with spaces/tabs before - or *) get smaller indent styling.
 * Falls back to plain paragraph for text without bullet markers.
 */
export default function renderFormattedText(text) {
  if (!text) return null;

  const lines = text.split('\n').filter(line => line.trim().length > 0);

  // Check if any line starts with a bullet marker
  const hasBullets = lines.some(line => /^\s*[•\-\*]\s/.test(line.trim()) || /^\s{2,}[\-\*]\s/.test(line));

  if (!hasBullets) {
    // No bullets found — render as plain text
    return (
      <p className="text-base font-medium leading-relaxed text-th-text text-left whitespace-pre-wrap break-words">
        {text}
      </p>
    );
  }

  return (
    <ul className="text-left space-y-1.5 w-full list-none p-0 m-0">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        // Detect sub-point: line starts with spaces/tabs then - or *
        const isSubPoint = /^\s{2,}[\-\*]/.test(line) || (trimmed.startsWith('-') && !trimmed.startsWith('- '));
        // Clean the bullet marker
        const cleanText = trimmed.replace(/^[•\-\*]\s*/, '').trim();

        if (!cleanText) return null;

        if (isSubPoint || (trimmed.startsWith('-') && i > 0)) {
          return (
            <li key={i} className="flex items-start gap-2 ml-5 text-th-text/80">
              <span className="text-accent mt-0.5 flex-shrink-0 text-xs">▸</span>
              <span className="text-sm leading-relaxed">{cleanText}</span>
            </li>
          );
        }

        return (
          <li key={i} className="flex items-start gap-2.5 text-th-text">
            <span className="text-primary mt-1 flex-shrink-0 text-xs">●</span>
            <span className="text-base font-medium leading-relaxed">{cleanText}</span>
          </li>
        );
      })}
    </ul>
  );
}
