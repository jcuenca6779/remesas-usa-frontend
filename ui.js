(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.documentElement.classList.add("js-ready");

  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  document.body.appendChild(progress);

  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0;
    progress.style.width = `${pct}%`;
    document.body.classList.toggle("scrolled", window.scrollY > 14);
  }

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });

  if (!reduced) {
    const revealTargets = document.querySelectorAll(
      ".section, .choice-card, .benefit-grid article, .product-card, .panel-card, .admin-choice-card, .catalog-tools-head, .location-grid, .catalog-hero-grid"
    );

    revealTargets.forEach((element, index) => {
      element.classList.add("reveal-on-scroll");
      element.style.setProperty("--reveal-delay", `${Math.min(index % 5, 4) * 65}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px" }
    );

    revealTargets.forEach((element) => observer.observe(element));

    document.querySelectorAll(".choice-card, .admin-choice-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        if (window.innerWidth < 900) return;
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty("--tilt-x", `${(-y * 4).toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${(x * 5).toFixed(2)}deg`);
        card.style.setProperty("--glow-x", `${((x + 0.5) * 100).toFixed(0)}%`);
        card.style.setProperty("--glow-y", `${((y + 0.5) * 100).toFixed(0)}%`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
      });
    });
  } else {
    document.documentElement.classList.add("reduce-motion");
  }

  document.querySelectorAll("a[href^='#']").forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    });
  });
})();
