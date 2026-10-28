# Lantana Café Bistró — Sitio web

Sitio estático (HTML + CSS + JS, sin librerías ni servidor). Puede publicarse tal cual en Netlify, Vercel, GitHub Pages, Hostinger, etc.

## Estructura

```
web/
├── index.html          Página completa (12 secciones, SEO, Open Graph, datos estructurados)
├── css/styles.css      Estilos (colores de marca en :root)
├── js/data.js          ← DATOS EDITABLES: productos, precios, fotos, toppings, redes, testimonios
├── js/app.js           Carrito, pedido por WhatsApp, formulario, carrusel, animaciones
├── assets/brand/       Logos, símbolo, azulejos y patrón (desde BRANDING LANTANA, en WebP)
├── assets/fotos/       Fotos propias de Lantana
├── assets/og-image.jpg Imagen al compartir el enlace en redes/WhatsApp
├── robots.txt, sitemap.xml
```

## Cambios frecuentes (todo en `js/data.js`)

| Qué | Dónde |
|---|---|
| Precio de Brownie / Cuñapé | `options: [{ ..., price: null }]` → cambia `null` por el número, p. ej. `price: 20` |
| Precio de un topping | `toppings[].price` (si queda `null`, no se suma al total) |
| Presentaciones de Mini Cheesecakes | Reemplaza la opción única por varias: `{ id: "caja6", label: "Caja x6", price: 120 }` |
| Usuario de Instagram / TikTok | `instagram`, `tiktok` (**pendiente confirmar**) |
| Testimonios reales | Edita `testimonials` y pon `testimonialsAreDemo: false` para quitar el aviso de "ejemplo" |
| Música de fondo (pistas, horarios, volumen) | `music` — los MP3 están en `assets/musica/` |
| Nuevo producto | Copia un bloque de `products` y cambia `id`, textos, foto y opciones |

## Reemplazar fotografías

Las fotos actuales son **referenciales** (Unsplash, licencia libre de uso comercial) y se sirven optimizadas en WebP/AVIF automáticamente.

1. Guarda tu foto en `assets/fotos/` (ideal: WebP, ~1200 px de ancho, horizontal 4:3 para productos).
2. En `js/data.js` cambia `img: unsplash("...")` por `img: "assets/fotos/mi-foto.webp"`.
3. Para las fotos fijas del HTML (hero, momentos, galería) reemplaza las URL `images.unsplash.com/...` en `index.html` por tu ruta local y elimina el atributo `srcset`.

Si alguna imagen no carga, el sitio muestra automáticamente el patrón de azulejos de la marca.

## Cómo funciona el pedido

1. El cliente elige presentación (porción/entero), topping y cantidad → **Agregar al pedido**.
2. El carrito (se guarda en el navegador) muestra el total estimado.
3. Completa nombre, zona (Norte/Centro), dirección, fecha y horario.
4. Se abre WhatsApp (+591 68023040) con el pedido completo ya redactado; solo debe presionar enviar.

El formulario de contacto también se envía como mensaje de WhatsApp (no requiere servidor).

## Antes de publicar

- Reemplazar `https://www.lantanacafebistro.com/` por el dominio real en `index.html` (canonical, og:url, og:image, JSON-LD), `robots.txt` y `sitemap.xml`.
- Confirmar usuarios de Instagram y TikTok (en `js/data.js` y en el JSON-LD `sameAs` de `index.html`).
- Registrar el negocio en Google Business Profile (zona de servicio: Santa Cruz de la Sierra) para potenciar las búsquedas locales.
