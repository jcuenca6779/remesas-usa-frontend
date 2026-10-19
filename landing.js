(async function () {
  const api = window.RemesasAPI;

  const ECUADOR_PROMO_IMAGE =
    "assets/hero-ecuador-bandera.webp";

  const PERFUME_PROMO_IMAGE =
    "assets/perfumesfoto.jpg";

  api.track({
    event_type: "page_view",
    section: "general",
    page_path: location.pathname,
  });

  const toggle =
    document.querySelector(
      ".mobile-toggle"
    );

  const nav =
    document.querySelector(
      ".nav-links"
    );

  if (
    toggle &&
    nav
  ) {
    toggle.addEventListener(
      "click",
      () => {
        nav.classList.toggle(
          "open"
        );

        toggle.setAttribute(
          "aria-expanded",
          String(
            nav.classList.contains(
              "open"
            )
          )
        );
      }
    );

    nav
      .querySelectorAll("a")
      .forEach((link) =>
        link.addEventListener(
          "click",
          () => {
            nav.classList.remove(
              "open"
            );

            toggle.setAttribute(
              "aria-expanded",
              "false"
            );
          }
        )
      );
  }

  const year =
    document.getElementById(
      "year"
    );

  if (year) {
    year.textContent =
      new Date().getFullYear();
  }

  const esc = (value) =>
    String(value ?? "").replace(
      /[&<>'"]/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        })[char]
    );

  const money = (value) =>
    `$${Number(value || 0).toFixed(2)}`;

  function deepLink(item) {
    const page =
      item._line === "perfume"
        ? "perfumes.html"
        : "productos.html";

    return `${page}?p=${encodeURIComponent(
      item.id
    )}`;
  }

  function rankedImages(list) {
    return [...(list || [])]
      .filter(
        (item) =>
          item.image_url &&
          item.stock_status !==
            "out_of_stock"
      )
      .sort(
        (a, b) =>
          Number(b.featured) -
          Number(a.featured)
      );
  }

  function setStaticImage(
    id,
    src,
    alt
  ) {
    const image =
      document.getElementById(id);

    if (!image) return;

    image.src = src;
    image.alt = alt;

    image.addEventListener(
      "load",
      () => {
        image.classList.add(
          "is-loaded"
        );

        image.parentElement?.classList.add(
          "has-live-image"
        );
      },
      { once: true }
    );

    image.addEventListener(
      "error",
      () => {
        image.removeAttribute(
          "src"
        );

        image.classList.remove(
          "is-loaded"
        );

        image.parentElement?.classList.remove(
          "has-live-image"
        );
      },
      { once: true }
    );
  }

  function setLiveImage(
    id,
    item
  ) {
    const image =
      document.getElementById(id);

    if (
      !image ||
      !item?.image_url
    ) {
      return;
    }

    image.src =
      item.image_url;

    image.alt =
      item.name ||
      "Producto disponible en Remesas USA";

    image.addEventListener(
      "load",
      () => {
        image.classList.add(
          "is-loaded"
        );

        image.parentElement?.classList.add(
          "has-live-image"
        );
      },
      { once: true }
    );

    image.addEventListener(
      "error",
      () => {
        image.removeAttribute(
          "src"
        );

        image.classList.remove(
          "is-loaded"
        );

        image.parentElement?.classList.remove(
          "has-live-image"
        );
      },
      { once: true }
    );
  }

  function bindFeaturedImageFallbacks(
    root
  ) {
    root
      .querySelectorAll(
        "img[data-featured-fallback]"
      )
      .forEach((image) => {
        image.addEventListener(
          "error",
          () => {
            const fallback =
              document.createElement(
                "span"
              );

            fallback.className =
              "fallback-emoji";

            fallback.setAttribute(
              "aria-hidden",
              "true"
            );

            fallback.textContent =
              image.dataset.featuredFallback ||
              "✨";

            image.replaceWith(
              fallback
            );
          },
          { once: true }
        );
      });
  }

  try {
    const [
      ecuadorList,
      perfumeList,
    ] = await Promise.all([
      api
        .listCatalog(
          "ecuador"
        )
        .catch(
          () => []
        ),

      api
        .listCatalog(
          "perfume"
        )
        .catch(
          () => []
        ),
    ]);

    const ecCount =
      Array.isArray(
        ecuadorList
      )
        ? ecuadorList.length
        : 0;

    const pfCount =
      Array.isArray(
        perfumeList
      )
        ? perfumeList.length
        : 0;

    const heroEc =
      document.getElementById(
        "heroCountEcuador"
      );

    const heroPf =
      document.getElementById(
        "heroCountPerfume"
      );

    const badgeEc =
      document.getElementById(
        "badgeCountEcuador"
      );

    const badgePf =
      document.getElementById(
        "badgeCountPerfume"
      );

    if (ecCount > 0) {
      if (heroEc) {
        heroEc.textContent =
          `${ecCount} productos en catálogo`;
      }

      if (badgeEc) {
        badgeEc.textContent =
          `${ecCount} productos`;
      }
    }

    if (pfCount > 0) {
      if (heroPf) {
        heroPf.textContent =
          `${pfCount} fragancias en catálogo`;
      }

      if (badgePf) {
        badgePf.textContent =
          `${pfCount} fragancias`;
      }
    }

    const ecImages =
      rankedImages(
        ecuadorList
      );

    const pfImages =
      rankedImages(
        perfumeList
      );

    setStaticImage(
      "heroImageEcuador",
      ECUADOR_PROMO_IMAGE,
      "Productos ecuatorianos sobre la bandera de Ecuador"
    );

    setStaticImage(
      "choiceImageEcuador",
      ECUADOR_PROMO_IMAGE,
      "Productos ecuatorianos sobre la bandera de Ecuador"
    );

    setStaticImage(
      "heroImagePerfume",
      PERFUME_PROMO_IMAGE,
      "Perfumería y fragancias de Remesas USA"
    );

    setStaticImage(
      "choiceImagePerfume",
      PERFUME_PROMO_IMAGE,
      "Perfumería selecta de Remesas USA"
    );

    setLiveImage(
      "aboutImageOne",
      ecImages[2] ||
        ecImages[0]
    );

    setLiveImage(
      "aboutImageTwo",
      pfImages[2] ||
        pfImages[0]
    );

    const featuredSection =
      document.getElementById(
        "destacados"
      );

    const featuredGrid =
      document.getElementById(
        "landingFeaturedGrid"
      );

    if (
      !featuredSection ||
      !featuredGrid
    ) {
      return;
    }

    const taggedEc =
      (ecuadorList || []).map(
        (item) => ({
          ...item,
          _line:
            "ecuador",
        })
      );

    const taggedPf =
      (perfumeList || []).map(
        (item) => ({
          ...item,
          _line:
            "perfume",
        })
      );

    const allItems = [
      ...taggedEc,
      ...taggedPf,
    ];

    if (
      allItems.length === 0
    ) {
      return;
    }

    featuredSection.hidden =
      false;

    let activeTab =
      "all";

    function renderFeatured(
      filterLine
    ) {
      const pool =
        filterLine === "all"
          ? allItems
          : allItems.filter(
              (item) =>
                item._line ===
                filterLine
            );

      const sorted =
        [...pool]
          .sort(
            (a, b) =>
              Number(
                b.featured
              ) -
              Number(
                a.featured
              )
          )
          .slice(
            0,
            4
          );

      featuredGrid.innerHTML =
        sorted
          .map(
            (
              item,
              idx
            ) => {
              const isPerfume =
                item._line ===
                "perfume";

              const img =
                item.image_url
                  ? `
                    <img
                      src="${esc(
                        item.image_url
                      )}"
                      alt="${esc(
                        item.name
                      )}"
                      loading="lazy"
                      decoding="async"
                      data-featured-fallback="${
                        isPerfume
                          ? "✨"
                          : "🇪🇨"
                      }"
                    >
                  `
                  : `
                    <span
                      class="fallback-emoji"
                    >
                      ${
                        isPerfume
                          ? "✨"
                          : "🇪🇨"
                      }
                    </span>
                  `;

              return `
                <a
                  href="${deepLink(
                    item
                  )}"
                  class="product-card ${
                    isPerfume
                      ? "perfume-card"
                      : ""
                  }"
                  style="--card-index:${idx}"
                >
                  <div
                    class="product-visual"
                  >
                    ${img}

                    <span
                      class="featured-badge"
                    >
                      ${
                        isPerfume
                          ? "✦ PERFUMERÍA"
                          : "🇪🇨 ECUADOR"
                      }
                    </span>
                  </div>

                  <div
                    class="product-body"
                  >
                    <div
                      class="product-topline"
                    >
                      <span
                        class="product-category"
                      >
                        ${
                          isPerfume
                            ? "Fragancia"
                            : "Producto Ecuatoriano"
                        }
                      </span>

                      ${
                        item.brand
                          ? `
                            <span
                              class="product-brand"
                            >
                              ${esc(
                                item.brand
                              )}
                            </span>
                          `
                          : ""
                      }
                    </div>

                    <h3>
                      ${esc(
                        item.name
                      )}
                    </h3>

                    <p>
                      ${esc(
                        item.description ||
                          "Disponible en Remesas USA, Bronx NY."
                      )}
                    </p>

                    <div
                      class="product-meta"
                    >
                      <div
                        class="price-wrap"
                      >
                        <small>
                          Precio
                        </small>

                        <strong>
                          ${money(
                            item.price
                          )}
                        </strong>
                      </div>

                      <span
                        class="view-product"
                      >
                        Ver producto
                        <b>→</b>
                      </span>
                    </div>
                  </div>
                </a>
              `;
            }
          )
          .join("");

      bindFeaturedImageFallbacks(
        featuredGrid
      );

      window.RemesasUI
        ?.refreshReveal?.();
    }

    renderFeatured(
      activeTab
    );

    document
      .querySelectorAll(
        ".featured-tab"
      )
      .forEach((btn) => {
        btn.addEventListener(
          "click",
          () => {
            document
              .querySelectorAll(
                ".featured-tab"
              )
              .forEach(
                (b) =>
                  b.classList.remove(
                    "active"
                  )
              );

            btn.classList.add(
              "active"
            );

            activeTab =
              btn.dataset.tab ||
              "all";

            renderFeatured(
              activeTab
            );
          }
        );
      });
  } catch {
    // La portada sigue disponible aunque la API esté iniciando.
  }
})();