/* ========= AUTH ========= */
const STAFF = {u:"staff", p:"staff123"};
const ADMIN = {u:"admin", p:"admin123"};
let isAdmin = false;

const q = (s)=>document.querySelector(s);
const qa = (s)=>[...document.querySelectorAll(s)];

const loginSection = q("#loginSection");
const appSection   = q("#appSection");
const loginForm    = q("#loginForm");
const logoutBtn    = q("#logoutBtn");

loginForm.addEventListener("submit",(e)=>{
  e.preventDefault();
  const u = loginForm.username.value.trim();
  const p = loginForm.password.value.trim();
  if (u===STAFF.u && p===STAFF.p){ isAdmin=false; enterApp(); }
  else if (u===ADMIN.u && p===ADMIN.p){ isAdmin=true; enterApp(); }
  else alert("Invalid credentials");
});

function enterApp(){
  loginSection.style.display = "none";
  appSection.style.display = "block";
  q(".adminOnly").style.display = isAdmin ? "inline-block" : "none";
  activateTab("patientsTab");
  renderAll();
}
logoutBtn.addEventListener("click",()=>{
  appSection.style.display="none";
  loginSection.style.display="block";
});

/* ========= NAV / TABS ========= */
qa(".tab").forEach(btn=>{
  btn.addEventListener("click", ()=> activateTab(btn.dataset.tab));
});
function activateTab(id){
  qa(".tab").forEach(b=>b.classList.toggle("active", b.dataset.tab===id));
  qa(".tabpage").forEach(p=>p.classList.toggle("show", p.id===id));
}

/* ========= STORAGE ========= */
let patients     = JSON.parse(localStorage.getItem("patients")||"[]");
let doctors      = JSON.parse(localStorage.getItem("doctors")||"[]");
let appointments = JSON.parse(localStorage.getItem("appointments")||"[]");

function persist(){ // one shot save
  localStorage.setItem("patients",JSON.stringify(patients));
  localStorage.setItem("doctors",JSON.stringify(doctors));
  localStorage.setItem("appointments",JSON.stringify(appointments));
}

/* ========= UTIL ========= */
const uid = (prefix, n)=>prefix + String(n+1).padStart(4,"0");
const byId = (id, arr)=>arr.find(x=>x.id===id) || null;

/* ========= CSV helpers ========= */
function toCSV(rows, headers){
  const esc = (v)=>`"${String(v??"").replace(/"/g,'""')}"`;
  const all = [headers, ...rows.map(r=>headers.map(h=>esc(r[h])))];
  return all.map(r=>r.join(",")).join("\n");
}
function download(name, text){
  const blob = new Blob([text], {type:"text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href=url; a.download=name; a.click();
  URL.revokeObjectURL(url);
}
function parseCSV(text){
  // very simple CSV parser for our generated files
  const lines = text.trim().split(/\r?\n/);
  const headers = lines.shift().split(",").map(h=>h.replace(/^"|"$/g,""));
  return lines.map(line=>{
    // split on commas outside quotes
    const cells = [];
    let cur="", inQ=false;
    for (let i=0;i<line.length;i++){
      const c=line[i];
      if (c==='"' && line[i+1]==='"'){ cur+='"'; i++; continue; }
      if (c==='"'){ inQ=!inQ; continue; }
      if (c===',' && !inQ){ cells.push(cur); cur=""; continue; }
      cur+=c;
    }
    cells.push(cur);
    const obj={};
    headers.forEach((h,i)=>obj[h]=cells[i]?.replace(/^"|"$/g,"") ?? "");
    return obj;
  });
}

/* ========= PATIENTS ========= */
const pf = {
  name: q("#p_name"), age:q("#p_age"), gender:q("#p_gender"),
  phone:q("#p_phone"), relativePhone:q("#p_relativePhone"),
  address:q("#p_address"), referredBy:q("#p_referredBy"),
  fatherHusband:q("#p_fatherHusband"), bloodGroup:q("#p_bloodGroup"),
  diagnosis:q("#p_diagnosis"), kidsAlive:q("#p_kidsAlive"), kidsDead:q("#p_kidsDead"),
  siblingsAlive:q("#p_siblingsAlive"), siblingsDead:q("#p_siblingsDead"),
  fee:q("#p_fee"), photo:q("#p_photo"), files:q("#p_files")
};
const patientForm = q("#patientForm");
const patientResetBtn = q("#patientResetBtn");
const patientsTbody = q("#patientsTable tbody");
const patientSearch = q("#patientSearch");

patientForm.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const id = uid("P", patients.length);

  // encode photo (optional)
  let photoData = "";
  const photoFile = pf.photo.files?.[0];
  if (photoFile) photoData = await fileToDataURL(photoFile);

  // encode multiple files (names only for table; content stored as base64)
  const files = [];
  if (pf.files.files?.length){
    for (const f of pf.files.files){
      const data = await fileToDataURL(f);
      files.push({name:f.name, type:f.type, data});
    }
  }

  const feeVal = Number(pf.fee.value || 0);
  if (feeVal < 2000 || feeVal > 20000){ alert("Fee must be 2000–20000 PKR"); return; }

  const patient = {
    id,
    name: pf.name.value.trim(),
    age: pf.age.value.trim(),
    gender: pf.gender.value,
    phone: pf.phone.value.trim(),
    relativePhone: pf.relativePhone.value.trim(),
    address: pf.address.value.trim(),
    referredBy: pf.referredBy.value.trim(),
    fatherHusband: pf.fatherHusband.value.trim(),
    bloodGroup: pf.bloodGroup.value.trim(),
    diagnosis: pf.diagnosis.value.trim(),
    kidsAlive: pf.kidsAlive.value.trim(),
    kidsDead: pf.kidsDead.value.trim(),
    siblingsAlive: pf.siblingsAlive.value.trim(),
    siblingsDead: pf.siblingsDead.value.trim(),
    fee: feeVal,
    photo: photoData,
    files
  };
  patients.push(patient);
  persist();
  renderPatients();
  patientForm.reset();
});
patientResetBtn.addEventListener("click", ()=>patientForm.reset());

function renderPatients(){
  const filter = patientSearch.value?.toLowerCase() || "";
  patientsTbody.innerHTML = "";
  patients
    .filter(p => [p.id,p.name,p.diagnosis].some(v=>String(v).toLowerCase().includes(filter)))
    .forEach((p,i)=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>${p.gender||""}</td>
        <td>${p.diagnosis||""}</td>
        <td>${p.fee||0}</td>
        <td class="row">
          <button class="btn small" onclick="editPatient(${i})">Edit</button>
          <button class="btn danger small" onclick="deletePatient(${i})">Delete</button>
          <button class="btn small" onclick="viewFiles(${i})">Files</button>
        </td>`;
      patientsTbody.appendChild(tr);
    });
}
window.editPatient = (i)=>{
  const p = patients[i];
  pf.name.value=p.name; pf.age.value=p.age; pf.gender.value=p.gender||"";
  pf.phone.value=p.phone; pf.relativePhone.value=p.relativePhone; pf.address.value=p.address;
  pf.referredBy.value=p.referredBy; pf.fatherHusband.value=p.fatherHusband;
  pf.bloodGroup.value=p.bloodGroup; pf.diagnosis.value=p.diagnosis;
  pf.kidsAlive.value=p.kidsAlive; pf.kidsDead.value=p.kidsDead;
  pf.siblingsAlive.value=p.siblingsAlive; pf.siblingsDead.value=p.siblingsDead;
  pf.fee.value=p.fee;
  // remove so re-submission updates
  patients.splice(i,1); persist(); renderPatients();
};
window.deletePatient = (i)=>{
  if(!confirm("Delete this patient?")) return;
  patients.splice(i,1); persist(); renderPatients();
};
window.viewFiles = (i)=>{
  const p = patients[i];
  if (!p.files?.length){ alert("No files uploaded for this patient."); return; }
  const links = p.files.map((f,idx)=>{
    const a = document.createElement("a");
    a.href = f.data; a.download = `${p.id}-${idx+1}-${f.name}`; a.textContent = f.name;
    return a.outerHTML;
  }).join(" | ");
  alert(`Files for ${p.name}:\n\n${p.files.map(f=>f.name).join("\n")}\n\nTip: Use 'Print Preview' to include patient details in A4 format.`);
};

patientSearch.addEventListener("input", renderPatients);

q("#patientExportCsv").addEventListener("click", ()=>{
  const headers = ["id","name","age","gender","phone","relativePhone","address","referredBy","fatherHusband","bloodGroup","diagnosis","kidsAlive","kidsDead","siblingsAlive","siblingsDead","fee"];
  const csv = toCSV(patients.map(p=>Object.fromEntries(headers.map(h=>[h,p[h]??""]))), headers);
  download("patients.csv", csv);
});
q("#patientImportCsv").addEventListener("change", async (e)=>{
  const file = e.target.files[0]; if(!file) return;
  const text = await file.text();
  const rows = parseCSV(text);
  // merge (no duplicates by id)
  rows.forEach(r=>{
    if (!patients.some(p=>p.id===r.id)){
      patients.push({...r, fee:Number(r.fee||0), photo:"", files:[]});
    }
  });
  persist(); renderPatients(); e.target.value="";
});

/* ========= PATIENT PRINT ========= */
const printPreview = q("#printPreview");
q("#patientPrintPreview").addEventListener("click", ()=>{
  if (!patients.length){ alert("No patients to print."); return; }
  // For simplicity, preview most recent patient (or enhance to select)
  const p = patients[patients.length-1];
  printPreview.innerHTML = `
    <h3>Patient Registration — ${p.id}</h3>
    <div class="print-grid">
      <div>
        <div class="print-row"><strong>Name</strong><span>${p.name}</span></div>
        <div class="print-row"><strong>Age</strong><span>${p.age}</span></div>
        <div class="print-row"><strong>Gender</strong><span>${p.gender||""}</span></div>
        <div class="print-row"><strong>Phone</strong><span>${p.phone||""}</span></div>
        <div class="print-row"><strong>Relative Phone</strong><span>${p.relativePhone||""}</span></div>
        <div class="print-row"><strong>Address</strong><span>${p.address||""}</span></div>
        <div class="print-row"><strong>Referred By</strong><span>${p.referredBy||""}</span></div>
      </div>
      <div>
        <div class="print-row"><strong>Father/Husband</strong><span>${p.fatherHusband||""}</span></div>
        <div class="print-row"><strong>Blood Group</strong><span>${p.bloodGroup||""}</span></div>
        <div class="print-row"><strong>Diagnosis</strong><span>${p.diagnosis||""}</span></div>
        <div class="print-row"><strong>Kids Alive</strong><span>${p.kidsAlive||0}</span></div>
        <div class="print-row"><strong>Kids Dead</strong><span>${p.kidsDead||0}</span></div>
        <div class="print-row"><strong>Siblings Alive</strong><span>${p.siblingsAlive||0}</span></div>
        <div class="print-row"><strong>Siblings Dead</strong><span>${p.siblingsDead||0}</span></div>
        <div class="print-row"><strong>Fee</strong><span>${p.fee||0} PKR</span></div>
      </div>
    </div>
  `;
  printPreview.style.display="block";
  activateTab("patientsTab");
});
q("#patientPrint").addEventListener("click", ()=>{
  if (printPreview.style.display!=="block"){ alert("Open Print Preview first."); return; }
  window.print();
});

/* ========= DOCTORS ========= */
const df = { name:q("#d_name"), specialty:q("#d_specialty"), phone:q("#d_phone"), availability:q("#d_availability") };
const doctorForm = q("#doctorForm");
const doctorResetBtn = q("#doctorResetBtn");
const doctorsTbody = q("#doctorsTable tbody");
const doctorSearch = q("#doctorSearch");

doctorForm.addEventListener("submit",(e)=>{
  e.preventDefault();
  const id = uid("D", doctors.length);
  const d = { id, name:df.name.value.trim(), specialty:df.specialty.value.trim(), phone:df.phone.value.trim(), availability:df.availability.value.trim() };
  doctors.push(d); persist(); renderDoctors(); doctorForm.reset();
});
doctorResetBtn.addEventListener("click", ()=>doctorForm.reset());

function renderDoctors(){
  const f = (doctorSearch.value||"").toLowerCase();
  doctorsTbody.innerHTML="";
  doctors
    .filter(d=>[d.id,d.name,d.specialty].some(v=>String(v).toLowerCase().includes(f)))
    .forEach((d,i)=>{
      const tr=document.createElement("tr");
      tr.innerHTML = `
        <td>${d.id}</td><td>${d.name}</td><td>${d.specialty}</td><td>${d.phone}</td><td>${d.availability}</td>
        <td class="row">
          <button class="btn small" onclick="editDoctor(${i})">Edit</button>
          <button class="btn danger small" onclick="deleteDoctor(${i})">Delete</button>
        </td>`;
      doctorsTbody.appendChild(tr);
    });
}
window.editDoctor = (i)=>{
  const d = doctors[i];
  df.name.value=d.name; df.specialty.value=d.specialty; df.phone.value=d.phone; df.availability.value=d.availability;
  doctors.splice(i,1); persist(); renderDoctors();
};
window.deleteDoctor = (i)=>{
  if(!confirm("Delete this doctor?")) return;
  doctors.splice(i,1); persist(); renderDoctors();
};

q("#doctorExportCsv").addEventListener("click", ()=>{
  const headers = ["id","name","specialty","phone","availability"];
  const csv = toCSV(doctors.map(d=>Object.fromEntries(headers.map(h=>[h,d[h]??""]))), headers);
  download("doctors.csv", csv);
});
q("#doctorImportCsv").addEventListener("change", async (e)=>{
  const f = e.target.files[0]; if(!f) return;
  const text = await f.text();
  const rows = parseCSV(text);
  rows.forEach(r=>{ if(!doctors.some(d=>d.id===r.id)) doctors.push(r); });
  persist(); renderDoctors(); e.target.value="";
});

doctorSearch.addEventListener("input", renderDoctors);

/* ========= APPOINTMENTS ========= */
const af = { patientId:q("#a_patientId"), doctorId:q("#a_doctorId"), date:q("#a_date"), time:q("#a_time"), fee:q("#a_fee") };
const appointmentForm = q("#appointmentForm");
const appointmentResetBtn = q("#appointmentResetBtn");
const appointmentsTbody = q("#appointmentsTable tbody");
const appointmentSearch = q("#appointmentSearch");

appointmentForm.addEventListener("submit",(e)=>{
  e.preventDefault();
  const id = uid("A", appointments.length);
  const p = byId(af.patientId.value.trim(), patients);
  const d = byId(af.doctorId.value.trim(), doctors);
  if (!p){ alert("Patient ID not found."); return; }
  if (!d){ alert("Doctor ID not found."); return; }
  const ap = {
    id, patientId:p.id, doctorId:d.id,
    date: af.date.value, time: af.time.value, fee: Number(af.fee.value||0)
  };
  appointments.push(ap); persist(); renderAppointments(); appointmentForm.reset();
});
appointmentResetBtn.addEventListener("click", ()=>appointmentForm.reset());

function renderAppointments(){
  const f = (appointmentSearch.value||"").toLowerCase();
  appointmentsTbody.innerHTML="";
  appointments
    .filter(a=>[a.id,a.patientId,a.doctorId,a.date].some(v=>String(v).toLowerCase().includes(f)))
    .forEach((a,i)=>{
      const tr=document.createElement("tr");
      tr.innerHTML = `
        <td>${a.id}</td><td>${a.patientId}</td><td>${a.doctorId}</td>
        <td>${a.date}</td><td>${a.time}</td><td>${a.fee}</td>
        <td class="row">
          <button class="btn small" onclick="editAppointment(${i})">Edit</button>
          <button class="btn danger small" onclick="deleteAppointment(${i})">Delete</button>
        </td>`;
      appointmentsTbody.appendChild(tr);
    });
}
window.editAppointment = (i)=>{
  const a = appointments[i];
  af.patientId.value=a.patientId; af.doctorId.value=a.doctorId; af.date.value=a.date; af.time.value=a.time; af.fee.value=a.fee;
  appointments.splice(i,1); persist(); renderAppointments();
};
window.deleteAppointment = (i)=>{
  if(!confirm("Delete this appointment?")) return;
  appointments.splice(i,1); persist(); renderAppointments();
};

q("#appointmentExportCsv").addEventListener("click", ()=>{
  const headers = ["id","patientId","doctorId","date","time","fee"];
  const csv = toCSV(appointments.map(a=>Object.fromEntries(headers.map(h=>[h,a[h]??""]))), headers);
  download("appointments.csv", csv);
});
q("#appointmentImportCsv").addEventListener("change", async (e)=>{
  const f = e.target.files[0]; if(!f) return;
  const text = await f.text();
  const rows = parseCSV(text);
  rows.forEach(r=>{ if(!appointments.some(a=>a.id===r.id)) appointments.push({...r, fee:Number(r.fee||0)}); });
  persist(); renderAppointments(); e.target.value="";
});

appointmentSearch.addEventListener("input", renderAppointments);

/* ========= EARNINGS (ADMIN) ========= */
const earningsContent = q("#earningsContent");
function renderEarnings(){
  if (!isAdmin){ earningsContent.innerHTML = "<p>Login as admin to view earnings.</p>"; return; }
  const patientTotal = patients.reduce((s,p)=>s+Number(p.fee||0),0);
  const apptTotal = appointments.reduce((s,a)=>s+Number(a.fee||0),0);
  const total = patientTotal + apptTotal;
  earningsContent.innerHTML = `
    <div class="card">
      <div class="row space"><strong>Patient Fees</strong><span>${patientTotal} PKR</span></div>
      <div class="row space"><strong>Appointment Fees</strong><span>${apptTotal} PKR</span></div>
      <hr/>
      <div class="row space"><strong>Total Earnings</strong><span>${total} PKR</span></div>
    </div>`;
}
q("#earningsExportCsv").addEventListener("click", ()=>{
  const rows = [{type:"Patient Fees", amount:patients.reduce((s,p)=>s+Number(p.fee||0),0)},
                {type:"Appointment Fees", amount:appointments.reduce((s,a)=>s+Number(a.fee||0),0)}];
  const csv = toCSV(rows, ["type","amount"]);
  download("earnings.csv", csv);
});

/* ========= HELPERS ========= */
function fileToDataURL(file){
  return new Promise((res,rej)=>{
    const r = new FileReader();
    r.onload = ()=>res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

/* ========= INITIAL ========= */
function renderAll(){
  renderPatients();
  renderDoctors();
  renderAppointments();
  renderEarnings();
}
renderAll(); // just in case user was already logged in (not shown until login)
