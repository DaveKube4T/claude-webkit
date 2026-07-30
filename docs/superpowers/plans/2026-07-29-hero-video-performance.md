# Optimización de rendimiento del video del Hero — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bajar el LCP/performance score del Hero de `optima-tech.co` (baseline medido: score 55/100, LCP 6.0s) recomprimiendo el video/poster, difiriendo la descarga completa del video hasta que el navegador esté idle, reemplazando el fade por temporizador fijo por uno disparado por el evento real de "video listo", y eliminando la espera de hidratación de React que hoy bloquea la aparición del texto del Hero — sin cambiar overlay, colores, textos, botones ni ninguna otra sección.

**Architecture:** `HeroVideo.tsx` pasa de Server Component a Client Component (necesario para detectar el momento exacto de "listo" y diferir la carga — no se puede hacer sin JS). El texto del Hero pasa de un wrapper `FadeInStagger`/`FadeInItem` (Framer Motion, gateado por hidratación) a una animación CSS pura con el mismo timing — el sistema `FadeIn` en sí no se toca, sigue usándose en el resto de la home. Los 3 assets (mp4, webm, poster) se recomprimen con `ffmpeg`, mismo contenido visual, mucho menor peso. Cache headers explícitos para los 3 assets en `next.config.ts`.

**Tech Stack:** Next.js 16.2.4 (App Router), Tailwind CSS v4, HTML5 `<video>`/`<source>`, `requestIdleCallback` con fallback, CSS puro para las animaciones. Cero dependencias nuevas. `ffmpeg` para la recompresión (herramienta local, no dependencia del proyecto). `lighthouse` vía `npx` para medir antes/después (no se instala como dependencia).

**Spec:** `docs/superpowers/specs/2026-07-29-hero-video-performance-design.md`

---

## Contexto crítico para quien implementa

1. **No hay test runner en este repo** (no jest/vitest — solo `build`/`lint`). La verificación es `npm run build` + Lighthouse real + Playwright, no tests automatizados.
2. **`site/AGENTS.md` dice literalmente "This is NOT the Next.js you know".** Si algo no cuadra con lo que esperarías de Next (especialmente en `next.config.ts`), consulta `site/node_modules/next/dist/docs/` antes de asumir.
3. **`ffmpeg`/`ffprobe` ya están instalados** en `C:\Users\deivi\AppData\Local\Microsoft\WinGet\Packages\yt-dlp.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-N-124279-g0f6ba39122-win64-gpl\bin\`. Probar el comando bare primero, usar la ruta completa solo si hace falta.
4. **`lighthouse` está disponible vía `npx --yes lighthouse`** (confirmado v13.4.1 en esta máquina) — no requiere instalación como dependencia del proyecto.
5. **Esta optimización cambia `HeroVideo.tsx` de Server Component a Client Component** (gana `"use client"`). Es un cambio de arquitectura deliberado, ya aprobado en el spec — no es un error si ves el diff agregando esa directiva.
6. **El sistema `FadeIn`/`FadeInStagger`/`FadeInItem` (`site/src/components/animations/FadeIn.tsx`) NO se toca ni se elimina.** Sigue en uso en las secciones Nosotros, Testimonios y otras fuera del Hero. Solo se deja de usar en el Hero específicamente.
7. **Colores/tokens del sitio son hex directos** (`#0B1220`, `#1E8BFF`, `#FF9800`, `#94A3B8`, `#F1F5F9`), no las variables del `@theme` de `globals.css` que ningún componente real usa. Ninguna task de este plan introduce colores nuevos — todo lo que se toca ya usa estos mismos valores.

**Directorio de trabajo:** `c:/Users/deivi/Documents/GitHub/Optima_proyects/projects/claude-webkit`

**Rama base:** nueva rama desde `update-brand-icon` (rama de producción real de este repo). **No uses `main`** — es el template de Claude Web Builder y no contiene `site/`.

---

## File Structure

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `site/public/hero-loop.mp4` | Reemplazar | Video recomprimido (H.264 CRF26) |
| `site/public/hero-loop.webm` | Crear | Video en WebM (VP9 CRF38), formato preferido |
| `site/public/hero-poster.jpg` | Reemplazar | Poster recomprimido (JPEG q5) |
| `site/src/app/globals.css` | Modificar | Mecanismo de fade por opacidad, `will-change`, animación CSS del texto del Hero |
| `site/src/components/HeroVideo.tsx` | Reescribir | Client Component: carga diferida, fade por evento, `<source>` webm/mp4 |
| `site/src/app/page.tsx` | Modificar (solo Hero) | `FadeInStagger`/`FadeInItem` del Hero → `<div>`s con `.hero-reveal` |
| `site/next.config.ts` | Modificar | `headers()` con cache inmutable para los 3 assets |

---

### Task 1: Recomprimir video y poster

**Files:**
- Modify (reemplazo binario): `site/public/hero-loop.mp4`
- Create: `site/public/hero-loop.webm`
- Modify (reemplazo binario): `site/public/hero-poster.jpg`

- [ ] **Step 1: Confirmar rama y estado actual de los assets**

```bash
cd "c:/Users/deivi/Documents/GitHub/Optima_proyects/projects/claude-webkit"
git branch --show-current
ls -la site/public/hero-loop.mp4 site/public/hero-poster.jpg
```
Esperado: rama nueva creada desde `update-brand-icon`, `hero-loop.mp4` de 2,078,861 bytes, `hero-poster.jpg` de 87,191 bytes (los tamaños actuales, antes de recomprimir).

- [ ] **Step 2: Recomprimir el MP4**

```bash
cd site
ffmpeg -y -i public/hero-loop.mp4 -c:v libx264 -crf 26 -preset veryslow -profile:v high -pix_fmt yuv420p -movflags +faststart -an /tmp-hero-loop-new.mp4
mv /tmp-hero-loop-new.mp4 public/hero-loop.mp4
```
Si el sistema no tiene `/tmp` escribible, usar un archivo temporal en el mismo directorio en su lugar, ej. `public/hero-loop-new.mp4`, y luego `mv public/hero-loop-new.mp4 public/hero-loop.mp4`. **No sobrescribas el archivo de entrada y salida en el mismo comando de ffmpeg** (falla o corrompe el archivo) — siempre a un archivo temporal, luego mover.

- [ ] **Step 3: Generar el WebM**

```bash
ffmpeg -y -i public/hero-loop.mp4 -c:v libvpx-vp9 -crf 38 -b:v 0 -deadline good -cpu-used 2 -pix_fmt yuv420p -an public/hero-loop.webm
```
(Aquí sí se puede leer del `hero-loop.mp4` ya recomprimido del Step 2 sin problema — es un formato de salida distinto, no hay colisión de archivo.)

- [ ] **Step 4: Recomprimir el poster**

```bash
ffmpeg -y -i public/hero-poster.jpg -q:v 5 /tmp-hero-poster-new.jpg
mv /tmp-hero-poster-new.jpg public/hero-poster.jpg
```
Mismo cuidado que el Step 2: no leer y escribir el mismo archivo en un solo comando.

- [ ] **Step 5: Verificar los tres archivos**

```bash
stat -c%s public/hero-loop.mp4 public/hero-loop.webm public/hero-poster.jpg
```
Esperado (aproximado — la recompresión no es 100% determinística entre corridas de ffmpeg, pero debe estar en este rango):
- `hero-loop.mp4`: ~660,000-670,000 bytes (bajó de 2,078,861)
- `hero-loop.webm`: ~480,000-490,000 bytes
- `hero-poster.jpg`: ~50,000-53,000 bytes

Si algún archivo sale sensiblemente MÁS GRANDE que el original, o con tamaño 0, algo salió mal — no sigas, repórtalo.

- [ ] **Step 6: Verificación visual rápida — extraer un frame de cada video recomprimido y compararlo a ojo contra el poster**

```bash
ffmpeg -y -i public/hero-loop.mp4 -vframes 1 -ss 00:00:03 -q:v 2 /tmp-check-mp4.jpg
ffmpeg -y -i public/hero-loop.webm -vframes 1 -ss 00:00:03 -q:v 2 /tmp-check-webm.jpg
```
Abre `/tmp-check-mp4.jpg`, `/tmp-check-webm.jpg` y `public/hero-poster.jpg` (con la herramienta de lectura de imágenes que tengas disponible) y confirma que los tres se ven nítidos, sin bloques/artefactos visibles, especialmente en las zonas oscuras del fondo. Borra los dos archivos temporales `/tmp-check-*.jpg` después — no son parte del commit.

- [ ] **Step 7: Commit**

```bash
cd "c:/Users/deivi/Documents/GitHub/Optima_proyects/projects/claude-webkit"
git add site/public/hero-loop.mp4 site/public/hero-loop.webm site/public/hero-poster.jpg
git commit -m "perf: recomprimir video y poster del Hero (-68% mp4, -77% webm, -41% poster)"
```

---

### Task 2: CSS — mecanismo de fade por opacidad

**Files:**
- Modify: `site/src/app/globals.css`

- [ ] **Step 1: Reemplazar el bloque del video de fondo del Hero**

Buscar (bloque completo, línea ~186-219 en el estado actual):
```css
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

Reemplazar por:
```css
/* ── Video de fondo del Hero ── */
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
  opacity: 1;
  transition: opacity 0.6s ease-out;
  will-change: opacity;
}

.hero-video-poster-fallback--hidden {
  opacity: 0;
  pointer-events: none;
}
```

`.hero-video-glow` y `.hero-video-overlay` quedan **exactamente igual** — no cambian, solo se muestran aquí completos para que el bloque de búsqueda sea inequívoco. El `@keyframes heroVideoFadeIn` desaparece (ya no lo usa nadie tras este cambio).

**Nota de actualización post-implementación:** la primera versión de esta task incluía una regla `.hero-video { will-change: opacity; }`. El code review la encontró y la hizo quitar: el mecanismo de fade final vive enteramente en `.hero-video-poster-fallback` (la Task 4 solo agrega/quita la clase `--hidden` en esa capa, nunca en el `<video>` mismo) — el `<video>` nunca anima su propia opacidad, así que ese `will-change` solo forzaba una capa de composición GPU persistente en el elemento más pesado del Hero sin ningún beneficio, contradiciendo el objetivo de performance del plan. La regla `.hero-video { ... }` no existe en el estado final — solo quedan `.hero-video-glow`, `.hero-video-overlay`, `.hero-video-poster-fallback` y `.hero-video-poster-fallback--hidden`, ya reflejado en el bloque de arriba.

- [ ] **Step 2: Extender la regla `prefers-reduced-motion` — SIN quitar nada de lo existente**

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
  .hero-video {
    display: none;
  }
  .hero-video-poster-fallback {
    display: block;
  }
}
```

Este bloque **no cambia en este Task**. Verifica que sigue exactamente así después del Step 1 — el Step 1 no debe haber tocado esta regla. Es intencional que quede aquí (es redundante ahora que `.hero-video-poster-fallback` está visible por defecto, pero no rompe nada dejarla).

- [ ] **Step 3: Verificar sintaxis CSS con un build**

```bash
cd site && npm run build
```
Esperado: build exitoso. `HeroVideo.tsx` en este punto todavía usa las clases viejas (`display:none/block` ya no existe para `.hero-video-poster-fallback` en CSS, pero el componente no le agrega ninguna clase condicional todavía — eso es la Task 4) — el build debe pasar igual porque el HTML resultante sigue siendo válido, solo que el fallback ahora es visible por defecto vía `opacity:1` en vez de `display:none`. Es un estado intermedio esperado, no un bug.

- [ ] **Step 4: Commit**

```bash
git add site/src/app/globals.css
git commit -m "perf: cambiar el fade del video del Hero de timer fijo a opacidad basada en evento"
```

---

### Task 3: CSS — animación nativa del texto del Hero

**Files:**
- Modify: `site/src/app/globals.css`

- [ ] **Step 1: Añadir el nuevo keyframe y las clases de stagger**

Buscar (el bloque `.hero-video-poster-fallback--hidden` que quedó al final del Task 2, y el `@keyframes flowPulse` que sigue después):
```css
.hero-video-poster-fallback--hidden {
  opacity: 0;
  pointer-events: none;
}

@keyframes flowPulse {
```

Reemplazar por:
```css
.hero-video-poster-fallback--hidden {
  opacity: 0;
  pointer-events: none;
}

/* ── Aparición del texto del Hero (sin esperar hidratación de React) ── */
@keyframes heroTextFadeUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-reveal > * {
  opacity: 0;
  animation: heroTextFadeUp 0.55s cubic-bezier(0.21, 0.47, 0.32, 0.98) both;
}

/* Asume exactamente 5 hijos directos en .hero-reveal (ver Task 5 del plan) */
.hero-reveal > *:nth-child(1) { animation-delay: 0s; }
.hero-reveal > *:nth-child(2) { animation-delay: 0.12s; }
.hero-reveal > *:nth-child(3) { animation-delay: 0.24s; }
.hero-reveal > *:nth-child(4) { animation-delay: 0.36s; }
.hero-reveal > *:nth-child(5) { animation-delay: 0.48s; }

@keyframes flowPulse {
```

- [ ] **Step 2: Verificar build**

```bash
cd site && npm run build
```
Esperado: build exitoso. Nadie usa `.hero-reveal` todavía (eso es la Task 5) — es correcto que no se vea nada distinto aún.

- [ ] **Step 3: Commit**

```bash
git add site/src/app/globals.css
git commit -m "perf: animacion CSS nativa para el texto del Hero (reemplaza el gate de Framer Motion)"
```

**Nota de actualización post-implementación:** el code review encontró que la regla global `prefers-reduced-motion` (la que fuerza `animation-duration: 0.01ms !important` y lista clases con `animation: none !important`) solo neutraliza la *duración* de `.hero-reveal > *`, no su `animation-delay` — usuarios con esa preferencia igual esperaban hasta 0.48s por elemento antes de verlo, con `opacity: 0` mientras tanto. Se agregó un fix (commit posterior) que extiende esa MISMA regla existente (no una nueva) con:
```css
.hero-reveal > * {
  animation: none !important;
  opacity: 1;
}
```
Necesita las dos líneas juntas: quitar la animación sin forzar `opacity: 1` habría dejado el texto invisible para siempre (la única razón por la que llegaba a `opacity: 1` era la animación misma). El comentario de guardia sobre "5 hijos directos" ya está reflejado en el bloque de arriba.

---

### Task 4: Reescribir `HeroVideo.tsx`

**Files:**
- Modify: `site/src/components/HeroVideo.tsx`

- [ ] **Step 1: Reemplazar el archivo completo**

Contenido actual (para que confirmes que estás editando el archivo correcto — reemplázalo entero):
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

Nuevo contenido completo:
```tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    if (prefersReducedMotion) return

    const handleReady = () => setReady(true)
    video.addEventListener("loadeddata", handleReady)

    const start = () => {
      video.play().catch(() => {
        // Autoplay bloqueado por el navegador — el poster se queda visible,
        // no es un error que deba interrumpir nada.
      })
    }

    let idleId: number | undefined
    let timeoutId: number | undefined
    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(start, { timeout: 2000 })
    } else {
      timeoutId = window.setTimeout(start, 200)
    }

    return () => {
      video.removeEventListener("loadeddata", handleReady)
      if ("cancelIdleCallback" in window && idleId !== undefined) {
        window.cancelIdleCallback(idleId)
      }
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <video
        ref={videoRef}
        className="hero-video absolute inset-0 h-full w-full object-cover"
        poster="/hero-poster.jpg"
        preload="metadata"
        muted
        loop
        playsInline
      >
        <source src="/hero-loop.webm" type="video/webm" />
        <source src="/hero-loop.mp4" type="video/mp4" />
      </video>
      <div
        className={cn(
          "hero-video-poster-fallback absolute inset-0",
          ready && "hero-video-poster-fallback--hidden"
        )}
      />
      <div className="hero-video-glow absolute inset-0" />
      <div className="hero-video-overlay absolute inset-0" />
    </div>
  )
}
```

Puntos a tener en cuenta al escribir esto (no los cambies, son decisiones deliberadas del spec):
- **`<video>` va ANTES que `.hero-video-poster-fallback` en el JSX** (al revés que el archivo viejo). Con `z-index` auto en ambos, el que va después en el DOM pinta encima — necesitamos que el poster-fallback pinte ENCIMA del video para poder taparlo mientras carga y desvanecerse cuando esté listo.
- **Sin atributo `autoPlay`** en el `<video>` — la reproducción arranca manualmente vía `video.play()` en el efecto, solo cuando el navegador está idle.
- **`window.matchMedia` y `requestIdleCallback` solo existen en el navegador**, no en el servidor — por eso todo esto vive dentro de `useEffect` (que solo corre en cliente), nunca en el cuerpo del componente.

**Nota de actualización post-implementación:** la verificación real en navegador (Task 7) encontró una condición de carrera: si el video ya está en caché (algo que la Task 6 vuelve mucho más probable, con `Cache-Control: immutable`), el navegador puede disparar `loadeddata` *antes* de que el `useEffect` llegue a suscribir el listener — el evento no se repite, así que `ready` nunca pasa a `true` y el poster tapa el video para siempre. El fix agrega, justo después de `video.addEventListener("loadeddata", handleReady)`:
```ts
if (video.readyState >= 2) {
  setReady(true)
}
```
`video.readyState` es un snapshot en vivo (no un evento) — revisarlo justo después de suscribirse cubre el caso donde la transición a `HAVE_CURRENT_DATA` ya pasó antes de escuchar. `2` es `HTMLMediaElement.HAVE_CURRENT_DATA`, el mismo nivel que señala `loadeddata`, así que la condición es exactamente equivalente a "el evento ya se disparó", ni más laxa ni más estricta. El código de arriba en este documento no refleja esta línea — agregarla al implementar.

- [ ] **Step 2: Verificar tipos, lint y build**

```bash
cd site && npx tsc --noEmit && npm run lint && npm run build
```
Esperado: los tres sin errores. (Puede seguir apareciendo el error preexistente `no-html-link-for-pages` de `Navbar.tsx` — no es de este archivo, ignóralo.)

- [ ] **Step 3: Commit**

```bash
git add site/src/components/HeroVideo.tsx
git commit -m "perf: HeroVideo como Client Component con carga diferida y fade por evento"
```

---

### Task 5: `page.tsx` — animación nativa solo en el Hero

**Files:**
- Modify: `site/src/app/page.tsx`

**No toques el import** de `FadeIn`/`FadeInStagger`/`FadeInItem` (línea 12) — sigue siendo necesario para Nosotros, Testimonios y otras secciones más abajo en el mismo archivo.

- [ ] **Step 1: Reemplazar el bloque del Hero**

Buscar (bloque completo, dentro de la `<section>` del Hero):
```tsx
            <FadeInStagger className="flex flex-col gap-8" staggerDelay={0.12}>
              <FadeInItem>
                <div className="flex items-center gap-3 text-xs font-semibold tracking-wider text-[#94A3B8] uppercase">
                  <span className="w-2 h-2 rounded-full bg-[#FF9800] pulse-dot"></span>
                  IA · Automatización · Desarrollo Web · Marketing
                </div>
              </FadeInItem>

              <FadeInItem>
                <h1 className="hero-title font-bold text-[#F1F5F9]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  Automatiza hoy.<br />
                  <span className="grad-text">Escala mañana.</span>
                </h1>
                <div className="h-px grad-bg mt-4" style={{ width: "100px" }} aria-hidden="true"></div>
              </FadeInItem>

              <FadeInItem>
                <p className="text-lg text-[#94A3B8] leading-relaxed max-w-lg">
                  Eliminamos el trabajo repetitivo de tu negocio con IA. Flujos inteligentes, agentes conversacionales y marketing automatizado para pymes que quieren crecer sin contratar más personas.
                </p>
              </FadeInItem>

              <FadeInItem>
                <div className="flex flex-wrap gap-4">
                  <a href="#contacto" className="btn-grad flex items-center gap-2 text-white font-semibold h-12 px-8 rounded-lg text-base">
                    Agendar llamada gratuita
                    <ArrowRight size={18} />
                  </a>
                  <a href="#servicios" className="btn-outline-grad flex items-center gap-2 border border-[#334155] text-[#F1F5F9] h-12 px-8 rounded-lg text-base">
                    Ver servicios
                  </a>
                </div>
              </FadeInItem>

              <FadeInItem>
                <div className="flex flex-wrap gap-6">
                  {["Diagnóstico gratis", "Sin permanencia", "Resultados en 30 días"].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <span className="grad-text font-bold">✓</span>
                      <span className="text-sm text-[#94A3B8]">{item}</span>
                    </div>
                  ))}
                </div>
              </FadeInItem>
            </FadeInStagger>
```

Reemplazar por:
```tsx
            <div className="hero-reveal flex flex-col gap-8">
              <div>
                <div className="flex items-center gap-3 text-xs font-semibold tracking-wider text-[#94A3B8] uppercase">
                  <span className="w-2 h-2 rounded-full bg-[#FF9800] pulse-dot"></span>
                  IA · Automatización · Desarrollo Web · Marketing
                </div>
              </div>

              <div>
                <h1 className="hero-title font-bold text-[#F1F5F9]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  Automatiza hoy.<br />
                  <span className="grad-text">Escala mañana.</span>
                </h1>
                <div className="h-px grad-bg mt-4" style={{ width: "100px" }} aria-hidden="true"></div>
              </div>

              <div>
                <p className="text-lg text-[#94A3B8] leading-relaxed max-w-lg">
                  Eliminamos el trabajo repetitivo de tu negocio con IA. Flujos inteligentes, agentes conversacionales y marketing automatizado para pymes que quieren crecer sin contratar más personas.
                </p>
              </div>

              <div>
                <div className="flex flex-wrap gap-4">
                  <a href="#contacto" className="btn-grad flex items-center gap-2 text-white font-semibold h-12 px-8 rounded-lg text-base">
                    Agendar llamada gratuita
                    <ArrowRight size={18} />
                  </a>
                  <a href="#servicios" className="btn-outline-grad flex items-center gap-2 border border-[#334155] text-[#F1F5F9] h-12 px-8 rounded-lg text-base">
                    Ver servicios
                  </a>
                </div>
              </div>

              <div>
                <div className="flex flex-wrap gap-6">
                  {["Diagnóstico gratis", "Sin permanencia", "Resultados en 30 días"].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <span className="grad-text font-bold">✓</span>
                      <span className="text-sm text-[#94A3B8]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
```

Cada `<FadeInItem>` se convierte en un `<div>` plano — mismo agrupamiento de hijos, mismo contenido, mismo orden. El `.hero-reveal` en el `<div>` contenedor (antes `FadeInStagger`) es lo que dispara la animación CSS con el stagger vía `:nth-child` definido en la Task 3. `Dashboard` (el componente que sigue después, fuera de este bloque) no se toca.

- [ ] **Step 2: Verificar tipos, lint y build**

```bash
cd site && npx tsc --noEmit && npm run lint && npm run build
```
Esperado: los tres sin errores nuevos.

- [ ] **Step 3: Commit**

```bash
git add site/src/app/page.tsx
git commit -m "perf: texto del Hero usa animacion CSS nativa en vez de Framer Motion gateado por hidratacion"
```

---

### Task 6: Cache headers en `next.config.ts`

**Files:**
- Modify: `site/next.config.ts`

- [ ] **Step 1: Reemplazar el archivo completo**

Contenido actual:
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/juridico", destination: "/juridico/index.html" },
      { source: "/juridico/", destination: "/juridico/index.html" },
    ];
  },
};

export default nextConfig;
```

Nuevo contenido completo:
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/hero-loop.mp4",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/hero-loop.webm",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/hero-poster.jpg",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/juridico", destination: "/juridico/index.html" },
      { source: "/juridico/", destination: "/juridico/index.html" },
    ];
  },
};

export default nextConfig;
```

El rewrite de `/juridico` (de una feature anterior) se conserva íntegro — solo se agrega `headers()` como una función nueva en el mismo objeto de config.

- [ ] **Step 2: Verificar build**

```bash
cd site && npm run build
```
Esperado: sin errores.

- [ ] **Step 3: Verificar los headers localmente**

```bash
npx next start -p 3200 &
sleep 2
curl -sI http://localhost:3200/hero-loop.mp4 | grep -i cache-control
curl -sI http://localhost:3200/hero-loop.webm | grep -i cache-control
curl -sI http://localhost:3200/hero-poster.jpg | grep -i cache-control
curl -sI http://localhost:3200/juridico | grep -i "HTTP\|location"
```
Esperado: las tres primeras líneas muestran `Cache-Control: public, max-age=31536000, immutable`. La última confirma que `/juridico` sigue resolviendo (no se rompió el rewrite existente). Detener el servidor después (buscar el PID real con `netstat -ano | grep :3200` si el PID de bash no coincide, y `taskkill //F //PID <pid>`).

- [ ] **Step 4: Commit**

```bash
cd "c:/Users/deivi/Documents/GitHub/Optima_proyects/projects/claude-webkit"
git add site/next.config.ts
git commit -m "perf: cache-control inmutable para los assets del Hero"
```

---

### Task 7: Verificación completa (Lighthouse antes/después, visual, cross-browser)

No hay test runner — esta verificación es Lighthouse real + Playwright + revisión manual.

**Notas de entorno confirmadas en esta máquina:**
- `npx --yes lighthouse <url> --output=json --output-path=<archivo> --chrome-flags="--headless" --preset=perf --only-categories=performance --quiet` — puede terminar con un error de limpieza de directorio temporal (`EPERM` al borrar el temp de Chrome) que es benigno; el JSON de resultados ya se escribió antes de ese error. Verificar que el archivo de salida existe y tiene contenido antes de asumir que falló.
- Playwright vía `npx playwright`, Chromium cacheado en `C:\Users\deivi\AppData\Local\ms-playwright\chromium-1224\chrome-win64\chrome.exe`. Si `chromium.launch()` falla por mismatch de versión, pasar `executablePath` a esa ruta.
- En Windows/Git Bash, el PID de un proceso en background a veces no coincide con el proceso real — usar `netstat -ano | grep :<puerto>` + `taskkill //F //PID <pid>`.
- Scripts/capturas temporales van fuera del repo (carpeta scratchpad), nunca dentro de `c:/Users/deivi/Documents/GitHub/Optima_proyects/projects/claude-webkit`.

- [ ] **Step 1: Build de producción y levantar servidor local**

```bash
cd site && npm run build && npx next start -p 3300
```
En background. Esperar "Ready".

- [ ] **Step 2: Lighthouse local — comparar contra el baseline del spec**

```bash
npx --yes lighthouse "http://localhost:3300/" --output=json --output-path=/tmp/after-lighthouse.json --chrome-flags="--headless" --preset=perf --only-categories=performance --quiet
```
(Usa una ruta de salida en la carpeta scratchpad si `/tmp` no es escribible en este entorno.)

Extraer las métricas:
```bash
node -e '
const r = require("/tmp/after-lighthouse.json");
console.log("Performance score:", r.categories.performance.score * 100);
for (const m of ["first-contentful-paint","largest-contentful-paint","cumulative-layout-shift","total-blocking-time"]) {
  const a = r.audits[m];
  console.log(m + ":", a.displayValue);
}
'
```

Comparar contra el baseline documentado en el spec (score 55, LCP 6.0s, FCP 3.3s, TBT 600ms, CLS 0). **Esperado: score y LCP mejoran de forma clara** (no hace falta un número exacto — depende de condiciones de red variables — pero la mejora debe ser evidente, no marginal). CLS debe seguir en 0 o muy cerca — si CLS empeoró, algo en este plan introdujo un corrimiento de layout que no debería existir (repórtalo, no lo seguirán las siguientes tasks porque ya no hay más tasks después de esta).

Nota aparte, no bloqueante: correr contra `localhost` en vez de producción real da números optimistas (sin latencia de red real ni CDN) — sirve para confirmar que la dirección del cambio es correcta, no como medición final. La medición contra producción real ocurre después del deploy, fuera de este plan (mismo patrón que las features anteriores: verificación final post-deploy es responsabilidad de quien apruebe el deploy).

- [ ] **Step 3: Confirmar la carga diferida realmente funciona (no solo en teoría)**

Con Playwright, navegar a `http://localhost:3300/` y, inmediatamente tras la navegación (antes de esperar a que la página esté "idle"), revisar las requests de red disparadas hasta ese punto — el request al cuerpo completo de `/hero-loop.mp4` o `/hero-loop.webm` (más allá de la petición de metadata) NO debe haber arrancado todavía. Esperar ~1-2 segundos adicionales y confirmar que sí arranca después. Esto verifica empíricamente el comportamiento de "no comenzar la descarga completa antes de que el Hero esté listo" — no basta con leer el código y asumir que `requestIdleCallback` se comporta como se espera.

- [ ] **Step 4: Confirmar el fade sin parpadeo**

Con Playwright: al cargar la página, confirmar que `.hero-video-poster-fallback` está visible (`opacity: 1` computado) inmediatamente. Esperar a que el video dispare `loadeddata` (o esperar unos segundos) y confirmar que la clase `hero-video-poster-fallback--hidden` se agregó y que el `opacity` computado bajó a `0` mediante una transición (no un salto instantáneo — verificar que `transition-property` incluye `opacity` en el computed style).

- [ ] **Step 5: Confirmar la animación del texto del Hero**

Con Playwright, cargar la página y confirmar que el `<h1>` del Hero alcanza `opacity: 1` (computado) en menos de 1 segundo tras la navegación — sin depender de scroll ni de espera de hidratación larga. Confirmar visualmente (screenshot) que el texto, los botones y el checklist del Hero se ven exactamente igual que antes (mismo contenido, misma posición).

- [ ] **Step 6: Verificación de `prefers-reduced-motion`**

Con `page.emulateMedia({ reducedMotion: "reduce" })`, recargar y confirmar: el `<video>` nunca reproduce, `.hero-video-poster-fallback` permanece visible todo el tiempo, el texto del Hero también aparece (la regla global de reduced-motion neutraliza la animación CSS, pero el contenido debe seguir siendo visible — confirmar que no queda en `opacity: 0` permanente por accidente).

- [ ] **Step 7: Responsive y cross-browser**

Con Playwright, resize a 375px, 768px, 1024px, 1440px — confirmar que el video (o el poster mientras carga) sigue cubriendo toda la sección Hero sin distorsión, en cada tamaño. Repetir la carga básica (Step 2 de esta task, la parte visual) también con el motor `webkit` de Playwright (aproximación a Safari) además de `chromium`, ya que el brief pide compatibilidad explícita con Safari/iPhone/iPad.

- [ ] **Step 8: Confirmar que nada más cambió**

```bash
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3300/"
```
Esperado: `200`. Revisar visualmente Header, Footer, y el resto de las secciones de la home — deben verse exactamente igual que antes de esta optimización.

- [ ] **Step 9: Diff scope check**

```bash
cd "c:/Users/deivi/Documents/GitHub/Optima_proyects/projects/claude-webkit"
git diff --stat 32ff92b..HEAD
```
(`32ff92b` es el commit del spec, el punto justo antes de que empezara la Task 1.)
Esperado: solo los 7 archivos de la tabla de File Structure. Si aparece algo más, repórtalo — no lo corrijas por tu cuenta.

- [ ] **Step 10: Detener el servidor**

Detener el proceso de `next start` en background (ver nota de entorno arriba sobre PID real en Windows).

**Nota de actualización post-implementación — resultado real de la Task 7 (Step 2), no documentado hasta ahora en este archivo:**

Lighthouse contra `http://localhost:3300/` (build de producción, mismos parámetros que el baseline del spec), comparado contra el baseline real de producción documentado en el spec:

| Métrica | Baseline (producción) | Este run (localhost) | Delta |
|---|---|---|---|
| Performance score | 55/100 | **80/100** | +25 |
| First Contentful Paint | 3.3s | **2.8s** | -15% |
| Largest Contentful Paint | 6.0s | **3.1s** | -48% |
| Total Blocking Time | 600ms | **370ms** | -38% |
| Cumulative Layout Shift | 0 | **0** | sin cambio, sin regresión |

Mejora clara y no marginal en las cuatro métricas de tiempo, CLS se mantiene en 0. Como ya anticipaba este mismo Step, los números de `localhost` son optimistas (sin latencia de red real ni CDN) — confirman que la dirección del cambio es correcta; la medición contra producción real ocurre en el gate de deploy, fuera de este plan.

Se agrega esta tabla al plan review (encontrado en la revisión final del branch): el gate de "Verificación final" de abajo exige "mejora medible de Lighthouse" como criterio de salida, y hasta esta actualización esos números solo existían en el reporte del subagente, no en ningún artefacto del repo.

---

## Verificación final (gate antes de deploy)

1. `npm run build` sin errores (cubierto en Task 4-6).
2. Todos los checks de la Task 7 pasaron, incluida la mejora medible de Lighthouse.
3. Diff del branch limpio (Task 7, Step 9).
4. Aprobación explícita de Deybis antes de `npx vercel --prod`.

## Deploy y rollback

- Deploy: `npx vercel --prod` desde `site/`, con el token de `CREDENTIALS.md`, solo tras aprobación explícita.
- Verificar producción: batería de curl (200 en `/`, headers de cache correctos en los 3 assets), Lighthouse real contra `https://www.optima-tech.co/` comparado contra el baseline del spec, y una pasada visual del Hero (video, fade, texto, responsive).
- Rollback: Instant Rollback en el dashboard de Vercel. Sin migraciones ni cambios de datos.

## Backlog (no en este plan)

- Múltiples resoluciones del video por breakpoint.
- Extender `heroTextFadeUp` a otras secciones de la home en reemplazo de `FadeIn`/`FadeInStagger` — decisión explícita de mantener acotado al Hero.
- AV1 como tercer formato de video.
