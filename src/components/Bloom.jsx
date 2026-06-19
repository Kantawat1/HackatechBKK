import React from 'react';
import { topKey, dimLabel, petalGeom } from '../utils/helpers';

export default function Bloom({ scores, size = 64, labels = false }) {
  const top = topKey(scores);
  const petals = petalGeom(scores, size);
  const sw = size * 0.075;
  return (
    <svg className="bloom" width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {petals.map((p) => (
        <line key={p.key} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke={p.key === top ? "var(--honey)" : "var(--leaf)"} strokeWidth={sw} strokeLinecap="round" opacity={p.key === top ? 1 : 0.78} />
      ))}
      <circle cx={size / 2} cy={size / 2} r={size * 0.045} fill="var(--ink)" />
      {labels && petals.map((p) => {
        const anchor = Math.cos(p.ang) > 0.3 ? "start" : Math.cos(p.ang) < -0.3 ? "end" : "middle";
        const dy = Math.sin(p.ang) > 0.3 ? "0.72em" : Math.sin(p.ang) < -0.3 ? "-0.15em" : "0.35em";
        return (
          <text key={"l" + p.key} x={p.lx} y={p.ly} textAnchor={anchor} dy={dy} className="bloom-lab" fill={p.key === top ? "var(--honey-deep)" : "var(--muted)"}>
            {dimLabel(p.key)}
          </text>
        );
      })}
    </svg>
  );
}