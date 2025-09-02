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

function persist(){
  localStorage.setItem("patients",JSON.stringify(patients));
  localStorage.setItem("doctors",JSON.stringify(doctors));
  localStorage.setItem("appointments",JSON.stringify(appointments));
}

/* ========= UTIL ========= */
const uid = (prefix, n)=>prefix + String(n+1).padStart(4,"0");
const byId = (id, arr)=>arr.find(x=>x.id===id) || null;

/* ========= FILE HELPERS ========= */
function fileToDataURL(file){
  return new Promise((res,rej)=>{
    const r = new FileReader();
    r.onload = ()=>res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
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

  // encode photo
  let photoData = "";
  const photoFile = pf.photo.files?.[0];
  if (photoFile) photoData = await fileToDataURL(photoFile);

  // encode multiple files
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
  patients.splice(i,1); persist(); renderPatients();
};
window.deletePatient = (i)=>{
  if(!confirm("Delete this patient?")) return;
  patients.splice(i,1); persist(); renderPatients();
};
patientSearch.addEventListener("input", renderPatients);

/* ========= DOCTORS (unchanged) ========= */
const df = { name:q("#d_name"), specialty:q("#d_specialty"), phone:q("#d_phone"), availability:q("#_
