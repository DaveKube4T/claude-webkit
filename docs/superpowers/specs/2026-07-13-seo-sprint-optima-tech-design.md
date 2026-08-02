# Spec: Sprint SEO optima-tech.co

**Fecha:** 2026-07-13
**Origen:** Auditoría SEO 2026-07-13 (puntuación 73/100). Cierra los 3 hallazgos críticos y 4 mejorables.
**Alcance del código:** `site/` (Next.js 16.2.4, App Router, deployado en Vercel con dominio www.optima-tech.co).
**Fuera de alcance:** páginas de servicio/blog, rediseño mockup v2, automatizar Search Console/GBP (quedan en backlog o como pasos manuales).

## Decisiones tomadas

- og-image: generado dinámicamente con `next/og` (`ImageResponse`), no estático en `/public`.
- Entrega: 1 branch (`seo-sprint`), commits atómicos, 1 solo deploy a producción con aprobación explícita de Deybis.
- El proyecto Vercel ya está linkeado en `site/.vercel/project.json` → deploy con `npx vercel --prod` desde `site/`.

## Cambios en código

### 1. og:image dinámico (crítico — hoy devuelve 404)
- Crear `site/src/app/opengraph-image.tsx`:
  - `ImageResponse` de 1200×630, `export const size`, `alt` y `contentType`.
  - Diseño: fondo `#0B1220` (color del sitio), logo de marca, headline "Automatiza hoy. Escala mañana.", sublínea "Automatización con IA para pymes", dominio visible.
  - Tipografía coherente con el sitio (Space Grotesk para headline si es viable cargarla en ImageResponse; fallback a sans-serif del runtime si complica el build).
- Eliminar el bloque `openGraph.images` de `site/src/app/layout.tsx` (líneas 32-39 actuales): Next inyecta `og:image` y `twitter:image` automáticamente desde la convención de archivo.

### 2. JSON-LD ProfessionalService (crítico)
Insertar en `layout.tsx` (dentro de `<body>`) un `<script type="application/ld+json">` con:

```json
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Optima Technology",
  "url": "https://www.optima-tech.co",
  "logo": "https://www.optima-tech.co/logo.png",
  "description": "Agencia de automatización con IA para pymes: flujos n8n, chatbots WhatsApp, CRM y marketing automatizado.",
  "email": "optimatechnology@optima-tech.co",
  "telephone": "+573052278441",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Cali",
    "addressRegion": "Valle del Cauca",
    "addressCountry": "CO"
  },
  "areaServed": "Colombia",
  "sameAs": [
    "https://www.linkedin.com/company/optima-technology-co",
    "https://www.instagram.com/optima_technology_co/",
    "https://www.tiktok.com/@optima_technology",
    "https://www.facebook.com/profile.php?id=61590679943770"
  ]
}
```

Nota: `logo` apunta a `/logo.png` (existente en `site/public/`), no al icon dinámico con hash de la auditoría.

### 3. Title con keyword transaccional
- `metadata.title` → `Optima Technology | Automatización con IA para Pymes en Colombia` (63 chars).
- `openGraph.title` conserva el tagline de marca: `Optima Technology — Automatiza hoy. Escala mañana.`

### 4. og:url
- Añadir `url: '/'` al bloque `openGraph` (resuelto por `metadataBase` ya existente).

### 5. Quitar meta keywords
- Eliminar la línea `keywords: [...]` de `metadata` (obsoleto desde 2009; solo revela estrategia).

### 6. NAP local en footer
- En el footer de `site/src/app/page.tsx` (líneas ~282-352): añadir "Cali, Valle del Cauca, Colombia" y teléfono `+57 305 227 8441` con link `tel:+573052278441`.
- Debe coincidir exactamente con los datos que se usarán en Google Business Profile (coherencia NAP).
- Verificar responsive a 375px.

### 7. Contadores SSR con valores reales
- `site/src/components/Dashboard.tsx`, componente `Counter` (líneas 6-23):
  - Estado inicial `useState(target)` en vez de `useState(0)` → el HTML servido muestra 247 y 68%.
  - La animación 0→target corre solo client-side cuando el elemento entra en viewport (comportamiento visual actual se mantiene; se acepta el salto valor→0→animación en el primer frame visible).

## Entregable manual

Crear `site/docs/seo-manual-steps.md` con checklist para Deybis:
1. **Google Search Console:** verificar dominio vía TXT en Namecheap (Advanced DNS), enviar `sitemap.xml`, revisar estado de indexación de la home.
2. **Google Business Profile:** crear perfil "Optima Technology — Agencia de Automatización" en Cali, Valle del Cauca; enlazar www.optima-tech.co; teléfono +57 305 227 8441 (mismo NAP del footer).
3. **Backlinks de perfiles propios:** enlazar el dominio en bios de LinkedIn, Instagram, TikTok y Facebook.

## Verificación (gate antes de deploy)

1. `npm run build` en `site/` sin errores.
2. Con dev server, inspeccionar HTML inicial de `/`:
   - meta `og:image` presente y apuntando a la imagen generada (`/opengraph-image?...`),
   - JSON-LD presente y parseable como JSON válido,
   - title nuevo,
   - `247` y `68%` presentes en el HTML servido,
   - sin meta `keywords`.
3. Abrir `/opengraph-image` en el navegador o vía screenshot: validar composición visual (logo legible, texto sin cortes).
4. Footer con NAP correcto a 375px y 1440px.

## Deploy y rollback

- Branch `seo-sprint` desde `main`, commits atómicos por fix, push a `origin`.
- Deploy a producción: `npx vercel --prod` desde `site/` — **requiere aprobación explícita de Deybis** después del gate de verificación.
- Rollback: instant rollback en dashboard de Vercel al deployment anterior (o `vercel rollback`).
- Post-deploy: `curl -I https://www.optima-tech.co/opengraph-image` → 200; Rich Results Test de Google sobre la home (manual); compartir URL en WhatsApp para ver la tarjeta.

## Riesgos

- **Next 16.2.4 con breaking changes** (aviso en `site/AGENTS.md`): leer `node_modules/next/dist/docs/` antes de tocar convenciones de metadata. La convención `opengraph-image.tsx` ya fue verificada en los docs bundled.
- Cargar fuente custom en `ImageResponse` puede fallar en build → fallback definido (sans-serif del runtime) para no bloquear el sprint.
- El cambio del title puede tardar días/semanas en reflejarse en SERP; no es rollback-able instantáneo a nivel de Google, pero sí a nivel de código.
