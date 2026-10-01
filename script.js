// ========================================
// SUPABASE
// ========================================

const SUPABASE_URL =
  "https://zpwxmpznlqprzcumuvkj.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_MlvybKumgpht1Q9blEIByw_I1yCyW30";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ========================================
// HELPERS
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


function whatsappLink(number) {

  let value = String(number || "")
    .replace(/\D/g, "");

  if (value.startsWith("0")) {
    value = "213" + value.substring(1);
  }

  if (!value.startsWith("213")) {
    value = "213" + value;
  }

  return `https://wa.me/${value}`;
}


// ========================================
// ELEMENTS
// ========================================

const logoText =
  document.getElementById("logoText");

const footerLogo =
  document.getElementById("footerLogo");

const heroTitle =
  document.getElementById("heroTitle");

const heroDescription =
  document.getElementById("heroDescription");

const aboutTitle =
  document.getElementById("aboutTitle");

const aboutName =
  document.getElementById("aboutName");

const aboutText =
  document.getElementById("aboutText");

const aboutWhatsapp =
  document.getElementById("aboutWhatsapp");

const aboutEmail =
  document.getElementById("aboutEmail");

const profileImage =
  document.getElementById("profileImage");

const navWhatsapp =
  document.getElementById("navWhatsapp");

const heroWhatsapp =
  document.getElementById("heroWhatsapp");

const ctaWhatsapp =
  document.getElementById("ctaWhatsapp");

const contactWhatsapp =
  document.getElementById("contactWhatsapp");

const contactEmail =
  document.getElementById("contactEmail");

const contactInstagram =
  document.getElementById("contactInstagram");

const servicesGrid =
  document.getElementById("servicesGrid");

const projectsGrid =
  document.getElementById("projectsGrid");

const contactForm =
  document.getElementById("contactForm");

const contactMessage =
  document.getElementById("contactMessage");

const year =
  document.getElementById("year");


// ========================================
// MOBILE MENU
// ========================================

const menuBtn =
  document.getElementById("menuBtn");

const mobileMenu =
  document.getElementById("mobileMenu");


menuBtn.addEventListener("click", () => {
  mobileMenu.classList.toggle("open");
});


document
  .querySelectorAll("#mobileMenu a")
  .forEach((link) => {

    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
    });

  });


// ========================================
// LOAD SITE SETTINGS
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

    console.error(
      "Settings error:",
      error
    );

    return;

  }


  if (!data) {
    return;
  }


  // Texts
  logoText.textContent =
    data.site_name || "SITE WEB";

  footerLogo.textContent =
    data.site_name || "SITE WEB";

  document.title =
    data.site_name || "Site Web";

  heroTitle.textContent =
    data.hero_title || "";

  heroDescription.textContent =
    data.hero_description || "";

  aboutTitle.textContent =
    data.about_title || "من أنا";

  aboutName.textContent =
    data.owner_name || "";

  aboutText.textContent =
    data.about_text || "";


  // Contact
  const wa =
    data.whatsapp || "";

  const email =
    data.email || "";

  const instagram =
    data.instagram_url || "";


  aboutWhatsapp.textContent = wa;
  aboutEmail.textContent = email;


  const waUrl =
    whatsappLink(wa);


  navWhatsapp.href =
    wa ? waUrl : "#contact";

  heroWhatsapp.href =
    wa ? waUrl : "#contact";

  ctaWhatsapp.href =
    wa ? waUrl : "#contact";

  contactWhatsapp.textContent =
    wa;

  contactWhatsapp.href =
    wa ? waUrl : "#";


  contactEmail.textContent =
    email;

  contactEmail.href =
    email ? `mailto:${email}` : "#";


  contactInstagram.textContent =
    instagram ? "فتح Instagram" : "Instagram";

  contactInstagram.href =
    instagram || "#";


  // Profile image
  if (data.profile_image_url) {

    profileImage.src =
      data.profile_image_url;

  } else {

    profileImage.style.display =
      "none";

  }


  // Visibility
  const servicesSection =
    document.getElementById("services");

  const projectsSection =
    document.getElementById("projects");

  const aboutSection =
    document.getElementById("about");

  const contactSection =
    document.getElementById("contact");


  if (data.show_services === false) {
    servicesSection.style.display = "none";
  }

  if (data.show_portfolio === false) {
    projectsSection.style.display = "none";
  }

  if (data.show_about === false) {
    aboutSection.style.display = "none";
  }

  if (data.show_contact === false) {
    contactSection.style.display = "none";
  }

}


// ========================================
// LOAD SERVICES
// ========================================

async function loadServices() {

  const {
    data,
    error
  } = await db
    .from("services")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order", {
      ascending: true
    })
    .order("created_at", {
      ascending: false
    });


  if (error) {

    console.error(
      "Services error:",
      error
    );

    servicesGrid.innerHTML =
      `<div class="empty">
        حدث خطأ أثناء تحميل الخدمات.
      </div>`;

    return;

  }


  if (!data || data.length === 0) {

    servicesGrid.innerHTML =
      `<div class="empty">
        لا توجد خدمات مضافة حاليًا.
      </div>`;

    return;

  }


  servicesGrid.innerHTML =
    data.map((service) => {

      let imageHTML = "";

      if (service.image_url) {

        imageHTML = `
          <img
            class="service-image"
            src="${escapeHTML(service.image_url)}"
            alt="${escapeHTML(service.title)}"
          >
        `;

      }


      return `
        <article class="service-card">

          ${imageHTML}

          <div class="service-icon">
            ${escapeHTML(service.icon || "💻")}
          </div>

          <h3>
            ${escapeHTML(service.title)}
          </h3>

          <p>
            ${escapeHTML(service.description || "")}
          </p>

          ${
            service.price
              ? `
                <div class="service-price">
                  ${escapeHTML(service.price)}
                </div>
              `
              : ""
          }

        </article>
      `;

    }).join("");

}


// ========================================
// LOAD PROJECTS
// ========================================

async function loadProjects() {

  const {
    data,
    error
  } = await db
    .from("projects")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order", {
      ascending: true
    })
    .order("created_at", {
      ascending: false
    });


  if (error) {

    console.error(
      "Projects error:",
      error
    );

    projectsGrid.innerHTML =
      `<div class="empty">
        حدث خطأ أثناء تحميل المشاريع.
      </div>`;

    return;

  }


  if (!data || data.length === 0) {

    projectsGrid.innerHTML =
      `<div class="empty">
        لا توجد مشاريع مضافة حاليًا.
      </div>`;

    return;

  }


  projectsGrid.innerHTML =
    data.map((project) => {

      const image =
        project.image_url
          ? `
            <img
              class="project-image"
              src="${escapeHTML(project.image_url)}"
              alt="${escapeHTML(project.title)}"
            >
          `
          : `
            <div class="project-image"></div>
          `;


      const link =
        project.project_url
          ? `
            <a
              class="project-link"
              href="${escapeHTML(project.project_url)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              مشاهدة المشروع ↗
            </a>
          `
          : "";


      return `
        <article class="project-card">

          ${image}

          <div class="project-content">

            ${
              project.category
                ? `
                  <div class="project-category">
                    ${escapeHTML(project.category)}
                  </div>
                `
                : ""
            }

            <h3>
              ${escapeHTML(project.title)}
            </h3>

            <p>
              ${escapeHTML(project.description || "")}
            </p>

            ${link}

          </div>

        </article>
      `;

    }).join("");

}


// ========================================
// CONTACT FORM
// ========================================

contactForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    const submitButton =
      document.getElementById("contactSubmit");


    const name =
      document.getElementById("clientName")
        .value
        .trim();

    const phone =
      document.getElementById("clientPhone")
        .value
        .trim();

    const email =
      document.getElementById("clientEmail")
        .value
        .trim();

    const message =
      document.getElementById("clientMessage")
        .value
        .trim();


    if (!name || !phone || !message) {

      contactMessage.textContent =
        "الاسم ورقم الهاتف والرسالة مطلوبة.";

      contactMessage.style.color =
        "#f87171";

      return;

    }


    submitButton.disabled = true;
    submitButton.textContent =
      "جاري الإرسال...";


    const {
      error
    } = await db
      .from("messages")
      .insert([{

        name,
        phone,
        email,
        message,
        status: "new"

      }]);


    submitButton.disabled = false;
    submitButton.textContent =
      "إرسال الرسالة";


    if (error) {

      console.error(
        "Message error:",
        error
      );

      contactMessage.textContent =
        "حدث خطأ. حاول مرة أخرى.";

      contactMessage.style.color =
        "#f87171";

      return;

    }


    contactMessage.textContent =
      "✅ تم إرسال رسالتك بنجاح.";

    contactMessage.style.color =
      "#86efac";


    contactForm.reset();

  }
);


// ========================================
// START
// ========================================

year.textContent =
  new Date().getFullYear();


async function init() {

  await loadSettings();
  await loadServices();
  await loadProjects();

}


init();
