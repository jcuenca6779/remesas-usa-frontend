(async function () {
  await window.AdminSession.ready;
  const api = window.RemesasAPI;
  const fmt = (value) => new Intl.NumberFormat("en-US").format(Number(value || 0));
  let currentDays = 30;

  const stat = (label, value, icon, foot) => `
    <article class="stat-card"><div class="stat-card-top"><span class="stat-label">${label}</span><span class="stat-icon">${icon}</span></div><div class="stat-value">${value}</div><div class="stat-foot"><span>${foot}</span></div></article>`;

  async function render(days) {
    currentDays = days;
    document.querySelectorAll("[data-period]").forEach((button) => button.classList.toggle("active", Number(button.dataset.period) === days));
    const [analytics, inventory] = await Promise.all([api.analyticsDashboard(days), api.inventorySummary()]);

    document.getElementById("analyticsStats").innerHTML =
      stat("Vistas de artículos", fmt(analytics.summary.item_views), "◉", `Últimos ${days} días`) +
      stat("Consultas", fmt(analytics.summary.whatsapp_clicks), "💬", "WhatsApp") +
      stat("Búsquedas", fmt(analytics.summary.searches), "⌕", "Catálogos") +
      stat("Visitantes aprox.", fmt(analytics.summary.unique_visitors), "◎", "Sesiones distintas");

    const ecStats = analytics.sections.find((row) => row.section === "ecuador") || { item_views: 0 };
    const pfStats = analytics.sections.find((row) => row.section === "perfume") || { item_views: 0 };
    const total = Math.max(ecStats.item_views + pfStats.item_views, 1);
    document.getElementById("linePerformance").innerHTML = `
      <div class="line-stat-row"><div><span class="line-dot ecuador"></span><b>Productos ecuatorianos</b></div><strong>${fmt(ecStats.item_views)} vistas</strong></div>
      <div class="line-track"><span class="line-fill ecuador" style="width:${ecStats.item_views / total * 100}%"></span></div>
      <div class="line-stat-row"><div><span class="line-dot perfume"></span><b>Perfumería</b></div><strong>${fmt(pfStats.item_views)} vistas</strong></div>
      <div class="line-track"><span class="line-fill perfume" style="width:${pfStats.item_views / total * 100}%"></span></div>`;

    const inventoryCard = (label, section, icon) => `
      <div class="inventory-line ${section.section}"><span class="inventory-icon">${icon}</span><div><small>${label}</small><b>${section.active_items} artículos activos</b><span>${section.available} disponibles · ${section.featured_items} destacados · ${section.archived_items} archivados</span></div></div>`;
    const ecInventory = inventory.sections.find((value) => value.section === "ecuador") || { section: "ecuador", active_items: 0, available: 0, featured_items: 0, archived_items: 0 };
    const pfInventory = inventory.sections.find((value) => value.section === "perfume") || { section: "perfume", active_items: 0, available: 0, featured_items: 0, archived_items: 0 };
    document.getElementById("lineInventory").innerHTML = inventoryCard("ECUADOR", ecInventory, "🇪🇨") + inventoryCard("PERFUMERÍA", pfInventory, "✨");

    const rows = [...analytics.top_products, ...analytics.top_perfumes].sort((a, b) => b.views - a.views);
    const max = Math.max(...rows.map((item) => item.views), 1);
    document.getElementById("topProductsFull").innerHTML = rows.length ? rows.map((item, index) => `
      <div class="analytics-row"><span class="analytics-rank">${index + 1}</span><div class="analytics-product"><b>${item.name}</b><small>${item.section === "perfume" ? "Perfumería" : "Ecuador"}</small></div><div class="analytics-bar-track"><div class="analytics-bar ${item.section === "perfume" ? "perfume-bar" : ""}" style="width:${item.views / max * 100}%"></div></div><span class="analytics-number">${fmt(item.views)}</span></div>`).join("") : `<p class="small-muted">Aún no hay vistas registradas.</p>`;

    const inquiryRows = [...rows].sort((a, b) => b.whatsapp_clicks - a.whatsapp_clicks).slice(0, 8);
    document.getElementById("inquiryRanking").innerHTML = inquiryRows.length ? inquiryRows.map((item, index) => `
      <div class="rank-item"><span class="rank-number">${index + 1}</span><div class="rank-copy"><b>${item.name}</b><small>${item.section === "perfume" ? "Perfumería" : "Ecuador"}</small></div><span class="rank-value">${fmt(item.whatsapp_clicks)}</span></div>`).join("") : `<p class="small-muted">Aún no hay consultas registradas.</p>`;

    const searches = analytics.top_searches;
    const searchMax = Math.max(...searches.map((item) => item.searches), 1);
    document.getElementById("categoryBars").innerHTML = searches.length ? searches.map((item) => `
      <div class="category-bar-row"><span>${item.term}</span><div class="category-bar-track"><div class="category-bar-fill" style="width:${item.searches / searchMax * 100}%"></div></div><b>${fmt(item.searches)}</b></div>`).join("") : `<p class="small-muted">Todavía no hay búsquedas registradas.</p>`;

    const top = rows[0];
    if (top) {
      const rate = top.views ? (top.whatsapp_clicks / top.views * 100).toFixed(1) : "0.0";
      document.getElementById("insightHeadline").textContent = `${top.name} lidera el interés.`;
      document.getElementById("insightText").textContent = `Acumula ${fmt(top.views)} vistas y ${fmt(top.whatsapp_clicks)} consultas. Aproximadamente ${rate}% de sus vistas terminaron en una consulta por WhatsApp.`;
    } else {
      document.getElementById("insightHeadline").textContent = "Las estadísticas comenzarán a crecer con las visitas.";
      document.getElementById("insightText").textContent = "Cuando los clientes exploren productos, búsquedas y consultas aparecerán aquí automáticamente.";
    }
  }

  document.querySelectorAll("[data-period]").forEach((button) => button.addEventListener("click", async () => {
    try { await render(Number(button.dataset.period)); }
    catch (error) { console.error(error); }
  }));

  try { await render(currentDays); } catch (error) { console.error(error); }

  const sidebar = document.getElementById("adminSidebar");
  const toggle = document.getElementById("sidebarToggle");
  if (toggle) toggle.addEventListener("click", () => sidebar.classList.toggle("open"));
})();
