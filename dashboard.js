const token = checkAuth();
const student = JSON.parse(localStorage.getItem('student'));

if (student) {
  document.getElementById('nameDisplay').textContent = student.fullName;
  document.getElementById('deptDisplay').textContent = student.department;
  document.getElementById('examIdDisplay').textContent = student.examId;
}

async function loadSubjects() {
  const res = await fetch(API_URL + '/exam/subjects', {
    headers: { 'x-auth-token': token }
  });
  const subjects = await res.json();
  const select = document.getElementById('subjectSelect');
  subjects.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s;
    select.appendChild(opt);
  });
}
loadSubjects();

function startExam() {
  const subject = document.getElementById('subjectSelect').value;
  if (!subject) return showToast('Select a subject', 'error');
  localStorage.setItem('currentSubject', subject);
  window.location.href = 'exam.html';
}

async function loadResults() {
  const res = await fetch(API_URL + '/exam/results', {
    headers: { 'x-auth-token': token }
  });
  const results = await res.json();
  const tbody = document.getElementById('resultsBody');
  tbody.innerHTML = '';
  
  results.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.subject}</td>
      <td>${r.score}/${r.total}</td>
      <td>${new Date(r.dateTaken).toLocaleDateString()}</td>
      <td><button onclick="printResult('${r.subject}', ${r.score}, ${r.total})">Print</button></td>
    `;
    tbody.appendChild(tr);
  });
  document.getElementById('resultsArea').style.display = 'block';
}

function downloadSlip() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  doc.setFontSize(22);
  doc.setTextColor(39, 174, 96);
  doc.text("Green Marbles CBT", 105, 20, null, null, "center");
  
  doc.setFontSize(16);
  doc.setTextColor(0,0,0);
  doc.text("Exam Registration Slip", 105, 35, null, null, "center");
  
  doc.setFontSize(12);
  doc.text(`Name: ${student.fullName}`, 20, 60);
  doc.text(`Department: ${student.department}`, 20, 70);
  doc.text(`Exam ID: ${student.examId}`, 20, 80);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 90);
  
  doc.save('registration-slip.pdf');
}

function printResult(subject, score, total) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Green Marbles CBT Result", 20, 20);
  doc.text(`Subject: ${subject}`, 20, 40);
  doc.text(`Score: ${score}/${total}`, 20, 50);
  doc.text(`Percentage: ${Math.round((score/total)*100)}%`, 20, 60);
  doc.save('result.pdf');
}