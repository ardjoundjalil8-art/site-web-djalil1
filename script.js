const SUPABASE_URL =
  "https://zpwxmpznlqprzcumuvkj.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_MlvybKumgpht1Q9blEIByw_I1yCyW30";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


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


function whatsappURL(phone) {

  let value =
    String(phone || "")
      .replace(/\D/g, "");

  if (value.startsWith("0")) {
    value = "213" + value.slice(1);
  }

  if (!value.startsWith("213")) {
    value = "213" + value;
  }

  return `https://wa.me/${value}`;
}


function result(element, text, type = "") {

  element.textContent = text;
  element.className =
    `result ${type}`;

}


/* ELEMENTS */

const brandText =
  document.getElementById("brandText");

const brandLogo =
  document.getElementById("brandLogo");

const footerName =
  document.getElementById("footerName");

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


/* MOBILE MENU */

const menuBtn =
  document.getElementById("menuBtn");

const mobileMenu =
  document.getElementById("mobileMenu");


menuBtn.addEventListener(
  "click",
  () => {
    mobileMenu.classList.toggle("open");
  }
);


document
  .querySelectorAll(
    "#mobileMenu a, #mobileMenu button"
  )
  .forEach((item) => {

    item.addEventListener(
      "click",
      () => {
        mobileMenu.classList.remove(
          "open"
        );
      }
    );

  });


/* SETTINGS */

async function loadSettings() {

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
      "settings",
      error
    );

    return;

  }


  if (!data) {
    return;
  }


  const siteName =
    data.site_name ||
    "SITE WEB";


  brandText.textContent =
    siteName;

  footerName.textContent =
    siteName;

  document.title =
    siteName;


  heroTitle.textContent =
    data.hero_title ||
    "";

  heroDescription.textContent =
    data.hero_description ||
    "";

  aboutTitle.textContent =
    data.about_title ||
    "من أنا";

  aboutName.textContent =
    data.owner_name ||
    "";

  aboutText.textContent =
    data.about_text ||
    "";


  const whatsapp =
    data.whatsapp ||
    "";

  const email =
    data.email ||
    "";

  const instagram =
    data.instagram_url ||
    "";


  if (data.logo_url) {

    brandLogo.src =
      data.logo_url;

    brandLogo.classList.remove(
      "hidden"
    );

  } else {

    brandLogo.classList.add(
      "hidden"
    );

  }


  const wa =
    whatsapp
      ? whatsappURL(whatsapp)
      : "#";


  headerWhatsapp.href =
    wa;

  mobileWhatsapp.href =
    wa;

  heroWhatsapp.href =
    wa;

  contactWhatsapp.href =
    wa;


  aboutWhatsapp.textContent =
    whatsapp;

  contactWhatsapp.textContent =
    whatsapp ||
    "WhatsApp";


  aboutEmail.textContent =
    email;

  contactEmail.textContent =
    email ||
    "Email";

  contactEmail.href =
    email
      ? `mailto:${email}`
      : "#";


  contactInstagram.textContent =
    instagram
      ? "فتح Instagram"
      : "Instagram";

  contactInstagram.href =
    instagram ||
    "#";


  if (data.profile_image_url) {

    profileImage.src =
      data.profile_image_url;

    profileImage.style.display =
      "block";

  } else {

    profileImage.style.display =
      "none";

  }


  document.documentElement.style
    .setProperty(
      "--primary",
      data.primary_color ||
      "#7c3aed"
    );

  document.documentElement.style
    .setProperty(
      "--secondary",
      data.secondary_color ||
      "#06b6d4"
    );


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


/* SERVICES */

async function loadServices() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("services")
      .select("*")
      .eq(
        "is_visible",
        true
      )
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
      "services",
      error
    );

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
      .map((item) => {

        const image =
          item.image_url
            ? `
              <img
                src="${escapeHTML(
                  item.image_url
                )}"
                alt="${escapeHTML(
                  item.title
                )}"
              >
            `
            : "";


        return `
          <article class="service-card">

            ${image}

            <div class="service-icon">
              ${escapeHTML(
                item.icon ||
                "💻"
              )}
            </div>

            <h3>
              ${escapeHTML(
                item.title
              )}
            </h3>

            <p>
              ${escapeHTML(
                item.description ||
                ""
              )}
            </p>

            ${
              item.price
                ? `
                  <div class="service-price">
                    ${escapeHTML(
                      item.price
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


/* PROJECTS */

async function loadProjects() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("projects")
      .select("*")
      .eq(
        "is_visible",
        true
      )
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
      "projects",
      error
    );

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
      .map((item) => {

        return `
          <article class="project-card">

            ${
              item.image_url
                ? `
                  <img
                    src="${escapeHTML(
                      item.image_url
                    )}"
                    alt="${escapeHTML(
                      item.title
                    )}"
                  >
                `
                : `
                  <div
                    style="
                      height:280px;
                      background:#0c1016;
                    "
                  ></div>
                `
            }

            <div class="project-content">

              ${
                item.category
                  ? `
                    <div class="project-category">
                      ${escapeHTML(
                        item.category
                      )}
                    </div>
                  `
                  : ""
              }

              <h3>
                ${escapeHTML(
                  item.title
                )}
              </h3>

              <p>
                ${escapeHTML(
                  item.description ||
                  ""
                )}
              </p>

              ${
                item.project_url
                  ? `
                    <a
                      class="project-link"
                      href="${escapeHTML(
                        item.project_url
                      )}"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      مشاهدة المشروع ↗
                    </a>
                  `
                  : ""
              }

            </div>

          </article>
        `;

      })
      .join("");

}


/* CONTACT */

document
  .getElementById("contactForm")
  .addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const button =
        document.getElementById(
          "contactSubmit"
        );

      const output =
        document.getElementById(
          "contactResult"
        );


      button.disabled = true;

      button.textContent =
        "جاري الإرسال...";


      const payload = {

        name:
          document
            .getElementById(
              "clientName"
            )
            .value
            .trim(),

        phone:
          document
            .getElementById(
              "clientPhone"
            )
            .value
            .trim(),

        email:
          document
            .getElementById(
              "clientEmail"
            )
            .value
            .trim(),

        message:
          document
            .getElementById(
              "clientMessage"
            )
            .value
            .trim(),

        status:
          "new"

      };


      const {
        error
      } =
        await supabaseClient
          .from("messages")
          .insert([
            payload
          ]);


      button.disabled = false;

      button.textContent =
        "إرسال الرسالة";


      if (error) {

        console.error(error);

        result(
          output,
          "حدث خطأ أثناء الإرسال.",
          "error"
        );

        return;

      }


      result(
        output,
        "✅ تم إرسال الرسالة بنجاح.",
        "success"
      );


      event.target.reset();

    }
  );


/* ORDER MODAL */

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
      () => {

        orderModal.classList.remove(
          "hidden"
        );

        document.body.classList.add(
          "locked"
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

      orderModal.classList.add(
        "hidden"
      );

      document.body.classList.remove(
        "locked"
      );

    }
  );


document
  .getElementById(
    "orderForm"
  )
  .addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const button =
        document.getElementById(
          "orderSubmit"
        );

      const output =
        document.getElementById(
          "orderResult"
        );


      button.disabled = true;

      button.textContent =
        "جاري إرسال الطلب...";


      const payload = {

        full_name:
          document.getElementById(
            "orderName"
          ).value.trim(),

        phone:
          document.getElementById(
            "orderPhone"
          ).value.trim(),

        email:
          document.getElementById(
            "orderEmail"
          ).value.trim(),

        business_name:
          document.getElementById(
            "orderBusiness"
          ).value.trim(),

        business_type:
          document.getElementById(
            "orderBusinessType"
          ).value.trim(),

        website_type:
          document.getElementById(
            "orderWebsiteType"
          ).value,

        idea:
          document.getElementById(
            "orderIdea"
          ).value.trim(),

        pages:
          document.getElementById(
            "orderPages"
          ).value.trim(),

        features:
          document.getElementById(
            "orderFeatures"
          ).value.trim(),

        budget:
          document.getElementById(
            "orderBudget"
          ).value,

        deadline:
          document.getElementById(
            "orderDeadline"
          ).value.trim(),

        instagram:
          document.getElementById(
            "orderInstagram"
          ).value.trim(),

        reference_url:
          document.getElementById(
            "orderReference"
          ).value.trim(),

        notes:
          document.getElementById(
            "orderNotes"
          ).value.trim(),

        status:
          "new"

      };


      const {
        error
      } =
        await supabaseClient
          .from("orders")
          .insert([
            payload
          ]);


      button.disabled = false;

      button.textContent =
        "إرسال الطلب 🚀";


      if (error) {

        console.error(error);

        result(
          output,
          "حدث خطأ أثناء إرسال الطلب.",
          "error"
        );

        return;

      }


      result(
        output,
        "✅ تم إرسال طلبك بنجاح!",
        "success"
      );


      event.target.reset();

    }
  );


/* START */

document.getElementById(
  "year"
).textContent =
  new Date().getFullYear();


Promise.all([
  loadSettings(),
  loadServices(),
  loadProjects()
]);
