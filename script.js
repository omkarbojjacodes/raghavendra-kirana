/* Raghavendra Kirana — Supabase-powered customer storefront */

const SHOP_WHATSAPP_NUMBER = "919182368811";
const SUPABASE_URL = "https://qmpvfwdinfhfzpughsam.supabase.co";
const SUPABASE_KEY = "sb_publishable_u8og4u_4MLem7eefRXDcBA_JYJZiniAG";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let products = [];
let categories = [];
let language = "en";
let activeCategory = "All";
let cart = {};
let activeProductId = null;

const $ = id => document.getElementById(id);

const t = (en, te) => language === "te" ? te : en;

function esc(value = "") {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
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

function renderLanguage() {
  document.documentElement.lang = language === "te" ? "te" : "en";

  document.querySelectorAll("[data-en][data-te]").forEach(el => {
    el.innerHTML = el.dataset[language];
  });

  $("languageToggle").textContent =
    language === "en" ? "తెలుగు" : "English";

  $("searchInput").placeholder = t(
    "Search products…",
    "ఉత్పత్తులను వెతకండి…"
  );

  renderCategories();
  renderProducts();
  renderCart();

  const product = products.find(x => x.id === activeProductId);

  if (product && !$("productDetails").hidden) {
    renderDetails(product);
  }
}

function renderCategories() {
  const items = [
    {
      id: "All",
      name: t("All products", "అన్ని ఉత్పత్తులు")
    },
    ...categories
  ];

  $("categoryFilters").innerHTML = items.map(c => `
    <button
      class="filter-button ${activeCategory === c.id ? "active" : ""}"
      type="button"
      data-category="${esc(c.id)}"
    >
      ${esc(c.name)}
    </button>
  `).join("");

  $("categoryFilters")
    .querySelectorAll("[data-category]")
    .forEach(button => {
      button.addEventListener("click", () => {
        activeCategory = button.dataset.category;
        renderCategories();
        renderProducts();
      });
    });
}

/* PRODUCT LIST */

function renderProducts() {
  const query = $("searchInput").value.trim().toLocaleLowerCase();

  const list = products.filter(product => {
    const categoryOk =
      activeCategory === "All" ||
      product.category_id === activeCategory;

    const searchOk =
      !query ||
      [
        product.name,
        product.description,
        categoryName(product)
      ].some(value =>
        String(value || "").toLocaleLowerCase().includes(query)
      );

    return categoryOk && searchOk;
  });

  $("productGrid").innerHTML = list.length
    ? list.map(product => {
        const description = String(product.description || "");
        const needsToggle = description.length > 180;

        return `
          <article
            class="product-card"
            data-product="${esc(product.id)}"
            tabindex="0"
            role="button"
            aria-label="${esc(t(
              "View product details",
              "ఉత్పత్తి వివరాలను చూడండి"
            ))}: ${esc(product.name)}"
          >

            <div class="product-visual">
              ${
                product.image_url
                  ? `<img
                      src="${esc(product.image_url)}"
                      alt="${esc(product.name)}"
                      loading="lazy"
                    >`
                  : `<div class="image-placeholder">
                      ${esc(t("Product image", "ఉత్పత్తి చిత్రం"))}
                    </div>`
              }
            </div>

            <p class="product-category">
              ${esc(categoryName(product))}
            </p>

            <h3>${esc(product.name)}</h3>

            <p class="product-card-description product-meta">
              ${esc(description)}
            </p>

            ${
              needsToggle
                ? `<button
                    class="description-toggle"
                    type="button"
                    data-description-toggle="${esc(product.id)}"
                    aria-expanded="false"
                  >
                    ${esc(t("Read more", "మరింత చదవండి"))}
                  </button>`
                : ""
            }

            <div class="product-bottom">
              <span class="price-label">
                ${money(product.price)}
              </span>

              <button
                class="add-button"
                type="button"
                data-add="${esc(product.id)}"
                aria-label="${esc(t(
                  "Add to bag",
                  "బ్యాగ్‌లో జోడించండి"
                ))}"
                ${Number(product.stock_quantity) <= 0 ? "disabled" : ""}
              >
                +
              </button>
            </div>

            <p class="product-meta">
              ${esc(t(
                `In stock: ${product.stock_quantity}`,
                `స్టాక్: ${product.stock_quantity}`
              ))}
              ·
              ${esc(t(
                "Delivery charges extra",
                "డెలివరీ ఛార్జీలు అదనం"
              ))}
            </p>

            <span class="view-details">
              ${esc(t("View details ↗", "వివరాలు చూడండి ↗"))}
            </span>

          </article>
        `;
      }).join("")
    : `
      <div class="empty-results">
        ${esc(t(
          "No products found. Try another search.",
          "ఉత్పత్తులు కనిపించలేదు. మరోసారి వెతకండి."
        ))}
      </div>
    `;
}

/* PRODUCT SHARING */

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

async function shareActiveProduct() {
  const product = products.find(p => p.id === activeProductId);

  if (!product) return;

  const url = productShareUrl(product);
  const title = `${product.name} | Raghavendra Kirana`;

  const text = `${product.name} — ${money(product.price)}
Raghavendra Kirana & General Store`;

  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url
      });
    } catch (error) {
      if (error && error.name !== "AbortError") {
        try {
          await copyProductLink(url);
        } catch (_) {
          toast(t(
            "Couldn't open sharing. Please copy the product link from your browser.",
            "షేర్ చేయలేకపోయాం. బ్రౌజర్ నుంచి ఉత్పత్తి లింక్‌ను కాపీ చేయండి."
          ));
        }
      }
    }
  } else {
    try {
      await copyProductLink(url);
    } catch (_) {
      const waUrl =
        `https://wa.me/?text=${encodeURIComponent(productShareText(product))}`;

      window.open(waUrl, "_blank", "noopener");
    }
  }
}

async function copyProductLink(url) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(url);

    toast(t(
      "Product link copied. Share it anywhere!",
      "ఉత్పత్తి లింక్ కాపీ అయింది. ఎక్కడైనా షేర్ చేయండి!"
    ));

    return;
  }

  const field = document.createElement("textarea");

  field.value = url;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";

  document.body.appendChild(field);
  field.select();

  const copied = document.execCommand("copy");

  field.remove();

  if (!copied) {
    throw new Error("Copy failed");
  }

  toast(t(
    "Product link copied. Share it anywhere!",
    "ఉత్పత్తి లింక్ కాపీ అయింది. ఎక్కడైనా షేర్ చేయండి!"
  ));
}

/* PRODUCT DETAILS */

function renderDetails(product) {
  activeProductId = product.id;

  $("detailMainImage").src = product.image_url || "";
  $("detailMainImage").alt = product.name;

  $("detailEyebrow").textContent = categoryName(product);
  $("detailName").textContent = product.name;
  $("detailDescription").textContent = product.description || "";
  $("detailPrice").textContent = money(product.price);

  $("detailStock").textContent =
    Number(product.stock_quantity) > 0
      ? t(
          `Available stock: ${product.stock_quantity}`,
          `అందుబాటులో ఉన్న స్టాక్: ${product.stock_quantity}`
        )
      : t("Out of stock", "స్టాక్ లేదు");

  $("detailAddLabel").textContent =
    `${t("Add to Bag", "బ్యాగ్‌లో జోడించండి")} · ${money(product.price)}`;

  $("detailAddToBag").disabled =
    Number(product.stock_quantity) <= 0;

  $("detailSpecifications").innerHTML = `
    <div>
      <span>${esc(t("Category", "వర్గం"))}</span>
      <strong>${esc(categoryName(product))}</strong>
    </div>

    <div>
      <span>${esc(t("Price", "ధర"))}</span>
      <strong>${money(product.price)}</strong>
    </div>

    <div>
      <span>${esc(t("Available stock", "అందుబాటులో ఉన్న స్టాక్"))}</span>
      <strong>${Number(product.stock_quantity)}</strong>
    </div>
  `;

  $("detailThumbnails").innerHTML = product.image_url
    ? `
      <button
        type="button"
        class="selected"
        data-image="${esc(product.image_url)}"
      >
        <img
          src="${esc(product.image_url)}"
          alt="${esc(product.name)}"
        >
      </button>
    `
    : "";
}

function openProduct(id, push = true) {
  const product = products.find(x => x.id === id);

  if (!product) return;

  closeCart();

  renderDetails(product);

  $("homePage").hidden = true;
  $("productDetails").hidden = false;

  if (push) {
    history.pushState(
      { page: "product", id },
      "",
      `#product-${id}`
    );
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function backToShop(push = true) {
  $("productDetails").hidden = true;
  $("homePage").hidden = false;

  activeProductId = null;

  if (push) {
    history.pushState(
      { page: "home" },
      "",
      "#shop"
    );
  }

  requestAnimationFrame(() => {
    $("shop").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}

/* PRODUCT GRID EVENTS */

$("productGrid").addEventListener("click", event => {

  /* Read more / Read less */
  const toggle = event.target.closest("[data-description-toggle]");

  if (toggle) {
    event.stopPropagation();

    const card = toggle.closest(".product-card");
    const description = card.querySelector(".product-card-description");

    const expanded = description.classList.toggle("expanded");

    toggle.textContent = expanded
      ? t("Read less", "తక్కువ చదవండి")
      : t("Read more", "మరింత చదవండి");

    toggle.setAttribute("aria-expanded", String(expanded));

    return;
  }

  /* Add to bag */
  const addButton = event.target.closest("[data-add]");

  if (addButton) {
    event.stopPropagation();
    addToCart(addButton.dataset.add);
    return;
  }

  /* Open product details */
  const card = event.target.closest("[data-product]");

  if (card) {
    openProduct(card.dataset.product);
  }
});

$("productGrid").addEventListener("keydown", event => {
  const card = event.target.closest("[data-product]");

  if (
    card &&
    event.target === card &&
    (event.key === "Enter" || event.key === " ")
  ) {
    event.preventDefault();
    openProduct(card.dataset.product);
  }
});

$("backToShop").addEventListener("click", () => backToShop());

$("detailThumbnails").addEventListener("click", event => {
  const button = event.target.closest("[data-image]");

  if (!button) return;

  $("detailMainImage").src = button.dataset.image;

  $("detailThumbnails")
    .querySelectorAll("button")
    .forEach(item => item.classList.remove("selected"));

  button.classList.add("selected");
});

/* SHOPPING CART */

function addToCart(id) {
  const product = products.find(x => x.id === id);

  if (!product) return;

  if ((cart[id] || 0) >= Number(product.stock_quantity || 0)) {
    toast(t(
      "Available stock limit reached.",
      "అందుబాటులో ఉన్న స్టాక్ పరిమితి చేరుకుంది."
    ));

    return;
  }

  cart[id] = (cart[id] || 0) + 1;

  renderCart();

  toast(t(
    "Added to your bag",
    "మీ బ్యాగ్‌లో చేర్చబడింది"
  ));
}

function changeQty(id, delta) {
  const product = products.find(x => x.id === id);

  if (!product) return;

  const next = (cart[id] || 0) + delta;

  if (next <= 0) {
    delete cart[id];
  } else if (next <= Number(product.stock_quantity || 0)) {
    cart[id] = next;
  } else {
    toast(t(
      "Available stock limit reached.",
      "అందుబాటులో ఉన్న స్టాక్ పరిమితి చేరుకుంది."
    ));
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

  const count = entries.reduce(
    (sum, [, quantity]) => sum + quantity,
    0
  );

  const subtotal = entries.reduce((sum, [id, quantity]) => {
    const product = products.find(x => x.id === id);

    return sum + (
      product
        ? Number(product.price) * quantity
        : 0
    );
  }, 0);

  $("cartCount").textContent = count;
  $("cartTotal").textContent = money(subtotal);
  $("checkoutButton").disabled = !count;

  $("cartItems").innerHTML = entries.length
    ? entries.map(([id, quantity]) => {
        const product = products.find(x => x.id === id);

        if (!product) return "";

        return `
          <div class="cart-row">
            <div>
              <h3>${esc(product.name)}</h3>
              <small>
                ${money(product.price)} × ${quantity}
                = ${money(Number(product.price) * quantity)}
              </small>
            </div>

            <div class="quantity-control">
              <button
                type="button"
                data-qty="${esc(id)}"
                data-delta="-1"
              >−</button>

              <span>${quantity}</span>

              <button
                type="button"
                data-qty="${esc(id)}"
                data-delta="1"
              >+</button>
            </div>
          </div>
        `;
      }).join("") +
      `
        <p class="product-meta">
          ${esc(t(
            "Delivery charges will be calculated separately.",
            "డెలివరీ ఛార్జీలు విడిగా లెక్కించబడతాయి."
          ))}
        </p>
      `
    : `
      <div class="cart-empty">
        ${esc(t("Your bag is empty.", "మీ బ్యాగ్ ఖాళీగా ఉంది."))}
      </div>
    `;

  $("cartItems")
    .querySelectorAll("[data-qty]")
    .forEach(button => {
      button.addEventListener("click", () => {
        changeQty(
          button.dataset.qty,
          Number(button.dataset.delta)
        );
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

/* WHATSAPP CHECKOUT */

function orderMessage() {
  const entries = Object.entries(cart);

  const lines = entries.map(([id, quantity]) => {
    const product = products.find(x => x.id === id);

    return product
      ? `• ${product.name} × ${quantity} = ${money(Number(product.price) * quantity)}`
      : "";
  }).filter(Boolean);

  const total = entries.reduce((sum, [id, quantity]) => {
    const product = products.find(x => x.id === id);

    return sum + (
      product
        ? Number(product.price) * quantity
        : 0
    );
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
    toast(t(
      "Please verify the shop WhatsApp number.",
      "షాప్ వాట్సాప్ నంబర్‌ను తనిఖీ చేయండి."
    ));

    return;
  }

  const opened = window.open(
    `https://wa.me/${number}?text=${encodeURIComponent(orderMessage())}`,
    "_blank"
  );

  if (!opened) {
    toast(t(
      "Allow pop-ups to open WhatsApp.",
      "వాట్సాప్ తెరవడానికి పాప్-అప్‌లను అనుమతించండి."
    ));
  }
}

/* NOTIFICATIONS */

let toastTimer;

function toast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    $("toast").classList.remove("show");
  }, 2600);
}

/* LOAD PRODUCTS FROM SUPABASE */

async function loadCatalogue() {
  $("catalogueStatus").textContent = t(
    "Loading products…",
    "ఉత్పత్తులు లోడ్ అవుతున్నాయి…"
  );

  const [catRes, prodRes] = await Promise.all([
    db
      .from("categories")
      .select("id,name")
      .order("name"),

    db
      .from("products")
      .select(`
        id,
        name,
        description,
        price,
        stock_quantity,
        image_url,
        category_id,
        is_active,
        categories(name)
      `)
      .eq("is_active", true)
      .gt("stock_quantity", 0)
      .order("created_at", { ascending: false })
  ]);

  if (catRes.error) {
    console.error("Category query failed:", catRes.error);
  }

  categories = catRes.data || [];

  if (prodRes.error) {
    console.error("Product query failed:", prodRes.error);

    $("catalogueStatus").textContent = t(
      "We couldn't load products. Please refresh or try again later.",
      "ఉత్పత్తులను లోడ్ చేయలేకపోయాం. రిఫ్రెష్ చేసి మళ్లీ ప్రయత్నించండి."
    );

    $("productGrid").innerHTML = "";

    return;
  }

  products = prodRes.data || [];

  $("catalogueStatus").textContent = products.length
    ? ""
    : t(
        "Our catalogue is being updated. Please check back soon.",
        "మా ఉత్పత్తుల జాబితా నవీకరించబడుతోంది. త్వరలో మళ్లీ చూడండి."
      );

  renderCategories();
  renderProducts();

  const match = location.hash.match(/^#product-(.+)$/);

  if (match && products.some(p => p.id === match[1])) {
    openProduct(match[1], false);
  }
}

/* HEADER EVENTS */

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

  toast(t(
    "Your bag has been cleared.",
    "మీ బ్యాగ్ ఖాళీ చేయబడింది."
  ));
});

window.addEventListener("popstate", () => {
  const match = location.hash.match(/^#product-(.+)$/);

  if (match && products.some(p => p.id === match[1])) {
    openProduct(match[1], false);
  } else {
    backToShop(false);
  }
});

/* INITIALISE */

$("year").textContent = new Date().getFullYear();

renderLanguage();
loadCatalogue();
