(function () {
  const api = window.RemesasAPI;

  api.track({ event_type: "page_view", section: "general", page_path: location.pathname });

  const toggle = document.querySelector(".mobile-toggle");
  const nav = document.querySelector(".nav-links");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(nav.classList.contains("open")));
    });
    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => nav.classList.remove("open")));
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
