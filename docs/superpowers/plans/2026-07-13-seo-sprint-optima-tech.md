# SEO Sprint optima-tech.co Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cerrar los 7 hallazgos de la auditoría SEO 2026-07-13 en el sitio de producción optima-tech.co con un solo deploy.

**Architecture:** Todos los cambios viven en `site/` (Next.js 16.2.4, App Router). El og-image se genera en build con la convención `opengraph-image.tsx` + `ImageResponse` de `next/og`. El resto son ediciones puntuales de metadata (`layout.tsx`), footer (`page.tsx`) y un componente client (`Dashboard.tsx`), más un doc de pasos manuales.

**Tech Stack:** Next.js 16.2.4 (App Router), React, Tailwind, `next/og` (Satori), Vercel (proyecto ya linkeado en `site/.vercel/project.json`).

**Spec:** `docs/superpowers/specs/2026-07-13-seo-sprint-optima-tech-design.md`

**Contexto para el ejecutor (leer antes de empezar):**
- Directorio de trabajo del repo: `c:\Users\deivi\Documents\GitHub\Optima_proyects\projects\claude-webkit`. Todos los comandos `npm`/`npx` se ejecutan dentro de `site/`.
- Branch de trabajo: `seo-sprint` (ya existe, contiene el commit del spec). NO trabajar en `main`.
- `site/AGENTS.md` advierte que este Next.js tiene breaking changes vs. training data. La convención `opengraph-image.tsx` ya fue verificada contra `site/node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/opengraph-image.md` — si dudas de otra API de Next, lee esos docs bundled primero.
- **Testing:** el proyecto no tiene framework de tests (no hay jest/vitest) y los cambios son de metadata/markup. En lugar de unit tests, cada task verifica con `npm run build` + grep sobre el HTML prerenderizado en `.next/server/app/index.html`. Si ese archivo no existe en tu build, localizarlo con `grep -rl "og:image" .next/server/app/ | head -3` y usar esa ruta en los greps.
- Existe `optima-mockup-v2.html` sin trackear en la raíz del repo. NO agregarlo a ningún commit (usar `git add` con rutas explícitas, nunca `git add -A`).
- Los commits terminan con la línea `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

### Task 1: Metadata de layout.tsx — title con keyword, og:url, quitar keywords y og:image roto

**Files:**
- Modify: `site/src/app/layout.tsx:17-41`

- [ ] **Step 1: Reemplazar el bloque `metadata`**

En `site/src/app/layout.tsx`, reemplazar el bloque actual (líneas 17-41):

```tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://www.optima-tech.co'),
  title: "Optima Technology — Automatiza hoy. Escala mañana.",
  description:
    "Automatizamos procesos de tu negocio con IA. Flujos, chatbots conversacionales, webs de alto impacto y marketing automatizado para pymes.",
  keywords: ["automatización", "inteligencia artificial", "chatbots", "pymes", "n8n", "Colombia"],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Optima Technology — Automatiza hoy. Escala mañana.",
    description:
      "Automatizamos procesos de tu negocio con IA. Flujos, chatbots conversacionales, webs de alto impacto y marketing automatizado para pymes.",
    type: "website",
    locale: "es_CO",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Optima Technology",
      },
    ],
  },
}
```

por:

```tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://www.optima-tech.co'),
  title: "Optima Technology | Automatización con IA para Pymes en Colombia",
  description:
    "Automatizamos procesos de tu negocio con IA. Flujos, chatbots conversacionales, webs de alto impacto y marketing automatizado para pymes.",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Optima Technology — Automatiza hoy. Escala mañana.",
    description:
      "Automatizamos procesos de tu negocio con IA. Flujos, chatbots conversacionales, webs de alto impacto y marketing automatizado para pymes.",
    url: '/',
    type: "website",
    locale: "es_CO",
  },
}
```

Cambios: title nuevo con keyword transaccional (og:title conserva el tagline), `keywords` eliminado, `url: '/'` añadido (metadataBase lo resuelve a la URL absoluta), bloque `images` roto eliminado (la Task 2 lo reemplaza con la convención de archivo).

- [ ] **Step 2: Build y verificar HTML prerenderizado**

```bash
cd site && npm run build
```
Expected: build exitoso, sin errores de tipos.

```bash
cd site && grep -c "Optima Technology | Automatización con IA para Pymes en Colombia" .next/server/app/index.html && grep -c 'property="og:url" content="https://www.optima-tech.co"' .next/server/app/index.html && grep -c 'name="keywords"' .next/server/app/index.html; grep -c "og-image.jpg" .next/server/app/index.html
```
Expected: primeros dos greps ≥ 1; los greps de `keywords` y `og-image.jpg` devuelven `0` (exit code 1 en el último es correcto — significa que ya no está).

- [ ] **Step 3: Commit**

```bash
git add site/src/app/layout.tsx
git commit -m "seo: title con keyword, og:url, quitar meta keywords y og:image roto

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: og-image dinámico con next/og

**Files:**
- Create: `site/src/app/opengraph-image.tsx`

- [ ] **Step 1: Crear `site/src/app/opengraph-image.tsx`**

```tsx
import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'Optima Technology — Automatización con IA para pymes'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  // logo.png es 332x111 px (aspect 3:1)
  const logo = await readFile(join(process.cwd(), 'public/logo.png'))
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '80px',
          background: 'linear-gradient(135deg, #0B1220 0%, #152033 100%)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={332} height={111} alt="" />
        <div
          style={{
            marginTop: 56,
            fontSize: 68,
            fontWeight: 700,
            color: '#F1F5F9',
            lineHeight: 1.1,
            display: 'flex',
          }}
        >
          Automatiza hoy. Escala mañana.
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 34,
            color: '#94A3B8',
            display: 'flex',
          }}
        >
          Automatización con IA para pymes
        </div>
        <div
          style={{
            marginTop: 56,
            fontSize: 26,
            color: '#FF9800',
            display: 'flex',
          }}
        >
          www.optima-tech.co
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
```

Notas para el ejecutor:
- Fuente: se usa la sans-serif por defecto del runtime de Satori (camino de fallback aprobado en el spec). NO intentar cargar Space Grotesk vía fetch a Google Fonts — mete dependencia de red en el build.
- Satori exige `display: flex` explícito en cualquier div con más de un hijo; ya está puesto.
- No crear `opengraph-image.alt.txt`: el `export const alt` de la versión código ya genera `og:image:alt`.

- [ ] **Step 2: Build y verificar metas generadas**

```bash
cd site && npm run build
```
Expected: build exitoso. En el output de rutas debe aparecer `/opengraph-image`.

```bash
cd site && grep -o 'property="og:image" content="[^"]*"' .next/server/app/index.html && grep -o 'name="twitter:image" content="[^"]*"' .next/server/app/index.html
```
Expected: ambas metas presentes, con URL que contiene `/opengraph-image`.

- [ ] **Step 3: Verificar que el endpoint responde 200 con PNG**

```bash
cd site && (npx next start -p 3100 &> /tmp/next-start.log &) && sleep 6 && curl -s -o /tmp/og.png -w "%{http_code} %{content_type}\n" http://localhost:3100/opengraph-image
```
Expected: `200 image/png`.

Luego detener el servidor (nunca matar `node.exe` a ciegas — hay otros procesos node en la máquina):
```bash
netstat -ano | grep :3100 | head -1
```
Tomar el PID de la última columna y:
```bash
taskkill //PID <pid> //F
```

- [ ] **Step 4: Revisión visual de la imagen**

Abrir `/tmp/og.png` con la herramienta Read (la soporta como imagen). Verificar: logo legible arriba, headline "Automatiza hoy. Escala mañana." sin cortes, sublínea y dominio visibles, fondo oscuro degradado. Si el texto se corta o el logo se ve pixelado, ajustar `fontSize`/`padding` y repetir Steps 2-4.

- [ ] **Step 5: Commit**

```bash
git add site/src/app/opengraph-image.tsx
git commit -m "seo: og-image dinamico 1200x630 con next/og (fix 404 critico)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: JSON-LD ProfessionalService

**Files:**
- Modify: `site/src/app/layout.tsx` (función `RootLayout` y nueva constante)

- [ ] **Step 1: Añadir la constante `jsonLd` en layout.tsx**

Después del bloque `export const metadata = {...}` y antes de `export default function RootLayout`, añadir:

```tsx
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Optima Technology",
  url: "https://www.optima-tech.co",
  logo: "https://www.optima-tech.co/logo.png",
  description:
    "Agencia de automatización con IA para pymes: flujos n8n, chatbots WhatsApp, CRM y marketing automatizado.",
  email: "optimatechnology@optima-tech.co",
  telephone: "+573052278441",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Cali",
    addressRegion: "Valle del Cauca",
    addressCountry: "CO",
  },
  areaServed: "Colombia",
  sameAs: [
    "https://www.linkedin.com/company/optima-technology-co",
    "https://www.instagram.com/optima_technology_co/",
    "https://www.tiktok.com/@optima_technology",
    "https://www.facebook.com/profile.php?id=61590679943770",
  ],
}
```

- [ ] **Step 2: Inyectar el script en el body**

En el JSX de `RootLayout`, reemplazar:

```tsx
      <body className="min-h-full flex flex-col bg-[#0B1220] text-[#F1F5F9]">
        {children}
      </body>
```

por:

```tsx
      <body className="min-h-full flex flex-col bg-[#0B1220] text-[#F1F5F9]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
```

- [ ] **Step 3: Build y verificar que el JSON-LD es parseable**

```bash
cd site && npm run build && node -e "
const html = require('fs').readFileSync('.next/server/app/index.html', 'utf8');
const m = html.match(/<script type=\"application\/ld\+json\">(.*?)<\/script>/s);
if (!m) { console.error('JSON-LD NOT FOUND'); process.exit(1); }
const data = JSON.parse(m[1]);
console.log('OK:', data['@type'], '|', data.name, '|', data.address.addressLocality);
"
```
Expected: `OK: ProfessionalService | Optima Technology | Cali`

- [ ] **Step 4: Commit**

```bash
git add site/src/app/layout.tsx
git commit -m "seo: JSON-LD ProfessionalService con NAP y sameAs

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: NAP local en footer

**Files:**
- Modify: `site/src/app/page.tsx:285-292` (primera columna del footer)

- [ ] **Step 1: Añadir bloque `<address>` bajo la descripción del footer**

En `site/src/app/page.tsx`, dentro del footer, reemplazar:

```tsx
              <div className="flex flex-col gap-3 max-w-xs">
                <a href="#" className="w-fit" aria-label="Optima Technology inicio">
                  <Logo size="md" />
                </a>
                <p className="text-xs text-[#64748B] leading-relaxed mt-2">
                  Automatización, IA y experiencias digitales para empresas que quieren crecer con mejores sistemas. Cali, Colombia.
                </p>
              </div>
```

por:

```tsx
              <div className="flex flex-col gap-3 max-w-xs">
                <a href="#" className="w-fit" aria-label="Optima Technology inicio">
                  <Logo size="md" />
                </a>
                <p className="text-xs text-[#64748B] leading-relaxed mt-2">
                  Automatización, IA y experiencias digitales para empresas que quieren crecer con mejores sistemas.
                </p>
                <address className="not-italic text-xs text-[#94A3B8] leading-relaxed flex flex-col gap-1">
                  <span>Cali, Valle del Cauca, Colombia</span>
                  <a href="tel:+573052278441" className="w-fit hover:text-[#FFB347] transition-colors">
                    +57 305 227 8441
                  </a>
                </address>
              </div>
```

Nota: se quita "Cali, Colombia." del párrafo descriptivo para no duplicar — el NAP canónico queda en el `<address>`. El formato debe coincidir EXACTO con lo que se registre luego en Google Business Profile.

- [ ] **Step 2: Build y verificar**

```bash
cd site && npm run build && grep -c "Cali, Valle del Cauca, Colombia" .next/server/app/index.html && grep -c 'href="tel:+573052278441"' .next/server/app/index.html
```
Expected: ambos greps ≥ 1.

- [ ] **Step 3: Commit**

```bash
git add site/src/app/page.tsx
git commit -m "seo: NAP local (Cali + telefono) en footer, coherente con GBP

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Contadores SSR con valores reales

**Files:**
- Modify: `site/src/components/Dashboard.tsx:9`

- [ ] **Step 1: Inicializar el Counter con el valor final**

En `site/src/components/Dashboard.tsx`, en el componente `Counter`, reemplazar:

```tsx
  const [value, setValue] = useState(0)
```

por:

```tsx
  // Inicia en target: el HTML SSR muestra el valor final (Google indexa 247/68%,
  // no ceros). La animación 0→target corre solo client-side al entrar en viewport.
  const [value, setValue] = useState(target)
```

No tocar el `useEffect`: cuando `inView` se activa, el primer frame de `tick()` resetea a ~0 y anima hasta `target` — el comportamiento visual actual se mantiene (el salto valor→0 en el primer frame está aceptado en el spec).

- [ ] **Step 2: Build y verificar HTML prerenderizado**

```bash
cd site && npm run build && grep -c ">247<" .next/server/app/index.html && grep -c ">68%<" .next/server/app/index.html
```
Expected: ambos greps ≥ 1 (antes del cambio el HTML mostraba `>0<` y `>0%<`).

- [ ] **Step 3: Commit**

```bash
git add site/src/components/Dashboard.tsx
git commit -m "seo: contadores hero SSR con valores finales (247 / 68%)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Checklist manual — Search Console, GBP y backlinks de perfiles

**Files:**
- Create: `site/docs/seo-manual-steps.md`

- [ ] **Step 1: Crear `site/docs/seo-manual-steps.md`**

```markdown
# SEO — Pasos manuales (Deybis)

Complemento del sprint SEO 2026-07-13. Estos pasos no se pueden automatizar:
requieren cuentas personales de Google y acceso a Namecheap.

## 1. Google Search Console (~30 min)

- [ ] Entrar a https://search.google.com/search-console con la cuenta Google del negocio.
- [ ] "Añadir propiedad" → tipo **Dominio** → `optima-tech.co`.
- [ ] Google entrega un registro TXT. En Namecheap → Domain List → optima-tech.co →
      **Advanced DNS** → Add New Record:
      - Type: `TXT Record` | Host: `@` | Value: (código de Google) | TTL: Automatic
- [ ] Esperar 5-30 min y pulsar "Verificar" en Search Console.
- [ ] Ir a **Sitemaps** → enviar `https://www.optima-tech.co/sitemap.xml`.
- [ ] Ir a **Inspección de URLs** → inspeccionar `https://www.optima-tech.co/` →
      "Solicitar indexación".
- [ ] En 3-7 días: revisar Cobertura/Indexación y que la home aparezca con
      `site:optima-tech.co` en Google.

## 2. Google Business Profile (~45 min)

- [ ] Entrar a https://business.google.com con la misma cuenta.
- [ ] Crear perfil: **Optima Technology — Agencia de Automatización**.
- [ ] Categoría principal: "Consultor de informática" o "Agencia de marketing"
      (elegir la que Google ofrezca más cercana a automatización/software).
- [ ] Zona de servicio: **Cali, Valle del Cauca** (negocio de área de servicio,
      sin dirección física visible si no hay oficina abierta al público).
- [ ] Teléfono: **+57 305 227 8441** — EXACTO igual que el footer de la web (NAP).
- [ ] Sitio web: `https://www.optima-tech.co`
- [ ] Descripción: usar la del JSON-LD — "Agencia de automatización con IA para
      pymes: flujos n8n, chatbots WhatsApp, CRM y marketing automatizado."
- [ ] Completar verificación (video/teléfono según pida Google).
- [ ] Subir logo y 2-3 fotos/capturas de proyectos.

## 3. Backlinks desde perfiles propios (~15 min)

Añadir `https://www.optima-tech.co` en la bio/campo web de:
- [ ] LinkedIn: https://www.linkedin.com/company/optima-technology-co
- [ ] Instagram: https://www.instagram.com/optima_technology_co/
- [ ] TikTok: https://www.tiktok.com/@optima_technology
- [ ] Facebook: https://www.facebook.com/profile.php?id=61590679943770

## 4. Verificación post-deploy (5 min, después del deploy del sprint)

- [ ] Compartir `https://www.optima-tech.co` en un chat de WhatsApp propio →
      la tarjeta debe mostrar la imagen nueva. Si no refresca, forzar re-scrape
      compartiendo con `?v=2` al final de la URL.
- [ ] https://search.google.com/test/rich-results → pegar la home → debe
      detectar `ProfessionalService` sin errores.
```

- [ ] **Step 2: Commit**

```bash
git add site/docs/seo-manual-steps.md
git commit -m "docs: checklist manual Search Console + GBP + backlinks perfiles

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: Gate de verificación completo + push

**Files:**
- Ninguno nuevo (solo verificación)

- [ ] **Step 1: Build limpio final**

```bash
cd site && npm run build
```
Expected: sin errores, ruta `/opengraph-image` listada.

- [ ] **Step 2: Levantar servidor de producción y correr todos los checks**

```bash
cd site && (npx next start -p 3100 &> /tmp/next-start.log &) && sleep 6 && \
curl -s http://localhost:3100/ -o /tmp/home.html && \
echo "--- title:" && grep -o "<title>[^<]*</title>" /tmp/home.html && \
echo "--- og:image:" && grep -o 'property="og:image" content="[^"]*"' /tmp/home.html && \
echo "--- og:url:" && grep -o 'property="og:url" content="[^"]*"' /tmp/home.html && \
echo "--- keywords (debe ser 0):" && grep -c 'name="keywords"' /tmp/home.html; \
echo "--- JSON-LD:" && grep -c "ProfessionalService" /tmp/home.html && \
echo "--- NAP:" && grep -c "Cali, Valle del Cauca, Colombia" /tmp/home.html && \
echo "--- counters:" && grep -c ">247<" /tmp/home.html && \
echo "--- og endpoint:" && curl -s -o /tmp/og-final.png -w "%{http_code} %{content_type}\n" http://localhost:3100/opengraph-image
```
Expected: title nuevo, og:image apuntando a `/opengraph-image`, og:url = `https://www.optima-tech.co`, keywords = 0, JSON-LD ≥ 1, NAP ≥ 1, counters ≥ 1, endpoint `200 image/png`.

- [ ] **Step 3: Responsive del footer**

Si `playwright-cli` está disponible:
```bash
playwright-cli open http://localhost:3100
playwright-cli resize 375 812
playwright-cli screenshot --filename=/tmp/footer-mobile.png
playwright-cli resize 1440 900
playwright-cli screenshot --filename=/tmp/footer-desktop.png
playwright-cli close
```
Revisar con Read que el `<address>` del footer no rompe el layout a 375px. Si playwright-cli no está disponible, pedir a Deybis que abra http://localhost:3100 y revise el footer en móvil.

- [ ] **Step 4: Detener el servidor**

```bash
netstat -ano | grep :3100 | head -1
```
Tomar el PID de la última columna y:
```bash
taskkill //PID <pid> //F
```

- [ ] **Step 5: Push del branch**

```bash
git push -u origin seo-sprint
```
Expected: branch publicado en https://github.com/Hainrixz/claude-webkit.

---

### Task 8: Deploy a producción (GATED — requiere aprobación explícita)

**Files:**
- Ninguno (operación de deploy)

- [ ] **Step 1: STOP — pedir aprobación a Deybis**

NO ejecutar el deploy sin respuesta explícita. Mensaje: "Verificación local completa (adjuntar resultados del gate de Task 7). ¿Apruebas deploy a producción de www.optima-tech.co?"

- [ ] **Step 2: Deploy (solo tras aprobación)**

```bash
cd site && npx vercel --prod
```
Expected: deployment al proyecto linkeado (`prj_NzBXpsQIXlYGme1InCx1aezX3s3Z`), URL de producción www.optima-tech.co actualizada.

- [ ] **Step 3: Verificación post-deploy**

```bash
curl -s -o /dev/null -w "og-image: %{http_code} %{content_type}\n" https://www.optima-tech.co/opengraph-image && \
curl -s https://www.optima-tech.co/ | grep -o "<title>[^<]*</title>" && \
curl -s https://www.optima-tech.co/ | grep -c "ProfessionalService"
```
Expected: `og-image: 200 image/png`, title nuevo, JSON-LD presente.

- [ ] **Step 4: Entregar a Deybis**

Reportar: URL live, resultados post-deploy, y recordar los pasos manuales de `site/docs/seo-manual-steps.md` (Search Console + GBP + tarjeta WhatsApp con `?v=2` si no refresca).

**Rollback si algo sale mal:** dashboard de Vercel → proyecto `site` → Deployments → "Instant Rollback" al deployment anterior (o `npx vercel rollback` desde `site/`).
