(async function () {
  const api = window.RemesasAPI;

  const section =
    document.body.dataset.catalogLine === "perfumes"
      ? "perfume"
      : "ecuador";

  const isPerfume =
    section === "perfume";

  const ECUADOR_PROMO_IMAGE =
    "assets/hero-ecuador-bandera.png";

  const PERFUME_PROMO_IMAGE =
    "assets/perfumesfoto.jpg";

  let products = [];
  let categories = [];
  let activeCategory = "all";
  let searchTerm = "";
  let sortMode = "featured";
  let onlyAvailable = false;
  let lastTrackedSearch = "";
  let lastFocusedElement = null;

  const esc = (value) =>
    String(value ?? "").replace(
      /[&<>'"]/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        })[character]
    );

  const money = (value) =>
    `$${Number(value || 0).toFixed(2)}`;

  const grid =
    document.getElementById(
      "catalogGrid"
    );

  const filters =
    document.getElementById(
      "catalogFilters"
    );

  const search =
    document.getElementById(
      "catalogSearch"
    );

  const sortSelect =
    document.getElementById(
      "catalogSort"
    );

  const onlyAvailableToggle =
    document.getElementById(
      "onlyAvailableToggle"
    );

  const count =
    document.getElementById(
      "catalogCount"
    );

  const empty =
    document.getElementById(
      "catalogEmpty"
    );

  const clear =
    document.getElementById(
      "catalogClear"
    );

  const modal =
    document.getElementById(
      "productModal"
    );

  const shareBtn =
    document.getElementById(
      "modalShare"
    );

  function categoryName(id) {
    return (
      categories.find(
        (category) =>
          category.id === id
      )?.name ||
      "General"
    );
  }

  function stockLabel(status) {
    return status === "available"
      ? "Disponible"
      : status === "low_stock"
      ? "Pocas unidades"
      : "Agotado";
  }

  function stockClass(status) {
    return status === "available"
      ? "available"
      : status === "low_stock"
      ? "low"
      : "unavailable";
  }

  function fallbackMarkup(
    emoji
  ) {
    return `
      <span
        class="fallback-emoji"
        aria-hidden="true"
      >
        ${emoji}
      </span>
    `;
  }

  function imageMarkup(item) {
    const fallback =
      isPerfume
        ? "✨"
        : "🇪🇨";

    if (item.image_url) {
      return `
        <img
          src="${esc(
            item.image_url
          )}"
          alt="${esc(
            item.name
          )}"
          loading="lazy"
          decoding="async"
          data-fallback="${fallback}"
        >
      `;
    }

    return fallbackMarkup(
      fallback
    );
  }

  function bindImageFallbacks(
    root = document
  ) {
    root
      .querySelectorAll(
        "img[data-fallback]"
      )
      .forEach((image) => {
        if (
          image.dataset
            .fallbackBound ===
          "true"
        ) {
          return;
        }

        image.dataset
          .fallbackBound =
          "true";

        image.addEventListener(
          "error",
          () => {
            const emoji =
              image.dataset
                .fallback ||
              (isPerfume
                ? "✨"
                : "🇪🇨");

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
              emoji;

            image.replaceWith(
              fallback
            );
          }
        );
      });
  }

  function productUrl(item) {
    const url =
      new URL(
        window.location.href
      );

    url.searchParams.set(
      "p",
      item.id
    );

    url.hash = "";

    return url.toString();
  }

  /* =========================================================
     HERO DE CATÁLOGO
     ========================================================= */
  function hydrateCatalogHero() {
    const targets = [
      ...document.querySelectorAll(
        "[data-catalog-hero-image]"
      ),
    ];

    if (
      !targets.length
    ) {
      return;
    }

    const candidates =
      products
        .filter(
          (item) =>
            item.image_url &&
            item.stock_status !==
              "out_of_stock"
        )
        .sort(
          (a, b) =>
            Number(
              b.featured
            ) -
            Number(
              a.featured
            )
        );

    targets.forEach(
      (image, index) => {
        const holder =
          image.closest(
            "figure, .catalog-photo-main"
          );

        if (
          isPerfume &&
          index === 0
        ) {
          image.src =
            PERFUME_PROMO_IMAGE;

          image.alt =
            "Perfumería y fragancias de Remesas USA";

          image.addEventListener(
            "load",
            () => {
              holder?.classList.add(
                "has-image"
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

              holder?.classList.remove(
                "has-image"
              );
            },
            { once: true }
          );

          return;
        }

        if (
          !isPerfume &&
          index === 0
        ) {
          image.src =
            ECUADOR_PROMO_IMAGE;

          image.alt =
            "Productos ecuatorianos sobre la bandera de Ecuador";

          image.addEventListener(
            "load",
            () => {
              holder?.classList.add(
                "has-image"
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

              holder?.classList.remove(
                "has-image"
              );
            },
            { once: true }
          );

          return;
        }

        const candidateIndex =
          index - 1;

        const item =
          candidates[
            candidateIndex
          ];

        if (!item) {
          image.removeAttribute(
            "src"
          );

          holder?.classList.remove(
            "has-image"
          );

          return;
        }

        image.src =
          item.image_url;

        image.alt =
          `${item.name} · ${
            isPerfume
              ? "Perfumería"
              : "Productos ecuatorianos"
          } Remesas USA`;

        image.addEventListener(
          "load",
          () => {
            holder?.classList.add(
              "has-image"
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

            holder?.classList.remove(
              "has-image"
            );
          },
          { once: true }
        );
      }
    );
  }

  /* =========================================================
     SKELETONS
     ========================================================= */
  function renderSkeletons() {
    grid.innerHTML =
      Array.from(
        { length: 8 },
        () => `
          <article
            class="product-card skeleton-card"
            aria-hidden="true"
          >
            <div
              class="skeleton skeleton-image"
            ></div>

            <div
              class="product-body"
            >
              <div
                class="skeleton skeleton-line short"
              ></div>

              <div
                class="skeleton skeleton-line"
              ></div>

              <div
                class="skeleton skeleton-line medium"
              ></div>

              <div
                class="skeleton skeleton-line price"
              ></div>
            </div>
          </article>
        `
      ).join("");
  }

  /* =========================================================
     FILTROS
     ========================================================= */
  function renderFilters() {
    const rows = [
      {
        id: "all",
        name: "Todos",
      },
      ...categories,
    ];

    filters.innerHTML =
      rows
        .map(
          (category) => `
            <button
              class="filter-btn ${
                category.id ===
                activeCategory
                  ? "active"
                  : ""
              }"
              data-cat="${
                category.id
              }"
              type="button"
            >
              ${esc(
                category.name
              )}
            </button>
          `
        )
        .join("");

    filters
      .querySelectorAll(
        "button"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            activeCategory =
              button.dataset.cat;

            renderFilters();
            renderProducts();
          }
        );
      });
  }

  function filteredProducts() {
    const query =
      searchTerm
        .trim()
        .toLowerCase();

    return products
      .filter((item) => {
        const categoryOk =
          activeCategory ===
            "all" ||
          item.category_id ===
            activeCategory;

        const stockOk =
          !onlyAvailable ||
          item.stock_status !==
            "out_of_stock";

        const text =
          `
            ${item.name}
            ${item.brand || ""}
            ${item.description || ""}
            ${categoryName(
              item.category_id
            )}
          `.toLowerCase();

        return (
          categoryOk &&
          stockOk &&
          (!query ||
            text.includes(
              query
            ))
        );
      })
      .sort((a, b) => {
        if (
          sortMode ===
          "price-asc"
        ) {
          return (
            Number(
              a.price ||
                0
            ) -
            Number(
              b.price ||
                0
            )
          );
        }

        if (
          sortMode ===
          "price-desc"
        ) {
          return (
            Number(
              b.price ||
                0
            ) -
            Number(
              a.price ||
                0
            )
          );
        }

        if (
          sortMode ===
          "name-asc"
        ) {
          return a.name.localeCompare(
            b.name
          );
        }

        return (
          Number(
            b.featured
          ) -
            Number(
              a.featured
            ) ||
          a.name.localeCompare(
            b.name
          )
        );
      });
  }

  /* =========================================================
     PRODUCTOS
     ========================================================= */
  function renderProducts() {
    const rows =
      filteredProducts();

    const noun =
      isPerfume
        ? rows.length === 1
          ? "perfume"
          : "perfumes"
        : rows.length === 1
        ? "producto"
        : "productos";

    count.textContent =
      `${rows.length} ${noun}`;

    empty.hidden =
      rows.length > 0;

    grid.hidden =
      rows.length === 0;

    grid.innerHTML =
      rows
        .map(
          (
            item,
            index
          ) => `
            <article
              class="product-card ${
                isPerfume
                  ? "perfume-card"
                  : ""
              }"
              data-card-id="${
                item.id
              }"
              style="--card-index:${index}"
              role="button"
              tabindex="0"
              aria-label="Ver detalle de ${esc(
                item.name
              )}"
            >
              <div
                class="product-visual"
              >
                ${imageMarkup(
                  item
                )}

                ${
                  item.featured
                    ? `
                      <span
                        class="featured-badge"
                      >
                        ★ DESTACADO
                      </span>
                    `
                    : ""
                }

                <span
                  class="card-stock-badge ${stockClass(
                    item.stock_status
                  )}"
                >
                  <i
                    class="stock-dot-inline"
                  ></i>

                  ${stockLabel(
                    item.stock_status
                  )}
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
                    ${esc(
                      categoryName(
                        item.category_id
                      )
                    )}
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
                      "Disponible en Remesas USA · 1567 Watson Ave, Bronx."
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

                  <button
                    class="view-product"
                    data-view="${
                      item.id
                    }"
                    type="button"
                    aria-label="Ver ${esc(
                      item.name
                    )}"
                  >
                    Ver ${
                      isPerfume
                        ? "fragancia"
                        : "detalle"
                    }
                    <b>→</b>
                  </button>
                </div>
              </div>
            </article>
          `
        )
        .join("");

    bindImageFallbacks(
      grid
    );

    grid
      .querySelectorAll(
        "[data-card-id]"
      )
      .forEach((card) => {
        const open = () =>
          openProduct(
            card.dataset.cardId
          );

        card.addEventListener(
          "click",
          (event) => {
            if (
              event.target.closest(
                "button, a"
              )
            ) {
              if (
                event.target.closest(
                  "[data-view]"
                )
              ) {
                open();
              }

              return;
            }

            open();
          }
        );

        card.addEventListener(
          "keydown",
          (event) => {
            if (
              event.target.closest(
                "button, a, input, select"
              )
            ) {
              return;
            }

            if (
              event.key ===
                "Enter" ||
              event.key ===
                " "
            ) {
              event.preventDefault();

              open();
            }
          }
        );
      });

    grid
      .querySelectorAll(
        "[data-view]"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          (event) => {
            event.stopPropagation();

            openProduct(
              button.dataset.view
            );
          }
        );
      });

    window.RemesasUI
      ?.refreshReveal?.();
  }

  /* =========================================================
     MODAL
     ========================================================= */
  function openProduct(id) {
    const item =
      products.find(
        (value) =>
          String(
            value.id
          ) ===
          String(id)
      );

    if (!item) {
      return;
    }

    lastFocusedElement =
      document.activeElement;

    api.track({
      event_type:
        "item_view",

      section,

      item_id:
        item.id,

      page_path:
        location.pathname,
    });

    const modalLine =
      document.getElementById(
        "modalLine"
      );

    modalLine.textContent =
      isPerfume
        ? "Perfumería"
        : "Productos ecuatorianos";

    modalLine.className =
      `line-badge ${
        isPerfume
          ? "perfume-line"
          : "ecuador-line"
      }`;

    document.getElementById(
      "modalTitle"
    ).textContent =
      item.name;

    document.getElementById(
      "modalCategory"
    ).textContent =
      item.brand
        ? `${categoryName(
            item.category_id
          )} · ${item.brand}`
        : categoryName(
            item.category_id
          );

    document.getElementById(
      "modalDescription"
    ).textContent =
      item.description ||
      "Disponible en nuestra tienda Remesas USA en 1567 Watson Ave, Bronx, NY.";

    document.getElementById(
      "modalPrice"
    ).textContent =
      money(
        item.price
      );

    const stock =
      document.getElementById(
        "modalStock"
      );

    stock.textContent =
      stockLabel(
        item.stock_status
      );

    stock.className =
      `stock-pill ${stockClass(
        item.stock_status
      )}`;

    const visual =
      document.getElementById(
        "modalVisual"
      );

    visual.innerHTML =
      imageMarkup(
        item
      );

    visual.classList.toggle(
      "perfume-modal-visual",
      isPerfume
    );

    bindImageFallbacks(
      visual
    );

    const whatsapp =
      document.getElementById(
        "modalWhatsapp"
      );

    const kind =
      isPerfume
        ? "perfume"
        : "producto";

    const msg =
      `Hola Remesas USA, vi el ${kind} ` +
      `"${item.name}" ` +
      `(${money(
        item.price
      )}) ` +
      `en su catálogo web. ` +
      `¿Está disponible en el local de Watson Ave?`;

    whatsapp.href =
      `https://wa.me/19292659222?text=${encodeURIComponent(
        msg
      )}`;

    whatsapp.onclick =
      () =>
        api.track({
          event_type:
            "whatsapp_click",

          section,

          item_id:
            item.id,

          page_path:
            location.pathname,
        });

    if (shareBtn) {
      shareBtn.onclick =
        async () => {
          const shareData =
            {
              title:
                `${item.name} | Remesas USA`,

              text:
                `Mira este ${kind} ` +
                `en Remesas USA: ` +
                `${item.name} ` +
                `(${money(
                  item.price
                )})`,

              url:
                productUrl(
                  item
                ),
            };

          if (
            navigator.share
          ) {
            try {
              await navigator.share(
                shareData
              );
            } catch {
              // El usuario pudo cancelar.
            }
          } else {
            const shareText =
              `${shareData.text} - ${shareData.url}`;

            try {
              await navigator.clipboard.writeText(
                shareText
              );
            } catch {
              const helper =
                document.createElement(
                  "textarea"
                );

              helper.value =
                shareText;

              helper.setAttribute(
                "readonly",
                ""
              );

              helper.style.position =
                "fixed";

              helper.style.opacity =
                "0";

              document.body.appendChild(
                helper
              );

              helper.select();

              document.execCommand(
                "copy"
              );

              helper.remove();
            }

            const previous =
              shareBtn.textContent;

            shareBtn.textContent =
              "✓ Enlace copiado";

            setTimeout(
              () => {
                shareBtn.textContent =
                  previous;
              },
              1800
            );
          }
        };
    }

    modal.classList.add(
      "open"
    );

    modal.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.style.overflow =
      "hidden";

    requestAnimationFrame(
      () => {
        modal
          .querySelector(
            ".modal-close"
          )
          ?.focus();
      }
    );
  }

  function closeModal() {
    if (
      !modal.classList.contains(
        "open"
      )
    ) {
      return;
    }

    modal.classList.remove(
      "open"
    );

    modal.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.style.overflow =
      "";

    if (
      lastFocusedElement instanceof
      HTMLElement
    ) {
      lastFocusedElement.focus();
    }
  }

  document
    .querySelectorAll(
      "[data-close-modal]"
    )
    .forEach((element) => {
      element.addEventListener(
        "click",
        closeModal
      );
    });

  modal.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key ===
        "Escape"
      ) {
        closeModal();

        return;
      }

      if (
        event.key !==
        "Tab"
      ) {
        return;
      }

      const focusable = [
        ...modal.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ),
      ].filter(
        (element) =>
          !element.hasAttribute(
            "hidden"
          )
      );

      if (
        !focusable.length
      ) {
        return;
      }

      const first =
        focusable[0];

      const last =
        focusable[
          focusable.length -
            1
        ];

      if (
        event.shiftKey &&
        document.activeElement ===
          first
      ) {
        event.preventDefault();

        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement ===
          last
      ) {
        event.preventDefault();

        first.focus();
      }
    }
  );

  /* =========================================================
     BUSCADOR
     ========================================================= */
  search.addEventListener(
    "input",
    () => {
      searchTerm =
        search.value;

      renderProducts();

      const term =
        searchTerm.trim();

      clearTimeout(
        search._timer
      );

      if (
        term.length >= 3 &&
        term.toLowerCase() !==
          lastTrackedSearch.toLowerCase()
      ) {
        search._timer =
          setTimeout(
            () => {
              lastTrackedSearch =
                term;

              api.track({
                event_type:
                  "search",

                section,

                search_term:
                  term,

                page_path:
                  location.pathname,
              });
            },
            700
          );
      }
    }
  );

  /* =========================================================
     ORDEN
     ========================================================= */
  if (sortSelect) {
    sortSelect.addEventListener(
      "change",
      () => {
        sortMode =
          sortSelect.value;

        renderProducts();
      }
    );
  }

  /* =========================================================
     SOLO DISPONIBLES
     ========================================================= */
  if (
    onlyAvailableToggle
  ) {
    onlyAvailableToggle.addEventListener(
      "change",
      () => {
        onlyAvailable =
          onlyAvailableToggle.checked;

        renderProducts();
      }
    );
  }

  /* =========================================================
     LIMPIAR FILTROS
     ========================================================= */
  clear.addEventListener(
    "click",
    () => {
      search.value =
        "";

      searchTerm =
        "";

      activeCategory =
        "all";

      sortMode =
        "featured";

      onlyAvailable =
        false;

      if (sortSelect) {
        sortSelect.value =
          "featured";
      }

      if (
        onlyAvailableToggle
      ) {
        onlyAvailableToggle.checked =
          false;
      }

      renderFilters();
      renderProducts();
    }
  );

  /* =========================================================
     MENÚ MÓVIL
     ========================================================= */
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
      .forEach((link) => {
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
        );
      });
  }

  /* =========================================================
     AÑO
     ========================================================= */
  const year =
    document.getElementById(
      "year"
    );

  if (year) {
    year.textContent =
      new Date().getFullYear();
  }

  /* =========================================================
     CARGA INICIAL
     ========================================================= */
  try {
    renderSkeletons();

    [
      products,
      categories,
    ] = await Promise.all([
      api.listCatalog(
        section
      ),

      api.listCategories(
        section
      ),
    ]);

    renderFilters();
    renderProducts();
    hydrateCatalogHero();

    api.track({
      event_type:
        "page_view",

      section,

      page_path:
        location.pathname,
    });

    const deepLinkedId =
      new URLSearchParams(
        window.location.search
      ).get("p");

    if (
      deepLinkedId &&
      products.some(
        (item) =>
          String(
            item.id
          ) ===
          String(
            deepLinkedId
          )
      )
    ) {
      openProduct(
        deepLinkedId
      );
    }
  } catch (error) {
    grid.innerHTML = `
      <div
        class="empty-state backend-error"
      >
        <div>
          ⚠
        </div>

        <h3>
          No pudimos cargar el catálogo
        </h3>

        <p>
          ${esc(
            error.message
          )}
        </p>

        <button
          class="btn btn-red"
          onclick="location.reload()"
        >
          Reintentar
        </button>
      </div>
    `;
  }
})();