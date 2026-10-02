const SUPABASE_URL =
  "https://zpwxmpznlqprzcumuvkj.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_MlvybKumgpht1Q9blEIByw_I1yCyW30";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


/* =========================================
   HELPERS
========================================= */

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


function show(element) {
  element.classList.remove("hidden");
}


function hide(element) {
  element.classList.add("hidden");
}


function notify(element, text, type = "") {

  element.textContent = text;

  element.className =
    `result ${type}`;

}


function formatDate(date) {

  if (!date) {
    return "";
  }

  return new Date(
    date
  ).toLocaleString(
    "fr-DZ"
  );

}


function toWhatsApp(phone) {

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


/* =========================================
   IMAGE UPLOAD
========================================= */

async function uploadImage(
  file,
  folder
) {

  if (!file) {
    return null;
  }


  if (!file.type.startsWith("image/")) {

    throw new Error(
      "الملف ليس صورة."
    );

  }


  if (
    file.size >
    5 * 1024 * 1024
  ) {

    throw new Error(
      "حجم الصورة أكبر من 5MB."
    );

  }


  const extension =
    file.name.includes(".")
      ? file.name
          .split(".")
          .pop()
          .toLowerCase()
      : "jpg";


  const fileName =
    `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}.${extension}`;


  const path =
    `${folder}/${fileName}`;


  const {
    error
  } =
    await supabaseClient.storage
      .from("site-images")
      .upload(
        path,
        file,
        {
          cacheControl: "3600",
          upsert: false
        }
      );


  if (error) {
    throw error;
  }


  const {
    data
  } =
    supabaseClient.storage
      .from("site-images")
      .getPublicUrl(path);


  return data.publicUrl;

}


/* =========================================
   AUTH
========================================= */

const loginPage =
  document.getElementById(
    "loginPage"
  );

const adminApp =
  document.getElementById(
    "adminApp"
  );

const loginForm =
  document.getElementById(
    "loginForm"
  );

const loginError =
  document.getElementById(
    "loginError"
  );


async function checkAdmin() {

  const {
    data,
    error
  } =
    await supabaseClient.rpc(
      "is_admin"
    );


  if (error) {

    console.error(error);

    return false;

  }


  return data === true;

}


async function checkSession() {

  const {
    data: {
      session
    }
  } =
    await supabaseClient.auth
      .getSession();


  if (!session) {

    hide(adminApp);
    show(loginPage);

    return;

  }


  const admin =
    await checkAdmin();


  if (!admin) {

    await supabaseClient.auth
      .signOut();

    hide(adminApp);
    show(loginPage);

    loginError.textContent =
      "هذا الحساب ليس Admin.";

    return;

  }


  show(adminApp);
  hide(loginPage);

  await loadEverything();

}


loginForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    loginError.textContent =
      "";


    const email =
      document
        .getElementById(
          "loginEmail"
        )
        .value
        .trim();


    const password =
      document
        .getElementById(
          "loginPassword"
        )
        .value;


    const button =
      document.getElementById(
        "loginButton"
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
      "دخول الإدارة";


    if (error) {

      console.error(error);

      loginError.textContent =
        "البريد الإلكتروني أو كلمة المرور غير صحيحة.";

      return;

    }


    const admin =
      await checkAdmin();


    if (!admin) {

      await supabaseClient.auth
        .signOut();

      loginError.textContent =
        "الحساب غير مضاف كـAdmin.";

      return;

    }


    show(adminApp);
    hide(loginPage);

    await loadEverything();

  }
);


document
  .getElementById(
    "logoutButton"
  )
  .addEventListener(
    "click",
    async () => {

      await supabaseClient.auth
        .signOut();

      hide(adminApp);
      show(loginPage);

    }
  );


/* =========================================
   NAVIGATION
========================================= */

const pageTitle =
  document.getElementById(
    "pageTitle"
  );


document
  .querySelectorAll(".tab")
  .forEach((tab) => {

    tab.addEventListener(
      "click",
      async () => {

        const target =
          tab.dataset.section;


        document
          .querySelectorAll(".tab")
          .forEach(
            (item) =>
              item.classList.remove(
                "active"
              )
          );


        tab.classList.add(
          "active"
        );


        document
          .querySelectorAll(
            ".section"
          )
          .forEach(
            (section) =>
              section.classList.remove(
                "active"
              )
          );


        document
          .getElementById(target)
          .classList.add(
            "active"
          );


        const titles = {

          dashboard:
            "الرئيسية",

          settings:
            "معلومات الموقع",

          services:
            "الخدمات",

          projects:
            "المشاريع",

          orders:
            "طلبات المواقع",

          messages:
            "الرسائل"

        };


        pageTitle.textContent =
          titles[target] ||
          "Admin";

      }
    );

  });


/* =========================================
   SETTINGS
========================================= */

let currentSettings = null;


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


  currentSettings =
    data;


  document.getElementById(
    "siteName"
  ).value =
    data.site_name ||
    "";

  document.getElementById(
    "ownerName"
  ).value =
    data.owner_name ||
    "";

  document.getElementById(
    "heroTitle"
  ).value =
    data.hero_title ||
    "";

  document.getElementById(
    "heroDescription"
  ).value =
    data.hero_description ||
    "";

  document.getElementById(
    "aboutTitle"
  ).value =
    data.about_title ||
    "";

  document.getElementById(
    "siteWhatsapp"
  ).value =
    data.whatsapp ||
    "";

  document.getElementById(
    "siteEmail"
  ).value =
    data.email ||
    "";

  document.getElementById(
    "siteInstagram"
  ).value =
    data.instagram_url ||
    "";

  document.getElementById(
    "aboutText"
  ).value =
    data.about_text ||
    "";

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


  setImagePreview(
    document.getElementById(
      "logoPreview"
    ),
    data.logo_url
  );


  setImagePreview(
    document.getElementById(
      "profilePreview"
    ),
    data.profile_image_url
  );

}


function setImagePreview(
  img,
  url
) {

  if (url) {

    img.src =
      url;

    img.style.display =
      "block";

  } else {

    img.removeAttribute(
      "src"
    );

    img.style.display =
      "none";

  }

}


/* FILE PREVIEWS */

document
  .getElementById(
    "logoFile"
  )
  .addEventListener(
    "change",
    (event) => {

      const file =
        event.target.files[0];

      document.getElementById(
        "logoFileName"
      ).textContent =
        file
          ? file.name
          : "لم يتم اختيار صورة";


      if (file) {

        setImagePreview(
          document.getElementById(
            "logoPreview"
          ),
          URL.createObjectURL(
            file
          )
        );

      }

    }
  );


document
  .getElementById(
    "profileFile"
  )
  .addEventListener(
    "change",
    (event) => {

      const file =
        event.target.files[0];

      document.getElementById(
        "profileFileName"
      ).textContent =
        file
          ? file.name
          : "لم يتم اختيار صورة";


      if (file) {

        setImagePreview(
          document.getElementById(
            "profilePreview"
          ),
          URL.createObjectURL(
            file
          )
        );

      }

    }
  );


/* SAVE SETTINGS */

document
  .getElementById(
    "settingsForm"
  )
  .addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const output =
        document.getElementById(
          "settingsResult"
        );


      const {
        data: row,
        error: rowError
      } =
        await supabaseClient
          .from("site_settings")
          .select("id")
          .limit(1)
          .maybeSingle();


      if (rowError || !row) {

        notify(
          output,
          "لم يتم العثور على إعدادات.",
          "error"
        );

        return;

      }


      try {

        let logoUrl =
          currentSettings?.logo_url ||
          "";

        let profileUrl =
          currentSettings?.profile_image_url ||
          "";


        const logoFile =
          document
            .getElementById(
              "logoFile"
            )
            .files[0];


        if (logoFile) {

          logoUrl =
            await uploadImage(
              logoFile,
              "branding"
            );

        }


        const profileFile =
          document
            .getElementById(
              "profileFile"
            )
            .files[0];


        if (profileFile) {

          profileUrl =
            await uploadImage(
              profileFile,
              "branding"
            );

        }


        const update = {

          site_name:
            document
              .getElementById(
                "siteName"
              )
              .value
              .trim(),

          owner_name:
            document
              .getElementById(
                "ownerName"
              )
              .value
              .trim(),

          hero_title:
            document
              .getElementById(
                "heroTitle"
              )
              .value
              .trim(),

          hero_description:
            document
              .getElementById(
                "heroDescription"
              )
              .value
              .trim(),

          about_title:
            document
              .getElementById(
                "aboutTitle"
              )
              .value
              .trim(),

          about_text:
            document
              .getElementById(
                "aboutText"
              )
              .value
              .trim(),

          whatsapp:
            document
              .getElementById(
                "siteWhatsapp"
              )
              .value
              .trim(),

          email:
            document
              .getElementById(
                "siteEmail"
              )
              .value
              .trim(),

          instagram_url:
            document
              .getElementById(
                "siteInstagram"
              )
              .value
              .trim(),

          logo_url:
            logoUrl,

          profile_image_url:
            profileUrl,

          primary_color:
            document
              .getElementById(
                "primaryColor"
              )
              .value
              .trim(),

          secondary_color:
            document
              .getElementById(
                "secondaryColor"
              )
              .value
              .trim(),

          show_about:
            document
              .getElementById(
                "showAbout"
              )
              .checked,

          show_services:
            document
              .getElementById(
                "showServices"
              )
              .checked,

          show_portfolio:
            document
              .getElementById(
                "showProjects"
              )
              .checked,

          show_contact:
            document
              .getElementById(
                "showContact"
              )
              .checked,

          updated_at:
            new Date().toISOString()

        };


        const {
          error
        } =
          await supabaseClient
            .from("site_settings")
            .update(
              update
            )
            .eq(
              "id",
              row.id
            );


        if (error) {
          throw error;
        }


        currentSettings = {
          ...currentSettings,
          ...update
        };


        notify(
          output,
          "✅ تم حفظ كل التغييرات.",
          "success"
        );

      } catch (error) {

        console.error(error);

        notify(
          output,
          error.message ||
            "حدث خطأ أثناء الحفظ.",
          "error"
        );

      }

    }
  );


/* =========================================
   SERVICES
========================================= */

let serviceEditingId =
  null;

const servicesList =
  document.getElementById(
    "servicesList"
  );


async function loadServices() {

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

    servicesList.innerHTML =
      `
        <div class="empty">
          حدث خطأ في تحميل الخدمات.
        </div>
      `;

    return;

  }


  document.getElementById(
    "servicesCount"
  ).textContent =
    data.length;


  if (!data.length) {

    servicesList.innerHTML =
      `
        <div class="empty">
          لا توجد خدمات. اضغط «إضافة خدمة».
        </div>
      `;

    return;

  }


  servicesList.innerHTML =
    data
      .map(
        (item) => {

          return `
            <article class="admin-item">

              ${
                item.image_url
                  ? `
                    <img
                      class="admin-item-image"
                      src="${escapeHTML(
                        item.image_url
                      )}"
                      alt=""
                    >
                  `
                  : `
                    <div
                      class="admin-item-image"
                    ></div>
                  `
              }


              <div class="admin-item-body">

                <h3>
                  ${escapeHTML(
                    item.icon || "💻"
                  )}
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


                <div class="item-meta">
                  ${escapeHTML(
                    item.price ||
                    ""
                  )}
                </div>


                <div class="item-actions">

                  <button
                    class="edit-btn"
                    onclick="openEditService('${item.id}')"
                  >
                    تعديل
                  </button>


                  <button
                    class="delete-btn"
                    onclick="removeService('${item.id}')"
                  >
                    حذف
                  </button>

                </div>

              </div>

            </article>
          `;

        }
      )
      .join("");

}


document
  .getElementById(
    "addService"
  )
  .addEventListener(
    "click",
    () => {

      serviceEditingId =
        null;


      document
        .getElementById(
          "serviceForm"
        )
        .reset();


      document
        .getElementById(
          "serviceModalTitle"
        )
        .textContent =
        "إضافة خدمة";


      document
        .getElementById(
          "serviceImageName"
        )
        .textContent =
        "لم يتم اختيار صورة";


      setImagePreview(
        document.getElementById(
          "serviceImagePreview"
        ),
        ""
      );


      document
        .getElementById(
          "serviceModal"
        )
        .classList.remove(
          "hidden"
        );

    }
  );


window.openEditService =
  async function(id) {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("services")
        .select("*")
        .eq("id", id)
        .single();


    if (error) {

      alert(
        "تعذر تحميل الخدمة."
      );

      return;

    }


    serviceEditingId =
      id;


    document.getElementById(
      "serviceTitle"
    ).value =
      data.title ||
      "";

    document.getElementById(
      "serviceDescription"
    ).value =
      data.description ||
      "";

    document.getElementById(
      "servicePrice"
    ).value =
      data.price ||
      "";

    document.getElementById(
      "serviceIcon"
    ).value =
      data.icon ||
      "💻";


    document
      .getElementById(
        "serviceImageFile"
      )
      .value =
      "";


    document.getElementById(
      "serviceImageName"
    ).textContent =
      data.image_url
        ? "الصورة الحالية"
        : "لم يتم اختيار صورة";


    setImagePreview(
      document.getElementById(
        "serviceImagePreview"
      ),
      data.image_url
    );


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
  .getElementById(
    "serviceImageFile"
  )
  .addEventListener(
    "change",
    (event) => {

      const file =
        event.target.files[0];


      document.getElementById(
        "serviceImageName"
      ).textContent =
        file
          ? file.name
          : "لم يتم اختيار صورة";


      if (file) {

        setImagePreview(
          document.getElementById(
            "serviceImagePreview"
          ),
          URL.createObjectURL(
            file
          )
        );

      }

    }
  );


document
  .getElementById(
    "serviceForm"
  )
  .addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const button =
        event.target.querySelector(
          "button[type='submit']"
        );


      button.disabled = true;
      button.textContent =
        "جاري الحفظ...";


      try {

        let imageUrl = "";


        if (
          serviceEditingId
        ) {

          const {
            data: old
          } =
            await supabaseClient
              .from("services")
              .select("image_url")
              .eq(
                "id",
                serviceEditingId
              )
              .single();


          imageUrl =
            old?.image_url ||
            "";

        }


        const file =
          document
            .getElementById(
              "serviceImageFile"
            )
            .files[0];


        if (file) {

          imageUrl =
            await uploadImage(
              file,
              "services"
            );

        }


        const payload = {

          title:
            document
              .getElementById(
                "serviceTitle"
              )
              .value
              .trim(),

          description:
            document
              .getElementById(
                "serviceDescription"
              )
              .value
              .trim(),

          price:
            document
              .getElementById(
                "servicePrice"
              )
              .value
              .trim(),

          icon:
            document
              .getElementById(
                "serviceIcon"
              )
              .value
              .trim() ||
            "💻",

          image_url:
            imageUrl

        };


        if (
          serviceEditingId
        ) {

          const {
            error
          } =
            await supabaseClient
              .from("services")
              .update(
                payload
              )
              .eq(
                "id",
                serviceEditingId
              );


          if (error) {
            throw error;
          }

        } else {

          const {
            error
          } =
            await supabaseClient
              .from("services")
              .insert([
                payload
              ]);


          if (error) {
            throw error;
          }

        }


        document
          .getElementById(
            "serviceModal"
          )
          .classList.add(
            "hidden"
          );


        await loadServices();

        button.disabled = false;
        button.textContent =
          "حفظ الخدمة";

      } catch (error) {

        console.error(error);

        alert(
          error.message ||
          "حدث خطأ أثناء حفظ الخدمة."
        );

        button.disabled = false;
        button.textContent =
          "حفظ الخدمة";

      }

    }
  );


window.removeService =
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

      console.error(error);

      alert(
        "تعذر حذف الخدمة."
      );

      return;

    }


    await loadServices();

  };


document
  .getElementById(
    "closeService"
  )
  .addEventListener(
    "click",
    () => {

      hide(
        document.getElementById(
          "serviceModal"
        )
      );

    }
  );


/* =========================================
   PROJECTS
========================================= */

let projectEditingId =
  null;


const projectsList =
  document.getElementById(
    "projectsList"
  );


async function loadProjects() {

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

    projectsList.innerHTML =
      `
        <div class="empty">
          حدث خطأ في تحميل المشاريع.
        </div>
      `;

    return;

  }


  document.getElementById(
    "projectsCount"
  ).textContent =
    data.length;


  if (!data.length) {

    projectsList.innerHTML =
      `
        <div class="empty">
          لا توجد مشاريع. اضغط «إضافة مشروع».
        </div>
      `;

    return;

  }


  projectsList.innerHTML =
    data
      .map(
        (item) => {

          return `
            <article class="admin-item">

              ${
                item.image_url
                  ? `
                    <img
                      class="admin-item-image"
                      src="${escapeHTML(
                        item.image_url
                      )}"
                      alt=""
                    >
                  `
                  : `
                    <div
                      class="admin-item-image"
                    ></div>
                  `
              }


              <div class="admin-item-body">

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


                <div class="item-meta">
                  ${escapeHTML(
                    item.category ||
                    ""
                  )}
                </div>


                <div class="item-actions">

                  <button
                    class="edit-btn"
                    onclick="openEditProject('${item.id}')"
                  >
                    تعديل
                  </button>


                  <button
                    class="delete-btn"
                    onclick="removeProject('${item.id}')"
                  >
                    حذف
                  </button>

                </div>

              </div>

            </article>
          `;

        }
      )
      .join("");

}


document
  .getElementById(
    "addProject"
  )
  .addEventListener(
    "click",
    () => {

      projectEditingId =
        null;


      document
        .getElementById(
          "projectForm"
        )
        .reset();


      document.getElementById(
        "projectModalTitle"
      ).textContent =
        "إضافة مشروع";


      document.getElementById(
        "projectImageName"
      ).textContent =
        "لم يتم اختيار صورة";


      setImagePreview(
        document.getElementById(
          "projectImagePreview"
        ),
        ""
      );


      show(
        document.getElementById(
          "projectModal"
        )
      );

    }
  );


window.openEditProject =
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


    projectEditingId =
      id;


    document.getElementById(
      "projectTitle"
    ).value =
      data.title ||
      "";

    document.getElementById(
      "projectDescription"
    ).value =
      data.description ||
      "";

    document.getElementById(
      "projectCategory"
    ).value =
      data.category ||
      "";

    document.getElementById(
      "projectUrl"
    ).value =
      data.project_url ||
      "";


    document.getElementById(
      "projectImageFile"
    ).value =
      "";


    document.getElementById(
      "projectImageName"
    ).textContent =
      data.image_url
        ? "الصورة الحالية"
        : "لم يتم اختيار صورة";


    setImagePreview(
      document.getElementById(
        "projectImagePreview"
      ),
      data.image_url
    );


    document.getElementById(
      "projectModalTitle"
    ).textContent =
      "تعديل المشروع";


    show(
      document.getElementById(
        "projectModal"
      )
    );

  };


document
  .getElementById(
    "projectImageFile"
  )
  .addEventListener(
    "change",
    (event) => {

      const file =
        event.target.files[0];


      document.getElementById(
        "projectImageName"
      ).textContent =
        file
          ? file.name
          : "لم يتم اختيار صورة";


      if (file) {

        setImagePreview(
          document.getElementById(
            "projectImagePreview"
          ),
          URL.createObjectURL(
            file
          )
        );

      }

    }
  );


document
  .getElementById(
    "projectForm"
  )
  .addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const button =
        event.target.querySelector(
          "button[type='submit']"
        );


      button.disabled = true;

      button.textContent =
        "جاري الحفظ...";


      try {

        let imageUrl = "";


        if (
          projectEditingId
        ) {

          const {
            data: old
          } =
            await supabaseClient
              .from("projects")
              .select("image_url")
              .eq(
                "id",
                projectEditingId
              )
              .single();


          imageUrl =
            old?.image_url ||
            "";

        }


        const file =
          document
            .getElementById(
              "projectImageFile"
            )
            .files[0];


        if (file) {

          imageUrl =
            await uploadImage(
              file,
              "projects"
            );

        }


        const payload = {

          title:
            document
              .getElementById(
                "projectTitle"
              )
              .value
              .trim(),

          description:
            document
              .getElementById(
                "projectDescription"
              )
              .value
              .trim(),

          category:
            document
              .getElementById(
                "projectCategory"
              )
              .value
              .trim(),

          image_url:
            imageUrl,

          project_url:
            document
              .getElementById(
                "projectUrl"
              )
              .value
              .trim()

        };


        if (
          projectEditingId
        ) {

          const {
            error
          } =
            await supabaseClient
              .from("projects")
              .update(
                payload
              )
              .eq(
                "id",
                projectEditingId
              );


          if (error) {
            throw error;
          }

        } else {

          const {
            error
          } =
            await supabaseClient
              .from("projects")
              .insert([
                payload
              ]);


          if (error) {
            throw error;
          }

        }


        hide(
          document.getElementById(
            "projectModal"
          )
        );


        await loadProjects();

        button.disabled = false;

        button.textContent =
          "حفظ المشروع";

      } catch (error) {

        console.error(error);

        alert(
          error.message ||
          "حدث خطأ أثناء حفظ المشروع."
        );

        button.disabled = false;

        button.textContent =
          "حفظ المشروع";

      }

    }
  );


window.removeProject =
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

      console.error(error);

      alert(
        "تعذر حذف المشروع."
      );

      return;

    }


    await loadProjects();

  };


document
  .getElementById(
    "closeProject"
  )
  .addEventListener(
    "click",
    () => {

      hide(
        document.getElementById(
          "projectModal"
        )
      );

    }
  );


/* =========================================
   ORDERS
========================================= */

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
          حدث خطأ في تحميل الطلبات.
        </div>
      `;

    return;

  }


  document.getElementById(
    "ordersCount"
  ).textContent =
    data.length;


  document.getElementById(
    "ordersBadge"
  ).textContent =
    data.length;


  if (!data.length) {

    list.innerHTML =
      `
        <div class="empty">
          لا توجد طلبات مواقع حاليًا.
        </div>
      `;

    return;

  }


  list.innerHTML =
    data
      .map(
        (order) => {

          const status =
            order.status ||
            "new";


          const statusOptions = [

            ["new", "جديدة"],

            ["contacted", "تم التواصل"],

            ["working", "قيد العمل"],

            ["done", "مكتملة"],

            ["cancelled", "ملغاة"]

          ];


          return `
            <article class="order-card">

              <div class="order-top">

                <div>

                  <div class="order-name">
                    ${escapeHTML(
                      order.full_name
                    )}
                  </div>

                  <div>
                    📞 ${escapeHTML(
                      order.phone
                    )}
                  </div>

                </div>


                <div class="order-date">
                  ${escapeHTML(
                    formatDate(
                      order.created_at
                    )
                  )}
                </div>

              </div>


              <div class="order-grid">

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


                <div>
                  <span>✉️ Email</span>
                  <strong>
                    ${escapeHTML(
                      order.email ||
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
                  📄 الصفحات المطلوبة
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


              ${
                order.notes
                  ? `
                    <div class="order-block">

                      <div class="order-block-title">
                        📝 ملاحظات
                      </div>

                      <p>
                        ${escapeHTML(
                          order.notes
                        )}
                      </p>

                    </div>
                  `
                  : ""
              }


              <div class="order-controls">

                <select
                  class="status-select"
                  onchange="changeOrderStatus(
                    '${order.id}',
                    this.value
                  )"
                >

                  ${
                    statusOptions
                      .map(
                        ([value,label]) =>
                          `
                            <option
                              value="${value}"
                              ${
                                value === status
                                  ? "selected"
                                  : ""
                              }
                            >
                              ${label}
                            </option>
                          `
                      )
                      .join("")
                  }

                </select>


                <a
                  href="${toWhatsApp(
                    order.phone
                  )}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="whatsapp-order"
                >
                  💬 WhatsApp
                </a>


                ${
                  order.reference_url
                    ? `
                      <a
                        href="${escapeHTML(
                          order.reference_url
                        )}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="whatsapp-order"
                      >
                        🔗 المرجع
                      </a>
                    `
                    : ""
                }


                <button
                  class="danger-btn"
                  onclick="deleteOrder('${order.id}')"
                >
                  حذف
                </button>

              </div>

            </article>
          `;

        }
      )
      .join("");

}


window.changeOrderStatus =
  async function(
    id,
    status
  ) {

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
        "تعذر تغيير حالة الطلب."
      );

      return;

    }

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


    await loadOrders();

  };


/* =========================================
   MESSAGES
========================================= */

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

    list.innerHTML =
      `
        <div class="empty">
          حدث خطأ في تحميل الرسائل.
        </div>
      `;

    return;

  }


  document.getElementById(
    "messagesCount"
  ).textContent =
    data.length;


  document.getElementById(
    "messagesBadge"
  ).textContent =
    data.length;


  if (!data.length) {

    list.innerHTML =
      `
        <div class="empty">
          لا توجد رسائل حاليًا.
        </div>
      `;

    return;

  }


  list.innerHTML =
    data
      .map(
        (message) => {

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
                    📞 ${escapeHTML(
                      message.phone ||
                      "-"
                    )}
                  </div>

                </div>


                <div class="order-date">
                  ${escapeHTML(
                    formatDate(
                      message.created_at
                    )
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


              <div class="order-controls">

                <button
                  class="status-select"
                  onclick="toggleMessage('${message.id}','${escapeHTML(message.status || "new")}')"
                >
                  ${
                    message.status === "read"
                      ? "↩️ غير مقروءة"
                      : "✅ تمت القراءة"
                  }
                </button>


                <button
                  class="danger-btn"
                  onclick="deleteMessage('${message.id}')"
                >
                  حذف
                </button>

              </div>

            </article>
          `;

        }
      )
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
        "تعذر تغيير حالة الرسالة."
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
        "تعذر حذف الرسالة."
      );

      return;

    }


    await loadMessages();

  };


/* =========================================
   LOAD ALL
========================================= */

async function loadEverything() {

  await Promise.all([

    loadSettings(),

    loadServices(),

    loadProjects(),

    loadOrders(),

    loadMessages()

  ]);

}


/* =========================================
   START
========================================= */

checkSession();
