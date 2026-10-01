/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
  "https://zpwxmpznlqprzcumuvkj.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_MlvybKumgpht1Q9blEIByw_I1yCyW30";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


/* =========================================================
   HELPERS
========================================================= */

function escapeHTML(value) {

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function whatsappURL(number) {

  let value =
    String(number || "")
      .replace(/\D/g, "");

  if (
    value.startsWith("0")
  ) {
    value =
      "213" +
      value.substring(1);
  }

  if (
    !value.startsWith("213")
  ) {
    value =
      "213" +
      value;
  }

  return `https://wa.me/${value}`;

}


function setResult(
  element,
  text,
  type = ""
) {

  element.textContent = text;

  element.className =
    `result ${type}`;

}


function openModal(element) {

  element.classList.remove("hidden");

  document.body.classList.add("locked");

}


function closeModal(element) {

  element.classList.add("hidden");

  document.body.classList.remove("locked");

}


/* =========================================================
   DOM
========================================================= */

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

const headerWhatsapp =
  document.getElementById("headerWhatsapp");

const mobileWhatsapp =
  document.getElementById("mobileWhatsapp");

const heroWhatsapp =
  document.getElementById("heroWhatsapp");

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

const year =
  document.getElementById("year");


/* =========================================================
   MOBILE MENU
========================================================= */

const menuBtn =
  document.getElementById("menuBtn");

const mobileMenu =
  document.getElementById("mobileMenu");


menuBtn.addEventListener(
  "click",
  () => {

    mobileMenu.classList.toggle(
      "open"
    );

  }
);


document
  .querySelectorAll(
    "#mobileMenu a"
  )
  .forEach((link) => {

    link.addEventListener(
      "click",
      () => {

        mobileMenu.classList.remove(
          "open"
        );

      }
    );

  });


/* =========================================================
   LOAD SETTINGS
========================================================= */

async function loadPublicSettings() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("site_settings")
      .select("*")
      .limit(1)
      .maybeSingle();


  if (error) {

    console.error(
      "Settings:",
      error
    );

    return;

  }


  if (!data) {
    return;
  }


  /* TEXT */

  logoText.textContent =
    data.site_name ||
    "SITE WEB";

  footerLogo.textContent =
    data.site_name ||
    "SITE WEB";

  document.title =
    data.site_name ||
    "Site Web";


  heroTitle.textContent =
    data.hero_title || "";

  heroDescription.textContent =
    data.hero_description || "";

  aboutTitle.textContent =
    data.about_title ||
    "من أنا";

  aboutName.textContent =
    data.owner_name || "";

  aboutText.textContent =
    data.about_text || "";


  /* CONTACT */

  const whatsapp =
    data.whatsapp || "";

  const email =
    data.email || "";

  const instagram =
    data.instagram_url || "";


  const wa =
    whatsappURL(
      whatsapp
    );


  headerWhatsapp.href =
    whatsapp
      ? wa
      : "#";


  mobileWhatsapp.href =
    whatsapp
      ? wa
      : "#";


  heroWhatsapp.href =
    whatsapp
      ? wa
      : "#";


  contactWhatsapp.textContent =
    whatsapp ||
    "WhatsApp";

  contactWhatsapp.href =
    whatsapp
      ? wa
      : "#";


  aboutWhatsapp.textContent =
    whatsapp;


  contactEmail.textContent =
    email ||
    "Email";

  contactEmail.href =
    email
      ? `mailto:${email}`
      : "#";


  aboutEmail.textContent =
    email;


  contactInstagram.textContent =
    instagram
      ? "فتح Instagram"
      : "Instagram";

  contactInstagram.href =
    instagram ||
    "#";


  /* PROFILE */

  if (
    data.profile_image_url
  ) {

    profileImage.src =
      data.profile_image_url;

    profileImage.style.display =
      "block";

  } else {

    profileImage.style.display =
      "none";

  }


  /* COLORS */

  if (
    data.primary_color
  ) {

    document.documentElement
      .style
      .setProperty(
        "--primary",
        data.primary_color
      );

  }


  if (
    data.secondary_color
  ) {

    document.documentElement
      .style
      .setProperty(
        "--secondary",
        data.secondary_color
      );

  }


  /* VISIBILITY */

  document.getElementById(
    "about"
  ).style.display =
    data.show_about === false
      ? "none"
      : "";


  document.getElementById(
    "services"
  ).style.display =
    data.show_services === false
      ? "none"
      : "";


  document.getElementById(
    "projects"
  ).style.display =
    data.show_portfolio === false
      ? "none"
      : "";


  document.getElementById(
    "contact"
  ).style.display =
    data.show_contact === false
      ? "none"
      : "";

}


/* =========================================================
   SERVICES PUBLIC
========================================================= */

async function loadPublicServices() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("services")
      .select("*")
      .eq("is_visible", true)
      .order(
        "sort_order",
        {
          ascending: true
        }
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(
      "Services:",
      error
    );

    servicesGrid.innerHTML =
      `
        <div class="empty">
          حدث خطأ أثناء تحميل الخدمات.
        </div>
      `;

    return;

  }


  if (
    !data ||
    data.length === 0
  ) {

    servicesGrid.innerHTML =
      `
        <div class="empty">
          لا توجد خدمات مضافة حاليًا.
        </div>
      `;

    return;

  }


  servicesGrid.innerHTML =
    data
      .map((service) => {

        const image =
          service.image_url
            ? `
              <img
                class="service-image"
                src="${escapeHTML(
                  service.image_url
                )}"
                alt="${escapeHTML(
                  service.title
                )}"
              >
            `
            : "";


        return `
          <article class="service-card">

            ${image}

            <div class="service-icon">
              ${escapeHTML(
                service.icon ||
                "💻"
              )}
            </div>

            <h3>
              ${escapeHTML(
                service.title
              )}
            </h3>

            <p>
              ${escapeHTML(
                service.description ||
                ""
              )}
            </p>

            ${
              service.price
                ? `
                  <div class="service-price">
                    ${escapeHTML(
                      service.price
                    )}
                  </div>
                `
                : ""
            }

          </article>
        `;

      })
      .join("");

}


/* =========================================================
   PROJECTS PUBLIC
========================================================= */

async function loadPublicProjects() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("projects")
      .select("*")
      .eq("is_visible", true)
      .order(
        "sort_order",
        {
          ascending: true
        }
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(
      "Projects:",
      error
    );

    projectsGrid.innerHTML =
      `
        <div class="empty">
          حدث خطأ أثناء تحميل المشاريع.
        </div>
      `;

    return;

  }


  if (
    !data ||
    data.length === 0
  ) {

    projectsGrid.innerHTML =
      `
        <div class="empty">
          لا توجد مشاريع مضافة حاليًا.
        </div>
      `;

    return;

  }


  projectsGrid.innerHTML =
    data
      .map((project) => {

        const image =
          project.image_url
            ? `
              <img
                class="project-image"
                src="${escapeHTML(
                  project.image_url
                )}"
                alt="${escapeHTML(
                  project.title
                )}"
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
                href="${escapeHTML(
                  project.project_url
                )}"
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
                      ${escapeHTML(
                        project.category
                      )}
                    </div>
                  `
                  : ""
              }

              <h3>
                ${escapeHTML(
                  project.title
                )}
              </h3>

              <p>
                ${escapeHTML(
                  project.description ||
                  ""
                )}
              </p>

              ${link}

            </div>

          </article>
        `;

      })
      .join("");

}


/* =========================================================
   CONTACT FORM
========================================================= */

const contactForm =
  document.getElementById(
    "contactForm"
  );

const contactResult =
  document.getElementById(
    "contactResult"
  );


contactForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    const button =
      document.getElementById(
        "contactSubmit"
      );


    button.disabled = true;

    button.textContent =
      "جاري الإرسال...";


    const name =
      document
        .getElementById(
          "clientName"
        )
        .value
        .trim();


    const phone =
      document
        .getElementById(
          "clientPhone"
        )
        .value
        .trim();


    const email =
      document
        .getElementById(
          "clientEmail"
        )
        .value
        .trim();


    const message =
      document
        .getElementById(
          "clientMessage"
        )
        .value
        .trim();


    const {
      error
    } =
      await supabaseClient
        .from("messages")
        .insert([{

          name,
          phone,
          email,
          message,
          status: "new"

        }]);


    button.disabled = false;

    button.textContent =
      "إرسال الرسالة";


    if (error) {

      console.error(error);

      setResult(
        contactResult,
        "حدث خطأ أثناء الإرسال.",
        "error"
      );

      return;

    }


    setResult(
      contactResult,
      "✅ تم إرسال الرسالة بنجاح.",
      "success"
    );


    contactForm.reset();

  }
);


/* =========================================================
   ORDER MODAL
========================================================= */

const orderModal =
  document.getElementById(
    "orderModal"
  );


document
  .querySelectorAll(
    ".order-open"
  )
  .forEach((button) => {

    button.addEventListener(
      "click",
      (event) => {

        event.preventDefault();

        mobileMenu.classList.remove(
          "open"
        );

        openModal(
          orderModal
        );

      }
    );

  });


document
  .getElementById(
    "closeOrderModal"
  )
  .addEventListener(
    "click",
    () => {

      closeModal(
        orderModal
      );

    }
  );


const orderForm =
  document.getElementById(
    "orderForm"
  );

const orderResult =
  document.getElementById(
    "orderResult"
  );


orderForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    const submit =
      document.getElementById(
        "orderSubmit"
      );


    submit.disabled = true;

    submit.textContent =
      "جاري إرسال الطلب...";


    const order = {

      full_name:
        document
          .getElementById(
            "orderName"
          )
          .value
          .trim(),

      phone:
        document
          .getElementById(
            "orderPhone"
          )
          .value
          .trim(),

      email:
        document
          .getElementById(
            "orderEmail"
          )
          .value
          .trim(),

      business_name:
        document
          .getElementById(
            "orderBusiness"
          )
          .value
          .trim(),

      business_type:
        document
          .getElementById(
            "orderBusinessType"
          )
          .value
          .trim(),

      website_type:
        document
          .getElementById(
            "orderWebsiteType"
          )
          .value,

      idea:
        document
          .getElementById(
            "orderIdea"
          )
          .value
          .trim(),

      pages:
        document
          .getElementById(
            "orderPages"
          )
          .value
          .trim(),

      features:
        document
          .getElementById(
            "orderFeatures"
          )
          .value
          .trim(),

      budget:
        document
          .getElementById(
            "orderBudget"
          )
          .value,

      deadline:
        document
          .getElementById(
            "orderDeadline"
          )
          .value
          .trim(),

      instagram:
        document
          .getElementById(
            "orderInstagram"
          )
          .value
          .trim(),

      reference_url:
        document
          .getElementById(
            "orderReference"
          )
          .value
          .trim(),

      notes:
        document
          .getElementById(
            "orderNotes"
          )
          .value
          .trim(),

      status: "new"

    };


    const {
      error
    } =
      await supabaseClient
        .from("orders")
        .insert([order]);


    submit.disabled = false;

    submit.textContent =
      "إرسال الطلب 🚀";


    if (error) {

      console.error(error);

      setResult(
        orderResult,
        "حدث خطأ أثناء إرسال الطلب.",
        "error"
      );

      return;

    }


    setResult(
      orderResult,
      "✅ تم إرسال طلبك بنجاح!",
      "success"
    );


    orderForm.reset();

  }
);


/* =========================================================
   ADMIN LOGIN
========================================================= */

const adminLoginModal =
  document.getElementById(
    "adminLoginModal"
  );


const openAdminBtn =
  document.getElementById(
    "openAdminBtn"
  );


const mobileAdminBtn =
  document.getElementById(
    "mobileAdminBtn"
  );


function openAdminLogin() {

  mobileMenu.classList.remove(
    "open"
  );

  openModal(
    adminLoginModal
  );

}


openAdminBtn.addEventListener(
  "click",
  openAdminLogin
);


mobileAdminBtn.addEventListener(
  "click",
  openAdminLogin
);


document
  .getElementById(
    "closeAdminLogin"
  )
  .addEventListener(
    "click",
    () => {

      closeModal(
        adminLoginModal
      );

    }
  );


const adminLoginForm =
  document.getElementById(
    "adminLoginForm"
  );


const adminLoginResult =
  document.getElementById(
    "adminLoginResult"
  );


adminLoginForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    const button =
      document.getElementById(
        "adminLoginButton"
      );


    const password =
      document
        .getElementById(
          "adminPassword"
        )
        .value;


    button.disabled = true;

    button.textContent =
      "جاري الدخول...";


    const {
      data,
      error
    } =
      await supabaseClient.auth
        .signInWithPassword({

          email:
            "ardjoundjalil8@gmail.com",

          password

        });


    button.disabled = false;

    button.textContent =
      "دخول الإدارة";


    if (error) {

      console.error(error);

      setResult(
        adminLoginResult,
        "كلمة المرور غير صحيحة.",
        "error"
      );

      return;

    }


    const isAdmin =
      await checkAdmin(
        data.user.id
      );


    if (!isAdmin) {

      await supabaseClient.auth
        .signOut();


      setResult(
        adminLoginResult,
        "هذا الحساب ليس Admin.",
        "error"
      );

      return;

    }


    closeModal(
      adminLoginModal
    );


    document
      .getElementById(
        "adminPassword"
      )
      .value = "";


    openAdminPanel();

  }
);


/* =========================================================
   CHECK ADMIN
========================================================= */

async function checkAdmin(
  userId
) {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("admins")
      .select("user_id")
      .eq(
        "user_id",
        userId
      )
      .maybeSingle();


  if (error) {

    console.error(
      "Admin:",
      error
    );

    return false;

  }


  return !!data;

}


/* =========================================================
   ADMIN PANEL
========================================================= */

const adminPanel =
  document.getElementById(
    "adminPanel"
  );


function openAdminPanel() {

  adminPanel.classList.remove(
    "hidden"
  );

  document.body.classList.add(
    "locked"
  );

  loadAdminEverything();

}


document
  .getElementById(
    "closeAdminPanel"
  )
  .addEventListener(
    "click",
    () => {

      adminPanel.classList.add(
        "hidden"
      );

      document.body.classList.remove(
        "locked"
      );

    }
  );


/* ADMIN TABS */

document
  .querySelectorAll(
    ".admin-tab"
  )
  .forEach((tab) => {

    tab.addEventListener(
      "click",
      () => {

        const target =
          tab.dataset.adminSection;


        document
          .querySelectorAll(
            ".admin-tab"
          )
          .forEach((item) => {

            item.classList.remove(
              "active"
            );

          });


        tab.classList.add(
          "active"
        );


        document
          .querySelectorAll(
            ".admin-section"
          )
          .forEach((section) => {

            section.classList.remove(
              "active"
            );

          });


        document
          .getElementById(target)
          .classList.add(
            "active"
          );


        if (
          target ===
          "adminSettings"
        ) {
          loadAdminSettings();
        }

        if (
          target ===
          "adminServices"
        ) {
          loadAdminServices();
        }

        if (
          target ===
          "adminProjects"
        ) {
          loadAdminProjects();
        }

        if (
          target ===
          "adminOrders"
        ) {
          loadAdminOrders();
        }

        if (
          target ===
          "adminMessages"
        ) {
          loadAdminMessages();
        }

      }
    );

  });


/* =========================================================
   ADMIN SETTINGS
========================================================= */

async function loadAdminSettings() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("site_settings")
      .select("*")
      .limit(1)
      .maybeSingle();


  if (error) {

    console.error(error);

    return;

  }


  if (!data) {
    return;
  }


  document.getElementById(
    "setSiteName"
  ).value =
    data.site_name || "";


  document.getElementById(
    "setOwnerName"
  ).value =
    data.owner_name || "";


  document.getElementById(
    "setHeroTitle"
  ).value =
    data.hero_title || "";


  document.getElementById(
    "setHeroDescription"
  ).value =
    data.hero_description || "";


  document.getElementById(
    "setAboutTitle"
  ).value =
    data.about_title || "";


  document.getElementById(
    "setWhatsapp"
  ).value =
    data.whatsapp || "";


  document.getElementById(
    "setEmail"
  ).value =
    data.email || "";


  document.getElementById(
    "setInstagram"
  ).value =
    data.instagram_url || "";


  document.getElementById(
    "setAboutText"
  ).value =
    data.about_text || "";


  document.getElementById(
    "setLogo"
  ).value =
    data.logo_url || "";


  document.getElementById(
    "setProfile"
  ).value =
    data.profile_image_url || "";


  document.getElementById(
    "setPrimary"
  ).value =
    data.primary_color ||
    "#7c3aed";


  document.getElementById(
    "setSecondary"
  ).value =
    data.secondary_color ||
    "#06b6d4";


  document.getElementById(
    "setShowAbout"
  ).checked =
    data.show_about !== false;


  document.getElementById(
    "setShowServices"
  ).checked =
    data.show_services !== false;


  document.getElementById(
    "setShowProjects"
  ).checked =
    data.show_portfolio !== false;


  document.getElementById(
    "setShowContact"
  ).checked =
    data.show_contact !== false;

}


document
  .getElementById(
    "settingsForm"
  )
  .addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const result =
        document.getElementById(
          "settingsResult"
        );


      const {
        data: current
      } =
        await supabaseClient
          .from("site_settings")
          .select("id")
          .limit(1)
          .maybeSingle();


      if (!current) {

        setResult(
          result,
          "لم يتم العثور على إعدادات.",
          "error"
        );

        return;

      }


      const updates = {

        site_name:
          document.getElementById(
            "setSiteName"
          ).value.trim(),

        owner_name:
          document.getElementById(
            "setOwnerName"
          ).value.trim(),

        hero_title:
          document.getElementById(
            "setHeroTitle"
          ).value.trim(),

        hero_description:
          document.getElementById(
            "setHeroDescription"
          ).value.trim(),

        about_title:
          document.getElementById(
            "setAboutTitle"
          ).value.trim(),

        whatsapp:
          document.getElementById(
            "setWhatsapp"
          ).value.trim(),

        email:
          document.getElementById(
            "setEmail"
          ).value.trim(),

        instagram_url:
          document.getElementById(
            "setInstagram"
          ).value.trim(),

        about_text:
          document.getElementById(
            "setAboutText"
          ).value.trim(),

        logo_url:
          document.getElementById(
            "setLogo"
          ).value.trim(),

        profile_image_url:
          document.getElementById(
            "setProfile"
          ).value.trim(),

        primary_color:
          document.getElementById(
            "setPrimary"
          ).value.trim(),

        secondary_color:
          document.getElementById(
            "setSecondary"
          ).value.trim(),

        show_about:
          document.getElementById(
            "setShowAbout"
          ).checked,

        show_services:
          document.getElementById(
            "setShowServices"
          ).checked,

        show_portfolio:
          document.getElementById(
            "setShowProjects"
          ).checked,

        show_contact:
          document.getElementById(
            "setShowContact"
          ).checked,

        updated_at:
          new Date().toISOString()

      };


      const {
        error
      } =
        await supabaseClient
          .from("site_settings")
          .update(updates)
          .eq(
            "id",
            current.id
          );


      if (error) {

        console.error(error);

        setResult(
          result,
          "حدث خطأ أثناء الحفظ.",
          "error"
        );

        return;

      }


      setResult(
        result,
        "✅ تم حفظ كل التغييرات.",
        "success"
      );


      await loadPublicSettings();

    }
  );


/* =========================================================
   ADMIN SERVICES
========================================================= */

const adminServicesList =
  document.getElementById(
    "adminServicesList"
  );


async function loadAdminServices() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("services")
      .select("*")
      .order(
        "sort_order",
        {
          ascending: true
        }
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(error);

    adminServicesList.innerHTML =
      `
        <div class="empty">
          حدث خطأ.
        </div>
      `;

    return;

  }


  if (
    !data ||
    data.length === 0
  ) {

    adminServicesList.innerHTML =
      `
        <div class="empty">
          لا توجد خدمات.
        </div>
      `;

    return;

  }


  adminServicesList.innerHTML =
    data
      .map((service) => {

        const image =
          service.image_url
            ? `
              <img
                src="${escapeHTML(
                  service.image_url
                )}"
                alt=""
              >
            `
            : "";


        return `
          <article class="admin-item">

            ${image}

            <div class="admin-item-content">

              <h4>
                ${escapeHTML(
                  service.icon ||
                  "💻"
                )}
                ${escapeHTML(
                  service.title
                )}
              </h4>

              <p>
                ${escapeHTML(
                  service.description ||
                  ""
                )}
              </p>

              <div class="admin-item-price">
                ${escapeHTML(
                  service.price ||
                  ""
                )}
              </div>


              <div class="admin-item-actions">

                <button
                  class="admin-edit"
                  onclick="editService('${service.id}')"
                >
                  تعديل
                </button>

                <button
                  class="admin-delete"
                  onclick="deleteService('${service.id}')"
                >
                  حذف
                </button>

              </div>

            </div>

          </article>
        `;

      })
      .join("");

}


document
  .getElementById(
    "newServiceBtn"
  )
  .addEventListener(
    "click",
    () => {

      document
        .getElementById(
          "serviceForm"
        )
        .reset();


      document.getElementById(
        "serviceId"
      ).value = "";


      document.getElementById(
        "serviceModalTitle"
      ).textContent =
        "إضافة خدمة";


      openModal(
        document.getElementById(
          "serviceEditModal"
        )
      );

    }
  );


window.editService =
  async function(id) {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("services")
        .select("*")
        .eq(
          "id",
          id
        )
        .single();


    if (error) {

      alert(
        "تعذر تحميل الخدمة."
      );

      return;

    }


    document.getElementById(
      "serviceId"
    ).value =
      data.id;


    document.getElementById(
      "serviceTitle"
    ).value =
      data.title || "";


    document.getElementById(
      "serviceDescription"
    ).value =
      data.description || "";


    document.getElementById(
      "servicePrice"
    ).value =
      data.price || "";


    document.getElementById(
      "serviceIcon"
    ).value =
      data.icon || "💻";


    document.getElementById(
      "serviceImage"
    ).value =
      data.image_url || "";


    document.getElementById(
      "serviceModalTitle"
    ).textContent =
      "تعديل الخدمة";


    openModal(
      document.getElementById(
        "serviceEditModal"
      )
    );

  };


document
  .getElementById(
    "serviceForm"
  )
  .addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const id =
        document.getElementById(
          "serviceId"
        ).value;


      const serviceData = {

        title:
          document.getElementById(
            "serviceTitle"
          ).value.trim(),

        description:
          document.getElementById(
            "serviceDescription"
          ).value.trim(),

        price:
          document.getElementById(
            "servicePrice"
          ).value.trim(),

        icon:
          document.getElementById(
            "serviceIcon"
          ).value.trim() ||
          "💻",

        image_url:
          document.getElementById(
            "serviceImage"
          ).value.trim()

      };


      let error;


      if (id) {

        const result =
          await supabaseClient
            .from("services")
            .update(
              serviceData
            )
            .eq(
              "id",
              id
            );

        error =
          result.error;

      } else {

        const result =
          await supabaseClient
            .from("services")
            .insert([
              serviceData
            ]);

        error =
          result.error;

      }


      if (error) {

        console.error(error);

        alert(
          "حدث خطأ أثناء حفظ الخدمة."
        );

        return;

      }


      closeModal(
        document.getElementById(
          "serviceEditModal"
        )
      );


      await loadAdminServices();
      await loadPublicServices();

    }
  );


window.deleteService =
  async function(id) {

    if (
      !confirm(
        "هل تريد حذف هذه الخدمة؟"
      )
    ) {
      return;
    }


    const {
      error
    } =
      await supabaseClient
        .from("services")
        .delete()
        .eq(
          "id",
          id
        );


    if (error) {

      alert(
        "تعذر حذف الخدمة."
      );

      return;

    }


    await loadAdminServices();
    await loadPublicServices();

  };


document
  .getElementById(
    "closeServiceModal"
  )
  .addEventListener(
    "click",
    () => {

      closeModal(
        document.getElementById(
          "serviceEditModal"
        )
      );

    }
  );


/* =========================================================
   ADMIN PROJECTS
========================================================= */

const adminProjectsList =
  document.getElementById(
    "adminProjectsList"
  );


async function loadAdminProjects() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("projects")
      .select("*")
      .order(
        "sort_order",
        {
          ascending: true
        }
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(error);

    adminProjectsList.innerHTML =
      `
        <div class="empty">
          حدث خطأ.
        </div>
      `;

    return;

  }


  if (
    !data ||
    data.length === 0
  ) {

    adminProjectsList.innerHTML =
      `
        <div class="empty">
          لا توجد مشاريع.
        </div>
      `;

    return;

  }


  adminProjectsList.innerHTML =
    data
      .map((project) => {

        const image =
          project.image_url
            ? `
              <img
                src="${escapeHTML(
                  project.image_url
                )}"
                alt=""
              >
            `
            : "";


        return `
          <article class="admin-item">

            ${image}

            <div class="admin-item-content">

              <h4>
                ${escapeHTML(
                  project.title
                )}
              </h4>

              <p>
                ${escapeHTML(
                  project.description ||
                  ""
                )}
              </p>

              <div class="admin-item-price">
                ${escapeHTML(
                  project.category ||
                  ""
                )}
              </div>


              <div class="admin-item-actions">

                <button
                  class="admin-edit"
                  onclick="editProject('${project.id}')"
                >
                  تعديل
                </button>

                <button
                  class="admin-delete"
                  onclick="deleteProject('${project.id}')"
                >
                  حذف
                </button>

              </div>

            </div>

          </article>
        `;

      })
      .join("");

}


document
  .getElementById(
    "newProjectBtn"
  )
  .addEventListener(
    "click",
    () => {

      document
        .getElementById(
          "projectForm"
        )
        .reset();


      document.getElementById(
        "projectId"
      ).value = "";


      document.getElementById(
        "projectModalTitle"
      ).textContent =
        "إضافة مشروع";


      openModal(
        document.getElementById(
          "projectEditModal"
        )
      );

    }
  );


window.editProject =
  async function(id) {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("projects")
        .select("*")
        .eq(
          "id",
          id
        )
        .single();


    if (error) {

      alert(
        "تعذر تحميل المشروع."
      );

      return;

    }


    document.getElementById(
      "projectId"
    ).value =
      data.id;


    document.getElementById(
      "projectTitle"
    ).value =
      data.title || "";


    document.getElementById(
      "projectDescription"
    ).value =
      data.description || "";


    document.getElementById(
      "projectCategory"
    ).value =
      data.category || "";


    document.getElementById(
      "projectImage"
    ).value =
      data.image_url || "";


    document.getElementById(
      "projectUrl"
    ).value =
      data.project_url || "";


    document.getElementById(
      "projectModalTitle"
    ).textContent =
      "تعديل المشروع";


    openModal(
      document.getElementById(
        "projectEditModal"
      )
    );

  };


document
  .getElementById(
    "projectForm"
  )
  .addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const id =
        document.getElementById(
          "projectId"
        ).value;


      const projectData = {

        title:
          document.getElementById(
            "projectTitle"
          ).value.trim(),

        description:
          document.getElementById(
            "projectDescription"
          ).value.trim(),

        category:
          document.getElementById(
            "projectCategory"
          ).value.trim(),

        image_url:
          document.getElementById(
            "projectImage"
          ).value.trim(),

        project_url:
          document.getElementById(
            "projectUrl"
          ).value.trim()

      };


      let error;


      if (id) {

        const result =
          await supabaseClient
            .from("projects")
            .update(
              projectData
            )
            .eq(
              "id",
              id
            );

        error =
          result.error;

      } else {

        const result =
          await supabaseClient
            .from("projects")
            .insert([
              projectData
            ]);

        error =
          result.error;

      }


      if (error) {

        alert(
          "حدث خطأ أثناء حفظ المشروع."
        );

        return;

      }


      closeModal(
        document.getElementById(
          "projectEditModal"
        )
      );


      await loadAdminProjects();
      await loadPublicProjects();

    }
  );


window.deleteProject =
  async function(id) {

    if (
      !confirm(
        "هل تريد حذف هذا المشروع؟"
      )
    ) {
      return;
    }


    const {
      error
    } =
      await supabaseClient
        .from("projects")
        .delete()
        .eq(
          "id",
          id
        );


    if (error) {

      alert(
        "تعذر حذف المشروع."
      );

      return;

    }


    await loadAdminProjects();
    await loadPublicProjects();

  };


document
  .getElementById(
    "closeProjectModal"
  )
  .addEventListener(
    "click",
    () => {

      closeModal(
        document.getElementById(
          "projectEditModal"
        )
      );

    }
  );


/* =========================================================
   ADMIN ORDERS
========================================================= */

const adminOrdersList =
  document.getElementById(
    "adminOrdersList"
  );


async function loadAdminOrders() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("orders")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(error);

    adminOrdersList.innerHTML =
      `
        <div class="empty">
          حدث خطأ أثناء تحميل الطلبات.
        </div>
      `;

    return;

  }


  if (
    !data ||
    data.length === 0
  ) {

    adminOrdersList.innerHTML =
      `
        <div class="empty">
          لا توجد طلبات مواقع حاليًا.
        </div>
      `;

    return;

  }


  adminOrdersList.innerHTML =
    data
      .map((order) => {

        const date =
          order.created_at
            ? new Date(
                order.created_at
              ).toLocaleString(
                "fr-DZ"
              )
            : "";


        return `
          <article class="order-admin-card">

            <div class="order-admin-top">

              <div>

                <div class="order-admin-name">
                  ${escapeHTML(
                    order.full_name
                  )}
                </div>

                <div
                  class="order-admin-date"
                >
                  ${escapeHTML(
                    date
                  )}
                </div>

              </div>

            </div>


            <div class="order-data">

              <div>
                <span>📱 الهاتف</span>
                <strong>
                  ${escapeHTML(
                    order.phone
                  )}
                </strong>
              </div>

              <div>
                <span>✉️ Email</span>
                <strong>
                  ${escapeHTML(
                    order.email ||
                    "-"
                  )}
                </strong>
              </div>

              <div>
                <span>🏪 المشروع</span>
                <strong>
                  ${escapeHTML(
                    order.business_name ||
                    "-"
                  )}
                </strong>
              </div>

              <div>
                <span>📌 النشاط</span>
                <strong>
                  ${escapeHTML(
                    order.business_type ||
                    "-"
                  )}
                </strong>
              </div>

              <div>
                <span>🌐 نوع الموقع</span>
                <strong>
                  ${escapeHTML(
                    order.website_type ||
                    "-"
                  )}
                </strong>
              </div>

              <div>
                <span>💰 الميزانية</span>
                <strong>
                  ${escapeHTML(
                    order.budget ||
                    "-"
                  )}
                </strong>
              </div>

              <div>
                <span>📅 المدة</span>
                <strong>
                  ${escapeHTML(
                    order.deadline ||
                    "-"
                  )}
                </strong>
              </div>

              <div>
                <span>📸 Instagram</span>
                <strong>
                  ${escapeHTML(
                    order.instagram ||
                    "-"
                  )}
                </strong>
              </div>

            </div>


            <div class="order-block">

              <div class="order-block-title">
                💡 فكرة الموقع
              </div>

              <p>
                ${escapeHTML(
                  order.idea ||
                  "-"
                )}
              </p>

            </div>


            <div class="order-block">

              <div class="order-block-title">
                📄 الصفحات
              </div>

              <p>
                ${escapeHTML(
                  order.pages ||
                  "-"
                )}
              </p>

            </div>


            <div class="order-block">

              <div class="order-block-title">
                ⚡ المزايا
              </div>

              <p>
                ${escapeHTML(
                  order.features ||
                  "-"
                )}
              </p>

            </div>


            <div class="order-block">

              <div class="order-block-title">
                📝 الملاحظات
              </div>

              <p>
                ${escapeHTML(
                  order.notes ||
                  "-"
                )}
              </p>

            </div>


            ${
              order.reference_url
                ? `
                  <div class="order-block">

                    <div class="order-block-title">
                      🔗 الموقع المرجعي
                    </div>

                    <a
                      class="project-link"
                      href="${escapeHTML(
                        order.reference_url
                      )}"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      فتح الرابط
                    </a>

                  </div>
                `
                : ""
            }


            <div class="order-actions">

              <button
                class="order-status"
                onclick="toggleOrderStatus(
                  '${order.id}',
                  '${escapeHTML(
                    order.status ||
                    "new"
                  )}'
                )"
              >
                ${
                  order.status === "done"
                    ? "↩️ إرجاع للجديدة"
                    : "✅ تمت المعالجة"
                }
              </button>


              <button
                class="order-delete"
                onclick="deleteOrder(
                  '${order.id}'
                )"
              >
                حذف الطلب
              </button>

            </div>

          </article>
        `;

      })
      .join("");

}


window.toggleOrderStatus =
  async function(
    id,
    currentStatus
  ) {

    const newStatus =
      currentStatus === "done"
        ? "new"
        : "done";


    const {
      error
    } =
      await supabaseClient
        .from("orders")
        .update({
          status: newStatus
        })
        .eq(
          "id",
          id
        );


    if (error) {

      alert(
        "تعذر تغيير الحالة."
      );

      return;

    }


    await loadAdminOrders();

  };


window.deleteOrder =
  async function(id) {

    if (
      !confirm(
        "هل تريد حذف هذا الطلب؟"
      )
    ) {
      return;
    }


    const {
      error
    } =
      await supabaseClient
        .from("orders")
        .delete()
        .eq(
          "id",
          id
        );


    if (error) {

      alert(
        "تعذر حذف الطلب."
      );

      return;

    }


    await loadAdminOrders();

  };


/* =========================================================
   ADMIN MESSAGES
========================================================= */

const adminMessagesList =
  document.getElementById(
    "adminMessagesList"
  );


async function loadAdminMessages() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("messages")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(error);

    adminMessagesList.innerHTML =
      `
        <div class="empty">
          حدث خطأ أثناء تحميل الرسائل.
        </div>
      `;

    return;

  }


  if (
    !data ||
    data.length === 0
  ) {

    adminMessagesList.innerHTML =
      `
        <div class="empty">
          لا توجد رسائل حاليًا.
        </div>
      `;

    return;

  }


  adminMessagesList.innerHTML =
    data
      .map((message) => {

        const date =
          message.created_at
            ? new Date(
                message.created_at
              ).toLocaleString(
                "fr-DZ"
              )
            : "";


        return `
          <article class="order-admin-card">

            <div class="order-admin-top">

              <div>

                <div class="order-admin-name">
                  ${escapeHTML(
                    message.name
                  )}
                </div>

                <div>
                  📱 ${escapeHTML(
                    message.phone ||
                    "-"
                  )}
                </div>

              </div>


              <div class="order-admin-date">
                ${escapeHTML(
                  date
                )}
              </div>

            </div>


            <div class="order-block">

              <div class="order-block-title">
                ✉️ Email
              </div>

              <p>
                ${escapeHTML(
                  message.email ||
                  "-"
                )}
              </p>

            </div>


            <div class="order-block">

              <div class="order-block-title">
                💬 الرسالة
              </div>

              <p>
                ${escapeHTML(
                  message.message ||
                  "-"
                )}
              </p>

            </div>


            <div class="order-actions">

              <button
                class="order-status"
                onclick="toggleMessageStatus(
                  '${message.id}',
                  '${escapeHTML(
                    message.status ||
                    "new"
                  )}'
                )"
              >
                ${
                  message.status === "read"
                    ? "↩️ غير مقروءة"
                    : "✅ تمت القراءة"
                }
              </button>


              <button
                class="order-delete"
                onclick="deleteMessage(
                  '${message.id}'
                )"
              >
                حذف
              </button>

            </div>

          </article>
        `;

      })
      .join("");

}


window.toggleMessageStatus =
  async function(
    id,
    currentStatus
  ) {

    const newStatus =
      currentStatus === "read"
        ? "new"
        : "read";


    const {
      error
    } =
      await supabaseClient
        .from("messages")
        .update({
          status: newStatus
        })
        .eq(
          "id",
          id
        );


    if (error) {

      alert(
        "تعذر تغيير الحالة."
      );

      return;

    }


    await loadAdminMessages();

  };


window.deleteMessage =
  async function(id) {

    if (
      !confirm(
        "هل تريد حذف الرسالة؟"
      )
    ) {
      return;
    }


    const {
      error
    } =
      await supabaseClient
        .from("messages")
        .delete()
        .eq(
          "id",
          id
        );


    if (error) {

      alert(
        "تعذر حذف الرسالة."
      );

      return;

    }


    await loadAdminMessages();

  };


/* =========================================================
   ADMIN EVERYTHING
========================================================= */

async function loadAdminEverything() {

  await Promise.all([

    loadAdminSettings(),

    loadAdminServices(),

    loadAdminProjects(),

    loadAdminOrders(),

    loadAdminMessages()

  ]);

}


/* =========================================================
   LOGOUT
========================================================= */

document
  .getElementById(
    "adminLogout"
  )
  .addEventListener(
    "click",
    async () => {

      await supabaseClient.auth
        .signOut();


      adminPanel.classList.add(
        "hidden"
      );

      document.body.classList.remove(
        "locked"
      );

    }
  );


/* =========================================================
   INIT
========================================================= */

year.textContent =
  new Date().getFullYear();


async function init() {

  await Promise.all([

    loadPublicSettings(),

    loadPublicServices(),

    loadPublicProjects()

  ]);

}


init();
