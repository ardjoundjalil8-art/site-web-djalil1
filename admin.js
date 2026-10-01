const SUPABASE_URL =
  "https://zpwxmpznlqprzcumuvkj.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_MlvybKumgpht1Q9blEIByw_I1yCyW30";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


/* =========================
   HELPERS
========================= */

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


function showAdmin() {

  document
    .getElementById("loginPage")
    .classList.add("hidden");

  document
    .getElementById("adminPage")
    .classList.remove("hidden");

}


function showLogin() {

  document
    .getElementById("adminPage")
    .classList.add("hidden");

  document
    .getElementById("loginPage")
    .classList.remove("hidden");

}


/* =========================
   ADMIN CHECK
========================= */

async function isAdmin(userId) {

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

    console.error(error);

    return false;

  }

  return !!data;

}


/* =========================
   SESSION
========================= */

async function checkSession() {

  const {
    data: {
      session
    }
  } =
    await supabaseClient.auth
      .getSession();


  if (!session) {

    showLogin();

    return;

  }


  const admin =
    await isAdmin(
      session.user.id
    );


  if (!admin) {

    await supabaseClient.auth
      .signOut();

    showLogin();

    return;

  }


  showAdmin();

  loadEverything();

}


/* =========================
   LOGIN
========================= */

document
  .getElementById("loginForm")
  .addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const email =
        document
          .getElementById("email")
          .value
          .trim();


      const password =
        document
          .getElementById("password")
          .value;


      const errorBox =
        document
          .getElementById(
            "loginError"
          );


      const button =
        event.target.querySelector(
          "button"
        );


      button.disabled = true;

      button.textContent =
        "جاري الدخول...";


      const {
        data,
        error
      } =
        await supabaseClient.auth
          .signInWithPassword({

            email,
            password

          });


      button.disabled = false;

      button.textContent =
        "دخول";


      if (error) {

        console.error(error);

        errorBox.textContent =
          "البريد الإلكتروني أو كلمة السر غير صحيحة.";

        return;

      }


      const admin =
        await isAdmin(
          data.user.id
        );


      if (!admin) {

        await supabaseClient.auth
          .signOut();

        errorBox.textContent =
          "هذا الحساب ليس Admin.";

        return;

      }


      errorBox.textContent = "";

      showAdmin();

      loadEverything();

    }
  );


/* =========================
   LOGOUT
========================= */

document
  .getElementById("logoutBtn")
  .addEventListener(
    "click",
    async () => {

      await supabaseClient.auth
        .signOut();

      showLogin();

    }
  );


/* =========================
   NAVIGATION
========================= */

document
  .querySelectorAll(".nav-btn")
  .forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        const target =
          button.dataset.section;


        document
          .querySelectorAll(".nav-btn")
          .forEach((item) => {

            item.classList.remove(
              "active"
            );

          });


        button.classList.add(
          "active"
        );


        document
          .querySelectorAll(".section")
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


        const titles = {

          dashboard: "الرئيسية",

          settings: "معلومات الموقع",

          services: "الخدمات",

          projects: "المشاريع",

          orders: "طلبات المواقع",

          messages: "الرسائل"

        };


        document
          .getElementById(
            "pageTitle"
          )
          .textContent =
          titles[target];

      }
    );

  });


/* =========================
   SETTINGS
========================= */

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

    console.error(error);

    return;

  }


  if (!data) {
    return;
  }


  document.getElementById(
    "siteName"
  ).value =
    data.site_name || "";


  document.getElementById(
    "ownerName"
  ).value =
    data.owner_name || "";


  document.getElementById(
    "heroTitle"
  ).value =
    data.hero_title || "";


  document.getElementById(
    "heroDescription"
  ).value =
    data.hero_description || "";


  document.getElementById(
    "aboutTitle"
  ).value =
    data.about_title || "";


  document.getElementById(
    "whatsapp"
  ).value =
    data.whatsapp || "";


  document.getElementById(
    "siteEmail"
  ).value =
    data.email || "";


  document.getElementById(
    "instagram"
  ).value =
    data.instagram_url || "";


  document.getElementById(
    "aboutText"
  ).value =
    data.about_text || "";


  document.getElementById(
    "logoUrl"
  ).value =
    data.logo_url || "";


  document.getElementById(
    "profileUrl"
  ).value =
    data.profile_image_url || "";


  document.getElementById(
    "primaryColor"
  ).value =
    data.primary_color ||
    "#7c3aed";


  document.getElementById(
    "secondaryColor"
  ).value =
    data.secondary_color ||
    "#06b6d4";


  document.getElementById(
    "showAbout"
  ).checked =
    data.show_about !== false;


  document.getElementById(
    "showServices"
  ).checked =
    data.show_services !== false;


  document.getElementById(
    "showProjects"
  ).checked =
    data.show_portfolio !== false;


  document.getElementById(
    "showContact"
  ).checked =
    data.show_contact !== false;

}


document
  .getElementById("settingsForm")
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

        result.textContent =
          "لم يتم العثور على إعدادات.";

        return;

      }


      const updates = {

        site_name:
          document.getElementById(
            "siteName"
          ).value.trim(),

        owner_name:
          document.getElementById(
            "ownerName"
          ).value.trim(),

        hero_title:
          document.getElementById(
            "heroTitle"
          ).value.trim(),

        hero_description:
          document.getElementById(
            "heroDescription"
          ).value.trim(),

        about_title:
          document.getElementById(
            "aboutTitle"
          ).value.trim(),

        whatsapp:
          document.getElementById(
            "whatsapp"
          ).value.trim(),

        email:
          document.getElementById(
            "siteEmail"
          ).value.trim(),

        instagram_url:
          document.getElementById(
            "instagram"
          ).value.trim(),

        about_text:
          document.getElementById(
            "aboutText"
          ).value.trim(),

        logo_url:
          document.getElementById(
            "logoUrl"
          ).value.trim(),

        profile_image_url:
          document.getElementById(
            "profileUrl"
          ).value.trim(),

        primary_color:
          document.getElementById(
            "primaryColor"
          ).value.trim(),

        secondary_color:
          document.getElementById(
            "secondaryColor"
          ).value.trim(),

        show_about:
          document.getElementById(
            "showAbout"
          ).checked,

        show_services:
          document.getElementById(
            "showServices"
          ).checked,

        show_portfolio:
          document.getElementById(
            "showProjects"
          ).checked,

        show_contact:
          document.getElementById(
            "showContact"
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

        result.textContent =
          "حدث خطأ أثناء الحفظ.";

        result.style.color =
          "#f87171";

        return;

      }


      result.textContent =
        "✅ تم الحفظ بنجاح.";

      result.style.color =
        "#86efac";

    }
  );


/* =========================
   SERVICES
========================= */

async function loadServices() {

  const list =
    document.getElementById(
      "servicesList"
    );


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

    list.innerHTML =
      `<div class="empty">حدث خطأ.</div>`;

    return;

  }


  document.getElementById(
    "servicesCount"
  ).textContent =
    data.length;


  if (!data.length) {

    list.innerHTML =
      `<div class="empty">
        لا توجد خدمات.
      </div>`;

    return;

  }


  list.innerHTML =
    data
      .map((item) => {

        return `
          <article class="admin-item">

            ${
              item.image_url
                ? `
                  <img
                    src="${escapeHTML(
                      item.image_url
                    )}"
                    alt=""
                  >
                `
                : ""
            }

            <div class="admin-item-content">

              <h4>
                ${escapeHTML(
                  item.icon ||
                  "💻"
                )}
                ${escapeHTML(
                  item.title
                )}
              </h4>

              <p>
                ${escapeHTML(
                  item.description ||
                  ""
                )}
              </p>

              <div class="price">
                ${escapeHTML(
                  item.price ||
                  ""
                )}
              </div>


              <div class="actions">

                <button
                  class="edit"
                  onclick="editService('${item.id}')"
                >
                  تعديل
                </button>


                <button
                  class="delete"
                  onclick="deleteService('${item.id}')"
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
  .getElementById("addService")
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


      document
        .getElementById(
          "serviceModal"
        )
        .classList.remove(
          "hidden"
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


    document
      .getElementById(
        "serviceModal"
      )
      .classList.remove(
        "hidden"
      );

  };


document
  .getElementById("serviceForm")
  .addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const id =
        document.getElementById(
          "serviceId"
        ).value;


      const item = {

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
          ).value.trim(),

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
            .update(item)
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
            .insert([item]);

        error =
          result.error;

      }


      if (error) {

        console.error(error);

        alert(
          "حدث خطأ أثناء الحفظ."
        );

        return;

      }


      document
        .getElementById(
          "serviceModal"
        )
        .classList.add(
          "hidden"
        );


      await loadServices();

  });


window.deleteService =
  async function(id) {

    if (
      !confirm(
        "هل تريد حذف الخدمة؟"
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
        "تعذر الحذف."
      );

      return;

    }


    await loadServices();

  };


document
  .getElementById("closeService")
  .addEventListener(
    "click",
    () => {

      document
        .getElementById(
          "serviceModal"
        )
        .classList.add(
          "hidden"
        );

    }
  );


/* =========================
   PROJECTS
========================= */

async function loadProjects() {

  const list =
    document.getElementById(
      "projectsList"
    );


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

    list.innerHTML =
      `<div class="empty">
        حدث خطأ.
      </div>`;

    return;

  }


  document.getElementById(
    "projectsCount"
  ).textContent =
    data.length;


  if (!data.length) {

    list.innerHTML =
      `<div class="empty">
        لا توجد مشاريع.
      </div>`;

    return;

  }


  list.innerHTML =
    data
      .map((item) => {

        return `
          <article class="admin-item">

            ${
              item.image_url
                ? `
                  <img
                    src="${escapeHTML(
                      item.image_url
                    )}"
                    alt=""
                  >
                `
                : ""
            }

            <div class="admin-item-content">

              <h4>
                ${escapeHTML(
                  item.title
                )}
              </h4>

              <p>
                ${escapeHTML(
                  item.description ||
                  ""
                )}
              </p>

              <div class="price">
                ${escapeHTML(
                  item.category ||
                  ""
                )}
              </div>


              <div class="actions">

                <button
                  class="edit"
                  onclick="editProject('${item.id}')"
                >
                  تعديل
                </button>


                <button
                  class="delete"
                  onclick="deleteProject('${item.id}')"
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
  .getElementById("addProject")
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


      document
        .getElementById(
          "projectModal"
        )
        .classList.remove(
          "hidden"
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


    document
      .getElementById(
        "projectModal"
      )
      .classList.remove(
        "hidden"
      );

  };


document
  .getElementById("projectForm")
  .addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const id =
        document.getElementById(
          "projectId"
        ).value;


      const item = {

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
            .update(item)
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
            .insert([item]);

        error =
          result.error;

      }


      if (error) {

        alert(
          "حدث خطأ أثناء الحفظ."
        );

        return;

      }


      document
        .getElementById(
          "projectModal"
        )
        .classList.add(
          "hidden"
        );


      await loadProjects();

  });


window.deleteProject =
  async function(id) {

    if (
      !confirm(
        "هل تريد حذف المشروع؟"
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
        "تعذر الحذف."
      );

      return;

    }


    await loadProjects();

  };


document
  .getElementById("closeProject")
  .addEventListener(
    "click",
    () => {

      document
        .getElementById(
          "projectModal"
        )
        .classList.add(
          "hidden"
        );

    }
  );


/* =========================
   ORDERS
========================= */

async function loadOrders() {

  const list =
    document.getElementById(
      "ordersList"
    );


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

    list.innerHTML =
      `
        <div class="empty">
          حدث خطأ أثناء تحميل الطلبات.
        </div>
      `;

    return;

  }


  document.getElementById(
    "ordersCount"
  ).textContent =
    data.length;


  if (!data.length) {

    list.innerHTML =
      `
        <div class="empty">
          لا توجد طلبات مواقع.
        </div>
      `;

    return;

  }


  list.innerHTML =
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
          <article class="order-card">

            <div class="order-top">

              <div>

                <div class="order-name">
                  ${escapeHTML(
                    order.full_name
                  )}
                </div>

                <div class="order-date">
                  ${escapeHTML(
                    date
                  )}
                </div>

              </div>

            </div>


            <div class="order-grid">

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


            <div class="block">

              <div class="block-title">
                💡 فكرة الموقع
              </div>

              <p>
                ${escapeHTML(
                  order.idea ||
                  "-"
                )}
              </p>

            </div>


            <div class="block">

              <div class="block-title">
                📄 الصفحات المطلوبة
              </div>

              <p>
                ${escapeHTML(
                  order.pages ||
                  "-"
                )}
              </p>

            </div>


            <div class="block">

              <div class="block-title">
                ⚡ المزايا المطلوبة
              </div>

              <p>
                ${escapeHTML(
                  order.features ||
                  "-"
                )}
              </p>

            </div>


            <div class="block">

              <div class="block-title">
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
                  <div class="block">

                    <div class="block-title">
                      🔗 موقع مرجعي
                    </div>

                    <a
                      class="visit-btn"
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
                class="status-btn"
                onclick="toggleOrder(
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
                class="delete-order"
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


window.toggleOrder =
  async function(
    id,
    currentStatus
  ) {

    const status =
      currentStatus === "done"
        ? "new"
        : "done";


    const {
      error
    } =
      await supabaseClient
        .from("orders")
        .update({
          status
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


    await loadOrders();

  };


window.deleteOrder =
  async function(id) {

    if (
      !confirm(
        "هل تريد حذف الطلب؟"
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


    await loadOrders();

  };


/* =========================
   MESSAGES
========================= */

async function loadMessages() {

  const list =
    document.getElementById(
      "messagesList"
    );


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

    return;

  }


  document.getElementById(
    "messagesCount"
  ).textContent =
    data.length;


  if (!data.length) {

    list.innerHTML =
      `
        <div class="empty">
          لا توجد رسائل.
        </div>
      `;

    return;

  }


  list.innerHTML =
    data
      .map((message) => {

        return `
          <article class="order-card">

            <div class="order-top">

              <div>

                <div class="order-name">
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

            </div>


            <div class="block">

              <div class="block-title">
                ✉️ Email
              </div>

              <p>
                ${escapeHTML(
                  message.email ||
                  "-"
                )}
              </p>

            </div>


            <div class="block">

              <div class="block-title">
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
                class="status-btn"
                onclick="toggleMessage(
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
                class="delete-order"
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


window.toggleMessage =
  async function(
    id,
    currentStatus
  ) {

    const status =
      currentStatus === "read"
        ? "new"
        : "read";


    const {
      error
    } =
      await supabaseClient
        .from("messages")
        .update({
          status
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


    await loadMessages();

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
        "تعذر الحذف."
      );

      return;

    }


    await loadMessages();

  };


/* =========================
   LOAD EVERYTHING
========================= */

async function loadEverything() {

  await Promise.all([

    loadSettings(),

    loadServices(),

    loadProjects(),

    loadOrders(),

    loadMessages()

  ]);

}


/* =========================
   START
========================= */

checkSession();
