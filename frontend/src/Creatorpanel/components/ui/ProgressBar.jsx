import React from 'react';

/**
 * ProgressBar
 * 6px-tall rounded track used for campaign funding progress and
 * reward/badge progress. Track is bg-slate-100, fill is bg-emerald-600
 * unless overridden.
 */
export default function ProgressBar({ value, fillClassName = 'bg-emerald-600', trackClassName = 'bg-slate-100', className = '' }) {
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full ${trackClassName} ${className}`}>
      <div className={`h-full rounded-full ${fillClassName}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
