import React from 'react';

/**
 * Card
 * The one card surface used everywhere in the app: white bg, 12px radius,
 * hairline border, soft shadow, 20px padding. Pass `padded={false}` for
 * cards that manage their own internal spacing (e.g. tables).
 */
export default function Card({ children, className = '', padded = true }) {
  return (
    <div className={`rounded-xl border border-slate-100 bg-white shadow-sm ${padded ? 'p-5' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      {action}
    </div>
  );
}
