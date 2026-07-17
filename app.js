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

const firebaseConfig = {
  apiKey: "AIzaSyDEf4NV_vg8GYX0IhvdNouT4PR2orhD3So",
  authDomain: "mallem-6b76d.firebaseapp.com",
  projectId: "mallem-6b76d",
  storageBucket: "mallem-6b76d.firebasestorage.app",
  messagingSenderId: "13653837388",
  appId: "1:13653837388:web:ad0cb8ef7e64b5140696e9",
  measurementId: "G-3G72T2Z3Y4"
};

let db = null;
let firebaseReady = false;
let firebaseLoading = null;

const CITIES = [
  "الدار البيضاء","الرباط","فاس","مراكش","طنجة","أكادير","مكناس","وجدة","القنيطرة","تطوان","سلا","تمارة",
  "آسفي","الجديدة","الناظور","خريبكة","بني ملال","تازة","المحمدية","الخميسات","العرائش","القصر الكبير",
  "سطات","برشيد","سيدي سليمان","سيدي قاسم","تاوريرت","جرسيف","الحسيمة","شفشاون","وزان","تارودانت",
  "تزنيت","كلميم","طانطان","العيون","الداخلة","السمارة","بوجدور","طرفاية","الرشيدية","ورزازات",
  "زاكورة","تنغير","ميدلت","إفران","صفرو","الحاجب","أزرو","مولاي يعقوب","تاونات","بولمان",
  "سيدي بنور","اليوسفية","قلعة السراغنة","الصويرة","شيشاوة","الحوز","الرحامنة","بن جرير","الفقيه بن صالح",
  "أزيلال","خنيفرة","قصبة تادلة","وادي زم","أبي الجعد","بنسليمان","بوزنيقة","مديونة","النواصر","الدروة",
  "تيط مليل","الهراويين","عين عودة","الصخيرات","المنصورية","مرتيل","المضيق","الفنيدق","أصيلة","تيفلت",
  "سوق الأربعاء الغرب","مولاي بوسلهام","سيدي يحيى الغرب","أولاد تايمة","أيت ملول","الدشيرة الجهادية",
  "إنزكان","القليعة","بيوكرى","اشتوكة آيت باها","أيت باها","سيدي إفني","أسا","الزاك","فكيك","بوعرفة",
  "بركان","السعيدية","أحفير","زايو","دريوش","ميضار","ابن الطيب","إمزورن","بني بوعياش","تارجيست",
  "كتامة","أجدير","تامسنا","عين حرودة","الوليدية","سبت جزولة","جمعة سحيم","حد السوالم","أولاد عياد",
  "سوق السبت أولاد النمة","دمنات","بزو","مريرت","أجلموس","تاهلة","أكنول","أولاد برحيل","تافراوت",
  "أيت أورير","تحناوت","أمزميز","إمنتانوت","تامنصورت","سيدي رحال","حد كورت","تيسة","غفساي",
  "قرية با محمد","رباط الخير","أرفود","الريصاني","تنجداد","بودنيب","أوفوس","سكورة","أيت بن حدو",
  "قلعة مكونة","أمسمرير","بومالن دادس","محاميد الغزلان","تازارين","أكدز"
];

const JOBS = [
  "كهربائي","بلومبي","صباغ","زلايجي","جباص","نجار","حداد","بناء","ترصيص صحي","مكيفات","ألمنيوم",
  "زجاج","كاميرات مراقبة","إصلاح أجهزة منزلية","تنظيف","حدائق","نقل أثاث","ديكور","رخام","بارابول"
];

const ARABIC_INPUT_PATTERN = "[\\u0600-\\u06FF\\s،.-]+";
const ICONS = { home: "⌂", history: "◷", favorite: "♡", account: "◉", requests: "☷", notes: "✎" };
const memoryStore = {};

const state = {
  screen: "splash", // splash, onboarding, choose_role, register_client, login_pro, register_pro_credentials, register_pro_profile, home, history...
  onboardingIndex: 0,
  user: normalizeCurrentUser(load("mallem_user", null)),
  users: load("mallem_users", []).map(normalizeUser).filter(isModernUser),
  requests: load("mallem_requests", []),
  favorites: load("mallem_favorites", []),
  history: load("mallem_history", []),
  notes: load("mallem_notes", ""),
  isOnline: navigator.onLine !== false,
  editingAccount: false,
  register: {
    role: "", // client or pro
    username: "",
    password: "",
    data: {
      fullName: "",
      phone: "",
      whatsapp: "",
      city: "",
      job: "كهربائي",
      address: "",
      hasDiploma: false,
      terms: false
    }
  },
  filters: { city: "", job: "الكل", search: "" },
  showDiplomaModal: false
};

const app = document.querySelector("#app");
const toastEl = document.querySelector("#toast");

window.addEventListener("hashchange", () => {
  const page = location.hash.replace("#", "");
  if (page && ["home", "history", "favorite", "account", "requests", "notes"].includes(page)) {
    setScreen(page);
  }
});

document.addEventListener("click", (event) => {
  const action = event.target.closest("[data-action]");
  if (!action) return;
  const value = action.dataset.value;
  const id = action.dataset.id;
  
  const actions = {
    welcome: () => setScreen("onboarding"),
    skipOnboarding: () => setScreen("choose_role"),
    nextOnboarding: () => { state.onboardingIndex = Math.min(2, state.onboardingIndex + 1); render(); },
    prevOnboarding: () => { state.onboardingIndex = Math.max(0, state.onboardingIndex - 1); render(); },
    setOnboardingIndex: () => { state.onboardingIndex = parseInt(value); render(); },
    chooseRoleScreen: () => setScreen("choose_role"),
    selectRoleClient: () => { state.register.role = "client"; setScreen("register_client"); },
    selectRolePro: () => { state.register.role = "pro"; setScreen("login_pro"); },
    goToLoginPro: () => setScreen("login_pro"),
    goToRegisterPro: () => {
      state.register.username = "";
      state.register.password = "";
      setScreen("register_pro_credentials");
    },
    backToRegisterCredentials: () => setScreen("register_pro_credentials"),
    submitRegisterClient: () => registerClientSubmit(),
    submitRegisterProCredentials: () => registerProCredentialsSubmit(),
    submitRegisterProProfile: () => registerProProfileSubmit(),
    submitLoginPro: () => {
      const form = document.querySelector("#login-pro-form");
      const u = form.querySelector("[name='username']").value.trim();
      const p = form.querySelector("[name='password']").value.trim();
      loginCraftsman(u, p);
    },
    sendDiploma: () => sendDiplomaWhatsApp(),
    closeDiplomaModal: () => { state.showDiplomaModal = false; render(); },
    logout: () => logout(),
    deleteAccount: () => deleteAccount(),
    editAccount: () => { state.editingAccount = true; render(); },
    cancelEdit: () => { state.editingAccount = false; render(); },
    saveAccount: () => saveAccount(),
    home: () => setScreen("home"),
    history: () => setScreen("history"),
    favorite: () => setScreen("favorite"),
    account: () => setScreen("account"),
    requests: () => setScreen("requests"),
    notes: () => setScreen("notes"),
    toggleFav: () => toggleFavorite(id),
    call: () => registerContact(id, () => window.location.href = `tel:${value}`),
    whatsapp: () => registerContact(id, () => window.open(`https://wa.me/212${value.replace(/^0/, "")}`, "_blank")),
    request: () => createRequest(id),
    saveNotes: () => saveNotes(),
    saveRequestNote: () => saveRequestNote(id),
    filterJob: () => { state.filters.job = value; render(); },
    clearFilters: () => { state.filters = { city: "", job: "الكل", search: "" }; render(); }
  };

  const result = actions[action.dataset.action]?.();
  if (result?.catch) {
    result.catch((error) => {
      console.error(error);
      fail("وقع خطأ غير متوقع. رجع جرّب مرة أخرى.");
    });
  }
});

document.addEventListener("input", (event) => {
  const el = event.target;
  if (!el.name) return;
  if (el.name === "search") state.filters.search = el.value;
  if (el.name === "cityFilter") state.filters.city = el.value;
  if (el.name === "notes") state.notes = el.value;
  if (el.name?.startsWith("requestNote:")) updateRequestNoteDraft(el.name.replace("requestNote:", ""), el.value);
  if (el.closest("#register-client-form") || el.closest("#register-pro-profile-form")) {
    state.register.data[el.name] = el.type === "checkbox" ? el.checked : el.value;
  }
  if (state.screen === "home") render();
});

document.addEventListener("submit", (event) => {
  event.preventDefault();
});

init();

async function init() {
  purgeLegacyLocalAccounts();
  registerOfflineCache();
  bindNetworkStatus();
  render();

  // Splash Screen Display
  setTimeout(() => {
    if (state.user) {
      setScreen("home");
    } else {
      setScreen("onboarding");
    }
  }, 2200);

  if (!state.isOnline) toast("ما كاينش اتصال إنترنت. تقدر تستعمل المعلومات المحفوظة فالجهاز.");
  initFirebase().then((ready) => {
    if (ready) syncUsers().then(() => render());
  });
}

function registerOfflineCache() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("service-worker.js").catch((error) => {
    console.warn("Offline cache registration failed.", error);
  });
}

function bindNetworkStatus() {
  window.addEventListener("online", () => {
    state.isOnline = true;
    toast("رجّع الاتصال بالإنترنت.");
    initFirebase().then((ready) => {
      if (ready) syncUsers().then(() => render());
    });
    render();
  });
  window.addEventListener("offline", () => {
    state.isOnline = false;
    toast("ما كاينش اتصال إنترنت. الصفحة خدامة بالمعلومات المحفوظة فالجهاز.");
    render();
  });
}

async function initFirebase() {
  if (firebaseReady) return true;
  if (!state.isOnline) return false;
  if (firebaseLoading) return firebaseLoading;
  firebaseLoading = (async () => {
    try {
      const [appModule, firestoreModule] = await Promise.all([
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js")
      ]);
      ({ initializeApp } = appModule);
      ({ getFirestore, collection, addDoc, deleteDoc, doc, getDocs, query, updateDoc, where, serverTimestamp } = firestoreModule);

      const firebaseApp = initializeApp(firebaseConfig);
      db = getFirestore(firebaseApp);
      firebaseReady = true;
      return true;
    } catch (error) {
      console.warn("Firebase unavailable, local mode is active.", error);
      firebaseLoading = null;
      return false;
    }
  })();
  return firebaseLoading;
}

function render() {
  const publicScreens = ["splash", "onboarding", "choose_role", "register_client", "login_pro", "register_pro_credentials", "register_pro_profile"];
  if (!state.user && !publicScreens.includes(state.screen)) {
    state.screen = "onboarding";
  }
  
  let html = "";
  if (publicScreens.includes(state.screen)) {
    if (state.screen === "splash") html = renderSplash();
    else if (state.screen === "onboarding") html = renderOnboarding();
    else if (state.screen === "choose_role") html = renderChooseRole();
    else if (state.screen === "register_client") html = renderRegisterClient();
    else if (state.screen === "login_pro") html = renderLoginPro();
    else if (state.screen === "register_pro_credentials") html = renderRegisterProCredentials();
    else if (state.screen === "register_pro_profile") html = renderRegisterProProfile();
  } else {
    html = renderPrivate();
  }
  
  app.innerHTML = html + renderDiplomaModal();
}

function renderSplash() {
  return `
    <main class="welcome splash-bg">
      <div class="splash-box pop">
        <img src="icon.png" alt="Mallem" class="splash-logo" onerror="this.style.display='none'">
        <h1 class="splash-title">مَعْلَم</h1>
        <p class="splash-tagline">وسيطك المغربي الموثوق للحرف والخدمات</p>
        <div class="splash-spinner"></div>
      </div>
    </main>
  `;
}

function renderOnboarding() {
  const slides = [
    {
      title: "مرحباً بك في منصة معلّم ⚡",
      desc: "الوسيط المغربي الموثوق والأسرع اللي كيربطك مع أحسن الصنايعية والحرفيين فمدينتك فثواني معدودة وبلا تعب.",
      illustration: `
        <div class="illust-container">
          <div class="tool-circle main-pulse">🛠️</div>
          <div class="tool-circle small-pulse t1">⚡</div>
          <div class="tool-circle small-pulse t2">👤</div>
          <div class="tool-circle small-pulse t3">✨</div>
        </div>
      `
    },
    {
      title: "تواصل مباشر وسريع 💬",
      desc: "شوف بروفايل المعلم، تصفح التقييمات والديبلومات الموثقة، وتواصل معاه مباشرة وبكل سهولة عبر واتساب أو الهاتف.",
      illustration: `
        <div class="illust-container">
          <div class="tool-circle main-pulse chat-color">💬</div>
          <div class="tool-circle small-pulse t1 phone-color">📞</div>
          <div class="tool-circle small-pulse t2 wa-color">💚</div>
        </div>
      `
    },
    {
      title: "فرص واعدة لكل حرفي 💼",
      desc: "إذا كنت حرفي مهني أو صنايعي، سجل دابا، وثق ديبلومك، وابدأ تلقى طلبات حقيقية وكبر مدخولك وسمعتك فالمنطقة ديالك.",
      illustration: `
        <div class="illust-container">
          <div class="tool-circle main-pulse pro-color">💼</div>
          <div class="tool-circle small-pulse t1 star-color">⭐</div>
          <div class="tool-circle small-pulse t2 cert-color">🎓</div>
        </div>
      `
    }
  ];

  const slide = slides[state.onboardingIndex];
  const isLast = state.onboardingIndex === slides.length - 1;

  return `
    <main class="welcome">
      <section class="welcome-panel pop">
        <button class="skip-btn" data-action="skipOnboarding">تخطي</button>
        <img src="icon.png" alt="Mallem" class="brand-logo" onerror="this.style.display='none'">
        
        <div class="illustration-box">${slide.illustration}</div>
        
        <h1>${slide.title}</h1>
        <p>${slide.desc}</p>
        
        <div class="onboarding-dots">
          ${slides.map((_, i) => `<span class="dot ${i === state.onboardingIndex ? "active" : ""}" data-action="setOnboardingIndex" data-value="${i}"></span>`).join("")}
        </div>
        
        <div class="actions">
          ${isLast 
            ? `<button class="btn primary" data-action="skipOnboarding">ابدأ الآن</button>` 
            : `<button class="btn primary" data-action="nextOnboarding">التالي</button>`}
          ${state.onboardingIndex > 0 ? `<button class="btn ghost" data-action="prevOnboarding">السابق</button>` : ""}
        </div>
      </section>
    </main>
  `;
}

function renderChooseRole() {
  return `
    <main class="welcome">
      <section class="welcome-panel pop" style="width: min(580px, 100%);">
        <img src="icon.png" alt="Mallem" class="brand-logo" onerror="this.style.display='none'">
        <h1>من أنت؟ اختار نوع حسابك</h1>
        <p>اختر الحساب المناسب للبدء في استخدام منصة معلم</p>
        
        <div class="role-grid-md3">
          <div class="role-card-md3" data-action="selectRoleClient">
            <div class="role-icon client-icon">👤</div>
            <h3>أنا زبون (أبحث عن معلم)</h3>
            <p>كنقلب على حرفيين وصنايعية مؤهلين لخدمتي فمدينتي</p>
            <button class="btn-md3-select">اختيار الحساب</button>
          </div>
          
          <div class="role-card-md3" data-action="selectRolePro">
            <div class="role-icon pro-icon">🛠️</div>
            <h3>أنا حرفي (صنايعي)</h3>
            <p>باغي نقدم خدماتي ونوصل لزبناء كثار فمدينتي ونكبر خدمتي</p>
            <button class="btn-md3-select">اختيار الحساب</button>
          </div>
        </div>
        
        <div style="margin-top: 20px;">
          <button class="btn ghost" style="width: 100%;" data-action="welcome">رجوع</button>
        </div>
      </section>
    </main>
  `;
}

function renderRegisterClient() {
  const d = state.register.data;
  return `
    <main class="welcome">
      <section class="welcome-panel pop">
        <img src="icon.png" alt="Mallem" class="brand-logo" onerror="this.style.display='none'">
        <h1>تسجيل حساب زبون</h1>
        <p>المعلومات ديالك كبقى محفوظة غير فالهاتف ديالك ومكتطلعش لـ Firebase</p>
        
        <form id="register-client-form" class="form">
          <div class="field">
            <label>الإسم الكامل</label>
            <input name="fullName" required value="${esc(d.fullName)}" placeholder="الإسم والنسب بالعربية" pattern="${ARABIC_INPUT_PATTERN}" title="كتب بالعربية فقط">
          </div>
          
          <div class="field">
            <label>رقم واتساب</label>
            <input name="whatsapp" inputmode="tel" required value="${esc(d.whatsapp)}" placeholder="06XXXXXXXX">
          </div>
          
          <div class="field">
            <label>المدينة</label>
            <input name="city" list="cities" required value="${esc(d.city)}" placeholder="اختار مدينتك">
            <datalist id="cities">${CITIES.map(city => `<option value="${city}"></option>`).join("")}</datalist>
          </div>
          
          <div class="actions" style="margin-top: 15px;">
            <button class="btn primary" type="button" data-action="submitRegisterClient">حفظ والبدء</button>
            <button class="btn ghost" type="button" data-action="chooseRoleScreen">رجوع</button>
          </div>
        </form>
      </section>
    </main>
  `;
}

function renderLoginPro() {
  return `
    <main class="welcome">
      <section class="welcome-panel pop">
        <img src="icon.png" alt="Mallem" class="brand-logo" onerror="this.style.display='none'">
        <h1>تسجيل دخول الحرفي</h1>
        <p>دخل اسم المستخدم وكلمة المرور باش توصل لحسابك المهني</p>
        
        <form id="login-pro-form" class="form">
          <div class="field">
            <label>اسم المستخدم</label>
            <input name="username" required placeholder="مثال: ahmed_paint" pattern="[a-zA-Z0-9_]+" title="اسم المستخدم يجب أن يحتوي على حروف وأرقام إنجليزية وشرطة سفلية فقط">
          </div>
          
          <div class="field">
            <label>كلمة المرور</label>
            <input name="password" type="password" required placeholder="••••••••">
          </div>
          
          <div class="actions" style="margin-top: 15px;">
            <button class="btn primary" type="button" data-action="submitLoginPro">تسجيل الدخول</button>
            <button class="btn green" type="button" data-action="goToRegisterPro">إنشاء حساب حرفي جديد</button>
            <button class="btn ghost" type="button" data-action="chooseRoleScreen">رجوع</button>
          </div>
        </form>
      </section>
    </main>
  `;
}

function renderRegisterProCredentials() {
  return `
    <main class="welcome">
      <section class="welcome-panel pop">
        <img src="icon.png" alt="Mallem" class="brand-logo" onerror="this.style.display='none'">
        <h1>إنشاء حساب حرفي جديد</h1>
        <p>الخطوة 1 من 2: حدد اسم مستخدم فريد وكلمة مرور آمنة</p>
        
        <form id="register-pro-cred-form" class="form">
          <div class="field">
            <label>اسم المستخدم (يجب أن يكون فريداً بالإنجليزية)</label>
            <input name="username" required value="${esc(state.register.username)}" placeholder="مثال: mohamed_plumber" pattern="[a-zA-Z0-9_]{3,20}" title="يجب أن يتكون من 3 إلى 20 حرفاً إنجليزياً أو أرقاماً أو شرطة سفلية">
          </div>
          
          <div class="field">
            <label>كلمة المرور</label>
            <input name="password" type="password" required value="${esc(state.register.password)}" placeholder="••••••••" minlength="6" title="يجب أن تتكون من 6 أحرف على الأقل">
          </div>
          
          <div class="actions" style="margin-top: 15px;">
            <button class="btn primary" type="button" data-action="submitRegisterProCredentials">متابعة للخطوة التالية</button>
            <button class="btn ghost" type="button" data-action="goToLoginPro">لديك حساب بالفعل؟ سجل دخولك</button>
          </div>
        </form>
      </section>
    </main>
  `;
}

function renderRegisterProProfile() {
  const d = state.register.data;
  return `
    <main class="welcome">
      <section class="welcome-panel pop" style="width: min(600px, 100%);">
        <img src="icon.png" alt="Mallem" class="brand-logo" onerror="this.style.display='none'">
        <h1>الملف المهني للحرفي</h1>
        <p>الخطوة 2 من 2: أكمل معلوماتك المهنية التي ستظهر للزبناء</p>
        
        <form id="register-pro-profile-form" class="form">
          <div class="field">
            <label>الإسم الكامل</label>
            <input name="fullName" required value="${esc(d.fullName)}" placeholder="الإسم والنسب بالعربية" pattern="${ARABIC_INPUT_PATTERN}" title="كتب بالعربية فقط">
          </div>
          
          <div class="grid two">
            <div class="field">
              <label>رقم هاتف الاتصال</label>
              <input name="phone" inputmode="tel" required value="${esc(d.phone)}" placeholder="06XXXXXXXX">
            </div>
            <div class="field">
              <label>رقم واتساب للعمل</label>
              <input name="whatsapp" inputmode="tel" required value="${esc(d.whatsapp)}" placeholder="06XXXXXXXX">
            </div>
          </div>
          
          <div class="grid two">
            <div class="field">
              <label>المدينة</label>
              <input name="city" list="cities" required value="${esc(d.city)}" placeholder="بحث عن المدينة">
            </div>
            <div class="field">
              <label>الحرفة</label>
              <select name="job" required>
                ${JOBS.map(j => `<option value="${j}" ${d.job === j ? "selected" : ""}>${j}</option>`).join("")}
              </select>
            </div>
          </div>
          <datalist id="cities">${CITIES.map(city => `<option value="${city}"></option>`).join("")}</datalist>
          
          <div class="field">
            <label>العنوان السكني أو الحي</label>
            <input name="address" required value="${esc(d.address)}" placeholder="الحي، الشارع بالعربية" pattern="${ARABIC_INPUT_PATTERN}" title="كتب بالعربية فقط">
          </div>
          
          <label class="checkbox">
            <input name="hasDiploma" type="checkbox" ${d.hasDiploma ? "checked" : ""} onchange="window.__toggleRegisterDiploma(this.checked)">
            <span>أنا أملك شهادة ديبلوم مهني</span>
          </label>
          
          <label class="checkbox">
            <input name="terms" type="checkbox" ${d.terms ? "checked" : ""}>
            <span>أوافق على ظهور معلوماتي المهنية وموقعي التقريبي لمستخدمي المنصة.</span>
          </label>
          
          <small class="muted" style="text-align: right; display: block;">عند تفعيل خيار "أملك ديبلوم مهني"، سيطلب منك النظام إرسال إثبات لتوثيق حسابك للحصول على علامة التحقق الذهبية.</small>
          
          <div class="actions" style="margin-top: 15px;">
            <button class="btn green" type="button" data-action="submitRegisterProProfile">إنشاء الحساب والبدء</button>
            <button class="btn ghost" type="button" data-action="backToRegisterCredentials">رجوع للخطوة السابقة</button>
          </div>
        </form>
      </section>
    </main>
  `;
}

function renderDiplomaModal() {
  if (!state.showDiplomaModal) return "";
  return `
    <div class="modal-overlay pop">
      <div class="modal-card">
        <div class="modal-icon">🎓</div>
        <h2>توثيق الحساب بـ ديبلوم مهني</h2>
        <p>لتصبح حرفياً معتمداً وتكسب ثقة الزبناء، يجب عليك إرسال صورة من شهادة ديبلومك المهني ليتم مراجعتها يدوياً من قبل إدارة المنصة.</p>
        <p class="modal-badge-info">بعد الموافقة، سيحصل حسابك على شارة <strong>"معلم معتمد ✓"</strong> الذهبية لتظهر للجميع.</p>
        <div class="modal-actions">
          <button class="btn green" data-action="sendDiploma">إرسال الديبلوم عبر واتساب</button>
          <button class="btn ghost" data-action="closeDiplomaModal">إلغاء</button>
        </div>
      </div>
    </div>`;
}

window.__toggleRegisterDiploma = (checked) => {
  state.register.data.hasDiploma = checked;
  if (checked) {
    state.showDiplomaModal = true;
  }
  render();
};

window.__toggleEditDiploma = (checked) => {
  if (checked) {
    state.showDiplomaModal = true;
  }
  render();
};

function renderPrivate() {
  return `<div class="app-shell">${topbar()}${pageContent()}${bottomNav()}</div>`;
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
    { key: "history", label: "السجل", short: "السجل", icon: ICONS.history },
    { key: "favorite", label: "المفضلة", short: "مفضلة", icon: ICONS.favorite },
    { key: "home", label: "الرئيسية", short: "الرئيسية", icon: ICONS.home },
    { key: "account", label: "الحساب", short: "حساب", icon: ICONS.account }
  ];
  items.push(state.user?.role === "pro"
    ? { key: "requests", label: "الطلبات", short: "طلبات", icon: ICONS.requests }
    : { key: "notes", label: "دفتر الملاحظات", short: "ملاحظات", icon: ICONS.notes });
  return items;
}

function navButtons() {
  return navItems().map(item => `<button class="nav-btn ${state.screen === item.key ? "active" : ""}" data-action="${item.key}">${item.label}</button>`).join("");
}

function bottomNav() {
  return `<nav class="bottom-nav">${navItems().map(item => `
    <button class="${state.screen === item.key ? "active" : ""} ${item.key === "home" ? "home-special" : ""}" data-action="${item.key}" title="${item.label}">
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
          <h2 class="section-title">الحرفيون القريبون منك</h2>
          <p class="muted">قلب بالمدينة والحرفة وتواصل مباشرة مع المعلم المناسب.</p>
        </div>
      </section>
      <section class="panel">
        <div class="searchbar">
          <div class="field"><label>بحث</label><input name="search" value="${esc(state.filters.search)}" placeholder="إسم، حرفة، حي..."></div>
          <div class="field"><label>المدينة</label><input name="cityFilter" list="cities2" value="${esc(state.filters.city)}" placeholder="اختار المدينة"></div>
          <div class="field"><label>الحرفة</label><select onchange="window.__setJob(this.value)">${["الكل", ...JOBS].map(j => `<option ${state.filters.job === j ? "selected" : ""}>${j}</option>`).join("")}</select></div>
          <button class="btn ghost" data-action="clearFilters">مسح</button>
        </div>
        <datalist id="cities2">${CITIES.map(city => `<option value="${city}"></option>`).join("")}</datalist>
      </section>
      <section class="filters">${["الكل", ...JOBS].map(job => `<button class="chip ${state.filters.job === job ? "active" : ""}" data-action="filterJob" data-value="${job}">${job}</button>`).join("")}</section>
      <section class="grid three">${pros.length ? pros.map(proCard).join("") : `<div class="empty">ما لقيناش حرفيين بهاد البحث.</div>`}</section>
    </main>`;
}

function offlineNotice() {
  if (state.isOnline) return "";
  return `<section class="offline-banner">ما كاينش اتصال إنترنت. كتشوف دابا غير المعلومات اللي محفوظة فالجهاز.</section>`;
}

window.__setJob = (job) => { state.filters.job = job; render(); };

function proCard(pro) {
  const fav = state.favorites.includes(pro.id);
  const name = displayName(pro);
  
  let statusBadge = `<span class="badge badge-warn">حرفي تقليدي</span>`;
  if (pro.verificationStatus === "verified" || (pro.hasDiploma && pro.verificationStatus === undefined)) {
    statusBadge = `<span class="badge badge-success">✓ معلم معتمد</span>`;
  } else if (pro.verificationStatus === "pending") {
    statusBadge = `<span class="badge badge-pending">⌛ قيد المراجعة</span>`;
  }

  return `
    <article class="card pro-card lift">
      <div class="pro-head">
        ${pro.avatarUrl ? `<img class="avatar" src="${esc(pro.avatarUrl)}" alt="${esc(name)}">` : `<div class="avatar">${esc(name[0] || "م")}</div>`}
        <div>
          <strong>${esc(name)}</strong>
          <div class="muted small">${esc(pro.job || "حرفي")} في ${esc(pro.city || "غير محدد")}</div>
        </div>
      </div>
      <div class="meta">
        <span>★ ${esc(pro.rating || "جديد")}</span>
        <span>${esc(pro.address || "")}</span>
        ${statusBadge}
      </div>
      <div class="card-actions">
        <button class="btn primary" data-action="call" data-id="${esc(pro.id)}" data-value="${esc(pro.phone)}">اتصال</button>
        <button class="btn green" data-action="whatsapp" data-id="${esc(pro.id)}" data-value="${esc(pro.whatsapp || pro.phone)}">واتساب</button>
        <button class="btn icon light" data-action="toggleFav" data-id="${esc(pro.id)}">${fav ? "♥" : "♡"}</button>
      </div>
      ${state.user?.role === "client" ? `<button class="btn ghost" style="width: 100%; margin-top: 8px;" data-action="request" data-id="${esc(pro.id)}">إرسال طلب خدمة</button>` : ""}
    </article>`;
}

function historyPage() {
  const rows = state.history.map(id => allPros().find(p => p.id === id)).filter(Boolean);
  return pageList("السجل", rows, "مازال ما تواصلتي مع حتى معلم.");
}

function favoritePage() {
  const rows = state.favorites.map(id => allPros().find(p => p.id === id)).filter(Boolean);
  return pageList("المفضلة", rows, "مازال ما زدتي حتى حرفي للمفضلة.");
}

function pageList(title, rows, empty) {
  return `<main class="page grid fade-in"><h2 class="section-title">${title}</h2><section class="grid three">${rows.length ? rows.map(proCard).join("") : `<div class="empty">${empty}</div>`}</section></main>`;
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
          <div class="field">
            <label>الملاحظات</label>
            <textarea name="requestNote:${r.id}" placeholder="زيد أي ملاحظة على هاد الطلب...">${escapeHtml(r.note || "")}</textarea>
          </div>
          <button class="btn primary" data-action="saveRequestNote" data-id="${r.id}">حفظ الملاحظات</button>
        </article>`).join("") : `<div class="empty">ما كاين حتى طلب جديد حاليا.</div>`}
    </main>`;
}

function notesPage() {
  return `
    <main class="page fade-in">
      <section class="panel form">
        <h2 class="section-title">دفتر الملاحظات</h2>
        <div class="field"><textarea name="notes" placeholder="كتب أي ملاحظة بغيتي تحفظها...">${esc(state.notes)}</textarea></div>
        <button class="btn primary" data-action="saveNotes">حفظ الملاحظات</button>
      </section>
    </main>`;
}

function accountPage() {
  const u = state.user;
  return `
    <main class="page grid two fade-in">
      <section class="panel account-card">
        <h2 class="section-title">الحساب</h2>
        ${state.editingAccount ? accountForm(u) : accountInfo(u)}
      </section>
      <section class="panel form settings-card">
        <h2 class="section-title">إعدادات</h2>
        <button class="btn primary" data-action="editAccount">تعديل المعلومات</button>
        <div class="danger-zone">
          <button class="btn danger" data-action="logout">تسجيل الخروج</button>
          <button class="btn danger solid" data-action="deleteAccount">حذف الحساب</button>
        </div>
      </section>
    </main>`;
}

function accountInfo(u) {
  const name = displayName(u);
  
  let statusBadge = "";
  if (u.role === "pro") {
    let stat = `<span class="badge badge-warn">حرفي تقليدي</span>`;
    if (u.verificationStatus === "verified" || (u.hasDiploma && u.verificationStatus === undefined)) {
      stat = `<span class="badge badge-success">✓ معلم معتمد</span>`;
    } else if (u.verificationStatus === "pending") {
      stat = `<span class="badge badge-pending">⌛ قيد المراجعة</span>`;
    }
    statusBadge = `<p><span>حالة التوثيق:</span> ${stat}</p>`;
  }

  return `
    <div class="profile-head">
      ${u.avatarUrl ? `<img class="avatar big" src="${esc(u.avatarUrl)}" alt="${esc(name)}">` : `<div class="avatar big">${esc(name[0] || "م")}</div>`}
      <div>
        <strong>${esc(name)}</strong>
        <p class="muted">${u.role === "pro" ? `حساب حرفي (اسم المستخدم: ${esc(u.username)})` : "حساب زبون"}</p>
        <p class="muted">${u.role === "pro" ? `الحرفة: ${esc(u.job || "غير محدد")}` : ""}</p>
      </div>
    </div>
    <div class="info-list">
      <p><span>الهاتف:</span> ${esc(u.phone || "غير محدد")}</p>
      ${u.role === "pro" ? `<p><span>واتساب:</span> ${esc(u.whatsapp || "غير محدد")}</p>` : ""}
      <p><span>المدينة:</span> ${esc(u.city || "غير محددة")}</p>
      <p><span>العنوان:</span> ${esc(u.address || "غير محدد")}</p>
      ${statusBadge}
    </div>`;
}

function accountForm(u) {
  const name = displayName(u);
  return `
    <form id="account-form" class="form">
      <div class="field"><label>الإسم الكامل</label><input name="fullName" value="${esc(name)}" required pattern="${ARABIC_INPUT_PATTERN}" title="كتب بالعربية فقط"></div>
      
      ${u.role === "pro" ? `
      <div class="field"><label>اسم المستخدم</label><input value="${esc(u.username)}" disabled><small class="muted">اسم المستخدم غير قابل للتعديل.</small></div>
      ` : ""}
      
      <div class="field"><label>رقم الهاتف للتواصل</label><input name="phone" value="${esc(u.phone || "")}" inputmode="tel" required></div>
      
      ${u.role === "pro" ? `
      <div class="field"><label>رقم واتساب</label><input name="whatsapp" value="${esc(u.whatsapp || "")}" inputmode="tel"></div>
      <div class="field"><label>الحرفة</label><select name="job">${JOBS.map(j => `<option ${u.job === j ? "selected" : ""}>${j}</option>`).join("")}</select></div>
      <label class="checkbox">
        <input name="hasDiploma" type="checkbox" ${u.hasDiploma ? "checked" : ""} onchange="window.__toggleEditDiploma(this.checked)">
        <span>أملك شهادة ديبلوم مهني</span>
      </label>
      ` : ""}
      
      <div class="field"><label>المدينة</label><input name="city" list="account-cities" value="${esc(u.city || "")}" required></div>
      <datalist id="account-cities">${CITIES.map(city => `<option value="${city}"></option>`).join("")}</datalist>
      
      <div class="field"><label>العنوان</label><input name="address" value="${esc(u.address || "")}" required pattern="${ARABIC_INPUT_PATTERN}" title="كتب بالعربية فقط"></div>
      
      <div class="actions inline">
        <button class="btn primary" type="button" data-action="saveAccount">حفظ التعديلات</button>
        <button class="btn ghost" type="button" data-action="cancelEdit">إلغاء</button>
      </div>
    </form>`;
}

async function registerClientSubmit() {
  const form = document.querySelector("#register-client-form");
  if (!form.reportValidity()) return;
  const fullName = form.querySelector("[name='fullName']").value.trim();
  const whatsapp = form.querySelector("[name='whatsapp']").value.trim();
  const city = form.querySelector("[name='city']").value.trim();

  if (!fullName || !whatsapp || !city) return fail("يرجى ملء جميع الخانات المطلوبة.");
  if (!CITIES.includes(city)) return fail("الرجاء اختيار مدينة مغربية صالحة من القائمة.");
  if (!isArabicText(fullName)) return fail("الإسم الكامل يجب أن يكتب باللغة العربية فقط.");

  const clientData = {
    id: crypto.randomUUID(),
    fullName,
    phone: whatsapp,
    whatsapp,
    city,
    role: "client",
    createdAt: new Date().toISOString()
  };

  state.user = clientData;
  save("mallem_user", clientData);
  toast("مرحباً بك! تم حفظ حسابك بنجاح.");
  setScreen("home");
}

async function registerProCredentialsSubmit() {
  const form = document.querySelector("#register-pro-cred-form");
  if (!form.reportValidity()) return;
  const username = form.querySelector("[name='username']").value.trim().toLowerCase();
  const password = form.querySelector("[name='password']").value.trim();

  if (username.length < 3) return fail("اسم المستخدم يجب أن يكون من 3 أحرف على الأقل.");
  if (password.length < 6) return fail("كلمة المرور يجب أن تكون من 6 أحرف على الأقل.");

  if (!state.isOnline) return fail("التسجيل يتطلب اتصالاً بالإنترنت للتحقق من اسم المستخدم.");

  toast("جاري التحقق من توفر اسم المستخدم...");
  
  try {
    const isUnique = await checkUsernameUnique(username);
    if (!isUnique) {
      return fail("اسم المستخدم هذا مستعمل بالفعل، يرجى اختيار اسم مستخدم آخر.");
    }
    
    state.register.username = username;
    state.register.password = password;
    
    state.register.data = {
      fullName: "",
      phone: "",
      whatsapp: "",
      city: "",
      job: "كهربائي",
      address: "",
      hasDiploma: false,
      terms: false
    };
    
    setScreen("register_pro_profile");
  } catch (e) {
    console.error(e);
    fail("حدث خطأ أثناء التحقق. يرجى المحاولة لاحقاً.");
  }
}

async function registerProProfileSubmit() {
  const form = document.querySelector("#register-pro-profile-form");
  if (!form.reportValidity()) return;
  
  const fullName = form.querySelector("[name='fullName']").value.trim();
  const phone = form.querySelector("[name='phone']").value.trim();
  const whatsapp = form.querySelector("[name='whatsapp']").value.trim();
  const city = form.querySelector("[name='city']").value.trim();
  const job = form.querySelector("[name='job']").value;
  const address = form.querySelector("[name='address']").value.trim();
  const hasDiploma = form.querySelector("[name='hasDiploma']").checked;
  const terms = form.querySelector("[name='terms']").checked;

  if (!fullName || !phone || !whatsapp || !city || !address) return fail("يرجى ملء جميع الخانات.");
  if (!isArabicText(fullName)) return fail("الإسم الكامل يجب أن يكتب باللغة العربية فقط.");
  if (!isArabicText(address)) return fail("العنوان يجب أن يكتب باللغة العربية فقط.");
  if (!CITIES.includes(city)) return fail("الرجاء اختيار مدينة صالحة من القائمة.");
  if (!terms) return fail("يجب الموافقة على الشروط والأحكام للاستمرار.");

  toast("جاري إنشاء الحساب...");

  const proData = {
    id: crypto.randomUUID(),
    username: state.register.username,
    password: state.register.password,
    fullName,
    phone,
    whatsapp,
    city,
    job,
    address,
    hasDiploma,
    verificationStatus: hasDiploma ? "pending" : "unverified",
    role: "pro",
    rating: 4.5,
    createdAt: new Date().toISOString()
  };

  try {
    await initFirebase();
    const docRef = await addRemote("users", proData);
    proData.docId = docRef?.id;
  } catch (error) {
    console.warn(error);
    toast("تعذر الحفظ في السيرفر، تم الحفظ محلياً.");
  }

  state.users.push(proData);
  save("mallem_users", state.users);
  state.user = proData;
  save("mallem_user", proData);
  
  toast("تهانينا! تم إنشاء حسابك المهني بنجاح.");
  setScreen("home");
}

async function loginCraftsman(username, password) {
  if (!state.isOnline) return fail("يجب أن تكون متصلاً بالإنترنت لتسجيل الدخول.");
  await initFirebase();
  if (!db) return fail("خطأ في الاتصال بقاعدة البيانات.");
  
  toast("جاري التحقق من الحساب...");
  try {
    const q = query(collection(db, "users"), where("username", "==", username.toLowerCase()), where("password", "==", password));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return fail("اسم المستخدم أو كلمة المرور غير صحيحة.");
    }
    const docData = snapshot.docs[0].data();
    const pro = normalizeUser({ ...docData, docId: snapshot.docs[0].id });
    
    // Check Blacklist
    const blacklisted = await checkBlacklist(username);
    if (blacklisted) {
      return fail("هذا الحساب تم حظره من قبل الإدارة لمخالفته الشروط.");
    }

    state.user = pro;
    save("mallem_user", pro);
    
    await syncUsers();
    
    toast("تم تسجيل الدخول بنجاح.");
    setScreen("home");
  } catch (error) {
    console.error(error);
    fail("وقع خطأ أثناء تسجيل الدخول. يرجى المحاولة لاحقاً.");
  }
}

async function checkUsernameUnique(username) {
  if (!db) return true;
  const q = query(collection(db, "users"), where("username", "==", username.trim().toLowerCase()));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) return false;
  
  const isBlacked = await checkBlacklist(username);
  if (isBlacked) return false;
  
  return true;
}

async function checkBlacklist(username) {
  if (!db) return false;
  try {
    const q = query(collection(db, "blacklist"), where("username", "==", username.trim().toLowerCase()));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (e) {
    console.warn(e);
    return false;
  }
}

function sendDiplomaWhatsApp() {
  const name = state.register.data.fullName || state.user?.fullName || "حرفي";
  const username = state.register.username || state.user?.username || "";
  const msg = `السلام عليكم، أنا الحرفي ${name} (اسم المستخدم: ${username})، أريد إرسال صورة ديبلومي المهني لتوثيق حسابي في منصة معلم.`;
  const url = `https://wa.me/212717366507?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
  state.showDiplomaModal = false;
  render();
}

async function saveAccount() {
  const form = document.querySelector("#account-form");
  const formData = new FormData(form);
  const fullName = formData.get("fullName")?.trim();
  const phone = formData.get("phone")?.trim();
  const city = formData.get("city")?.trim();
  const address = formData.get("address")?.trim();

  if (!fullName || !phone || !city || !address) return fail("كمل المعلومات الضرورية.");
  if (!isArabicText(fullName)) return fail("الإسم الكامل خاصو يتكتب بالعربية فقط.");
  if (!isArabicText(address)) return fail("العنوان خاصو يتكتب بالعربية فقط.");
  if (!CITIES.includes(city)) return fail("اختار مدينة من اللائحة.");

  const updated = {
    ...state.user,
    fullName,
    phone,
    city,
    address
  };

  if (state.user.role === "pro") {
    updated.whatsapp = formData.get("whatsapp")?.trim();
    updated.job = formData.get("job");
    const oldHasDiploma = state.user.hasDiploma;
    const newHasDiploma = form.querySelector("[name='hasDiploma']").checked;
    updated.hasDiploma = newHasDiploma;
    
    if (newHasDiploma && !oldHasDiploma) {
      updated.verificationStatus = "pending";
      state.showDiplomaModal = true;
    } else if (!newHasDiploma) {
      updated.verificationStatus = "unverified";
    }
  }

  await persistUser(updated);
  state.user = normalizeUser(updated);
  state.editingAccount = false;
  save("mallem_user", state.user);
  toast("تحفظات التعديلات.");
  render();
}

async function deleteAccount() {
  const ok = confirm("واش متأكد باغي تحذف الحساب؟ هاد العملية مايمكنش ترجعها.");
  if (!ok) return;
  try {
    if (state.user.role === "pro") {
      await deleteRemoteUser(state.user);
    }
  } catch (error) {
    console.warn(error);
    toast("تعذر حذف الحساب من Firebase، تحذف محليا مؤقتا.");
  }
  state.users = state.users.filter(u => u.id !== state.user.id);
  save("mallem_users", state.users);
  remove("mallem_user");
  state.user = null;
  toast("تم حذف الحساب.");
  setScreen("onboarding");
}

function logout() {
  state.user = null;
  remove("mallem_user");
  setScreen("onboarding");
}

function filteredPros() {
  return allPros().filter(pro => {
    const text = `${displayName(pro)} ${pro.job} ${pro.city} ${pro.address}`.toLowerCase();
    const q = state.filters.search.trim().toLowerCase();
    return (!q || text.includes(q))
      && (!state.filters.city || pro.city === state.filters.city)
      && (state.filters.job === "الكل" || pro.job === state.filters.job);
  });
}

function allPros() {
  return state.users.filter(u => isModernUser(u) && u.role === "pro");
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
  if (!pro) return;
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
  state.history = [id, ...state.history.filter(x => x !== id)].slice(0, 30);
  save("mallem_requests", state.requests);
  save("mallem_history", state.history);
  try {
    const remote = await addRemote("requests", request);
    request.docId = remote?.id || request.docId;
    save("mallem_requests", state.requests);
  } catch (error) { console.warn(error); }
  toast("تم إرسال الطلب للحرفي.");
  render();
}

function saveNotes() {
  save("mallem_notes", state.notes);
  toast("تحفظات الملاحظات.");
}

function updateRequestNoteDraft(id, note) {
  state.requests = state.requests.map(request => request.id === id ? { ...request, note } : request);
}

async function saveRequestNote(id) {
  const field = [...document.querySelectorAll("textarea[name^='requestNote:']")].find(item => item.name === `requestNote:${id}`);
  const note = field?.value || "";
  updateRequestNoteDraft(id, note);
  save("mallem_requests", state.requests);
  const request = state.requests.find(item => item.id === id);
  if (request?.docId && db) {
    try {
      await updateDoc(doc(db, "requests", request.docId), { note });
    } catch (error) {
      console.warn(error);
      toast("تحفظات الملاحظات محليا. تعذر الحفظ فـ Firebase.");
      return;
    }
  }
  toast("تحفظات ملاحظات الطلب.");
}

async function syncUsers() {
  if (!db) return;
  try {
    const snapshot = await getDocs(collection(db, "users"));
    const remoteUsers = snapshot.docs.map(item => normalizeUser({ ...item.data(), docId: item.id, id: item.data().id || item.id })).filter(isModernUser);
    const merged = new Map([...state.users, ...remoteUsers].filter(Boolean).map(u => [u.id || u.username, u]));
    state.users = [...merged.values()];
    save("mallem_users", state.users);
    if (state.user) {
      const fresh = state.users.find(u => u.id === state.user.id || (u.username && u.username === state.user.username));
      if (fresh) {
        state.user = fresh;
        save("mallem_user", fresh);
      }
    }
  } catch (error) {
    console.warn("Could not sync users.", error);
  }
}

async function persistUser(user) {
  if (user.role === "client") return; // Client is strictly local, never upload to Firebase!
  const normalized = normalizeUser(user);
  state.users = state.users.map(u => u.id === normalized.id ? normalized : u);
  save("mallem_users", state.users);
  if (!db) return;
  const payload = forFirestore(normalized);
  if (normalized.docId) {
    await updateDoc(doc(db, "users", normalized.docId), payload);
    syncCurrentUserRecord(normalized);
    return;
  }
  const snapshot = await getDocs(query(collection(db, "users"), where("username", "==", normalized.username)));
  if (!snapshot.empty) {
    normalized.docId = snapshot.docs[0].id;
    await updateDoc(doc(db, "users", snapshot.docs[0].id), payload);
    syncCurrentUserRecord(normalized);
    return;
  }
  const created = await addRemote("users", normalized);
  normalized.docId = created?.id;
  state.users = state.users.map(u => u.id === normalized.id ? normalized : u);
  save("mallem_users", state.users);
  syncCurrentUserRecord(normalized);
}

async function addRemote(name, data) {
  if (!db) throw new Error("Firestore is not available.");
  return addDoc(collection(db, name), { ...forFirestore(data), serverCreatedAt: serverTimestamp() });
}

async function deleteRemoteUser(user) {
  if (!db) throw new Error("Firestore is not available.");
  if (user.docId) {
    await deleteDoc(doc(db, "users", user.docId));
    return;
  }
  const snapshot = await getDocs(query(collection(db, "users"), where("username", "==", user.username)));
  await Promise.all(snapshot.docs.map(item => deleteDoc(doc(db, "users", item.id))));
}

function normalizeLocalPhone(phone) {
  return String(phone || "").replace(/\s|-/g, "").replace(/^\+212/, "0");
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isArabicText(value) {
  return /^[\u0600-\u06FF\s،.-]+$/.test(String(value || "").trim());
}

function normalizeUser(user) {
  if (!user) return null;
  const fullName = user.fullName || user.name || user.displayName || "";
  return { ...user, fullName, phone: normalizeLocalPhone(user.phone), whatsapp: normalizeLocalPhone(user.whatsapp || "") };
}

function normalizeCurrentUser(user) {
  const normalized = normalizeUser(user);
  return isModernUser(normalized) ? normalized : null;
}

function isModernUser(user) {
  return Boolean(user && (user.id || user.username || user.role === "client"));
}

function purgeLegacyLocalAccounts() {
  const cleanUsers = load("mallem_users", []).map(normalizeUser).filter(isModernUser);
  save("mallem_users", cleanUsers);
  state.users = cleanUsers;
  if (!isModernUser(state.user)) {
    state.user = null;
    remove("mallem_user");
  }
  state.favorites = state.favorites.filter(id => !String(id).startsWith("seed-"));
  state.history = state.history.filter(id => !String(id).startsWith("seed-"));
  save("mallem_favorites", state.favorites);
  save("mallem_history", state.history);
}

function displayName(user) {
  return user?.fullName || user?.name || "مستخدم معلم";
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function esc(value) {
  return escapeHtml(value);
}

function forFirestore(data) {
  const out = {};
  for (const [key, value] of Object.entries(data || {})) {
    if (value !== undefined) out[key] = value;
  }
  return out;
}

function syncCurrentUserRecord(user) {
  if (!state.user || !user) return;
  if (state.user.id !== user.id && state.user.username !== user.username) return;
  state.user = user;
  save("mallem_user", user);
}

function setScreen(screen) {
  state.screen = screen;
  if (["home", "history", "favorite", "account", "requests", "notes"].includes(screen)) {
    location.hash = screen;
  }
  render();
}

function val(key) {
  return state.register.data[key] ?? "";
}

function fail(message) {
  toast(message);
  return false;
}

function toast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastEl.timer);
  toastEl.timer = setTimeout(() => toastEl.classList.remove("show"), 4200);
}

function load(key, fallback) {
  try {
    const raw = globalThis.localStorage?.getItem(key) ?? memoryStore[key];
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  const raw = JSON.stringify(value);
  memoryStore[key] = raw;
  try { globalThis.localStorage?.setItem(key, raw); } catch { memoryStore[key] = raw; }
}

function remove(key) {
  delete memoryStore[key];
  try { globalThis.localStorage?.removeItem(key); } catch { delete memoryStore[key]; }
}
