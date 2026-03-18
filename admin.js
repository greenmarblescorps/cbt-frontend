let adminToken = '';

async function adminLogin(e) {
  e.preventDefault();
  const pass = document.getElementById('adminPass').value;
  
  const res = await fetch(API_URL + '/auth/admin-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: pass })
  });
  const data = await res.json();
  
  if (res.ok) {
    adminToken = data.token;
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDash').style.display = 'block';
    loadStudents();
    loadQuestions();
  } else {
    showToast(data.msg, 'error');
  }
}

function adminLogout() {
  adminToken = '';
  location.reload();
}

function showSection(id) {
  document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
  document.getElementById(id + 'Section').style.display = 'block';
}

async function loadStudents() {
  const res = await fetch(API_URL + '/admin/students', {
    headers: { 'x-auth-token': adminToken }
  });
  const students = await res.json();
  const tbody = document.getElementById('studentsTable');
  tbody.innerHTML = '';
  students.forEach(s => {
    tbody.innerHTML += `
      <tr>
        <td>${s.fullName}</td>
        <td>${s.department}</td>
        <td>${s.examId}</td>
        <td><button onclick="deleteStudent('${s._id}')" style="background:#e74c3c;width:auto;padding:5px 10px;">Delete</button></td>
      </tr>
    `;
  });
}

async function deleteStudent(id) {
  if(confirm('Delete this student?')) {
    await fetch(`${API_URL}/admin/students/${id}`, {
      method: 'DELETE',
      headers: { 'x-auth-token': adminToken }
    });
    loadStudents();
  }
}

async function loadQuestions() {
  const res = await fetch(API_URL + '/admin/questions', {
    headers: { 'x-auth-token': adminToken }
  });
  const questions = await res.json();
  const tbody = document.getElementById('questionsTable');
  tbody.innerHTML = '';
  questions.forEach(q => {
    tbody.innerHTML += `
      <tr>
        <td>${q.subject}</td>
        <td>${q.question.substring(0, 30)}...</td>
        <td>
          <button onclick="editQuestion('${q._id}')" style="background:#f1c40f;width:auto;padding:5px 10px;">Edit</button>
          <button onclick="deleteQuestion('${q._id}')" style="background:#e74c3c;width:auto;padding:5px 10px;">Del</button>
        </td>
      </tr>
    `;
  });
}

async function deleteQuestion(id) {
  await fetch(`${API_URL}/admin/questions/${id}`, {
    method: 'DELETE',
    headers: { 'x-auth-token': adminToken }
  });
  loadQuestions();
}

function openModal() {
  document.getElementById('modal').style.display = 'flex';
  document.getElementById('modalTitle').textContent = 'Add Question';
  document.getElementById('qId').value = '';
  document.getElementById('qDept').value = 'Science';
  document.getElementById('qSubject').value = '';
  document.getElementById('qText').value = '';
  document.getElementById('qOptions').value = '';
  document.getElementById('qAnswer').value = '';
}

async function editQuestion(id) {
  openModal();
  document.getElementById('modalTitle').textContent = 'Edit Question';
  const res = await fetch(`${API_URL}/admin/questions`, {
    headers: { 'x-auth-token': adminToken }
  });
  const questions = await res.json();
  const q = questions.find(x => x._id === id);
  
  document.getElementById('qId').value = q._id;
  document.getElementById('qDept').value = q.department;
  document.getElementById('qSubject').value = q.subject;
  document.getElementById('qText').value = q.question;
  document.getElementById('qOptions').value = q.options.join(',');
  document.getElementById('qAnswer').value = q.answer;
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

async function saveQuestion(e) {
  e.preventDefault();
  const id = document.getElementById('qId').value;
  const data = {
    department: document.getElementById('qDept').value,
    subject: document.getElementById('qSubject').value,
    question: document.getElementById('qText').value,
    options: document.getElementById('qOptions').value.split(',').map(s => s.trim()),
    answer: document.getElementById('qAnswer').value
  };

  const url = id ? `${API_URL}/admin/questions/${id}` : `${API_URL}/admin/questions`;
  const method = id ? 'PUT' : 'POST';

  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-auth-token': adminToken },
    body: JSON.stringify(data)
  });

  closeModal();
  loadQuestions();
}