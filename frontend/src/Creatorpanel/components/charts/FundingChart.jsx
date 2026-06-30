import React from 'react';

/**
 * FundingChart
 * Hand-rolled SVG area chart (no recharts dependency). Takes raw point
 * values + matching labels and draws a smoothed-looking linear path
 * with a gradient fill underneath, matching the master dashboard.
 */
export default function FundingChart({ points, labels }) {
  const W = 600, H = 220, PAD = 24;
  const max = Math.max(...points) * 1.15;
  const stepX = (W - PAD * 2) / (points.length - 1);

  const coords = points.map((v, i) => {
    const x = PAD + i * stepX;
    const y = H - PAD - (v / max) * (H - PAD * 2);
    return [x, y];
  });

  const linePath = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
  const areaPath = `${linePath} L${coords[coords.length - 1][0]},${H - PAD} L${coords[0][0]},${H - PAD} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-64 w-full">
      <defs>
        <linearGradient id="fundingFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#059669" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#059669" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0, 1, 2].map((row) => (
        <g key={row}>
          <line x1={PAD} x2={W - PAD} y1={PAD + row * ((H - PAD * 2) / 2)} y2={PAD + row * ((H - PAD * 2) / 2)} stroke="#EEF1EF" strokeWidth="1" />
          <text x="0" y={PAD + row * ((H - PAD * 2) / 2) + 4} fontSize="11" fill="#9CA3A8">₹1000</text>
        </g>
      ))}

      <path d={areaPath} fill="url(#fundingFill)" />
      <path d={linePath} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {coords.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="#fff" stroke="#059669" strokeWidth="2" />
      ))}

      {labels.map((label, i) =>
        label ? (
          <text key={i} x={coords[i][0]} y={H - 4} fontSize="11" fill="#9CA3A8" textAnchor="middle">{label}</text>
        ) : null
      )}
    </svg>
  );
}
