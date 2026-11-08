
/* =========================================================
   RAGHAVENDRA ONLINE STORE
   Supabase configuration
   ========================================================= */

const SUPABASE_URL = "https://qmpvfwdinfhfzpughsam.supabase.co";

// Paste your actual sb_publishable_ key below.
const SUPABASE_ANON_KEY = "PASTE_YOUR_ACTUAL_PUBLISHABLE_KEY_HERE";

if (!window.supabase) {
  throw new Error("Supabase library failed to load.");
}

if (
  !SUPABASE_ANON_KEY.startsWith("sb_publishable_") ||
  SUPABASE_ANON_KEY.includes("PASTE_YOUR")
) {
  throw new Error("Please configure your actual Supabase Publishable Key.");
}

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

/* =========================================================
   SHOP CONFIGURATION
   ========================================================= */

const SHOP_WHATSAPP_NUMBER = "919182368811";

let products = [];
let categories = [];
let language = "en";
let activeCategory = "All";
let cart = {};
let activeProductId = null;

const $ = id => document.getElementById(id);
const t = (en, te) => language === "te" ? te : en;

/* =========================================================
   HELPERS
   ========================================================= */

function esc(value = "") {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);
}

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2
  })}`;
}

function categoryName(product) {
  return product.categories?.name ||
    categories.find(c => c.id === product.category_id)?.name ||
    t("Products", "ఉత్పత్తులు");
}

/* =========================================================
   LANGUAGE
   ========================================================= */

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

  const p = products.find(x => x.id === activeProductId);

  if (p && !$("productDetails").hidden) {
    renderDetails(p);
  }
}

/* =========================================================
   CATEGORIES
   ========================================================= */

function renderCategories() {
  const items = [
    { id: "All", name: t("All products", "అన్ని ఉత్పత్తులు") },
    ...categories
  ];

  $("categoryFilters").innerHTML = items.map(c => `
    <button
      class="filter-button ${activeCategory === c.id ? "active" : ""}"
      type="button"
      data-category="${esc(c.id)}">
      ${esc(c.name)}
    </button>
  `).join("");

  $("categoryFilters").querySelectorAll("[data-category]")
    .forEach(button => {
      button.addEventListener("click", () => {
        activeCategory = button.dataset.category;
        renderCategories();
        renderProducts();
      });
    });
}

/* =========================================================
   PRODUCTS
   ========================================================= */

function renderProducts() {
  const q = $("searchInput").value.trim().toLocaleLowerCase();

  const list = products.filter(p => {
    const categoryOk =
      activeCategory === "All" ||
      p.category_id === activeCategory;

    const searchOk =
      !q ||
      [p.name, p.description, categoryName(p)]
        .some(v => String(v || "").toLocaleLowerCase().includes(q));

    return categoryOk && searchOk;
  });

  $("productGrid").innerHTML = list.length
    ? list.map(p => `
      <article class="product-card"
        data-product="${esc(p.id)}"
        tabindex="0"
        role="button"
        aria-label="${esc(t("View product details", "ఉత్పత్తి వివరాలను చూడండి"))}: ${esc(p.name)}">

        <div class="product-visual">
          ${p.image_url
            ? `<img src="${esc(p.image_url)}"
                alt="${esc(p.name)}" loading="lazy">`
            : `<div class="image-placeholder">
                ${esc(t("Product image", "ఉత్పత్తి చిత్రం"))}
               </div>`
          }
        </div>

        <p class="product-category">${esc(categoryName(p))}</p>
        <h3>${esc(p.name)}</h3>
        <p class="product-meta">${esc(p.description || "")}</p>

        <div class="product-bottom">
          <span class="price-label">${money(p.price)}</span>
          <button class="add-button"
            type="button"
            data-add="${esc(p.id)}"
            ${Number(p.stock_quantity) <= 0 ? "disabled" : ""}>+</button>
        </div>

        <p class="product-meta">
          ${esc(t(`In stock: ${p.stock_quantity}`, `స్టాక్: ${p.stock_quantity}`))}
          · ${esc(t("Delivery charges extra", "డెలివరీ ఛార్జీలు అదనం"))}
        </p>

        <span class="view-details">
          ${esc(t("View details ↗", "వివరాలు చూడండి ↗"))}
        </span>
      </article>
    `).join("")
    : `<div class="empty-results">
        ${esc(t("No products found. Try another search.", "ఉత్పత్తులు కనిపించలేదు. మరోసారి వెతకండి."))}
       </div>`;

  $("productGrid").querySelectorAll("[data-add]")
    .forEach(button => {
      button.addEventListener("click", event => {
        event.stopPropagation();
        addToCart(button.dataset.add);
      });
    });
}

/* =========================================================
   PRODUCT SHARING
   ========================================================= */

function productShareUrl(product) {
  const url = new URL(window.location.href);
  url.hash = `product-${product.id}`;
  return url.toString();
}

function productShareText(product) {
  return `${product.name} — ${money(product.price)}
Raghavendra Kirana & General Store
${productShareUrl(product)}`;
}

async function copyProductLink(url) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(url);
  } else {
    const field = document.createElement("textarea");
    field.value = url;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();

    if (!copied) throw new Error("Copy failed");
  }

  toast(t("Product link copied. Share it anywhere!", "ఉత్పత్తి లింక్ కాపీ అయింది."));
}

async function shareActiveProduct() {
  const product = products.find(p => p.id === activeProductId);
  if (!product) return;

  const url = productShareUrl(product);

  if (navigator.share) {
    try {
      await navigator.share({
        title: `${product.name} | Raghavendra Kirana`,
        text: productShareText(product),
        url
      });
    } catch (error) {
      if (error.name !== "AbortError") {
        toast(t("Sharing failed.", "షేర్ చేయడం విఫలమైంది."));
      }
    }
  } else {
    try {
      await copyProductLink(url);
    } catch {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(productShareText(product))}`,
        "_blank",
        "noopener"
      );
    }
  }
}

/* =========================================================
   PRODUCT DETAILS
   ========================================================= */

function renderDetails(p) {
  activeProductId = p.id;

  $("detailMainImage").src = p.image_url || "";
  $("detailMainImage").alt = p.name;
  $("detailEyebrow").textContent = categoryName(p);
  $("detailName").textContent = p.name;
  $("detailDescription").textContent = p.description || "";
  $("detailPrice").textContent = money(p.price);

  $("detailStock").textContent =
    Number(p.stock_quantity) > 0
      ? t(`Available stock: ${p.stock_quantity}`, `అందుబాటులో ఉన్న స్టాక్: ${p.stock_quantity}`)
      : t("Out of stock", "స్టాక్ లేదు");

  $("detailAddLabel").textContent =
    `${t("Add to Bag", "బ్యాగ్‌లో జోడించండి")} · ${money(p.price)}`;

  $("detailAddToBag").disabled = Number(p.stock_quantity) <= 0;

  $("detailSpecifications").innerHTML = `
    <div>
      <span>${esc(t("Category", "వర్గం"))}</span>
      <strong>${esc(categoryName(p))}</strong>
    </div>
    <div>
      <span>${esc(t("Price", "ధర"))}</span>
      <strong>${money(p.price)}</strong>
    </div>
    <div>
      <span>${esc(t("Available stock", "అందుబాటులో ఉన్న స్టాక్"))}</span>
      <strong>${Number(p.stock_quantity)}</strong>
    </div>
  `;

  $("detailThumbnails").innerHTML = p.image_url
    ? `<button type="button" class="selected"
         data-image="${esc(p.image_url)}">
         <img src="${esc(p.image_url)}" alt="${esc(p.name)}">
       </button>`
    : "";
}

function openProduct(id, push = true) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  closeCart();
  renderDetails(p);

  $("homePage").hidden = true;
  $("productDetails").hidden = false;

  if (push) {
    history.pushState({ page: "product", id }, "", `#product-${id}`);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function backToShop(push = true) {
  $("productDetails").hidden = true;
  $("homePage").hidden = false;
  activeProductId = null;

  if (push) history.pushState({ page: "home" }, "", "#shop");

  requestAnimationFrame(() => {
    $("shop").scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

/* =========================================================
   PRODUCT EVENTS
   ========================================================= */

$("productGrid").addEventListener("click", event => {
  if (event.target.closest("[data-add]")) return;

  const card = event.target.closest("[data-product]");
  if (card) openProduct(card.dataset.product);
});

$("productGrid").addEventListener("keydown", event => {
  const card = event.target.closest("[data-product]");

  if (card && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    openProduct(card.dataset.product);
  }
});

$("backToShop").addEventListener("click", () => backToShop());

$("detailThumbnails").addEventListener("click", event => {
  const button = event.target.closest("[data-image]");
  if (!button) return;

  $("detailMainImage").src = button.dataset.image;

  $("detailThumbnails").querySelectorAll("button")
    .forEach(b => b.classList.remove("selected"));

  button.classList.add("selected");
});

/* =========================================================
   CART
   ========================================================= */

function addToCart(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  if ((cart[id] || 0) >= Number(p.stock_quantity || 0)) {
    toast(t("Available stock limit reached.", "స్టాక్ పరిమితి చేరుకుంది."));
    return;
  }

  cart[id] = (cart[id] || 0) + 1;
  renderCart();
  toast(t("Added to your bag", "మీ బ్యాగ్‌లో చేర్చబడింది"));
}

function changeQty(id, delta) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  const next = (cart[id] || 0) + delta;

  if (next <= 0) {
    delete cart[id];
  } else if (next <= Number(p.stock_quantity || 0)) {
    cart[id] = next;
  } else {
    toast(t("Available stock limit reached.", "స్టాక్ పరిమితి చేరుకుంది."));
  }

  renderCart();
}

$("detailAddToBag").addEventListener("click", () => {
  if (activeProductId) {
    addToCart(activeProductId);
    openCart();
  }
});

$("shareProductButton").addEventListener("click", shareActiveProduct);

function renderCart() {
  const entries = Object.entries(cart);
  const count = entries.reduce((s, [, q]) => s + q, 0);

  const subtotal = entries.reduce((s, [id, q]) => {
    const p = products.find(x => x.id === id);
    return s + (p ? Number(p.price) * q : 0);
  }, 0);

  $("cartCount").textContent = count;
  $("cartTotal").textContent = money(subtotal);
  $("checkoutButton").disabled = !count;

  $("cartItems").innerHTML = entries.length
    ? entries.map(([id, q]) => {
        const p = products.find(x => x.id === id);
        if (!p) return "";

        return `
          <div class="cart-row">
            <div>
              <h3>${esc(p.name)}</h3>
              <small>${money(p.price)} × ${q} = ${money(Number(p.price) * q)}</small>
            </div>
            <div class="quantity-control">
              <button type="button" data-qty="${esc(id)}" data-delta="-1">−</button>
              <span>${q}</span>
              <button type="button" data-qty="${esc(id)}" data-delta="1">+</button>
            </div>
          </div>
        `;
      }).join("") +
      `<p class="product-meta">${esc(t("Delivery charges will be calculated separately.", "డెలివరీ ఛార్జీలు విడిగా లెక్కించబడతాయి."))}</p>`
    : `<div class="cart-empty">${esc(t("Your bag is empty.", "మీ బ్యాగ్ ఖాళీగా ఉంది."))}</div>`;

  $("cartItems").querySelectorAll("[data-qty]").forEach(button => {
    button.addEventListener("click", () => {
      changeQty(button.dataset.qty, Number(button.dataset.delta));
    });
  });
}

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

/* =========================================================
   WHATSAPP CHECKOUT
   ========================================================= */

function orderMessage() {
  const entries = Object.entries(cart);

  const lines = entries.map(([id, q]) => {
    const p = products.find(x => x.id === id);
    return p ? `• ${p.name} × ${q} = ${money(Number(p.price) * q)}` : "";
  }).filter(Boolean);

  const total = entries.reduce((s, [id, q]) => {
    const p = products.find(x => x.id === id);
    return s + (p ? Number(p.price) * q : 0);
  }, 0);

  return `Hello Raghavendra Kirana & General Store,

I would like to place an order:

${lines.join("\n")}

Subtotal: ${money(total)}
Delivery charges: Extra (to be confirmed)
Final total: To be confirmed by the shop.

Please confirm availability, delivery charges and payment details.

Order preference: [Pickup / Delivery]
Customer name: [Your name]
Delivery address (if required): [Your address]

Thank you.`;
}

function checkout() {
  if (!Object.keys(cart).length) return;

  const number = SHOP_WHATSAPP_NUMBER.replace(/\D/g, "");

  if (!/^91\d{10}$/.test(number)) {
    toast(t("Please verify the shop WhatsApp number.", "షాప్ వాట్సాప్ నంబర్‌ను తనిఖీ చేయండి."));
    return;
  }

  const opened = window.open(
    `https://wa.me/${number}?text=${encodeURIComponent(orderMessage())}`,
    "_blank"
  );

  if (!opened) {
    toast(t("Allow pop-ups to open WhatsApp.", "వాట్సాప్ తెరవడానికి పాప్-అప్‌లను అనుమతించండి."));
  }
}

/* =========================================================
   TOAST
   ========================================================= */

let toastTimer;

function toast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    $("toast").classList.remove("show");
  }, 2600);
}

/* =========================================================
   SUPABASE ERROR DIAGNOSTICS
   ========================================================= */

function displaySupabaseError(title, error) {
  console.error(title, error);

  $("catalogueStatus").textContent = [
    title,
    error?.message || "Unknown error",
    `Code: ${error?.code || "Unknown"}`,
    `Details: ${error?.details || "None"}`,
    `Hint: ${error?.hint || "None"}`
  ].join(" | ");

  $("productGrid").innerHTML = "";
}

/* =========================================================
   LOAD CATALOGUE
   ========================================================= */

async function loadCatalogue() {
  $("catalogueStatus").textContent = "Checking Supabase connection...";

  try {
    const catRes = await db
      .from("categories")
      .select("id,name")
      .order("name");

    console.log("CATEGORY RESULT:", catRes);

    const prodRes = await db
      .from("products")
      .select("id,name,description,price,stock_quantity,image_url,category_id,is_active")
      .eq("is_active", true)
      .gt("stock_quantity", 0);

    console.log("PRODUCT RESULT:", prodRes);

    if (prodRes.error) {
      displaySupabaseError("PRODUCT QUERY FAILED", prodRes.error);
      return;
    }

    products = prodRes.data || [];

    if (catRes.error) {
      categories = [];
      console.error("CATEGORY QUERY FAILED:", catRes.error);
    } else {
      categories = catRes.data || [];
    }

    $("catalogueStatus").textContent =
      `Connection successful! ${products.length} products loaded.` +
      (catRes.error ? " Categories could not be loaded." : "");

    renderCategories();
    renderProducts();

    const match = location.hash.match(/^#product-(.+)$/);

    if (match && products.some(p => p.id === match[1])) {
      openProduct(match[1], false);
    }

    console.log("CATALOGUE LOADED:", {
      categories: categories.length,
      products: products.length
    });

  } catch (error) {
    displaySupabaseError("CONNECTION FAILED", error);
  }
}

/* =========================================================
   INITIALIZATION
   ========================================================= */

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
  toast(t("Your bag has been cleared.", "మీ బ్యాగ్ ఖాళీ చేయబడింది."));
});

window.addEventListener("popstate", () => {
  const match = location.hash.match(/^#product-(.+)$/);

  if (match && products.some(p => p.id === match[1])) {
    openProduct(match[1], false);
  } else {
    backToShop(false);
  }
});

$("year").textContent = new Date().getFullYear();

renderLanguage();
loadCatalogue();
