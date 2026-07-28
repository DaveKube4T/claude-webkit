# Video de fondo en el Hero — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar los dos círculos decorativos de fondo del Hero de `optima-tech.co` por un video en loop con overlay oscuro, sin tocar texto, CTA, la tarjeta `<Dashboard />`, ni ninguna otra sección del sitio.

**Architecture:** Un componente nuevo (`HeroVideo.tsx`, sin `"use client"`) encapsula el `<video>` + overlay + resplandor + fallback de poster para `prefers-reduced-motion`, todo resuelto con CSS puro. `page.tsx` solo quita dos `<div>` decorativas y agrega `<HeroVideo />` en su lugar. `globals.css` gana una animación de fade-in y dos clases nuevas, sumadas a la regla `prefers-reduced-motion` que ya existe.

**Tech Stack:** Next.js 16.2.4 (App Router), Tailwind CSS v4, HTML5 `<video>` nativo, CSS puro. Cero dependencias nuevas. `ffmpeg` (ya instalado en la máquina) para extraer el poster.

**Spec:** `docs/superpowers/specs/2026-07-27-hero-video-background-design.md`

---

## Contexto crítico para quien implementa

1. **No hay test runner en este repo** (no jest/vitest — solo `build`/`lint` en `site/package.json`). La verificación es `npm run build` + revisión visual manual/Playwright.
2. **`site/AGENTS.md` dice literalmente "This is NOT the Next.js you know".** Si algo no cuadra con lo que esperarías de Next, consulta `site/node_modules/next/dist/docs/` antes de asumir.
3. **No instalar dependencias nuevas.** Todo se resuelve con `<video>` HTML nativo y CSS. `ffmpeg` no es una dependencia del proyecto — es una herramienta de línea de comandos ya instalada en la máquina de Deybis, se usa una sola vez para extraer el poster, no se referencia desde el código.
4. **Colores del sitio son hex directos en arbitrary values de Tailwind, no las variables semánticas del `@theme` de `globals.css`.** El proyecto tiene un bloque `@theme inline` con tokens como `--color-background` (heredado de un scaffold de shadcn), pero en la práctica NINGÚN componente real del sitio los usa — todos usan `bg-[#0B1220]`, `text-[#94A3B8]`, etc. directamente. Sigue ese patrón real, no el teórico.
5. **`ffmpeg`/`ffprobe` ya están instalados** en `C:\Users\deivi\AppData\Local\Microsoft\WinGet\Packages\yt-dlp.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-N-124279-g0f6ba39122-win64-gpl\bin\`. Si el comando `ffmpeg` no se encuentra en el PATH del subagente, usar la ruta completa.
6. **El video fuente está en `.superpowers/landing-preview/video sesion 1.mp4`** (con espacios en el nombre — citar la ruta entre comillas en bash). `.superpowers/` está gitignored, así que ese archivo nunca se commitea; solo la copia en `site/public/`.

**Directorio de trabajo:** `c:/Users/deivi/Documents/GitHub/Optima_proyects/projects/claude-webkit`

**Rama base:** nueva rama desde `update-brand-icon` (rama de producción real de este repo). **No uses `main`** — es el template de Claude Web Builder y no contiene `site/`.

---

## File Structure

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `site/public/hero-loop.mp4` | Crear (copia) | El video de fondo |
| `site/public/hero-poster.jpg` | Crear (frame 0 vía ffmpeg) | Poster del `<video>` + fondo estático para `prefers-reduced-motion` |
| `site/src/components/HeroVideo.tsx` | Crear | Video + overlay + resplandor + fallback de poster, como capa de fondo autocontenida |
| `site/src/app/globals.css` | Modificar | Nueva animación `heroVideoFadeIn`, clases `.hero-video`/`.hero-video-glow`/`.hero-video-overlay`/`.hero-video-poster-fallback`, y 2 líneas agregadas a la regla `prefers-reduced-motion` existente |
| `site/src/app/page.tsx` | Modificar | Import de `HeroVideo`, quitar 2 divs `.orb`/`.orb-2`, insertar `<HeroVideo />` |

---

### Task 1: Video y poster

**Files:**
- Create: `site/public/hero-loop.mp4`
- Create: `site/public/hero-poster.jpg`

- [ ] **Step 1: Confirmar que estás en la rama correcta**

```bash
cd "c:/Users/deivi/Documents/GitHub/Optima_proyects/projects/claude-webkit"
git branch --show-current
git ls-files site/ | wc -l
```
Esperado: el nombre de la rama nueva (creada desde `update-brand-icon`) y un número ≥ 56.

- [ ] **Step 2: Copiar el video**

```bash
cp ".superpowers/landing-preview/video sesion 1.mp4" "site/public/hero-loop.mp4"
```

- [ ] **Step 3: Extraer el poster (frame 0) con ffmpeg**

```bash
ffmpeg -y -i ".superpowers/landing-preview/video sesion 1.mp4" -vframes 1 -q:v 2 "site/public/hero-poster.jpg"
```
Si `ffmpeg` no se encuentra, usar la ruta completa:
```bash
"C:\Users\deivi\AppData\Local\Microsoft\WinGet\Packages\yt-dlp.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-N-124279-g0f6ba39122-win64-gpl\bin\ffmpeg.exe" -y -i ".superpowers/landing-preview/video sesion 1.mp4" -vframes 1 -q:v 2 "site/public/hero-poster.jpg"
```

- [ ] **Step 4: Verificar los dos archivos**

```bash
ls -la site/public/hero-loop.mp4 site/public/hero-poster.jpg
ffprobe -v error -show_entries stream=width,height,codec_name -of default=noprint_wrappers=1 site/public/hero-loop.mp4
```
Esperado: `hero-loop.mp4` de ~2,078,861 bytes, `hero-poster.jpg` de varias decenas de KB (no 0 bytes), y el ffprobe muestra `codec_name=h264`, `width=1280`, `height=720`.

- [ ] **Step 5: Commit**

```bash
git add site/public/hero-loop.mp4 site/public/hero-poster.jpg
git commit -m "feat: video y poster de fondo para el Hero"
```

---

### Task 2: CSS — animación, overlay, resplandor, fallback

**Files:**
- Modify: `site/src/app/globals.css`

- [ ] **Step 1: Añadir las nuevas clases y el keyframe junto a `pulseOrb`**

Buscar (en `globals.css`):
```css
@keyframes pulseOrb {
  0%, 100% { opacity: 0.06; transform: scale(1); }
  50% { opacity: 0.10; transform: scale(1.08); }
}
.orb { animation: pulseOrb 6s ease-in-out infinite; }
.orb-2 { animation: pulseOrb 6s ease-in-out 2s infinite; }
```

Reemplazar por (se conserva `pulseOrb`/`.orb`/`.orb-2` tal cual — todavía puede haber otros usos del keyframe en el proyecto y no es parte del alcance tocarlo — y se agrega el bloque nuevo justo después):

```css
@keyframes pulseOrb {
  0%, 100% { opacity: 0.06; transform: scale(1); }
  50% { opacity: 0.10; transform: scale(1.08); }
}
.orb { animation: pulseOrb 6s ease-in-out infinite; }
.orb-2 { animation: pulseOrb 6s ease-in-out 2s infinite; }

/* ── Video de fondo del Hero ── */
@keyframes heroVideoFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.hero-video {
  animation: heroVideoFadeIn 1.2s ease-out both;
}

.hero-video-glow {
  background: radial-gradient(
    circle at 80% 15%,
    rgba(30, 139, 255, 0.18) 0%,
    rgba(255, 152, 0, 0.08) 35%,
    transparent 65%
  );
}

.hero-video-overlay {
  background: linear-gradient(
    160deg,
    rgba(11, 18, 32, 0.65) 0%,
    rgba(11, 18, 32, 0.55) 45%,
    rgba(11, 18, 32, 0.6) 100%
  );
}

.hero-video-poster-fallback {
  background-image: url("/hero-poster.jpg");
  background-size: cover;
  background-position: center;
  display: none;
}
```

- [ ] **Step 2: Extender la regla `prefers-reduced-motion` existente**

Buscar:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  .marquee-track, .pulse-dot, .orb, .orb-2, .flow-item, .wa-float, .grad-text {
    animation: none !important;
  }
}
```

Reemplazar por:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  .marquee-track, .pulse-dot, .orb, .orb-2, .flow-item, .wa-float, .grad-text {
    animation: none !important;
  }
  .hero-video {
    display: none;
  }
  .hero-video-poster-fallback {
    display: block;
  }
}
```

**No crear una regla `@media (prefers-reduced-motion: reduce)` nueva y separada** — debe ser esta misma, extendida. Si terminas con dos bloques `@media (prefers-reduced-motion: reduce)` en el archivo, algo salió mal: revierte y vuelve a intentar.

- [ ] **Step 3: Verificar que no rompiste la sintaxis CSS**

```bash
cd site && npm run build
```
Esperado: build exitoso. Un error de sintaxis CSS (llave sin cerrar, etc.) haría fallar el build de Next/Tailwind aquí — es la única verificación disponible en este paso, ya que `page.tsx` todavía no importa nada de esto (eso es la Task 4).

- [ ] **Step 4: Commit**

```bash
git add site/src/app/globals.css
git commit -m "style: CSS del video de fondo del Hero (overlay, resplandor, fade-in, reduced-motion)"
```

---

### Task 3: Componente `HeroVideo.tsx`

**Files:**
- Create: `site/src/components/HeroVideo.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
export default function HeroVideo() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="hero-video-poster-fallback absolute inset-0" />
      <video
        className="hero-video absolute inset-0 h-full w-full object-cover"
        src="/hero-loop.mp4"
        poster="/hero-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
      <div className="hero-video-glow absolute inset-0" />
      <div className="hero-video-overlay absolute inset-0" />
    </div>
  )
}
```

Nota: **no lleva `"use client"`**. No usa `useState`, `useEffect` ni ningún hook — es HTML/CSS puro, funciona perfectamente como Server Component (mismo patrón que `Marquee.tsx` en este mismo proyecto). No lleva `z-index` explícito tampoco — ver la Task 4 para por qué.

- [ ] **Step 2: Verificar tipos**

```bash
cd site && npx tsc --noEmit
```
Esperado: sin errores. (Todavía nadie importa este componente — eso es la Task 4 — así que no se puede verificar visualmente en este paso.)

- [ ] **Step 3: Commit**

```bash
git add site/src/components/HeroVideo.tsx
git commit -m "feat: componente HeroVideo (video de fondo + overlay + fallback)"
```

---

### Task 4: Integrar en `page.tsx`

**Files:**
- Modify: `site/src/app/page.tsx`

- [ ] **Step 1: Añadir el import**

Buscar (línea 9, junto a los demás imports de componentes):
```tsx
import AutomationBanner from "@/components/AutomationBanner"
```

Reemplazar por:
```tsx
import AutomationBanner from "@/components/AutomationBanner"
import HeroVideo from "@/components/HeroVideo"
```

- [ ] **Step 2: Reemplazar las dos divs decorativas por `<HeroVideo />`**

Buscar (líneas 88-90):
```tsx
        <section className="relative pt-40 pb-24 px-6 overflow-hidden">
          <div className="orb absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#1E8BFF] blur-3xl translate-x-1/3 -translate-y-1/4 pointer-events-none"></div>
          <div className="orb-2 absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#FF9800] blur-3xl -translate-x-1/3 translate-y-1/4 pointer-events-none"></div>
```

Reemplazar por:
```tsx
        <section className="relative pt-40 pb-24 px-6 overflow-hidden">
          <HeroVideo />
```

**No toques nada más de este `<section>`.** El div del grid de contenido (línea 92 en el archivo original: `<div className="relative mx-auto max-w-6xl grid lg:grid-cols-[1.1fr_1fr] gap-16 items-center z-10">`) ya tiene `z-10` — por eso `HeroVideo` no necesita `z-index` propio: en CSS, un elemento posicionado sin `z-index` (`auto`) siempre queda detrás de un hermano con `z-index` positivo dentro del mismo contexto de apilamiento. Si le pusieras `z-index` negativo a `HeroVideo`, correrías el riesgo de que compita con `<NeuralCanvas />` (el canvas animado de fondo global de toda la página, montado fuera de esta sección) en vez de quedar acotado a este `<section>`.

- [ ] **Step 3: Verificar tipos, lint y build**

```bash
cd site && npx tsc --noEmit && npm run lint && npm run build
```
Esperado: los tres sin errores.

- [ ] **Step 4: Commit**

```bash
git add site/src/app/page.tsx
git commit -m "feat: integrar HeroVideo en el Hero de la home"
```

---

### Task 5: Verificación visual, responsive y accesibilidad

No hay test runner — esta verificación es manual/con navegador real. Usa Playwright (ver notas de entorno abajo) para exercitarla de verdad, no solo leer el código.

**Notas de entorno confirmadas en esta máquina (úsalas, no las redescubras):**
- Playwright vía `npx playwright`, Chromium cacheado en `C:\Users\deivi\AppData\Local\ms-playwright\chromium-1224\chrome-win64\chrome.exe`. Si `chromium.launch()` falla por mismatch de versión, pasar `executablePath` apuntando a esa ruta.
- En Windows/Git Bash, el PID de un proceso en background (`next dev`/`next start`) a veces no coincide con el proceso real. Usar `netstat -ano | grep :<puerto>` y `taskkill //F //PID <pid>` para limpiarlo.
- Cualquier script/captura de pantalla temporal va fuera del repo (carpeta scratchpad), nunca dentro de `c:/Users/deivi/Documents/GitHub/Optima_proyects/projects/claude-webkit`.

- [ ] **Step 1: Levantar el dev server**

```bash
cd site && npm run dev
```
En background. Esperar "Ready".

- [ ] **Step 2: Verificación visual del video**

Con Playwright, navegar a `http://localhost:3000/` y confirmar:
- El `<video>` está presente, reproduciéndose (`paused === false`, `currentTime` avanza entre dos lecturas separadas por ~500ms).
- Cubre visualmente toda la sección Hero (comparar el bounding box del `<video>` contra el de la `<section>` — deben coincidir).
- No se ven controles nativos de reproducción (el elemento no tiene el atributo `controls`).
- El overlay oscuro está presente y el texto del Hero (`h1`, párrafo, botones) se lee con buen contraste sobre él.
- La tarjeta `<Dashboard />` (con "Procesos activos en tiempo real") se ve exactamente igual que antes — sin cambios de posición, contenido ni estilo.
- Los botones "Agendar llamada gratuita" y "Ver servicios" funcionan igual que antes (presentes, mismo texto, mismo `href`).

- [ ] **Step 3: Verificación responsive**

Con Playwright, resize a 375px, 768px, 1024px y 1440px de ancho. En cada uno:
- El `<video>` sigue cubriendo el 100% de la sección Hero (mismo bounding-box check que el Step 2).
- No hay franjas negras ni distorsión (comparar el `aspect-ratio` calculado del elemento renderizado contra `object-fit: cover` — no debe haber espacio vacío dentro del área del video).

- [ ] **Step 4: Verificación de `prefers-reduced-motion`**

Con Playwright, usar `page.emulateMedia({ reducedMotion: "reduce" })`, recargar la página, y confirmar:
- El `<video>` tiene `display: none` (computed style) o no es visible.
- La capa `.hero-video-poster-fallback` es visible (`display: block`, computed) y muestra el poster (`background-image` contiene `hero-poster.jpg`).
- El overlay y el texto del Hero se siguen viendo igual de legibles.

- [ ] **Step 5: Verificación de contraste (peor caso real, no solo teórico)**

El video tiene zonas brillantes (pantallas, tiras de luz en el techo, según el poster) — un cálculo solo contra el color plano del overlay no detecta si en algún instante del loop esas zonas brillantes quedan detrás del texto y bajan el contraste real. Verificarlo con capturas reales del video reproduciéndose, no con una aproximación teórica.

Con Playwright, tras cargar la página y dejar que el video esté reproduciéndose:

```js
function relLuminance([r, g, b]) {
  const chan = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
}
function contrastRatio(rgbA, rgbB) {
  const L1 = relLuminance(rgbA);
  const L2 = relLuminance(rgbB);
  const [lighter, darker] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (lighter + 0.05) / (darker + 0.05);
}

// Lee 1 pixel de un screenshot (Buffer PNG) dibujándolo en un <canvas> dentro
// del propio navegador — no requiere instalar ningún decodificador PNG.
async function samplePixel(page, x, y) {
  const clip = await page.screenshot({ clip: { x, y, width: 1, height: 1 } });
  const base64 = clip.toString("base64");
  return page.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return [r, g, b];
  }, base64);
}

const h1 = page.locator("h1");
const h1Box = await h1.boundingBox();
// Punto de muestreo: un poco a la izquierda del texto del h1, dentro del área
// donde el overlay + video son el fondo real detrás del texto.
const sampleX = Math.round(h1Box.x + 5);
const sampleY = Math.round(h1Box.y + h1Box.height / 2);

// Color real del texto, leído del DOM (no asumido) — viene como "rgb(r, g, b)".
const textColorRaw = await h1.evaluate((el) => getComputedStyle(el).color);
const textColor = textColorRaw.match(/\d+/g).slice(0, 3).map(Number);

// 4 muestras espaciadas ~1.5s, para cubrir distintos momentos del loop de 6s.
const ratios = [];
for (let i = 0; i < 4; i++) {
  if (i > 0) await page.waitForTimeout(1500);
  const bgColor = await samplePixel(page, sampleX, sampleY);
  ratios.push(contrastRatio(textColor, bgColor));
}

const worstRatio = Math.min(...ratios);
console.log("Peor ratio de contraste observado:", worstRatio);
```

Esperado: `worstRatio >= 4.5` en las 4 muestras. Si algún momento del video baja el contraste por debajo de 4.5:1, no lo arregles tú mismo (no es parte de este plan tocar la opacidad del overlay sin aprobación) — repórtalo como hallazgo, con el `worstRatio` exacto y en qué muestra ocurrió, para decidir si se ajusta la opacidad del overlay (dentro del rango 45-65% que permite el spec) antes de dar por buena esta task.

- [ ] **Step 6: Confirmar que nada más cambió**

```bash
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/"
```
Esperado: `200`. Revisar visualmente que Header, Footer y el resto de las secciones (Servicios, Proceso, Nosotros, Testimonios, CTA Final, Contacto) se ven exactamente igual que antes.

- [ ] **Step 7: Diff scope check**

```bash
git diff --stat 3ec4066..HEAD
```
(`3ec4066` es el commit del spec, el punto justo antes de que empezara la Task 1.)
Esperado: solo los 5 archivos de la tabla de File Structure. Si aparece algo más, repórtalo — no lo corrijas por tu cuenta.

- [ ] **Step 8: Detener el servidor**

Detener el proceso de `npm run dev` en background (ver nota de entorno arriba).

---

## Verificación final (gate antes de deploy)

1. `npm run build` en `site/` sin errores (ya cubierto en Task 4).
2. Todos los checks de la Task 5 pasaron.
3. Diff del branch limpio (Task 5, Step 7).
4. Aprobación explícita de Deybis antes de `npx vercel --prod`.

## Deploy y rollback

- Deploy: `npx vercel --prod` desde `site/`, con el token de `CREDENTIALS.md`, solo tras aprobación explícita.
- Verificar producción: `curl -s -o /dev/null -w "%{http_code}\n" https://www.optima-tech.co/` → `200`, y una pasada visual del video en producción (autoplay, overlay, responsive).
- Rollback: Instant Rollback en el dashboard de Vercel. Sin migraciones ni cambios de datos.

## Backlog (no en este plan)

- Múltiples resoluciones/formatos del video (WebM, distintos tamaños por breakpoint).
- Analytics de reproducción del video.
