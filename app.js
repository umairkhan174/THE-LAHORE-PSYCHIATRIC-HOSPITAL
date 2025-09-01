// Simple login credentials (hardcoded)
const USERNAME = "admin";
const PASSWORD = "password123";

const loginSection = document.getElementById('loginSection');
const appSection = document.getElementById('appSection');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');

const patientForm = document.getElementById('patientForm');
const viewRecordsBtn = document.getElementById('viewRecordsBtn');
const exportBtn = document.getElementById('exportBtn');

const recordsSection = document.getElementById('recordsSection');
const closeRecordsBtn = document.getElementById('closeRecordsBtn');
const patientTableBody = document.querySelector('#patientTable tbody');
const searchInput = document.getElementById('searchInput');

let patients = JSON.parse(localStorage.getItem('patients')) || [];
let editingPatientId = null;

// LOGIN
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = loginForm.username.value.trim();
  const password = loginForm.password.value.trim();
  if (username === USERNAME && password === PASSWORD) {
    loginSection.style.display = 'none';
    appSection.style.display = 'block';
    renderTable();
  } else {
    alert("Invalid username or password");
  }
});

logoutBtn.addEventListener('click', () => {
  appSection.style.display = 'none';
  loginSection.style.display = 'block';
  patientForm.reset();
  recordsSection.style.display = 'none';
  editingPatientId = null;
  searchInput.value = '';
});

// PATIENT REGISTRATION & EDITING
function generatePatientID() {
  const idNum = patients.length > 0 ? Math.max(...patients.map(p => parseInt(p.id.slice(1)))) + 1 : 1;
  return 'P' + String(idNum).padStart(4, '0');
}

patientForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = patientForm.name.value.trim();
  const age = patientForm.age.value.trim();
  const gender = patientForm.gender.value;
  const disease = patientForm.disease.value.trim();

  if (editingPatientId) {
    // Editing existing
    const index = patients.findIndex(p => p.id === editingPatientId);
    if (index !== -1) {
      patients[index].name = name;
      patients[index].age = age;
      patients[index].gender = gender;
      patients[index].disease = disease;
      alert("Patient record updated.");
    }
    editingPatientId = null;
  } else {
    // New patient
    const patient = {
      id: generatePatientID(),
      name,
      age,
      gender,
      disease
    };
    patients.push(patient);
    alert("Patient registered successfully!");
  }

  localStorage.setItem('patients', JSON.stringify(patients));
  patientForm.reset();
  renderTable();
  if (recordsSection.style.display === 'none') {
    recordsSection.style.display = 'block';
  }
});

// RENDER TABLE
function renderTable() {
  patientTableBody.innerHTML = '';
  patients.forEach(patient => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${patient.id}</td>
      <td>${patient.name}</td>
      <td>${patient.age}</td>
      <td>${patient.gender}</td>
      <td>${patient.disease}</td>
      <td>
        <button class="action-btn edit-btn" onclick="editPatient('${patient.id}')">Edit</button>
        <button class="action-btn delete-btn" onclick="deletePatient('${patient.id}')">Delete</button>
      </td>
    `;

    patientTableBody.appendChild(row);
  });
  filterTable();
}

// EDIT PATIENT
window.editPatient = function(id) {
  const patient = patients.find(p => p.id === id);
  if (!patient) return;
  editingPatientId = id;
  patientForm.name.value = patient.name;
  patientForm.age.value = patient.age;
  patientForm.gender.value = patient.gender;
  patientForm.disease.value = patient.disease;
  recordsSection.style.display = 'none';
};

// DELETE PATIENT
window.deletePatient = function(id) {
  if (!confirm("Are you sure you want to delete this patient?")) return;
  patients = patients.filter(p => p.id !== id);
  localStorage.setItem('patients', JSON.stringify(patients));
  renderTable();
};

// VIEW RECORDS
viewRecordsBtn.addEventListener('click', () => {
  recordsSection.style.display = 'block';
  renderTable();
});

// CLOSE RECORDS
closeRecordsBtn.addEventListener('click', () => {
  recordsSection.style.display = 'none';
  searchInput.value = '';
  filterTable();
});

// SEARCH FUNCTION
searchInput.addEventListener('input', filterTable);

function filterTable() {
  const filter = searchInput.value.toUpperCase();
  const rows = patientTableBody.getElementsByTagName('tr');

  for (let i = 0; i < rows.length; i++) {
    const td = rows[i].getElementsByTagName('td')[0]; // ID column
    if (td) {
      const txtValue = td.textContent || td.innerText;
      rows[i].style.display = txtValue.toUpperCase().indexOf(filter) > -1 ? "" : "none";
    }
  }
}

// EXPORT CSV
exportBtn.addEventListener('click', () => {
  if (patients.length === 0) {
    alert("No patient records to export.");
    return;
  }
  const csvRows = [
    ['ID', 'Name', 'Age', 'Gender', 'Disease'],
    ...patients.map(p => [p.id, p.name, p.age, p.gender, p.disease])
  ];

  const csvContent = csvRows.map(e => e.join(",")).join("\n");

  const blob = new Blob([csvContent], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'patient_records.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});
