import React from 'react';
export default function Stars({ value, size = 14 }) {
  const full = Math.round(value);
  return (
    <span className="stars">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={"star" + (i < full ? " on" : "")} style={{ fontSize: size }}>★</span>
      ))}
    </span>
  );
}