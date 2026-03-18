const token = checkAuth();
const subject = localStorage.getItem('currentSubject');
let questions = [];
let currentIndex = 0;
let answers = {}; 
let timerInterval;

document.getElementById('examSubjectTitle').textContent = subject;

async function fetchQuestions() {
  const res = await fetch(`${API_URL}/exam/questions/${subject}`, {
    headers: { 'x-auth-token': token }
  });
  questions = await res.json();
  if (questions.length === 0) {
    showToast('No questions found', 'error');
    setTimeout(() => window.location.href = 'dashboard.html', 2000);
    return;
  }
  document.getElementById('qTotal').textContent = questions.length;
  startTimer();
  renderQuestion();
}
fetchQuestions();

function renderQuestion() {
  const q = questions[currentIndex];
  document.getElementById('qNum').textContent = currentIndex + 1;
  document.getElementById('questionText').textContent = q.question;
  
  const container = document.getElementById('optionsContainer');
  container.innerHTML = '';
  
  let shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);

  shuffledOptions.forEach(opt => {
    const label = document.createElement('label');
    label.style.background = answers[q._id] === opt ? '#e8f6f3' : 'white';
    label.style.border = answers[q._id] === opt ? '2px solid #2ecc71' : '1px solid #ddd';
    label.style.padding = '10px';
    label.style.borderRadius = '5px';
    label.innerHTML = `
      <input type="radio" name="option" value="${opt}" 
        onchange="selectAnswer('${q._id}', '${opt}')"
        ${answers[q._id] === opt ? 'checked' : ''}> 
      ${opt}
    `;
    container.appendChild(label);
  });

  document.getElementById('prevBtn').style.display = currentIndex === 0 ? 'none' : 'block';
  if (currentIndex === questions.length - 1) {
    document.getElementById('nextBtn').style.display = 'none';
    document.getElementById('submitBtn').style.display = 'block';
  } else {
    document.getElementById('nextBtn').style.display = 'block';
    document.getElementById('submitBtn').style.display = 'none';
  }
}

function selectAnswer(qId, opt) {
  answers[qId] = opt;
  renderQuestion();
}

function changeQuestion(dir) {
  currentIndex += dir;
  renderQuestion();
}

function startTimer() {
  let time = 1800; 
  timerInterval = setInterval(() => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    document.getElementById('timer').textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    
    if (time <= 0) {
      clearInterval(timerInterval);
      showToast('Time Up! Submitting...', 'error');
      submitExam();
    }
    time--;
  }, 1000);
}

async function submitExam() {
  clearInterval(timerInterval);
  
  if (Object.keys(answers).length < questions.length) {
    if (!confirm('You have unanswered questions. Submit anyway?')) return;
  }

  const formattedAnswers = Object.entries(answers).map(([questionId, selectedOption]) => ({
    questionId, selectedOption
  }));

  try {
    const res = await fetch(`${API_URL}/exam/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
      body: JSON.stringify({ subject, answers: formattedAnswers })
    });
    const data = await res.json();
    showToast(`Submitted! Score: ${data.score}/${data.total}`, 'success');
    setTimeout(() => window.location.href = 'dashboard.html', 2000);
  } catch (err) {
    showToast('Submission failed', 'error');
  }
}