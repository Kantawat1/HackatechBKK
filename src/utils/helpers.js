import { DIMS, CATS, CANDIDATES, VERIFIED } from './constants';

export const topKey = (s) => DIMS.map((d) => d.key).reduce((a,b) => (s[b]>s[a]?b:a), DIMS[0].key);
export const labelOf = (id) => (CATS.find((c) => c.id===id)||{}).label||id;
export const dimLabel = (k) => (DIMS.find((d) => d.key===k)||{}).label||k;
export const c2 = (now) => (now?"ok-text":"soon-text");
export const baht = (n) => "฿"+n.toLocaleString("en-US");
export const salaryStr = (s) => (s?baht(s.min)+"–"+baht(s.max):"—");

export function petalGeom(scores, size) {
  const cx=size/2,cy=size/2,r0=size*0.12,maxLen=size*0.30,labOff=size*0.07;
  const keys=DIMS.map((d)=>d.key),n=keys.length;
  return keys.map((k,i) => {
    const ang=(-90+i*(360/n))*(Math.PI/180); const len=r0+(scores[k]/100)*maxLen;
    return {key:k,ang,x1:cx+r0*Math.cos(ang),y1:cy+r0*Math.sin(ang),x2:cx+len*Math.cos(ang),y2:cy+len*Math.sin(ang),lx:cx+(r0+maxLen+labOff)*Math.cos(ang),ly:cy+(r0+maxLen+labOff)*Math.sin(ang)};
  });
}

export const matchScore = (me,job) => {
  const base=Math.round(Object.values(me.scores).reduce((a,b)=>a+b,0)/6);
  let m=Math.round(base*0.5)+30;
  if(job.cat===me.field) m+=12;
  const overlap=(me.skills||[]).filter((s)=>(job.skills||[]).includes(s)).length;
  m+=Math.min(overlap*4,12);
  if(me.salary&&me.salary.min>job.salary.max) m-=8;
  return Math.max(55,Math.min(98,m));
};

export const matchReasons = (me,job) => {
  const r=[];
  if(job.cat===me.field) r.push("สายงานตรง");
  const ov=(me.skills||[]).filter((s)=>(job.skills||[]).includes(s)).length;
  if(ov) r.push(ov+" ทักษะตรงกัน");
  if(me.salary&&me.salary.min<=job.salary.max) r.push("เงินเดือนตรงช่วง");
  r.push("เด่นเรื่อง"+dimLabel(topKey(me.scores)));
  return r.slice(0,3).join(" · ");
};

export const initPool = () => CANDIDATES.map((c) => ({ ...c, verified:!!VERIFIED[c.id], verifiedSkills:VERIFIED[c.id]||[], status:VERIFIED[c.id]?"verified":"pending", cityNote:VERIFIED[c.id]?"ผ่านตรวจสอบโดยเจ้าหน้าที่ กทม.":"" }));