import { db, auth } from './firebase-config.js';
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const adminBtn = document.getElementById('adminBtn');
const adminModal = document.getElementById('adminModal');
const closeAdmin = document.getElementById('closeAdmin');
const streamForm = document.getElementById('streamForm');
const adminMsg = document.getElementById('adminMsg');

// فتح لوحة التحكم
adminBtn.addEventListener('click', () => {
  adminModal.classList.remove('hidden');
});

closeAdmin.addEventListener('click', () => {
  adminModal.classList.add('hidden');
  adminMsg.textContent = '';
});

adminModal.addEventListener('click', (e) => {
  if (e.target === adminModal) {
    adminModal.classList.add('hidden');
    adminMsg.textContent = '';
  }
});

// نشر بث مباشر جديد
streamForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  adminMsg.textContent = '';
  adminMsg.className = 'success-msg';

  const title = document.getElementById('streamTitle').value.trim();
  const url = document.getElementById('streamUrl').value.trim();
  const league = document.getElementById('streamLeague').value.trim();

  // تقسيم العنوان إلى فريقين (مثال: "ريال مدريد vs برشلونة")
  const parts = title.split(/vs|VS|ضد/).map(s => s.trim());
  const home = parts[0] || 'الفريق الأول';
  const away = parts[1] || 'الفريق الثاني';

  try {
    await addDoc(collection(db, 'matches'), {
      league: league,
      home: home,
      away: away,
      homeLogo: '⚽',
      awayLogo: '⚽',
      homeScore: 0,
      awayScore: 0,
      status: 'live',
      minute: "1'",
      streamUrl: url,
      createdBy: auth.currentUser.uid,
      createdAt: serverTimestamp()
    });

    adminMsg.textContent = '✅ تم نشر البث بنجاح!';
    streamForm.reset();

    // إغلاق المودال بعد ثانيتين
    setTimeout(() => {
      adminModal.classList.add('hidden');
      adminMsg.textContent = '';
    }, 2000);

  } catch (error) {
    console.error('Error publishing stream:', error);
    adminMsg.className = 'error-msg';
    adminMsg.textContent = '❌ حدث خطأ أثناء النشر. تأكد من الصلاحيات.';
  }
});
