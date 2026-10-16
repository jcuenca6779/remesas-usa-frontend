# Remesas USA — Frontend V4

Frontend conectado al backend FastAPI de Remesas USA.

## Incluye

- Página principal separada por dos catálogos.
- Catálogo de productos ecuatorianos.
- Catálogo de perfumería.
- Búsqueda y filtros desde la base de datos real.
- Modal de producto y consulta por WhatsApp.
- Registro de analytics (visitas, vistas, búsquedas y clics en WhatsApp).
- Login administrativo con JWT.
- Dashboard real.
- Administración separada de productos y perfumes.
- Crear, editar, archivar y restaurar artículos.
- Subida de imágenes a través del backend/Supabase Storage.
- Gestión de categorías desde cada catálogo.
- Estadísticas reales con periodos de 7, 30 y 90 días.
- Animaciones, microinteracciones, skeleton loaders y soporte para `prefers-reduced-motion`.

## 1. Configurar la URL del backend

Abre `config.js`.

Para desarrollo local:

```js
window.REMESAS_API_BASE = "http://127.0.0.1:8000/api";
```

Cuando el backend esté publicado, cambia únicamente esa URL.

## 2. Iniciar el backend

Desde la carpeta del backend y con `.venv` activado:

```powershell
uvicorn app.main:app --reload
```

Comprueba:

- API: http://127.0.0.1:8000
- Swagger: http://127.0.0.1:8000/docs

## 3. Iniciar el frontend

### Opción A — Windows

Haz doble clic en:

`INICIAR_FRONTEND.bat`

### Opción B — PowerShell

Abre una terminal dentro de esta carpeta:

```powershell
python -m http.server 5500 --bind 127.0.0.1
```

Después abre:

http://127.0.0.1:5500

## No abrir con doble clic

No abras `index.html` como `file:///...` porque el frontend realiza peticiones HTTP a FastAPI.

## Vistas

- `/index.html` — Inicio
- `/productos.html` — Productos ecuatorianos
- `/perfumes.html` — Perfumería
- `/admin-login.html` — Login
- `/admin.html` — Dashboard
- `/admin-productos.html` — Administración Ecuador
- `/admin-perfumes.html` — Administración Perfumería
- `/admin-estadisticas.html` — Estadísticas

## Si aparece error CORS

El backend debe permitir al menos:

- `http://127.0.0.1:5500`
- `http://localhost:5500`

## Flujo recomendado para probar

1. Inicia FastAPI.
2. Inicia el frontend.
3. Abre `/admin.html`; debe enviarte al login.
4. Inicia sesión.
5. Crea una categoría.
6. Agrega un producto o perfume y una fotografía.
7. Comprueba que aparece en el catálogo público.
8. Abre el artículo, realiza una búsqueda y pulsa WhatsApp.
9. Revisa `/admin-estadisticas.html`.
