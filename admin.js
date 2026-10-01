// ========================================
// SUPABASE
// ========================================

const SUPABASE_URL = "https://zpwxmpznlqprzcumuvkj.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_MlvybKumgpht1Q9blEIByw_I1yCyW30";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ========================================
// ELEMENTS
// ========================================

const loginPage = document.getElementById("loginPage");
const adminPage = document.getElementById("adminPage");

const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

const logoutBtn = document.getElementById("logoutBtn");

const pageTitle = document.getElementById("pageTitle");

const servicesList = document.getElementById("servicesList");
const projectsList = document.getElementById("projectsList");
const messagesList = document.getElementById("messagesList");

const servicesCount = document.getElementById("servicesCount");
const projectsCount = document.getElementById("projectsCount");
const messagesCount = document.getElementById("messagesCount");

const settingsForm = document.getElementById("settingsForm");
const settingsMessage = document.getElementById("settingsMessage");

const serviceModal = document.getElementById("serviceModal");
const projectModal = document.getElementById("projectModal");

const serviceForm = document.getElementById("serviceForm");
const projectForm = document.getElementById("projectForm");


// ========================================
// HELPER
// ========================================

function escapeHTML(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showLogin() {
  loginPage.classList.remove("hidden");
  adminPage.classList.add("hidden");
}

function showAdmin() {
  loginPage.classList.add("hidden");
  adminPage.classList.remove("hidden");
}

function showError(message) {
  loginError.textContent = message;
}

function clearError() {
  loginError.textContent = "";
}


// ========================================
// INITIAL SESSION
// ========================================

async function checkSession() {
  const {
    data: { session },
    error
  } = await db.auth.getSession();

  if (error) {
    console.error(error);
    showLogin();
    return;
  }

  if (session) {
    const admin = await checkAdmin(session.user.id);

    if (admin) {
      showAdmin();
      await loadEverything();
    } else {
      await db.auth.signOut();
      showLogin();
      showError("هذا الحساب ليس Admin.");
    }
  } else {
    showLogin();
  }
}


// ========================================
// CHECK ADMIN
// ========================================

async function checkAdmin(userId) {
  const { data, error } = await db
    .from("admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Admin check error:", error);
    return false;
  }

  return !!data;
}


// ========================================
// LOGIN
// ========================================

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  clearError();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  const button = loginForm.querySelector("button");

  button.disabled = true;
  button.textContent = "جاري الدخول...";

  const { data, error } = await db.auth.signInWithPassword({
    email,
    password
  });

  button.disabled = false;
  button.textContent = "تسجيل الدخول";

  if (error) {
    console.error(error);

    showError("البريد الإلكتروني أو كلمة السر غير صحيحة.");
    return;
  }

  const admin = await checkAdmin(data.user.id);

  if (!admin) {
    await db.auth.signOut();
    showError("هذا الحساب غير مصرح له بالدخول إلى لوحة التحكم.");
    return;
  }

  showAdmin();
  await loadEverything();
});


// ========================================
// LOGOUT
// ========================================

logoutBtn.addEventListener("click", async () => {
  await db.auth.signOut();

  adminPage.classList.add("hidden");
  loginPage.classList.remove("hidden");

  loginForm.reset();
  clearError();
});


// ========================================
// NAVIGATION
// ========================================

document.querySelectorAll(".nav-btn").forEach((button) => {

  button.addEventListener("click", async () => {

    const sectionName = button.dataset.section;

    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    document.querySelectorAll(".section").forEach((section) => {
      section.classList.remove("active-section");
    });

    const section = document.getElementById(sectionName);

    if (section) {
      section.classList.add("active-section");
    }

    const titles = {
      dashboard: "الرئيسية",
      settings: "معلومات الموقع",
      services: "الخدمات",
      projects: "المشاريع",
      messages: "الرسائل"
    };

    pageTitle.textContent = titles[sectionName] || "Admin";

    if (sectionName === "settings") {
      await loadSettings();
    }

    if (sectionName === "services") {
      await loadServices();
    }

    if (sectionName === "projects") {
      await loadProjects();
    }

    if (sectionName === "messages") {
      await loadMessages();
    }

  });

});


// ========================================
// LOAD EVERYTHING
// ========================================

async function loadEverything() {

  await Promise.all([
    loadSettings(),
    loadServices(),
    loadProjects(),
    loadMessages()
  ]);

}


// ========================================
// SETTINGS
// ========================================

async function loadSettings() {

  const {
    data,
    error
  } = await db
    .from("site_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Settings error:", error);
    settingsMessage.textContent = "حدث خطأ أثناء تحميل الإعدادات.";
    return;
  }

  if (!data) {
    settingsMessage.textContent = "لم يتم العثور على إعدادات.";
    return;
  }

  document.getElementById("site_name").value =
    data.site_name || "";

  document.getElementById("owner_name").value =
    data.owner_name || "";

  document.getElementById("hero_title").value =
    data.hero_title || "";

  document.getElementById("hero_description").value =
    data.hero_description || "";

  document.getElementById("about_title").value =
    data.about_title || "";

  document.getElementById("about_text").value =
    data.about_text || "";

  document.getElementById("whatsapp").value =
    data.whatsapp || "";

  document.getElementById("email").value =
    data.email || "";

  document.getElementById("instagram_url").value =
    data.instagram_url || "";

  document.getElementById("logo_url").value =
    data.logo_url || "";

  document.getElementById("profile_image_url").value =
    data.profile_image_url || "";

  document.getElementById("show_services").checked =
    data.show_services !== false;

  document.getElementById("show_portfolio").checked =
    data.show_portfolio !== false;

  document.getElementById("show_about").checked =
    data.show_about !== false;

  document.getElementById("show_contact").checked =
    data.show_contact !== false;

}


// ========================================
// SAVE SETTINGS
// ========================================

settingsForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  settingsMessage.textContent = "جاري الحفظ...";

  const {
    data: current
  } = await db
    .from("site_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (!current) {
    settingsMessage.textContent =
      "لم يتم العثور على إعدادات الموقع.";
    return;
  }

  const updates = {

    site_name:
      document.getElementById("site_name").value.trim(),

    owner_name:
      document.getElementById("owner_name").value.trim(),

    hero_title:
      document.getElementById("hero_title").value.trim(),

    hero_description:
      document.getElementById("hero_description").value.trim(),

    about_title:
      document.getElementById("about_title").value.trim(),

    about_text:
      document.getElementById("about_text").value.trim(),

    whatsapp:
      document.getElementById("whatsapp").value.trim(),

    email:
      document.getElementById("email").value.trim(),

    instagram_url:
      document.getElementById("instagram_url").value.trim(),

    logo_url:
      document.getElementById("logo_url").value.trim(),

    profile_image_url:
      document.getElementById("profile_image_url").value.trim(),

    show_services:
      document.getElementById("show_services").checked,

    show_portfolio:
      document.getElementById("show_portfolio").checked,

    show_about:
      document.getElementById("show_about").checked,

    show_contact:
      document.getElementById("show_contact").checked,

    updated_at:
      new Date().toISOString()
  };


  const {
    error
  } = await db
    .from("site_settings")
    .update(updates)
    .eq("id", current.id);

  if (error) {

    console.error(error);

    settingsMessage.textContent =
      "حدث خطأ أثناء الحفظ.";

    return;
  }

  settingsMessage.textContent =
    "✅ تم حفظ التغييرات بنجاح.";

});


// ========================================
// SERVICES
// ========================================

async function loadServices() {

  const {
    data,
    error
  } = await db
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Services error:", error);

    servicesList.innerHTML =
      `<div class="empty-state">حدث خطأ أثناء تحميل الخدمات.</div>`;

    return;
  }

  servicesCount.textContent = data.length;

  if (data.length === 0) {

    servicesList.innerHTML =
      `<div class="empty-state">لا توجد خدمات حاليًا.</div>`;

    return;
  }

  servicesList.innerHTML = data.map((service) => {

    const image = service.image_url
      ? `<img class="item-image" src="${escapeHTML(service.image_url)}" alt="">`
      : `<div class="item-image"></div>`;

    return `
      <article class="item-card">

        ${image}

        <div class="item-content">

          <h3>
            ${escapeHTML(service.icon || "💻")}
            ${escapeHTML(service.title)}
          </h3>

          <p>
            ${escapeHTML(service.description)}
          </p>

          <div class="item-price">
            ${escapeHTML(service.price)}
          </div>

          <div class="item-actions">

            <button
              class="edit-btn"
              onclick="editService('${service.id}')">
              تعديل
            </button>

            <button
              class="delete-btn"
              onclick="deleteService('${service.id}')">
              حذف
            </button>

          </div>

        </div>

      </article>
    `;

  }).join("");

}


// ========================================
// ADD SERVICE
// ========================================

document
  .getElementById("addServiceBtn")
  .addEventListener("click", () => {

    serviceForm.reset();

    document.getElementById("serviceId").value = "";

    document.getElementById("serviceModalTitle").textContent =
      "إضافة خدمة";

    serviceModal.classList.remove("hidden");

  });


// ========================================
// EDIT SERVICE
// ========================================

window.editService = async function (id) {

  const {
    data,
    error
  } = await db
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    alert("تعذر تحميل الخدمة.");
    console.error(error);
    return;
  }

  document.getElementById("serviceId").value =
    data.id;

  document.getElementById("serviceTitle").value =
    data.title || "";

  document.getElementById("serviceDescription").value =
    data.description || "";

  document.getElementById("servicePrice").value =
    data.price || "";

  document.getElementById("serviceIcon").value =
    data.icon || "💻";

  document.getElementById("serviceImage").value =
    data.image_url || "";

  document.getElementById("serviceModalTitle").textContent =
    "تعديل الخدمة";

  serviceModal.classList.remove("hidden");

};


// ========================================
// SAVE SERVICE
// ========================================

serviceForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  const id =
    document.getElementById("serviceId").value;

  const serviceData = {

    title:
      document.getElementById("serviceTitle").value.trim(),

    description:
      document.getElementById("serviceDescription").value.trim(),

    price:
      document.getElementById("servicePrice").value.trim(),

    icon:
      document.getElementById("serviceIcon").value.trim() || "💻",

    image_url:
      document.getElementById("serviceImage").value.trim()

  };


  let error;

  if (id) {

    const result = await db
      .from("services")
      .update(serviceData)
      .eq("id", id);

    error = result.error;

  } else {

    const result = await db
      .from("services")
      .insert([serviceData]);

    error = result.error;

  }


  if (error) {

    console.error(error);
    alert("حدث خطأ أثناء حفظ الخدمة.");
    return;

  }

  closeServiceModal();
  await loadServices();

});


// ========================================
// DELETE SERVICE
// ========================================

window.deleteService = async function (id) {

  const confirmed =
    confirm("هل أنت متأكد من حذف هذه الخدمة؟");

  if (!confirmed) return;

  const {
    error
  } = await db
    .from("services")
    .delete()
    .eq("id", id);

  if (error) {

    console.error(error);
    alert("تعذر حذف الخدمة.");
    return;

  }

  await loadServices();

};


// ========================================
// CLOSE SERVICE MODAL
// ========================================

window.closeServiceModal = function () {

  serviceModal.classList.add("hidden");

};


// ========================================
// PROJECTS
// ========================================

async function loadProjects() {

  const {
    data,
    error
  } = await db
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {

    console.error("Projects error:", error);

    projectsList.innerHTML =
      `<div class="empty-state">حدث خطأ أثناء تحميل المشاريع.</div>`;

    return;
  }

  projectsCount.textContent = data.length;

  if (data.length === 0) {

    projectsList.innerHTML =
      `<div class="empty-state">لا توجد مشاريع حاليًا.</div>`;

    return;
  }


  projectsList.innerHTML = data.map((project) => {

    const image = project.image_url
      ? `<img class="item-image" src="${escapeHTML(project.image_url)}" alt="">`
      : `<div class="item-image"></div>`;

    return `
      <article class="item-card">

        ${image}

        <div class="item-content">

          <h3>
            ${escapeHTML(project.title)}
          </h3>

          <p>
            ${escapeHTML(project.description)}
          </p>

          <div class="item-price">
            ${escapeHTML(project.category || "")}
          </div>

          <div class="item-actions">

            <button
              class="edit-btn"
              onclick="editProject('${project.id}')">
              تعديل
            </button>

            <button
              class="delete-btn"
              onclick="deleteProject('${project.id}')">
              حذف
            </button>

          </div>

        </div>

      </article>
    `;

  }).join("");

}


// ========================================
// ADD PROJECT
// ========================================

document
  .getElementById("addProjectBtn")
  .addEventListener("click", () => {

    projectForm.reset();

    document.getElementById("projectId").value = "";

    document.getElementById("projectModalTitle").textContent =
      "إضافة مشروع";

    projectModal.classList.remove("hidden");

  });


// ========================================
// EDIT PROJECT
// ========================================

window.editProject = async function (id) {

  const {
    data,
    error
  } = await db
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {

    console.error(error);
    alert("تعذر تحميل المشروع.");
    return;

  }

  document.getElementById("projectId").value =
    data.id;

  document.getElementById("projectTitle").value =
    data.title || "";

  document.getElementById("projectDescription").value =
    data.description || "";

  document.getElementById("projectCategory").value =
    data.category || "";

  document.getElementById("projectImage").value =
    data.image_url || "";

  document.getElementById("projectUrl").value =
    data.project_url || "";

  document.getElementById("projectModalTitle").textContent =
    "تعديل المشروع";

  projectModal.classList.remove("hidden");

};


// ========================================
// SAVE PROJECT
// ========================================

projectForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  const id =
    document.getElementById("projectId").value;

  const projectData = {

    title:
      document.getElementById("projectTitle").value.trim(),

    description:
      document.getElementById("projectDescription").value.trim(),

    category:
      document.getElementById("projectCategory").value.trim(),

    image_url:
      document.getElementById("projectImage").value.trim(),

    project_url:
      document.getElementById("projectUrl").value.trim()

  };


  let error;


  if (id) {

    const result = await db
      .from("projects")
      .update(projectData)
      .eq("id", id);

    error = result.error;

  } else {

    const result = await db
      .from("projects")
      .insert([projectData]);

    error = result.error;

  }


  if (error) {

    console.error(error);
    alert("حدث خطأ أثناء حفظ المشروع.");
    return;

  }

  closeProjectModal();
  await loadProjects();

});


// ========================================
// DELETE PROJECT
// ========================================

window.deleteProject = async function (id) {

  const confirmed =
    confirm("هل أنت متأكد من حذف هذا المشروع؟");

  if (!confirmed) return;

  const {
    error
  } = await db
    .from("projects")
    .delete()
    .eq("id", id);

  if (error) {

    console.error(error);
    alert("تعذر حذف المشروع.");
    return;

  }

  await loadProjects();

};


// ========================================
// CLOSE PROJECT MODAL
// ========================================

window.closeProjectModal = function () {

  projectModal.classList.add("hidden");

};


// ========================================
// MESSAGES
// ========================================

async function loadMessages() {

  const {
    data,
    error
  } = await db
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {

    console.error("Messages error:", error);

    messagesList.innerHTML =
      `<div class="empty-state">حدث خطأ أثناء تحميل الرسائل.</div>`;

    return;
  }

  messagesCount.textContent = data.length;


  if (data.length === 0) {

    messagesList.innerHTML =
      `<div class="empty-state">لا توجد رسائل حاليًا.</div>`;

    return;
  }


  messagesList.innerHTML = data.map((message) => {

    const date = message.created_at
      ? new Date(message.created_at).toLocaleString("fr-DZ")
      : "";

    return `
      <article class="message-card">

        <div class="message-head">

          <div class="message-name">
            ${escapeHTML(message.name)}
          </div>

          <div class="message-date">
            ${escapeHTML(date)}
          </div>

        </div>

        <div class="message-text">
          ${escapeHTML(message.message)}
        </div>

        <div class="message-info">

          ${message.phone
            ? `📱 ${escapeHTML(message.phone)}`
            : ""
          }

          ${message.email
            ? `<br>✉️ ${escapeHTML(message.email)}`
            : ""
          }

        </div>

        <div class="message-actions">

          <button
            class="status-btn"
            onclick="toggleMessageStatus('${message.id}', '${escapeHTML(message.status || "new")}')">

            ${message.status === "read"
              ? "↩️ غير مقروءة"
              : "✅ تمت القراءة"
            }

          </button>

          <button
            class="message-delete"
            onclick="deleteMessage('${message.id}')">

            حذف

          </button>

        </div>

      </article>
    `;

  }).join("");

}


// ========================================
// MESSAGE STATUS
// ========================================

window.toggleMessageStatus = async function (id, currentStatus) {

  const newStatus =
    currentStatus === "read" ? "new" : "read";

  const {
    error
  } = await db
    .from("messages")
    .update({
      status: newStatus
    })
    .eq("id", id);

  if (error) {

    console.error(error);
    alert("تعذر تغيير حالة الرسالة.");
    return;

  }

  await loadMessages();

};


// ========================================
// DELETE MESSAGE
// ========================================

window.deleteMessage = async function (id) {

  const confirmed =
    confirm("هل تريد حذف هذه الرسالة؟");

  if (!confirmed) return;

  const {
    error
  } = await db
    .from("messages")
    .delete()
    .eq("id", id);

  if (error) {

    console.error(error);
    alert("تعذر حذف الرسالة.");
    return;

  }

  await loadMessages();

};


// ========================================
// AUTH STATE
// ========================================

db.auth.onAuthStateChange(async (event, session) => {

  if (event === "SIGNED_OUT") {

    showLogin();
    return;

  }

  if (event === "SIGNED_IN" && session) {

    const admin = await checkAdmin(session.user.id);

    if (admin) {

      showAdmin();
      await loadEverything();

    }

  }

});


// ========================================
// START
// ========================================

checkSession();
