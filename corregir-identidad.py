from pathlib import Path


BRAND = "TELLISIOSO FRAGANCES"

P = "Perfumer\u00eda"
P_UPPER = "PERFUMER\u00cdA"

SPARKLE = "\u2728"
DOT = "\u00b7"
ARROW = "\u2192"


FILES_TO_NORMALIZE = [
    "index.html",
    "productos.html",
    "perfumes.html",
    "styles.css",
    "catalog.js",
    "landing.js",
    "ui.js",
    "admin.html",
    "admin-productos.html",
    "admin-perfumes.html",
    "admin-estadisticas.html",
    "admin-dashboard.js",
    "admin-analytics.js",
]


def read(path):
    file = Path(path)

    if not file.exists():
        print(f"NO EXISTE: {path}")
        return None

    # utf-8-sig elimina BOM si existe
    return file.read_text(
        encoding="utf-8-sig"
    )


def write(path, content):
    # UTF-8 normal, SIN BOM
    Path(path).write_text(
        content,
        encoding="utf-8",
        newline="\n",
    )


def replace_many(path, replacements):
    content = read(path)

    if content is None:
        return

    original = content
    changes = 0

    for old, new in replacements:
        if old in content:
            content = content.replace(
                old,
                new,
            )
            changes += 1

    write(
        path,
        content,
    )

    if content != original:
        print(
            f"ACTUALIZADO: {path} "
            f"({changes} grupos)"
        )
    else:
        print(
            f"SIN CAMBIOS NUEVOS: {path}"
        )


# ==========================================================
# 1. NORMALIZAR ARCHIVOS Y QUITAR BOM
# ==========================================================

print()
print("1. Quitando BOM y normalizando UTF-8...")

for path in FILES_TO_NORMALIZE:
    content = read(path)

    if content is not None:
        write(
            path,
            content,
        )


# ==========================================================
# 2. INDEX.HTML
# ==========================================================

print()
print("2. Actualizando portada...")

replace_many(
    "index.html",
    [
        (
            "Productos Ecuatorianos y "
            + P
            + " en el Bronx",
            "Productos Ecuatorianos y "
            + BRAND
            + " en el Bronx",
        ),
        (
            "Productos Ecuatorianos "
            + DOT
            + " "
            + SPARKLE
            + " "
            + P
            + " "
            + DOT,
            "Productos Ecuatorianos "
            + DOT
            + " "
            + SPARKLE
            + " "
            + BRAND
            + " "
            + DOT,
        ),
        (
            SPARKLE
            + " Perfumes</a>",
            SPARKLE
            + " "
            + BRAND
            + "</a>",
        ),
        (
            SPARKLE
            + " "
            + P
            + "</a>",
            SPARKLE
            + " "
            + BRAND
            + "</a>",
        ),
        (
            P + " Selecta",
            BRAND,
        ),
        (
            P + " y Fragancias",
            BRAND,
        ),
        (
            "Entrar a perfumer\u00eda",
            "Entrar a "
            + BRAND,
        ),
        (
            "una selecta colecci\u00f3n "
            "de perfumer\u00eda original",
            "la colecci\u00f3n "
            + BRAND,
        ),
        (
            SPARKLE
            + " Perfumes</button>",
            SPARKLE
            + " TELLISIOSO</button>",
        ),
    ],
)


# ==========================================================
# 3. PERFUMES.HTML
# ==========================================================

print()
print("3. Actualizando pagina TELLISIOSO...")

replace_many(
    "perfumes.html",
    [
        (
            P
            + " Selecta | Remesas USA "
            + DOT
            + " Bronx, NY",
            BRAND
            + " | Remesas USA "
            + DOT
            + " Bronx, NY",
        ),
        (
            "Cat\u00e1logo exclusivo "
            "de perfumes y fragancias "
            "de Remesas USA",
            "Cat\u00e1logo "
            + BRAND
            + " de Remesas USA",
        ),
        (
            SPARKLE
            + " "
            + P
            + " Remesas USA "
            + DOT,
            SPARKLE
            + " "
            + BRAND
            + " "
            + DOT,
        ),
        (
            "<span>Boutique de "
            + P
            + "</span>",
            "<span>"
            + BRAND
            + "</span>",
        ),
        (
            SPARKLE
            + " Perfumes</a>",
            SPARKLE
            + " "
            + BRAND
            + "</a>",
        ),
        (
            "COLECCI\u00d3N DE FRAGANCIAS",
            BRAND,
        ),
        (
            "<h2>"
            + P
            + "</h2>",
            "<h2>"
            + BRAND
            + "</h2>",
        ),
        (
            "Colecci\u00f3n de perfumes "
            "de Remesas USA",
            "Colecci\u00f3n "
            + BRAND
            + " de Remesas USA",
        ),
    ],
)


# ==========================================================
# 4. PRODUCTOS.HTML
# ==========================================================

print()
print("4. Actualizando enlaces desde productos...")

replace_many(
    "productos.html",
    [
        (
            SPARKLE
            + " Perfumes</a>",
            SPARKLE
            + " "
            + BRAND
            + "</a>",
        ),
        (
            "Explora nuestro cat\u00e1logo "
            "independiente de perfumer\u00eda "
            "con opciones para dama, "
            "caballero y unisex.",
            "Explora "
            + BRAND
            + " con opciones para dama, "
            "caballero y unisex.",
        ),
        (
            "Ir a "
            + P
            + " "
            + ARROW,
            "Ir a "
            + BRAND
            + " "
            + ARROW,
        ),
        (
            ">Perfumer\u00eda</a>",
            ">"
            + BRAND
            + "</a>",
        ),
    ],
)


# ==========================================================
# 5. CATALOG.JS
# ==========================================================

print()
print("5. Actualizando catalog.js...")

replace_many(
    "catalog.js",
    [
        (
            '"'
            + P
            + '"',
            '"'
            + BRAND
            + '"',
        ),
        (
            '"'
            + P
            + " y fragancias de "
            "Remesas USA"
            + '"',
            '"'
            + BRAND
            + " - Remesas USA"
            + '"',
        ),
    ],
)


# ==========================================================
# 6. LANDING.JS
# ==========================================================

print()
print("6. Actualizando landing.js...")

replace_many(
    "landing.js",
    [
        (
            P
            + " y fragancias "
            "de Remesas USA",
            BRAND
            + " - Remesas USA",
        ),
        (
            P
            + " selecta "
            "de Remesas USA",
            BRAND
            + " - Remesas USA",
        ),
        (
            SPARKLE
            + " "
            + P_UPPER,
            SPARKLE
            + " TELLISIOSO",
        ),
        (
            '"'
            + P
            + '"',
            '"'
            + BRAND
            + '"',
        ),
    ],
)


# ==========================================================
# 7. ADMINISTRACION
# ==========================================================

print()
print("7. Actualizando identidad en administrador...")

admin_nav_files = [
    "admin.html",
    "admin-productos.html",
    "admin-perfumes.html",
    "admin-estadisticas.html",
]

for path in admin_nav_files:
    replace_many(
        path,
        [
            (
                "<b>Perfumes</b>"
                "<small>"
                + P
                + "</small>",
                "<b>TELLISIOSO</b>"
                "<small>FRAGANCES</small>",
            ),
            (
                "<b>TELLISIOSO</b>"
                "<small>"
                + P
                + "</small>",
                "<b>TELLISIOSO</b>"
                "<small>FRAGANCES</small>",
            ),
        ],
    )


replace_many(
    "admin.html",
    [
        (
            "<h3>"
            + P
            + "</h3>",
            "<h3>"
            + BRAND
            + "</h3>",
        ),
        (
            "Administrar perfumes "
            + ARROW,
            "Administrar fragancias "
            + ARROW,
        ),
    ],
)


replace_many(
    "admin-perfumes.html",
    [
        (
            "Administrar perfumes | Remesas USA",
            BRAND
            + " | Administraci\u00f3n "
            "Remesas USA",
        ),
        (
            BRAND
            + " | Administracion Remesas USA",
            BRAND
            + " | Administraci\u00f3n "
            "Remesas USA",
        ),
        (
            "<b>"
            + P
            + "</b><p>"
            "Esta vista administra",
            "<b>"
            + BRAND
            + "</b><p>"
            "Esta vista administra",
        ),
        (
            "ADMIN / "
            + P_UPPER,
            "ADMIN / "
            + BRAND,
        ),
        (
            "<h1>Perfumes</h1>",
            "<h1>"
            + BRAND
            + "</h1>",
        ),
        (
            SPARKLE
            + " "
            + P_UPPER,
            SPARKLE
            + " "
            + BRAND,
        ),
        (
            "Administrar perfumes",
            "Administrar "
            + BRAND,
        ),
        (
            "<small>"
            + P_UPPER
            + "</small>",
            "<small>"
            + BRAND
            + "</small>",
        ),
    ],
)


# ==========================================================
# 8. JS ADMIN
# ==========================================================

print()
print("8. Actualizando textos dinamicos del admin...")

for path in [
    "admin-dashboard.js",
    "admin-analytics.js",
]:
    replace_many(
        path,
        [
            (
                '"'
                + P
                + '"',
                '"'
                + BRAND
                + '"',
            ),
            (
                '"'
                + P_UPPER
                + '"',
                '"'
                + BRAND
                + '"',
            ),
        ],
    )


# ==========================================================
# 9. CSS DEL BOTON ADMIN
# ==========================================================

print()
print("9. Ajustando boton administrador en movil...")

css_path = Path("styles.css")

if css_path.exists():
    css = read("styles.css")

    marker = (
        "/* REMESAS ADMIN ACCESS FIX */"
    )

    if marker not in css:
        css = (
            css.rstrip()
            + "\n\n"
            + marker
            + "\n"
            + """
.top-strip-actions {
  flex-wrap: wrap;
  gap: 12px;
}

@media (max-width: 760px) {
  .top-strip-actions {
    justify-content: center;
    gap: 8px 12px;
  }

  .top-strip .manager-link {
    padding: 6px 10px;
    font-size: 11.5px;
  }
}
"""
        )

        write(
            "styles.css",
            css,
        )

        print(
            "ACTUALIZADO: styles.css"
        )


# ==========================================================
# FINAL
# ==========================================================

print()
print("==========================================")
print(" CORRECCION TERMINADA")
print("==========================================")
print()
print("Nombre:")
print(BRAND)
print()
print("Telefono:")
print("+1 (518) 898-1355")
print()
print("WhatsApp:")
print("15188981355")
print()
print("Administrador:")
print("admin-login.html")
print()
print("Ahora ejecuta:")
print("git diff --check")
print("git diff")
print()