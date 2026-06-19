import React from 'react';
import { CATS } from '../utils/constants.js';
export default function Sel(props) {
  return (
    <select className="input sel" {...props}>
      {CATS.filter((c) => c.id !== "all" || props.withAll).map((c) => (
        <option key={c.id} value={c.id}>{c.label}</option>
      ))}
    </select>
  );
}