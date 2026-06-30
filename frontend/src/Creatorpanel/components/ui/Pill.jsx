import React from 'react';

const TINTS = {
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  blue: 'bg-blue-50 text-blue-700',
  rose: 'bg-rose-50 text-rose-600',
  slate: 'bg-slate-100 text-slate-500',
};

/**
 * Pill
 * Small rounded-full label used for statuses, categories and tags
 * (e.g. "Active", "Education", "Pending"). Color comes from a fixed
 * tint palette so meaning stays consistent app-wide.
 */
export default function Pill({ children, tint = 'emerald', className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${TINTS[tint]} ${className}`}>
      {children}
    </span>
  );
}
