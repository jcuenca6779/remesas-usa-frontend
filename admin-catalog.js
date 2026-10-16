(async function () {
  await window.AdminSession.ready;
  const api = window.RemesasAPI;
  const section = document.body.dataset.adminLine === "perfumes" ? "perfume" : "ecuador";
  const isPerfume = section === "perfume";

  let items = [];
  let categories = [];
  let analytics = [];
  let pendingArchive = null;
  let categoryEditingId = null;

  const esc = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character]);
  const money = (value) => `$${Number(value || 0).toFixed(2)}`;
  const fmt = (value) => new Intl.NumberFormat("en-US").format(Number(value || 0));

  const editor = document.getElementById("itemEditorModal");
  const confirm = document.getElementById("confirmModal");
  const categoryModal = document.getElementById("categoryModal");

  function stockLabel(status) {
    return status === "available" ? "Disponible" : status === "low_stock" ? "Pocas unidades" : "Agotado";
  }
  function stockClass(status) {
    return status === "available" ? "green" : status === "low_stock" ? "orange" : "red";
  }
  function categoryName(id) {
    return categories.find((category) => category.id === id)?.name || "Sin categoría";
  }
  function analyticsFor(id) {
    return analytics.find((row) => row.id === id) || { views: 0, whatsapp_clicks: 0 };
  }
  function imageMarkup(item) {
    return item.image_url ? `<img src="${esc(item.image_url)}" alt="">` : (isPerfume ? "✨" : "🇪🇨");
  }

  async function loadData() {
    const [itemData, categoryData, analyticsData] = await Promise.all([
      api.listAdminCatalog(section),
      api.listAdminCategories(section),
      api.catalogAnalytics(section, 30),
    ]);
    items = itemData;
    categories = categoryData;
    analytics = analyticsData.items;
    fillCategories();
    fillToolbarCategories();
    renderTable();
    renderStats();
    renderCategoryList();
  }

  function fillCategories(selected = null) {
    const select = document.getElementById("itemCategory");
    const available = categories.filter((category) => category.is_active || category.id === selected);
    select.innerHTML = available.length ? available.map((category) => `
      <option value="${category.id}" ${category.id === selected ? "selected" : ""}>${esc(category.name)}</option>`).join("") : `<option value="">Crea una categoría primero</option>`;
  }

  function fillToolbarCategories() {
    const select = document.getElementById("adminCategoryFilter");
    if (!select) return;
    const current = select.value;
    select.innerHTML = `<option value="">Todas las categorías</option>` + categories.filter((c) => c.is_active).map((category) => `<option value="${category.id}">${esc(category.name)}</option>`).join("");
    select.value = current;
  }

  function renderStats() {
    const active = items.filter((item) => item.is_active);
    const available = active.filter((item) => item.stock_status !== "out_of_stock");
    const views = analytics.reduce((total, row) => total + Number(row.views || 0), 0);
    const inquiries = analytics.reduce((total, row) => total + Number(row.whatsapp_clicks || 0), 0);
    const stat = (label, value, icon) => `<article class="mini-stat-card ${isPerfume ? "perfume-mini-stat" : ""}"><span>${icon}</span><div><small>${label}</small><b>${value}</b></div></article>`;
    document.getElementById("catalogAdminStats").innerHTML =
      stat(isPerfume ? "Perfumes activos" : "Productos activos", fmt(active.length), isPerfume ? "✨" : "🇪🇨") +
      stat("Disponibles", fmt(available.length), "✓") +
      stat("Vistas · 30 días", fmt(views), "◉") +
      stat("Consultas · 30 días", fmt(inquiries), "💬");
  }

  function filteredItems() {
    const query = document.getElementById("adminSearch").value.trim().toLowerCase();
    const status = document.getElementById("adminStatusFilter")?.value || "";
    const category = document.getElementById("adminCategoryFilter")?.value || "";
    return items.filter((item) => {
      const text = `${item.name} ${item.brand || ""} ${item.description || ""} ${categoryName(item.category_id)}`.toLowerCase();
      const queryOk = !query || text.includes(query);
      const categoryOk = !category || item.category_id === category;
      let statusOk = true;
      if (status === "active") statusOk = item.is_active;
      if (status === "archived") statusOk = !item.is_active;
      if (["available", "low_stock", "out_of_stock"].includes(status)) statusOk = item.is_active && item.stock_status === status;
      if (status === "featured") statusOk = item.is_active && item.featured;
      return queryOk && categoryOk && statusOk;
    });
  }

  function renderTable() {
    const rows = filteredItems();
    document.getElementById("adminCount").textContent = `${rows.length} ${isPerfume ? "perfumes" : "productos"}`;
    const body = document.getElementById("itemTableBody");
    body.innerHTML = rows.length ? rows.map((item) => {
      const stats = analyticsFor(item.id);
      const status = item.is_active ? stockLabel(item.stock_status) : "Archivado";
      const statusClass = item.is_active ? stockClass(item.stock_status) : "red";
      const action = item.is_active
        ? `<button class="icon-btn delete" data-archive="${item.id}" title="Archivar">⌫</button>`
        : `<button class="icon-btn restore" data-restore="${item.id}" title="Restaurar">↻</button>`;
      return `
        <tr class="${item.is_active ? "" : "archived-row"}">
          <td><div class="table-product"><div class="table-thumb ${isPerfume ? "perfume" : "ecuador"}">${imageMarkup(item)}</div><div><b>${esc(item.name)}</b><small>${esc(item.brand || item.description || "")}</small></div></div></td>
          <td>${esc(categoryName(item.category_id))}</td>
          <td><b>${money(item.price)}</b></td>
          <td><span class="status-chip ${statusClass}">${status}</span></td>
          <td>${fmt(stats.views)}</td>
          <td>${fmt(stats.whatsapp_clicks)}</td>
          <td><div class="table-actions"><button class="icon-btn" data-edit="${item.id}" title="Editar">✎</button>${action}</div></td>
        </tr>`;
    }).join("") : `<tr><td colspan="7"><div class="table-empty"><span>⌕</span><b>No hay resultados</b><small>Prueba cambiando los filtros.</small></div></td></tr>`;

    body.querySelectorAll("[data-edit]").forEach((button) => button.addEventListener("click", () => openEditor(button.dataset.edit)));
    body.querySelectorAll("[data-archive]").forEach((button) => button.addEventListener("click", () => askArchive(button.dataset.archive)));
    body.querySelectorAll("[data-restore]").forEach((button) => button.addEventListener("click", async () => {
      try {
        await api.restoreItem(section, button.dataset.restore);
        await loadData();
        toast("Artículo restaurado correctamente.", "success");
      } catch (error) { toast(error.message, "error"); }
    }));
  }

  function openEditor(id) {
    const item = id ? items.find((value) => value.id === id) : null;
    if (!item && categories.filter((c) => c.is_active).length === 0) {
      toast("Primero crea una categoría para este catálogo.", "error");
      openCategoryManager();
      return;
    }
    document.getElementById("editorTitle").textContent = item ? `Editar ${isPerfume ? "perfume" : "producto"}` : `Agregar ${isPerfume ? "perfume" : "producto"}`;
    document.getElementById("itemId").value = item?.id || "";
    document.getElementById("itemName").value = item?.name || "";
    document.getElementById("itemBrand").value = item?.brand || "";
    document.getElementById("itemPrice").value = item?.price || "";
    document.getElementById("itemStock").value = item?.stock_status || "available";
    document.getElementById("itemDescription").value = item?.description || "";
    document.getElementById("itemFeatured").checked = Boolean(item?.featured);
    document.getElementById("itemImageFile").value = "";
    fillCategories(item?.category_id);
    editor.classList.add("open");
    editor.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeEditor() {
    editor.classList.remove("open");
    editor.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function askArchive(id) {
    const item = items.find((value) => value.id === id);
    pendingArchive = id;
    document.getElementById("confirmTitle").textContent = `¿Archivar ${isPerfume ? "perfume" : "producto"}?`;
    document.getElementById("confirmText").textContent = `“${item?.name || "Este artículo"}” dejará de aparecer en el catálogo público, pero conservará su información, fotografía y estadísticas.`;
    confirm.classList.add("open");
    confirm.setAttribute("aria-hidden", "false");
  }

  function closeConfirm() {
    confirm.classList.remove("open");
    confirm.setAttribute("aria-hidden", "true");
    pendingArchive = null;
  }

  function openCategoryManager() {
    categoryModal.classList.add("open");
    categoryModal.setAttribute("aria-hidden", "false");
    renderCategoryList();
  }

  function closeCategoryManager() {
    categoryModal.classList.remove("open");
    categoryModal.setAttribute("aria-hidden", "true");
    categoryEditingId = null;
    document.getElementById("categoryNameInput").value = "";
    document.getElementById("categorySubmitBtn").textContent = "Agregar categoría";
  }

  function renderCategoryList() {
    const list = document.getElementById("categoryManagerList");
    if (!list) return;
    list.innerHTML = categories.length ? categories.map((category) => `
      <div class="category-manager-row ${category.is_active ? "" : "inactive"}">
        <div><b>${esc(category.name)}</b><small>${category.is_active ? "Activa" : "Archivada"}</small></div>
        <div class="category-row-actions">
          <button class="icon-btn" data-cat-edit="${category.id}" title="Editar">✎</button>
          ${category.is_active
            ? `<button class="icon-btn delete" data-cat-archive="${category.id}" title="Archivar">⌫</button>`
            : `<button class="icon-btn restore" data-cat-restore="${category.id}" title="Restaurar">↻</button>`}
        </div>
      </div>`).join("") : `<div class="table-empty"><span>＋</span><b>No hay categorías</b><small>Crea la primera para comenzar.</small></div>`;

    list.querySelectorAll("[data-cat-edit]").forEach((button) => button.addEventListener("click", () => {
      const category = categories.find((c) => c.id === button.dataset.catEdit);
      categoryEditingId = category.id;
      document.getElementById("categoryNameInput").value = category.name;
      document.getElementById("categorySubmitBtn").textContent = "Guardar cambios";
      document.getElementById("categoryNameInput").focus();
    }));
    list.querySelectorAll("[data-cat-archive]").forEach((button) => button.addEventListener("click", async () => {
      try { await api.archiveCategory(button.dataset.catArchive); await loadData(); toast("Categoría archivada.", "success"); }
      catch (error) { toast(error.message, "error"); }
    }));
    list.querySelectorAll("[data-cat-restore]").forEach((button) => button.addEventListener("click", async () => {
      try { await api.restoreCategory(button.dataset.catRestore); await loadData(); toast("Categoría restaurada.", "success"); }
      catch (error) { toast(error.message, "error"); }
    }));
  }

  document.getElementById("addItemBtn").addEventListener("click", () => openEditor());
  document.getElementById("manageCategoriesBtn").addEventListener("click", openCategoryManager);
  document.getElementById("adminSearch").addEventListener("input", renderTable);
  document.getElementById("adminStatusFilter").addEventListener("change", renderTable);
  document.getElementById("adminCategoryFilter").addEventListener("change", renderTable);
  document.querySelectorAll("[data-close-editor]").forEach((element) => element.addEventListener("click", closeEditor));
  document.querySelectorAll("[data-close-confirm]").forEach((element) => element.addEventListener("click", closeConfirm));
  document.querySelectorAll("[data-close-categories]").forEach((element) => element.addEventListener("click", closeCategoryManager));

  document.getElementById("itemForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = document.getElementById("itemId").value;
    const file = document.getElementById("itemImageFile").files[0];
    const payload = {
      name: document.getElementById("itemName").value.trim(),
      brand: document.getElementById("itemBrand").value.trim() || null,
      description: document.getElementById("itemDescription").value.trim() || null,
      price: Number(document.getElementById("itemPrice").value),
      category_id: document.getElementById("itemCategory").value,
      stock_status: document.getElementById("itemStock").value,
      featured: document.getElementById("itemFeatured").checked,
      attributes: null,
    };

    const saveButton = event.submitter;
    const original = saveButton.textContent;
    saveButton.disabled = true;
    saveButton.textContent = "Guardando...";

    try {
      let saved = id ? await api.updateItem(section, id, payload) : await api.createItem(section, payload);
      let imageWarning = false;
      if (file) {
        try { saved = await api.uploadImage(section, saved.id, file); }
        catch (error) { imageWarning = true; toast(`El artículo se guardó, pero la imagen falló: ${error.message}`, "error"); }
      }
      closeEditor();
      await loadData();
      if (!imageWarning) toast(id ? "Artículo actualizado." : "Artículo agregado.", "success");
    } catch (error) {
      toast(error.message, "error");
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = original;
    }
  });

  document.getElementById("confirmActionBtn").addEventListener("click", async () => {
    if (!pendingArchive) return;
    try {
      await api.archiveItem(section, pendingArchive);
      closeConfirm();
      await loadData();
      toast("Artículo archivado.", "success");
    } catch (error) { toast(error.message, "error"); }
  });

  document.getElementById("categoryForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = document.getElementById("categoryNameInput");
    const name = input.value.trim();
    if (!name) return;
    try {
      if (categoryEditingId) await api.updateCategory(categoryEditingId, { name });
      else await api.createCategory(section, name);
      categoryEditingId = null;
      input.value = "";
      document.getElementById("categorySubmitBtn").textContent = "Agregar categoría";
      await loadData();
      toast("Categorías actualizadas.", "success");
    } catch (error) { toast(error.message, "error"); }
  });

  const sidebar = document.getElementById("adminSidebar");
  const sideToggle = document.getElementById("sidebarToggle");
  if (sideToggle) sideToggle.addEventListener("click", () => sidebar.classList.toggle("open"));

  function toast(message, type = "info") {
    const element = document.getElementById("toast");
    element.textContent = message;
    element.dataset.type = type;
    element.classList.add("show");
    clearTimeout(element._timer);
    element._timer = setTimeout(() => element.classList.remove("show"), 3200);
  }

  try { await loadData(); }
  catch (error) { toast(error.message, "error"); }
})();
