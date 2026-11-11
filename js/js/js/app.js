// ========================================
// KORA LIVE — App Logic
// ========================================

// عناصر DOM
const loginScreen = document.getElementById('loginScreen');
const appEl = document.getElementById('app');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const userBadge = document.getElementById('userBadge');
const logoutBtn = document.getElementById('logoutBtn');

// تهيئة عند التحميل
document.addEventListener('DOMContentLoaded', () => {
  const session = checkSession();
  if (session) {
    showApp(session);
  } else {
    showLogin();
  }
});

// عرض شاشة الدخول
function showLogin() {
  loginScreen.classList.remove('hidden');
  appEl.classList.add('hidden');
}

// عرض التطبيق
function showApp(session) {
  loginScreen.classList.add('hidden');
  appEl.classList.remove('hidden');
  userBadge.textContent = session.role;
  renderAll();
}

// نموذج الدخول
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;
  const result = login(user, pass);

  if (result.success) {
    loginError.textContent = '';
    showApp(result.session);
  } else {
    loginError.textContent = result.message;
    // اهتزاز بسيط
    loginForm.animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-8px)' },
       { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }],
      { duration: 300 }
    );
  }
});

logoutBtn.addEventListener('click', logout);

// ========================================
// Render Functions
// ========================================

function renderAll() {
  renderLiveTicker();
  renderTodayMatches();
  renderNews();
  renderLeagues();
}

function renderLiveTicker() {
  const el = document.getElementById('liveTicker');
  el.innerHTML = LIVE_MATCHES.map(m => `
    <div class="ticker-item">
      <strong>${m.minute}</strong>
      <span>${m.home} ${m.score} ${m.away}</span>
    </div>
  `).join('');
}

function renderTodayMatches() {
  const el = document.getElementById('todayMatches');
  el.innerHTML = TODAY_MATCHES.map(m => `
    <div class="match-card">
      <div class="league">${m.flag} ${m.league}</div>
      <div class="teams">
        <div class="team"><span class="team-flag">⚽</span>${m.home}</div>
        <div class="score">${m.score}</div>
        <div class="team"><span class="team-flag">⚽</span>${m.away}</div>
      </div>
      <div class="time">${m.time}</div>
    </div>
  `).join('');
}

function renderNews() {
  const el = document.getElementById('newsGrid');
  el.innerHTML = NEWS.map(n => `
    <div class="news-card">
      <span class="tag">${n.tag}</span>
      <h3>${n.title}</h3>
      <p>${n.desc}</p>
    </div>
  `).join('');
}

function renderLeagues() {
  const el = document.getElementById('leaguesRow');
  el.innerHTML = LEAGUES.map(l => `
    <div class="league-chip">
      <div class="flag">${l.flag}</div>
      <div class="name">${l.name}</div>
    </div>
  `).join('');
}
