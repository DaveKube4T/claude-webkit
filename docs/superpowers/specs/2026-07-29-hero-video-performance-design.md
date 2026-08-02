# Spec: Optimización de rendimiento del video del Hero

**Fecha:** 2026-07-29
**Origen:** Brief de optimización de performance del socio de Deybis, sobre el video de fondo del Hero (ya en producción desde el sprint anterior). "No quiero cambiar el diseño, únicamente optimizar la forma en que el video se carga y reproduce."
**Alcance del código:** `site/src/components/HeroVideo.tsx`, `site/src/app/globals.css`, `site/src/app/page.tsx` (solo el Hero), `site/next.config.ts`, assets en `site/public/`.
**Fuera de alcance:** overlay, colores, textos, botones, tamaño del Hero, `<Dashboard />`, cualquier otra sección de la home, el sistema `FadeIn`/`FadeInStagger`/`FadeInItem` en sí (`site/src/components/animations/FadeIn.tsx` no se toca — sigue usándose en Nosotros, Testimonios y demás secciones).

## Baseline medido (no estimado)

Lighthouse real contra `https://www.optima-tech.co/` (mobile, mismo criterio que PageSpeed Insights), antes de esta optimización:

| Métrica | Valor |
|---|---|
| Performance score | 55/100 |
| First Contentful Paint | 3.3s |
| Largest Contentful Paint | 6.0s |
| Cumulative Layout Shift | 0 (ya perfecto, sin trabajo pendiente) |
| Total Blocking Time | 600ms |

**Hallazgo clave:** el elemento LCP no es el video — es el párrafo del Hero ("Eliminamos el trabajo repetitivo..."). El desglose de Lighthouse muestra `Time to First Byte: 246ms` pero `Element Render Delay: 5,787ms`. El texto llega rápido pero tarda ~5.8s en pintarse porque todo el contenido del Hero arranca en `opacity:0` vía Framer Motion (`FadeInStagger`/`FadeInItem`) y solo se revela después de que React hidrata y el `useInView` de Framer Motion dispara. Confirmado por Deybis: se incluye un fix quirúrgico solo para el texto del Hero (no para el sistema `FadeIn` completo, que sigue siendo válido para las secciones fuera de la vista inicial).

Waterfall de red (mismo run) confirma que el video (`hero-loop.mp4`, prioridad "Low" asignada por el navegador) tarda de 881ms a 14,762ms en descargar bajo el throttling simulado de Lighthouse — mientras compite por el mismo ancho de banda que las fuentes/CSS/JS críticos, que terminan de cargar recién a los ~4,018ms.

## Decisiones tomadas

- **Compresión del video** (probada y verificada visualmente contra el original — sin artefactos ni banding perceptible):
  - `hero-loop.mp4`: H.264, CRF 26, preset `veryslow` → 2,078,861 B → **664,572 B (-68%)**.
  - `hero-loop.webm`: VP9, CRF 38 → **485,196 B (-77% vs original)**.
  - `hero-poster.jpg`: JPEG recomprimido a calidad `q:v 5` → 87,191 B → **51,350 B (-41%)**.
- **Dos formatos, negociación nativa del navegador**: `<source>` para WebM primero, MP4 como fallback — sin JS de detección de soporte.
- **Carga diferida hasta que el navegador esté idle**: esto convierte `HeroVideo.tsx` de Server Component a Client Component — cambio de arquitectura real, justificado porque el brief pide explícitamente detectar el momento de arranque de la reproducción y el evento de "listo", algo que no se puede hacer sin JS.
- **Orden del DOM invertido para el fade sin parpadeo:** el `HeroVideo.tsx` actual tiene `.hero-video-poster-fallback` *antes* que `<video>` en el JSX — con z-index `auto` en ambos, eso hace que el `<video>` pinte encima del poster, no al revés. Para que el poster tape el video mientras carga y se desvanezca cuando esté listo, el orden correcto es `<video>` primero, `.hero-video-poster-fallback` después.
- **Mecanismo de fade cambia de `display:none/block` a `opacity` con transición**: más suave, y `opacity`/`transform` son las únicas propiedades CSS que el navegador compone por GPU sin repaint/reflow — cubre a la vez los puntos de "GPU acceleration" y "evitar repaints" del brief.
- **Caché HTTP** (hallazgo adicional, no pedido explícitamente pero directamente relevante a "cache del navegador" del brief): producción sirve hoy el video con `Cache-Control: public, max-age=0, must-revalidate` — la peor configuración posible para un asset estático que no cambia. Se agrega vía `headers()` en `next.config.ts`.
- **Sin Base64**: los tres assets (`hero-loop.mp4`, `hero-loop.webm`, `hero-poster.jpg`) siguen siendo archivos independientes en `site/public/`, exactamente como pide el brief.

## Archivos y responsabilidades

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `site/public/hero-loop.mp4` | Reemplazar | Versión recomprimida (664,572 B) |
| `site/public/hero-loop.webm` | Crear | Versión WebM (485,196 B), formato preferido |
| `site/public/hero-poster.jpg` | Reemplazar | Poster recomprimido (51,350 B) |
| `site/src/components/HeroVideo.tsx` | Reescribir | Client Component: carga diferida, fade por evento `loadeddata`, `<source>` WebM/MP4 |
| `site/src/app/globals.css` | Modificar | Nuevo mecanismo de fade por opacidad, `will-change`, animación CSS del texto del Hero (`heroTextFadeUp`) |
| `site/src/app/page.tsx` | Modificar (solo Hero) | Reemplazar `FadeInStagger`/`FadeInItem` del Hero por `<div>`s planas con la nueva animación CSS |
| `site/next.config.ts` | Modificar | `headers()` con `Cache-Control` inmutable para los 3 assets del Hero |

## 1. Assets recomprimidos

Comandos exactos usados para producir los tamaños de la tabla (a repetir en el plan):

```bash
ffmpeg -y -i "site/public/hero-loop.mp4" -c:v libx264 -crf 26 -preset veryslow -profile:v high -pix_fmt yuv420p -movflags +faststart -an hero-loop-new.mp4

ffmpeg -y -i "site/public/hero-loop.mp4" -c:v libvpx-vp9 -crf 38 -b:v 0 -deadline good -cpu-used 2 -pix_fmt yuv420p -an hero-loop.webm

ffmpeg -y -i "site/public/hero-poster.jpg" -q:v 5 hero-poster-new.jpg
```

`-movflags +faststart` mueve el átomo `moov` al inicio del archivo (necesario para que el navegador pueda empezar a reproducir sin esperar el archivo completo — verificado que el archivo actual ya lo tenía, se preserva explícitamente en el nuevo). `-an` quita la pista de audio — el archivo original no tiene audio, así que esto es un no-op de verificación, no un cambio real.

## 2. `HeroVideo.tsx` — reescritura completa

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

    let idleId: number
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

Notas sobre decisiones dentro de este bloque:

- **Sin atributo `autoPlay`.** Con `autoPlay` presente, los navegadores generalmente ignoran `preload="metadata"` y empiezan a descargar igual (es un conflicto conocido entre ambos atributos). Al quitar `autoPlay` y llamar `video.play()` manualmente solo cuando el navegador está idle, `preload="metadata"` sí se respeta — el navegador solo trae contenedor/duración hasta ese momento. `play()` con el video ya `muted` no requiere gesto del usuario en ningún navegador moderno (las políticas de autoplay restringen video CON audio, no muteado).
- **`requestIdleCallback` con fallback a `setTimeout(200ms)`** para Safari, que no implementa `requestIdleCallback`.
- **Verificación de `prefers-reduced-motion` dentro del efecto**, no en CSS: si está activo, la función retorna temprano y nunca se llama `play()` ni se agrega el listener — el poster queda como fondo permanente, igual que hoy. La regla CSS `.hero-video { display: none }` dentro de `@media (prefers-reduced-motion: reduce)` (ya existente) se conserva como defensa adicional.
- **`<source>` WebM antes que MP4**: el navegador evalúa las fuentes en orden y usa la primera que soporte — sin JS de feature-detection.

## 3. CSS — `globals.css`

### Reemplazar el mecanismo de fade actual

Buscar:
```css
.hero-video {
  animation: heroVideoFadeIn 1.2s ease-out both;
}
```

Reemplazar por (ya no se necesita el fade-in con timer fijo en el propio video — el nuevo mecanismo lo resuelve el poster-fallback desvaneciéndose):
```css
.hero-video {
  will-change: opacity;
}
```

El `@keyframes heroVideoFadeIn` puede eliminarse (nadie más lo usa — confirmar con grep antes de borrar).

### Cambiar `.hero-video-poster-fallback` de `display` a `opacity`

Buscar:
```css
.hero-video-poster-fallback {
  background-image: url("/hero-poster.jpg");
  background-size: cover;
  background-position: center;
  display: none;
}
```

Reemplazar por:
```css
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

**Nota:** con este cambio, `.hero-video-poster-fallback` ya no depende de la regla `prefers-reduced-motion` para mostrarse — está visible por defecto (`opacity: 1`) desde el primer render, sin JS. La regla existente en `@media (prefers-reduced-motion: reduce)` que hace `.hero-video-poster-fallback { display: block; }` **no se toca** — queda tal cual. Es redundante (el elemento ya está visible por defecto) pero inofensiva, y tocarla no aporta nada al objetivo de esta optimización.

### Animación CSS del texto del Hero (reemplaza el gate de Framer Motion)

Añadir junto a las demás animaciones del archivo:

```css
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

.hero-reveal > *:nth-child(1) { animation-delay: 0s; }
.hero-reveal > *:nth-child(2) { animation-delay: 0.12s; }
.hero-reveal > *:nth-child(3) { animation-delay: 0.24s; }
.hero-reveal > *:nth-child(4) { animation-delay: 0.36s; }
.hero-reveal > *:nth-child(5) { animation-delay: 0.48s; }
```

Los valores (`0.55s`, `cubic-bezier(0.21, 0.47, 0.32, 0.98)`, incrementos de `0.12s`) son una traducción exacta de los props que usa `FadeInStagger`/`FadeInItem` en el Hero hoy (`staggerDelay={0.12}`, `duration: 0.55`, `ease: [0.21, 0.47, 0.32, 0.98]`) — el resultado visual debe ser indistinguible, solo que ahora corre nativamente en CSS desde el primer paint, sin esperar hidratación de React ni de Framer Motion.

La regla global ya existente `@media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; } }` neutraliza automáticamente esta animación nueva también — no requiere código adicional.

## 4. `page.tsx` — solo el Hero

Reemplazar el `FadeInStagger`/`FadeInItem` del Hero (líneas 93-137 en el estado actual) por `<div>`s planas usando la nueva clase `.hero-reveal`. Estructura idéntica, mismo contenido, mismo agrupamiento de cada item — solo cambia el wrapper.

`FadeInStagger`, `FadeInItem` y `FadeIn` **no se eliminan del import** — `page.tsx` los sigue usando en las secciones Nosotros, Testimonios y otras fuera del Hero.

## 5. `next.config.ts` — cache headers

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

`immutable` es seguro aquí porque el flujo de trabajo de este proyecto es reemplazar el contenido de un archivo versionando por nombre cuando cambia (igual que ya se hizo con `icon-mark-v2.jpeg` en un sprint anterior) — no se edita el mismo archivo esperando que el caché lo detecte.

## Verificación (gate antes de deploy)

1. `npm run build` sin errores.
2. **Lighthouse antes/después**, mismo método que el baseline (mobile, `https://…`, categoría performance) — comparar contra los números de la tabla de baseline. No se exige un número exacto de llegada (depende de factores fuera de este control, como latencia de red real), pero el LCP y el performance score deben mejorar de forma clara y medible, no solo "sentirse más rápido".
3. Visual: mismo aspecto que antes — overlay, textos, botones, `<Dashboard />` sin cambios. El texto del Hero aparece con la misma animación de aparición (fade + slide up, escalonado), ahora sin esperar a que React hidrate.
4. El poster se ve inmediatamente al cargar, sin espacio en blanco.
5. El video reemplaza al poster con un fade suave una vez listo — sin parpadeo.
6. `prefers-reduced-motion` activado: el video nunca reproduce, el poster queda fijo — mismo comportamiento que ya existía.
7. Confirmar en el navegador (Network tab o Playwright) que la descarga completa del video no arranca inmediatamente al cargar la página — debe iniciar después de que el hilo principal esté libre.
8. Confirmar headers de caché en producción: `curl -I https://www.optima-tech.co/hero-loop.mp4` debe mostrar `Cache-Control: public, max-age=31536000, immutable`.
9. Compatibilidad: probar en Chrome, Firefox, Safari (o WebKit vía Playwright), y a 375px/768px/1440px.
10. Confirmar que ninguna otra sección de la home cambió — diff del branch debe tocar únicamente los 7 archivos de la tabla de arriba.

## Backlog (no en este spec)

- Múltiples resoluciones del video por breakpoint (ej. una versión más pequeña para mobile) — no pedido, y el archivo ya es pequeño (664KB/485KB) tras la compresión.
- Extender la animación CSS nativa (`heroTextFadeUp`) a otras secciones de la home, reemplazando `FadeIn`/`FadeInStagger` por completo — fuera de alcance, decisión explícita de mantener acotado al Hero.
- AV1 como tercer formato de video — no lo pide el brief (solo MP4 y WebM) y tiene peor soporte en Safari/iOS, que sí está en la lista de compatibilidad requerida.
