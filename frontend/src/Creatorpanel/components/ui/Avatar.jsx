import React from 'react';

const SIZES = {
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-10 w-10 text-sm',
  xl: 'h-14 w-14 text-base',
};

const TINTS = {
  emerald: 'bg-emerald-50 text-emerald-700',
  dark: 'bg-emerald-700 text-white',
  slate: 'bg-slate-100 text-slate-500',
};

function getInitials(name) {
  if (!name || name === 'Anonymous') return null;
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

/**
 * Avatar
 * Initials-based circular avatar by default. Pass `src` to render an
 * actual image instead (e.g. a creator's uploaded profile photo) —
 * falls back to initials if the image fails to load.
 */
export default function Avatar({ name, src, size = 'md', tint = 'emerald', className = '' }) {
  const initials = getInitials(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`shrink-0 rounded-full object-cover ${SIZES[size].split(' ').slice(0, 2).join(' ')} ${className}`}
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
    );
  }

  return (
    <div className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${SIZES[size]} ${TINTS[tint]} ${className}`}>
      {initials || '?'}
    </div>
  );
}
