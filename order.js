const SUPABASE_URL =
  "https://zpwxmpznlqprzcumuvkj.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_MlvybKumgpht1Q9blEIByw_I1yCyW30";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


const form =
  document.getElementById("orderForm");

const submitButton =
  document.getElementById("submitOrder");

const orderMessage =
  document.getElementById("orderMessage");


form.addEventListener("submit", async (event) => {

  event.preventDefault();

  submitButton.disabled = true;
  submitButton.textContent = "جاري إرسال الطلب...";

  orderMessage.textContent = "";
  orderMessage.className = "order-message";


  const order = {

    full_name:
      document.getElementById("fullName").value.trim(),

    phone:
      document.getElementById("phone").value.trim(),

    email:
      document.getElementById("email").value.trim(),

    business_name:
      document.getElementById("businessName").value.trim(),

    business_type:
      document.getElementById("businessType").value.trim(),

    website_type:
      document.getElementById("websiteType").value,

    idea:
      document.getElementById("idea").value.trim(),

    pages:
      document.getElementById("pages").value.trim(),

    features:
      document.getElementById("features").value.trim(),

    budget:
      document.getElementById("budget").value,

    deadline:
      document.getElementById("deadline").value.trim(),

    instagram:
      document.getElementById("instagram").value.trim(),

    reference_url:
      document.getElementById("referenceUrl").value.trim(),

    notes:
      document.getElementById("notes").value.trim(),

    status: "new"

  };


  const {
    error
  } = await db
    .from("orders")
    .insert([order]);


  submitButton.disabled = false;
  submitButton.textContent =
    "إرسال الطلب 🚀";


  if (error) {

    console.error(error);

    orderMessage.textContent =
      "حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.";

    orderMessage.className =
      "order-message error";

    return;
  }


  orderMessage.textContent =
    "✅ تم إرسال طلبك بنجاح! سنتواصل معك قريبًا.";

  orderMessage.className =
    "order-message success";


  form.reset();

});
