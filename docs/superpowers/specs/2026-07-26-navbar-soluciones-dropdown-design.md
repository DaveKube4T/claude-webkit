# Spec: Dropdown "Soluciones IA" en el Header de la home

**Fecha:** 2026-07-26
**Origen:** Brief detallado del socio de Deybis (Julián Coello) — Optima Tech
evoluciona hacia un ecosistema de Empleados Digitales especializados por
industria. La home debe reflejar eso con un dropdown en el Header.
**Alcance del código:** `site/src/components/Navbar.tsx` (modificado),
`site/src/components/SolutionsMenu.tsx` (nuevo),
`site/src/data/solutions.ts` (nuevo).
**Fuera de alcance:** rediseño de Hero, Footer, paleta, tipografías,
animaciones existentes, cualquier componente fuera del Header. Contenido de
soluciones futuras (Salud, Financiero, etc.) — hoy el array tiene un solo
elemento, Jurídico.

## Decisiones tomadas

- **Datos en archivo separado:** `site/src/data/solutions.ts` exporta el
  tipo `Solution` y el array `solutions`. `SolutionsMenu.tsx` solo lo
  importa y renderiza con `.map()`. Agregar una solución futura es editar
  ese archivo — cero cambios en lógica de componente.
- **Construcción a mano, no el `NavigationMenu` de shadcn:** el proyecto
  tiene `site/src/components/ui/navigation-menu.tsx` (Radix) instalado pero
  nunca usado. Se descartó: sus colores dependen de variables CSS
  (`--background`, `--popover`, `--accent`) que este proyecto no define
  (usa hex directos: `#0B1220`, `#334155`, `#94A3B8`, `#FFB347`), y sus
  animaciones dependen del plugin `tailwindcss-animate`, no instalado.
  Adaptarlo exigiría una dependencia nueva, algo que el brief prohíbe
  explícitamente. Se construye con `useState` + `ref` + `onKeyDown` +
  transiciones CSS/Tailwind puras, mismo estilo que el resto de
  `Navbar.tsx` hoy.
- **Posición en el menú:** después de "Servicios", antes de "Proceso".
  Razón: representa la nueva dirección estratégica de la empresa: tiene
  sentido que aparezca apenas el visitante entiende qué hace Optima en
  general, antes de las anclas más internas de la página.
- **Patrón de accesibilidad:** disclosure simple (botón que revela links
  normales), no un widget ARIA `menu`/`menuitem` completo con navegación
  por flechas — el brief no lo pide y agregaría complejidad sin beneficio
  para una lista de links.
- **Emoji como contenido, no como icono decorativo:** `⚖️ Jurídico` viene
  literal del brief del socio — es contenido de marca que él define por
  vertical (previsible que cada industria futura tenga su propio emoji),
  no un ícono decorativo genérico tipo "AI slop". Se respeta tal cual.

## Archivos y responsabilidades

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `site/src/data/solutions.ts` | Crear | Tipo `Solution` + array `solutions`. Única fuente de verdad del contenido. |
| `site/src/components/SolutionsMenu.tsx` | Crear | Trigger + panel desktop (hover/click, fade+slide, accesibilidad). Export separado para la variante mobile (acordeón). |
| `site/src/components/Navbar.tsx` | Modificar | Insertar `<SolutionsMenu />` (desktop) y su variante mobile en los dos bloques ya existentes (`nav` desktop, panel `open &&` mobile). |

## 1. Modelo de datos — `site/src/data/solutions.ts`

```ts
export type Solution = {
  icon: string
  title: string
  description: string
  href: string
}

export const solutions: Solution[] = [
  {
    icon: "⚖️",
    title: "Jurídico",
    description: "Empleado Digital para abogados y firmas jurídicas.",
    href: "https://www.optima-tech.co/juridico",
  },
]
```

Agregar una solución futura: añadir un objeto a este array. No se toca
ningún otro archivo para eso.

## 2. `SolutionsMenu.tsx` — comportamiento desktop

Trigger: `<button>` (no `<a>` — no navega por sí mismo), con
`aria-haspopup="true"`, `aria-expanded={open}`, `aria-controls="solutions-panel"`.
Texto "Soluciones IA" + ícono `ChevronDown` de `lucide-react` (ya
importado en el proyecto), que rota 180° cuando `open` es `true`
(`transition-transform duration-200`).

**Apertura:**
- `onMouseEnter` abre inmediato.
- `onMouseLeave` cierra con un delay de ~150ms (via `setTimeout`,
  cancelado si el mouse vuelve a entrar al trigger o al panel antes de
  que expire) — evita que mover el cursor del trigger al panel lo cierre
  de golpe. Detalle de UX necesario para que el hover no se sienta roto,
  no lo pide el brief explícitamente pero es requisito implícito de
  "transición suave, elegante".
- `onClick` alterna `open` (cubre touch en pantallas que no disparan
  hover, y da una vía de apertura predecible).
- Foco + `Enter`/`Espacio` en el trigger abre (comportamiento nativo de
  `<button>`, no requiere código extra).

**Cierre:**
- `Escape` cierra y devuelve el foco al trigger (`triggerRef.current?.focus()`).
- Click fuera del trigger y del panel cierra (listener de `mousedown` en
  `document`, comparando contra un `containerRef` que envuelve trigger +
  panel).

**Panel:**
- Contenedor `id="solutions-panel"`, posicionado `absolute` bajo el
  trigger.
- Transición fade + slide sin librería:
  ```
  className={cn(
    "transition-all duration-200 ease-out",
    open
      ? "opacity-100 translate-y-0 pointer-events-auto"
      : "opacity-0 -translate-y-2 pointer-events-none"
  )}
  ```
  Siempre montado en el DOM (no `open && <div>`) para que la transición
  se vea; `pointer-events-none` cuando está cerrado evita que capture
  clicks o foco por teclado mientras es invisible.
- Fondo `#0B1220` (o un tono ligeramente más claro tipo `#111A2C` para
  dar profundidad sin salirse de la paleta), borde `#334155/60`, sombra
  (`shadow-xl` o equivalente), `rounded-lg` o `rounded-xl`, padding
  generoso (`p-4` o `p-5`).
- Recorre `solutions.map()` renderizando una tarjeta por cada una (hoy,
  una sola).

**Tarjeta de solución** (dentro del panel, un `<a href={solution.href}>`
por cada `solution`):
- `{solution.icon} {solution.title}` en tamaño mayor (ej. `text-base
  font-semibold text-[#F1F5F9]`), `{solution.description}` debajo en
  tamaño menor (`text-sm text-[#94A3B8]`) — jerarquía visual clara.
- Hover: fondo sutilmente más claro (`hover:bg-[#334155]/30`), borde
  iluminado (`hover:border-[#FFB347]/40` si la tarjeta tiene borde
  propio), elevación sutil (`hover:-translate-y-0.5`), todo con
  `transition-all duration-200` — sin efectos exagerados.
- Foco visible con `focus-visible:ring-2 focus-visible:ring-[#FFB347]`
  (o el color de foco que ya use el resto del sitio, si existe un
  patrón — si no, este es el nuevo estándar para este componente).

## 3. `SolutionsMenu.tsx` — comportamiento mobile

Dentro del panel mobile que ya existe (`open &&` en `Navbar.tsx`), el
ítem "Soluciones IA" es un botón que alterna un estado propio
(`mobileSolutionsOpen`), **independiente** del estado `open` del
hamburguesa principal — tocarlo expande la lista de tarjetas debajo, sin
cerrar el menú completo.

- Botón con el mismo texto + `ChevronDown` que rota, ocupando el ancho
  completo del panel mobile, mismo estilo de texto que los demás links
  (`text-sm font-medium text-[#94A3B8]`).
- Al expandir, las tarjetas de `solutions` aparecen indentadas debajo
  (`pl-4` o similar), cada una como `<a>` que sí navega y cierra **todo**
  el menú mobile al tocarla (`onClick={() => setOpen(false)}`, igual que
  los demás links hoy).
- `SolutionsMenu.tsx` exporta dos componentes: `SolutionsMenu` (desktop,
  descrito arriba) y `SolutionsMenuMobile` (este). Ambos importan el
  mismo array `solutions` y comparten una función interna
  `renderSolutionCard(solution)` para no duplicar el marcado de la
  tarjeta — solo difieren en el contenedor (panel flotante con hover en
  uno, acordeón inline en el otro), igual que hoy `Navbar.tsx` ya separa
  desktop (`nav` con `hidden md:flex`) de mobile (panel `open &&`) como
  dos bloques distintos en vez de un único componente condicional.

## 4. Accesibilidad — checklist explícito del brief

- [x] Navegación por teclado: `Tab` alcanza el trigger, `Enter`/`Espacio`
      lo abre, `Tab` continúa hacia las tarjetas dentro del panel.
- [x] Foco visible: `focus-visible:ring-*` en trigger y tarjetas.
- [x] `aria-haspopup="true"` en el trigger.
- [x] `aria-expanded={open}` en el trigger.
- [x] `aria-controls="solutions-panel"` en el trigger, `id="solutions-panel"`
      en el panel.
- [x] Cierre con `Escape`, devolviendo foco al trigger.

## 5. Integración en `Navbar.tsx`

Dos puntos de inserción, sin tocar nada más del archivo:

- Dentro de `<nav className="hidden md:flex ...">`, entre el link
  "Servicios" y el link "Proceso": `<SolutionsMenu />`.
- Dentro del panel mobile (`{open && (...)}`), en la misma posición
  relativa (después de "Servicios", antes de "Proceso"):
  `<SolutionsMenuMobile setMenuOpen={setOpen} />` — recibe el `setOpen`
  del hamburguesa principal para poder cerrar todo el menú cuando el
  usuario toca una tarjeta y navega (igual que ya hacen los demás links
  del panel mobile).

El array `links` existente no cambia — "Soluciones IA" no es un ítem de
ese array (no es un simple `<a href>`, tiene comportamiento de dropdown),
así que vive como componente aparte insertado entre las posiciones
correspondientes.

## Verificación (gate antes de deploy)

1. `npm run build` en `site/` sin errores.
2. Visual: dropdown abre con hover en desktop, fade+slide visible, no
   parpadea al mover el cursor del trigger al panel.
3. Click en la tarjeta "Jurídico" navega exactamente a
   `https://www.optima-tech.co/juridico`.
4. Teclado: `Tab` hasta el trigger, `Enter` abre, `Tab` entra a la
   tarjeta, `Escape` cierra y el foco vuelve al trigger.
5. Mobile (375px): tocar "Soluciones IA" expande la tarjeta sin cerrar
   el menú completo; tocar la tarjeta navega y cierra todo.
6. Confirmar que Hero, Footer, resto del Header y el resto de la home no
   cambiaron — diff del PR/branch debe tocar únicamente los 3 archivos
   de la tabla de arriba.
7. Lighthouse/axe rápido sobre el Header (opcional pero recomendado dado
   el énfasis en accesibilidad del brief).

## Deploy y rollback

- Branch nuevo desde `update-brand-icon` (rama de producción real de este
  repo — **no `main`**, que es el template de Claude Web Builder y no
  contiene `site/`).
- Deploy: `npx vercel --prod` desde `site/`, con aprobación explícita de
  Deybis tras pasar el gate de verificación.
- Rollback: Instant Rollback en el dashboard de Vercel. Sin migraciones,
  sin cambios a datos — rollback trivial.

## Backlog (no en este spec)

- Contenido de soluciones futuras (Salud, Financiero, Educación, etc.) —
  se agregan a `solutions.ts` cuando el socio publique cada landing,
  siguiendo `site/docs/landing-satelite-checklist.md`.
- Página índice `/soluciones` que liste todas las verticales (el brief no
  la pide; hoy el dropdown es la única forma de descubrirlas).
