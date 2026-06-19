import React from 'react';
export default function StatusPill({ status }) {
  const map = { verified: ["b-verified", "✓ รับรองแล้ว"], pending: ["b-pending", "รอรับรอง"], training: ["b-training", "กำลังอบรม"] };
  const [cls, txt] = map[status] || map.pending;
  return <span className={"badge " + cls}>{txt}</span>;
}