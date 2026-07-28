# Spec: Video de fondo en el Hero de la home

**Fecha:** 2026-07-27
**Origen:** Brief del socio de Deybis (Julián Coello) — reemplazar el fondo decorativo del Hero de `optima-tech.co` por un video en loop, manteniendo el resto del sitio intacto.
**Alcance del código:** `site/src/app/page.tsx` (Hero, líneas ~87-141), `site/src/app/globals.css`, un componente nuevo.
**Fuera de alcance:** cualquier otra sección de la home, Header, Footer, textos, botones/CTA existentes, paleta, tipografías. El componente `<Dashboard />` del Hero no se toca.

## Decisiones tomadas

- **Sección objetivo:** el Hero (primera sección de la home). El brief se contradecía — "Objetivo" decía Sección #1, "Restricciones" decía Sección #4 — se confirmó con Deybis que es el Hero; el "#4" fue un error de copy-paste del brief.
- **Qué reemplaza el video:** únicamente las dos divs decorativas `.orb`/`.orb-2` (círculos difuminados de fondo, `page.tsx:89-90`). El texto+CTA y el componente `<Dashboard />` (tarjeta animada de métricas) se quedan exactamente igual, ahora flotando sobre video+overlay en vez del fondo sólido actual.
- **Archivo de video:** `video sesion 1.mp4` (provisto por Deybis, en `.superpowers/landing-preview/`). Metadata real (ffprobe): H.264, 1280×720, 6s, ~2.03 MB, sin pista de audio. Se copia a `site/public/hero-loop.mp4`.
- **Sin Client Component:** el proyecto ya tiene precedente de secciones puramente CSS sin `"use client"` (`Marquee.tsx`). El fade-in de aparición se resuelve con una animación CSS declarativa, no JS — más simple y no agrega hidratación innecesaria.
- **`prefers-reduced-motion`:** no lo pedía el brief, pero se agrega por decisión explícita de Deybis. Un video en loop infinito, autoplay, en paralelo con el resto del contenido cae bajo WCAG 2.2.2 (Pausar/Detener/Ocultar). Se resuelve 100% en CSS: si el usuario tiene activada la preferencia de reducir movimiento, el `<video>` se oculta y se muestra el poster estático (primer frame) en su lugar — sin agregar controles visibles ni JS.

## Archivos y responsabilidades

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `site/public/hero-loop.mp4` | Crear (copia de `video sesion 1.mp4`) | El video de fondo |
| `site/public/hero-poster.jpg` | Crear (frame 0 extraído con ffmpeg) | Poster del `<video>` (se ve mientras carga) y fondo estático para `prefers-reduced-motion` |
| `site/src/components/HeroVideo.tsx` | Crear | Video + overlay + efecto de iluminación, como capa de fondo autocontenida |
| `site/src/app/page.tsx` | Modificar | Quitar las 2 divs `.orb`/`.orb-2`, insertar `<HeroVideo />` en su lugar |
| `site/src/app/globals.css` | Modificar | Nueva animación `heroVideoFadeIn`, agregarla a la regla `prefers-reduced-motion` existente |

## 1. Extracción del poster

```bash
ffmpeg -y -i ".superpowers/landing-preview/video sesion 1.mp4" -vframes 1 -q:v 2 "site/public/hero-poster.jpg"
```

Confirmado visualmente: el frame 0 es una escena de oficina futurista con pantallas holográficas de datos/IA — nítido, oscuro, en marca, sin problema de "frame en negro" al inicio del video.

## 2. `HeroVideo.tsx`

Estructura (sin `"use client"`):

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

- `aria-hidden="true"` en el contenedor: es decoración de fondo, no contenido informativo — no debe anunciarse a lectores de pantalla (mismo criterio que ya usan `.orb`/`.orb-2`, que son `pointer-events-none` y puramente visuales).
- **Sin `z-index` en el contenedor** (ni negativo ni positivo). El grid de contenido del Hero ya tiene `z-10` explícito (`page.tsx:92`); un elemento posicionado con `z-index: auto` siempre pinta por debajo de un hermano con `z-index` positivo dentro del mismo contexto de apilamiento, sin necesidad de forzar un valor negativo. Usar `-z-10` aquí es arriesgado: la página ya tiene `<NeuralCanvas />` como fondo animado global fuera de esta sección — un `z-index` negativo en el Hero podría terminar compitiendo con capas globales en vez de quedarse acotado a esta sección, escondiendo el video detrás del canvas de fondo. `z-index: auto` (es decir, no declararlo) resuelve el orden correcto sin ese riesgo.
- Cuatro capas dentro del contenedor, en este orden: fallback de poster (capa 0, normalmente invisible), video, resplandor (`hero-video-glow`), overlay oscuro (`hero-video-overlay`) — el overlay siempre queda encima de todo lo demás.

### Overlay
```css
.hero-video-overlay {
  background: linear-gradient(
    160deg,
    rgba(11, 18, 32, 0.65) 0%,
    rgba(11, 18, 32, 0.55) 45%,
    rgba(11, 18, 32, 0.6) 100%
  );
}
```
Opacidad efectiva ~55-65%, dentro del rango que pide el brief (45-65%). `#0B1220` es el color de fondo base del sitio — coherente con el resto de la identidad visual.

### Resplandor ("ligero efecto de iluminación")
```css
.hero-video-glow {
  background: radial-gradient(
    circle at 80% 15%,
    rgba(30, 139, 255, 0.18) 0%,
    rgba(255, 152, 0, 0.08) 35%,
    transparent 65%
  );
}
```
Mismo rincón (superior derecha) donde vivía `.orb` antes, con los mismos dos colores de marca (`#1E8BFF`, `#FF9800`) — la transición visual respecto al diseño anterior se siente continua, no como un cambio de identidad.

### Fade-in de aparición
```css
.hero-video {
  animation: heroVideoFadeIn 1.2s ease-out both;
}

@keyframes heroVideoFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```
Se agrega junto a los demás `@keyframes` existentes en `globals.css` (cerca de `pulseOrb`). La regla global ya existente en `globals.css`:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  ...
}
```
ya neutraliza esta animación para esos usuarios (la duración se fuerza a 0.01ms) — no requiere código adicional para el fade-in en sí.

### `prefers-reduced-motion`: ocultar el video, mostrar el poster

**Decisión de implementación (resuelta, no queda abierta para el plan):** el atributo `poster` nativo del `<video>` NO sirve como fallback aquí — si el `<video>` se oculta con `display: none`, su `poster` desaparece con él (es parte del mismo elemento). Por eso `hero-video-poster-fallback` es una **capa separada** (un `<div>` propio, ya incluido en el JSX de arriba, con `background-image`), independiente del elemento `<video>`, que solo se hace visible cuando el video se oculta. Esto se agrega a la MISMA regla `@media (prefers-reduced-motion: reduce)` que ya existe en `globals.css` (la que ya lista `.marquee-track, .pulse-dot, .orb, .orb-2, .flow-item, .wa-float, .grad-text`) — no una regla nueva separada:

```css
.hero-video-poster-fallback {
  background-image: url("/hero-poster.jpg");
  background-size: cover;
  background-position: center;
  display: none;
}

@media (prefers-reduced-motion: reduce) {
  /* ...selectores existentes sin cambio... */
  .hero-video {
    display: none;
  }
  .hero-video-poster-fallback {
    display: block;
  }
}
```

## 3. Integración en `page.tsx`

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

El resto del `<section>` (el grid con texto+CTA y `<Dashboard />`) no cambia — ya tiene `relative z-10` en el contenedor del grid (línea 92: `className="relative mx-auto max-w-6xl grid ..."`), así que queda automáticamente por encima de `<HeroVideo />` (que no declara `z-index`, ver sección 2).

Import nuevo en la cabecera del archivo:
```tsx
import HeroVideo from "@/components/HeroVideo"
```

## 4. Rendimiento

- `preload="auto"`: el navegador prioriza la descarga, pero como es un `<video>` de fondo (no bloquea el layout ni el pintado del texto, que ya está en el HTML servido por SSR), no retrasa el First Contentful Paint del contenido textual del Hero.
- Archivo ya es liviano (~2 MB, 720p) — no requiere transcodificación adicional ni múltiples resoluciones para este alcance.
- `poster` evita un flash de fondo vacío mientras el video carga.
- Sin librerías nuevas — `<video>` HTML nativo, animaciones CSS puras.

## 5. Responsive

`absolute inset-0` + `object-cover` en el `<video>` cubre el 100% del `<section>` en cualquier tamaño de viewport, siempre centrado, sin distorsión ni barras negras — se comporta igual en mobile, tablet y desktop porque no depende de breakpoints, solo del tamaño real del contenedor.

## Verificación (gate antes de deploy)

1. `npm run build` sin errores.
2. Visual: el video se reproduce en loop, sin controles nativos visibles, cubriendo toda la sección Hero, con el overlay legible encima.
3. El texto, los botones "Agendar llamada gratuita"/"Ver servicios" y la tarjeta `<Dashboard />` se ven exactamente igual que antes (mismo texto, misma posición, mismo comportamiento).
4. Contraste: el texto del Hero (`#F1F5F9` sobre el overlay) debe seguir pasando WCAG AA (4.5:1) — verificar con las herramientas de contraste ya usadas en sprints anteriores del proyecto.
5. Responsive: probar a 375px, 768px, 1024px, 1440px — el video se mantiene centrado y cubre toda la sección en los cuatro tamaños.
6. `prefers-reduced-motion`: con la preferencia activada (DevTools → Rendering → Emulate CSS media feature), el video no se reproduce y se ve el poster estático en su lugar, con el overlay igual de legible.
7. Confirmar que ninguna otra sección de la home cambió — diff del branch debe tocar únicamente los 5 archivos de la tabla de arriba.
8. Confirmar que el Header y Footer no cambiaron.

## Deploy y rollback

- Branch nuevo desde `update-brand-icon` (rama de producción real de este repo — no `main`).
- Deploy: `npx vercel --prod` desde `site/`, con aprobación explícita de Deybis tras pasar el gate de verificación.
- Rollback: Instant Rollback en el dashboard de Vercel. Sin migraciones, sin cambios de datos.

## Backlog (no en este spec)

- Múltiples resoluciones/formatos del video (WebM, distintos tamaños por breakpoint) — el archivo actual ya es liviano, no se justifica la complejidad adicional para este alcance.
- Analytics de reproducción del video (si en el futuro se quiere medir engagement).
