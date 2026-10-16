(async function () {
  const api = window.RemesasAPI;
  const section = document.body.dataset.catalogLine === "perfumes" ? "perfume" : "ecuador";
  const isPerfume = section === "perfume";

  let products = [];
  let categories = [];
  let activeCategory = "all";
  let searchTerm = "";
  let lastTrackedSearch = "";

  const esc = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character]);
  const money = (value) => `$${Number(value || 0).toFixed(2)}`;

  const grid = document.getElementById("catalogGrid");
  const filters = document.getElementById("catalogFilters");
  const search = document.getElementById("catalogSearch");
  const count = document.getElementById("catalogCount");
  const empty = document.getElementById("catalogEmpty");
  const clear = document.getElementById("catalogClear");
  const modal = document.getElementById("productModal");

  function categoryName(id) {
    return categories.find((category) => category.id === id)?.name || "Sin categoría";
  }

  function stockLabel(status) {
    return status === "available" ? "Disponible" : status === "low_stock" ? "Pocas unidades" : "Agotado";
  }

  function stockClass(status) {
    return status === "available" ? "available" : status === "low_stock" ? "low" : "unavailable";
  }

  function imageMarkup(item) {
    if (item.image_url) {
      return `<img src="${esc(item.image_url)}" alt="${esc(item.name)}" loading="lazy">`;
    }
    return `<span class="fallback-emoji">${isPerfume ? "✨" : "🇪🇨"}</span>`;
  }

  function renderSkeletons() {
    grid.innerHTML = Array.from({ length: 6 }, () => `
      <article class="product-card skeleton-card" aria-hidden="true">
        <div class="skeleton skeleton-image"></div>
        <div class="product-body">
          <div class="skeleton skeleton-line short"></div>
          <div class="skeleton skeleton-line"></div>
          <div class="skeleton skeleton-line medium"></div>
          <div class="skeleton skeleton-line price"></div>
        </div>
      </article>
    `).join("");
  }

  function renderFilters() {
    const rows = [{ id: "all", name: "Todos" }, ...categories];
    filters.innerHTML = rows.map((category) => `
      <button class="filter-btn ${category.id === activeCategory ? "active" : ""}" data-cat="${category.id}">
        ${esc(category.name)}
      </button>
    `).join("");

    filters.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        activeCategory = button.dataset.cat;
        renderFilters();
        renderProducts();
      });
    });
  }

  function filteredProducts() {
    const query = searchTerm.trim().toLowerCase();
    return products.filter((item) => {
      const categoryOk = activeCategory === "all" || item.category_id === activeCategory;
      const text = `${item.name} ${item.brand || ""} ${item.description || ""} ${categoryName(item.category_id)}`.toLowerCase();
      return categoryOk && (!query || text.includes(query));
    }).sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name));
  }

  function renderProducts() {
    const rows = filteredProducts();
    const noun = isPerfume ? (rows.length === 1 ? "perfume" : "perfumes") : (rows.length === 1 ? "producto" : "productos");
    count.textContent = `${rows.length} ${noun}`;
    empty.hidden = rows.length > 0;
    grid.hidden = rows.length === 0;

    grid.innerHTML = rows.map((item, index) => `
      <article class="product-card ${isPerfume ? "perfume-card" : ""}" style="--card-index:${index}">
        <div class="product-visual">
          ${imageMarkup(item)}
          ${item.featured ? `<span class="featured-badge">DESTACADO</span>` : ""}
          <span class="stock-dot ${stockClass(item.stock_status)}" title="${stockLabel(item.stock_status)}"></span>
        </div>
        <div class="product-body">
          <div class="product-topline">
            <span class="product-category">${esc(categoryName(item.category_id))}</span>
            ${item.brand ? `<span class="product-brand">${esc(item.brand)}</span>` : ""}
          </div>
          <h3>${esc(item.name)}</h3>
          <p>${esc(item.description || "Disponible en Remesas USA.")}</p>
          <div class="product-meta">
            <div class="price-wrap"><small>Precio</small><strong>${money(item.price)}</strong></div>
            <button class="view-product" data-view="${item.id}">Ver ${isPerfume ? "perfume" : "producto"} <b>→</b></button>
          </div>
        </div>
      </article>
    `).join("");

    grid.querySelectorAll("[data-view]").forEach((button) => {
      button.addEventListener("click", () => openProduct(button.dataset.view));
    });
  }

  function openProduct(id) {
    const item = products.find((value) => value.id === id);
    if (!item) return;

    api.track({ event_type: "item_view", section, item_id: item.id, page_path: location.pathname });

    const modalLine = document.getElementById("modalLine");
    modalLine.textContent = isPerfume ? "Perfumería" : "Productos ecuatorianos";
    modalLine.className = `line-badge ${isPerfume ? "perfume-line" : "ecuador-line"}`;
    document.getElementById("modalTitle").textContent = item.name;
    document.getElementById("modalCategory").textContent = categoryName(item.category_id);
    document.getElementById("modalDescription").textContent = item.description || "Disponible en Remesas USA.";
    document.getElementById("modalPrice").textContent = money(item.price);

    const stock = document.getElementById("modalStock");
    stock.textContent = stockLabel(item.stock_status);
    stock.className = `stock-pill ${stockClass(item.stock_status)}`;

    const visual = document.getElementById("modalVisual");
    visual.innerHTML = imageMarkup(item);
    visual.classList.toggle("perfume-modal-visual", isPerfume);

    const whatsapp = document.getElementById("modalWhatsapp");
    const kind = isPerfume ? "perfume" : "producto";
    whatsapp.href = `https://wa.me/19292659222?text=${encodeURIComponent(`Hola, vi el ${kind} ${item.name} en la página de Remesas USA. ¿Está disponible?`)}`;
    whatsapp.onclick = () => api.track({ event_type: "whatsapp_click", section, item_id: item.id, page_path: location.pathname });

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-close-modal]").forEach((element) => element.addEventListener("click", closeModal));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && modal.classList.contains("open")) closeModal(); });

  search.addEventListener("input", () => {
    searchTerm = search.value;
    renderProducts();
    const term = searchTerm.trim();
    clearTimeout(search._timer);
    if (term.length >= 3 && term.toLowerCase() !== lastTrackedSearch.toLowerCase()) {
      search._timer = setTimeout(() => {
        lastTrackedSearch = term;
        api.track({ event_type: "search", section, search_term: term, page_path: location.pathname });
      }, 700);
    }
  });

  clear.addEventListener("click", () => {
    search.value = "";
    searchTerm = "";
    activeCategory = "all";
    renderFilters();
    renderProducts();
  });

  const toggle = document.querySelector(".mobile-toggle");
  const nav = document.querySelector(".nav-links");
  if (toggle && nav) toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(nav.classList.contains("open")));
  });

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  try {
    renderSkeletons();
    [products, categories] = await Promise.all([api.listCatalog(section), api.listCategories(section)]);
    renderFilters();
    renderProducts();
    api.track({ event_type: "page_view", section, page_path: location.pathname });
  } catch (error) {
    grid.innerHTML = `
      <div class="empty-state backend-error">
        <div>⚠</div>
        <h3>No pudimos cargar el catálogo</h3>
        <p>${esc(error.message)}</p>
        <button class="btn btn-light" onclick="location.reload()">Reintentar</button>
      </div>`;
  }
})();
