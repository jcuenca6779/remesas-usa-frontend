(async function () {
  const api =
    window.RemesasAPI;

  const section =
    document.body.dataset
      .catalogLine ===
    "perfumes"
      ? "perfume"
      : "ecuador";

  const isPerfume =
    section ===
    "perfume";

  const ECUADOR_PROMO_IMAGE =
    "assets/hero-ecuador-bandera.png";

  const PERFUME_PROMO_IMAGE =
    "assets/perfumesfoto.jpg";

  // =====================================================
  // PAGINACIÓN
  // =====================================================

  const PAGE_SIZE = 24;

  /*
   * Pedimos 25 al servidor.
   *
   * Mostramos solamente 24.
   * El artículo número 25 sirve para
   * saber si todavía existen más.
   */
  const FETCH_SIZE =
    PAGE_SIZE + 1;

  let products = [];
  let categories = [];

  let activeCategory =
    "all";

  let searchTerm =
    "";

  let sortMode =
    "featured";

  let onlyAvailable =
    false;

  let hasMore =
    true;

  let loadingMore =
    false;

  let requestVersion =
    0;

  let lastTrackedSearch =
    "";

  let lastFocusedElement =
    null;

  // =====================================================
  // ELEMENTOS
  // =====================================================

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

  // =====================================================
  // BOTÓN CARGAR MÁS
  // =====================================================

  const loadMoreContainer =
    document.createElement(
      "div"
    );

  loadMoreContainer.className =
    "catalog-load-more";

  loadMoreContainer.style.cssText = `
    width: 100%;
    display: none;
    justify-content: center;
    align-items: center;
    padding: 38px 16px 10px;
  `;

  const loadMoreButton =
    document.createElement(
      "button"
    );

  loadMoreButton.type =
    "button";

  loadMoreButton.className =
    "btn btn-red";

  loadMoreButton.style.cssText = `
    min-width: 210px;
    justify-content: center;
  `;

  loadMoreContainer.appendChild(
    loadMoreButton
  );

  grid.insertAdjacentElement(
    "afterend",
    loadMoreContainer
  );

  // =====================================================
  // UTILIDADES
  // =====================================================

  const esc = value =>
    String(
      value ?? ""
    ).replace(
      /[&<>'"]/g,
      character =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        })[character]
    );

  const money = value =>
    `$${Number(
      value || 0
    ).toFixed(2)}`;

  function categoryName(
    id
  ) {
    return (
      categories.find(
        category =>
          category.id === id
      )?.name ||
      "General"
    );
  }

  function stockLabel(
    status
  ) {
    return status ===
      "available"
      ? "Disponible"
      : status ===
          "low_stock"
      ? "Pocas unidades"
      : "Agotado";
  }

  function stockClass(
    status
  ) {
    return status ===
      "available"
      ? "available"
      : status ===
          "low_stock"
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

  function imageMarkup(
    item
  ) {
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
      .forEach(
        image => {
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
                (
                  isPerfume
                    ? "✨"
                    : "🇪🇨"
                );

              const fallback =
                document
                  .createElement(
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
        }
      );
  }

  function productUrl(
    item
  ) {
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

  // =====================================================
  // HERO
  // =====================================================

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
          item =>
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
      (
        image,
        index
      ) => {
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
            {
              once: true,
            }
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
            {
              once: true,
            }
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
            {
              once: true,
            }
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
            {
              once: true,
            }
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
          {
            once: true,
          }
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
          {
            once: true,
          }
        );
      }
    );
  }

  // =====================================================
  // SKELETONS
  // =====================================================

  function renderSkeletons() {
    empty.hidden =
      true;

    grid.hidden =
      false;

    grid.innerHTML =
      Array.from(
        {
          length: 8,
        },
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

  // =====================================================
  // FILTROS
  // =====================================================

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
          category => `
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
      .forEach(
        button => {
          button.addEventListener(
            "click",
            async () => {
              const category =
                button.dataset.cat;

              if (
                category ===
                activeCategory
              ) {
                return;
              }

              activeCategory =
                category;

              renderFilters();

              await loadCatalog({
                reset: true,
              });
            }
          );
        }
      );
  }

  // =====================================================
  // PARÁMETROS PARA FASTAPI
  // =====================================================

  function catalogParams(
    offset
  ) {
    const cleanSearch =
      searchTerm
        .trim()
        .slice(
          0,
          100
        );

    return {
      offset,
      limit:
        FETCH_SIZE,

      search:
        cleanSearch ||
        undefined,

      category_id:
        activeCategory !==
        "all"
          ? activeCategory
          : undefined,

      only_available:
        onlyAvailable
          ? true
          : undefined,

      sort:
        sortMode,
    };
  }

  // =====================================================
  // CONTADOR
  // =====================================================

  function updateCount() {
    const amount =
      products.length;

    const noun =
      isPerfume
        ? (
            amount === 1
              ? "perfume"
              : "perfumes"
          )
        : (
            amount === 1
              ? "producto"
              : "productos"
          );

    if (
      amount === 0
    ) {
      count.textContent =
        `0 ${noun}`;

      return;
    }

    if (hasMore) {
      count.textContent =
        `Mostrando ${amount} ${noun}`;
    } else {
      count.textContent =
        `${amount} ${noun}`;
    }
  }

  // =====================================================
  // BOTÓN CARGAR MÁS
  // =====================================================

  function updateLoadMore() {
    const visible =
      products.length > 0 &&
      hasMore;

    loadMoreContainer.style
      .display =
      visible
        ? "flex"
        : "none";

    loadMoreButton.disabled =
      loadingMore;

    loadMoreButton.innerHTML =
      loadingMore
        ? `
          <span>
            Cargando...
          </span>
        `
        : `
          <span>
            Cargar 24 más
          </span>

          <span
            aria-hidden="true"
            style="
              margin-left: 8px;
              font-size: 17px;
            "
          >
            ↓
          </span>
        `;
  }

  // =====================================================
  // RENDER PRODUCTOS
  // =====================================================

  function renderProducts() {
    const rows =
      products;

    updateCount();

    empty.hidden =
      rows.length > 0;

    grid.hidden =
      rows.length === 0;

    if (
      rows.length === 0
    ) {
      grid.innerHTML = "";

      updateLoadMore();

      return;
    }

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

                    <b>
                      →
                    </b>
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
      .forEach(
        card => {
          const open =
            () =>
              openProduct(
                card.dataset.cardId
              );

          card.addEventListener(
            "click",
            event => {
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
            event => {
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
        }
      );

    grid
      .querySelectorAll(
        "[data-view]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            event => {
              event.stopPropagation();

              openProduct(
                button.dataset.view
              );
            }
          );
        }
      );

    updateLoadMore();

    window.RemesasUI
      ?.refreshReveal?.();
  }

  // =====================================================
  // CARGA DESDE SERVIDOR
  // =====================================================

  async function loadCatalog({
    reset = false,
  } = {}) {

    if (
      !reset &&
      (
        loadingMore ||
        !hasMore
      )
    ) {
      return;
    }

    /*
     * Cada reinicio aumenta la versión.
     * Si una búsqueda anterior responde tarde,
     * su resultado se ignora.
     */
    const version =
      reset
        ? ++requestVersion
        : requestVersion;

    const offset =
      reset
        ? 0
        : products.length;

    if (reset) {
      products = [];

      hasMore = true;

      loadMoreContainer.style
        .display =
        "none";

      renderSkeletons();

    } else {
      loadingMore = true;

      updateLoadMore();
    }

    try {
      const rows =
        await api.listCatalog(
          section,
          catalogParams(
            offset
          )
        );

      if (
        version !==
        requestVersion
      ) {
        return;
      }

      hasMore =
        rows.length >
        PAGE_SIZE;

      const page =
        rows.slice(
          0,
          PAGE_SIZE
        );

      if (reset) {
        products =
          page;
      } else {
        const existingIds =
          new Set(
            products.map(
              item =>
                String(
                  item.id
                )
            )
          );

        const uniquePage =
          page.filter(
            item =>
              !existingIds.has(
                String(
                  item.id
                )
              )
          );

        products.push(
          ...uniquePage
        );
      }

      renderProducts();

      if (reset) {
        hydrateCatalogHero();
      }

    } catch (error) {
      if (
        version !==
        requestVersion
      ) {
        return;
      }

      if (reset) {
        products = [];

        hasMore = false;

        empty.hidden =
          true;

        grid.hidden =
          false;

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
              id="catalogRetryButton"
              type="button"
            >
              Reintentar
            </button>
          </div>
        `;

        loadMoreContainer.style
          .display =
          "none";

        document
          .getElementById(
            "catalogRetryButton"
          )
          ?.addEventListener(
            "click",
            () => {
              loadCatalog({
                reset: true,
              });
            }
          );

      } else {
        console.error(
          "Error cargando más artículos:",
          error
        );
      }

    } finally {
      if (
        !reset
      ) {
        loadingMore = false;

        if (
          version ===
          requestVersion
        ) {
          updateLoadMore();
        }
      }
    }
  }

  // =====================================================
  // MODAL
  // =====================================================

  function openProduct(
    id
  ) {
    const item =
      products.find(
        value =>
          String(
            value.id
          ) ===
          String(id)
      );

    if (!item) {
      return;
    }

    showProduct(
      item
    );
  }

  function showProduct(
    item
  ) {
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
      `https://wa.me/19292659222?text=${
        encodeURIComponent(
          msg
        )
      }`;

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
          const shareData = {
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
              await navigator
                .clipboard
                .writeText(
                  shareText
                );

            } catch {
              const helper =
                document
                  .createElement(
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

              document.body
                .appendChild(
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

    document.body.style
      .overflow =
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

    document.body.style
      .overflow =
      "";

    if (
      lastFocusedElement
      instanceof
      HTMLElement
    ) {
      lastFocusedElement
        .focus();
    }
  }

  document
    .querySelectorAll(
      "[data-close-modal]"
    )
    .forEach(
      element => {
        element.addEventListener(
          "click",
          closeModal
        );
      }
    );

  modal.addEventListener(
    "keydown",
    event => {
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
        ...modal
          .querySelectorAll(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          ),
      ].filter(
        element =>
          !element
            .hasAttribute(
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

  // =====================================================
  // CARGAR MÁS
  // =====================================================

  loadMoreButton.addEventListener(
    "click",
    async () => {
      await loadCatalog({
        reset: false,
      });
    }
  );

  // =====================================================
  // BÚSQUEDA
  // =====================================================

  search.addEventListener(
    "input",
    () => {
      searchTerm =
        search.value;

      clearTimeout(
        search._timer
      );

      search._timer =
        setTimeout(
          async () => {
            await loadCatalog({
              reset: true,
            });

            const term =
              searchTerm
                .trim();

            if (
              term.length >= 3 &&
              term
                .toLowerCase() !==
              lastTrackedSearch
                .toLowerCase()
            ) {
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
            }
          },
          500
        );
    }
  );

  // =====================================================
  // ORDENAMIENTO
  // =====================================================

  if (sortSelect) {
    sortSelect.addEventListener(
      "change",
      async () => {
        sortMode =
          sortSelect.value;

        await loadCatalog({
          reset: true,
        });
      }
    );
  }

  // =====================================================
  // SOLO DISPONIBLES
  // =====================================================

  if (
    onlyAvailableToggle
  ) {
    onlyAvailableToggle
      .addEventListener(
        "change",
        async () => {
          onlyAvailable =
            onlyAvailableToggle
              .checked;

          await loadCatalog({
            reset: true,
          });
        }
      );
  }

  // =====================================================
  // LIMPIAR FILTROS
  // =====================================================

  clear.addEventListener(
    "click",
    async () => {
      search.value = "";

      searchTerm = "";

      activeCategory =
        "all";

      sortMode =
        "featured";

      onlyAvailable =
        false;

      lastTrackedSearch =
        "";

      if (sortSelect) {
        sortSelect.value =
          "featured";
      }

      if (
        onlyAvailableToggle
      ) {
        onlyAvailableToggle
          .checked =
          false;
      }

      renderFilters();

      await loadCatalog({
        reset: true,
      });
    }
  );

  // =====================================================
  // MENÚ MÓVIL
  // =====================================================

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
            nav.classList
              .contains(
                "open"
              )
          )
        );
      }
    );

    nav
      .querySelectorAll(
        "a"
      )
      .forEach(
        link => {
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
        }
      );
  }

  // =====================================================
  // AÑO
  // =====================================================

  const year =
    document.getElementById(
      "year"
    );

  if (year) {
    year.textContent =
      new Date()
        .getFullYear();
  }

  // =====================================================
  // CARGA INICIAL
  // =====================================================

  try {
    renderSkeletons();

    categories =
      await api.listCategories(
        section
      );

    renderFilters();

    await loadCatalog({
      reset: true,
    });

    api.track({
      event_type:
        "page_view",

      section,

      page_path:
        location.pathname,
    });

    // ---------------------------------------------------
    // DEEP LINK:
    // productos.html?p=UUID
    //
    // Si el artículo no está entre los
    // primeros 24, lo obtenemos directamente.
    // ---------------------------------------------------

    const deepLinkedId =
      new URLSearchParams(
        window.location.search
      ).get(
        "p"
      );

    if (deepLinkedId) {
      const loadedItem =
        products.find(
          item =>
            String(
              item.id
            ) ===
            String(
              deepLinkedId
            )
        );

      if (loadedItem) {
        showProduct(
          loadedItem
        );

      } else {
        try {
          const item =
            await api
              .getCatalogItem(
                section,
                deepLinkedId
              );

          showProduct(
            item
          );

        } catch {
          /*
           * Si no existe, está archivado
           * o el UUID es inválido,
           * simplemente dejamos abierto
           * el catálogo normalmente.
           */
        }
      }
    }

  } catch (error) {
    empty.hidden =
      true;

    grid.hidden =
      false;

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
          type="button"
        >
          Reintentar
        </button>
      </div>
    `;

    loadMoreContainer.style
      .display =
      "none";
  }
})();