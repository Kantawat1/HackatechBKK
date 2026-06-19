import React, { useState } from "react";
import Logo from "../../components/Logo.jsx";
import { DEMO_ACCOUNTS, ROLE_LABELS } from "../../utils/constants.js";

export default function AuthScreen({ onLogin }) {
  const [screen, setScreen] = useState("home"); // home | login | register | register-form
  const [regRole, setRegRole] = useState(null);
  const [loginRole, setLoginRole] = useState(null);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [regForm, setRegForm] = useState({username:"",password:"",confirm:""});
  const [regErr, setRegErr] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  const handleLogin = () => {
    const accs = DEMO_ACCOUNTS[loginRole]||[];
    const match = accs.find(a => a.username===loginUser && a.password===loginPass);
    if(match) { onLogin(loginRole); }
    else { setLoginErr("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"); }
  };
  const handleRegister = () => {
    if(!regForm.username.trim()) return setRegErr("กรุณากรอกชื่อผู้ใช้");
    if(regForm.password.length<6) return setRegErr("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
    if(regForm.password!==regForm.confirm) return setRegErr("รหัสผ่านไม่ตรงกัน");
    setRegErr(""); setRegSuccess(true);
  };

  if(screen==="home") return (
    <div className="auth-wrap">
      <div className="auth-card auth-home">
        <div className="auth-logo"><Logo/><div><div className="brandname">JobJing</div><div className="tagline">เจองานที่ใช่ เร็วกว่าที่คิด</div></div></div>
        <p className="auth-sub">แพลตฟอร์มจับคู่งานจากจุดเด่น + ทักษะจริง<br/>พร้อมระบบรับรองโดยกรุงเทพมหานคร</p>
        <div className="auth-actions">
          <button className="btn btn-primary btn-block" onClick={()=>setScreen("login")}>เข้าสู่ระบบ</button>
          <button className="btn btn-ghost btn-block" onClick={()=>setScreen("register")}>สมัครสมาชิก</button>
        </div>
      </div>
    </div>
  );

  if(screen==="login") return (
    <div className="auth-wrap">
      <div className="auth-card">
        <button className="auth-back" onClick={()=>{setScreen("home");setLoginErr("");setLoginUser("");setLoginPass("");setLoginRole(null);}}>← กลับ</button>
        <div className="auth-logo"><Logo/><div className="brandname">JobJing</div></div>
        <h2 className="auth-title">เข้าสู่ระบบ</h2>
        <p className="auth-sub-sm">เลือกบทบาทของคุณก่อน</p>
        <div className="role-pick">
          {Object.entries(ROLE_LABELS).map(([r,label])=>(
            <button key={r} className={"role-btn"+(loginRole===r?" on":"")} onClick={()=>{setLoginRole(r);setLoginErr("");}}>
              <span className="rb-icon">{r==="employer"?"🏢":r==="seeker"?"👤":"🏛️"}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
        {loginRole&&(
          <div className="auth-fields">
            <label className="field"><span>ชื่อผู้ใช้</span><input className="input" value={loginUser} onChange={e=>{setLoginUser(e.target.value);setLoginErr("");}} placeholder={DEMO_ACCOUNTS[loginRole][0].username}/></label>
            <label className="field"><span>รหัสผ่าน</span><input className="input" type="password" value={loginPass} onChange={e=>{setLoginPass(e.target.value);setLoginErr("");}} placeholder="รหัสผ่าน"/></label>
            {loginErr&&<div className="auth-err">{loginErr}</div>}
            <button className="btn btn-primary btn-block" onClick={handleLogin}>เข้าสู่ระบบ</button>
          </div>
        )}
        <div className="auth-switch">ยังไม่มีบัญชี? <button className="link-btn" onClick={()=>setScreen("register")}>สมัครสมาชิก</button></div>
      </div>
    </div>
  );

  if(screen==="register") return (
    <div className="auth-wrap">
      <div className="auth-card">
        <button className="auth-back" onClick={()=>{setScreen("home");setRegRole(null);}}>← กลับ</button>
        <div className="auth-logo"><Logo/><div className="brandname">JobJing</div></div>
        <h2 className="auth-title">สมัครสมาชิก</h2>
        <p className="auth-sub-sm">ฉันต้องการสมัครในฐานะ...</p>
        <div className="role-pick vertical">
          {[
            {r:"employer",icon:"🏢",title:"นายจ้าง / HR",desc:"โพสต์งาน ค้นหาผู้สมัคร จัดการการจ้างงาน"},
            {r:"seeker",  icon:"👤",title:"ผู้หางาน",     desc:"ลงประวัติ ค้นหางาน ติดตามสถานะ"},
          ].map(({r,icon,title,desc})=>(
            <button key={r} className={"role-btn-big"+(regRole===r?" on":"")} onClick={()=>setRegRole(r)}>
              <span className="rb-icon-big">{icon}</span>
              <div className="rb-text"><div className="rb-title">{title}</div><div className="rb-desc">{desc}</div></div>
              {regRole===r&&<span className="rb-check">✓</span>}
            </button>
          ))}
        </div>
        {regRole&&<button className="btn btn-primary btn-block" style={{marginTop:18}} onClick={()=>setScreen("register-form")}>ต่อไป →</button>}
        <div className="auth-switch">มีบัญชีแล้ว? <button className="link-btn" onClick={()=>setScreen("login")}>เข้าสู่ระบบ</button></div>
      </div>
    </div>
  );

  if(screen==="register-form") return (
    <div className="auth-wrap">
      <div className="auth-card">
        <button className="auth-back" onClick={()=>{setScreen("register");setRegSuccess(false);setRegErr("");setRegForm({username:"",password:"",confirm:""});}}>← กลับ</button>
        <div className="auth-logo"><Logo/></div>
        <div className="reg-role-badge"><span className="rb-icon">{regRole==="employer"?"🏢":regRole==="seeker"?"👤":"🏛️"}</span> {ROLE_LABELS[regRole]}</div>
        <h2 className="auth-title">สร้างบัญชี{regRole==="employer"?"นายจ้าง":regRole==="seeker"?"ผู้หางาน":"เจ้าหน้าที่"}</h2>
        {regSuccess?(
          <div className="reg-success">
            <div className="reg-success-icon">🎉</div>
            <div className="reg-success-title">สร้างบัญชีสำเร็จ!</div>
            <p className="reg-success-sub">ยินดีต้อนรับสู่ JobJing คุณสามารถเข้าสู่ระบบได้ทันที</p>
            <button className="btn btn-primary btn-block" onClick={()=>{onLogin(regRole);}}>เข้าสู่ระบบเลย</button>
          </div>
        ):(
          <div className="auth-fields">
            <label className="field"><span>ชื่อผู้ใช้</span><input className="input" value={regForm.username} onChange={e=>setRegForm(p=>({...p,username:e.target.value}))} placeholder="ชื่อผู้ใช้ของคุณ"/></label>
            <label className="field"><span>รหัสผ่าน</span><input className="input" type="password" value={regForm.password} onChange={e=>setRegForm(p=>({...p,password:e.target.value}))} placeholder="อย่างน้อย 6 ตัวอักษร"/></label>
            <label className="field"><span>ยืนยันรหัสผ่าน</span><input className="input" type="password" value={regForm.confirm} onChange={e=>setRegForm(p=>({...p,confirm:e.target.value}))} placeholder="กรอกรหัสผ่านอีกครั้ง"/></label>
            {regErr&&<div className="auth-err">{regErr}</div>}
            <button className="btn btn-primary btn-block" onClick={handleRegister}>สร้างบัญชี</button>
          </div>
        )}
        {!regSuccess&&<div className="auth-switch">มีบัญชีแล้ว? <button className="link-btn" onClick={()=>setScreen("login")}>เข้าสู่ระบบ</button></div>}
      </div>
    </div>
  );
  return null;
}