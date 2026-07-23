let initializeApp;
let getFirestore;
let collection;
let addDoc;
let deleteDoc;
let doc;
let getDocs;
let query;
let updateDoc;
let where;
let serverTimestamp;
let setDoc;
let getAuth;
let signInAnonymously;
let getDoc;

const firebaseConfig = {
  apiKey: "AIzaSyDEf4NV_vg8GYX0IhvdNouT4PR2orhD3So",
  authDomain: "mallem-6b76d.firebaseapp.com",
  projectId: "mallem-6b76d",
  storageBucket: "mallem-6b76d.firebasestorage.app",
  messagingSenderId: "13653837388",
  appId: "1:13653837388:web:ad0cb8ef7e64b5140696e9",
  measurementId: "G-3G72T2Z3Y4"
};


const USERS_COLLECTION = "users";
const BLACKLIST_COLLECTION = "blacklist";
const ADMIN_COLLECTION = "Admin";
const ADMIN_DOC_ID = "admin_credentials";

let db = null;
let auth = null;
let firebaseReady = false;
let firebaseLoading = null;

const state = {
  authed: isAdminSessionValid(),
  view: "dashboard",
  users: [],
  blacklist: [],
  search: "",
  modalUser: null,
  busy: false,
  needsSetup: false,
  setupNew: false
};

const app = document.querySelector("#admin-app");
const toastEl = document.querySelector("#toast");

document.addEventListener("click", (event) => {
  const action = event.target.closest("[data-action]");
  if (!action) return;
  const id = action.dataset.id;
  const value = action.dataset.value;
  const actions = {
    login: () => login(),
    logout: () => logout(),
    view: () => { state.view = action.dataset.value; render(); },
    refresh: () => loadData(),
    approve: () => setVerification(id, true),
    reject: () => setVerification(id, false),
    revoke: () => setVerification(id, false),
    remove: () => removeUser(id),
    restore: () => restoreUser(id),
    showUser: () => showUserModal(id),
    closeModal: () => { state.modalUser = null; render(); },
    closeRatingModal: () => document.getElementById("rating-modal")?.remove(),
    rateUser: () => rateUser(id),
    setRating: () => setRating(id, value),
    toggleSidebar: () => document.getElementById("admin-sidebar")?.classList.toggle("open"),
    setPhoto: () => { const input = document.querySelector(`.photo-url-input[data-id="${id}"]`); const url = input?.value?.trim(); if (url) setPhoto(id, url); },
    removePhoto: () => setPhoto(id, ""),
    addWorkPhoto: () => { const input = document.querySelector(`.workphoto-input[data-id="${id}"]`); const url = input?.value?.trim(); if (url) { addWorkPhoto(id, url); input.value = ""; } },
    removeWorkPhoto: () => removeWorkPhoto(id, parseInt(value, 10)),
    saveSettings: () => saveSettings(),
    setupAdmin: () => setupAdmin(),
    bootstrap: () => bootstrap(),
  };
  const result = actions[action.dataset.action]?.();
  if (result?.catch) result.catch(error => showError("فشلت العملية.", error));
});

document.addEventListener("input", (event) => {
  if (event.target.name === "search") {
    state.search = event.target.value;
    render();
  }
});

document.addEventListener("submit", (event) => event.preventDefault());

init();

async function init() {
  render();
  if (await initFirebase()) {
    await ensureAdminDoc();
    if (state.authed) await loadData();
  }
}

async function ensureAdminDoc() {
  try {
    const snap = await getDoc(doc(db, ADMIN_COLLECTION, ADMIN_DOC_ID));
    if (!snap.exists()) {
      state.needsSetup = true;
      render();
    }
  } catch (error) {
    console.warn("تعذر التحقق من مستند المدير في Firebase.", error);
  }
}

async function initFirebase() {
  if (firebaseReady) return true;
  if (firebaseLoading) return firebaseLoading;
  firebaseLoading = (async () => {
    try {
      const [appModule, firestoreModule, authModule] = await Promise.all([
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"),
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js")
      ]);
      ({ initializeApp } = appModule);
      ({ getFirestore, collection, addDoc, deleteDoc, doc, getDocs, getDoc, query, updateDoc, where, serverTimestamp, setDoc } = firestoreModule);
      ({ getAuth, signInAnonymously } = authModule);
      const firebaseApp = initializeApp(firebaseConfig);
      db = getFirestore(firebaseApp);
      auth = getAuth(firebaseApp);
      if (!auth.currentUser) {
        await signInAnonymously(auth).catch((error) => {
          console.warn("Anonymous Firebase Auth is not available; Firestore rules must allow admin reads/writes from this app or they will be rejected.", error);
        });
      }
      firebaseReady = true;
      return true;
    } catch (error) {
      firebaseLoading = null;
      return showError("تعذر الاتصال بـ Firebase.", error);
    }
  })();
  return firebaseLoading;
}

async function loadData() {
  if (!(await initFirebase())) return false;
  try {
    const [usersSnapshot, blacklistSnapshot] = await Promise.all([
      getDocs(collection(db, USERS_COLLECTION)),
      getDocs(collection(db, BLACKLIST_COLLECTION))
    ]);
    state.users = usersSnapshot.docs
      .map(item => normalizeUser({ ...item.data(), docId: item.id, id: item.data().id || item.id }))
      .filter(user => user.role === "pro");
    state.blacklist = blacklistSnapshot.docs
      .map(item => ({ ...item.data(), docId: item.id, id: item.data().id || item.id }));
    render();
    return true;
  } catch (error) {
    return showError("تعذرت قراءة بيانات الإدارة من Firebase.", error);
  }
}

function render() {
  const el = document.getElementById("modal");
  if (el) el.remove();
  const rm = document.getElementById("rating-modal");
  if (rm) rm.remove();
  app.innerHTML = state.authed ? adminShell() : loginScreen();
  if (state.modalUser) renderModal();
}

function loginScreen() {
  if (state.setupNew) {
    return `
      <main class="login">
        <form id="admin-setup" class="login-card">
          <img src="icon.png" alt="Mallem" class="logo" onerror="this.style.display='none'">
          <h1>إنشاء حساب المدير</h1>
          <p class="muted">تم التحقق من مفتاح التفعيل. قم بإنشاء حساب المدير الآن.</p>
          <div class="field"><label>اسم المستخدم الجديد</label><input name="username" autocomplete="username" required></div>
          <div class="field"><label>كلمة المرور الجديدة</label><input name="password" type="password" autocomplete="new-password" required></div>
          <div class="field"><label>تأكيد كلمة المرور</label><input name="confirm" type="password" required></div>
          <button class="btn primary" type="button" data-action="setupAdmin">حفظ</button>
          <a class="btn ghost" href="main.html">الرجوع للتطبيق</a>
        </form>
      </main>`;
  }
  if (state.needsSetup) {
    return `
      <main class="login">
        <form id="admin-bootstrap" class="login-card">
          <img src="icon.png" alt="Mallem" class="logo" onerror="this.style.display='none'">
          <h1>إعداد المدير لأول مرة</h1>
          <p class="muted">لم يتم العثور على حساب مدير في Firebase. أدخل مفتاح التفعيل لبدء الإعداد.</p>
          <div class="field"><label>مفتاح التفعيل</label><input name="bootstrapKey" type="password" autocomplete="off" required></div>
          <button class="btn primary" type="button" data-action="bootstrap">تفعيل</button>
          <a class="btn ghost" href="main.html">الرجوع للتطبيق</a>
        </form>
      </main>`;
  }
  return `
    <main class="login">
      <form id="admin-login" class="login-card">
        <img src="icon.png" alt="Mallem" class="logo" onerror="this.style.display='none'">
        <h1>دخول الإدارة</h1>
        <p class="muted">صفحة الإدارة محمية - أدخل اسم المستخدم وكلمة المرور.</p>
        <div class="field"><label>اسم المستخدم</label><input name="username" autocomplete="username" required></div>
        <div class="field"><label>كلمة المرور</label><input name="password" type="password" autocomplete="current-password" required></div>
        <button class="btn primary" type="button" data-action="login">دخول</button>
        <a class="btn ghost" href="main.html">الرجوع للتطبيق</a>
      </form>
    </main>`;
}

function adminShell() {
  return `
    <div class="admin-shell">
      <aside class="sidebar" id="admin-sidebar">
        <button class="hamburger" id="hamburger-btn" data-action="toggleSidebar">☰</button>
        <div class="brand"><img src="icon.png" alt=""><span>إدارة معلم</span></div>
        ${navButton("dashboard", "لوحة التحكم")}
        ${navButton("craftsmen", "جميع الحرفيين")}
        ${navButton("new", "جديد")}
        ${navButton("pending", "قيد المراجعة")}
        ${navButton("verified", "معتمدين")}
        ${navButton("photos", "صور الحرفيين")}
        ${navButton("workphotos", "صور الأعمال")}
        ${navButton("blacklist", "المحظورين")}
        ${navButton("settings", "تعديل كلمة المرور و إسم المستخدم")}
        <button class="nav-btn" data-action="refresh">تحديث البيانات</button>
        <button class="nav-btn" data-action="logout">خروج</button>
      </aside>
      <main class="content">
        <div class="topline">
          <div>
            <h1>${viewTitle()}</h1>
            <p class="muted">إدارة الحسابات، التحقق، الإعتماد، والحظر من Firebase مباشرة.</p>
          </div>
          <a class="btn ghost" href="main.html">فتح التطبيق</a>
        </div>
        ${content()}
      </main>
    </div>`;
}

function navButton(key, label) {
  return `<button class="nav-btn ${state.view === key ? "active" : ""}" data-action="view" data-value="${key}">${label}</button>`;
}

function viewTitle() {
  const titles = {
    dashboard: "لوحة التحكم",
    craftsmen: "جميع الحرفيين",
    new: "جديد",
    pending: "قيد المراجعة",
    verified: "معتمدين",
    blacklist: "المحظورين",
    photos: "صور الحرفيين",
    workphotos: "صور الأعمال",
    settings: "تعديل كلمة المرور و إسم المستخدم"
  };
  return titles[state.view] || "Dashboard";
}

function content() {
  if (state.view === "dashboard") return dashboard();
  if (state.view === "blacklist") return blacklistView();
  if (state.view === "photos") return photosView();
  if (state.view === "workphotos") return workPhotosView();
  if (state.view === "settings") return settingsView();
  return usersView(filteredUsersForView());
}

function dashboard() {
  const stats = getStats();
  return `
    <section class="grid stats">
      ${statCard("الحرفيون", stats.total)}
      ${statCard("قيد المراجعة", stats.pending)}
      ${statCard("معتمد", stats.verified)}
      ${statCard("معتمد", stats.accredited)}
      ${statCard("محظور", stats.blocked)}
    </section>
    <section class="panel">
      <h2>آخر الحسابات</h2>
      ${usersTable([...state.users].sort(sortNewest).slice(0, 8))}
    </section>`;
}

function statCard(label, value) {
  return `<article class="card stat"><span class="muted">${label}</span><strong>${value}</strong></article>`;
}

function usersView(users) {
  return `
    <section class="panel toolbar">
      <div class="field"><label>بحث</label><input name="search" value="${esc(state.search)}" placeholder="اسم، username، مدينة، حرفة"></div>
      <button class="btn ghost" data-action="refresh">تحديث</button>
    </section>
    <section class="panel">${usersTable(users)}</section>`;
}

function usersTable(users) {
  if (!users.length) return `<div class="empty">لا توجد حسابات في هذا القسم.</div>`;
  return `
    <table class="table">
      <thead>
        <tr>
          <th>الحرفي</th>
          <th>اسم المستخدم</th>
          <th>الحرفة</th>
          <th>المدينة</th>
          <th>الحالة</th>
          <th>إجراءات</th>
        </tr>
      </thead>
      <tbody>${users.map(userRow).join("")}</tbody>
    </table>`;
}

function userRow(user) {
  return `
    <tr>
      <td><strong><a href="#" data-action="showUser" data-id="${esc(user.docId)}" style="color:var(--primary);text-decoration:none">${esc(displayName(user))}</a></strong><br><span class="muted">${esc(user.phone || "")}</span></td>
      <td>${esc(user.username || "")}</td>
      <td>${esc(user.job || "")}</td>
      <td>${esc(user.city || "")}</td>
      <td>${statusBadge(user)}</td>
      <td><div class="actions">${rowActions(user)}</div></td>
    </tr>`;
}

function rowActions(user) {
  const actions = [];
  actions.push(`<button class="btn ghost" data-action="showUser" data-id="${esc(user.docId)}">عرض</button>`);
  actions.push(`<button class="btn ghost" data-action="rateUser" data-id="${esc(user.docId)}">${user.rating ? "★".repeat(Number(user.rating)) + "☆".repeat(5 - Number(user.rating)) : "تقييم"}</button>`);
  if (user.verificationStatus === "pending") {
    actions.push(`<button class="btn green" data-action="approve" data-id="${esc(user.docId)}">توثيق</button>`);
    actions.push(`<button class="btn warn" data-action="reject" data-id="${esc(user.docId)}">رفض</button>`);
  }
  if (user.verified) {
    actions.push(`<button class="btn warn" data-action="revoke" data-id="${esc(user.docId)}">إلغاء التوثيق</button>`);
  }
  actions.push(`<button class="btn danger" data-action="remove" data-id="${esc(user.docId)}">حظر</button>`);
  return actions.join("");
}

function photosView() {
  const noPhotoUsers = state.users.filter(u => !u.photoURL);
  return `
    <section class="panel">
      <p class="muted" style="margin:0 0 14px">${noPhotoUsers.length} حرفي بدون صورة شخصية. أدخل رابط الصورة لكل حرفي ثم اضغط حفظ.</p>
    </section>
    <section class="photo-grid">${state.users.length ? state.users.map(photoCard).join("") : `<div class="empty">لا يوجد حرفيين.</div>`}</section>`;
}

function photoCard(user) {
  const name = displayName(user);
  return `
    <article class="card photo-card" data-id="${esc(user.docId)}">
      <div class="photo-card-head">
        <div class="avatar">${user.photoURL ? `<img src="${esc(user.photoURL)}" alt="">` : esc(name[0] || "م")}</div>
        <div class="photo-card-info">
          <strong>${esc(name)}</strong>
          <span class="muted">${esc(user.phone || "")} · ${esc(user.job || "")}</span>
        </div>
      </div>
      <div class="photo-card-body">
        <input type="text" class="photo-url-input" data-id="${esc(user.docId)}" value="${esc(user.photoURL || "")}" placeholder="https://example.com/photo.jpg">
        <button class="btn primary" data-action="setPhoto" data-id="${esc(user.docId)}">حفظ</button>
        ${user.photoURL ? `<button class="btn danger" data-action="removePhoto" data-id="${esc(user.docId)}">حذف</button>` : ""}
      </div>
    </article>`;
}

function workPhotosView() {
  const totalWith = state.users.filter(u => u.workPhotos?.length).length;
  const totalPhotos = state.users.reduce((s, u) => s + (u.workPhotos?.length || 0), 0);
  return `
    <section class="panel">
      <p class="muted" style="margin:0 0 14px">${totalWith} حرفي لديهم صور أعمال (إجمالي ${totalPhotos} صورة). أضف روابط صور الأعمال لكل حرفي.</p>
    </section>
    <section class="photo-grid">${state.users.length ? state.users.map(workPhotoCard).join("") : `<div class="empty">لا يوجد حرفيين.</div>`}</section>`;
}

function workPhotoCard(user) {
  const name = displayName(user);
  const photos = user.workPhotos || [];
  return `
    <article class="card photo-card" data-id="${esc(user.docId)}">
      <div class="photo-card-head">
        <div class="avatar">${user.photoURL ? `<img src="${esc(user.photoURL)}" alt="">` : esc(name[0] || "م")}</div>
        <div class="photo-card-info">
          <strong>${esc(name)}</strong>
          <span class="muted">${esc(user.phone || "")} · ${esc(user.job || "")}</span>
        </div>
      </div>
      <div class="workphoto-list">${photos.length ? photos.map((url, i) => `
        <div class="workphoto-item">
          <img src="${esc(url)}" alt="">
          <span class="workphoto-url">${esc(url)}</span>
          <button class="btn danger" data-action="removeWorkPhoto" data-id="${esc(user.docId)}" data-value="${i}">✕</button>
        </div>`).join("") : `<span class="muted" style="font-size:13px">لا توجد صور بعد.</span>`}
      </div>
      <div class="photo-card-body">
        <input type="text" class="workphoto-input" data-id="${esc(user.docId)}" placeholder="https://example.com/work.jpg">
        <button class="btn primary" data-action="addWorkPhoto" data-id="${esc(user.docId)}">إضافة</button>
      </div>
    </article>`;
}

function blacklistView() {
  if (!state.blacklist.length) return `<section class="panel"><div class="empty">قائمة الحظر فارغة.</div></section>`;
  return `
    <section class="panel">
      <table class="table">
        <thead>
          <tr><th>الاسم</th><th>السبب</th><th>التاريخ</th><th>إجراءات</th></tr>
        </thead>
        <tbody>${state.blacklist.map(item => `
          <tr>
            <td>${esc(item.fullName || item.username || "")}</td>
            <td>${esc(item.reason || "")}</td>
            <td>${esc(formatDate(item.blacklistedAt || item.createdAt))}</td>
            <td><button class="btn ghost" data-action="showUser" data-id="${esc(item.docId)}">عرض</button> <button class="btn green" data-action="restore" data-id="${esc(item.docId)}">إسترجاع</button></td>
          </tr>`).join("")}</tbody>
      </table>
    </section>`;
}

function settingsView() {
  return `
    <section class="panel" style="max-width:520px">
      <h2 style="margin:0 0 8px">تعديل بيانات الدخول</h2>
      <p class="muted" style="margin:0 0 20px">تحديث اسم المستخدم أو كلمة المرور الخاصة بلوحة الإدارة.</p>
      <form id="admin-settings-form">
        <div class="field"><label>اسم المستخدم الجديد</label><input name="newUsername" id="settings-username" required></div>
        <div class="field"><label>كلمة المرور الحالية</label><input name="currentPassword" type="password" required></div>
        <div class="field"><label>كلمة المرور الجديدة</label><input name="newPassword" type="password" required></div>
        <div class="field"><label>تأكيد كلمة المرور الجديدة</label><input name="confirmPassword" type="password" required></div>
        <button class="btn primary" type="button" data-action="saveSettings">حفظ التغييرات</button>
        <span id="settings-feedback" style="margin-right:12px;font-size:13px"></span>
      </form>
    </section>`;
}

function renderModal() {
  const existing = document.getElementById("modal");
  if (existing) existing.remove();
  const user = state.modalUser;
  if (!user) return;
  const div = document.createElement("div");
  div.className = "modal-overlay";
  div.id = "modal";
  div.innerHTML = `
    <div class="modal" role="dialog">
      <div class="modal-head">
        <div style="display:flex;align-items:center;gap:12px">
          <div class="avatar" style="width:48px;height:48px;font-size:20px">${user.photoURL ? `<img src="${esc(user.photoURL)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : esc(displayName(user)[0] || "م")}</div>
          <h2>${esc(displayName(user))}</h2>
        </div>
        <button class="btn ghost" data-action="closeModal">✕</button>
      </div>
      <div class="modal-body">
        <div class="field-group">
          <div class="field"><label>الإسم الكامل</label><span>${esc(user.fullName || "")}</span></div>
          <div class="field"><label>إسم المستخدم</label><span>${esc(user.username || "")}</span></div>
          <div class="field"><label>رقم الهاتف</label><span><a href="tel:${esc(user.phone)}">${esc(user.phone || "")}</a></span></div>
          <div class="field"><label>واتساب</label><span><a href="https://wa.me/${esc(user.whatsap || user.phone)}" target="_blank">${esc(user.whatsap || user.phone || "")}</a></span></div>
          <div class="field"><label>الحرفة</label><span>${esc(user.job || "")}</span></div>
          <div class="field"><label>المدينة</label><span>${esc(user.city || "")}</span></div>
          <div class="field"><label>العنوان</label><span>${esc(user.address || "")}</span></div>
          <div class="field"><label>الدبلوم</label><span>${user.hasDiploma ? "نعم" : "لا"}</span></div>
          <div class="field"><label>حالة التوثيق</label><span>${statusBadge(user)}</span></div>
          <div class="field"><label>التقييم</label><span>${esc(user.rating || "")}</span></div>
          <div class="field"><label>تاريخ التسجيل</label><span>${formatDate(user.createdAt)}</span></div>
          ${user.reason ? `<div class="field"><label>سبب الحظر</label><span style="color:var(--danger)">${esc(user.reason)}</span></div>` : ""}
          ${user.blacklistedAt ? `<div class="field"><label>تاريخ الحظر</label><span>${formatDate(user.blacklistedAt)}</span></div>` : ""}
          <div class="field"><label>الحالة</label><span>${esc(user.status || "active")}</span></div>
        </div>
      </div>
      <div class="modal-foot">
        <div class="actions">
          ${user.verificationStatus === "pending" ? `
            <button class="btn green" data-action="approve" data-id="${esc(user.docId)}">توثيق الحساب ✓</button>
            <button class="btn warn" data-action="reject" data-id="${esc(user.docId)}">رفض التوثيق ✕</button>
          ` : ""}
          ${!user.reason ? `<button class="btn danger" data-action="remove" data-id="${esc(user.docId)}">حظر وإضافة إلى القائمة السوداء</button>` : `<button class="btn green" data-action="restore" data-id="${esc(user.docId)}">إسترجاع الحساب</button>`}
        </div>
      </div>
    </div>`;
  document.body.appendChild(div);
  div.addEventListener("click", (e) => {
    if (e.target === div) { state.modalUser = null; render(); }
  });
}

function showUserModal(docId) {
  const user = state.users.find(item => item.docId === docId) || 
               state.blacklist.find(item => item.docId === docId);
  if (!user) return fail("الحساب غير موجود.");
  state.modalUser = user;
  render();
}

function rateUser(docId) {
  const user = state.users.find(item => item.docId === docId);
  if (!user) return fail("الحساب غير موجود.");
  const current = user.rating ? Number(user.rating) : 0;
  renderRatingModal(docId, current);
}

function renderRatingModal(docId, current) {
  const existing = document.getElementById("rating-modal");
  if (existing) existing.remove();
  const div = document.createElement("div");
  div.className = "modal-overlay";
  div.id = "rating-modal";
  div.innerHTML = `
    <div class="modal" role="dialog" style="text-align:center">
      <div class="modal-head"><h2>تقييم الحرفي</h2><button class="btn ghost" data-action="closeRatingModal">✕</button></div>
      <div class="modal-body" style="padding:24px 20px">
        <p style="margin:0 0 14px;color:var(--muted)">اختر عدد النجوم:</p>
        <div class="stars" style="font-size:42px;direction:ltr;cursor:pointer">${[1,2,3,4,5].map(n => `<span class="star" data-action="setRating" data-id="${esc(docId)}" data-value="${n}" style="${n <= current ? 'color:#f59e0b' : 'color:#d0d5dd'}">★</span>`).join(" ")}</div>
        <p style="margin:14px 0 0;color:var(--muted);font-size:13px" id="rating-label">${current > 0 ? `${"★".repeat(current)}${"☆".repeat(5 - current)}` : "لم يتم التقييم بعد"}</p>
      </div>
    </div>`;
  document.body.appendChild(div);
  div.addEventListener("click", (e) => {
    if (e.target === div) div.remove();
  });
}

async function setRating(docId, value) {
  if (state.busy) return;
  state.busy = true;
  const user = state.users.find(item => item.docId === docId);
  if (!user) { state.busy = false; return fail("الحساب غير موجود."); }
  try {
    const rating = Math.min(5, Math.max(1, parseInt(value, 10) || 0));
    await updateDoc(doc(db, USERS_COLLECTION, docId), { rating, updatedAt: serverTimestamp() });
    user.rating = rating;
    toast(`تم تقييم ${displayName(user)} بـ ${rating} ${"★".repeat(rating)}${"☆".repeat(5 - rating)}`);
    if (state.modalUser?.docId === docId) state.modalUser = { ...user };
    render();
    state.busy = false;
    return true;
  } catch (error) {
    state.busy = false;
    return showError("تعذر تحديث التقييم في Firebase.", error);
  }
}

async function setPhoto(docId, photoURL) {
  if (state.busy) return;
  state.busy = true;
  const user = state.users.find(item => item.docId === docId);
  if (!user) { state.busy = false; return fail("الحساب غير موجود."); }
  try {
    await updateDoc(doc(db, USERS_COLLECTION, docId), { photoURL, updatedAt: serverTimestamp() });
    user.photoURL = photoURL;
    toast(photoURL ? `تم حفظ صورة ${displayName(user)} بنجاح.` : `تم إزالة صورة ${displayName(user)}.`);
    render();
    state.busy = false;
    return true;
  } catch (error) {
    state.busy = false;
    return showError("تعذر حفظ الصورة في Firebase.", error);
  }
}

async function addWorkPhoto(docId, url) {
  if (state.busy) return;
  state.busy = true;
  const user = state.users.find(item => item.docId === docId);
  if (!user) { state.busy = false; return fail("الحساب غير موجود."); }
  try {
    const workPhotos = [...(user.workPhotos || []), url];
    await updateDoc(doc(db, USERS_COLLECTION, docId), { workPhotos, updatedAt: serverTimestamp() });
    user.workPhotos = workPhotos;
    toast(`تم إضافة صورة عمل لـ ${displayName(user)}.`);
    render();
    state.busy = false;
    return true;
  } catch (error) {
    state.busy = false;
    return showError("تعذر إضافة الصورة في Firebase.", error);
  }
}

async function removeWorkPhoto(docId, index) {
  if (state.busy) return;
  state.busy = true;
  const user = state.users.find(item => item.docId === docId);
  if (!user) { state.busy = false; return fail("الحساب غير موجود."); }
  try {
    const workPhotos = (user.workPhotos || []).filter((_, i) => i !== index);
    await updateDoc(doc(db, USERS_COLLECTION, docId), { workPhotos, updatedAt: serverTimestamp() });
    user.workPhotos = workPhotos;
    toast(`تم حذف صورة عمل لـ ${displayName(user)}.`);
    render();
    state.busy = false;
    return true;
  } catch (error) {
    state.busy = false;
    return showError("تعذر حذف الصورة في Firebase.", error);
  }
}

function filteredUsersForView() {
  let users = [...state.users];
  if (state.view === "new") users = users.sort(sortNewest).slice(0, 50);
  if (state.view === "pending") users = users.filter(u => u.verificationStatus === "pending");
  if (state.view === "verified") users = users.filter(u => u.verified === true);
  const q = state.search.trim().toLowerCase();
  if (q) {
    users = users.filter(u => `${displayName(u)} ${u.username || ""} ${u.job || ""} ${u.city || ""}`.toLowerCase().includes(q));
  }
  return users;
}

async function login() {
  const form = document.querySelector("#admin-login");
  const username = form?.querySelector("input[name='username']")?.value.trim() || "";
  const password = form?.querySelector("input[name='password']")?.value || "";
  if (!username || !password) return fail("أدخل اسم المستخدم وكلمة المرور.");
  if (!(await initFirebase())) return false;
  const creds = await getAdminCreds();
  if (!creds) return fail("لم يتم العثور على بيانات المدير في Firebase. تأكد من اتصال قاعدة البيانات.");
  const hash = await hashPassword(password);
  if (username === creds.username && hash === creds.passwordHash) {
    state.authed = true;
    save("mallem_admin_session", { ok: true, at: Date.now() });
    render();
    await loadData();
    return true;
  }
  return fail("اسم المستخدم أو كلمة المرور غير صحيحين.");
}

async function saveSettings() {
  const form = document.querySelector("#admin-settings-form");
  if (!form) return;
  const newUsername = form.querySelector("input[name='newUsername']")?.value.trim() || "";
  const currentPassword = form.querySelector("input[name='currentPassword']")?.value || "";
  const newPassword = form.querySelector("input[name='newPassword']")?.value || "";
  const confirmPassword = form.querySelector("input[name='confirmPassword']")?.value || "";
  const feedback = document.getElementById("settings-feedback");
  if (!newUsername || !currentPassword || !newPassword || !confirmPassword) {
    if (feedback) feedback.textContent = "يرجى ملء جميع الحقول.";
    return;
  }
  if (newPassword !== confirmPassword) {
    if (feedback) { feedback.textContent = "كلمة المرور الجديدة وتأكيدها غير متطابقين."; feedback.style.color = "var(--danger)"; }
    return;
  }
  if (newPassword.length < 6) {
    if (feedback) { feedback.textContent = "كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل."; feedback.style.color = "var(--danger)"; }
    return;
  }
  const creds = await getAdminCreds();
  if (!creds) {
    if (feedback) { feedback.textContent = "تعذر قراءة بيانات المدير من Firebase."; feedback.style.color = "var(--danger)"; }
    return;
  }
  const currentHash = await hashPassword(currentPassword);
  if (currentHash !== creds.passwordHash) {
    if (feedback) { feedback.textContent = "كلمة المرور الحالية غير صحيحة."; feedback.style.color = "var(--danger)"; }
    return;
  }
  const newHash = await hashPassword(newPassword);
  const ok = await saveAdminCreds(newUsername, newHash);
  if (ok) {
    if (feedback) { feedback.textContent = "تم حفظ التغييرات بنجاح."; feedback.style.color = "var(--primary)"; }
  } else {
    if (feedback) { feedback.textContent = "تعذر حفظ التغييرات في Firebase."; feedback.style.color = "var(--danger)"; }
  }
}

async function bootstrap() {
  const form = document.querySelector("#admin-bootstrap");
  if (!form) return;
  const key = form.querySelector("input[name='bootstrapKey']")?.value || "";
  if (key !== "Amine061077513017112010") return fail("مفتاح التفعيل غير صحيح.");
  state.needsSetup = false;
  state.setupNew = true;
  render();
}

async function setupAdmin() {
  const form = document.querySelector("#admin-setup");
  if (!form) return;
  const username = form.querySelector("input[name='username']")?.value.trim() || "";
  const password = form.querySelector("input[name='password']")?.value || "";
  const confirm = form.querySelector("input[name='confirm']")?.value || "";
  if (!username || !password || !confirm) return fail("يرجى ملء جميع الحقول.");
  if (password !== confirm) return fail("كلمة المرور وتأكيدها غير متطابقين.");
  if (password.length < 6) return fail("كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل.");
  const hash = await hashPassword(password);
  const ok = await saveAdminCreds(username, hash);
  if (!ok) return fail("تعذر حفظ بيانات المدير في Firebase. تأكد من صلاحيات Firestore.");
  state.authed = true;
  state.setupNew = false;
  save("mallem_admin_session", { ok: true, at: Date.now() });
  render();
  await loadData();
  return true;
}

function logout() {
  state.authed = false;
  state.users = [];
  state.blacklist = [];
  state.setupNew = false;
  state.needsSetup = false;
  remove("mallem_admin_session");
  render();
}

async function setVerification(docId, approved) {
  if (state.busy) return;
  state.busy = true;
  const user = state.users.find(item => item.docId === docId);
  if (!user) { state.busy = false; return fail("الحساب غير موجود."); }
  try {
    const update = {
      verified: approved,
      verificationStatus: approved ? "verified" : "rejected",
      updatedAt: serverTimestamp()
    };
    if (!approved) update.accreditationLevel = "";
    await updateDoc(doc(db, USERS_COLLECTION, docId), update);
    user.verified = approved;
    user.verificationStatus = approved ? "verified" : "rejected";
    if (!approved) user.accreditationLevel = "";
    toast(approved ? "تم توثيق الحساب." : "تم رفض التوثيق.");
    if (state.modalUser?.docId === docId) state.modalUser = { ...user };
    renderModal();
    render();
    state.busy = false;
    return true;
  } catch (error) {
    state.busy = false;
    return showError("تعذر تحديث التوثيق في Firebase.", error);
  }
}

async function removeUser(docId) {
  if (state.busy) return;
  const user = state.users.find(item => item.docId === docId);
  if (!user) return fail("الحساب غير موجود.");
  const reason = prompt("سبب الحظر:", "مخالفة قواعد المنصة");
  if (!reason) return false;
  state.busy = true;
  try {
    await addDoc(collection(db, BLACKLIST_COLLECTION), {
      ...withoutDocId(user),
      reason,
      blacklistedAt: new Date().toISOString(),
      serverBlacklistedAt: serverTimestamp()
    });
    await deleteDoc(doc(db, USERS_COLLECTION, docId));
    toast("تم حظر الحساب ونقله إلى القائمة السوداء.");
    if (state.modalUser?.docId === docId) state.modalUser = null;
    await loadData();
    state.busy = false;
    return true;
  } catch (error) {
    state.busy = false;
    return showError("تعذر حظر الحساب.", error);
  }
}

async function restoreUser(docId) {
  if (state.busy) return;
  const item = state.blacklist.find(row => row.docId === docId);
  if (!item) return fail("الحساب غير موجود في القائمة السوداء.");
  state.busy = true;
  try {
    const restored = {
      ...withoutDocId(item),
      status: "active",
      restoredAt: new Date().toISOString(),
      updatedAt: serverTimestamp()
    };
    delete restored.reason;
    delete restored.blacklistedAt;
    delete restored.serverBlacklistedAt;
    await addDoc(collection(db, USERS_COLLECTION), restored);
    await deleteDoc(doc(db, BLACKLIST_COLLECTION, docId));
    toast("تم استرجاع الحساب.");
    await loadData();
    state.busy = false;
    return true;
  } catch (error) {
    state.busy = false;
    return showError("تعذر استرجاع الحساب.", error);
  }
}

function getStats() {
  return {
    total: state.users.length,
    pending: state.users.filter(u => u.verificationStatus === "pending").length,
    verified: state.users.filter(u => u.verified).length,
    blocked: state.blacklist.length
  };
}

function statusBadge(user) {
  if (user.verified) return `<span class="badge" title="معتمد">معتمد</span>`;
  if (user.verificationStatus === "pending") return `<span class="badge warn" title="بانتظار المراجعة">قيد المراجعة</span>`;
  if (user.verificationStatus === "rejected") return `<span class="badge danger" title="مرفوض">مرفوض</span>`;
  if (user.status === "blocked") return `<span class="badge danger">محظور</span>`;
  return `<span class="badge warn">تقليدي</span>`;
}

function normalizeUser(user) {
  return {
    ...user,
    username: user.username || "",
    usernameLower: user.usernameLower || String(user.username || "").trim().toLowerCase(),
    fullName: user.fullName || user.name || "",
    status: user.status || "active",
    verified: Boolean(user.verified),
    hasDiploma: Boolean(user.hasDiploma),
    verificationStatus: user.verificationStatus || (user.verified ? "verified" : user.hasDiploma ? "pending" : "none"),
    photoURL: user.photoURL || "",
    workPhotos: Array.isArray(user.workPhotos) ? user.workPhotos : []
  };
}

function withoutDocId(item) {
  const copy = { ...item };
  delete copy.docId;
  return copy;
}

function sortNewest(a, b) {
  return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
}

function displayName(user) {
  return user?.fullName || user?.username || "حرفي";
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString("ar-MA");
}

function isAdminSessionValid() {
  const session = load("mallem_admin_session", null);
  if (!session?.ok) return false;
  const elapsed = Date.now() - (session.at || 0);
  return elapsed < 86400000; // 24 hours
}

function firebaseMessage(error) {
  const code = error?.code || "";
  const details = error?.message || String(error || "");
  if (code === "permission-denied") return `Firebase رفض العملية بسبب الصلاحيات (permission-denied). تأكد من أن قواعد Firestore تسمح بقراءة/كتابة المجموعات للمستخدمين الموثقين، أو أن حساب المدير مضاف في Firebase Auth. التفاصيل: ${details}`;
  if (code === "unavailable") return `Firebase غير متاح حاليا أو الاتصال ضعيف. التفاصيل: ${details}`;
  if (code === "failed-precondition") return `Firebase يحتاج index أو شرط غير مكتمل. التفاصيل: ${details}`;
  if (code === "auth/user-not-found") return "حساب المدير غير موجود. تأكد من إنشائه في Firebase Auth Console.";
  if (code === "auth/wrong-password") return "كلمة المرور غير صحيحة.";
  if (code === "auth/invalid-credential") return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  if (code === "auth/too-many-requests") return "تم حظر الوصول مؤقتاً بسبب محاولات متكررة. حاول لاحقاً.";
  return `${details}${code ? ` (${code})` : ""}`;
}

function showError(prefix, error) {
  console.error(prefix, error);
  toast(`${prefix} ${firebaseMessage(error)}`);
  return false;
}

function fail(message) {
  toast(message);
  return false;
}

function toast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastEl.timer);
  toastEl.timer = setTimeout(() => toastEl.classList.remove("show"), 6500);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function esc(value) {
  return escapeHtml(value);
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error(`Could not read ${key}.`, error);
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function remove(key) {
  localStorage.removeItem(key);
}

async function hashPassword(password) {
  const enc = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function getAdminCreds() {
  if (!(await initFirebase())) return null;
  try {
    const snap = await getDoc(doc(db, ADMIN_COLLECTION, ADMIN_DOC_ID));
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
}

async function saveAdminCreds(username, passwordHash) {
  if (!(await initFirebase())) return false;
  try {
    await setDoc(doc(db, ADMIN_COLLECTION, ADMIN_DOC_ID), {
      username,
      passwordHash,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    return false;
  }
}
