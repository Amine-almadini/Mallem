let initializeApp;
let getFirestore;
let collection;
let addDoc;
let deleteDoc;
let doc;
let getDoc;
let getDocs;
let query;
let updateDoc;
let where;
let serverTimestamp;
let getAuth;
let createUserWithEmailAndPassword;
let signInWithEmailAndPassword;
let fetchSignInMethodsForEmail;
let signOut;
let deleteUser;
let signInAnonymously;
let onAuthStateChanged;

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
const REQUESTS_COLLECTION = "requests";
const ADMIN_COLLECTION = "Admin";
const ADMIN_DOC_ID = "admin_credentials";
const WHATSAPP_DIPLOMA_NUMBER = "212717366507";

let db = null;
let auth = null;
let firebaseReady = false;
let firebaseLoading = null;
let syncInterval = null;

const CITIES = [
  "أكادير", "أزيلال", "آسا", "أصيلة", "أزمور", "أرفود", "بني ملال",
  "بني انصار", "بنسليمان", "برشيد", "بركان", "بئر كندوز", "بيوكرى",
  "بوجدور", "بولمان", "بوزنيقة", "الداخلة", "الدار البيضاء", "الدريوش",
  "الفنيدق", "الفقيه بن صالح", "فاس", "فكيك", "غفساي", "جرادة",
  "الجديدة", "جماعة", "الحاجب", "الحسيمة", "الحوز", "الخميسات",
  "خنيفرة", "خريبكة", "القصر الكبير", "القنيطرة", "الرشيدية",
  "الريصاني", "العروي", "العرائش", "العيون", "اليوسفية", "المضيق",
  "المحمدية", "مراكش", "مريرت", "مرتيل", "مكناس", "مديونة",
  "ميدلت", "مولاي ادريس زرهون", "الناظور", "النواصر", "الرباط",
  "آسفي", "سلا", "صفرو", "الصخيرات", "السمارة", "سطات", "سيدي بنور",
  "سيدي إفني", "سيدي قاسم", "سيدي سليمان", "الصويرة", "تاونات",
  "تارودانت", "طرفاية", "طاطا", "تازة", "تمارة", "تنغير",
  "تيفلت", "تيزنيت", "طنجة", "تطوان", "تاوريرت", "وجدة",
  "وزان", "ورزازات", "زايو", "زاكورة",
  "أولاد تايمة", "ايت ملول", "إنزكان", "بركان", "بني ملال",
  "قلعة السراغنة", "شيشاوة", "شفشاون", "اشتوكة آيت باها",
  "بني ملال", "الفقيه بن صالح", "قصبة تادلة", "بني ملال",
  "طانطان", "بويزكارن", "كلميم", "الحاجب", "الخميسات",
  "تيفلت", "العرائش", "القصر الكبير", "أصيلة", "شفشاون",
  "وزان", "الناظور", "بركان", "جرادة", "تاوريرت", "فكيك",
  "العيون الشرقية", "زايو", "الدريوش", "بني انصار", "العروي",
  "الجديدة", "أزمور", "سيدي بنور", "خنيفرة", "مريرت",
  "بني ملال", "أزيلال", "تاونات", "تازة", "صفرو", "مولاي ادريس زرهون",
  "الحسيمة", "العرائش", "المضيق", "الفنيدق", "مرتيل", "أصيلة",
  "الرباط", "سلا", "تمارة", "الصخيرات", "القنيطرة", "سيدي سليمان",
  "سيدي قاسم", "الخميسات", "تيفلت", "مراكش", "آسفي", "قلعة السراغنة",
  "الصويرة", "شيشاوة", "الحوز", "بنجرير", "اليوسفية", "سيدي رحال",
  "فاس", "مكناس", "تاونات", "تازة", "صفرو", "الحاجب", "مولاي ادريس",
  "غفساي", "بولمان", "إيموزار", "الدار البيضاء", "المحمدية", "الجديدة",
  "سطات", "برشيد", "خريبكة", "بنسليمان", "النواصر", "مديونة",
  "بوزنيقة", "أزمور", "سيدي بنور", "الفقيه بن صالح", "قصبة تادلة",
  "أكادير", "إنزكان", "تيزنيت", "تارودانت", "أولاد تايمة", "ايت ملول",
  "بيوكرى", "طاطا", "اشتوكة آيت باها", "تارودانت",
  "العيون", "السمارة", "بوجدور", "طرفاية",
  "الداخلة", "بئر كندوز", "أوسرد",
  "ورزازات", "الرشيدية", "ميدلت", "تنغير", "زاكورة", "أرفود", "الريصاني",
  "كلميم", "طانطان", "بويزكارن", "سيدي إفني", "آسا الزاك",
  "جرادة", "فكيك", "تاوريرت", "وجدة", "العيون الشرقية", "زايو",
  "بني ملال", "الفقيه بن صالح", "أزيلال", "خنيفرة",
  "آسا", "طانطان", "السمارة", "بوجدور", "طرفاية",
  "الحسيمة", "الناظور", "الدريوش", "بركان", "تاوريرت", "جرادة", "فكيك",
  "ميدلت", "الريصاني", "تنغير", "ورزازات", "زاكورة", "أرفود",
  "شفشاون", "وزان", "العرائش", "تطوان", "طنجة", "الحسيمة",
  "تاونات", "تازة", "صفرو", "الحاجب", "مولاي ادريس زرهون",
  "آسفي", "قلعة السراغنة", "شيشاوة", "الحوز", "الصويرة",
  "بنجرير", "اليوسفية", "سيدي رحال", "سيدي بنور",
  "سطات", "برشيد", "بنسليمان", "خريبكة", "النواصر", "مديونة",
  "بوزنيقة", "أزمور", "الجديدة", "المحمدية",
  "كلميم", "طانطان", "بويزكارن", "سيدي إفني", "آسا الزاك",
  "القنيطرة", "سيدي سليمان", "سيدي قاسم", "الخميسات", "تيفلت",
  "تمارة", "الصخيرات", "الرباط", "سلا",
  "تارودانت", "تيزنيت", "أكادير", "إنزكان", "ايت ملول", "أولاد تايمة",
  "طاطا", "بيوكرى",
  "العيون", "السمارة", "بوجدور", "طرفاية",
  "الداخلة", "بئر كندوز", "أوسرد",
  "فاس", "مكناس", "تاونات", "صفرو", "تازة",
  "الحاجب", "مولاي ادريس زرهون", "غفساي", "إيموزار", "بولمان",
  "تطوان", "طنجة", "الحسيمة", "المضيق", "الفنيدق", "مرتيل",
  "العرائش", "القصر الكبير", "أصيلة"
];

const JOBS = [
  "بناء (بنّاي)",
  "سمسار",
  "زلايجي",
  "صباغ",
  "نجار خشب",
  "نجار ألمنيوم",
  "حداد",
  "جباص",
  "ديكور",
  "كهربائي (تريسيان)",
  "كهرباء صناعية",
  "بلومبي",
  "فتح المجاري",
  "زجاجي",
  "ألمنيوم",
  "إصلاح الأجهزة الإلكترونية",
  "تركيب كاميرات المراقبة",
  "أنظمة الإنذار",
  "نجار",
  "بستنة (جارديني)",
  "التنظيف",
  "نقل البضائع"
];

const DEFAULT_JOB_FILTER = "الكل";

// Language support
const LANG_KEY = "mallem_lang";
const LANGUAGES = { ar: "العربية", fr: "Français", en: "English" };
const TRANSLATIONS = {
  // Welcome & auth
  welcomeTitle: { ar: "منصة معلم", fr: "Plateforme Mallem", en: "Mallem Platform" },
  welcomeSub: { ar: "أنشئ حسابك الآن واختر نوع الحساب لنحدد لك المسار المناسب بسرعة.", fr: "Créez votre compte maintenant et choisissez le type de compte pour trouver le chemin approprié rapidement.", en: "Create your account now and choose your account type to find the right path quickly." },
  clientLabel: { ar: "زبون", fr: "Client", en: "Client" },
  clientDesc: { ar: "ابحث عن حرفي مناسب", fr: "Trouver un artisan", en: "Find a craftsman" },
  proLabel: { ar: "حرفي", fr: "Artisan", en: "Craftsman" },
  proDesc: { ar: "سجل لحسابك المهني", fr: "Accéder à mon compte", en: "Access my account" },
  craftsmanGateTitle: { ar: "بوابة الحرفي", fr: "Portail Artisan", en: "Craftsman Portal" },
  craftsmanGateLogin: { ar: "عندي حساب", fr: "J'ai un compte", en: "I have an account" },
  craftsmanGateRegister: { ar: "إنشاء حساب", fr: "Créer un compte", en: "Create account" },
  loginTitle: { ar: "تسجيل دخول الحرفي", fr: "Connexion Artisan", en: "Craftsman Login" },
  loginBtn: { ar: "دخول", fr: "Connexion", en: "Login" },
  registerTitle: { ar: "تسجيل حساب حرفي", fr: "Inscription Artisan", en: "Craftsman Registration" },
  nextBtn: { ar: "متابعة", fr: "Suivant", en: "Next" },
  createBtn: { ar: "إنشاء الحساب", fr: "Créer le compte", en: "Create account" },
  usernameLabel: { ar: "اسم المستخدم", fr: "Nom d'utilisateur", en: "Username" },
  passwordLabel: { ar: "كلمة المرور", fr: "Mot de passe", en: "Password" },
  fullNameLabel: { ar: "الاسم الكامل", fr: "Nom complet", en: "Full name" },
  phoneLabel: { ar: "رقم الهاتف", fr: "Téléphone", en: "Phone" },
  cityLabel: { ar: "المدينة", fr: "Ville", en: "City" },
  whatsappLabel: { ar: "واتساب", fr: "WhatsApp", en: "WhatsApp" },
  jobLabel: { ar: "الحرفة", fr: "Métier", en: "Job" },
  addressLabel: { ar: "العنوان", fr: "Adresse", en: "Address" },
  searchPlaceholder: { ar: "اكتب اسم حرفي...", fr: "Rechercher un artisan...", en: "Search a craftsman..." },
  cityFilterPlaceholder: { ar: "اختر المدينة", fr: "Choisir la ville", en: "Choose city" },
  jobFilterLabel: { ar: "الحرفي", fr: "Métier", en: "Job" },
  clearBtn: { ar: "مسح", fr: "Effacer", en: "Clear" },
  callBtn: { ar: "اتصال", fr: "Appeler", en: "Call" },
  whatsappBtn: { ar: "واتساب", fr: "WhatsApp", en: "WhatsApp" },
  requestBtn: { ar: "إنشاء طلب", fr: "Demander", en: "Request" },
  // Nav
  navHome: { ar: "الرئيسية", fr: "Accueil", en: "Home" },
  navFav: { ar: "المفضلة", fr: "Favoris", en: "Favorites" },
  navHistory: { ar: "السجل", fr: "Historique", en: "History" },
  navAccount: { ar: "الإعدادات", fr: "Paramètres", en: "Settings" },
  navRequests: { ar: "الطلبات", fr: "Demandes", en: "Requests" },
  navNotes: { ar: "دفتر الملاحظات", fr: "Notes", en: "Notes" },
  // Settings / Account
  settingsTitle: { ar: "الإعدادات", fr: "Paramètres", en: "Settings" },
  accountSection: { ar: "الحساب", fr: "Compte", en: "Account" },
  languageSection: { ar: "اللغة", fr: "Langue", en: "Language" },
  editInfoBtn: { ar: "تعديل المعلومات", fr: "Modifier", en: "Edit info" },
  logoutBtn: { ar: "تسجيل الخروج", fr: "Déconnexion", en: "Logout" },
  deleteBtn: { ar: "حذف الحساب", fr: "Supprimer le compte", en: "Delete account" },
  saveBtn: { ar: "حفظ التعديلات", fr: "Enregistrer les modifications", en: "Save changes" },
  cancelBtn: { ar: "إلغاء", fr: "Annuler", en: "Cancel" },
  // Other
  requestsTitle: { ar: "الطلبات", fr: "Demandes", en: "Requests" },
  notesTitle: { ar: "دفتر الملاحظات", fr: "Notes", en: "Notes" },
  emptyRequests: { ar: "لا توجد طلبات جديدة حالياً.", fr: "Aucune demande pour le moment.", en: "No requests yet." },
  saveNoteBtn: { ar: "حفظ الملاحظات", fr: "Enregistrer", en: "Save notes" },
  offlineBanner: { ar: "لا يوجد اتصال بالإنترنت. سيتم حفظ التغييرات محلياً مؤقتاً.", fr: "Connexion perdue. Les changements seront sauvegardés localement.", en: "No connection. Changes will be saved locally for now." },
  proCard: { ar: "حرفي", fr: "Artisan", en: "Craftsman" },
  unverified: { ar: "غير موثق", fr: "Non vérifié", en: "Unverified" },
  pendingVerif: { ar: "قيد المراجعة", fr: "En attente", en: "Pending" },
  verified: { ar: "موثق", fr: "Vérifié", en: "Verified" },
  noResult: { ar: "لا توجد نتائج", fr: "Aucun résultat", en: "No results" },
  emptyFav: { ar: "لم تتم إضافة أي حرفي إلى المفضلة.", fr: "Aucun favori pour le moment.", en: "No favorites yet." },
  emptyHistory: { ar: "لم تتم مشاهدة أي حرفي من قبل.", fr: "Aucun historique.", en: "No history yet." },
  blockedTitle: { ar: "تم حظر حسابك", fr: "Votre compte a été bloqué", en: "Your account has been blocked" },
  blockedNoReason: { ar: "لم يتم تقديم سبب.", fr: "Aucune raison fournie.", en: "No reason provided." },
  filterToggle: { ar: "بحث وتصفية", fr: "Recherche et filtre", en: "Search & Filter" },
  recoverBtn: { ar: "استرجاع الحساب", fr: "Récupérer le compte", en: "Recover account" },
  blockedUser: { ar: "اسم المستخدم محظور", fr: "Nom d'utilisateur bloqué", en: "Username is blocked" },
  blockedUserSuggest: { ar: "اسم المستخدم محظور، جرب اسم مستخدم آخر", fr: "Nom d'utilisateur bloqué, essayez-en un autre", en: "Username is blocked, try another username" },
};

const memoryStore = {};

function t(key) {
  return TRANSLATIONS[key]?.[state.lang] || TRANSLATIONS[key]?.ar || key;
}

function setLang(code) {
  if (!LANGUAGES[code]) return;
  state.lang = code;
  save(LANG_KEY, code);
  document.documentElement.lang = code === "ar" ? "ar" : code === "fr" ? "fr" : "en";
  render();
}

function langSwitcher() {
  const codes = Object.keys(LANGUAGES);
  const current = state.lang;
  const others = codes.filter(c => c !== current);
  return `<div class="lang-switcher">
    <button class="lang-current" onclick="this.nextElementSibling.classList.toggle('show')">${current.toUpperCase()}</button>
    <div class="lang-dropdown">${others.map(c => `<button data-action="setLang" data-value="${c}">${LANGUAGES[c]}</button>`).join("")}</div>
  </div>`;
}

const state = {
  lang: load(LANG_KEY, "ar"),
  screen: "welcome",
  authMode: "login",
  role: "",
  user: normalizeUser(load("mallem_user", null)),
  users: load("mallem_users", []).map(normalizeUser).filter(Boolean),
  requests: load("mallem_requests", []),
  favorites: load("mallem_favorites", []),
  history: load("mallem_history", []),
  notes: load("mallem_notes", ""),
  isOnline: navigator.onLine !== false,
  editingAccount: false,
  register: { step: 1, role: "", data: {} },
  filters: { city: "", job: DEFAULT_JOB_FILTER, search: "" },
  filterOpen: false,
  blocked: null
};

const app = document.querySelector("#app");
const toastEl = document.querySelector("#toast");

document.addEventListener("click", (event) => {
  const action = event.target.closest("[data-action]");
  if (!action) return;
  const value = action.dataset.value;
  const id = action.dataset.id;
  const actions = {
    setAuthMode: () => { state.authMode = value || "login"; if (!value) state.role = ""; state.screen = "welcome"; render(); },
    chooseLoginRole: () => { state.role = value; render(); },
    chooseRegisterRole: () => startRegister(value),
    login: () => login(),
    saveRegister: () => saveRegister(),
    backRegister: () => { state.register.step = Math.max(1, state.register.step - 1); render(); },
    nextRegister: () => nextRegister(),
    sendDiploma: () => sendDiploma(),
    forgotPassword: () => window.open(`https://wa.me/${WHATSAPP_DIPLOMA_NUMBER}`, "_blank"),
    recoverAccount: () => window.open(`https://wa.me/${WHATSAPP_DIPLOMA_NUMBER}`, "_blank"),
    reviewPro: () => { const name = (event.target.closest("[data-name]")?.dataset?.name) || "الحرفي"; window.open(`https://wa.me/${WHATSAPP_DIPLOMA_NUMBER}?text=${encodeURIComponent("تقييمي للحرفي " + name + " هو ... نجوم.\nملاحظاتي عليه:\n")}`, "_blank"); },
    helpWhatsapp: () => window.open(`https://wa.me/${WHATSAPP_DIPLOMA_NUMBER}`, "_blank"),
    logoutFromBlocked: () => { state.blocked = null; state.user = null; remove("mallem_user"); remove("mallem_blocked"); setScreen("welcome"); },
    setLang: () => setLang(value),
    logout: () => logout(),
    home: () => setScreen("home"),
    history: () => setScreen("history"),
    favorite: () => setScreen("favorite"),
    account: () => setScreen("account"),
    requests: () => setScreen("requests"),
    notes: () => setScreen("notes"),
    editAccount: () => { state.editingAccount = true; render(); },
    cancelEdit: () => { state.editingAccount = false; render(); },
    saveAccount: () => saveAccount(),
    deleteAccount: () => deleteAccount(),
    toggleFav: () => toggleFavorite(id),
    call: () => registerContact(id, () => { window.location.href = `tel:${value}`; }),
    whatsapp: () => registerContact(id, () => window.open(whatsappLink(value), "_blank")),
    request: () => createRequest(id),
    saveRequestNote: () => saveRequestNote(id),
    saveNotes: () => saveNotes(),
    filterJob: () => { state.filters.job = value; render(); },
    clearFilters: () => { state.filters = { city: "", job: DEFAULT_JOB_FILTER, search: "" }; render(); },
    applyFilters: () => render(),
    toggleFilter: () => { state.filterOpen = !state.filterOpen; render(); }
  };
  const result = actions[action.dataset.action]?.();
  if (result?.catch) {
    result.catch((error) => showError("تعذر تنفيذ العملية.", error));
  }
});

document.addEventListener("input", (event) => {
  const el = event.target;
  if (!el.name) return;
  if (el.name === "search") state.filters.search = el.value;
  if (el.name === "cityFilter") state.filters.city = el.value;
  if (el.name === "notes") state.notes = el.value;
  if (el.name?.startsWith("requestNote:")) updateRequestNoteDraft(el.name.replace("requestNote:", ""), el.value);
  if (el.closest("#register-form")) state.register.data[el.name] = el.type === "checkbox" ? el.checked : el.value;
});

document.addEventListener("submit", (event) => event.preventDefault());

window.addEventListener("hashchange", () => {
  const page = location.hash.replace("#", "");
  if (page) setScreen(page, false);
});

init();

async function init() {
  registerOfflineCache();
  bindNetworkStatus();
  const savedBlocked = load("mallem_blocked", null);
  if (savedBlocked) state.blocked = savedBlocked;
  if (state.user) state.screen = "home";
  render();
  if (await initFirebase()) {
    await syncUsers({ silent: true });
    if (state.user?.role === "pro") await syncRequests();
    render();
    startSyncInterval();
  }
}

function startSyncInterval() {
  clearInterval(syncInterval);
  syncInterval = setInterval(async () => {
    if (state.blocked || state.screen === "welcome" || state.screen === "register" || !firebaseReady) return;
    await syncUsers({ silent: true });
    if (state.user?.role === "pro") await syncRequests();
    render();
  }, 10000);
}

async function syncThenRender() {
  if (firebaseReady && !state.blocked && state.screen !== "welcome") {
    await syncUsers({ silent: true });
    if (state.user?.role === "pro") await syncRequests();
  }
  render();
}

function registerOfflineCache() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("service-worker.js").catch((error) => {
    console.warn("Service worker registration failed.", error);
  });
}

function bindNetworkStatus() {
  window.addEventListener("online", async () => {
    state.isOnline = true;
    toast("تمت استعادة الاتصال بالإنترنت.");
    if (state.user?.role === "pro" && await initFirebase()) {
      await syncUsers({ silent: true });
      await syncRequests();
    }
    render();
  });
  window.addEventListener("offline", () => {
    state.isOnline = false;
    toast("لا يمكن الاتصال. سيتم حفظ التغييرات محليا في الوقت الحالي.");
    render();
  });
}

async function initFirebase() {
  if (firebaseReady) return true;
  if (!state.isOnline) return false;
  if (firebaseLoading) return firebaseLoading;
  firebaseLoading = (async () => {
    try {
      const [appModule, firestoreModule, authModule] = await Promise.all([
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"),
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js")
      ]);
      ({ initializeApp } = appModule);
      ({ getFirestore, collection, addDoc, deleteDoc, doc, getDocs, getDoc, query, updateDoc, where, serverTimestamp } = firestoreModule);
      ({ getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, fetchSignInMethodsForEmail, signOut, deleteUser, signInAnonymously, onAuthStateChanged } = authModule);
      const firebaseApp = initializeApp(firebaseConfig);
      db = getFirestore(firebaseApp);
      auth = getAuth(firebaseApp);
      if (!auth.currentUser) {
        await signInAnonymously(auth).catch(() => {});
      }
      if (!window.__authListenerRegistered) {
        window.__authListenerRegistered = true;
        onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser && !state.user) {
            const saved = load("mallem_user", null);
            if (saved?.role === "pro") {
              state.user = normalizeUser(saved);
              await syncUsers({ silent: true });
              await syncRequests();
              render();
            }
          }
        });
      }
      firebaseReady = true;
      return true;
    } catch (error) {
      firebaseLoading = null;
      console.error("Firebase initialization failed.", error);
      showError("إعدادات", error);
      return false;
    }
  })();
  return firebaseLoading;
}

function render() {
  if (state.blocked) { app.innerHTML = renderBlocked(); return; }
  const publicScreens = ["welcome", "register"];
  if (!state.user && !publicScreens.includes(state.screen)) state.screen = "welcome";
  app.innerHTML = publicScreens.includes(state.screen) ? renderPublic() : renderPrivate();
}

function renderPublic() {
  if (state.screen === "register") return registerScreen();
  return `
    <main class="welcome">
      ${langSwitcher()}
      <section class="welcome-panel pop">
        <img src="icon.png" alt="Mallem" class="brand-logo" onerror="this.style.display='none'">
        <h1>${t("welcomeTitle")}</h1>
        <p>${t("welcomeSub")}</p>
        ${state.role === "pro" ? craftsmanGate() : roleChoice()}
      </section>
    </main>`;
}

function roleChoice() {
  return `
    <div class="form">
      <div class="role-grid">
        <button class="role-card" data-action="chooseRegisterRole" data-value="client">
          <span class="role-icon">👤</span>
          <strong class="role-title">${t("clientLabel")}</strong>
          <span class="role-desc">${t("clientDesc")}</span>
        </button>
        <button class="role-card" data-action="chooseLoginRole" data-value="pro">
          <span class="role-icon">🔧</span>
          <strong class="role-title">${t("proLabel")}</strong>
          <span class="role-desc">${t("proDesc")}</span>
        </button>
      </div>
    </div>`;
}

function craftsmanGate() {
  return `
    <form id="login-form" class="form">
      <div class="actions inline">
        <button type="button" class="btn ${state.authMode === "login" ? "primary" : "ghost"}" data-action="setAuthMode" data-value="login">${t("craftsmanGateLogin")}</button>
        <button type="button" class="btn ${state.authMode === "register" ? "primary" : "ghost"}" data-action="chooseRegisterRole" data-value="pro">${t("craftsmanGateRegister")}</button>
      </div>
      ${loginFields()}
      <button class="btn ghost" type="button" data-action="setAuthMode" data-value="">رجوع</button>
    </form>`;
}

function loginFields() {
  return `
    <div class="field"><label>اسم المستخدم</label><input name="username" autocomplete="username" required placeholder="exemple_user"></div>
    <div class="field"><label>كلمة المرور</label><input name="password" type="password" autocomplete="current-password" required></div>
    <button class="btn primary" type="button" data-action="login">دخول</button>
    <button class="btn ghost" type="button" data-action="forgotPassword" style="font-size:13px">نسيت كلمة المرور؟</button>`;
}

function registerScreen() {
  return `
    <main class="welcome">
      <section class="welcome-panel pop">
        <img src="icon.png" alt="Mallem" class="brand-logo" onerror="this.style.display='none'">
        ${state.register.role === "pro" ? `<div class="steps">${[1, 2].map(n => `<span class="step ${n < state.register.step ? "done" : n === state.register.step ? "current" : ""}"></span>`).join("")}</div>` : ""}
        <h1>${state.register.role === "pro" ? "حساب حرفي" : "حساب زبون"}</h1>
        ${registerStep()}
      </section>
    </main>`;
}

function registerStep() {
  const d = state.register.data;
  if (state.register.role === "pro" && state.register.step === 1) {
    return `
      <form id="register-form" class="form">
        <div class="field"><label>اسم المستخدم</label><input name="username" required value="${esc(d.username)}" autocomplete="username" placeholder="exemple_user"></div>
        <p class="field-hint">هذا الاسم يُستخدم فقط لتسجيل الدخول، ولن يظهر للآخرين.</p>
        <div class="field"><label>كلمة المرور</label><input name="password" type="password" required value="${esc(d.password)}" autocomplete="new-password" minlength="6"></div>
        <div class="actions">
          <button class="btn primary" type="button" data-action="nextRegister">متابعة</button>
          <button class="btn ghost" type="button" data-action="setAuthMode" data-value="">رجوع</button>
        </div>
      </form>`;
  }
  return `
    <form id="register-form" class="form">
      <div class="field"><label>الإسم الكامل</label><input name="fullName" required value="${esc(d.fullName)}" placeholder="الإسم والنسب"></div>
      <div class="grid two">
        <div class="field"><label>${state.register.role === "pro" ? "الهاتف" : "رقم الهاتف"}</label><input name="phone" inputmode="tel" required value="${esc(d.phone)}" placeholder="06XXXXXXXX"></div>
        <div class="field"><label>المدينة</label><input name="city" list="cities" required value="${esc(d.city)}" placeholder="اختر المدينة"></div>
      </div>
      <datalist id="cities">${CITIES.map(city => `<option value="${city}"></option>`).join("")}</datalist>
      ${state.register.role === "pro" ? proFields(d) : ""}
      <div class="actions">
        <button class="btn green" type="button" data-action="saveRegister">${t("createBtn")}</button>
        <button class="btn ghost" type="button" data-action="${state.register.role === "pro" ? "backRegister" : "setAuthMode"}" data-value="">رجوع</button>
      </div>
    </form>`;
}

function proFields(d) {
  return `
    <div class="field"><label>واتساب</label><input name="whatsapp" inputmode="tel" required value="${esc(d.whatsapp)}" placeholder="06XXXXXXXX"></div>
    <div class="field"><label>الحرفة</label><select name="job" required>${JOBS.map(job => `<option ${d.job === job ? "selected" : ""}>${job}</option>`).join("")}</select></div>
    <div class="field"><label>العنوان</label><input name="address" required value="${esc(d.address)}" placeholder="الحي، الشارع"></div>
    <label class="checkbox">
      <input name="hasDiploma" type="checkbox" ${d.hasDiploma ? "checked" : ""}>
      <span>عندي دبلوم مهني وبغيت التحقق</span>
    </label>
    ${d.hasDiploma ? `<div class="diploma-section">
      <p class="field-hint">يرجى إرسال صورة الدبلوم عبر واتساب ليتم التحقق منه. اسمك في الدبلوم يجب أن يطابق الاسم المدخل أعلاه.</p>
      <button class="btn light" type="button" data-action="sendDiploma">إرسال صورة الدبلوم</button>
    </div>` : ""}`;
}
async function login() {
  if (!state.role) return fail("يجب اختيار نوع الحساب أولا.");
  if (state.role === "client") {
    const client = load("mallem_client", null);
    if (!client) return fail("لا يمكن العثور على حساب زبون مخزن. سجل حساب جديد أولا.");
    state.user = normalizeUser(client);
    save("mallem_user", state.user);
    toast("أهلا بعودتك");
    setScreen("home");
    return true;
  }

  const form = document.querySelector("#login-form");
  const username = form?.querySelector("input[name='username']")?.value.trim() || "";
  const password = form?.querySelector("input[name='password']")?.value || "";
  if (!username || !password) return fail("يرجى ملء جميع الحقول المطلوبة.");

  if (!(await initFirebase())) return false;

  const creds = await getAdminCredsFirebase();
  if (creds) {
    const adminHash = await hashPassword(password);
    if (username === creds.username && adminHash === creds.passwordHash) {
      save("mallem_admin_session", { ok: true, at: Date.now() });
      window.location.href = "Admin.html";
      return true;
    }
  }

  try {
    const credential = await signInWithEmailAndPassword(auth, usernameToAuthEmail(username), password);
    await syncUsers({ silent: true });
    let user = state.users.find(u => normalizeUsername(u.username) === normalizeUsername(username));
    if (!user) {
      const blocked = state._blacklist?.find(b => normalizeUsername(b.username) === normalizeUsername(username));
      if (blocked) return fail(t("blockedUser"));
      return fail("اسم المستخدم أو كلمة المرور غير صحيحين.");
    }
    if (user.status === "blocked") return fail(t("blockedUser"));
    state.user = normalizeUser(user);
    save("mallem_user", state.user);
    await syncUsers({ silent: true });
    if (state.blocked) { render(); return false; }
    await syncRequests();
    toast("أهلا بعودتك");
    setScreen("home");
    return true;
  } catch {
    return fail("الحساب غير موجود, أنشئه الآن!");
  }
}

function startRegister(role) {
  state.register = { step: 1, role, data: {} };
  setScreen("register");
}

async function nextRegister() {
  if (state.register.role !== "pro") return;
  hydrateRegisterDataFromForm();
  const d = state.register.data;
  d.username = String(d.username || "").trim();
  if (!d.username || !d.password) return fail("يرجى ملء جميع الحقول المطلوبة.");
  if (!/^[a-zA-Z0-9_]+$/.test(d.username)) return fail("اسم المستخدم يجب أن يكون بالحروف اللاتينية والأرقام فقط.");
  if (d.password.length < 6) return fail("كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل.");
  if (!(await initFirebase())) return false;
  const adminCreds = await getAdminCredsFirebase();
  if (adminCreds && d.username === adminCreds.username) return fail("هذا الاسم مستخدم ممنوع.");
  try {
    const methods = await fetchSignInMethodsForEmail(auth, usernameToAuthEmail(d.username));
    if (methods.length) return fail(t("blockedUserSuggest"));
    if (state._blacklist) {
      const blocked = state._blacklist.find(b => normalizeUsername(b.username) === normalizeUsername(d.username));
      if (blocked) return fail(t("blockedUserSuggest"));
    } else {
      const snap = await getDocs(collection(db, "blacklist"));
      const blocked = snap.docs.find(doc => normalizeUsername(doc.data().username) === normalizeUsername(d.username));
      if (blocked) return fail(t("blockedUserSuggest"));
    }
    state.register.step = 2;
    render();
    return true;
  } catch (error) {
    if (error?.code === "auth/email-already-in-use") return fail("This username is already taken.");
    return showError("تعذر التحقق من اسم المستخدم في Firebase Auth.", error);
  }
}

async function saveRegister() {
  hydrateRegisterDataFromForm();
  const d = state.register.data;
  const role = state.register.role;
  if (!role) return fail("حساب");
  if (!d.fullName || !d.phone || !d.city) return fail("لم يتم ملء المعلومات الضرورية.");
  if (!/^[\u0600-\u06FF\s]+$/.test(d.fullName)) return fail("الإسم الكامل يجب أن يكون بالعربية فقط.");
  if (!CITIES.includes(d.city)) return fail("يجب اختيار مدينة من القائمة.");

  if (role === "client") {
    const client = normalizeUser({
      id: crypto.randomUUID(),
      role: "client",
      fullName: d.fullName.trim(),
      phone: d.phone.trim(),
      city: d.city.trim(),
      createdAt: new Date().toISOString()
    });
    save("mallem_client", client);
    save("mallem_user", client);
    state.user = client;
    toast("تم إنشاء حسابك بنجاح!");
    setScreen("home");
    return true;
  }

  if (!d.username || !d.password) return fail("يرجى ملء جميع الحقول المطلوبة.");
  if (!d.whatsapp || !d.job || !d.address) return fail("لم يتم ملء معلومات الحرفي.");
  if (!(await initFirebase())) return false;
  if (state._blacklist) {
    const blocked = state._blacklist.find(b => normalizeUsername(b.username) === normalizeUsername(d.username));
    if (blocked) return fail(t("blockedUserSuggest"));
  } else {
    const snap = await getDocs(collection(db, "blacklist"));
    const blocked = snap.docs.find(doc => normalizeUsername(doc.data().username) === normalizeUsername(d.username));
    if (blocked) return fail(t("blockedUserSuggest"));
  }

  const user = normalizeUser({
    id: crypto.randomUUID(),
    role: "pro",
    username: d.username.trim(),
    usernameLower: normalizeUsername(d.username),
    fullName: d.fullName.trim(),
    phone: d.phone.trim(),
    whatsapp: d.whatsapp.trim(),
    city: d.city.trim(),
    job: d.job,
    address: d.address.trim(),
    rating: "جديد",
    hasDiploma: Boolean(d.hasDiploma),
    verificationStatus: d.hasDiploma ? "pending" : "none",
    verified: false,
    status: "active",
    createdAt: new Date().toISOString()
  });

  try {
    const credential = await createUserWithEmailAndPassword(auth, usernameToAuthEmail(user.username), d.password);
    user.uid = credential.user.uid;
    const remote = await addDoc(collection(db, USERS_COLLECTION), {
      ...forFirestore(user),
      serverCreatedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    user.docId = remote.id;
    state.users = [user, ...state.users.filter(item => item.id !== user.id)];
    save("mallem_users", state.users);
    state.user = user;
    save("mallem_user", user);
    toast("تم إنشاء حسابك بنجاح!");
    setScreen("home");
    return true;
  } catch (error) {
    if (error?.code === "auth/email-already-in-use") return fail("This username is already taken.");
    if (auth?.currentUser && !user.docId) {
      await deleteUser(auth.currentUser).catch((cleanupError) => {
        console.error("Created Auth user could not be removed after Firestore failure.", cleanupError);
      });
    }
    return showError("حساب", error);
  }
}

function hydrateRegisterDataFromForm() {
  const form = document.querySelector("#register-form");
  if (!form) return;
  const data = new FormData(form);
  for (const [key, value] of data.entries()) state.register.data[key] = String(value);
  for (const checkbox of form.querySelectorAll("input[type='checkbox'][name]")) {
    state.register.data[checkbox.name] = checkbox.checked;
  }
}

function renderPrivate() {
  return `<div class="app-shell">${topbar()}${pageContent()}${bottomNav()}</div>`;
}

function renderBlocked() {
  const reason = state.blocked?.reason || t("blockedNoReason");
  return `
    <main class="blocked-screen">
      <section class="blocked-card">
        <span class="blocked-icon">🚫</span>
        <h1>${t("blockedTitle")}</h1>
        <p>${reason}</p>
        <div class="actions" style="margin-top:20px;justify-content:center">
          <button class="btn primary" data-action="recoverAccount">${t("recoverBtn")}</button>
          <button class="btn ghost" data-action="logoutFromBlocked">${t("logoutBtn")}</button>
        </div>
      </section>
    </main>`;
}

function topbar() {
  return `
    <header class="topbar">
      <div class="topbrand"><img src="icon.png" alt="Mallem" onerror="this.style.display='none'"><span>منصة معلم</span></div>
      <nav class="desktop-nav">${navButtons()}</nav>
    </header>`;
}

function navItems() {
  const items = [
    { key: "history", label: t("navHistory"), short: t("navHistory"), icon: "📋" },
    { key: "favorite", label: t("navFav"), short: t("navFav"), icon: "❤️" },
    { key: "home", label: t("navHome"), short: t("navHome"), icon: "🏠" },
    { key: "account", label: t("navAccount"), short: t("navAccount"), icon: "👤" }
  ];
  items.push({ key: "notes", label: t("navNotes"), short: t("navNotes"), icon: "📝" });
  return items;
}

function navButtons() {
  return navItems().map(item => `<button class="nav-btn ${state.screen === item.key ? "active" : ""}" data-action="${item.key}">${item.label}</button>`).join("");
}

function bottomNav() {
  return `<nav class="bottom-nav">${navItems().map(item => `
    <button class="${state.screen === item.key ? "active" : ""} ${item.key === "home" ? "home-special" : ""}" data-action="${item.key}">
      <span class="ico">${item.icon}</span><span>${item.short}</span>
    </button>`).join("")}</nav>`;
}

function pageContent() {
  if (state.screen === "history") return historyPage();
  if (state.screen === "favorite") return favoritePage();
  if (state.screen === "account") return accountPage();
  if (state.screen === "requests") return requestsPage();
  if (state.screen === "notes") return notesPage();
  return homePage();
}

function homePage() {
  const pros = filteredPros();
  return `
    <main class="page grid fade-in">
      ${offlineNotice()}
      <section class="panel hero-strip">
        <div>
          <h2 class="section-title">الحرفيين  المتاحين  </h2>
          <p class="muted">قم بالبحث عن الحرفي المناسب ليخدمك في منصة معلم.</p>
        </div>
      </section>
      <button class="filter-toggle" data-action="toggleFilter">${state.filterOpen ? "▲" : "▼"} ${t("filterToggle")}</button>
      ${state.filterOpen ? `
      <section class="filter-bar">
        <div class="field"><input name="search" value="${esc(state.filters.search)}" placeholder="بحث بالاسم"></div>
        <div class="field"><select name="cityFilter" onchange="__setCity(this.value)"><option value="">كل المدن</option>${CITIES.map(c => `<option ${state.filters.city === c ? "selected" : ""}>${c}</option>`).join("")}</select></div>
        <div class="field"><select onchange="window.__setJob(this.value)">${[DEFAULT_JOB_FILTER, ...JOBS].map(j => `<option ${state.filters.job === j ? "selected" : ""}>${j}</option>`).join("")}</select></div>
        <button class="btn ghost" data-action="clearFilters" title="مسح">✕</button>
        <button class="btn primary" data-action="applyFilters">بحث</button>
      </section>` : ""}
      <section class="grid three">${pros.length ? pros.map(proCard).join("") : `بحث`}</section>
    </main>`;
}

window.__setJob = (job) => { state.filters.job = job; };
window.__setCity = (city) => { state.filters.city = city; };

function proCard(pro) {
  const fav = state.favorites.includes(pro.id);
  const name = displayName(pro);
  const verifiedBadge = pro.verified ? '<span class="verified-badge">معتمد</span>' : pro.verificationStatus === "pending" ? '<span class="badge-warn" style="font-size:11px;padding:2px 8px;border-radius:999px">قيد المراجعة</span>' : '<span class="trad-badge">تقليدي</span>';
  return `
    <article class="card pro-card lift">
      <div class="pro-head">
        <div class="avatar">${esc(name[0] || "م")}</div>
        <div>
          <strong>${esc(name)} ${verifiedBadge}</strong>
          <div class="meta-row"><span class="job-tag">${esc(pro.job || "حرفي")}</span><span class="city-tag">${esc(pro.city || "غير محدد")}</span></div>
        </div>
      </div>
      <div class="meta">
        <span>${esc(pro.address || "")}</span>
        ${pro.rating ? `<span class="stars-display">${"★".repeat(Number(pro.rating))}${"☆".repeat(5 - Number(pro.rating))}</span>${Number(pro.rating) >= 4 ? '<span class="recommended-badge">موصى به</span>' : ""}` : ""}
      </div>
      <div class="card-actions">
        <button class="btn primary" data-action="call" data-id="${esc(pro.id)}" data-value="${esc(pro.phone)}">${t("callBtn")}</button>
        <button class="btn green" data-action="whatsapp" data-id="${esc(pro.id)}" data-value="${esc(pro.whatsapp || pro.phone)}">${t("whatsappBtn")}</button>
        <button class="btn icon light" data-action="toggleFav" data-id="${esc(pro.id)}">${fav ? "❌" : "👍"}</button>
      </div>
      ${state.user ? `<button class="btn ghost" data-action="reviewPro" data-id="${esc(pro.id)}" data-value="${esc(pro.whatsapp || pro.phone)}" data-name="${esc(name)}">تقييم و إرسال ملاحظات</button>` : ""}
    </article>`;
}

function offlineNotice() {
  return state.isOnline ? "" : `<section class="offline-banner">${t("offlineBanner")}</section>`
}

function historyPage() {
  const rows = state.history.map(id => allPros().find(p => p.id === id)).filter(Boolean);
  return pageList(t("navHistory"), rows, t("emptyHistory"));
}

function favoritePage() {
  const rows = state.favorites.map(id => allPros().find(p => p.id === id)).filter(Boolean);
  return pageList(t("navFav"), rows, t("emptyFav"));
}

function pageList(title, rows, empty) {
  return `<main class="page grid fade-in"><h2 class="section-title">${title}</h2><section class="grid three">${rows.length ? rows.map(proCard).join("") : `<div class="empty">${empty}</div>`}</section></main>`;
}

function accountPage() {
  const u = state.user;
  const langCodes = Object.keys(LANGUAGES);
  return `
    <main class="page grid two fade-in">
      <section class="panel account-card">
        <h2 class="section-title">${t("settingsTitle")}</h2>
        <h3 class="section-subtitle">${t("accountSection")}</h3>
        ${state.editingAccount ? accountForm(u) : accountInfo(u)}
      </section>
      <section class="panel form settings-card">
        <h2 class="section-title">${t("languageSection")}</h2>
        <div class="lang-options">${langCodes.map(code => `
          <button class="btn ${state.lang === code ? "primary" : "ghost"}" data-action="setLang" data-value="${code}">${LANGUAGES[code]}</button>
        `).join("")}</div>
        <hr>
        <button class="btn ghost" data-action="helpWhatsapp">مساعدة و إرسال ملاحظات</button>
        <hr>
        <h3 class="section-subtitle">${t("accountSection")}</h3>
        <button class="btn primary" data-action="editAccount">${t("editInfoBtn")}</button>
        <div class="danger-zone">
          <button class="btn danger" data-action="logout">${t("logoutBtn")}</button>
          <button class="btn danger solid" data-action="deleteAccount">${t("deleteBtn")}</button>
        </div>
      </section>
    </main>`;
}

function accountInfo(u) {
  return `
    <div class="profile-head">
      <div class="avatar big">${esc(displayName(u)[0] || "م")}</div>
      <div>
        <strong>${esc(displayName(u))}</strong>
        <p class="muted">${u.role === "pro" ? `@${esc(u.username || "")}` : "زبون"}</p>
      </div>
    </div>
    <div class="info-list">
      <p><span>الهاتف:</span> ${esc(u.phone || "غير محدد")}</p>
      ${u.role === "pro" ? `<p><span>واتساب:</span> ${esc(u.whatsapp || "غير محدد")}</p>` : ""}
      <p><span>المدينة:</span> ${esc(u.city || "غير محدد")}</p>
      ${u.role === "pro" ? `<p><span>الحرفة:</span> ${esc(u.job || "غير محدد")}</p><p><span>التحقق:</span> ${u.verified ? "معتمد" : u.verificationStatus === "pending" ? "قيد المراجعة" : "تقليدي"}</p>` : ""}
    </div>`;
}

function accountForm(u) {
  return `
    <form id="account-form" class="form">
      <div class="field"><label>الاسم الكامل</label><input name="fullName" value="${esc(displayName(u))}" required></div>
      <div class="field"><label>الهاتف</label><input name="phone" value="${esc(u.phone || "")}" inputmode="tel" required></div>
      <div class="field"><label>المدينة</label><input name="city" list="account-cities" value="${esc(u.city || "")}" required></div>
      <datalist id="account-cities">${CITIES.map(city => `<option value="${city}"></option>`).join("")}</datalist>
      ${u.role === "pro" ? `<div class="field"><label>واتساب</label><input name="whatsapp" value="${esc(u.whatsapp || "")}" inputmode="tel" required></div>
      <div class="field"><label>الحرفي</label><select name="job">${JOBS.map(j => `<option ${u.job === j ? "selected" : ""}>${j}</option>`).join("")}</select></div>
      <div class="field"><label>العنوان</label><input name="address" value="${esc(u.address || "")}" required></div>` : ""}
      <div class="actions inline">
        <button class="btn primary" type="button" data-action="saveAccount">حفظ التعديلات</button>
        <button class="btn ghost" type="button" data-action="cancelEdit">إلغاء</button>
      </div>
    </form>`;
}

function requestsPage() {
  const myRequests = state.requests.filter(r => r.proId === state.user.id);
  return `
    <main class="page grid fade-in">
      <h2 class="section-title">الطلبات</h2>
      ${myRequests.length ? myRequests.map(r => `
        <article class="panel lift request-card">
          <strong>${esc(r.clientName)}</strong>
          <p class="muted">رقم الهاتف: ${esc(r.clientPhone)}</p>
          <p>طلب خدمة ${esc(r.job)} في ${esc(r.city)}</p>
          <div class="field"><label>الملاحظات</label><textarea name="requestNote:${esc(r.id)}">${esc(r.note || "")}</textarea></div>
          <button class="btn primary" data-action="saveRequestNote" data-id="${esc(r.id)}">حفظ الملاحظات</button>
        </article>`).join("") : `<div class="empty">لا يوجد طلب جديد حاليا.</div>`}
    </main>`;
}

function notesPage() {
  return `
    <main class="page fade-in">
      <section class="panel form">
        <h2 class="section-title">دفتر الملاحظات</h2>
        <div class="field"><textarea name="notes">${esc(state.notes)}</textarea></div>
        <button class="btn primary" data-action="saveNotes">حفظ الملاحظات</button>
      </section>
    </main>`;
}

async function saveAccount() {
  const form = document.querySelector("#account-form");
  const updated = normalizeUser({
    ...state.user,
    fullName: form.fullName.value.trim(),
    phone: form.phone.value.trim(),
    city: form.city.value.trim(),
    whatsapp: form.whatsapp?.value.trim() || state.user.whatsapp,
    job: form.job?.value || state.user.job,
    address: form.address?.value.trim() || state.user.address
  });
  if (!updated.fullName || !updated.phone || !updated.city) return fail("لم يتم ملء المعلومات الضرورية.");
  if (!CITIES.includes(updated.city)) return fail("يجب اختيار مدينة من القائمة.");
  if (updated.role === "pro") {
    try {
      if (!(await initFirebase())) return false;
      await updateRemoteUser(updated);
    } catch (error) {
      return showError("تعذر حفظ التعديلات في Firebase.", error);
    }
  } else {
    save("mallem_client", updated);
  }
  state.user = updated;
  save("mallem_user", updated);
  state.editingAccount = false;
  toast("تم حفظ التعديلات.");
  render();
  return true;
}

async function deleteAccount() {
  if (!confirm("هل أنت متأكد من أنك تريد حذف الحساب؟ لن تستطيع استعادته")) return;
  if (state.user?.role === "pro") {
    try {
      if (!(await initFirebase())) return false;
      await deleteRemoteUser(state.user);
      if (auth?.currentUser) await deleteUser(auth.currentUser);
    } catch (error) {
      return showError("حساب", error);
    }
  } else {
    remove("mallem_client");
  }
  logout();
  toast("تم حذف الحساب.");
  return true;
}

async function logout() {
  if (auth?.currentUser) await signOut(auth).catch((error) => console.warn("Firebase sign out failed.", error));
  state.user = null;
  remove("mallem_user");
  setScreen("welcome");
}

function filteredPros() {
  const q = state.filters.search.trim().toLowerCase();
  const userCity = state.user?.city?.trim() || "";
  return allPros()
    .filter(pro => {
      const text = `${displayName(pro)} ${pro.username || ""} ${pro.job || ""} ${pro.city || ""} ${pro.address || ""}`.toLowerCase();
      return pro.status !== "blocked"
        && (!q || text.includes(q))
        && (!state.filters.city || pro.city === state.filters.city)
        && (state.filters.job === DEFAULT_JOB_FILTER || pro.job === state.filters.job);
    })
    .sort((a, b) => {
      if (!userCity) return 0;
      const aCity = (a.city || "").trim() === userCity ? 0 : 1;
      const bCity = (b.city || "").trim() === userCity ? 0 : 1;
      return aCity - bCity;
    });
}

function allPros() {
  return state.users.filter(u => u?.role === "pro");
}

function toggleFavorite(id) {
  state.favorites = state.favorites.includes(id) ? state.favorites.filter(x => x !== id) : [...state.favorites, id];
  save("mallem_favorites", state.favorites);
  render();
}

function registerContact(id, callback) {
  if (id) {
    state.history = [id, ...state.history.filter(x => x !== id)].slice(0, 30);
    save("mallem_history", state.history);
  }
  callback();
}

async function createRequest(id) {
  const pro = allPros().find(p => p.id === id);
  if (!pro) return fail("هذا الحرفي غير متوفر.");
  const request = {
    id: crypto.randomUUID(),
    proId: id,
    clientId: state.user.id,
    clientName: displayName(state.user),
    clientPhone: state.user.phone,
    city: state.user.city,
    job: pro.job,
    createdAt: new Date().toISOString()
  };
  state.requests.push(request);
  save("mallem_requests", state.requests);
  try {
    if (await initFirebase()) {
      const remote = await addDoc(collection(db, REQUESTS_COLLECTION), { ...request, serverCreatedAt: serverTimestamp() });
      request.docId = remote.id;
      save("mallem_requests", state.requests);
    }
  } catch (error) {
    return showError("تعذر إنشاء الطلب في Firebase.", error);
  }
  toast("تم إنشاء الطلب للحرفي.");
  render();
  return true;
}

function saveNotes() {
  save("mallem_notes", state.notes);
  toast("تم حفظ الملاحظات.");
}

function updateRequestNoteDraft(id, note) {
  state.requests = state.requests.map(request => request.id === id ? { ...request, note } : request);
}

async function saveRequestNote(id) {
  const request = state.requests.find(item => item.id === id);
  if (!request) return fail("الطلب غير متوفر.");
  save("mallem_requests", state.requests);
  if (request.docId) {
    try {
      if (await initFirebase()) await updateDoc(doc(db, REQUESTS_COLLECTION, request.docId), { note: request.note || "", updatedAt: serverTimestamp() });
    } catch (error) {
      return showError("تعذر حفظ ملاحظة الطلب في Firebase.", error);
    }
  }
  toast("تم حفظ ملاحظات الطلب.");
  return true;
}

async function syncUsers(options = {}) {
  if (!db) return false;
  try {
    const [snapshot, blacklistSnapshot] = await Promise.all([
      getDocs(collection(db, USERS_COLLECTION)),
      getDocs(collection(db, "blacklist"))
    ]);
    state.users = snapshot.docs.map(item => normalizeUser({ ...item.data(), docId: item.id, id: item.data().id || item.id })).filter(Boolean);
    save("mallem_users", state.users);
    const blacklist = blacklistSnapshot.docs.map(item => ({ ...item.data(), docId: item.id }));
    state._blacklist = blacklist;
    if (state.user) {
      const blocked = blacklist.find(b => normalizeUsername(b.username) === normalizeUsername(state.user.username));
      if (blocked) {
        state.blocked = { reason: blocked.reason || t("blockedNoReason"), at: blocked.blacklistedAt };
        save("mallem_blocked", state.blocked);
      }
    }
    return true;
  } catch (error) {
    if (options.silent) {
      console.error("حساب", error);
    } else {
      showError("حساب", error);
    }
    return false;
  }
}

async function syncRequests() {
  if (!db) return;
  try {
    const snapshot = await getDocs(collection(db, REQUESTS_COLLECTION));
    state.requests = snapshot.docs.map(item => ({ ...item.data(), docId: item.id, id: item.data().id || item.id }));
    save("mallem_requests", state.requests);
  } catch (error) {
    console.error("Could not read requests from Firebase.", error);
  }
}

async function findRemoteUserByUsername(username) {
  if (!db) throw new Error("Firestore is not initialized.");
  const snapshot = await getDocs(query(collection(db, USERS_COLLECTION), where("usernameLower", "==", normalizeUsername(username))));
  if (!snapshot.empty) return normalizeUser({ ...snapshot.docs[0].data(), docId: snapshot.docs[0].id });
  const allUsers = await getDocs(collection(db, USERS_COLLECTION));
  const match = allUsers.docs.find(item => normalizeUsername(item.data().username) === normalizeUsername(username));
  return match ? normalizeUser({ ...match.data(), docId: match.id }) : null;
}

async function findRemoteUserByUid(uid) {
  if (!db || !uid) return null;
  const snapshot = await getDocs(query(collection(db, USERS_COLLECTION), where("uid", "==", uid)));
  return snapshot.empty ? null : normalizeUser({ ...snapshot.docs[0].data(), docId: snapshot.docs[0].id });
}

async function updateRemoteUser(user) {
  const payload = { ...forFirestore(user), usernameLower: normalizeUsername(user.username), updatedAt: serverTimestamp() };
  if (user.docId) {
    await updateDoc(doc(db, USERS_COLLECTION, user.docId), payload);
  } else {
    const remote = await findRemoteUserByUsername(user.username);
    if (!remote?.docId) throw new Error("Craftsman document was not found in Firebase.");
    await updateDoc(doc(db, USERS_COLLECTION, remote.docId), payload);
    user.docId = remote.docId;
  }
  state.users = state.users.map(item => item.id === user.id ? user : item);
  save("mallem_users", state.users);
}

async function deleteRemoteUser(user) {
  if (user.docId) {
    await deleteDoc(doc(db, USERS_COLLECTION, user.docId));
    return;
  }
  const remote = await findRemoteUserByUsername(user.username);
  if (!remote?.docId) throw new Error("Craftsman document was not found in Firebase.");
  await deleteDoc(doc(db, USERS_COLLECTION, remote.docId));
}

function sendDiploma() {
  window.open(`https://wa.me/${WHATSAPP_DIPLOMA_NUMBER}`, "_blank");
}

function setScreen(screen, updateHash = true) {
  state.screen = screen;
  if (updateHash && ["home", "history", "favorite", "account", "requests", "notes"].includes(screen)) location.hash = screen;
  syncThenRender();
}

function normalizeUser(user) {
  if (!user) return null;
  return {
    ...user,
    role: user.role || "client",
    fullName: user.fullName || user.name || "",
    username: user.username || "",
    usernameLower: user.usernameLower || normalizeUsername(user.username),
    phone: normalizeLocalPhone(user.phone),
    whatsapp: normalizeLocalPhone(user.whatsapp || ""),
    accreditationLevel: user.accreditationLevel || "",
    hasDiploma: Boolean(user.hasDiploma),
    verified: Boolean(user.verified),
    verificationStatus: user.verificationStatus || ""
  };
}

function normalizeUsername(username) {
  return String(username || "").trim().toLowerCase();
}

function usernameToAuthEmail(username) {
  const localPart = normalizeUsername(username)
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/^\.+|\.+$/g, "")
    .replace(/\.\.+/g, ".");
  if (!localPart) throw new Error("Invalid username for Firebase Auth email mapping.");
  return `${localPart}@mallem.com`;
}

function normalizeLocalPhone(phone) {
  return String(phone || "").replace(/\s|-/g, "").replace(/^\+212/, "0");
}

function displayName(user) {
  return user?.fullName || user?.username || "مستخدم منصة معلم";
}

function whatsappLink(phone) {
  const normalized = String(phone || "").replace(/\D/g, "").replace(/^0/, "212");
  return `https://wa.me/${normalized}`;
}

function forFirestore(data) {
  const out = {};
  for (const [key, value] of Object.entries(data || {})) {
    if (value !== undefined) out[key] = value;
  }
  return out;
}

async function hashPassword(password) {
  const enc = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function getAdminCredsFirebase() {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, ADMIN_COLLECTION, ADMIN_DOC_ID));
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
}

function firebaseMessage(error) {
  const code = error?.code || "";
  const details = error?.message || String(error || "");
  if (code === "permission-denied") return `Firebase رفض العنوان:  بسبب الصلاحيات (permission-denied). راجع Firestore Rules. التفاصيل: ${details}`;
  if (code === "unavailable") return `Firebase غير متاح حاليا. الاتصال ضعيف. التفاصيل: ${details}`;
  if (code === "failed-precondition") return `Firebase يحتاج index للحقل غير مصرح. التفاصيل: ${details}`;
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
    const raw = globalThis.localStorage?.getItem(key) ?? memoryStore[key];
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error(`Could not read ${key} from local storage.`, error);
    return fallback;
  }
}

function save(key, value) {
  const raw = JSON.stringify(value);
  memoryStore[key] = raw;
  try {
    globalThis.localStorage?.setItem(key, raw);
  } catch (error) {
    console.error(`Could not save ${key} to local storage.`, error);
  }
}

function remove(key) {
  delete memoryStore[key];
  try {
    globalThis.localStorage?.removeItem(key);
  } catch (error) {
    console.error(`Could not remove ${key} from local storage.`, error);
  }
}

