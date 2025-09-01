// --- LOGIN ---
const STAFF_USER = "staff";
const STAFF_PASS = "staff123";
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

let isAdmin = false;

const loginSection = document.getElementById("loginSection");
const appSection = document.getElementById("appSection");
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");
const earningsSection = document.getElementById("earningsSection");

// STORAGE
let patients = JSON.parse(localStorage.getItem("patients")) || [];
let doctors = JSON.parse(localStorage.getItem("doctors")) || [];
let appointments = JSON.parse(localStorage.getItem("appointments")) || [];

// LOGIN HANDLING
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const user = this.username.value.trim();
  const pass = this.password.value.trim();

  if (user === STAFF_USER && pass === STAFF_PASS) {
    isAdmin = false;
    loginSection.style.display = "none";
    appSection.style.display = "block";
    earningsSection.style.display = "none";
    renderAll();
  } else if (user === ADMIN_USER && pass === ADMIN_PASS) {
    isAdmin = true;
    loginSection.style.display = "none";
    appSection.style.display = "block";
    earningsSection.style.display = "block";
    renderAll();
  } else {
    alert("Invalid login!");
  }
});

logoutBtn.addEventListener("click", () => {
  appSection.style.display = "none";
  loginSection.style.display = "block";
});

// --- PATIENTS ---
const patientForm = document.getElementById("patientForm");
const patientTableBody = document.querySelector("#patientTable tbody");

patientForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const patient = {
    id: "P" + (patients.length + 1).toString().padStart(4, "0"),
    name: document.getElementById("name").value,
    age: document.getElementById("age").value,
    gender: document.getElementById("gender").value,
    phone: document.getElementById("phone").value,
    relativePhone: document.getElementById("relativePhone").value,
    address: document.getElementById("address").value,
    referredBy: document.getElementById("referredBy").value,
    fatherHusband: document.getElementById("fatherHusband").value,
    bloodGroup: document.getElementById("bloodGroup").value,
    diagnosis: document.getElementById("diagnosis").value,
    kidsAlive: document.getElementById("kidsAlive").value,
    kidsDead: document.getElementById("kidsDead").value,
    siblingsAlive: document.getElementById("siblingsAlive").value,
    siblingsDead: document.getElementById("siblingsDead").value,
    fee: document.getElementById("fee").value
  };

  patients.push(patient);
  localStorage.setItem("patients", JSON.stringify(patients));

  renderPatients();
  this.reset();
});

function renderPatients() {
  patientTableBody.innerHTML = "";
  patients.forEach((p, i) => {
    const row = `<tr>
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${p.gender}</td>
      <td>${p.diagnosis}</td>
      <td>${p.fee}</td>
      <td>
        <button class="editBtn" onclick="editPatient(${i})">Edit</button>
        <button class="deleteBtn" onclick="deletePatient(${i})">Delete</button>
      </td>
    </tr>`;
    patientTableBody.innerHTML += row;
  });
}

function editPatient(i) {
  const p = patients[i];
  document.getElementById("name").value = p.name;
  document.getElementById("age").value = p.age;
  document.getElementById("gender").value = p.gender;
  document.getElementById("phone").value = p.phone;
  document.getElementById("relativePhone").value = p.relativePhone;
  document.getElementById("address").value = p.address;
  document.getElementById("referredBy").value = p.referredBy;
  document.getElementById("fatherHusband").value = p.fatherHusband;
  document.getElementById("bloodGroup").value = p.bloodGroup;
  document.getElementById("diagnosis").value = p.diagnosis;
  document.getElementById("kidsAlive").value = p.kidsAlive;
  document.getElementById("kidsDead").value = p.kidsDead;
  document.getElementById("siblingsAlive").value = p.siblingsAlive;
  document.getElementById("siblingsDead").value = p.siblingsDead;
  document.getElementById("fee").value = p.fee;
  patients.splice(i, 1);
  localStorage.setItem("patients", JSON.stringify(patients));
  renderPatients();
}

function deletePatient(i) {
  if (confirm("Delete this patient?")) {
    patients.splice(i, 1);
    localStorage.setItem("patients", JSON.stringify(patients));
    renderPatients();
  }
}

document.getElementById("viewPatientsBtn").addEventListener("click", () => {
  document.getElementById("patientsSection").style.display = "block";
  renderPatients();
});
document.getElementById("closePatientsBtn").addEventListener("click", () => {
  document.getElementById("patientsSection").style.display = "none";
});

// --- DOCTORS ---
const doctorForm = document.getElementById("doctorForm");
const doctorTableBody = document.querySelector("#doctorTable tbody");

doctorForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const doc = {
    id: "D" + (doctors.length + 1).toString().padStart(4, "0"),
    name: document.getElementById("doctorName").value,
    specialty: document.getElementById("specialty").value,
    phone: document.getElementById("doctorPhone").value,
    availability: document.getElementById("availability").value
  };
  doctors.push(doc);
  localStorage.setItem("doctors", JSON.stringify(doctors));
  renderDoctors();
  this.reset();
});

function renderDoctors() {
  doctorTableBody.innerHTML = "";
  doctors.forEach((d, i) => {
    const row = `<tr>
      <td>${d.id}</td>
      <td>${d.name}</td>
      <td>${d.specialty}</td>
      <td>${d.phone}</td>
      <td>${d.availability}</td>
      <td>
        <button class="editBtn" onclick="editDoctor(${i})">Edit</button>
        <button class="deleteBtn" onclick="deleteDoctor(${i})">Delete</button>
      </td>
    </tr>`;
    doctorTableBody.innerHTML += row;
  });
}

function editDoctor(i) {
  const d = doctors[i];
  document.getElementById("doctorName").value = d.name;
  document.getElementById("specialty").value = d.specialty;
  document.getElementById("doctorPhone").value = d.phone;
  document.getElementById("availability").value = d.availability;
  doctors.splice(i, 1);
  localStorage.setItem("doctors", JSON.stringify(doctors));
  renderDoctors();
}

function deleteDoctor(i) {
  if (confirm("Delete this doctor?")) {
    doctors.splice(i, 1);
    localStorage.setItem("doctors", JSON.stringify(doctors));
    renderDoctors();
  }
}

document.getElementById("viewDoctorsBtn").addEventListener("click", () => {
  document.getElementById("doctorsSection").style.display = "block";
  renderDoctors();
});
document.getElementById("closeDoctorsBtn").addEventListener("click", () => {
  document.getElementById("doctorsSection").style.display = "none";
});

// --- APPOINTMENTS ---
const appointmentForm = document.getElementById("appointmentForm");
const appointmentTableBody = document.querySelector("#appointmentTable tbody");

appointmentForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const appt = {
    id: "A" + (appointments.length + 1).toString().padStart(4, "0"),
    patientId: document.getElementById("patientId").value,
    doctorId: document.getElementById("doctorId").value,
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    fee: document.getElementById("appointmentFee").value
  };
  appointments.push(appt);
  localStorage.setItem("appointments", JSON.stringify(appointments));
  renderAppointments();
  this.reset();
});

function renderAppointments() {
  appointmentTableBody.innerHTML = "";
  appointments.forEach((a, i) => {
    const row = `<tr>
      <td>${a.id}</td>
      <td>${a.patientId}</td>
      <td>${a.doctorId}</td>
      <td>${a.date}</td>
      <td>${a.time}</td>
      <td>${a.fee}</td>
      <td>
        <button class="editBtn" onclick="editAppointment(${i})">Edit</button>
        <button class="deleteBtn" onclick="deleteAppointment(${i})">Delete</button>
      </td>
    </tr>`;
    appointmentTableBody.innerHTML += row;
  });
}

function editAppointment(i) {
  const a = appointments[i];
  document.getElementById("patientId").value = a.patientId;
  document.getElementById("doctorId").value = a.doctorId;
  document.getElementById("date").value = a.date;
  document.getElementById("time").value = a.time;
  document.getElementById("appointmentFee").value = a.fee;
  appointments.splice(i, 1);
  localStorage.setItem("appointments", JSON.stringify(appointments));
  renderAppointments();
}

function deleteAppointment(i) {
  if (confirm("Delete this appointment?")) {
    appointments.splice(i, 1);
    localStorage.setItem("appointments", JSON.stringify(appointments));
    renderAppointments();
  }
}

document.getElementById("viewAppointmentsBtn").addEventListener("click", () => {
  document.getElementById("appointmentsSection").style.display = "block";
  renderAppointments();
});
document.getElementById("closeAppointmentsBtn").addEventListener("click", () => {
  document.getElementById("appointmentsSection").style.display = "none";
});

// --- EARNINGS ---
function renderEarnings() {
  if (!isAdmin) return;
  let total = 0;
  patients.forEach(p => total += Number(p.fee || 0));
  appointments.forEach(a => total += Number(a.fee || 0));
  document.getElementById("earningsContent").innerHTML =
    `<p><strong>Total Earnings:</strong> ${total} PKR</p>`;
}

document.getElementById("closeEarningsBtn").addEventListener("click", () => {
  document.getElementById("earningsSection").style.display = "none";
});

// --- INITIAL RENDER ---
function renderAll() {
  renderPatients();
  renderDoctors();
  renderAppointments();
  if (isAdmin) renderEarnings();
}
