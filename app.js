// --- LOGIN SETTINGS ---
const STAFF_USER = "staff";
const STAFF_PASS = "staff123";
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

let isAdmin = false;

// --- DOM ELEMENTS ---
const loginSection = document.getElementById("loginSection");
const appSection = document.getElementById("appSection");
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");

// Patients
const patientForm = document.getElementById("patientForm");
const patientsSection = document.getElementById("patientsSection");
const patientTableBody = document.querySelector("#patientTable tbody");
const viewPatientsBtn = document.getElementById("viewPatientsBtn");
const closePatientsBtn = document.getElementById("closePatientsBtn");
const searchPatientInput = document.getElementById("searchPatientInput");
const exportPatientsBtn = document.getElementById("exportPatientsBtn");

// Doctors
const doctorForm = document.getElementById("doctorForm");
const doctorsSection = document.getElementById("doctorsSection");
const doctorTableBody = document.querySelector("#doctorTable tbody");
const viewDoctorsBtn = document.getElementById("viewDoctorsBtn");
const closeDoctorsBtn = document.getElementById("closeDoctorsBtn");
const searchDoctorInput = document.getElementById("searchDoctorInput");
const exportDoctorsBtn = document.getElementById("exportDoctorsBtn");

// Appointments
const appointmentForm = document.getElementById("appointmentForm");
const appointmentsSection = document.getElementById("appointmentsSection");
const appointmentTableBody = document.querySelector("#appointmentTable tbody");
const viewAppointmentsBtn = document.getElementById("viewAppointmentsBtn");
const closeAppointmentsBtn = document.getElementById("closeAppointmentsBtn");
const searchAppointmentInput = document.getElementById("searchAppointmentInput");
const exportAppointmentsBtn = document.getElementById("exportAppointmentsBtn");

// Earnings (Admin Only)
const earningsSection = document.getElementById("earningsSection");
const earningsContent = document.getElementById("earningsContent");
const closeEarningsBtn = document.getElementById("closeEarningsBtn");

// --- DATA STORAGE ---
let patients = JSON.parse(localStorage.getItem("patients")) || [];
let doctors = JSON.parse(localStorage.getItem("doctors")) || [];
let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
let editingPatientId = null;
let editingDoctorId = null;
let editingAppointmentId = null;

// --- LOGIN LOGIC ---
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const user = loginForm.username.value.trim();
  const pass = loginForm.password.value.trim();

  if (user === STAFF_USER && pass === STAFF_PASS) {
    isAdmin = false;
    loginSection.style.display = "none";
    appSection.style.display = "block";
    earningsSection.style.display = "none"; // staff cannot see earnings
    renderAll();
  } else if (user === ADMIN_USER && pass === ADMIN_PASS) {
    isAdmin = true;
    loginSection.style.display = "none";
    appSection.style.display = "block";
    earningsSection.style.display = "block"; // admin sees earnings
    renderAll();
    renderEarnings();
  } else {
    alert("Invalid login! Try again.");
  }
});

logoutBtn.addEventListener("click", () => {
  appSection.style.display = "none";
  loginSection.style.display = "block";
  isAdmin = false;
});

// --- ID GENERATORS ---
function generateID(arr, prefix) {
  const ids = arr.map(x => parseInt(x.id.slice(1))).filter(n => !isNaN(n));
  const next = ids.length > 0 ? Math.max(...ids) + 1 : 1;
  return prefix + String(next).padStart(4, "0");
}

// --- PATIENT HANDLING ---
patientForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const photoFile = document.getElementById("photo").files[0];
  const filesInput = document.getElementById("files").files;

  let photoData = "";
  let filesData = [];

  function finalizeSave() {
    if (editingPatientId) {
      const p = patients.find(p => p.id === editingPatientId);
      if (p) {
        Object.assign(p, {
          name: patientForm.name.value.trim(),
          age: patientForm.age.value.trim(),
          gender: patientForm.gender.value,
          phone: patientForm.phone.value.trim(),
          relativePhone: patientForm.relativePhone.value.trim(),
          address: patientForm.address.value.trim(),
          referredBy: patientForm.referredBy.value.trim(),
          fatherHusband: patientForm.fatherHusband.value.trim(),
          bloodGroup: patientForm.bloodGroup.value.trim(),
          diagnosis: patientForm.diagnosis.value.trim(),
          kidsAlive: patientForm.kidsAlive.value.trim(),
          kidsDead: patientForm.kidsDead.value.trim(),
          siblingsAlive: patientForm.siblingsAlive.value.trim(),
          siblingsDead: patientForm.siblingsDead.value.trim(),
          fee: patientForm.fee.value.trim()
        });
        if (photoData) p.photo = photoData;
        if (filesData.length > 0) p.files = filesData;
        alert("Patient updated.");
      }
      editingPatientId = null;
    } else {
      const patient = {
        id: generateID(patients, "P"),
        name: patientForm.name.value.trim(),
        age: patientForm.age.value.trim(),
        gender: patientForm.gender.value,
        phone: patientForm.phone.value.trim(),
        relativePhone: patientForm.relativePhone.value.trim(),
        address: patientForm.address.value.trim(),
        referredBy: patientForm.referredBy.value.trim(),
        fatherHusband: patientForm.fatherHusband.value.trim(),
        bloodGroup: patientForm.bloodGroup.value.trim(),
        diagnosis: patientForm.diagnosis.value.trim(),
        kidsAlive: patientForm.kidsAlive.value.trim(),
        kidsDead: patientForm.kidsDead.value.trim(),
        siblingsAlive: patientForm.siblingsAlive.value.trim(),
        siblingsDead: patientForm.siblingsDead.value.trim(),
        fee: patientForm.fee.value.trim(),
        photo: photoData,
        files: filesData
      };
      patients.push(patient);
      alert("Patient registered.");
    }
    localStorage.setItem("patients", JSON.stringify(patients));
    patientForm.reset();
    renderPatients();
  }

  function processFiles(i = 0) {
    if (i >= filesInput.length) {
      if (photoFile) {
        const readerPhoto = new FileReader();
        readerPhoto.onload = (e2) => { photoData = e2.target.result; finalizeSave(); };
        readerPhoto.readAsDataURL(photoFile);
      } else {
        finalizeSave();
      }
      return;
    }
    const fr = new FileReader();
    fr.onload = (e3) => {
      filesData.push({ name: filesInput[i].name, data: e3.target.result });
      processFiles(i + 1);
    };
    fr.readAsDataURL(filesInput[i]);
  }

  processFiles();
});

function renderPatients() {
  patientTableBody.innerHTML = "";
  patients.forEach(p => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${p.gender}</td>
      <td>${p.diagnosis}</td>
      <td>${p.fee}</td>
      <td>
        <button onclick="editPatient('${p.id}')">Edit</button>
        <button onclick="deletePatient('${p.id}')">Delete</button>
        <button onclick="printPatient('${p.id}')">Print</button>
      </td>`;
    patientTableBody.appendChild(row);
  });
  filterPatients();
}

window.editPatient = function(id) {
  const p = patients.find(x => x.id === id);
  if (!p) return;
  editingPatientId = id;
  Object.keys(p).forEach(k => {
    if (patientForm[k]) patientForm[k].value = p[k];
  });
  patientsSection.style.display = "none";
};

window.deletePatient = function(id) {
  if (!confirm("Delete patient?")) return;
  patients = patients.filter(p => p.id !== id);
  localStorage.setItem("patients", JSON.stringify(patients));
  renderPatients();
};

window.printPatient = function(id) {
  const p = patients.find(x => x.id === id);
  if (!p) return;
  const newWin = window.open("", "_blank");
  newWin.document.write(`
    <html><head><title>Patient ${p.id}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 40px; background: #fff; }
      .header { text-align: center; margin-bottom: 20px; position: relative; }
      .header img.logo { position: absolute; left: 40px; top: 10px; width: 80px; }
      .header h1 { margin: 0; color: #007bff; font-size: 22px; }
      .watermark {
        position: fixed; top: 40%; left: 50%; transform: translate(-50%, -50%);
        font-size: 90px; color: rgba(0,0,0,0.05); z-index: -1; font-weight: bold;
      }
      .photo { float: right; width: 120px; height: 120px; border: 1px solid #ccc; object-fit: cover; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      td { border: 1px solid #ccc; padding: 8px; font-size: 14px; }
      h2 { margin-top: 40px; color: #333; }
      @media print { button { display: none; } }
    </style></head>
    <body>
      <div class="header">
        <img src="https://i.ibb.co/sFqYkFD/hospital-logo.png" class="logo" />
        <h1>Lahore Psychiatric Hospital</h1>
      </div>
      <div class="watermark">L.P.H</div>
      ${p.photo ? `<img src="${p.photo}" class="photo" />` : ""}
      <table>
        <tr><td><b>ID</b></td><td>${p.id}</td></tr>
        <tr><td><b>Name</b></td><td>${p.name}</td></tr>
        <tr><td><b>Age</b></td><td>${p.age}</td></tr>
        <tr><td><b>Gender</b></td><td>${p.gender}</td></tr>
        <tr><td><b>Phone</b></td><td>${p.phone}</td></tr>
        <tr><td><b>Relative Phone</b></td><td>${p.relativePhone}</td></tr>
        <tr><td><b>Address</b></td><td>${p.address}</td></tr>
        <tr><td><b>Referred By</b></td><td>${p.referredBy}</td></tr>
        <tr><td><b>Father/Husband</b></td><td>${p.fatherHusband}</td></tr>
        <tr><td><b>Blood Group</b></td><td>${p.bloodGroup}</td></tr>
        <tr><td><b>Diagnosis</b></td><td>${p.diagnosis}</td></tr>
        <tr><td><b>Kids Alive</b></td><td>${p.kidsAlive}</td></tr>
        <tr><td><b>Kids Dead</b></td><td>${p.kidsDead}</td></tr>
        <tr><td><b>Siblings Alive</b></td><td>${p.siblingsAlive}</td></tr>
        <tr><td><b>Siblings Dead</b></td><td>${p.siblingsDead}</td></tr>
        <tr><td><b>Fee</b></td><td>${p.fee} PKR</td></tr>
      </table>
      <h2>Attached Files</h2>
      ${(p.files||[]).map(f => `<div><a href="${f.data}" download="${f.name}">${f.name}</a></div>`).join("")}
      <br><button onclick="window.print()">Print</button>
    </body></html>
  `);
  newWin.document.close();
};

// --- DOCTOR HANDLING ---
doctorForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (editingDoctorId) {
    const d = doctors.find(d => d.id === editingDoctorId);
    if (d) {
      d.name = doctorForm.doctorName.value.trim();
      d.specialty = doctorForm.specialty.value.trim();
      d.phone = doctorForm.doctorPhone.value.trim();
      d.availability = doctorForm.availability.value.trim();
      alert("Doctor updated.");
    }
    editingDoctorId = null;
  } else {
    const doctor = {
      id: generateID(doctors, "D"),
      name: doctorForm.doctorName.value.trim(),
      specialty: doctorForm.specialty.value.trim(),
      phone: doctorForm.doctorPhone.value.trim(),
      availability: doctorForm.availability.value.trim()
    };
    doctors.push(doctor);
    alert("Doctor registered.");
  }
  localStorage.setItem("doctors", JSON.stringify(doctors));
  doctorForm.reset();
  renderDoctors();
});

function renderDoctors() {
  doctorTableBody.innerHTML = "";
  doctors.forEach(d => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${d.id}</td>
      <td>${d.name}</td>
      <td>${d.specialty}</td>
      <td>${d.phone}</td>
      <td>${d.availability}</td>
      <td>
        <button onclick="editDoctor('${d.id}')">Edit</button>
        <button onclick="deleteDoctor('${d.id}')">Delete</button>
      </td>`;
    doctorTableBody.appendChild(row);
  });
  filterDoctors();
}

window.editDoctor = function(id) {
  const d = doctors.find(x => x.id === id);
  if (!d) return;
  editingDoctorId = id;
  doctorForm.doctorName.value = d.name;
  doctorForm.specialty.value = d.specialty;
  doctorForm.doctorPhone.value = d.phone;
  doctorForm.availability.value = d.availability;
  doctorsSection.style.display = "none";
};

window.deleteDoctor = function(id) {
  if (!confirm("Delete doctor?")) return;
  doctors = doctors.filter(d => d.id !== id);
  localStorage.setItem("doctors", JSON.stringify(doctors));
  renderDoctors();
};

// --- APPOINTMENT HANDLING ---
appointmentForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (editingAppointmentId) {
    const a = appointments.find(a => a.id === editingAppointmentId);
    if (a) {
      a.patientId = appointmentForm.patientId.value.trim();
      a.doctorId = appointmentForm.doctorId.value.trim();
      a.date = appointmentForm.date.value;
      a.time = appointmentForm.time.value;
      a.fee = appointmentForm.appointmentFee.value.trim();
      alert("Appointment updated.");
    }
    editingAppointmentId = null;
  } else {
    const appt = {
      id: generateID(appointments, "A"),
      patientId: appointmentForm.patientId.value.trim(),
      doctorId: appointmentForm.doctorId.value.trim(),
      date: appointmentForm.date.value,
      time: appointmentForm.time.value,
      fee: appointmentForm.appointmentFee.value.trim()
    };
    appointments.push(appt);
    alert("Appointment booked.");
  }
  localStorage.setItem("appointments", JSON.stringify(appointments));
  appointmentForm.reset();
  renderAppointments();
});

function renderAppointments() {
  appointmentTableBody.innerHTML = "";
  appointments.forEach(a => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${a.id}</td>
      <td>${a.patientId}</td>
      <td>${a.doctorId}</td>
      <td>${a.date}</td>
      <td>${a.time}</td>
      <td>${a.fee}</td>
      <td>
        <button onclick="editAppointment('${a.id}')">Edit</button>
        <button onclick="deleteAppointment('${a.id}')">Delete</button>
      </td>`;
    appointmentTableBody.appendChild(row);
  });
  filterAppointments();
}

window.editAppointment = function(id) {
  const a = appointments.find(x => x.id === id);
  if (!a) return;
  editingAppointmentId = id;
  appointmentForm.patientId.value = a.patientId;
  appointmentForm.doctorId.value = a.doctorId;
  appointmentForm.date.value = a.date;
  appointmentForm.time.value = a.time;
  appointmentForm.appointmentFee.value = a.fee;
  appointmentsSection.style.display = "none";
};

window.deleteAppointment = function(id) {
  if (!confirm("Delete appointment?")) return;
  appointments = appointments.filter(a => a.id !== id);
  localStorage.setItem("appointments", JSON.stringify(appointments));
  renderAppointments();
};

// --- EARNINGS (ADMIN ONLY) ---
function renderEarnings() {
  let totalPatientFees = patients.reduce((sum, p) => sum + (parseInt(p.fee) || 0), 0);
  let totalAppointmentFees = appointments.reduce((sum, a) => sum + (parseInt(a.fee) || 0), 0);
  let total = totalPatientFees + totalAppointmentFees;

  earningsContent.innerHTML = `
    <h3>Total Earnings: ${total} PKR</h3>
    <h4>From Patients:</h4>
    <ul>${patients.map(p => `<li>${p.id} - ${p.name} - ${p.fee} PKR</li>`).join("")}</ul>
    <h4>From Appointments:</h4>
    <ul>${appointments.map(a => `<li>${a.id} - Patient ${a.patientId} with Doctor ${a.doctorId} - ${a.fee} PKR</li>`).join("")}</ul>
  `;
}

// --- SEARCH & FILTERS ---
searchPatientInput.addEventListener("input", filterPatients);
function filterPatients() {
  const filter = searchPatientInput.value.toUpperCase();
  [...patientTableBody.rows].forEach(row => {
    row.style.display = [...row.cells].some(c => c.textContent.toUpperCase().includes(filter)) ? "" : "none";
  });
}

searchDoctorInput.addEventListener("input", filterDoctors);
function filterDoctors() {
  const filter = searchDoctorInput.value.toUpperCase();
  [...doctorTableBody.rows].forEach(row => {
    row.style.display = [...row.cells].some(c => c.textContent.toUpperCase().includes(filter)) ? "" : "none";
  });
}

searchAppointmentInput.addEventListener("input", filterAppointments);
function filterAppointments() {
  const filter = searchAppointmentInput.value.toUpperCase();
  [...appointmentTableBody.rows].forEach(row => {
    row.style.display = [...row.cells].some(c => c.textContent.toUpperCase().includes(filter)) ? "" : "none";
  });
}

// --- EXPORT CSV ---
function exportCSV(data, headers, filename) {
  if (data.length === 0) { alert("No records to export."); return; }
  const rows = [headers, ...data];
  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

exportPatientsBtn.addEventListener("click", () =>
  exportCSV(patients.map(p => [p.id,p.name,p.age,p.gender,p.phone,p.fee]),
    ["ID","Name","Age","Gender","Phone","Fee"], "patients.csv")
);

exportDoctorsBtn.addEventListener("click", () =>
  exportCSV(doctors.map(d => [d.id,d.name,d.specialty,d.phone,d.availability]),
    ["ID","Name","Specialty","Phone","Availability"], "doctors.csv")
);

exportAppointmentsBtn.addEventListener("click", () =>
  exportCSV(appointments.map(a => [a.id,a.patientId,a.doctorId,a.date,a.time,a.fee]),
    ["ID","PatientID","DoctorID","Date","Time","Fee"], "appointments.csv")
);

// --- INITIAL RENDER ---
function renderAll() {
  renderPatients();
  renderDoctors();
  renderAppointments();
  if (isAdmin) renderEarnings();
}
