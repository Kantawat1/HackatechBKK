import React, { useState } from "react";
import Logo from "../components/Logo.jsx";
import Bloom from "../components/Bloom.jsx";
import Badge from "../components/Badge.jsx";
import SkillChips from "../components/SkillChips.jsx";
import ProfileBody from "../components/ProfileBody.jsx";
import StatusPill from "../components/StatusPill.jsx";
import Stars from "../components/Stars.jsx";
import Sel from "../components/Sel.jsx";
import {
  ROLE_LABELS, DIMS, SKILLS, STAGES, MATCHES, STATS, PLACE_BY_FIELD,
  COMPANIES_INIT, OPEN_JOBS, MY_APPS, CITY_PLACED, DEFAULT_ME, sc
} from "../utils/constants.js";
import {
  initPool, topKey, labelOf, dimLabel, c2, salaryStr, matchScore, matchReasons
} from "../utils/helpers.js";

// 🔐 สร้างเลขบัตร ปชช. ตัวอย่าง (ข้อมูลจำลองสำหรับเดโม่เท่านั้น)
const sampleNid = (seed) => {
  const n = Math.abs(((seed || 1) * 2654435761) % 1000000000000);
  const s = String(n).padStart(12, "0");
  return `1-${s.slice(0,4)}-${s.slice(4,9)}-${s.slice(9,11)}-${s.slice(11,12)}`;
};

// 🆔 จัดรูปแบบเลขบัตรประชาชนอัตโนมัติขณะพิมพ์ (D-DDDD-DDDDD-DD-D)
const formatNationalId = (raw) => {
  const digits = String(raw || "").replace(/\D/g, "").slice(0, 13);
  const parts = [digits.slice(0,1), digits.slice(1,5), digits.slice(5,10), digits.slice(10,12), digits.slice(12,13)];
  return parts.filter(Boolean).join("-");
};

export default function MainApp({ role, onLogout }) {
  const [empView, setEmpView]   = useState("talent");
  const [seekView, setSeekView] = useState("register");
  const [cityView, setCityView] = useState("queue");
  const [cat, setCat]           = useState("all");
  const [jobCat, setJobCat]     = useState("all");
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sel, setSel]           = useState(null);
  const [selCo, setSelCo]       = useState(null);
  const [rateCo, setRateCo]     = useState(null);
  const [rate, setRate]         = useState({stars:5,text:""});
  const [rateSeeker, setRateSeeker] = useState(null);            // match id ที่กำลังให้คะแนนผู้สมัคร
  const [seekerRate, setSeekerRate] = useState({stars:5,text:""});
  const [post, setPost]         = useState(false);
  const [viewMatchedJob, setViewMatchedJob] = useState(null);
  const [toast, setToast]       = useState("");
  const [companies, setCompanies] = useState(COMPANIES_INIT);
  const [pool, setPool]         = useState(initPool);
  const [cityFilter, setCityFilter] = useState("pending");
  const [cityId, setCityId]     = useState(null);
  const [vnote, setVnote]       = useState("");
  const [form, setForm]         = useState({title:"",cat:"clean",area:"",num:"1",salMin:"",salMax:"",skills:"",reqData:[]});
  
  const [myCompanyName, setMyCompanyName] = useState("ร้านป้าแดง บริการรับจ้างทั่วไป");
  const [isEditingCo, setIsEditingCo]     = useState(false);
  const [draftCo, setDraftCo]             = useState("");

  const [cityVerifyForm, setCityVerifyForm] = useState({ criminalChecked: false, identityConfirmed: false });

  // ── ข้อมูล/เอกสารที่บริษัทขอจากผู้สมัคร ──────────────────
  const REQ_DATA_OPTS = [
    ["identity",   "ยืนยันตัวตน (เลขบัตรประชาชน)"],
    ["criminal",   "ผลตรวจประวัติอาชญากรรม"],
    ["education",  "วุฒิการศึกษา / ใบรับรอง"],
    ["workhistory","ประวัติการทำงาน"],
    ["health",     "ใบรับรองแพทย์ / สุขภาพ"],
    ["ngo",        "หนังสือรับรองจากหน่วยงาน / NGO"],
  ];
  const reqDataLabel = (k) => (REQ_DATA_OPTS.find(([id]) => id === k) || [k, k])[1];
  const toggleReqData = (k) => setForm((p) => ({ ...p, reqData: p.reqData.includes(k) ? p.reqData.filter((x) => x !== k) : [...p.reqData, k] }));

  // ── หมวดงานเพิ่มเติม (งานบริการ/แรงงานรายย่อย ที่ไม่ต้องใช้วุฒิ) ──
  const EXTRA_CATS = {
    garden:   "ตัดหญ้า / ดูแลสวน",
    clean:    "แม่บ้าน / ทำความสะอาด",
    kitchen:  "ผู้ช่วยครัว / ล้างจาน",
    labor:    "แรงงานทั่วไป / ยกของ",
    care:     "ดูแลผู้สูงอายุ / เด็ก",
    delivery: "ส่งของ / เดินเอกสาร",
  };
  const catLabel = (k) => EXTRA_CATS[k] || labelOf(k);

  // ── ยืนยันตัวตนผู้ว่าจ้างกับ กทม. (บุคคลธรรมดา / SME) ──────
  const COMPANY_VERIFS_INIT = [
    { id:"cv1", mine:false, kind:"individual", name:"สมชาย ใจดี", nationalId:"1-1009-01xxx-xx-x", ind:"นายจ้างบุคคลธรรมดา", address:"แขวงคลองจั่น เขตบางกะปิ กรุงเทพฯ", contact:"081-234-xxxx", purpose:"จ้างคนตัดหญ้า ดูแลสวนหน้าบ้าน เดือนละ 2 ครั้ง", status:"pending" },
    { id:"cv2", mine:false, kind:"individual", name:"วรรณา ศรีสุข", nationalId:"3-1015-00xxx-xx-x", ind:"นายจ้างบุคคลธรรมดา", address:"แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ", contact:"089-555-xxxx", purpose:"จ้างแม่บ้านทำความสะอาดคอนโด สัปดาห์ละ 1 วัน", status:"pending" },
    { id:"cv3", mine:false, kind:"sme", name:"ร้านข้าวแกงป้านิด", regNo:"0993000123457", ind:"ร้านอาหารรายย่อย", address:"แขวงคลองเตย เขตคลองเตย กรุงเทพฯ", contact:"คุณนิด · 086-777-xxxx", email:"-", size:"ต่ำกว่า 5 คน", desc:"ร้านข้าวแกงเล็ก ต้องการคนล้างจาน/ผู้ช่วยครัว พาร์ทไทม์", status:"pending" },
    { id:"cv4", mine:false, kind:"sme", name:"หอพักสะอาดใจ", regNo:"0105560098842", ind:"หอพัก / อสังหาฯ รายย่อย", address:"แขวงสามเสนนอก เขตห้วยขวาง กรุงเทพฯ", contact:"คุณเอก · 02-274-xxxx", email:"sa-ardjai@mail.com", size:"5–10 คน", desc:"หอพักรายย่อย ต้องการแม่บ้านดูแลความสะอาดส่วนกลาง", status:"verified" },
  ];
  const [companyVerifs, setCompanyVerifs] = useState(COMPANY_VERIFS_INIT);
  const [coReviewId, setCoReviewId]       = useState(null);
  const [coReviewChecks, setCoReviewChecks] = useState({ regValid:false, addrValid:false, statusActive:false });
  const [coReviewNote, setCoReviewNote]   = useState("");
  const [coVerifyFilter, setCoVerifyFilter] = useState("pending");

  // สถานะการยืนยัน "บัญชีผู้ว่าจ้างของฉัน" (ฝั่งนายจ้าง)
  const [myCoStatus, setMyCoStatus]       = useState("unverified"); // unverified | pending | verified | rejected
  const [myCoRejectReason, setMyCoRejectReason] = useState("");
  const [coVerifyModal, setCoVerifyModal] = useState(false);
  const [coVerifyForm, setCoVerifyForm]   = useState({ kind:"sme", name:"", nationalId:"", regNo:"", ind:"บริการ / แรงงานรายย่อย", address:"", contact:"", email:"", size:"", purpose:"", desc:"" });
  const blankCoForm = () => ({ kind:"sme", name:myCompanyName, nationalId:"", regNo:"", ind:"บริการ / แรงงานรายย่อย", address:"", contact:"", email:"", size:"", purpose:"", desc:"" });

  const [matchesList, setMatchesList] = useState(() => 
    MATCHES.map((m, i) => ({ 
      ...m, 
      id: i, 
      dataRequestStatus: "none", 
      releasedCitizenId: "", 
      releasedCriminalReport: "",
      completed: false,        // งานปิด/จบแล้วหรือยัง — เงื่อนไขปลดล็อกการให้คะแนน
      seekerRating: null       // คะแนนที่นายจ้างให้ผู้สมัคร (ให้ได้หลังงานจบเท่านั้น)
    }))
  );

  const [stagePrompt, setStagePrompt]     = useState(null);
  const [stageInput, setStageInput]       = useState("");
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Modal สำหรับดูรายละเอียดงานในหน้ารีวิวบริษัท
  const [selJobDetail, setSelJobDetail] = useState(null);

  const [myJobs, setMyJobs]     = useState([
    {id:1,title:"คนตัดหญ้า / ดูแลสวน",cat:"garden",area:"เขตบางกะปิ",salary:{min:9000,max:13000},matched:4,status:"open",reqData:["identity","criminal"]},
    {id:2,title:"แม่บ้านทำความสะอาด (รายวัน)",cat:"clean",area:"เขตห้วยขวาง",salary:{min:12000,max:16000},matched:6,status:"open",reqData:["identity"]},
    {id:3,title:"ผู้ช่วยครัว / ล้างจาน",cat:"kitchen",area:"เขตคลองเตย",salary:{min:11000,max:14000},matched:3,status:"open",reqData:["identity","health"]},
  ]);
  const [step, setStep]         = useState(1);
  const [intake, setIntake]     = useState({name:"",id:"",age:"",sex:"ไม่ระบุ",phone:"",area:"",field:"clean",exp:"",expText:"",skills:[],custom:"",availType:"now",salMin:"",salMax:"",scores:sc(50,50,50,50,50,50),pdpaConsent:false});
  const [me, setMe]             = useState(DEFAULT_ME);

  const ping = (msg) => { setToast(msg); setTimeout(()=>setToast(""),3400); };
  const coById = (id) => companies.find((c)=>c.id===id)||{};
  const openCountOf = (id) => OPEN_JOBS.filter((j)=>j.coId===id).length;
  const availText = (t) => (t==="now"?"พร้อมเริ่มทันที":t==="3d"?"พร้อมใน 3 วัน":"พร้อมใน 1 สัปดาห์");
  const talent = pool.filter((c)=>cat==="all"||c.cat===cat).filter((c)=>!onlyVerified||c.verified);

  const handlePassClick = (id, currentStage) => {
    const nextMap = {
      "เสนอแล้ว": "นัดสัมภาษณ์",
      "นัดสัมภาษณ์": "ทดลองงาน",
      "ทดลองงาน": "จ้างแล้ว"
    };
    const nextStage = nextMap[currentStage];
    if (nextStage) {
      setStagePrompt({ id, nextStage });
      setStageInput("");
    }
  };

  const confirmStageMove = () => {
    if (!stagePrompt) return;
    const notePrefix = stagePrompt.nextStage === "นัดสัมภาษณ์" ? "นัด " :
                       stagePrompt.nextStage === "ทดลองงาน" ? "ทดลองงาน " :
                       stagePrompt.nextStage === "จ้างแล้ว" ? "เริ่ม " : "";
    const finalNote = stageInput.trim() ? notePrefix + stageInput.trim() : `อัปเดตเป็น: ${stagePrompt.nextStage}`;
    setMatchesList(prev => prev.map(m => m.id === stagePrompt.id ? { ...m, stage: stagePrompt.nextStage, note: finalNote } : m));
    ping(`เลื่อนสถานะเป็น "${stagePrompt.nextStage}" แล้ว`);
    setStagePrompt(null);
  };

  const rejectMatch = (id) => {
    setMatchesList(prev => prev.filter(m => m.id !== id));
    ping("ปฏิเสธผู้สมัครแล้ว ระบบจะนำรายชื่อออก");
  };

  const requestCitizenData = (matchId) => {
    setMatchesList(prev => prev.map(m => m.id === matchId ? { ...m, dataRequestStatus: "pending_city_release" } : m));
    ping("ส่งคำขอตรวจสอบและขอดึงข้อมูลประวัติบุคคลไปยังเจ้าหน้าที่ กทม. แล้ว");
  };

  const handleCityDataRelease = (matchId, approved) => {
    setMatchesList(prev => prev.map(m => {
      if (m.id === matchId) {
        return { 
          ...m, 
          dataRequestStatus: approved ? "released" : "rejected",
          releasedCitizenId: approved ? sampleNid(m.id) : "",
          releasedCriminalReport: approved ? "ผ่านการตรวจสอบ (ไม่พบประวัติอาชญากรรมที่เป็นภัย)" : ""
        };
      }
      return m;
    }));
    ping(approved ? "อนุมัติและส่งมอบแฟ้มข้อมูลบุคคลให้บุคคล/SMEปลายทางแล้ว" : "ปฏิเสธคำขอเข้าถึงข้อมูลบุคคล");
  };

  const submitJob = () => {
    if(!form.title.trim()) return;
    const sal={min:+form.salMin||0,max:+form.salMax||0};
    setMyJobs([{id:Date.now(),title:form.title.trim(),cat:form.cat,area:form.area||"—",salary:sal,matched:Math.floor(Math.random()*8)+1,status:"open",reqData:[...form.reqData]},...myJobs]);
    setPost(false); ping(`โพสต์ตำแหน่ง "${form.title.trim()}" แล้ว · ระบบกำลังจับคู่ผู้สมัครให้`);
    setForm({title:"",cat:"clean",area:"",num:"1",salMin:"",salMax:"",skills:"",reqData:[]});
  };

  // โพสต์ได้เลยโดยไม่ต้องรอ กทม. ยืนยันก่อน (การยืนยันเป็นแบบสมัครใจ/ทำภายหลังได้)
  const tryPost = () => {
    setPost(true);
  };

  // นายจ้างส่งข้อมูลบริษัทให้ กทม. ตรวจสอบ
  const submitCompanyVerify = () => {
    const f = coVerifyForm;
    if (f.kind === "individual" && !f.nationalId.trim()) { ping("กรอกเลขบัตรประชาชน 13 หลักก่อน"); return; }
    if (f.kind === "sme" && !f.regNo.trim()) { ping("กรอกเลขทะเบียนนิติบุคคล 13 หลักก่อน"); return; }
    const nm = (f.name || "").trim() || myCompanyName;
    const entry = f.kind === "individual"
      ? { id:"mine", mine:true, kind:"individual", name:nm, status:"pending", nationalId:f.nationalId.trim(), ind:"นายจ้างบุคคลธรรมดา", address:f.address||"—", contact:f.contact||"—", purpose:f.purpose||"—" }
      : { id:"mine", mine:true, kind:"sme", name:nm, status:"pending", regNo:f.regNo.trim(), ind:f.ind||"—", address:f.address||"—", contact:f.contact||"—", email:f.email||"—", size:f.size||"—", desc:f.desc||"—" };
    setCompanyVerifs((prev) => [entry, ...prev.filter((c) => c.id !== "mine")]);
    setMyCompanyName(nm);
    setMyCoStatus("pending");
    setMyCoRejectReason("");
    setCoVerifyModal(false);
    ping(`ส่งคำขอยืนยันตัวตน (${f.kind === "individual" ? "บุคคลธรรมดา" : "SME"}) ไปยัง กทม. แล้ว · รอเจ้าหน้าที่ตรวจสอบ`);
  };

  const openCoReview = (c) => {
    setCoReviewId(c.id);
    setCoReviewChecks({ regValid:false, addrValid:false, statusActive:false });
    setCoReviewNote("");
  };

  // กทม. อนุมัติ / ปฏิเสธบริษัท
  const decideCompany = (id, approved, reason) => {
    setCompanyVerifs((prev) => prev.map((c) => c.id === id ? { ...c, status: approved ? "verified" : "rejected", rejectReason: approved ? "" : (reason || "ข้อมูลไม่ครบถ้วน") } : c));
    const co = companyVerifs.find((c) => c.id === id);
    if (co && co.mine) {
      setMyCoStatus(approved ? "verified" : "rejected");
      setMyCoRejectReason(approved ? "" : (reason || "ข้อมูลไม่ครบถ้วน"));
    }
    setCoReviewId(null);
    ping(approved ? `ยืนยันตัวตนของ ${co ? co.name : ""} เรียบร้อยแล้ว` : `ส่งคืนคำขอของ ${co ? co.name : ""} เพื่อแก้ไข`);
  };
  const toggleSkill = (s) => setIntake((p)=>({...p,skills:p.skills.includes(s)?p.skills.filter(x=>x!==s):[...p.skills,s]}));
  const addCustom = () => { const v=intake.custom.trim(); if(v&&!intake.skills.includes(v)){setIntake(p=>({...p,skills:[...p.skills,v],custom:""}));} };
  
  const submitIntake = () => {
    const sk=intake.skills.length?intake.skills:[dimLabel(topKey(intake.scores))];
    const profile={name:intake.name.trim()||"ผู้สมัครใหม่",field:intake.field,area:intake.area||"—",exp:intake.exp?+intake.exp:null,head:`สนใจงาน${labelOf(intake.field)} · เด่นเรื่อง${dimLabel(topKey(intake.scores))}`,skills:sk,salary:{min:+intake.salMin||0,max:+intake.salMax||0},scores:{...intake.scores},availNow:intake.availType==="now",avail:availText(intake.availType),story:intake.expText||"—",roles:[{title:labelOf(intake.field),m:88}],citizenId:intake.id,
    phone:intake.phone,verified:false,identityVerified:false,verifiedSkills:[],cityNote:"",sample:false};
    setMe(profile); setSeekView("profile"); ping("ส่งโปรไฟล์แล้ว · รอเจ้าหน้าที่ กทม. รับรอง แล้วเราจะจับคู่งานให้");
  };
  const editProfile = () => {
    setIntake({...intake,name:me.sample?"":me.name,id:me.citizenId||"",field:me.field,area:me.area==="—"?"":me.area,exp:me.exp||"",skills:[...(me.skills||[])],expText:me.story==="—"?"":me.story,availType:me.availNow?"now":me.avail.includes("3 วัน")?"3d":"1w",salMin:me.salary?String(me.salary.min):"",salMax:me.salary?String(me.salary.max):"",pdpaConsent:false});
    setStep(1); setSeekView("register");
  };
  const submitReview = () => {
    if(!rateCo) return;
    setCompanies((prev)=>prev.map((c)=>{
      if(c.id!==rateCo) return c;
      const count=c.count+1; const rating=Math.round(((c.rating*c.count+rate.stars)/count)*10)/10;
      const reviews=[{role:"พนักงาน",rating:rate.stars,text:rate.text.trim()||"—",date:"มิ.ย. 2026"},...c.reviews];
      return {...c,count,rating,reviews};
    }));
    const name=coById(rateCo).name;
    setRateCo(null); setRate({stars:5,text:""}); ping(`ขอบคุณที่รีวิว ${name}`);
  };

  // ── ปิดงาน: เปลี่ยนสถานะการจ้างเป็น "งานจบแล้ว" ──────────────
  // ป้องกันรีวิวปลอม: นายจ้างให้คะแนนผู้สมัครได้ต่อเมื่องานจบจริงเท่านั้น
  const markJobComplete = (matchId) => {
    setMatchesList(prev => prev.map(m => m.id === matchId ? { ...m, completed: true } : m));
    ping("ปิดงานเรียบร้อย · ตอนนี้ให้คะแนนผู้สมัครจากงานจริงได้แล้ว");
  };

  const openSeekerRate = (matchId) => {
    setRateSeeker(matchId);
    setSeekerRate({ stars: 5, text: "" });
  };

  // ── นายจ้างให้คะแนนผู้สมัคร (ผูกกับงานที่จบจริง = รีวิวที่ตรวจสอบได้) ──
  const submitSeekerReview = () => {
    if (rateSeeker === null) return;
    const m = matchesList.find(x => x.id === rateSeeker);
    setMatchesList(prev => prev.map(x => x.id === rateSeeker
      ? { ...x, seekerRating: { stars: seekerRate.stars, text: seekerRate.text.trim() || "—", date: "มิ.ย. 2026", verified: true } }
      : x));
    setRateSeeker(null); setSeekerRate({ stars: 5, text: "" });
    ping(`ให้คะแนน ${m ? m.cand : "ผู้สมัคร"} แล้ว · รีวิวนี้ผูกกับการจ้างงานจริง`);
  };

  const openCity = (c) => { 
    setCityId(c.id); 
    setVnote(""); 
    setCityVerifyForm({ criminalChecked: c.criminalChecked || false, identityConfirmed: c.identityVerified || false });
  };
  
  const qualify = () => {
    setPool((prev)=>
      prev.map((c)=>
        c.id===cityId
          ? {
              ...c,
              verified: true,
              identityVerified: cityVerifyForm.identityConfirmed,
              criminalChecked: cityVerifyForm.criminalChecked,
              status: "verified",
              cityNote: vnote || "ผ่านการยืนยันตัวตนและตรวจประวัติอาชญากรรมโดย กทม."
            }
          : c
      )
    );
    const nm=(pool.find(c=>c.id===cityId)||{}).name;
    setCityId(null); 
    ping(`ยืนยันตัวตนและตรวจประวัติของ ${nm} เรียบร้อยแล้ว`);
  };
  
  const live = {name:intake.name.trim()||"โปรไฟล์ของคุณ",field:intake.field,scores:intake.scores,skills:intake.skills,salary:{min:+intake.salMin||0,max:+intake.salMax||0}};
  const empTabs = [["talent","ผู้สมัคร"],["jobs","ตำแหน่งงานของฉัน"],["matches","การจับคู่"],["impact","ผลลัพธ์"]];
  const seekTabs= [["register","ลงทะเบียน / กรอกข้อมูล"],["profile","โปรไฟล์ของฉัน"],["jobs","หางาน"],["companies","บุคคล/SMEที่เปิดรับ"],["status","สถานะใบสมัคร"]];
  const cityTabs= [["queue","คิวรับรองผู้สมัคร"], ["companies","คิวรับรองผู้ว่าจ้าง"], ["requests","คำขอข้อมูลจากนายจ้าง"], ["dash","ภาพรวม"]];
  
  const roleTabs= role==="employer"?empTabs:role==="seeker"?seekTabs:cityTabs;
  const activeOf = (id) => (role==="employer"?empView:role==="seeker"?seekView:cityView)===id;
  const setView  = (id) => (role==="employer"?setEmpView:role==="seeker"?setSeekView:setCityView)(id);
  const seekerJobs = OPEN_JOBS.filter((j)=>jobCat==="all"||j.cat===jobCat).map((j)=>({...j,m:matchScore(me,j),co:coById(j.coId)})).sort((a,b)=>b.m-a.m);
  const queue = pool.filter((c)=>cityFilter==="all"?true:c.status===cityFilter);
  const cnt = (s) => pool.filter((c)=>c.status===s).length;
  const coCnt = (s) => companyVerifs.filter((c)=>c.status===s).length;
  const coQueue = companyVerifs.filter((c)=>coVerifyFilter==="all"?true:c.status===coVerifyFilter);

  return (
    <div className="app">
      <header className="header">
        <div className="wrap head-in">
          <div className="brand"><Logo/><div><div className="brandname">JobJing</div><div className="tagline">หางานจริง คนจริง การันตีโดย กทม.</div></div></div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div className="role-indicator"><span className="ri-dot"/>{ROLE_LABELS[role]}</div>
            <button className="btn btn-ghost btn-sm" onClick={onLogout}>ออกจากระบบ</button>
          </div>
        </div>
        <div className="wrap"><nav className="nav" aria-label="เมนู">{roleTabs.map(([id,t])=>(<button key={id} className={"tab"+(activeOf(id)?" active":"")} onClick={()=>setView(id)}>{t}</button>))}</nav></div>
      </header>
      <main className="wrap main">
        {/* EMPLOYER: talent */}
        {role==="employer"&&empView==="talent"&&(
          <><div className="diff-bar"><b>JobJing · หางานจริง คนจริง การันตีโดย กทม</b></div>
          <div className="row-head"><p className="lead nomb">คนเก่งที่พร้อมเริ่มงาน <b>{talent.length}</b> คน</p>
          <div className="controls"><button className={"toggle"+(onlyVerified?" on":"")} onClick={()=>setOnlyVerified(!onlyVerified)}><span className="tg-check">{onlyVerified?"✓":"○"}</span> รับรองโดย กทม. เท่านั้น</button><label className="catpick"><span>สายงาน</span><Sel withAll value={cat} onChange={e=>setCat(e.target.value)}/></label></div></div>
          {talent.length===0?(<div className="empty">ไม่พบผู้สมัครตามเงื่อนไข — ลองปรับตัวกรอง หรือโพสต์ตำแหน่งเพื่อให้เราช่วยหา</div>):(
            <div className="grid">{talent.map((c,i)=>(
              <button key={c.id} className="cand" style={{animationDelay:i*0.05+"s"}} onClick={()=>setSel(c)}>
                <div className="cand-top">
                  <div>
                    <div className="cand-name">
                      {c.name} 
                    </div>
                    <div className="cand-head">{c.head}</div>
                  </div>
                  <Bloom scores={c.scores} size={60}/>
                </div>
                {c.verified&&<div className="card-badge"><Badge/></div>}
                <div className="topstr"><span className="spark">●</span> เด่นเรื่อง<b>{dimLabel(topKey(c.scores))}</b></div>
                <SkillChips items={c.skills.slice(0,3)}/>
                <div className="salline">{salaryStr(c.salary)} <span className="muted-s">ต่อเดือน</span></div>
                <div className="meta"><span className={"dot "+(c.availNow?"ok":"soon")}/><span className={c2(c.availNow)}>{c.avail}</span><span className="sep">·</span><span>{c.area}</span><span className="go">ดูโปรไฟล์ →</span></div>
              </button>
            ))}</div>
          )}</>
        )}

        {/* EMPLOYER: jobs */}
        {role==="employer"&&empView==="jobs"&&(
          <>
          {/* แถบสถานะการยืนยันตัวตนผู้ว่าจ้างโดย กทม. */}
          {myCoStatus === "verified" ? (
            <div className="diff-bar city" style={{background:"#e6f4ea", border:"1px solid #137333", color:"#137333"}}>
              <span className="gov-tag" style={{background:"#137333"}}>กทม.</span>
              <span><b>ยืนยันตัวตนแล้ว</b> · ผู้สมัครและ กทม. เห็นเครื่องหมายรับรองนี้บนประกาศงานของคุณ</span>
            </div>
          ) : (
            <div className="panelcard" style={{borderLeft:"4px solid #b06000", background:"#fffdec", marginBottom:16}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:16, flexWrap:"wrap"}}>
                <div>
                  <div style={{fontWeight:"bold", color:"#202124", fontSize:15, marginBottom:4}}>
                    {myCoStatus === "pending" ? "⏳ อยู่ระหว่างรอ กทม. ตรวจสอบตัวตน"
                      : myCoStatus === "rejected" ? "↩️ กทม. ส่งคืนคำขอเพื่อแก้ไข"
                      : "⚠️ บัญชีผู้ว่าจ้างยังไม่ได้รับการยืนยันจาก กทม."}
                  </div>
                  <div style={{fontSize:13, color:"var(--muted)"}}>
                    {myCoStatus === "pending" ? "เจ้าหน้าที่กำลังตรวจสอบตัวตน โพสต์ตำแหน่งได้เมื่อรับรองแล้ว"
                      : myCoStatus === "rejected" ? `เหตุผล: ${myCoRejectReason || "ข้อมูลไม่ครบถ้วน"} — แก้ไขและส่งใหม่ได้`
                      : "โพสต์งานได้เลยทันที — แต่แนะนำให้ยืนยันตัวตนกับ กทม. เพื่อรับเครื่องหมายรับรองบนประกาศงาน ช่วยให้ผู้สมัครเชื่อมั่นมากขึ้น โดยเฉพาะงานในบ้าน"}
                  </div>
                </div>
                {myCoStatus !== "pending" && (
                  <button className="btn btn-primary" onClick={() => { setCoVerifyForm(blankCoForm()); setCoVerifyModal(true); }}>
                    {myCoStatus === "rejected" ? "แก้ไขและส่งใหม่" : "ยืนยันตัวตนกับ กทม."}
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="corating">
            <div className="cr-left">
              <div className="co-logo sm">{myCompanyName[0] || "R"}</div>
              <div>
                {isEditingCo ? (
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input 
                      className="input" 
                      style={{ padding: "4px 8px", fontSize: "14px" }} 
                      value={draftCo} 
                      onChange={e => setDraftCo(e.target.value)} 
                      autoFocus 
                    />
                    <button className="btn btn-primary sm" onClick={() => { setMyCompanyName(draftCo || myCompanyName); setIsEditingCo(false); }}>บันทึก</button>
                    <button className="btn btn-ghost sm" onClick={() => setIsEditingCo(false)}>ยกเลิก</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div className="cr-name">{myCompanyName}</div>
                    <button className="btn btn-ghost sm" style={{ padding: "2px 6px", fontSize: "12px", border: "1px solid var(--line)" }} onClick={() => { setDraftCo(myCompanyName); setIsEditingCo(true); }}>
                      แก้ไข
                    </button>
                  </div>
                )}
                <div style={{fontSize:13,color:"var(--muted)"}}>โรงแรม / ท่องเที่ยว</div>
              </div>
            </div>
            <div className="cr-right"><Stars value={4.4} size={16}/><b className="cr-num">4.4</b></div>
          </div>

          <div className="row-head"><p className="lead nomb">ตำแหน่งที่เปิดรับ <b>{myJobs.filter(j=>j.status==="open").length}</b> ตำแหน่ง</p><button className="btn btn-primary" onClick={tryPost}>+ โพสต์ตำแหน่งใหม่</button></div>
          <div className="joblist">{myJobs.map((j)=>(
            <article key={j.id} className="jobcard"><div className="jc-main"><div className="jc-top"><span className="jc-title">{j.title}</span><span className={"badge "+(j.status==="open"?"b-open":"b-closed")}>{j.status==="open"?"เปิดรับ":"ปิดแล้ว"}</span></div><div className="jc-meta"><span className="tag">{catLabel(j.cat)}</span><span className="sep">·</span><span>{j.area}</span><span className="sep">·</span><span>{salaryStr(j.salary)}</span></div>
            {j.reqData && j.reqData.length > 0 && (
              <div style={{marginTop:8, display:"flex", flexWrap:"wrap", gap:6, alignItems:"center"}}>
                <span style={{fontSize:11, color:"var(--muted)"}}>🔒 ขอข้อมูล:</span>
                {j.reqData.map((k) => (
                  <span key={k} style={{fontSize:11, padding:"2px 8px", background:"#eef2f7", color:"#3c4043", borderRadius:12, border:"1px solid var(--line)"}}>{reqDataLabel(k)}</span>
                ))}
              </div>
            )}
            </div>
            <div className="jc-side">
              <button className="btn btn-ghost sm" onClick={() => setViewMatchedJob(j)}>
                <span className="jc-matched"><b>{j.matched}</b> ผู้สมัครที่ตรงกัน →</span>
              </button>
            </div>
            </article>
          ))}</div></>
        )}

        {/* EMPLOYER: matches */}
        {role==="employer"&&empView==="matches"&&(
          <><p className="lead">บริหารจัดการกระบวนการจ้างงาน: เลื่อนสถานะ ยื่นขอเอกสารระบุตัวตน/ผลตรวจประวัติจาก กทม. และเมื่อ <b>ปิดงาน</b> แล้วจึงให้คะแนนผู้สมัครได้ — รีวิวจะผูกกับการจ้างจริง เพื่อ<b>กันรีวิวปลอม</b></p>
          <div className="pipeline">{STAGES.map((st,si)=>{
            const items=matchesList.filter(m=>m.stage===st);
            return(
            <section key={st} className="col">
              <div className="col-head"><span className={"sdot s"+si}/>{st}<span className="count">{items.length}</span></div>
              {items.map((m)=>(
                <article key={m.id} className="mcard">
                  <div className="mscore">{m.m}% ตรงกัน</div>
                  <div className="mcand">{m.cand}</div>
                  <div className="mrole">{m.role}</div>
                  <div className="mco">{myCompanyName}</div>
                  <div className="mnote">{m.note}</div>
                  
                  <div style={{marginTop: 12, padding: 10, background: "#f8f9fa", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 12}}>
                    {(!m.dataRequestStatus || m.dataRequestStatus === "none") && (
                      <button 
                        className="btn btn-ghost sm" 
                        style={{width:"100%", border:"1px solid var(--line)", background:"#fff", padding:"4px 0"}}
                        onClick={() => requestCitizenData(m.id)}
                      >
                        🔒 ขอประวัติ & ข้อมูลระบุตัวตน
                      </button>
                    )}
                    {m.dataRequestStatus === "pending_city_release" && (
                      <div style={{color: "#b06000", fontWeight: "bold", textAlign:"center"}}>⏳ รอ กทม. อนุมัติเอกสาร...</div>
                    )}
                    {m.dataRequestStatus === "released" && (
                      <div style={{color: "#137333"}}>
                        <div style={{fontWeight:"bold"}}>✓ กทม. ส่งมอบข้อมูลแล้ว:</div>
                        <div style={{fontFamily:"monospace", background:"#fff", padding:"4px", border:"1px solid #ced4da", borderRadius:4, marginTop:4, fontSize:11}}>
                          <b>เลขบัตร:</b> {m.releasedCitizenId}<br/>
                          <b>ประวัติ:</b> {m.releasedCriminalReport}
                        </div>
                      </div>
                    )}
                    {m.dataRequestStatus === "rejected" && (
                      <div style={{color: "var(--fire)", fontWeight:"bold", textAlign:"center"}}>✕ กทม. ปฏิเสธการเปิดเผยข้อมูล</div>
                    )}
                  </div>

                  {st !== "จ้างแล้ว" && (
                    <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                      <button className="btn btn-primary sm" style={{ flex: 1, padding: "5px" }} onClick={() => handlePassClick(m.id, m.stage)}>✓ ผ่าน</button>
                      <button className="btn btn-ghost sm" style={{ flex: 1, padding: "5px", backgroundColor: "var(--surface)" }} onClick={() => rejectMatch(m.id)}>✕ ไม่ผ่าน</button>
                    </div>
                  )}

                  {/* 🌟 ปิดงาน + ให้คะแนนผู้สมัคร (เฉพาะสถานะ "จ้างแล้ว") */}
                  {st === "จ้างแล้ว" && (
                    <div style={{marginTop:14}}>
                      {!m.completed ? (
                        <button
                          className="btn btn-primary sm"
                          style={{width:"100%", padding:"6px"}}
                          onClick={() => markJobComplete(m.id)}
                        >
                          🏁 ปิดงาน (งานจบแล้ว)
                        </button>
                      ) : m.seekerRating ? (
                        <div style={{background:"#e6f4ea", border:"1px solid #137333", borderRadius:8, padding:"8px 10px"}}>
                          <div style={{display:"flex", alignItems:"center", gap:6, marginBottom:4}}>
                            <Stars value={m.seekerRating.stars} size={14}/>
                            <b style={{color:"#137333", fontSize:13}}>{m.seekerRating.stars.toFixed(1)}</b>
                          </div>
                          <div style={{fontSize:11, color:"#137333", fontWeight:"bold"}}>✓ รีวิวจากงานจริง (ตรวจสอบได้ · กันรีวิวปลอม)</div>
                          {m.seekerRating.text !== "—" && (
                            <div style={{fontSize:12, color:"#3c4043", marginTop:4}}>“{m.seekerRating.text}”</div>
                          )}
                        </div>
                      ) : (
                        <button
                          className="btn btn-primary sm"
                          style={{width:"100%", padding:"6px", background:"var(--honey, #f0a500)"}}
                          onClick={() => openSeekerRate(m.id)}
                        >
                          ⭐ ให้คะแนนผู้สมัคร
                        </button>
                      )}
                    </div>
                  )}
                </article>
              ))}
              {items.length===0&&<div className="col-empty">ยังไม่มีรายการ</div>}
            </section>
          );})}</div></>
        )}

        {/* EMPLOYER: impact */}
        {role==="employer"&&empView==="impact"&&(
          <><p className="lead">JobJing ช่วยให้บุคคล/SMEเจอคนที่ใช่ และคนเจองานที่ใช่ ได้เร็วขึ้น</p>
          <div className="stats">{STATS.map((s)=>(<div key={s.label} className="stat"><div className="stat-num">{s.num}</div><div className="stat-label">{s.label}</div></div>))}</div>
          <div className="panelcard"><h3 className="ph">การจ้างงานแยกตามสายงาน (เดือนนี้)</h3>
          <div className="chart">{PLACE_BY_FIELD.map((r,i)=>{const max=Math.max(...PLACE_BY_FIELD.map(x=>x.v));return(<div key={r.l} className="chartrow"><span className="clabel">{r.l}</span><span className="cbar"><span className="cbar-fill" style={{width:(r.v/max*100)+"%",background:i===0?"var(--leaf)":"var(--leaf-soft)",border:i===0?"none":"1px solid var(--leaf)"}}/></span><span className="cval">{r.v}</span></div>);})}</div>
          <p className="foot">ร่วมกับกรุงเทพมหานครและภาคีเครือข่าย เพื่อการจ้างงานที่เป็นธรรมและยั่งยืน</p></div></>
        )}
        
        {/* SEEKER: register */}
        {role==="seeker"&&seekView==="register"&&(
          <><p className="lead">กรอกข้อมูลของคุณ ระบบจะสรุป "จุดเด่น" และจับคู่งานที่เหมาะให้ <b>(ขั้นที่ {step} / 6)</b></p>
          <div className="pbar"><span className="pbar-fill" style={{width:(step/6)*100+"%"}}/></div>
          <div className="intake">
            <div className="intake-form">
              {step===1&&(<div className="form-card"><h3 className="ph">1 · ข้อมูลส่วนตัว</h3><label className="field"><span>ชื่อ (นามแฝง)</span><input className="input" value={intake.name} onChange={e=>setIntake(p=>({...p,name:e.target.value}))} placeholder="ชื่อของคุณ"/></label>
              <label className="field"><span>บัตรประชาชน (13 หลัก) <small style={{color:'var(--muted)'}}>*กทม. จะเก็บรักษาเป็นความลับ และส่งต่อให้บุคคล/SMEเมื่ออนุมัติรายกรณีเท่านั้น</small></span><input className="input" value={intake.id} onChange={e=>setIntake(p=>({...p,id:e.target.value}))} placeholder="เลขบัตรประชาชนสำหรับตรวจสอบสิทธิ์"/></label>
              <div className="field-row"><label className="field"><span>อายุ</span><input className="input" type="number" value={intake.age} onChange={e=>setIntake(p=>({...p,age:e.target.value}))} placeholder="25"/></label><label className="field"><span>เพศ</span><select className="input" value={intake.sex} onChange={e=>setIntake(p=>({...p,sex:e.target.value}))}><option>ไม่ระบุ</option><option>ชาย</option><option>หญิง</option></select></label></div><label className="field"><span>เบอร์ติดต่อ (ส่วนตัว)</span><input className="input" value={intake.phone} onChange={e=>setIntake(p=>({...p,phone:e.target.value}))} placeholder="08x-xxx-xxxx"/></label><label className="field"><span>เขตที่สะดวกเดินทาง</span><input className="input" value={intake.area} onChange={e=>setIntake(p=>({...p,area:e.target.value}))} placeholder="เขตพระนคร"/></label>
              <div style={{marginTop:20,padding:"16px",background:"#f0f7ff",border:"1px solid #b6d4fe",borderRadius:10}}>
                <div style={{fontWeight:"bold",fontSize:13.5,color:"#1a3c6e",marginBottom:8}}>🔐 ความยินยอมตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA) พ.ศ. 2562</div>
                <p style={{fontSize:12.5,color:"#344054",lineHeight:1.75,marginBottom:12}}>
                  ข้าพเจ้ายินยอมให้ <b>JobJing</b> และ <b>กรุงเทพมหานคร (กทม.)</b> เก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคล ได้แก่ ชื่อ-นามสกุล เลขบัตรประชาชน หมายเลขโทรศัพท์ ที่อยู่ ประวัติการทำงาน และข้อมูลอื่นที่ข้าพเจ้ากรอกไว้ <b>เพื่อวัตถุประสงค์</b>ดังต่อไปนี้:
                </p>
                <ul style={{fontSize:12.5,color:"#344054",lineHeight:1.9,paddingLeft:18,marginBottom:12}}>
                  <li>จัดหางานและจับคู่กับนายจ้าง/บุคคล/SME ที่เหมาะสม</li>
                  <li>ยืนยันตัวตนและตรวจสอบประวัติร่วมกับ กทม.</li>
                  <li>เปิดเผยข้อมูลที่จำเป็นแก่นายจ้างเฉพาะกรณีที่ได้รับอนุมัติรายกรณี</li>
                  <li>ปรับปรุงและพัฒนาบริการของแพลตฟอร์ม</li>
                </ul>
                <p style={{fontSize:12,color:"#667085",marginBottom:14}}>
                  ข้อมูลจะถูกเก็บรักษาอย่างปลอดภัยและไม่นำไปจำหน่ายให้บุคคลที่สาม ท่านมีสิทธิ์เพิกถอนความยินยอม ขอเข้าถึง แก้ไข หรือลบข้อมูลได้ตลอดเวลาโดยติดต่อผู้ควบคุมข้อมูล · อ่านนโยบายความเป็นส่วนตัวฉบับเต็มได้ที่ <span style={{color:"#1a73e8",textDecoration:"underline",cursor:"pointer"}}>jobjing.th/privacy</span>
                </p>
                <label style={{display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer"}}>
                  <input
                    type="checkbox"
                    checked={intake.pdpaConsent}
                    onChange={e=>setIntake(p=>({...p,pdpaConsent:e.target.checked}))}
                    style={{marginTop:2,width:16,height:16,accentColor:"var(--leaf)",cursor:"pointer",flexShrink:0}}
                  />
                  <span style={{fontSize:13,color:"#1a3c6e",fontWeight:"bold",lineHeight:1.5}}>
                    ข้าพเจ้าอ่านและยินยอมให้เก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลตามพระราชบัญญัติ PDPA พ.ศ. 2562 <span style={{color:"var(--fire)"}}>*</span>
                  </span>
                </label>
                {!intake.pdpaConsent && <p style={{fontSize:11.5,color:"var(--fire)",marginTop:8,marginBottom:0}}>⚠️ กรุณายืนยันความยินยอมก่อนดำเนินการต่อ</p>}
              </div>
              </div>)}
              {step===2&&(<div className="form-card"><h3 className="ph">2 · สายงาน & ประสบการณ์</h3><label className="field"><span>สายงานที่สนใจ</span><Sel value={intake.field} onChange={e=>setIntake(p=>({...p,field:e.target.value}))}/></label><label className="field"><span>ประสบการณ์ (ปี)</span><input className="input" type="number" value={intake.exp} onChange={e=>setIntake(p=>({...p,exp:e.target.value}))} placeholder="3"/></label><label className="field"><span>เล่าประสบการณ์ที่ผ่านมา</span><textarea className="input ta" rows={3} value={intake.expText} onChange={e=>setIntake(p=>({...p,expText:e.target.value}))} placeholder="เคยทำงานอะไรมาบ้าง..."/></label></div>)}
              {step===3&&(<div className="form-card"><h3 className="ph">3 · ทักษะ / ความสามารถ</h3><p className="hint">เลือกทักษะที่คุณมีในสาย "{labelOf(intake.field)}" หรือเพิ่มเองได้</p>{intake.skills.length>0&&(<div className="picked">{intake.skills.map(s=>(<button key={s} className="pchip" onClick={()=>toggleSkill(s)}>{s}<span className="rm">✕</span></button>))}</div>)}<div className="sk-label">เลือกจากที่แนะนำ</div><div className="skillgrid">{(SKILLS[intake.field]||[]).map(s=>(<button key={s} className={"skchip"+(intake.skills.includes(s)?" on":"")} onClick={()=>toggleSkill(s)}>{s}</button>))}</div><div className="addrow"><input className="input" value={intake.custom} placeholder="เพิ่มทักษะเอง..." onChange={e=>setIntake(p=>({...p,custom:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addCustom()}/><button className="btn btn-ghost" onClick={addCustom}>+ เพิ่ม</button></div></div>)}
              
            {/* 🟢 อัปเดต Step 4: ประเมินตัวเองด้วยบล็อกระดับ 1-10 */}
              {step===4&&(<div className="form-card">
                <h3 className="ph">4 · ประเมินจุดเด่นตัวเอง (ระดับ 1-10)</h3>
                <p className="hint">คลิกเลือกระดับบนบล็อกเพื่อประเมินความสามารถของคุณ — "ดอกจุดเด่น" ทางขวาจะปรับตามทันที</p>
                {DIMS.map(d=>(
                  <div key={d.key} style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <span style={{ width: '130px', fontWeight: 'bold', fontSize: '14px', color: 'var(--dark)' }}>{d.label}</span>
                    
                    {/* แถบบล็อก 10 ระดับ */}
                    <div style={{ display: 'flex', gap: '4px', flex: 1, minWidth: '180px', maxWidth: '300px' }}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => {
                        const isActive = n * 10 <= intake.scores[d.key];
                        return (
                          <button 
                            key={n} 
                            style={{
                              flex: 1,
                              height: '22px', 
                              cursor: 'pointer', 
                              border: isActive ? 'none' : '1px solid #d9d9d9', 
                              background: isActive ? 'var(--leaf)' : '#f1f3f4', 
                              borderRadius: '3px',
                              transition: 'all 0.2s ease-in-out',
                              padding: 0
                            }}
                            onClick={() => setIntake(p => ({...p, scores: {...p.scores, [d.key]: n * 10}}))}
                            title={`ระดับ ${n}`}
                          />
                        );
                      })}
                    </div>
                    
                    <span style={{ minWidth: '45px', textAlign: 'right', fontWeight: 'bold', color: 'var(--accent)' }}>
                      {intake.scores[d.key] / 10} / 10
                    </span>
                  </div>
                ))}
              </div>)}
                  

              {step===5&&(<div className="form-card"><h3 className="ph">5 · ความพร้อม & เงินเดือน</h3><div className="field"><span>พร้อมเริ่มงานเมื่อไหร่</span><div className="radios">{[["now","พร้อมทันที"],["3d","3 วัน"],["1w","1 สัปดาห์"]].map(([v,l])=>(<button key={v} className={"radio"+(intake.availType===v?" on":"")} onClick={()=>setIntake(p=>({...p,availType:v}))}>{l}</button>))}</div></div><div className="field"><span>เงินเดือนที่ต้องการ (บาท / เดือน)</span><div className="field-row"><input className="input" type="number" value={intake.salMin} onChange={e=>setIntake(p=>({...p,salMin:e.target.value}))} placeholder="ต่ำสุด"/><input className="input" type="number" value={intake.salMax} onChange={e=>setIntake(p=>({...p,salMax:e.target.value}))} placeholder="สูงสุด"/></div></div></div>)}
              {step===6&&(<div className="form-card"><h3 className="ph">6 · ตรวจสอบก่อนส่ง</h3><p className="hint">ส่งแล้วโปรไฟล์จะเข้าคิวให้เจ้าหน้าที่ กทม. รับรอง ก่อนเผยแพร่ให้นายจ้าง</p><div className="cand-name big">{intake.name.trim()||"ผู้สมัครใหม่"}</div><div className="cand-head">{`สนใจงาน${labelOf(intake.field)} · เด่นเรื่อง${dimLabel(topKey(intake.scores))}`}</div><ProfileBody me={{field:intake.field,area:intake.area||"—",exp:intake.exp?+intake.exp:null,skills:intake.skills,salary:{min:+intake.salMin||0,max:+intake.salMax||0},scores:intake.scores,availNow:intake.availType==="now",avail:availText(intake.availType),story:intake.expText||"—",verified:false,verifiedSkills:[]}}/></div>)}
              <div className="stepnav">{step>1?<button className="btn btn-ghost" onClick={()=>setStep(step-1)}>← ก่อนหน้า</button>:<div/>}{step<6?<button className="btn btn-primary" disabled={step===1&&!intake.pdpaConsent} style={step===1&&!intake.pdpaConsent?{opacity:.45,cursor:"not-allowed"}:{}} onClick={()=>{ if(step===1&&!intake.pdpaConsent) return; setStep(step+1); }}>ถัดไป →</button>:<button className="btn btn-primary" onClick={submitIntake}>ส่งโปรไฟล์ ✓</button>}</div>
            </div>
            <aside className="intake-preview"><div className="prev-card"><div className="prev-t">ตัวอย่างจุดเด่น</div><Bloom scores={live.scores} size={168} labels/><div className="prev-name">{live.name}</div><div className="prev-field">{labelOf(live.field)}</div><div className="prev-top">เด่นเรื่อง <b>{dimLabel(topKey(live.scores))}</b></div>{live.skills.length>0&&<div className="prev-skills">{live.skills.length} ทักษะที่เลือก</div>}{(live.salary.min>0||live.salary.max>0)&&<div className="prev-sal">{salaryStr(live.salary)}</div>}</div></aside>
          </div></>
        )}

        {/* SEEKER: profile */}
        {role==="seeker"&&seekView==="profile"&&(
          <><div className="row-head"><p className="lead nomb">โปรไฟล์ของคุณ — สิ่งที่นายจ้างเห็น</p><button className="btn btn-ghost" onClick={editProfile}>✏️ แก้ไขโปรไฟล์</button></div>
          {me.sample&&<div className="me-note">นี่คือตัวอย่างโปรไฟล์ — ไปที่ "ลงทะเบียน / กรอกข้อมูล" เพื่อสร้างโปรไฟล์ของคุณเอง</div>}
          {!me.verified&&!me.sample&&<div className="me-note">โปรไฟล์ของคุณอยู่ในคิวรอเจ้าหน้าที่ กทม. รับรอง ระบบจะแจ้งเมื่อรับรองแล้ว</div>}
          <div className="profile-page">
            <div className="cand-name big">{me.name}</div>
            <div className="cand-head">{me.head}</div>
            
            <div style={{background: "#e8f0fe", borderLeft: "4px solid #1a73e8", padding: "12px 16px", borderRadius: 8, marginBottom: 20, fontSize: 14}}>
              🔒 <b>ข้อมูลความปลอดภัยระบุตัวตนบุคคล (เฉพาะคุณเท่านั้นที่เข้าถึงได้):</b> เลขบัตรประชาชน: <span style={{fontFamily:"monospace", fontWeight:"bold"}}>{me.citizenId || "ยังไม่ได้บันทึกข้อมูล"}</span>
            </div>
            
            <ProfileBody me={me} big/>
          </div></>
        )}

        {/* SEEKER: jobs */}
        {role==="seeker"&&seekView==="jobs"&&(
          <><div className="row-head"><p className="lead nomb">งานที่เปิดรับ เรียงตามความตรงกับจุดเด่นและทักษะ</p><label className="catpick"><span>สายงาน</span><Sel withAll value={jobCat} onChange={e=>setJobCat(e.target.value)}/></label></div>
          <div className="joblist">{seekerJobs.map((j,i)=>(<article key={i} className="jobcard"><div className="jc-main"><div className="jc-top"><span className="jc-title">{j.title}</span><span className="mscore inline">{j.m}% ตรงกัน</span></div><div className="why">ตรงเพราะ {matchReasons(me,j)}</div><div className="jc-co"><button className="co-inline" onClick={()=>setSelCo(j.coId)}>{j.co.name||"—"}</button><Stars value={j.co.rating||4} size={13}/></div><div className="jc-meta"><span className="tag">{labelOf(j.cat)}</span><span className="sep">·</span><span>{j.area}</span><span className="sep">·</span><span>{salaryStr(j.salary)}</span></div><div className="jc-skills"><SkillChips items={j.skills}/></div></div>
          <div className="jc-side">
            <button className="btn btn-primary sm" onClick={() => setConfirmDialog({
              title: "ยืนยันการสมัครงาน",
              message: `คุณแน่ใจหรือไม่ว่าต้องการส่งโปรไฟล์เพื่อสมัครตำแหน่ง "${j.title}" ของบุคคล/SME ${j.co.name || "—"}?`,
              confirmText: "ยืนยันการสมัคร",
              action: () => { ping(`สมัครงาน "${j.title}" สำเร็จแล้ว`); setConfirmDialog(null); }
            })}>
              สมัคร
            </button>
          </div>
          </article>))}</div></>
        )}

        {/* SEEKER: companies */}
        {role==="seeker"&&seekView==="companies"&&(
          <><p className="lead">รีวิวจากพนักงานจริง ดูคะแนนก่อน ตัดสินใจสมัคร</p>
          <div className="cogrid">{companies.map((c)=>(<button key={c.id} className="cocard" onClick={()=>setSelCo(c.id)}><div className="co-head"><div className="co-logo">{c.name[0]}</div><div><div className="co-name">{c.name}</div><div className="co-ind">{c.ind}</div></div></div><div className="co-rate"><Stars value={c.rating} size={15}/><b>{c.rating.toFixed(1)}</b></div><div className="co-foot"><span>{openCountOf(c.id)} ตำแหน่งเปิดรับ</span><span>{c.count} รีวิว</span></div></button>))}</div></>
        )}

        {/* SEEKER: status */}
        {role==="seeker"&&seekView==="status"&&(
          <><p className="lead">ติดตามสถานะใบสมัครของคุณได้ที่นี่</p>
          <div className="joblist">{MY_APPS.map((a,i)=>(<article key={i} className="appcard"><div className="ac-top"><span className="jc-title">{a.role}</span><span className="muted-s">· {a.co}</span></div><div className="timeline">{STAGES.map((s,si)=>(<div key={s} className={"tl-node"+(si<a.stageIdx?" done":si===a.stageIdx?" cur":"")}><div className="tl-dot"/><div className="tl-lab">{s}</div></div>))}</div><div className="ac-note">{a.note}</div></article>))}</div></>
        )}
        
        {/* CITY: queue */}
        {role==="city"&&cityView==="queue"&&(
          <><div className="diff-bar city"><span className="gov-tag">กทม.</span><span>เจ้าหน้าที่ตรวจสอบยืนยันตัวตนและประวัติอาชญากรรมของผู้สมัคร</span></div>
          <div className="filters">{[["pending","รอรับรอง"],["verified","รับรองแล้ว"],["all","ทั้งหมด"]].map(([id,lb])=>(<button key={id} className={"chip"+(cityFilter===id?" active":"")} onClick={()=>setCityFilter(id)}>{lb}<span className="chip-n">{id==="all"?pool.length:cnt(id)}</span></button>))}</div>
          {queue.length===0?(<div className="empty">ไม่มีผู้สมัครในสถานะนี้</div>):(
            <div className="grid">{queue.map((c,i)=>(<button key={c.id} className="cand" style={{animationDelay:i*0.05+"s"}} onClick={()=>openCity(c)}><div className="cand-top"><div><div className="cand-name">{c.name} {c.identityVerified && <span style={{fontSize:10, padding:"1px 4px", background:"#e6f4ea", color:"#137333", borderRadius:4}}>✓ ตรวจแล้ว</span>}</div><div className="cand-head">{c.head}</div></div><Bloom scores={c.scores} size={60}/></div><div className="card-badge"><StatusPill status={c.status}/></div><div className="topstr"><span className="spark">●</span> เด่นเรื่อง<b>{dimLabel(topKey(c.scores))}</b></div><SkillChips items={c.skills.slice(0,3)}/><div className="meta"><span>{labelOf(c.cat)}</span><span className="sep">·</span><span>{c.area}</span><span className="sep">·</span><span>{c.exp} ปี</span></div></button>))}</div>
          )}</>
        )}

        {/* CITY: company verification (หน้าแยกจากผู้สมัคร) */}
        {role==="city"&&cityView==="companies"&&(
          <><div className="diff-bar city"><span className="gov-tag">กทม.</span><span>ตรวจสอบและยืนยันตัวตนผู้ว่าจ้าง — ทั้งบุคคลธรรมดาและ SME รายย่อย ก่อนเปิดให้โพสต์งาน</span></div>
          <p className="lead" style={{marginBottom:16}}>ผู้ว่าจ้างต้องผ่านการยืนยันก่อนจึงจะรับสมัครงานได้ — กันการแอบอ้างและคุ้มครองผู้สมัคร โดยเฉพาะงานในบ้าน เช่น แม่บ้าน คนสวน</p>
          <div className="filters">{[["pending","รอตรวจสอบ"],["verified","รับรองแล้ว"],["rejected","ส่งคืนแก้ไข"],["all","ทั้งหมด"]].map(([id,lb])=>(<button key={id} className={"chip"+(coVerifyFilter===id?" active":"")} onClick={()=>setCoVerifyFilter(id)}>{lb}<span className="chip-n">{id==="all"?companyVerifs.length:coCnt(id)}</span></button>))}</div>
          {coQueue.length===0?(<div className="empty">ไม่มีผู้ว่าจ้างในสถานะนี้</div>):(
            <div className="cogrid">{coQueue.map((c,i)=>(
              <button key={c.id} className="cocard" style={{animationDelay:i*0.05+"s", textAlign:"left"}} onClick={()=>openCoReview(c)}>
                <div className="co-head"><div className="co-logo">{c.name[0]}</div><div><div className="co-name">{c.name} {c.mine && <span style={{fontSize:10, background:"#e8f0fe", color:"#1a73e8", padding:"1px 5px", borderRadius:4}}>บัญชีของคุณ</span>}</div><div className="co-ind">{c.ind}</div></div></div>
                <div style={{margin:"8px 0", display:"flex", flexWrap:"wrap", gap:6, alignItems:"center"}}>
                  <span style={{fontSize:11, padding:"2px 8px", borderRadius:12, fontWeight:"bold", background: c.kind==="individual" ? "#fde8ef" : "#e8f0fe", color: c.kind==="individual" ? "#9c2b5e" : "#1a73e8"}}>{c.kind==="individual" ? "บุคคลธรรมดา" : "SME"}</span>
                  <span style={{fontSize:12, color:"var(--muted)", fontFamily:"monospace"}}>{c.kind==="individual" ? `บัตร ปชช.: ${c.nationalId}` : `ทะเบียน: ${c.regNo}`}</span>
                </div>
                <div className="co-foot">
                  <span style={{fontSize:12, fontWeight:"bold", color: c.status==="verified" ? "#137333" : c.status==="rejected" ? "#c5221f" : "#b06000"}}>
                    {c.status==="verified" ? "✓ รับรองแล้ว" : c.status==="rejected" ? "↩ ส่งคืนแก้ไข" : "⏳ รอตรวจสอบ"}
                  </span>
                  <span>ตรวจสอบ →</span>
                </div>
              </button>
            ))}</div>
          )}</>
        )}

        {/* CITY: requests */}
        {role==="city"&&cityView==="requests"&&(
          <><div className="diff-bar city"><span className="gov-tag">กทม.</span><span>ศูนย์ควบคุมธรรมาภิบาลข้อมูลสิทธิ์ระบุบุคคล (Data Governance Portal)</span></div>
          <p className="lead" style={{marginBottom:20}}>คำขอพิจารณาดึงประวัติและผลการตรวจสอบประวัติอาชญากรรมจากบุคคล/SMEคู่สัญญาจ้างงานเพื่อเซ็นใบสัญญาจ้าง</p>
          <div className="joblist">
            {matchesList.filter(m => m.dataRequestStatus === "pending_city_release").length === 0 ? (
              <div className="empty" style={{padding:30}}>ไม่มีคำขอประวัติบุคคลค้างอยู่จากสถานประกอบการในขณะนี้</div>
            ) : (
              matchesList.filter(m => m.dataRequestStatus === "pending_city_release").map((m) => (
                <article key={m.id} className="city-request-card" style={{border: "1px solid #f0e6b2", background: "#fffdec", padding: 16, borderRadius: 8, marginBottom: 12}}>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontWeight:"bold", fontSize: 16, color: "#202124"}}>🏢 บุคคล/SMEผู้ขอสิทธิ์: {m.co}</div>
                      <div style={{fontSize: 14, marginTop: 6, color: "#3c4043"}}>
                        ประสงค์เข้าถึงแฟ้มประวัติของ: <b style={{color: "var(--accent)"}}>{m.cand}</b> (ตำแหน่ง: {m.role})
                      </div>
                      <div style={{fontSize: 12, color: "var(--muted)", marginTop: 6}}>
                        🔒 เอกสารที่จะเปิดเผยเมื่ออนุมัติ: เลขบัตรประจำตัวประชาชน 13 หลัก และผลการเช็กประวัติอาชญากรรมโดย กทม.
                      </div>
                    </div>
                    <div style={{display:"flex", gap: 8}}>
                      <button className="btn btn-primary sm" style={{background: "#137333", color:"#fff"}} onClick={() => handleCityDataRelease(m.id, true)}>✓ อนุมัติส่งประวัติ</button>
                      <button className="btn btn-ghost sm" style={{color: "#c5221f", border: "1px solid #c5221f"}} onClick={() => handleCityDataRelease(m.id, false)}>✕ ปฏิเสธคำขอ</button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div></>
        )}

        {/* CITY: dashboard */}
        {role==="city"&&cityView==="dash"&&(
          <><p className="lead">ภาพรวมการรับรองผู้สมัครโดยกรุงเทพมหานคร</p>
          <div className="stats"><div className="stat"><div className="stat-num">{cnt("pending")}</div><div className="stat-label">รอรับรอง</div></div><div className="stat"><div className="stat-num">{cnt("verified")}</div><div className="stat-label">รับรองแล้ว</div></div><div className="stat"><div className="stat-num">{CITY_PLACED}</div><div className="stat-label">จ้างงานสำเร็จผ่าน กทม.</div></div><div className="stat"><div className="stat-num">{coCnt("verified")}</div><div className="stat-label">นายจ้างที่ยืนยันแล้ว</div></div></div>
          <div className="panelcard"><h3 className="ph">ทำไมต้องให้ กทม. ยืนยันตัวตน</h3><p className="block-p">งานบริการและงานรายวัน เช่น คนตัดหญ้า แม่บ้าน ผู้ช่วยครัว ส่วนใหญ่ไม่ต้องใช้วุฒิหรือเรซูเม่ แต่ทั้งผู้สมัครและผู้ว่าจ้างต่างกังวลเรื่องความปลอดภัยและความน่าเชื่อถือ JobJing จึงให้เจ้าหน้าที่ กทม. ยืนยันตัวตนและตรวจประวัติอาชญากรรมของทั้งสองฝ่าย — ผู้สมัครและผู้ว่าจ้าง — เพื่อสร้างความเชื่อมั่นในการจ้างงาน โดยเฉพาะงานในบ้าน</p><p className="foot">เชิงนโยบายร่วมกับโครงการพัฒนาสังคม กรุงเทพมหานคร และผู้มีส่วนร่วมภาคีเครือข่าย</p></div></>
        )}
      </main>

      {/* Candidate detail panel */}
      {sel && (
        <>
          <div className="backdrop" onClick={() => setSel(null)} />
          <aside className="panel">
            <div className="panel-head" style={{ display: 'flex', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, paddingRight: '16px' }}>
                <div className="cand-name big">
                  {sel.name}
                  {sel.identityVerified && (
                    <span className="verified-identity-badge" style={{ marginLeft: 8 }}>
                      ✓ ตรวจสอบประวัติบุคคลแล้ว
                    </span>
                  )}
                </div>
                <div className="cand-head">{sel.head}</div>
              </div>
              
              {/* % ตรงกันที่มุมขวาบน (จะแสดงผลเมื่อกดมาจากหน้ารายชื่อผู้สมัครที่ตรงกับงาน) */}
              {sel.m && (
                <div className="mscore inline" style={{ alignSelf: 'center', marginRight: '16px', padding: '6px 12px', fontSize: '15px' }}>
                  {sel.m}% ตรงกัน
                </div>
              )}

              <button className="x" onClick={() => setSel(null)}>✕</button>
            </div>
            
            <ProfileBody me={sel} />
            
            <button className="btn btn-primary btn-block" onClick={() => setConfirmDialog({
              title: "ยืนยันการเสนองาน",
              message: `คุณต้องการเสนอตำแหน่งให้ "${sel.name}" และเพิ่มรายชื่อเข้าสู่กระดานจับคู่ใช่หรือไม่?`,
              confirmText: "ยืนยันการเสนอ",
              action: () => {
                setMatchesList(prev => [{
                  id: Date.now(),
                  cand: sel.name,
                  role: labelOf(sel.field || sel.cat),
                  co: myCompanyName,
                  stage: "เสนอแล้ว",
                  m: sel.m || (Math.floor(Math.random() * 15) + 80), // ดึง % จริงมาใช้ถ้ามี
                  note: "เพิ่งเพิ่มเมื่อสักครู่",
                  dataRequestStatus: "none",
                  completed: false,
                  seekerRating: null
                }, ...prev]);
                ping(`เพิ่ม ${sel.name} เข้าสู่การจับคู่ (Pipeline) แล้ว`);
                setSel(null);
                setConfirmDialog(null);
              }
            })}>
              สนใจ / เสนอเข้าทำงาน
            </button>
          </aside>
        </>
      )}
      {/* City review panel */}
      {cityId&&(()=> { const c=pool.find(x=>x.id===cityId)||{}; return(<><div className="backdrop" onClick={()=>setCityId(null)}/><aside className="panel"><div className="panel-head"><div><div className="cand-name big">{c.name}</div><div className="cand-head">{c.head}</div></div><button className="x" onClick={()=>setCityId(null)}>✕</button></div><ProfileBody me={c}/><div className="verify-box"><div className="vbx-t"><span className="gov-tag sm">กทม.</span> หน้าพิจารณาและตรวจสอบระบุตัวตนบุคคล</div>
      
      <div style={{background: "#fffdec", padding: 12, borderRadius: 6, marginBottom: 12, border: "1px solid #f0e6b2"}}>
        <div style={{fontSize: 13, marginBottom: 8}}>🆔 <b>เลขประจำตัวประชาชนที่ส่งมา:</b> <span style={{fontFamily: "monospace", fontWeight: "bold"}}>{c.citizenId || "1-9003-XXXXX-XX-X"}</span></div>
        
        <label className="inspect-row" style={{display:'flex', alignItems:'center', gap:'10px', background:'#fff', padding:'8px', borderRadius:'4px', marginBottom:'6px'}}>
          <input 
            type="checkbox" 
            checked={cityVerifyForm.identityConfirmed} 
            onChange={(e) => setCityVerifyForm({ ...cityVerifyForm, identityConfirmed: e.target.checked })}
          />
          <span style={{fontSize:13}}>🛡️ <b>ยืนยันการตรวจสอบข้อมูลและสิทธิ์บุคคลแล้ว</b></span>
        </label>

        <label className="inspect-row" style={{display:'flex', alignItems:'center', gap:'10px', background:'#fff', padding:'8px', borderRadius:'4px'}}>
          <input 
            type="checkbox" 
            checked={cityVerifyForm.criminalChecked} 
            onChange={(e) => setCityVerifyForm({ ...cityVerifyForm, criminalChecked: e.target.checked })}
          />
          <span style={{fontSize:13}}>📂 <b>ตรวจสอบทะเบียนประวัติอาชญากรรมเรียบร้อย (ผ่านเกณฑ์)</b></span>
        </label>
      </div>
      
      <label className="field"><span>หมายเหตุการรับรอง (ส่วนตัว)</span><textarea className="input ta" rows={2} value={vnote} onChange={e=>setVnote(e.target.value)} placeholder="หมายเหตุผลการคัดกรองประวัติ..." /></label><div className="citybtns"><button className="btn btn-primary" onClick={qualify}>✓ บันทึกผลตรวจ &amp; ยืนยันตัวตน</button></div></div></aside></>);})()}

      {/* Company panel */}
      {selCo&&(()=>{const c=coById(selCo);return(<><div className="backdrop" onClick={()=>setSelCo(null)}/><aside className="panel"><div className="panel-head"><div className="co-head"><div className="co-logo">{c.name&&c.name[0]}</div><div><div className="co-name">{c.name}</div><div className="co-ind">{c.ind}</div></div></div><button className="x" onClick={()=>setSelCo(null)}>✕</button></div><div className="co-bigrate"><Stars value={c.rating||4} size={22}/><span className="co-bignum">{c.rating&&c.rating.toFixed(1)}</span><span className="muted-s">จาก {c.count} รีวิว</span></div><div className="subscores">{[["env","สภาพแวดล้อม"],["pay","ค่าตอบแทน"],["growth","ความก้าวหน้า"],["care","การดูแลพนักงาน"]].map(([k,lb])=>(<div key={k} className="srow"><span className="slab sl-wide">{lb}</span><span className="sbar"><span className="sbar-fill" style={{width:((c.sub||{})[k]||3)/5*100+"%",background:"var(--honey)"}}/></span><span className="sval">{(c.sub||{})[k]||3}</span></div>))}</div>
      
      {/* 🟢 อัปเดต: เปลี่ยนรายการงานเป็นปุ่ม เพื่อให้กดเข้าไปดูรายละเอียดได้ */}
      <div className="block"><div className="block-t">ตำแหน่งที่เปิดรับ</div>
        {OPEN_JOBS.filter(j=>j.coId===selCo).map((j,i)=>(
          <button 
            key={i} 
            className="role" 
            style={{display:'flex', width:'100%', justifyContent:'space-between', padding:'10px 12px', background:'var(--surface)', border:'1px solid var(--line)', borderRadius:'6px', marginBottom:'6px', cursor:'pointer', textAlign:'left'}}
            onClick={() => { setSelCo(null); setSelJobDetail({...j, coObj: c}); }}
          >
            <span style={{fontWeight:'bold', color:'var(--dark)'}}>{j.title}</span>
            <span style={{color:'var(--leaf)', fontSize:'13px'}}>{salaryStr(j.salary)} <span style={{color:'var(--muted)', marginLeft:'4px'}}>→</span></span>
          </button>
        ))}
      </div>
      
      <div className="block"><div className="block-t">รีวิวจากพนักงาน ({c.count})</div>{(c.reviews||[]).map((r,i)=>(<div key={i} className="review"><div className="rv-top"><span className="rv-role">{r.role}</span><Stars value={r.rating} size={13}/><span className="rv-date">{r.date}</span></div><p className="rv-text">{r.text}</p></div>))}</div><button className="btn btn-primary btn-block" onClick={()=>{setSelCo(null);setRateCo(selCo);}}>เขียนรีวิวบุคคล/SMEนี้</button></aside></>);})()}

      {/* 🟢เพิ่มตรงนี้🟢 Modal ดูรายละเอียดตำแหน่งงานจากการกดในหน้าบริษัท */}
      {selJobDetail && (
        <>
          <div className="backdrop z2" onClick={() => setSelJobDetail(null)} />
          <div className="modal z2" role="dialog">
            <div className="modal-head">
              <h3 className="ph">{selJobDetail.title}</h3>
              <button className="x" onClick={() => setSelJobDetail(null)}>✕</button>
            </div>
            <div className="jc-co" style={{marginBottom: 16}}>
              <span className="co-inline" style={{fontWeight:'bold', color:'var(--accent)'}}>{selJobDetail.coObj.name}</span>
            </div>
            <div className="jc-meta" style={{display:'flex', gap:'8px', flexWrap:'wrap', marginBottom: 20}}>
              <span className="tag">{labelOf(selJobDetail.cat)}</span>
              <span className="sep">·</span>
              <span>📍 {selJobDetail.area}</span>
              <span className="sep">·</span>
              <span style={{color:'var(--leaf)', fontWeight:'bold'}}>💰 {salaryStr(selJobDetail.salary)}</span>
            </div>
            
            <div className="block-t" style={{fontSize: 14, marginBottom: 8}}>ทักษะที่ใช้ในงานนี้:</div>
            <div className="jc-skills" style={{marginBottom: 24}}>
              <SkillChips items={selJobDetail.skills || []}/>
            </div>
            
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setSelJobDetail(null)}>ปิด</button>
              {role === "seeker" && (
                <button className="btn btn-primary" onClick={() => {
                  setConfirmDialog({
                    title: "ยืนยันการสมัครงาน",
                    message: `คุณแน่ใจหรือไม่ว่าต้องการส่งโปรไฟล์เพื่อสมัครตำแหน่ง "${selJobDetail.title}" ของบุคคล/SME ${selJobDetail.coObj.name}?`,
                    confirmText: "ยืนยันการสมัคร",
                    action: () => { 
                      ping(`สมัครงาน "${selJobDetail.title}" สำเร็จแล้ว`); 
                      setConfirmDialog(null); 
                      setSelJobDetail(null); 
                    }
                  });
                }}>
                  สมัครตำแหน่งนี้
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Rate modal */}
      {rateCo&&(<><div className="backdrop z2" onClick={()=>setRateCo(null)}/><div className="modal z2" role="dialog"><div className="modal-head"><h3 className="ph">ให้คะแนน {coById(rateCo).name}</h3><button className="x" onClick={()=>setRateCo(null)}>✕</button></div><p className="modal-sub">รีวิวของคุณช่วยให้ผู้สมัครคนอื่น ตัดสินใจได้ดีขึ้น</p><div className="ratepick">{[1,2,3,4,5].map(n=>(<button key={n} className={"rstar"+(n<=rate.stars?" on":"")} onClick={()=>setRate(p=>({...p,stars:n}))}>★</button>))}</div><label className="field"><span>ความคิดเห็น (ส่วนตัว)</span><textarea className="input ta" rows={3} value={rate.text} onChange={e=>setRate(p=>({...p,text:e.target.value}))} placeholder="บอกเล่าประสบการณ์การทำงาน..."/></label><div className="modal-foot"><button className="btn btn-ghost" onClick={()=>setRateCo(null)}>ยกเลิก</button><button className="btn btn-primary" onClick={submitReview}>ส่งรีวิว</button></div></div></>)}

      {/* 🌟 Rate seeker modal — นายจ้างให้คะแนนผู้สมัครหลังงานจบ */}
      {rateSeeker!==null&&(()=>{const m=matchesList.find(x=>x.id===rateSeeker)||{};return(
        <><div className="backdrop z2" onClick={()=>setRateSeeker(null)}/>
        <div className="modal z2" role="dialog">
          <div className="modal-head"><h3 className="ph">ให้คะแนน {m.cand}</h3><button className="x" onClick={()=>setRateSeeker(null)}>✕</button></div>
          <div style={{background:"#e6f4ea", border:"1px solid #137333", borderRadius:8, padding:"10px 12px", marginBottom:14, fontSize:12.5, lineHeight:1.7, color:"#137333"}}>
            ✓ <b>รีวิวจากงานจริง</b> — ให้คะแนนได้เพราะงาน “{m.role}” <b>ปิดงานแล้ว</b> รีวิวนี้จะผูกกับการจ้างงานจริง ผู้อื่นแก้ไข/สร้างปลอมไม่ได้
          </div>
          <p className="modal-sub">ผู้สมัครทำงานเป็นอย่างไร? คะแนนนี้ช่วยให้นายจ้างคนต่อไปเชื่อมั่นในตัวผู้สมัคร</p>
          <div className="ratepick">{[1,2,3,4,5].map(n=>(<button key={n} className={"rstar"+(n<=seekerRate.stars?" on":"")} onClick={()=>setSeekerRate(p=>({...p,stars:n}))}>★</button>))}</div>
          <label className="field"><span>ความคิดเห็นถึงผู้สมัคร</span><textarea className="input ta" rows={3} value={seekerRate.text} onChange={e=>setSeekerRate(p=>({...p,text:e.target.value}))} placeholder="เช่น ตรงเวลา ขยัน งานเรียบร้อย สื่อสารดี..."/></label>
          <div className="modal-foot"><button className="btn btn-ghost" onClick={()=>setRateSeeker(null)}>ยกเลิก</button><button className="btn btn-primary" onClick={submitSeekerReview}>ส่งคะแนน</button></div>
        </div></>
      );})()}

      {/* Post job modal */}
      {post&&(<><div className="backdrop" onClick={()=>setPost(false)}/><div className="modal" role="dialog"><div className="modal-head"><h3 className="ph">โพสต์ตำแหน่งงาน</h3><button className="x" onClick={()=>setPost(false)}>✕</button></div><p className="modal-sub">บอกเราว่าคุณกำลังหาคนแบบไหน ระบบจะจับคู่ผู้สมัครที่ตรงให้อัตโนมัติ</p><label className="field"><span>ชื่อตำแหน่ง</span><input className="input" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="นักพัฒนาเว็บ, นักบัญชี..."/></label><div className="field-row"><label className="field"><span>สายงาน</span><Sel value={form.cat} onChange={e=>setForm(p=>({...p,cat:e.target.value}))}/></label><label className="field narrow"><span>จำนวน</span><input className="input" type="number" value={form.num} onChange={e=>setForm(p=>({...p,num:e.target.value}))}/></label></div><label className="field"><span>สถานที่ / เขต</span><input className="input" value={form.area} onChange={e=>setForm(p=>({...p,area:e.target.value}))} placeholder="เขตสาทร"/></label><div className="field"><span>เงินเดือนที่เสนอ (บาท / เดือน)</span><div className="field-row"><input className="input" type="number" value={form.salMin} onChange={e=>setForm(p=>({...p,salMin:e.target.value}))} placeholder="ต่ำสุด"/><input className="input" type="number" value={form.salMax} onChange={e=>setForm(p=>({...p,salMax:e.target.value}))} placeholder="สูงสุด"/></div></div><label className="field"><span>ทักษะที่ต้องการ</span><input className="input" value={form.skills} onChange={e=>setForm(p=>({...p,skills:e.target.value}))} placeholder="JavaScript, SQL, การสื่อสาร..."/></label><div className="field"><span>ข้อมูล / เอกสารที่ต้องการจากผู้สมัคร <small style={{color:'var(--muted)'}}>*ข้อมูลที่ กทม. คุ้มครองจะส่งให้เมื่ออนุมัติรายกรณีเท่านั้น</small></span><div className="skillgrid" style={{marginTop:6}}>{REQ_DATA_OPTS.map(([k,lb])=>(<button key={k} type="button" className={"skchip"+(form.reqData.includes(k)?" on":"")} onClick={()=>toggleReqData(k)}>{form.reqData.includes(k)?"✓ ":""}{lb}</button>))}</div></div><div className="modal-foot"><button className="btn btn-ghost" onClick={()=>setPost(false)}>ยกเลิก</button><button className="btn btn-primary" onClick={submitJob}>โพสต์ตำแหน่ง</button></div></div></>)}

      {/* Modal โชว์รายชื่อผู้สมัครที่ตรงกัน */}
      {viewMatchedJob && (() => {
        const matchedCands = pool
          .map(c => ({ ...c, m: matchScore(c, viewMatchedJob) }))
          .sort((a, b) => b.m - a.m)
          .slice(0, viewMatchedJob.matched || 1);

        return (
          <>
            <div className="backdrop z2" onClick={() => setViewMatchedJob(null)} />
            <div className="modal z2" role="dialog">
              <div className="modal-head">
                <h3 className="ph">ผู้สมัครที่ตรงกับ "{viewMatchedJob.title}"</h3>
                <button className="x" onClick={() => setViewMatchedJob(null)}>✕</button>
              </div>
              <p className="modal-sub">คลิกที่รายชื่อเพื่อดูโปรไฟล์แบบเต็ม และพิจารณานัดสัมภาษณ์</p>
              
              <div className="joblist">
                {matchedCands.map((c, i) => (
                  <button 
                    key={i} 
                    className="cocard" 
                    onClick={() => { setViewMatchedJob(null); setSel(c); }}
                  >
                    <div className="co-head" style={{ justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
                      <div>
                        <div className="cand-name">{c.name} {c.identityVerified && <span style={{fontSize:10,background:"#e6f4ea",color:"#137333",padding:"2px 4px",borderRadius:4,fontWeight:"bold"}}>✓ ตรวจสอบประวัติบุคคลแล้ว</span>}</div>
                        <div className="why" style={{ marginTop: '4px' }}>ตรงเพราะ: {matchReasons(c, viewMatchedJob)}</div>
                      </div>
                      <div className="mscore inline" style={{ flex: 'none' }}>{c.m}% ตรงกัน</div>
                    </div>
                  </button>
                ))}
                {matchedCands.length === 0 && (
                  <div className="empty" style={{ padding: '20px' }}>ยังไม่พบผู้สมัครที่ตรงกับเงื่อนไข</div>
                )}
              </div>
            </div>
          </>
        );
      })()}

      {/* Modal สำหรับกรอกข้อมูลตอนเลื่อนสถานะ */}
      {stagePrompt && (
        <>
          <div className="backdrop z2" onClick={() => setStagePrompt(null)} />
          <div className="modal z2" role="dialog">
            <div className="modal-head">
              <h3 className="ph">เลื่อนสถานะเป็น "{stagePrompt.nextStage}"</h3>
              <button className="x" onClick={() => setStagePrompt(null)}>✕</button>
            </div>
            <p className="modal-sub">
              {stagePrompt.nextStage === "นัดสัมภาษณ์" ? "โปรดระบุวันและเวลานัดหมายให้ผู้สมัครทราบ" :
               stagePrompt.nextStage === "ทดลองงาน" ? "โปรดระบุช่วงเวลาในการทดลองงานให้ผู้สมัครทราบ" :
               "โปรดระบุวันที่เริ่มงานสำหรับพนักงานใหม่"}
            </p>
            <label className="field">
              <span>
                {stagePrompt.nextStage === "นัดสัมภาษณ์" ? "วันและเวลานัดสัมภาษณ์ (เช่น พุธ 14:00)" :
                 stagePrompt.nextStage === "ทดลองงาน" ? "ช่วงเวลาทดลองงาน (เช่น 1-15 มิ.ย.)" :
                 "วันที่เริ่มงาน (เช่น 1 ก.ค.)"}
              </span>
              <input 
                className="input" 
                value={stageInput} 
                onChange={e => setStageInput(e.target.value)} 
                placeholder={
                  stagePrompt.nextStage === "นัดสัมภาษณ์" ? "พุธ 14:00" :
                  stagePrompt.nextStage === "ทดลองงาน" ? "1-15 มิ.ย." :
                  "1 ก.ค."
                }
                autoFocus
              />
            </label>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setStagePrompt(null)}>ยกเลิก</button>
              <button className="btn btn-primary" onClick={confirmStageMove}>ยืนยันการเลื่อนสถานะ</button>
            </div>
          </div>
        </>
      )}

      {/* Modal สำหรับยืนยันการกระทำ (Confirmation Dialog) แบบครอบจักรวาล */}
      {confirmDialog && (
        <>
          <div className="backdrop z2" onClick={() => setConfirmDialog(null)} />
          <div className="modal z2" role="dialog" style={{ maxWidth: '420px' }}>
            <div className="modal-head">
              <h3 className="ph">{confirmDialog.title}</h3>
              <button className="x" onClick={() => setConfirmDialog(null)}>✕</button>
            </div>
            <p className="modal-sub" style={{ fontSize: '14.5px', marginBottom: '24px' }}>
              {confirmDialog.message}
            </p>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setConfirmDialog(null)}>ยกเลิก</button>
              <button className="btn btn-primary" onClick={confirmDialog.action}>
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </>
      )}

      {/* City: company review panel */}
      {coReviewId && (() => {
        const c = companyVerifs.find((x) => x.id === coReviewId) || {};
        const allChecked = coReviewChecks.regValid && coReviewChecks.addrValid && coReviewChecks.statusActive;
        const Row = ([k, lb]) => (
          <label key={k} className="inspect-row" style={{display:'flex', alignItems:'center', gap:'10px', background:'#fff', padding:'8px', borderRadius:'4px', marginBottom:'6px'}}>
            <input type="checkbox" checked={coReviewChecks[k]} onChange={(e)=>setCoReviewChecks({...coReviewChecks,[k]:e.target.checked})}/>
            <span style={{fontSize:13}}>{lb}</span>
          </label>
        );
        return (
          <>
            <div className="backdrop" onClick={()=>setCoReviewId(null)}/>
            <aside className="panel">
              <div className="panel-head"><div className="co-head"><div className="co-logo">{c.name && c.name[0]}</div><div><div className="co-name">{c.name} <span style={{fontSize:10, padding:"2px 8px", borderRadius:12, fontWeight:"bold", background: c.kind==="individual" ? "#fde8ef" : "#e8f0fe", color: c.kind==="individual" ? "#9c2b5e" : "#1a73e8"}}>{c.kind==="individual" ? "บุคคลธรรมดา" : "SME"}</span></div><div className="co-ind">{c.ind}</div></div></div><button className="x" onClick={()=>setCoReviewId(null)}>✕</button></div>

              <div style={{background:"#fffdec", padding:14, borderRadius:8, border:"1px solid #f0e6b2", marginBottom:16, fontSize:13.5, lineHeight:1.9}}>
                {c.kind === "individual" ? (
                  <>
                    <div>🆔 <b>เลขบัตรประชาชน:</b> <span style={{fontFamily:"monospace", fontWeight:"bold"}}>{c.nationalId}</span></div>
                    <div>👤 <b>ชื่อ-นามสกุล:</b> {c.name}</div>
                    <div>📍 <b>ที่อยู่:</b> {c.address}</div>
                    <div>📞 <b>ติดต่อ:</b> {c.contact}</div>
                    <div style={{marginTop:6, color:"var(--muted)"}}>🏠 วัตถุประสงค์การจ้าง: {c.purpose}</div>
                  </>
                ) : (
                  <>
                    <div>🆔 <b>ทะเบียนนิติบุคคล:</b> <span style={{fontFamily:"monospace", fontWeight:"bold"}}>{c.regNo}</span></div>
                    <div>🏢 <b>ประเภทกิจการ:</b> {c.ind}</div>
                    <div>📍 <b>ที่อยู่จดทะเบียน:</b> {c.address}</div>
                    <div>👤 <b>ผู้ติดต่อ:</b> {c.contact}</div>
                    <div>✉️ <b>อีเมล:</b> {c.email}</div>
                    <div>👥 <b>ขนาดกิจการ:</b> {c.size}</div>
                    <div style={{marginTop:6, color:"var(--muted)"}}>📝 {c.desc}</div>
                  </>
                )}
              </div>

              <div className="verify-box">
                <div className="vbx-t"><span className="gov-tag sm">กทม.</span> {c.kind === "individual" ? "รายการตรวจสอบบุคคลธรรมดา" : "รายการตรวจสอบนิติบุคคล (SME)"}</div>
                <div style={{background:"#f1f3f4", padding:10, borderRadius:6, marginBottom:12}}>
                  {(c.kind === "individual"
                    ? [["regValid","🆔 ยืนยันตัวตนตรงกับบัตรประชาชน (DOPA)"],["addrValid","📍 ที่อยู่ที่แจ้งตรวจสอบแล้ว"],["statusActive","📂 ตรวจประวัติอาชญากรรมผ่านเกณฑ์"]]
                    : [["regValid","🏢 เลขทะเบียนนิติบุคคลตรงกับฐานข้อมูล DBD"],["addrValid","📍 ที่อยู่จดทะเบียนตรวจสอบแล้ว"],["statusActive","✅ สถานะนิติบุคคล: ดำเนินกิจการอยู่ (Active)"]]
                  ).map(Row)}
                </div>
                <label className="field"><span>หมายเหตุ / เหตุผล (กรณีส่งคืนแก้ไข)</span><textarea className="input ta" rows={2} value={coReviewNote} onChange={(e)=>setCoReviewNote(e.target.value)} placeholder={c.kind === "individual" ? "เช่น เลขบัตรไม่ตรงกับชื่อ..." : "เช่น เลขทะเบียนไม่ตรงกับชื่อกิจการ..."}/></label>
                <div className="citybtns">
                  <button className="btn btn-primary" disabled={!allChecked} style={!allChecked?{opacity:.5, cursor:"not-allowed"}:{}} onClick={()=>{ if(allChecked) decideCompany(c.id, true); }}>✓ ยืนยันตัวตนผู้ว่าจ้าง</button>
                  <button className="btn btn-ghost" style={{color:"#c5221f", border:"1px solid #c5221f"}} onClick={()=>decideCompany(c.id, false, coReviewNote.trim())}>↩ ส่งคืนเพื่อแก้ไข</button>
                </div>
                {!allChecked && <p className="hint" style={{marginTop:8}}>ติ๊กครบทั้ง 3 ข้อก่อนจึงจะยืนยันได้</p>}
              </div>
            </aside>
          </>
        );
      })()}

      {/* Employer: company verification modal */}
      {coVerifyModal && (
        <>
          <div className="backdrop z2" onClick={()=>setCoVerifyModal(false)}/>
          <div className="modal z2" role="dialog">
            <div className="modal-head"><h3 className="ph">ยืนยันบุคคล/SMEกับ กทม.</h3><button className="x" onClick={()=>setCoVerifyModal(false)}>✕</button></div>
            <p className="modal-sub">{coVerifyForm.kind === "individual" ? "กรอกข้อมูลส่วนบุคคลเพื่อส่งให้เจ้าหน้าที่ กทม. ตรวจสอบ เมื่อรับรองแล้วจึงจะโพสต์ตำแหน่งงานได้" : "กรอกข้อมูลนิติบุคคลเพื่อส่งให้เจ้าหน้าที่ กทม. ตรวจสอบ เมื่อรับรองแล้วจึงจะโพสต์ตำแหน่งงานได้"}</p>

            <div style={{display:"flex", gap:8, background:"#f1f3f4", padding:4, borderRadius:10, marginBottom:18}}>
              <button
                type="button"
                onClick={()=>setCoVerifyForm(p=>({...p, kind:"individual"}))}
                style={{
                  flex:1, padding:"10px 12px", borderRadius:8, border:"none", cursor:"pointer",
                  fontWeight:700, fontSize:13.5,
                  background: coVerifyForm.kind === "individual" ? "#fff" : "transparent",
                  color: coVerifyForm.kind === "individual" ? "#9c2b5e" : "var(--muted)",
                  boxShadow: coVerifyForm.kind === "individual" ? "0 1px 3px rgba(0,0,0,.12)" : "none",
                  transition: "all .15s"
                }}
              >
                👤 บุคคลธรรมดา
              </button>
              <button
                type="button"
                onClick={()=>setCoVerifyForm(p=>({...p, kind:"sme"}))}
                style={{
                  flex:1, padding:"10px 12px", borderRadius:8, border:"none", cursor:"pointer",
                  fontWeight:700, fontSize:13.5,
                  background: coVerifyForm.kind === "sme" ? "#fff" : "transparent",
                  color: coVerifyForm.kind === "sme" ? "#1a73e8" : "var(--muted)",
                  boxShadow: coVerifyForm.kind === "sme" ? "0 1px 3px rgba(0,0,0,.12)" : "none",
                  transition: "all .15s"
                }}
              >
                🏢 นิติบุคคล / SME
              </button>
            </div>

            <label className="field"><span>{coVerifyForm.kind === "individual" ? "ชื่อ-นามสกุล" : "ชื่อบุคคล/SME"}</span><input className="input" value={myCompanyName} disabled style={{background:"#f1f3f4"}}/></label>

            {coVerifyForm.kind === "individual" ? (
              <>
                <label className="field"><span>เลขบัตรประชาชน (13 หลัก)</span><input className="input" value={coVerifyForm.nationalId} onChange={(e)=>setCoVerifyForm(p=>({...p,nationalId:formatNationalId(e.target.value)}))} placeholder="1-2345-67890-12-3" maxLength={17}/></label>
                <label className="field"><span>ที่อยู่ตามบัตรประชาชน</span><input className="input" value={coVerifyForm.address} onChange={(e)=>setCoVerifyForm(p=>({...p,address:e.target.value}))} placeholder="เลขที่ ถนน เขต กรุงเทพฯ"/></label>
                <label className="field"><span>เบอร์ติดต่อ</span><input className="input" value={coVerifyForm.contact} onChange={(e)=>setCoVerifyForm(p=>({...p,contact:e.target.value}))} placeholder="081-234-xxxx"/></label>
                <label className="field"><span>วัตถุประสงค์การจ้าง</span><textarea className="input ta" rows={2} value={coVerifyForm.purpose} onChange={(e)=>setCoVerifyForm(p=>({...p,purpose:e.target.value}))} placeholder="เช่น จ้างคนตัดหญ้า ดูแลสวนหน้าบ้าน เดือนละ 2 ครั้ง"/></label>
              </>
            ) : (
              <>
                <label className="field"><span>เลขทะเบียนนิติบุคคล (13 หลัก)</span><input className="input" value={coVerifyForm.regNo} onChange={(e)=>setCoVerifyForm(p=>({...p,regNo:e.target.value}))} placeholder="0105xxxxxxxxx"/></label>
                <label className="field"><span>ประเภทกิจการ</span><input className="input" value={coVerifyForm.ind} onChange={(e)=>setCoVerifyForm(p=>({...p,ind:e.target.value}))} placeholder="โรงแรม / ท่องเที่ยว"/></label>
                <label className="field"><span>ที่อยู่จดทะเบียน</span><input className="input" value={coVerifyForm.address} onChange={(e)=>setCoVerifyForm(p=>({...p,address:e.target.value}))} placeholder="เลขที่ ถนน เขต กรุงเทพฯ"/></label>
                <div className="field-row"><label className="field"><span>ผู้ติดต่อ (ฝ่ายบุคคล)</span><input className="input" value={coVerifyForm.contact} onChange={(e)=>setCoVerifyForm(p=>({...p,contact:e.target.value}))} placeholder="ชื่อ · เบอร์โทร"/></label><label className="field narrow"><span>ขนาดกิจการ</span><input className="input" value={coVerifyForm.size} onChange={(e)=>setCoVerifyForm(p=>({...p,size:e.target.value}))} placeholder="50–200 คน"/></label></div>
                <label className="field"><span>อีเมลบุคคล/SME</span><input className="input" value={coVerifyForm.email} onChange={(e)=>setCoVerifyForm(p=>({...p,email:e.target.value}))} placeholder="hr@company.co.th"/></label>
                <label className="field"><span>รายละเอียดกิจการ</span><textarea className="input ta" rows={2} value={coVerifyForm.desc} onChange={(e)=>setCoVerifyForm(p=>({...p,desc:e.target.value}))} placeholder="ทำธุรกิจอะไร ต้องการรับคนแบบไหน..."/></label>
              </>
            )}

            <div className="modal-foot"><button className="btn btn-ghost" onClick={()=>setCoVerifyModal(false)}>ยกเลิก</button><button className="btn btn-primary" onClick={submitCompanyVerify}>ส่งให้ กทม. ตรวจสอบ</button></div>
          </div>
        </>
      )}

      {toast&&<div className="toast">{toast}</div>}
    </div>
  );
}