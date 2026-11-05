
/* Raghavendra Kirana & General Store
   First product: GOLKI COVERS
   WhatsApp number is formatted with India's country code.
*/

// Your supplied 10-digit number with India's country code.
const SHOP_WHATSAPP_NUMBER = "919182368811";

const products = [
  {
    id: "golki-covers",
    name: {
      en: "GOLKI COVERS",
      te: "గోల్కి కవర్లు"
    },
    category: "Accessories",
    categoryTe: "మొబైల్ ఉపకరణాలు",
    symbol: "G",
    detail: {
      en: "Black Silicone Back Cover for Nothing Phone 4b 5G",
      te: "Nothing Phone 4b 5G కోసం బ్లాక్ సిలికాన్ బ్యాక్ కవర్"
    },
    price: 219
  }
];

const categories = [
  { id: "All", en: "All products", te: "అన్ని ఉత్పత్తులు" },
  { id: "Accessories", en: "Mobile Accessories", te: "మొబైల్ ఉపకరణాలు" }
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
    t("Search products…", "ఉత్పత్తులను వెతకండి…");

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
      p.detail.en.toLowerCase().includes(query) ||
      p.detail.te.includes(query);

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
          ${p.detail[language]}
        </p>

        <div class="product-bottom">
          <span class="price-label">₹${p.price}</span>

          <button class="add-button"
            type="button"
            data-add="${p.id}"
            aria-label="${t("Add", "జోడించు")} ${productName(p)}">+</button>
        </div>

        <p class="product-meta">
          ${t("Delivery charges extra", "డెలివరీ ఛార్జీలు అదనం")}
        </p>
      </article>
    `).join("")
    : `<div class="empty-results">
        ${t("No products found. Try another search.",
          "ఉత్పత్తులు కనిపించలేదు. మరోసారి వెతకండి.")}
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
              <small>₹${p.price} × ${qty} = ₹${p.price * qty}</small>
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
      }).join("") +
      `<p class="product-meta">
        ${t("Delivery charges will be calculated separately.",
          "డెలివరీ ఛార్జీలు విడిగా లెక్కించబడతాయి.")}
      </p>`
    : `<div class="cart-empty">
        ${t("Your bag is empty.", "మీ బ్యాగ్ ఖాళీగా ఉంది.")}<br>
        ${t("Add GOLKI COVERS to get started.",
          "ప్రారంభించడానికి గోల్కి కవర్లను జోడించండి.")}
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
  const entries = Object.entries(cart);

  const lines = entries.map(([id, qty]) => {
    const p = products.find(x => x.id === id);
    return `• ${p.name.en} / ${p.name.te} × ${qty} = ₹${p.price * qty}`;
  });

  const subtotal = entries.reduce((sum, [id, qty]) => {
    const p = products.find(x => x.id === id);
    return sum + p.price * qty;
  }, 0);

  return `Hello Raghavendra Kirana & General Store,

I would like to order:

${lines.join("\n")}

Subtotal: ₹${subtotal}
Delivery charges: Extra (to be confirmed)
Final total: To be confirmed by the shop.

Please confirm product availability and delivery charges before payment.

Order preference: [Pickup / Delivery]
Customer name: [Your name]
Delivery address: [Your address]

Thank you.`;
}

async function checkout() {
  if (!Object.keys(cart).length) return;

  const message = buildOrderMessage();
  const number = SHOP_WHATSAPP_NUMBER.replace(/\D/g, "");

  if (!/^91\d{10}$/.test(number)) {
    showToast(t(
      "Please check the WhatsApp number in script.js.",
      "script.js లో వాట్సాప్ నంబర్‌ను తనిఖీ చేయండి."
    ));
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
