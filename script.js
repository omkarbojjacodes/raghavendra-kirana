
async function loadCatalogue() {
  $("catalogueStatus").textContent = t(
    "Loading products…",
    "ఉత్పత్తులు లోడ్ అవుతున్నాయి…"
  );

  try {
    const [catRes, prodRes] = await Promise.all([
      db.from("categories").select("id,name").order("name"),

      db.from("products")
        .select("id,name,description,price,stock_quantity,image_url,category_id,is_active,categories(name)")
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

      $("catalogueStatus").textContent =
        "Product query error: " + prodRes.error.message;

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

  } catch (error) {
    console.error("CATALOGUE DIAGNOSTIC:", error);

    $("catalogueStatus").textContent =
      "Diagnostic error: " + (error.message || String(error));

    $("productGrid").innerHTML = "";
  }
}
