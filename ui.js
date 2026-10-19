(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isPublicPage = document.body.classList.contains("site-body");
  const isFinePointer = window.matchMedia("(pointer: fine)").matches;

  document.documentElement.classList.add("js-ready");

  /* =========================================================
     1. Accesibilidad base
     ========================================================= */
  if (isPublicPage) {
    const main = document.querySelector("main");

    if (main) {
      if (!main.id) {
        main.id = "main-content";
      }

      const skip = document.createElement("a");
      skip.className = "skip-to-content";
      skip.href = `#${main.id}`;
      skip.textContent = "Saltar al contenido";

      document.body.prepend(skip);
    }

    document.querySelectorAll(".brand img").forEach((image) => {
      if (!image.hasAttribute("width")) {
        image.setAttribute("width", "395");
      }

      if (!image.hasAttribute("height")) {
        image.setAttribute("height", "395");
      }
    });

    document
      .querySelectorAll(
        "#heroImageEcuador, #heroImagePerfume, .perfume-cover-main img, .ecuador-cover-main img"
      )
      .forEach((image) => {
        image.setAttribute("fetchpriority", "high");
        image.setAttribute("decoding", "async");
      });

    document.querySelectorAll('input[type="search"]').forEach((input, index) => {
      const cleanPlaceholder = (input.getAttribute("placeholder") || "").replace(
        /\.\.\.$/,
        "…"
      );

      if (cleanPlaceholder) {
        input.setAttribute("placeholder", cleanPlaceholder);
      }

      if (!input.getAttribute("name")) {
        input.setAttribute("name", `catalog-search-${index + 1}`);
      }

      if (!input.getAttribute("aria-label")) {
        input.setAttribute(
          "aria-label",
          document.body.classList.contains("perfume-catalog")
            ? "Buscar perfumes por nombre o marca"
            : "Buscar productos por nombre o marca"
        );
      }

      input.setAttribute("spellcheck", "false");
    });
  }

  /* =========================================================
     2. Barra superior de progreso + estado de scroll
     ========================================================= */
  const progress = document.createElement("div");

  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");

  document.body.appendChild(progress);

  let scrollFrame = 0;

  function updateScrollUi() {
    scrollFrame = 0;

    const max =
      document.documentElement.scrollHeight - window.innerHeight;

    const pct =
      max > 0
        ? Math.min(100, (window.scrollY / max) * 100)
        : 0;

    progress.style.width = `${pct}%`;

    document.body.classList.toggle(
      "scrolled",
      window.scrollY > 14
    );

    if (scrollTopButton) {
      scrollTopButton.classList.toggle(
        "visible",
        window.scrollY > 620
      );
    }
  }

  function requestScrollUpdate() {
    if (scrollFrame) return;

    scrollFrame = requestAnimationFrame(updateScrollUi);
  }

  window.addEventListener(
    "scroll",
    requestScrollUpdate,
    { passive: true }
  );

  /* =========================================================
     3. Botón volver arriba
     ========================================================= */
  let scrollTopButton = null;

  if (isPublicPage) {
    scrollTopButton = document.createElement("button");

    scrollTopButton.className = "scroll-top-btn";
    scrollTopButton.type = "button";

    scrollTopButton.setAttribute(
      "aria-label",
      "Volver al inicio de la página"
    );

    scrollTopButton.setAttribute(
      "title",
      "Volver arriba"
    );

    scrollTopButton.innerHTML =
      '<span aria-hidden="true">↑</span>';

    scrollTopButton.addEventListener(
      "click",
      () => {
        window.scrollTo({
          top: 0,
          behavior: reduced
            ? "auto"
            : "smooth",
        });
      }
    );

    document.body.appendChild(
      scrollTopButton
    );
  }

  updateScrollUi();

  /* =========================================================
     4. Reveal progresivo + componentes dinámicos
     ========================================================= */
  let revealObserver = null;

  function setRevealDirection(
    element,
    index
  ) {
    if (
      element.classList.contains(
        "location-grid"
      )
    ) {
      element.classList.add(
        "reveal-right"
      );

      return;
    }

    if (
      element.classList.contains(
        "catalog-hero-grid"
      )
    ) {
      element.classList.add(
        "reveal-left"
      );

      return;
    }

    if (
      element.classList.contains(
        "choice-card"
      )
    ) {
      element.classList.add(
        index % 2 === 0
          ? "reveal-left"
          : "reveal-right"
      );
    }
  }

  function attachPointerSpotlight(
    element,
    options = {}
  ) {
    if (
      !isFinePointer ||
      reduced ||
      element.dataset.spotlightBound === "true"
    ) {
      return;
    }

    element.dataset.spotlightBound =
      "true";

    let frame = 0;
    let latestEvent = null;

    const {
      xVar = "--card-glow-x",
      yVar = "--card-glow-y",
      tiltXVar,
      tiltYVar,
      tiltAmountX = 0,
      tiltAmountY = 0,
    } = options;

    function paint() {
      frame = 0;

      if (!latestEvent) return;

      const rect =
        element.getBoundingClientRect();

      if (
        !rect.width ||
        !rect.height
      ) {
        return;
      }

      const px = Math.min(
        1,
        Math.max(
          0,
          (latestEvent.clientX -
            rect.left) /
            rect.width
        )
      );

      const py = Math.min(
        1,
        Math.max(
          0,
          (latestEvent.clientY -
            rect.top) /
            rect.height
        )
      );

      element.style.setProperty(
        xVar,
        `${(px * 100).toFixed(1)}%`
      );

      element.style.setProperty(
        yVar,
        `${(py * 100).toFixed(1)}%`
      );

      if (
        tiltXVar &&
        tiltYVar
      ) {
        const nx = px - 0.5;
        const ny = py - 0.5;

        element.style.setProperty(
          tiltXVar,
          `${(-ny * tiltAmountX).toFixed(
            2
          )}deg`
        );

        element.style.setProperty(
          tiltYVar,
          `${(nx * tiltAmountY).toFixed(
            2
          )}deg`
        );
      }
    }

    element.addEventListener(
      "pointermove",
      (event) => {
        latestEvent = event;

        if (!frame) {
          frame =
            requestAnimationFrame(
              paint
            );
        }
      },
      { passive: true }
    );

    element.addEventListener(
      "pointerleave",
      () => {
        latestEvent = null;

        element.style.removeProperty(
          xVar
        );

        element.style.removeProperty(
          yVar
        );

        if (
          tiltXVar &&
          tiltYVar
        ) {
          element.style.setProperty(
            tiltXVar,
            "0deg"
          );

          element.style.setProperty(
            tiltYVar,
            "0deg"
          );
        }
      }
    );
  }

  function attachTiltEffect(card) {
    if (
      card.dataset.tiltBound ===
      "true"
    ) {
      return;
    }

    card.dataset.tiltBound =
      "true";

    attachPointerSpotlight(
      card,
      {
        xVar: "--glow-x",
        yVar: "--glow-y",
        tiltXVar: "--tilt-x",
        tiltYVar: "--tilt-y",
        tiltAmountX: 5,
        tiltAmountY: 6,
      }
    );
  }

  function decorateInteractiveElements(
    root = document
  ) {
    root
      .querySelectorAll(
        ".choice-card, .admin-choice-card"
      )
      .forEach(
        attachTiltEffect
      );

    root
      .querySelectorAll(
        ".product-card:not(.skeleton-card)"
      )
      .forEach((card) => {
        attachPointerSpotlight(
          card,
          {
            xVar:
              "--card-glow-x",
            yVar:
              "--card-glow-y",
          }
        );

        if (
          card.getAttribute(
            "role"
          ) === "button" &&
          card.querySelector(
            "button"
          )
        ) {
          card.setAttribute(
            "role",
            "group"
          );

          card.removeAttribute(
            "tabindex"
          );
        }
      });

    root
      .querySelectorAll(".btn")
      .forEach((button) => {
        attachPointerSpotlight(
          button,
          {
            xVar:
              "--pointer-x",
            yVar:
              "--pointer-y",
          }
        );
      });

    root
      .querySelectorAll(
        ".showcase-card"
      )
      .forEach((card) => {
        attachPointerSpotlight(
          card,
          {
            xVar: "--spot-x",
            yVar: "--spot-y",
          }
        );
      });
  }

  function observeRevealTargets(
    root = document
  ) {
    if (
      reduced ||
      !revealObserver
    ) {
      decorateInteractiveElements(
        root
      );

      return;
    }

    const targets =
      root.querySelectorAll(
        ".section, .choice-card, .benefit-grid article, .product-card:not(.skeleton-card), .panel-card, .admin-choice-card, .catalog-tools-head, .location-grid, .catalog-hero-grid, .crosslink-card"
      );

    targets.forEach(
      (element, index) => {
        if (
          !element.classList.contains(
            "reveal-on-scroll"
          )
        ) {
          element.classList.add(
            "reveal-on-scroll"
          );

          element.style.setProperty(
            "--reveal-delay",
            `${Math.min(
              index % 6,
              5
            ) * 50}ms`
          );

          setRevealDirection(
            element,
            index
          );

          revealObserver.observe(
            element
          );
        }
      }
    );

    decorateInteractiveElements(
      root
    );
  }

  if (!reduced) {
    revealObserver =
      new IntersectionObserver(
        (entries) => {
          entries.forEach(
            (entry) => {
              if (
                !entry.isIntersecting
              ) {
                return;
              }

              entry.target.classList.add(
                "is-visible"
              );

              revealObserver.unobserve(
                entry.target
              );
            }
          );
        },
        {
          threshold: 0.075,
          rootMargin:
            "0px 0px -22px 0px",
        }
      );

    observeRevealTargets(
      document
    );

    const domWatcher =
      new MutationObserver(
        (mutations) => {
          for (
            const mutation of
            mutations
          ) {
            if (
              !mutation
                .addedNodes
                .length
            ) {
              continue;
            }

            observeRevealTargets(
              document
            );

            break;
          }
        }
      );

    domWatcher.observe(
      document.body,
      {
        childList: true,
        subtree: true,
      }
    );
  } else {
    document.documentElement.classList.add(
      "reduce-motion"
    );

    decorateInteractiveElements(
      document
    );
  }

  /* =========================================================
     5. Profundidad sutil en héroes
     ========================================================= */
  if (
    isPublicPage &&
    isFinePointer &&
    !reduced
  ) {
    const heroShowcase =
      document.querySelector(
        ".hero-showcase"
      );

    if (heroShowcase) {
      attachPointerSpotlight(
        heroShowcase,
        {
          xVar:
            "--hero-glow-x",

          yVar:
            "--hero-glow-y",

          tiltXVar:
            "--hero-tilt-x",

          tiltYVar:
            "--hero-tilt-y",

          tiltAmountX: 3.4,
          tiltAmountY: 4.4,
        }
      );
    }

    document
      .querySelectorAll(
        ".catalog-photo-showcase"
      )
      .forEach(
        (showcase) => {
          attachPointerSpotlight(
            showcase,
            {
              xVar:
                "--catalog-glow-x",

              yVar:
                "--catalog-glow-y",

              tiltXVar:
                "--catalog-tilt-x",

              tiltYVar:
                "--catalog-tilt-y",

              tiltAmountX:
                2.4,

              tiltAmountY:
                3.1,
            }
          );
        }
      );
  }

  /* =========================================================
     6. Scroll suave para anclas internas
     ========================================================= */
  document
    .querySelectorAll(
      "a[href^='#']"
    )
    .forEach((link) => {
      link.addEventListener(
        "click",
        (event) => {
          const id =
            link.getAttribute(
              "href"
            );

          if (
            !id ||
            id === "#"
          ) {
            return;
          }

          const target =
            document.querySelector(
              id
            );

          if (!target) {
            return;
          }

          event.preventDefault();

          target.scrollIntoView({
            behavior:
              reduced
                ? "auto"
                : "smooth",

            block: "start",
          });
        }
      );
    });

  /* =========================================================
     7. Navegación activa por sección
     ========================================================= */
  if (
    isPublicPage &&
    document.body.classList.contains(
      "landing-page"
    )
  ) {
    const anchorLinks = [
      ...document.querySelectorAll(
        ".nav-links a[href^='#']"
      ),
    ];

    const sectionMap =
      anchorLinks
        .map((link) => {
          const selector =
            link.getAttribute(
              "href"
            );

          return {
            link,
            section: selector
              ? document.querySelector(
                  selector
                )
              : null,
          };
        })
        .filter(
          (item) =>
            item.section
        );

    const homeLink =
      document.querySelector(
        '.nav-links a[href="index.html"]'
      );

    const homeSection =
      document.querySelector(
        "#inicio"
      );

    if (
      homeLink &&
      homeSection
    ) {
      homeLink.classList.remove(
        "active"
      );

      sectionMap.unshift({
        link: homeLink,
        section: homeSection,
      });
    }

    if (
      sectionMap.length
    ) {
      const sectionObserver =
        new IntersectionObserver(
          (entries) => {
            const visible =
              entries
                .filter(
                  (entry) =>
                    entry.isIntersecting
                )
                .sort(
                  (a, b) =>
                    b.intersectionRatio -
                    a.intersectionRatio
                )[0];

            if (!visible) {
              return;
            }

            sectionMap.forEach(
              ({
                link,
                section,
              }) => {
                link.classList.toggle(
                  "section-active",
                  section ===
                    visible.target
                );
              }
            );
          },
          {
            threshold: [
              0.25,
              0.45,
              0.65,
            ],

            rootMargin:
              "-18% 0px -58% 0px",
          }
        );

      sectionMap.forEach(
        ({ section }) =>
          sectionObserver.observe(
            section
          )
      );
    }
  }

  /* =========================================================
     8. Menú móvil
     ========================================================= */
  const mobileToggle =
    document.querySelector(
      ".mobile-toggle"
    );

  const nav =
    document.querySelector(
      ".nav-links"
    );

  function closeMobileNav() {
    if (
      !mobileToggle ||
      !nav
    ) {
      return;
    }

    nav.classList.remove(
      "open"
    );

    mobileToggle.setAttribute(
      "aria-expanded",
      "false"
    );
  }

  if (
    mobileToggle &&
    nav
  ) {
    document.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key ===
            "Escape" &&
          nav.classList.contains(
            "open"
          )
        ) {
          closeMobileNav();

          mobileToggle.focus();
        }
      }
    );

    document.addEventListener(
      "pointerdown",
      (event) => {
        if (
          !nav.classList.contains(
            "open"
          )
        ) {
          return;
        }

        if (
          nav.contains(
            event.target
          ) ||
          mobileToggle.contains(
            event.target
          )
        ) {
          return;
        }

        closeMobileNav();
      }
    );
  }

  /* =========================================================
     9. WhatsApp flotante
     ========================================================= */
  if (
    isPublicPage &&
    !document.querySelector(
      ".wa-floating-btn"
    )
  ) {
    const waFloat =
      document.createElement("a");

    waFloat.className =
      "wa-floating-btn";

    waFloat.href =
      "https://wa.me/19292659222?text=" +
      encodeURIComponent(
        "Hola Remesas USA, vengo de su página web y quisiera hacer una consulta."
      );

    waFloat.target = "_blank";
    waFloat.rel = "noopener";

    waFloat.setAttribute(
      "aria-label",
      "Contactar por WhatsApp a Remesas USA"
    );

    waFloat.innerHTML = `
      <span
        class="wa-float-icon"
        aria-hidden="true"
      >
        💬
      </span>

      <span
        class="wa-float-text"
      >
        <small>
          ¿Dudas o pedidos?
        </small>

        <b>
          WhatsApp Directo
        </b>
      </span>
    `;

    document.body.appendChild(
      waFloat
    );
  }

  /* =========================================================
     10. Acceso administrativo discreto
     ========================================================= */
  if (isPublicPage) {
    const ADMIN_PATH =
      "admin-login.html";

    const secretSequence =
      "remesasadmin";

    let typedSequence = "";
    let footerTapCount = 0;
    let footerTapTimer = 0;

    document.addEventListener(
      "keydown",
      (event) => {
        const target =
          event.target;

        const isTypingField =
          target instanceof
            HTMLInputElement ||
          target instanceof
            HTMLTextAreaElement ||
          target instanceof
            HTMLSelectElement ||
          target?.isContentEditable;

        if (
          isTypingField ||
          event.ctrlKey ||
          event.metaKey ||
          event.altKey
        ) {
          return;
        }

        if (
          event.key.length !== 1
        ) {
          return;
        }

        typedSequence =
          (
            typedSequence +
            event.key.toLowerCase()
          ).slice(
            -secretSequence.length
          );

        if (
          typedSequence ===
          secretSequence
        ) {
          typedSequence = "";

          window.location.href =
            ADMIN_PATH;
        }
      }
    );

    const footerSecretTarget =
      document.querySelector(
        ".footer-bottom"
      );

    if (footerSecretTarget) {
      footerSecretTarget.addEventListener(
        "click",
        (event) => {
          if (
            event.target.closest(
              "a, button"
            )
          ) {
            return;
          }

          footerTapCount += 1;

          window.clearTimeout(
            footerTapTimer
          );

          footerTapTimer =
            window.setTimeout(
              () => {
                footerTapCount = 0;
              },
              5000
            );

          if (
            footerTapCount >= 7
          ) {
            footerTapCount = 0;

            window.clearTimeout(
              footerTapTimer
            );

            window.location.href =
              ADMIN_PATH;
          }
        }
      );
    }
  }

  window.RemesasUI = {
    refreshReveal: () =>
      observeRevealTargets(
        document
      ),
  };
})();