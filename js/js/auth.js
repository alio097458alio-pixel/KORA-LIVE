// ========================================
// نظام مصادقة KORA LIVE
// Admin فقط — سوورد 01152800730
// ========================================

const AUTH_CONFIG = {
  admin: {
    username: 'admin',
    password: '01152800730'
  },
  sessionKey: 'kora_live_session'
};

// تشفير بسيط (Base64) للجلسة
function encodeSession(data) {
  return btoa(JSON.stringify(data));
}
function decodeSession(str) {
  try { return JSON.parse(atob(str)); } catch { return null; }
}

// محاولة تسجيل الدخول
function login(username, password) {
  const user = username.trim().toLowerCase();
  const pass = password.trim();

  if (user === AUTH_CONFIG.admin.username && pass === AUTH_CONFIG.admin.password) {
    const session = {
      user: 'admin',
      role: 'ADMIN',
      loginAt: Date.now()
    };
    localStorage.setItem(AUTH_CONFIG.sessionKey, encodeSession(session));
    return { success: true, session };
  }
  return { success: false, message: 'بيانات الدخول غير صحيحة' };
}

// التحقق من الجلسة
function checkSession() {
  const raw = localStorage.getItem(AUTH_CONFIG.sessionKey);
  if (!raw) return null;
  const session = decodeSession(raw);
  if (!session || session.role !== 'ADMIN') return null;
  return session;
}

// تسجيل الخروج
function logout() {
  localStorage.removeItem(AUTH_CONFIG.sessionKey);
  location.reload();
}
