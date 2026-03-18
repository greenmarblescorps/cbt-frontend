// CONFIGURATION
// CHANGE THIS URL TO YOUR RENDER BACKEND URL BEFORE DEPLOYING
const API_URL = 'http://localhost:5000/api'; 

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