import { db } from './firebase-config.js';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// عناصر DOM
const liveMatchesEl = document.getElementById('liveMatches');
const allMatchesEl = document.getElementById('allMatches');
const offlineBanner = document.getElementById('offlineBanner');
const streamModal = document.getElementById('streamModal');
const streamIframe = document.getElementById('streamIframe');
const streamModalTitle = document.getElementById('streamModalTitle');
const closeStream = document.getElementById('closeStream');
const profileBtn = document.getElementById('profileBtn');
const profileDropdown = document.getElementById('profileDropdown');

// ========================================
// ✅ معالجة انقطاع الإنترنت
// ========================================
window.addEventListener('online', () => {
  offlineBanner.classList.add('hidden');
  console.log('✅ Online — syncing data');
  // إعادة تحميل البيانات تلقائياً
  loadMatches();
});

window.addEventListener('offline', () => {
  offlineBanner.classList.remove('hidden');
  console.log('⚠️ Offline — using cached data');
});

// التحقق الأولي
if (!navigator.onLine) {
  offlineBanner.classList.remove('hidden');
}

// ========================================
// تحميل المباريات من Firestore (مع دعم Offline Cache)
// ========================================
let unsubscribeMatches = null;

function loadMatches() {
  if (unsubscribeMatches) unsubscribeMatches();

  const q = query(collection(db, 'matches'), orderBy('createdAt', 'desc'), limit(20));

  unsubscribeMatches = onSnapshot(q, (snapshot) => {
    const matches = [];
    snapshot.forEach((doc) => {
      matches.push({ id: doc.id, ...doc.data() });
    });

    const live = matches.filter(m => m.status === 'live');
    const all = matches;

    renderMatches(liveMatchesEl, live, true);
    renderMatches(allMatchesEl, all, false);
  }, (error) => {
    console.error('Firestore snapshot error:', error);
    // عند فشل الاتصال، نعرض بيانات من الكاش إن وجدت
    if (!navigator.onLine) {
      offlineBanner.classList.remove('hidden');
    }
  });
}

// ========================================
// عرض بطاقات المباريات (مثل الصورة)
// ========================================
function renderMatches(container, matches, isLive) {
  if (matches.length === 0) {
    container.innerHTML = `<p class="empty-msg">لا توجد مباريات ${isLive ? 'مباشرة' : ''} حالياً</p>`;
    return;
  }

  container.innerHTML = matches.map(m => {
    const scoreClass = m.status === 'live' ? 'match-score live' : 'match-score';
    const meta = m.status === 'live'
      ? `<div class="match-meta"><span class="live-time">${m.minute || "0'"}</span> — مباشر</div>`
      : `<div class="match-meta">${m.time || 'انتهت'}</div>`;

    // زر مشاهدة البث إن وُجد
    const streamBtn = m.streamUrl
      ? `<button class="btn-stream" data-stream="${m.streamUrl}" data-title="${m.home} vs ${m.away}">📺 مشاهدة</button>`
      : '';

    return `
      <div class="match-card">
        <div class="match-league">🏆 ${m.league}</div>
        <div class="match-teams">
          <div class="team">
            <div class="team-logo">${m.homeLogo || '⚽'}</div>
            <div class="team-name">${m.home}</div>
          </div>
          <div class="${scoreClass}">${m.homeScore} - ${m.awayScore}</div>
          <div class="team">
            <div class="team-logo">${m.awayLogo || '⚽'}</div>
            <div class="team-name">${m.away}</div>
          </div>
        </div>
        ${meta}
        ${streamBtn}
      </div>
    `;
  }).join('');

  // ربط أزرار البث
  container.querySelectorAll('.btn-stream').forEach(btn => {
    btn.addEventListener('click', () => {
      openStream(btn.dataset.stream, btn.dataset.title);
    });
  });
}

// ========================================
// فتح مشغل البث (Iframe)
// ========================================
function openStream(url, title) {
  streamModalTitle.textContent = title || 'بث مباشر';
  streamIframe.src = url;
  streamModal.classList.remove('hidden');
}

closeStream.addEventListener('click', () => {
  streamModal.classList.add('hidden');
  streamIframe.src = ''; // إيقاف البث
});

// إغلاق المودال عند النقر خارج المحتوى
streamModal.addEventListener('click', (e) => {
  if (e.target === streamModal) {
    streamModal.classList.add('hidden');
    streamIframe.src = '';
  }
});

// ========================================
// الملف الشخصي (Dropdown)
// ========================================
profileBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  profileDropdown.classList.toggle('hidden');
});

document.addEventListener('click', () => {
  profileDropdown.classList.add('hidden');
});

// ========================================
// بدء التطبيق بعد المصادقة
// ========================================
window.addEventListener('auth-ready', () => {
  loadMatches();
});
