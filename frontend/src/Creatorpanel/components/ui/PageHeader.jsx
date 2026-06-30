import React from 'react';

/**
 * PageHeader
 * Title + optional subtitle on the left, optional action (usually a
 * primary Button) on the right. Used at the top of every page below
 * the global TopBar so each section reads consistently.
 */
export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
