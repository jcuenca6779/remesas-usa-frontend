(function () {
  if (
    !document.body.classList.contains(
      "admin-body"
    )
  ) {
    return;
  }

  const sidebar =
    document.getElementById(
      "adminSidebar"
    );

  const toggle =
    document.getElementById(
      "sidebarToggle"
    );

  if (toggle) {
    toggle.setAttribute(
      "aria-controls",
      "adminSidebar"
    );

    toggle.setAttribute(
      "aria-expanded",
      "false"
    );
  }

  if (sidebar) {
    /*
      Fondo oscuro táctil cuando
      abrimos el menú en móvil.
    */
    const backdrop =
      document.createElement(
        "button"
      );

    backdrop.type =
      "button";

    backdrop.className =
      "admin-sidebar-backdrop";

    backdrop.setAttribute(
      "aria-label",
      "Cerrar menú administrativo"
    );

    document.body.appendChild(
      backdrop
    );

    function closeSidebar() {
      sidebar.classList.remove(
        "open"
      );

      document.body.classList.remove(
        "sidebar-open"
      );

      toggle?.setAttribute(
        "aria-expanded",
        "false"
      );
    }

    function syncSidebarState() {
      const isOpen =
        sidebar.classList.contains(
          "open"
        );

      document.body.classList.toggle(
        "sidebar-open",
        isOpen
      );

      toggle?.setAttribute(
        "aria-expanded",
        String(isOpen)
      );
    }

    /*
      Los JS administrativos actuales
      ya abren el menú.

      Nosotros observamos ese cambio
      para añadir el backdrop y mejorar
      accesibilidad sin romper nada.
    */
    const observer =
      new MutationObserver(
        syncSidebarState
      );

    observer.observe(
      sidebar,
      {
        attributes: true,
        attributeFilter: [
          "class",
        ],
      }
    );

    backdrop.addEventListener(
      "click",
      closeSidebar
    );

    /*
      Al entrar en otra sección del
      administrador cerramos el drawer.
    */
    sidebar
      .querySelectorAll("a")
      .forEach((link) => {
        link.addEventListener(
          "click",
          closeSidebar
        );
      });

    /*
      Escape cierra el menú.
    */
    document.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key ===
            "Escape" &&
          sidebar.classList.contains(
            "open"
          )
        ) {
          closeSidebar();

          toggle?.focus();
        }
      }
    );

    /*
      Si pasamos de móvil a escritorio
      limpiamos el estado del drawer.
    */
    window.addEventListener(
      "resize",
      () => {
        if (
          window.innerWidth >
          1050
        ) {
          closeSidebar();
        }
      },
      {
        passive: true,
      }
    );

    syncSidebarState();
  }

  /*
    Accesibilidad de botones de cierre.
  */
  document
    .querySelectorAll(
      ".modal-close, .static-close"
    )
    .forEach((button) => {
      if (
        !button.getAttribute(
          "aria-label"
        )
      ) {
        button.setAttribute(
          "aria-label",
          "Cerrar"
        );
      }
    });

  /*
    Los mensajes se anuncian a
    lectores de pantalla.
  */
  document
    .querySelectorAll(
      ".toast"
    )
    .forEach((toast) => {
      toast.setAttribute(
        "aria-live",
        "polite"
      );

      toast.setAttribute(
        "aria-atomic",
        "true"
      );
    });

  /*
    Nombre automático para formularios
    existentes sin tocar admin-catalog.js.
  */
  document
    .querySelectorAll(
      "input, select, textarea"
    )
    .forEach((field) => {
      if (
        field.id &&
        !field.name
      ) {
        field.name =
          field.id;
      }
    });

  document
    .querySelectorAll(
      'input[type="search"]'
    )
    .forEach((field) => {
      field.setAttribute(
        "autocomplete",
        "off"
      );

      field.setAttribute(
        "spellcheck",
        "false"
      );
    });
})();