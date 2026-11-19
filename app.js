// Firebase starter: ใส่ค่าจาก Firebase Console ใน firebaseConfig ก่อนใช้งาน
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithRedirect, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs, updateDoc, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB4IEWP0lZRFzitNPkJiN8Uq-2Hmm6XO9o",
  authDomain: "maintenance-management-bde6.firebaseapp.com",
  projectId: "maintenance-management-bde6",
  storageBucket: "maintenance-management-bde6.firebasestorage.app",
  messagingSenderId: "1039084599361",
  appId: "1:1039084599361:web:03b8ddd873f63b1d712ec0",
  measurementId: "G-9V7FM8YRQ5"
};
const configured = !Object.values(firebaseConfig).some(v=>String(v).includes("YOUR_"));
let auth,db,user=null,profile=null;
const $=id=>document.getElementById(id);
const show=(id,on=true)=>$(id).classList.toggle("hidden",!on);
const today=()=>new Date().toISOString().slice(0,10);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function init(){if(!configured){$("loginView").innerHTML='<h1>ยังไม่ได้ตั้งค่า Firebase</h1><p>เปิดไฟล์ README_TH.md เพื่อทำตามขั้นตอนตั้งค่าก่อนเปิดใช้งานจริง</p>';return}
 const app=initializeApp(firebaseConfig);auth=getAuth(app);db=getFirestore(app);
 $("loginBtn").onclick=async()=>{try{await signInWithRedirect(auth,new GoogleAuthProvider())}catch(e){alert(e.message)}};
 $("logout").onclick=()=>signOut(auth);$("refreshStatus").onclick=()=>location.reload();
 onAuthStateChanged(auth,async u=>{user=u;if(!u){show("loginView");show("pendingView",false);show("appView",false);show("logout",false);return}
 show("loginView",false);show("logout",true);$("pendingEmail").textContent=u.email;
 const ref=doc(db,"users",u.uid),snap=await getDoc(ref);
 if(!snap.exists()){await setDoc(ref,{email:u.email,name:u.displayName||"",role:"pending",status:"pending",createdAt:serverTimestamp()});show("pendingView");show("appView",false);return}
 profile=snap.data();if(profile.status!=="approved"){show("pendingView");show("appView",false);$("pendingView").querySelector("h1").textContent=profile.status==="suspended"?"บัญชีถูกระงับ":"รอการอนุมัติ";return}
 show("pendingView",false);show("appView");document.body.classList.add("approved");$("userInfo").textContent=u.email;$("roleTag").textContent=profile.role;
 document.querySelectorAll(".admin-only").forEach(el=>el.style.display=profile.role==="admin"?"inline-block":"none");
 if(profile.role!=="admin"){$("members").classList.add("hidden");document.querySelector('[data-tab="members"]').style.display="none";}
 if(profile.role!=="admin")$("members").remove();
 bindUI();await loadAll();
 });}
function bindUI(){
 document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{document.querySelectorAll("nav button").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.querySelectorAll(".tab").forEach(x=>show(x.id,x.id===b.dataset.tab))});
 $("newRepair").onclick=()=>{ $("repairForm").reset();$("repairId").value="";$("repairDate").value=today();show("repairForm")};
 $("cancelRepair").onclick=()=>show("repairForm",false);
 $("systemForm").onsubmit=async e=>{e.preventDefault();await addDoc(collection(db,"systems"),{name:$("systemName").value.trim(),active:true,createdAt:serverTimestamp()});$("systemName").value="";loadAll()};
 $("contractorForm").onsubmit=async e=>{e.preventDefault();await addDoc(collection(db,"contractors"),{name:$("contractorName").value.trim(),active:true});$("contractorName").value="";loadAll()};
 $("repairForm").onsubmit=saveRepair;
 $("evaluationForm").onsubmit=saveEvaluation;
}
async function rows(name){const s=await getDocs(collection(db,name));return s.docs.map(d=>({id:d.id,...d.data()}))}
async function loadAll(){const [systems,repairs,contractors,evals]=await Promise.all(["systems","repairs","contractors","evaluations"].map(rows));
 const active=systems.filter(x=>x.active!==false);$("statSystems").textContent=active.length;$("statOpen").textContent=repairs.filter(x=>x.status!=="เสร็จแล้ว").length;$("statDone").textContent=repairs.filter(x=>x.status==="เสร็จแล้ว").length;$("statContractors").textContent=contractors.length;
 const options=(arr,placeholder)=>`<option value="">${placeholder}</option>`+arr.map(x=>`<option value="${esc(x.id)}">${esc(x.name)}</option>`).join("");
 $("repairSystem").innerHTML=options(active,"เลือกระบบ");$("repairContractor").innerHTML=options(contractors,"ไม่ระบุ");$("evalContractor").innerHTML=options(contractors,"เลือกผู้รับเหมา");
 $("systemList").innerHTML=active.map(x=>`<div class="item"><span>${esc(x.name)}</span><button class="secondary" data-rename="${x.id}">แก้ไขชื่อ</button><button class="danger" data-disable="${x.id}">ปิดใช้งาน</button></div>`).join("")||"<p class=muted>ยังไม่มีรายการระบบ</p>";
 $("contractorList").innerHTML=contractors.map(x=>`<div class=item>${esc(x.name)}</div>`).join("");
 $("repairList").innerHTML=table(repairs,["date","systemName","location","issue","status"],["วันที่","ระบบ","จุดที่ซ่อม","อาการ","สถานะ"]);
 $("recentRepairs").innerHTML=table(repairs.slice(-5).reverse(),["date","systemName","issue","status"],["วันที่","ระบบ","อาการ","สถานะ"]);
 $("evaluationList").innerHTML=table(evals,["contractorName","date","average","note"],["ผู้รับเหมา","วันที่","คะแนนเฉลี่ย","หมายเหตุ"]);
 if(profile.role==="admin"){
   const users=await rows("users");
   $("memberList").innerHTML=users.map(m=>`<div class="item"><div><strong>${esc(m.email)}</strong><div class="muted">${esc(m.status||"pending")} · ${esc(m.role||"pending")}</div></div><div class="member-actions">${m.status!=="approved"?`<button data-approve="${m.id}" class="small">อนุมัติ</button>`:""}<select data-role="${m.id}" aria-label="กำหนดสิทธิ์"><option value="viewer" ${m.role==="viewer"?"selected":""}>Viewer</option><option value="editor" ${m.role==="editor"?"selected":""}>Editor</option><option value="admin" ${m.role==="admin"?"selected":""}>Admin</option></select><button class="danger small" data-suspend="${m.id}">ระงับ</button></div></div>`).join("")||"<p class=muted>ยังไม่มีสมาชิก</p>";
   document.querySelectorAll("[data-approve]").forEach(b=>b.onclick=async()=>{const id=b.dataset.approve;await updateDoc(doc(db,"users",id),{status:"approved",role:"editor",approvedBy:user.email,approvedAt:serverTimestamp()});await loadAll()});
   document.querySelectorAll("[data-role]").forEach(s=>s.onchange=async()=>{await updateDoc(doc(db,"users",s.dataset.role),{role:s.value,status:"approved",updatedBy:user.email,updatedAt:serverTimestamp()});await loadAll()});
   document.querySelectorAll("[data-suspend]").forEach(b=>b.onclick=async()=>{if(confirm("ระงับสมาชิกนี้หรือไม่?")){await updateDoc(doc(db,"users",b.dataset.suspend),{status:"suspended"});await loadAll()}});
 }
 document.querySelectorAll("[data-rename]").forEach(b=>b.onclick=async()=>{const x=systems.find(v=>v.id===b.dataset.rename),n=prompt("ชื่อระบบใหม่",x.name);if(n?.trim())await updateDoc(doc(db,"systems",x.id),{name:n.trim()});loadAll()});
 document.querySelectorAll("[data-disable]").forEach(b=>b.onclick=async()=>{if(confirm("ปิดใช้งานระบบนี้? ประวัติเก่าจะยังคงอยู่"))await updateDoc(doc(db,"systems",b.dataset.disable),{active:false});loadAll()});
}
function table(data,keys,heads){if(!data.length)return'<p class="muted">ยังไม่มีข้อมูล</p>';return `<table><thead><tr>${heads.map(x=>`<th>${x}</th>`).join("")}</tr></thead><tbody>${data.map(r=>`<tr>${keys.map(k=>`<td>${esc(r[k]??"-")}</td>`).join("")}</tr>`).join("")}</tbody></table>`}
async function saveRepair(e){e.preventDefault();const id=$("repairId").value,sys=$("repairSystem").selectedOptions[0]?.text||"",con=$("repairContractor").selectedOptions[0]?.text||"";
 const data={date:$("repairDate").value,systemId:$("repairSystem").value,systemName:sys,location:$("repairLocation").value,equipment:$("repairEquipment").value,issue:$("repairIssue").value,cause:$("repairCause").value,action:$("repairAction").value,contractorId:$("repairContractor").value,contractorName:con,status:$("repairStatus").value,updatedAt:serverTimestamp(),updatedBy:user.email};
 if(id)await updateDoc(doc(db,"repairs",id),data);else await addDoc(collection(db,"repairs"),{...data,createdAt:serverTimestamp(),createdBy:user.email});
 show("repairForm",false);await loadAll()}
async function saveEvaluation(e){e.preventDefault();const c=$("evalContractor"),scores=["quality","speed","solution","neatness","coordination"].map(k=>Number($(k).value));await addDoc(collection(db,"evaluations"),{contractorId:c.value,contractorName:c.selectedOptions[0].text,date:$("evalDate").value,quality:scores[0],speed:scores[1],solution:scores[2],neatness:scores[3],coordination:scores[4],average:(scores.reduce((a,b)=>a+b,0)/5).toFixed(2),note:$("evalNote").value,createdBy:user.email,createdAt:serverTimestamp()});e.target.reset();loadAll()}
init();