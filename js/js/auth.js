import { auth, db } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// عناصر DOM
const authScreen = document.getElementById('authScreen');
const appEl = document.getElementById('app');
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');
const userNameEl = document.getElementById('userName');
const userEmailEl = document.getElementById('userEmail');
const adminBtn = document.getElementById('adminBtn');
const logoutBtn = document.getElementById('logoutBtn');

// تبديل التبويبات
tabLogin.addEventListener('click', () => {
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  loginForm.classList.remove('hidden');
  registerForm.classList.add('hidden');
});
tabRegister.addEventListener('click', () => {
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  registerForm.classList.remove('hidden');
  loginForm.classList.add('hidden');
});

// إنشاء حساب جديد
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  registerError.textContent = '';
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // تحديث الاسم في Auth
    await updateProfile(user, { displayName: name });

    // حفظ بيانات المستخدم في Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name: name,
      email: email,
      role: 'user',
      createdAt: serverTimestamp()
    });

    console.log('Account created:', user.uid);
  } catch (error) {
    let msg = 'حدث خطأ أثناء إنشاء الحساب';
    if (error.code === 'auth/email-already-in-use') msg = 'البريد الإلكتروني مستخدم بالفعل';
    if (error.code === 'auth/weak-password') msg = 'كلمة المرور ضعيفة (6 أحرف على الأقل)';
    registerError.textContent = msg;
  }
});

// تسجيل الدخول
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    let msg = 'بيانات الدخول غير صحيحة';
    if (error.code === 'auth/user-not-found') msg = 'لا يوجد حساب بهذا البريد';
    if (error.code === 'auth/wrong-password') msg = 'كلمة المرور غير صحيحة';
    loginError.textContent = msg;
  }
});

// تسجيل الخروج
logoutBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  await signOut(auth);
});

// مراقبة حالة المصادقة
onAuthStateChanged(auth, async (user) => {
  if (user) {
    authScreen.classList.add('hidden');
    appEl.classList.remove('hidden');

    // جلب بيانات المستخدم من Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.exists() ? userDoc.data() : { name: user.displayName || 'مستخدم', role: 'user' };

    userNameEl.textContent = userData.name;
    userEmailEl.textContent = user.email;

    // إظهار لوحة التحكم للمشرف فقط
    if (userData.role === 'admin') {
      adminBtn.classList.remove('hidden');
    } else {
      adminBtn.classList.add('hidden');
    }

    // إطلاق حدث لبقية التطبيق
    window.dispatchEvent(new CustomEvent('auth-ready', { detail: { user, userData } }));
  } else {
    authScreen.classList.remove('hidden');
    appEl.classList.add('hidden');
    adminBtn.classList.add('hidden');
  }
});
