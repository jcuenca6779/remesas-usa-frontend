$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=========================================="
Write-Host " REMESAS USA - ACTUALIZACION"
Write-Host "=========================================="
Write-Host ""

$Utf8Bom = New-Object System.Text.UTF8Encoding($true)

function Read-TextFile {
    param(
        [string]$Path
    )

    if (-not (Test-Path $Path)) {
        throw "No se encontro el archivo: $Path"
    }

    return [System.IO.File]::ReadAllText(
        (Resolve-Path $Path)
    )
}

function Write-TextFile {
    param(
        [string]$Path,
        [string]$Content
    )

    [System.IO.File]::WriteAllText(
        (Resolve-Path $Path),
        $Content,
        $Utf8Bom
    )
}

function Replace-InFile {
    param(
        [string]$Path,
        [string]$Old,
        [string]$New
    )

    if (-not (Test-Path $Path)) {
        Write-Host "NO EXISTE: $Path"
        return
    }

    $content = Read-TextFile $Path

    if ($content.Contains($Old)) {
        $content = $content.Replace(
            $Old,
            $New
        )

        Write-TextFile `
            -Path $Path `
            -Content $content

        Write-Host "ACTUALIZADO: $Path"
    }
}


# =========================================================
# 1. NUMERO TELEFONICO
# =========================================================

Write-Host ""
Write-Host "Actualizando telefono y WhatsApp..."

$files = Get-ChildItem `
    -Path "." `
    -File `
    -Recurse |
    Where-Object {
        $_.Extension -eq ".html" -or
        $_.Extension -eq ".js"
    }

foreach ($file in $files) {

    $content = [System.IO.File]::ReadAllText(
        $file.FullName
    )

    $original = $content

    $content = $content.Replace(
        "19292659222",
        "15188981355"
    )

    $content = $content.Replace(
        "(929) 265-9222",
        "+1 (518) 898-1355"
    )

    $content = $content.Replace(
        "+1-929-265-9222",
        "+1-518-898-1355"
    )

    if ($content -ne $original) {

        [System.IO.File]::WriteAllText(
            $file.FullName,
            $content,
            $Utf8Bom
        )

        Write-Host "TELEFONO: $($file.Name)"
    }
}


# =========================================================
# 2. BOTON ADMINISTRADOR
# =========================================================

Write-Host ""
Write-Host "Agregando acceso al administrador..."

$publicPages = @(
    "index.html",
    "productos.html",
    "perfumes.html"
)

foreach ($page in $publicPages) {

    if (-not (Test-Path $page)) {
        continue
    }

    $content = Read-TextFile $page

    if (
        $content.Contains(
            'class="manager-link"'
        )
    ) {
        Write-Host "ADMIN YA EXISTE: $page"
        continue
    }

    $pattern = @'
<a href="https://www.facebook.com/RemesasUsa1567/?locale=es_LA" target="_blank" rel="noopener">Facebook
'@

    $index = $content.IndexOf(
        $pattern
    )

    if ($index -ge 0) {

        $end = $content.IndexOf(
            "</a>",
            $index
        )

        if ($end -ge 0) {

            $end = $end + 4

            $before = $content.Substring(
                0,
                $end
            )

            $after = $content.Substring(
                $end
            )

            $adminLink = @'

        <a class="manager-link" href="admin-login.html">Administrador</a>
'@

            $content =
                $before +
                $adminLink +
                $after

            Write-TextFile `
                -Path $page `
                -Content $content

            Write-Host "ADMIN AGREGADO: $page"
        }
    }
    else {
        Write-Host "No se encontro Facebook en $page"
    }
}


# =========================================================
# 3. ESTILO DEL BOTON ADMIN
# =========================================================

Write-Host ""
Write-Host "Actualizando estilo del boton administrador..."

$stylesPath = "styles.css"

if (Test-Path $stylesPath) {

    $content = Read-TextFile $stylesPath

    $oldCss = @'
.top-strip .manager-link {
  color: var(--yellow);
  font-weight: 800;
}
'@

    $newCss = @'
.top-strip .manager-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  color: var(--navy);
  background: linear-gradient(
    135deg,
    var(--yellow),
    #f5c84b
  );
  border: 1px solid rgba(
    255,
    255,
    255,
    0.20
  );
  font-weight: 800;
  opacity: 1;
  box-shadow: 0 5px 16px rgba(
    0,
    0,
    0,
    0.14
  );
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    background 180ms ease;
}

.top-strip .manager-link:hover {
  color: var(--navy);
  background: #ffe45f;
  opacity: 1;
  transform: translateY(-1px);
  box-shadow: 0 7px 20px rgba(
    0,
    0,
    0,
    0.18
  );
}
'@

    if ($content.Contains($oldCss)) {

        $content = $content.Replace(
            $oldCss,
            $newCss
        )

    }
    elseif (
        -not $content.Contains(
            ".top-strip .manager-link:hover"
        )
    ) {

        $content = $content +
            "`r`n`r`n" +
            $newCss
    }

    Write-TextFile `
        -Path $stylesPath `
        -Content $content
}


# =========================================================
# 4. INDEX.HTML
# =========================================================

Write-Host ""
Write-Host "Actualizando index.html..."

if (Test-Path "index.html") {

    $content = Read-TextFile "index.html"

    $content = $content.Replace(
        "Perfumeria Selecta",
        "TELLISIOSO FRAGANCES"
    )

    $content = $content.Replace(
        "Perfumeria y Fragancias",
        "TELLISIOSO FRAGANCES"
    )

    $content = $content.Replace(
        "Entrar a perfumeria",
        "Entrar a TELLISIOSO FRAGANCES"
    )

    $content = $content.Replace(
        "Perfumeria exclusiva",
        "TELLISIOSO FRAGANCES"
    )

    $content = $content.Replace(
        ">Perfumes</a>",
        ">TELLISIOSO FRAGANCES</a>"
    )

    $content = $content.Replace(
        ">Perfumeria</a>",
        ">TELLISIOSO FRAGANCES</a>"
    )

    Write-TextFile `
        -Path "index.html" `
        -Content $content
}


# =========================================================
# 5. PERFUMES.HTML
# =========================================================

Write-Host ""
Write-Host "Actualizando perfumes.html..."

if (Test-Path "perfumes.html") {

    $content = Read-TextFile "perfumes.html"

    $content = $content.Replace(
        "Perfumeria Selecta | Remesas USA",
        "TELLISIOSO FRAGANCES | Remesas USA"
    )

    $content = $content.Replace(
        "Boutique de Perfumeria",
        "TELLISIOSO FRAGANCES"
    )

    $content = $content.Replace(
        "COLECCION DE FRAGANCIAS",
        "TELLISIOSO FRAGANCES"
    )

    $content = $content.Replace(
        ">Perfumeria</h2>",
        ">TELLISIOSO FRAGANCES</h2>"
    )

    $content = $content.Replace(
        ">Perfumes</a>",
        ">TELLISIOSO FRAGANCES</a>"
    )

    Write-TextFile `
        -Path "perfumes.html" `
        -Content $content
}


# =========================================================
# 6. PRODUCTOS.HTML
# =========================================================

Write-Host ""
Write-Host "Actualizando productos.html..."

if (Test-Path "productos.html") {

    $content = Read-TextFile "productos.html"

    $content = $content.Replace(
        ">Perfumes</a>",
        ">TELLISIOSO FRAGANCES</a>"
    )

    $content = $content.Replace(
        "Ir a Perfumeria",
        "Ir a TELLISIOSO FRAGANCES"
    )

    $content = $content.Replace(
        ">Perfumeria</a>",
        ">TELLISIOSO FRAGANCES</a>"
    )

    Write-TextFile `
        -Path "productos.html" `
        -Content $content
}


# =========================================================
# 7. TEXTOS DINAMICOS JS
# =========================================================

Write-Host ""
Write-Host "Actualizando Javascript..."

$jsFiles = @(
    "catalog.js",
    "landing.js",
    "admin-dashboard.js",
    "admin-analytics.js"
)

foreach ($jsFile in $jsFiles) {

    if (-not (Test-Path $jsFile)) {
        continue
    }

    $content = Read-TextFile $jsFile

    $content = $content.Replace(
        '"Perfumeria"',
        '"TELLISIOSO FRAGANCES"'
    )

    $content = $content.Replace(
        '"PERFUMERIA"',
        '"TELLISIOSO FRAGANCES"'
    )

    $content = $content.Replace(
        '"Perfumeria selecta de Remesas USA"',
        '"TELLISIOSO FRAGANCES - Remesas USA"'
    )

    $content = $content.Replace(
        '"Perfumeria y fragancias de Remesas USA"',
        '"TELLISIOSO FRAGANCES - Remesas USA"'
    )

    Write-TextFile `
        -Path $jsFile `
        -Content $content
}


# =========================================================
# 8. ADMIN HTML
# =========================================================

Write-Host ""
Write-Host "Actualizando panel administrativo..."

$adminFiles = @(
    "admin.html",
    "admin-productos.html",
    "admin-perfumes.html",
    "admin-estadisticas.html"
)

foreach ($adminFile in $adminFiles) {

    if (-not (Test-Path $adminFile)) {
        continue
    }

    $content = Read-TextFile $adminFile

    $content = $content.Replace(
        "<b>Perfumes</b>",
        "<b>TELLISIOSO</b>"
    )

    $content = $content.Replace(
        "<small>Perfumeria</small>",
        "<small>FRAGANCES</small>"
    )

    $content = $content.Replace(
        "<h3>Perfumeria</h3>",
        "<h3>TELLISIOSO FRAGANCES</h3>"
    )

    Write-TextFile `
        -Path $adminFile `
        -Content $content
}


# =========================================================
# 9. ADMIN PERFUMES
# =========================================================

if (Test-Path "admin-perfumes.html") {

    $content =
        Read-TextFile `
            "admin-perfumes.html"

    $content = $content.Replace(
        "Administrar perfumes | Remesas USA",
        "TELLISIOSO FRAGANCES | Administracion Remesas USA"
    )

    $content = $content.Replace(
        "ADMIN / PERFUMERIA",
        "ADMIN / TELLISIOSO FRAGANCES"
    )

    $content = $content.Replace(
        "<h1>Perfumes</h1>",
        "<h1>TELLISIOSO FRAGANCES</h1>"
    )

    $content = $content.Replace(
        "Administrar perfumes",
        "Administrar TELLISIOSO FRAGANCES"
    )

    Write-TextFile `
        -Path "admin-perfumes.html" `
        -Content $content
}


Write-Host ""
Write-Host "=========================================="
Write-Host " ACTUALIZACION TERMINADA"
Write-Host "=========================================="
Write-Host ""
Write-Host "Telefono:"
Write-Host "+1 (518) 898-1355"
Write-Host ""
Write-Host "WhatsApp:"
Write-Host "15188981355"
Write-Host ""
Write-Host "Nombre:"
Write-Host "TELLISIOSO FRAGANCES"
Write-Host ""
Write-Host "Ejecuta ahora:"
Write-Host "git diff"
Write-Host ""