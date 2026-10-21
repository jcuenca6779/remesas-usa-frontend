(async function () {
  await window.AdminSession.ready;
  const api = window.RemesasAPI;
  const fmt = (value) => new Intl.NumberFormat("en-US").format(Number(value || 0));

  const stat = (label, value, icon, foot, tone = "") => `
    <article class="stat-card ${tone}">
      <div class="stat-card-top"><span class="stat-label">${label}</span><span class="stat-icon">${icon}</span></div>
      <div class="stat-value" data-count="${Number(value || 0)}">0</div>
      <div class="stat-foot"><span>${foot}</span></div>
    </article>`;

  function animateNumbers() {
    document.querySelectorAll("[data-count]").forEach((element) => {
      const target = Number(element.dataset.count || 0);
      const start = performance.now();
      const duration = 650;
      const tick = (now) => {
        const pct = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - pct, 3);
        element.textContent = fmt(Math.round(target * eased));
        if (pct < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  function sectionAnalytics(analytics, name) {
    return analytics.sections.find((row) => row.section === name) || { page_views: 0, item_views: 0, whatsapp_clicks: 0 };
  }

  try {
    const [inventory, analytics] = await Promise.all([api.inventorySummary(), api.analyticsDashboard(30)]);
    const ecuador = inventory.sections.find((section) => section.section === "ecuador") || {};
    const perfume = inventory.sections.find((section) => section.section === "perfume") || {};

    document.getElementById("ecuadorCount").textContent = ecuador.active_items || 0;
    document.getElementById("perfumeCount").textContent = perfume.active_items || 0;

    document.getElementById("dashboardStats").innerHTML =
      stat("Visitas", analytics.summary.page_views, "◎", "Últimos 30 días", "blue-stat") +
      stat("Vistas de artículos", analytics.summary.item_views, "◉", "Productos + perfumes", "violet-stat") +
      stat("Consultas", analytics.summary.whatsapp_clicks, "💬", "Clics en WhatsApp", "green-stat") +
      stat("Artículos activos", inventory.active_items, "▦", `${ecuador.active_items || 0} Ecuador · ${perfume.active_items || 0} perfumes`, "gold-stat");
    animateNumbers();

    const days = analytics.daily_activity.slice(-7);
    const max = Math.max(...days.map((day) => day.page_views + day.item_views), 1);
    document.getElementById("trafficChart").innerHTML = days.length ? days.map((day) => {
      const total = day.page_views + day.item_views;
      return `<div class="traffic-col"><div class="traffic-value">${fmt(total)}</div><div class="traffic-bar-wrap"><div class="traffic-bar" style="height:${Math.max(8, total / max * 100)}%"></div></div><span>${day.date.slice(5)}</span></div>`;
    }).join("") : `<div class="chart-empty">Todavía no hay actividad suficiente para mostrar la gráfica.</div>`;

    const ranking = [...analytics.top_products, ...analytics.top_perfumes].sort((a, b) => b.views - a.views);
    document.getElementById("topProductsMini").innerHTML = ranking.length ? ranking.slice(0, 5).map((item, index) => `
      <div class="rank-item"><span class="rank-number">${index + 1}</span><div class="rank-copy"><b>${item.name}</b><small>${item.section === "perfume" ? "TELLISIOSO FRAGANCES" : "Ecuador"}</small></div><span class="rank-value">${fmt(item.views)}</span></div>`).join("") : `<p class="small-muted">Aún no hay vistas registradas.</p>`;

    const ecStats = sectionAnalytics(analytics, "ecuador");
    const pfStats = sectionAnalytics(analytics, "perfume");
    const totalViews = Math.max(ecStats.item_views + pfStats.item_views, 1);
    document.getElementById("linePerformance").innerHTML = `
      <div class="line-stat-row"><div><span class="line-dot ecuador"></span><b>Productos ecuatorianos</b></div><strong>${fmt(ecStats.item_views)} vistas</strong></div>
      <div class="line-track"><span class="line-fill ecuador" style="width:${ecStats.item_views / totalViews * 100}%"></span></div>
      <div class="line-stat-row"><div><span class="line-dot perfume"></span><b>TELLISIOSO FRAGANCES</b></div><strong>${fmt(pfStats.item_views)} vistas</strong></div>
      <div class="line-track"><span class="line-fill perfume" style="width:${pfStats.item_views / totalViews * 100}%"></span></div>`;

    document.getElementById("recentActivity").innerHTML = analytics.top_searches.length ? analytics.top_searches.slice(0, 6).map((search) => `
      <div class="activity-item"><span class="activity-icon search">⌕</span><div><b>Búsqueda</b><small>${search.term}</small></div><span class="activity-time">${fmt(search.searches)} veces</span></div>`).join("") : `<p class="small-muted">Todavía no hay búsquedas registradas.</p>`;

    const health = document.getElementById("systemStatus");
    if (health) health.innerHTML = `<span class="status-pulse"></span> Sistema conectado`;
  } catch (error) {
    console.error(error);
    const health = document.getElementById("systemStatus");
    if (health) health.innerHTML = `<span class="status-pulse error"></span> Sin conexión`;
  }

  const sidebar = document.getElementById("adminSidebar");
  const toggle = document.getElementById("sidebarToggle");
  if (toggle) toggle.addEventListener("click", () => sidebar.classList.toggle("open"));
})();
