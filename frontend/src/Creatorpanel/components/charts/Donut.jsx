import React from 'react';

/**
 * Donut
 * CSS conic-gradient donut chart (no chart library dependency).
 * `segments` is [{ value, color }], `centerLabel`/`centerSub` render
 * inside the punched-out middle.
 */
export default function Donut({ segments, centerLabel, centerSub }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  let acc = 0;
  const stops = segments.map((seg) => {
    const start = (acc / total) * 360;
    acc += seg.value;
    const end = (acc / total) * 360;
    return `${seg.color} ${start}deg ${end}deg`;
  }).join(', ');

  return (
    <div className="relative h-40 w-40 shrink-0 rounded-full" style={{ background: `conic-gradient(${stops})` }}>
      <div className="absolute inset-[14px] flex flex-col items-center justify-center rounded-full bg-white text-center">
        <span className="text-lg font-bold text-slate-900">{centerLabel}</span>
        {centerSub && <span className="text-[11px] text-slate-500">{centerSub}</span>}
      </div>
    </div>
  );
}
