import React from 'react';
export default function SkillChips({ items, verified }) {
  return (
    <div className="tags">
      {(items || []).map((t) => {
        const v = (verified || []).includes(t);
        return <span key={t} className={"tag" + (v ? " tag-v" : "")}>{v && <span className="tv">✓ </span>}{t}</span>;
      })}
    </div>
  );
}