const API_URL = 'https://green-marbles-backend.onrender.com/api'; 

// Toast Helper
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.className = 'toast', 3000);
}

// Logout
function logout() {
  localStorage.clear();
  window.location.href = 'login.html';
}

// Auth Check for Dashboard/Exam
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return null;
  }
  return token;
}
