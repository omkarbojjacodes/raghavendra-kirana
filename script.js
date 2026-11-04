
/* Raghavendra Kirana & General Store
   Configure the WhatsApp number below before publishing.
   India format: 91XXXXXXXXXX (no + or spaces).
*/

const SHOP_WHATSAPP_NUMBER = "9182368811";

const products = [
  {id:"rice", name:{en:"Rice",te:"బియ్యం"}, category:"Grains", categoryTe:"ధాన్యాలు", symbol:"రి", detail:{en:"Rice varieties",te:"వివిధ రకాల బియ్యం"}},
  {id:"idly-ravva", name:{en:"Idly Ravva",te:"ఇడ్లీ రవ్వ"}, category:"Grains", categoryTe:"ధాన్యాలు", symbol:"ఇ", detail:{en:"Kitchen staple",te:"వంటింటి అవసరం"}},
  {id:"kandhi-pappu", name:{en:"Kandhi Pappu",te:"కందిపప్పు"}, category:"Pulses", categoryTe:"పప్పులు", symbol:"క", detail:{en:"Toor dal",te:"కందిపప్పు"}},
  {id:"erra-pappu", name:{en:"Erra Pappu",te:"ఎర్ర పప్పు"}, category:"Pulses", categoryTe:"పప్పులు", symbol:"ఎ", detail:{en:"Red lentils",te:"ఎర్ర పప్పు"}},
  {id:"jeera", name:{en:"Jeera",te:"జీలకర్ర"}, category:"Spices", categoryTe:"మసాలాలు", symbol:"జీ", detail:{en:"Everyday spice",te:"రోజువారీ మసాలా"}},
  {id:"lavangam", name:{en:"Lavangam",te:"లవంగాలు"}, category:"Spices", categoryTe:"మసాలాలు", symbol:"ల", detail:{en:"Whole cloves",te:"మొత్తం లవంగాలు"}},
  {id:"sugar", name:{en:"Sugar",te:"చక్కెర"}, category:"Essentials", categoryTe:"నిత్యావసరాలు", symbol:"చ", detail:{en:"Daily essential",te:"రోజువారీ అవసరం"}},
  {id:"suji", name:{en:"Suji",te:"సూజీ"}, category:"Essentials", categoryTe:"నిత్యావసరాలు", symbol:"సూ", detail:{en:"Semolina",te:"రవ్వ"}},
  {id:"cooking-oil", name:{en:"Cooking Oil",te:"వంట నూనె"}, category:"Essentials", categoryTe:"నిత్యావసరాలు", symbol:"నూ", detail:{en:"Cooking essential",te:"వంటకు అవసరం"}},
  {id:"milk", name:{en:"Milk",te:"పాలు"}, category:"Fresh", categoryTe:"తాజా సరుకులు", symbol:"పా", detail:{en:"Local availability",te:"స్థానికంగా లభ్యత"}},
  {id:"curd", name:{en:"Curd",te:"పెరుగు"}, category:"Fresh", categoryTe:"తాజా సరుకులు", symbol:"పె", detail:{en:"Local availability",te:"స్థానికంగా లభ్యత"}},

  {id:"eggs", name:{en:"Eggs",te:"గుడ్లు"}, category:"Fresh", categoryTe:"తాజా సరుకులు", symbol:"గు", detail:{en:"Price per piece",te:"ఒక్క గుడ్డు ధర"}, price:8, unit:"piece"},

  {id:"thums-up", name:{en:"Thums Up",te:"థమ్స్ అప్"}, category:"Beverages", categoryTe:"పానీయాలు", symbol:"T", detail:{en:"Cold drink",te:"శీతల పానీయం"}, price:20},

  {id:"soap", name:{en:"Bathing Soap",te:"స్నానపు సబ్బు"}, category:"Home", categoryTe:"గృహోపయోగం", symbol:"స", detail:{en:"Personal care",te:"వ్యక్తిగత సంరక్షణ"}},
  {id:"dettol-soap", name:{en:"Dettol Soap",te:"డెట్టాల్ సబ్బు"}, category:"Home", categoryTe:"గృహోపయోగం", symbol:"D", detail:{en:"Personal care",te:"వ్యక్తిగత సంరక్షణ"}, price:10},
  {id:"household", name:{en:"Household Essentials",te:"ఇంటి అవసరాలు"}, category:"Home", categoryTe:"గృహోపయోగం", symbol:"ఇం", detail:{en:"Daily home needs",te:"రోజువారీ ఇంటి అవసరాలు"}}
];

const categories = [
  {id:"All",en:"All items",te:"అన్ని"},
  {id:"Grains",en:"Grains",te:"ధాన్యాలు"},
  {id:"Pulses",en:"Pulses",te:"పప్పులు"},
  {id:"Spices",en:"Spices",te:"మసాలాలు"},
  {id:"Essentials",en:"Essentials",te:"నిత్యావసరాలు"},
  {id:"Beverages",en:"Beverages",te:"పానీయాలు"},
  {id:"Fresh",en:"Fresh",te:"తాజా సరుకులు"},
  {id:"Home",en:"Home",te:"గృహోపయోగం"}
];

let language = "en";
let activeCategory = "All";
let cart = {};

const $ = id => document.getElementById(id);

function t(en, te) {
  return language === "te" ? te : en;
}

function productName(p) {
  return p.name[language];
}

function renderLanguage() {
  document.documentElement.lang = language === "te" ? "te" : "en";

  document.querySelectorAll("[data-en][data-te]").forEach(el => {
    el.innerHTML = el.dataset[language];
  });

  $("languageToggle").textContent =
    language === "en" ? "తెలుగు" : "English";

  $("searchInput").placeholder =
    t("Search products…", "వస్తువులను వెతకండి…");

  renderCategories();
  renderProducts();
  renderCart();
}

function renderCategories() {
  $("categoryFilters").innerHTML = categories.map(c =>
    `<button class="filter-button ${activeCategory === c.id ? "active" : ""}"
      data-category="${c.id}">${t(c.en, c.te)}</button>`
  ).join("");

  $("categoryFilters").querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.category;
      renderCategories();
      renderProducts();
    });
  });
}

function renderProducts() {
  const query = $("searchInput").value.trim().toLocaleLowerCase();

  const filtered = products.filter(p => {
    const matchesCategory =
      activeCategory === "All" || p.category === activeCategory;

    const matchesQuery =
      !query ||
      p.name.en.toLowerCase().includes(query) ||
      p.name.te.includes(query) ||
      p.category.toLowerCase().includes(query);

    return matchesCategory && matchesQuery;
  });

  $("productGrid").innerHTML = filtered.length
    ? filtered.map(p => `
      <article class="product-card">
        <div class="product-visual">
          <span class="product-symbol">${p.symbol}</span>
        </div>

        <p class="product-category">
          ${t(p.category, p.categoryTe)}
        </p>

        <h3>${productName(p)}</h3>

        <p class="product-meta">
          ${p.detail[language]} ·
          ${t("Stock confirmation required", "స్టాక్ నిర్ధారణ అవసరం")}
        </p>

        <div class="product-bottom">
          <span class="price-label">
            ${p.price != null
              ? `₹${p.price}${p.unit ? " / " + p.unit : ""}`
              : t("Price on request", "ధర అడగండి")}
          </span>

          <button class="add-button"
            type="button"
            data-add="${p.id}"
            aria-label="${t("Add", "జోడించు")} ${productName(p)}">+</button>
        </div>
      </article>
    `).join("")
    : `<div class="empty-results">
        ${t("No products found. Try another search.",
          "వస్తువులు కనిపించలేదు. మరోసారి వెతకండి.")}
      </div>`;

  $("productGrid").querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => addToCart(btn.dataset.add));
  });
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
  showToast(t("Added to your bag", "మీ బ్యాగ్‌లో చేర్చబడింది"));
}

function changeQty(id, delta) {
  cart[id] = (cart[id] || 0) + delta;

  if (cart[id] <= 0) delete cart[id];

  renderCart();
}

function renderCart() {
  const entries = Object.entries(cart);

  const count = entries.reduce(
    (sum, [, qty]) => sum + qty, 0
  );

  $("cartCount").textContent = count;
  $("cartTotal").textContent = count;
  $("checkoutButton").disabled = count === 0;

  $("cartItems").innerHTML = entries.length
    ? entries.map(([id, qty]) => {
        const p = products.find(x => x.id === id);

        return `
          <div class="cart-row">
            <div>
              <h3>${productName(p)}</h3>
              <small>
                ${p.price != null
                  ? `₹${p.price}${p.unit ? " / " + p.unit : ""}`
                  : t("Price and stock to be confirmed",
                      "ధర మరియు స్టాక్ నిర్ధారించాలి")}
              </small>
            </div>

            <div class="quantity-control">
              <button data-qty="${id}" data-delta="-1"
                aria-label="Decrease">−</button>
              <span>${qty}</span>
              <button data-qty="${id}" data-delta="1"
                aria-label="Increase">+</button>
            </div>
          </div>
        `;
      }).join("")
    : `<div class="cart-empty">
        ${t("Your bag is empty.", "మీ బ్యాగ్ ఖాళీగా ఉంది.")}<br>
        ${t("Add a few everyday essentials to get started.",
          "మొదలుపెట్టడానికి కొన్ని వస్తువులను జోడించండి.")}
      </div>`;

  $("cartItems").querySelectorAll("[data-qty]").forEach(btn => {
    btn.addEventListener("click", () =>
      changeQty(btn.dataset.qty, Number(btn.dataset.delta))
    );
  });
}

function openCart() {
  $("cartDrawer").classList.add("open");
  $("cartBackdrop").classList.add("open");
  $("cartDrawer").setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  $("cartDrawer").classList.remove("open");
  $("cartBackdrop").classList.remove("open");
  $("cartDrawer").setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function buildOrderMessage() {
  const lines = Object.entries(cart).map(([id, qty]) => {
    const p = products.find(x => x.id === id);
    return `• ${p.name.en} / ${p.name.te} × ${qty}`;
  });

  return `Hello Raghavendra Kirana & General Store,

I would like to place an order:
${lines.join("\n")}

Please confirm current prices, stock availability and the total amount.

Order preference: [Pickup / Local delivery]
Customer name: [Your name]
Delivery address (if required): [Your address]

Thank you.`;
}

async function checkout() {
  if (!Object.keys(cart).length) return;

  const message = buildOrderMessage();
  const number = SHOP_WHATSAPP_NUMBER.replace(/\D/g, "");

  if (
    !/^\d{10,15}$/.test(number) ||
    number === "91XXXXXXXXXX".replace(/\D/g, "")
  ) {
    try {
      await navigator.clipboard.writeText(message);

      showToast(t(
        "Order message copied. Add the shop WhatsApp number in script.js to open WhatsApp.",
        "ఆర్డర్ మెసేజ్ కాపీ అయింది. వాట్సాప్ తెరవడానికి script.js లో షాప్ నంబర్ జోడించండి."
      ));
    } catch {
      window.prompt(
        t("Copy your order message:", "మీ ఆర్డర్ మెసేజ్‌ను కాపీ చేయండి:"),
        message
      );
    }

    return;
  }

  const url =
    `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank", "noopener,noreferrer");
}

let toastTimer;

function showToast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(
    () => el.classList.remove("show"),
    2600
  );
}

$("languageToggle").addEventListener("click", () => {
  language = language === "en" ? "te" : "en";
  renderLanguage();
});

$("searchInput").addEventListener("input", renderProducts);
$("cartTrigger").addEventListener("click", openCart);
$("closeCart").addEventListener("click", closeCart);
$("cartBackdrop").addEventListener("click", closeCart);
$("checkoutButton").addEventListener("click", checkout);

$("clearCart").addEventListener("click", () => {
  cart = {};
  renderCart();
});

$("year").textContent = new Date().getFullYear();

renderLanguage();
