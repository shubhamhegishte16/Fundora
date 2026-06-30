import React from 'react';

const VARIANTS = {
  primary: 'bg-emerald-600 text-white hover:bg-emerald-700',
  outline: 'border border-emerald-600 text-emerald-700 hover:bg-emerald-50',
  ghost: 'text-slate-700 hover:bg-slate-100',
  danger: 'border border-rose-200 text-rose-600 hover:bg-rose-50',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
};

/**
 * Button
 * Pill-shaped (rounded-full) button matching the dashboard's
 * "Create Campaign" buttons. `icon` accepts an Icon component.
 */
export default function Button({ children, variant = 'primary', size = 'md', icon: IconComp, className = '', ...rest }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition-colors ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {IconComp && <IconComp className="h-4 w-4" />}
      {children}
    </button>
  );
}
