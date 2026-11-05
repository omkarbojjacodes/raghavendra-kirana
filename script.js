/* Raghavendra Kirana & General Store — catalogue and cart */
const SHOP_WHATSAPP_NUMBER = "919182368811"; // Verify this is the shop's complete WhatsApp number: 91 + 10 digits.

const products = [{
  id: "golki-covers",
  name: { en: "GOLKI COVERS", te: "గోల్కి కవర్లు" },
  category: "Accessories",
  categoryTe: "మొబైల్ ఉపకరణాలు",
  detail: {
    en: "Black silicone back cover with raised 3D coffee-cup design for Nothing Phone 4b 5G (confirm exact fit).",
    te: "3D కాఫీ కప్ డిజైన్‌తో బ్లాక్ సిలికాన్ బ్యాక్ కవర్ (ఫోన్‌కు సరిపోతుందో నిర్ధారించండి)."
  },
  price: 219,
  images: ["golki-cover-1.jpg", "golki-cover-2.jpg", "golki-cover-3.jpg", "golki-cover-4.jpg"]
}];

const categories = [
  { id: "All", en: "All products", te: "అన్ని ఉత్పత్తులు" },
  { id: "Accessories", en: "Mobile Accessories", te: "మొబైల్ ఉపకరణాలు" }
];

let language = "en";
let activeCategory = "All";
let cart = {};

const $ = id => document.getElementById(id);
const t = (en, te) => language === "te" ? te : en;
const productName = product => product.name[language];

function renderLanguage() {
  document.documentElement.lang = language === "te" ? "te" : "en";

  document.querySelectorAll("[data-en][data-te]").forEach(el => {
    el.innerHTML = el.dataset[language];
  });

  $("languageToggle").textContent = language === "en" ? "తెలుగు" : "English";
  $("searchInput").placeholder = t("Search products…", "ఉత్పత్తులను వెతకండి…");

  renderCategories();
  renderProducts();
  renderCart();
}

function renderCategories() {
  $("categoryFilters").innerHTML = categories.map(category => `
    <button class="filter-button ${activeCategory === category.id ? "active" : ""}"
      type="button" data-category="${category.id}">
      ${t(category.en, category.te)}
    </button>`).join("");

  $("categoryFilters").querySelectorAll("[data-category]").forEach(button => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      renderCategories();
      renderProducts();
    });
  });
}

function renderProducts() {
  const query = $("searchInput").value.trim().toLocaleLowerCase();

  const filtered = products.filter(product => {
    const categoryMatch =
      activeCategory === "All" || product.category === activeCategory;

    const searchMatch =
      !query ||
      product.name.en.toLowerCase().includes(query) ||
      product.name.te.includes(query) ||
      product.detail.en.toLowerCase().includes(query) ||
      product.detail.te.includes(query);

    return categoryMatch && searchMatch;
  });

  $("productGrid").innerHTML = filtered.length ? filtered.map(product => `
    <article class="product-card" data-product="${product.id}" tabindex="0" role="button"
      aria-label="${t("View product details", "ఉత్పత్తి వివరాలను చూడండి")}: ${productName(product)}">

      <div class="product-visual">
        <img src="${product.images[0]}"
          alt="GOLKI COVERS black 3D coffee design phone cover"
          loading="lazy">
      </div>

      <p class="product-category">${t(product.category, product.categoryTe)}</p>
      <h3>${productName(product)}</h3>
      <p class="product-meta">${product.detail[language]}</p>

      <div class="product-bottom">
        <span class="price-label">₹${product.price}</span>
        <button class="add-button" type="button" data-add="${product.id}"
          aria-label="${t("Add to bag", "బ్యాగ్‌లో జోడించండి")}">+</button>
      </div>

      <p class="product-meta">${t("Delivery charges extra", "డెలివరీ ఛార్జీలు అదనం")}</p>
      <span class="view-details">${t("View details ↗", "వివరాలు చూడండి ↗")}</span>
    </article>`).join("") : `
      <div class="empty-results">
        ${t("No products found. Try another search.", "ఉత్పత్తులు కనిపించలేదు. మరోసారి వెతకండి.")}
      </div>`;

  $("productGrid").querySelectorAll("[data-add]").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      addToCart(button.dataset.add);
    });
  });
}

function openProductDetails(id, updateHistory = true) {
  if (!products.some(product => product.id === id)) return;

  closeCart();
  $("homePage").hidden = true;
  $("productDetails").hidden = false;

  if (updateHistory) {
    history.pushState(
      { page: "product", productId: id },
      "",
      `#product-${id}`
    );
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function returnToShop(updateHistory = true) {
  $("productDetails").hidden = true;
  $("homePage").hidden = false;

  if (updateHistory) {
    history.pushState({ page: "home" }, "", "#shop");
  }

  requestAnimationFrame(() => {
    $("shop").scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

/* Product card navigation */
$("productGrid").addEventListener("click", event => {
  if (event.target.closest("[data-add]")) return;

  const card = event.target.closest("[data-product]");
  if (card) openProductDetails(card.dataset.product);
});

$("productGrid").addEventListener("keydown", event => {
  if (event.target.closest("[data-add]")) return;

  const card = event.target.closest("[data-product]");

  if (card && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    openProductDetails(card.dataset.product);
  }
});

$("backToShop").addEventListener("click", () => returnToShop());

/* Product image gallery */
$("detailThumbnails").addEventListener("click", event => {
  const button = event.target.closest("[data-image]");
  if (!button) return;

  $("detailMainImage").src = button.dataset.image;

  $("detailThumbnails").querySelectorAll("button").forEach(item => {
    item.classList.remove("selected");
  });

  button.classList.add("selected");
});

/* Cart functions */
function addToCart(id) {
  if (!products.some(product => product.id === id)) return;

  cart[id] = (cart[id] || 0) + 1;
  renderCart();

  showToast(t("Added to your bag", "మీ బ్యాగ్‌లో చేర్చబడింది"));
}

function changeQty(id, delta) {
  cart[id] = (cart[id] || 0) + delta;

  if (cart[id] <= 0) {
    delete cart[id];
  }

  renderCart();
}

$("detailAddToBag").addEventListener("click", () => {
  addToCart("golki-covers");
  openCart();
});

/* Cart display */
function renderCart() {
  const entries = Object.entries(cart);

  const count = entries.reduce((sum, [, qty]) => sum + qty, 0);

  const subtotal = entries.reduce((sum, [id, qty]) => {
    const product = products.find(item => item.id === id);
    return sum + (product ? product.price * qty : 0);
  }, 0);

  $("cartCount").textContent = count;
  $("cartTotal").textContent = `₹${subtotal}`;
  $("checkoutButton").disabled = count === 0;

  $("cartItems").innerHTML = entries.length
    ? entries.map(([id, qty]) => {
        const product = products.find(item => item.id === id);
        if (!product) return "";

        return `
          <div class="cart-row">
            <div>
              <h3>${productName(product)}</h3>
              <small>₹${product.price} × ${qty} = ₹${product.price * qty}</small>
            </div>

            <div class="quantity-control">
              <button type="button" data-qty="${id}" data-delta="-1"
                aria-label="Decrease quantity">−</button>
              <span>${qty}</span>
              <button type="button" data-qty="${id}" data-delta="1"
                aria-label="Increase quantity">+</button>
            </div>
          </div>`;
      }).join("") + `
        <p class="product-meta">
          ${t("Delivery charges will be calculated separately.", "డెలివరీ ఛార్జీలు విడిగా లెక్కించబడతాయి.")}
        </p>`
    : `<div class="cart-empty">${t("Your bag is empty.", "మీ బ్యాగ్ ఖాళీగా ఉంది.")}</div>`;

  $("cartItems").querySelectorAll("[data-qty]").forEach(button => {
    button.addEventListener("click", () => {
      changeQty(button.dataset.qty, Number(button.dataset.delta));
    });
  });
}

/* Open and close cart */
function openCart() {
  $("cartDrawer").classList.add("open");
  $("cartBackdrop").classList.add("open");
  $("cartDrawer").setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
}

function closeCart() {
  $("cartDrawer").classList.remove("open");
  $("cartBackdrop").classList.remove("open");
  $("cartDrawer").setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
}

/* WhatsApp order message */
function buildOrderMessage() {
  const entries = Object.entries(cart);

  const lines = entries.map(([id, qty]) => {
    const product = products.find(item => item.id === id);

    return `• ${product.name.en} / ${product.name.te} × ${qty} = ₹${product.price * qty}`;
  });

  const subtotal = entries.reduce((sum, [id, qty]) => {
    const product = products.find(item => item.id === id);
    return sum + product.price * qty;
  }, 0);

  return `Hello Raghavendra Kirana & General Store,

I would like to place an order:

${lines.join("\n")}

Subtotal: ₹${subtotal}
Delivery charges: Extra (to be confirmed)
Final total: To be confirmed by the shop.

Please confirm product availability, exact phone compatibility (if applicable), delivery charges and payment details.

Order preference: [Pickup / Delivery]
Customer name: [Your name]
Delivery address (if required): [Your address]

Thank you.`;
}

/* Checkout */
function checkout() {
  if (!Object.keys(cart).length) return;

  const number = SHOP_WHATSAPP_NUMBER.replace(/\D/g, "");

  if (!/^91\d{10}$/.test(number)) {
    showToast(t(
      "Please verify the complete shop WhatsApp number in script.js.",
      "script.js లో పూర్తి షాప్ వాట్సాప్ నంబర్‌ను తనిఖీ చేయండి."
    ));
    return;
  }

  const url =
    `https://wa.me/${number}?text=${encodeURIComponent(buildOrderMessage())}`;

  const opened = window.open(url, "_blank");

  if (!opened) {
    showToast(t(
      "Allow pop-ups to open WhatsApp.",
      "వాట్సాప్ తెరవడానికి పాప్-అప్‌లను అనుమతించండి."
    ));
  }
}

/* Toast message */
let toastTimer;

function showToast(message) {
  const element = $("toast");

  element.textContent = message;
  element.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    element.classList.remove("show");
  }, 2600);
}

/* Event listeners */
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

  showToast(t(
    "Your bag has been cleared.",
    "మీ బ్యాగ్ ఖాళీ చేయబడింది."
  ));
});

/* Browser back and forward */
window.addEventListener("popstate", () => {
  const productPage = location.hash === "#product-golki-covers";

  $("productDetails").hidden = !productPage;
  $("homePage").hidden = productPage;

  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* Initial setup */
$("year").textContent = new Date().getFullYear();

renderLanguage();

if (location.hash === "#product-golki-covers") {
  $("homePage").hidden = true;
  $("productDetails").hidden = false;
}
