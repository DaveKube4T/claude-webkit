# Dropdown "Soluciones IA" en el Header — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir un ítem "Soluciones IA" al Header de la home (`optima-tech.co`) que despliega un dropdown (desktop: hover/click; mobile: acordeón) listando las soluciones verticales publicadas — hoy solo "Jurídico" → `/juridico` — sin tocar Hero, Footer, paleta ni el resto del Header.

**Architecture:** Los datos de las soluciones viven en un archivo nuevo (`site/src/data/solutions.ts`), separados de la UI. Un componente nuevo (`site/src/components/SolutionsMenu.tsx`) exporta dos piezas —`SolutionsMenu` (desktop) y `SolutionsMenuMobile` (mobile)— construidas a mano con `useState`/`ref`/`onKeyDown` y transiciones CSS/Tailwind puras (no la librería `NavigationMenu` de shadcn, que está instalada pero nunca usada y depende de tokens/plugin que este proyecto no tiene). `Navbar.tsx` solo importa e inserta estas piezas en los dos bloques que ya existen (nav desktop, panel mobile).

**Tech Stack:** Next.js 16.2.4 (App Router), React 19, TypeScript, Tailwind CSS v4, `lucide-react` (ya instalado, ícono `ChevronDown`), `cn()` de `site/src/lib/utils.ts` (ya existe). Cero dependencias nuevas.

**Spec:** `docs/superpowers/specs/2026-07-26-navbar-soluciones-dropdown-design.md`

---

## Contexto crítico para quien implementa

1. **No hay test runner en este repo** (no jest/vitest — solo `build`/`lint` en `site/package.json`). La verificación es `npm run build` + revisión visual manual/Playwright, no tests automatizados. No inventes un harness.
2. **`site/AGENTS.md` dice literalmente "This is NOT the Next.js you know".** Este plan no requiere features nuevas de Next (es un componente React cliente estándar), pero si algo no cuadra con lo que esperarías de Next, consulta `site/node_modules/next/dist/docs/` antes de asumir.
3. **No instalar dependencias nuevas.** El brief del socio lo prohíbe explícitamente. Todo lo necesario (`lucide-react`, `clsx`, `tailwind-merge`, Tailwind v4) ya está en `site/package.json`.
4. **No usar `site/src/components/ui/navigation-menu.tsx`** (Radix, shadcn) — está instalado pero nunca importado en ningún lado, sus colores dependen de variables CSS (`--background`, `--popover`, `--accent`) que este proyecto no define, y sus animaciones dependen de `tailwindcss-animate`, no instalado. Usarlo tal cual se vería roto (sin color) o exigiría instalar una dependencia — ambas cosas violan el punto 3. Construir a mano.
5. **Colores del sitio son hex directos, no variables CSS**: fondo `#0B1220`, borde `#334155` (con opacidad `/60` o `/30` según el uso), texto secundario `#94A3B8`, texto casi-blanco `#F1F5F9` (ya usado en `Navbar.tsx:44`), acento/hover `#FFB347`. No inventes tokens nuevos.

**Directorio de trabajo:** `c:/Users/deivi/Documents/GitHub/Optima_proyects/projects/claude-webkit`

**Rama base:** nueva rama desde `update-brand-icon` (rama de producción real de este repo). **No uses `main`** — es el template de Claude Web Builder y no contiene `site/` en absoluto (`git ls-files site/` da 0 ahí).

---

## File Structure

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `site/src/data/solutions.ts` | Crear | Tipo `Solution` + array `solutions`. Única fuente de contenido — agregar una vertical futura es editar solo este archivo. |
| `site/src/components/SolutionsMenu.tsx` | Crear | `SolutionsMenu` (dropdown desktop: trigger + panel flotante, hover/click, teclado, Escape, click-fuera) y `SolutionsMenuMobile` (acordeón dentro del panel mobile existente). Comparten un helper interno `renderSolutionCard`. |
| `site/src/components/Navbar.tsx` | Modificar | Insertar `<SolutionsMenu />` en el bloque `nav` desktop y `<SolutionsMenuMobile setMenuOpen={setOpen} />` en el panel mobile, ambos entre "Servicios" y "Proceso". Nada más del archivo cambia. |

---

### Task 1: Modelo de datos — `solutions.ts`

**Files:**
- Create: `site/src/data/solutions.ts`

- [ ] **Step 1: Crear el archivo con el tipo y el array**

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

- [ ] **Step 2: Verificar que TypeScript lo acepta**

```bash
cd site && npx tsc --noEmit
```
Esperado: sin errores relacionados a este archivo (puede haber warnings preexistentes de otras partes del código — ignóralos, no son tu responsabilidad).

- [ ] **Step 3: Commit**

```bash
git add site/src/data/solutions.ts
git commit -m "feat: modelo de datos para el dropdown de soluciones verticales"
```

---

### Task 2: `SolutionsMenu` — dropdown desktop

**Files:**
- Create: `site/src/components/SolutionsMenu.tsx` (se completa en las Tasks 2 y 3; esta task escribe la mitad desktop)

- [ ] **Step 1: Escribir el componente desktop**

```tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { solutions, type Solution } from "@/data/solutions"

const CLOSE_DELAY_MS = 150

function renderSolutionCard(solution: Solution, onNavigate?: () => void) {
  return (
    <a
      key={solution.href}
      href={solution.href}
      onClick={onNavigate}
      className={cn(
        "block rounded-lg p-3 transition-all duration-200",
        "hover:bg-[#334155]/30 hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB347]"
      )}
    >
      <span className="block text-base font-semibold text-[#F1F5F9]">
        {solution.icon} {solution.title}
      </span>
      <span className="block text-sm text-[#94A3B8] mt-1">
        {solution.description}
      </span>
    </a>
  )
}

export function SolutionsMenu() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  const scheduleClose = () => {
    cancelClose()
    closeTimeoutRef.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS)
  }

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  useEffect(() => () => cancelClose(), [])

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose()
        setOpen(true)
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="solutions-panel"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1 text-sm font-medium text-[#94A3B8] hover:text-[#FFB347] transition-colors duration-200"
      >
        Soluciones IA
        <ChevronDown
          size={16}
          className={cn("transition-transform duration-200", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      <div
        id="solutions-panel"
        className={cn(
          "absolute left-0 top-full mt-2 w-72 rounded-xl border border-[#334155]/60 bg-[#111A2C] p-3 shadow-xl",
          "transition-all duration-200 ease-out",
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none"
        )}
      >
        {solutions.map((solution) => renderSolutionCard(solution))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar tipos**

```bash
cd site && npx tsc --noEmit
```
Esperado: sin errores nuevos. Si TypeScript se queja de que `SolutionsMenuMobile` no existe todavía, ignóralo — se añade en la Task 3, en el mismo archivo.

- [ ] **Step 3: Commit**

```bash
git add site/src/components/SolutionsMenu.tsx
git commit -m "feat: dropdown desktop de Soluciones IA (SolutionsMenu)"
```

---

### Task 3: `SolutionsMenuMobile` — acordeón mobile

**Files:**
- Modify: `site/src/components/SolutionsMenu.tsx` (añadir al final del archivo creado en la Task 2)

- [ ] **Step 1: Añadir el export mobile al final del archivo**

Añadir esto al final de `site/src/components/SolutionsMenu.tsx`, después del cierre de `SolutionsMenu`:

```tsx

export function SolutionsMenuMobile({ setMenuOpen }: { setMenuOpen: (open: boolean) => void }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={expanded}
        aria-controls="solutions-panel-mobile"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-center justify-between w-full text-sm font-medium text-[#94A3B8] hover:text-[#FFB347] transition-colors py-1"
      >
        Soluciones IA
        <ChevronDown
          size={16}
          className={cn("transition-transform duration-200", expanded && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      <div
        id="solutions-panel-mobile"
        aria-hidden={!expanded}
        className={cn(
          "overflow-hidden transition-all duration-200 ease-out pl-4",
          expanded ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
        )}
      >
        {solutions.map((solution) =>
          renderSolutionCard(solution, expanded, () => setMenuOpen(false))
        )}
      </div>
    </div>
  )
}
```

**Nota de actualización post-Task-2:** el code review de la Task 2 encontró que el contenido del panel desktop seguía siendo focuseable por teclado aunque estuviera visualmente oculto (link invisible alcanzable con Tab). El fix cambió la firma de `renderSolutionCard` a `(solution: Solution, open: boolean, onNavigate?: () => void)`, agregando `tabIndex={open ? 0 : -1}` en el `<a>` y `aria-hidden={!open}` en el panel — ya reflejado en el bloque de arriba (`renderSolutionCard(solution, expanded, ...)` y `aria-hidden={!expanded}` en `#solutions-panel-mobile`). El acordeón mobile tiene el mismo problema en potencia (`max-h-0 overflow-hidden` no impide el foco por teclado en la mayoría de navegadores), así que aplica la misma solución desde el inicio, usando su propio estado `expanded` en vez de `open`.

Nota: `renderSolutionCard` y `ChevronDown`/`cn`/`useState` ya están importados arriba en el mismo archivo (Task 2) — no dupliques imports.

- [ ] **Step 2: Verificar tipos**

```bash
cd site && npx tsc --noEmit
```
Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add site/src/components/SolutionsMenu.tsx
git commit -m "feat: acordeon mobile de Soluciones IA (SolutionsMenuMobile)"
```

---

### Task 4: Integrar en `Navbar.tsx`

**Files:**
- Modify: `site/src/components/Navbar.tsx`

Estado actual del archivo (76 líneas, ya explorado):
- Línea 1-13: imports + array `links` (5 ítems: Servicios, Proceso, Nosotros, Testimonios, Contacto).
- Línea 25-41: `<nav className="hidden md:flex ...">` con el `.map()` de `links` + botón CTA.
- Línea 53-73: panel mobile `{open && (...)}` con el mismo `.map()` de `links` + botón CTA.

- [ ] **Step 1: Añadir el import**

Buscar:
```tsx
import { useState } from "react"
import { Menu, X } from "lucide-react"
import Logo from "@/components/Logo"
```

Reemplazar por:
```tsx
import { useState } from "react"
import { Menu, X } from "lucide-react"
import Logo from "@/components/Logo"
import { SolutionsMenu, SolutionsMenuMobile } from "@/components/SolutionsMenu"
```

- [ ] **Step 2: Insertar en el nav desktop, entre "Servicios" y "Proceso"**

El array `links` está ordenado `["Servicios", "Proceso", "Nosotros", "Testimonios", "Contacto"]` y se renderiza con un único `.map()`. Como "Soluciones IA" no es un `<a href>` simple (tiene dropdown), no entra en ese array — se inserta el componente aparte, partiendo el `.map()` en dos mitades.

Buscar:
```tsx
        <nav className="hidden md:flex items-center gap-8" aria-label="Navegación principal">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-[#94A3B8] hover:text-[#FFB347] transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contacto"
            className="btn-grad text-white font-semibold text-sm h-10 px-5 rounded-lg flex items-center"
          >
            Agendar llamada
          </a>
        </nav>
```

Reemplazar por:
```tsx
        <nav className="hidden md:flex items-center gap-8" aria-label="Navegación principal">
          {links.slice(0, 1).map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-[#94A3B8] hover:text-[#FFB347] transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
          <SolutionsMenu />
          {links.slice(1).map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-[#94A3B8] hover:text-[#FFB347] transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contacto"
            className="btn-grad text-white font-semibold text-sm h-10 px-5 rounded-lg flex items-center"
          >
            Agendar llamada
          </a>
        </nav>
```

`links.slice(0, 1)` es "Servicios" (el primer ítem), `links.slice(1)` son los otros cuatro ("Proceso", "Nosotros", "Testimonios", "Contacto") — el orden final queda: Servicios, Soluciones IA, Proceso, Nosotros, Testimonios, Contacto, Agendar llamada.

- [ ] **Step 3: Insertar en el panel mobile, misma posición relativa**

Buscar:
```tsx
      {open && (
        <div className="md:hidden border-t border-[#334155]/60 bg-[#0B1220] px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-[#94A3B8] hover:text-[#FFB347] transition-colors py-1"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contacto"
            onClick={() => setOpen(false)}
            className="btn-grad text-white font-semibold text-sm h-11 rounded-lg w-full flex items-center justify-center"
          >
            Agendar llamada
          </a>
        </div>
      )}
```

Reemplazar por:
```tsx
      {open && (
        <div className="md:hidden border-t border-[#334155]/60 bg-[#0B1220] px-6 py-4 flex flex-col gap-4">
          {links.slice(0, 1).map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-[#94A3B8] hover:text-[#FFB347] transition-colors py-1"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <SolutionsMenuMobile setMenuOpen={setOpen} />
          {links.slice(1).map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-[#94A3B8] hover:text-[#FFB347] transition-colors py-1"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contacto"
            onClick={() => setOpen(false)}
            className="btn-grad text-white font-semibold text-sm h-11 rounded-lg w-full flex items-center justify-center"
          >
            Agendar llamada
          </a>
        </div>
      )}
```

- [ ] **Step 4: Verificar tipos, lint y build**

```bash
cd site && npx tsc --noEmit && npm run lint && npm run build
```
Esperado: los tres sin errores. `lint` usa `eslint-config-next`, que incluye reglas `jsx-a11y` — vale la pena correrlo aquí porque esta feature es justamente de accesibilidad (aria-*, foco, teclado).

- [ ] **Step 5: Commit**

```bash
git add site/src/components/Navbar.tsx
git commit -m "feat: insertar Soluciones IA en el Header (desktop y mobile)"
```

---

### Task 5: Verificación visual y de accesibilidad

No hay test runner — esta verificación es manual/con navegador real.

- [ ] **Step 1: Levantar el dev server**

```bash
cd site && npm run dev
```
En background. Esperar "Ready".

- [ ] **Step 2: Verificación desktop en navegador**

Abrir `http://localhost:3000/`. Confirmar:
- El ítem "Soluciones IA" aparece entre "Servicios" y "Proceso", con el mismo estilo tipográfico que los demás.
- Hover sobre "Soluciones IA" abre el panel con fade + slide suave (sin salto brusco).
- Mover el cursor del trigger al panel NO lo cierra (el delay de 150ms debe evitar el parpadeo).
- La tarjeta "⚖️ Jurídico" muestra título + descripción con jerarquía visual clara (título más grande que la descripción).
- Hover sobre la tarjeta: fondo más claro, elevación sutil — sin efectos exagerados.
- Click en la tarjeta navega a `https://www.optima-tech.co/juridico`.
- Click fuera del panel (en cualquier otra parte de la página) lo cierra.

- [ ] **Step 3: Verificación de teclado**

- `Tab` desde el logo hasta llegar al botón "Soluciones IA" — debe tener foco visible (anillo `#FFB347`).
- `Enter` o `Espacio` sobre el trigger enfocado abre el panel.
- `Tab` continúa hacia la tarjeta dentro del panel — foco visible ahí también.
- `Escape` cierra el panel y el foco vuelve al botón "Soluciones IA" (verificar visualmente que el anillo de foco reaparece ahí, no se pierde).

- [ ] **Step 4: Verificación mobile (375px)**

Con las devtools del navegador en modo responsive a 375px:
- Abrir el menú hamburguesa.
- Tocar "Soluciones IA" — debe expandir la tarjeta de Jurídico debajo, indentada, SIN cerrar el menú completo.
- Tocar "Soluciones IA" de nuevo — debe colapsar.
- Volver a expandir y tocar la tarjeta "⚖️ Jurídico" — debe navegar a `/juridico` Y cerrar el menú mobile completo.

- [ ] **Step 5: Confirmar que nada más cambió**

```bash
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/"
```
Esperado: `200`. Revisar visualmente que el Hero, el resto del Header (logo, CTA "Agendar llamada", los demás links) y el Footer se ven exactamente igual que antes de este cambio.

- [ ] **Step 6: Diff scope check**

```bash
git diff --stat <sha-antes-de-task-1>..HEAD
```
Esperado: solo los 3 archivos de la tabla de File Structure (`site/src/data/solutions.ts`, `site/src/components/SolutionsMenu.tsx`, `site/src/components/Navbar.tsx`). Si aparece algo más, repórtalo — no lo corrijas por tu cuenta.

- [ ] **Step 7: Detener el servidor**

Detener el proceso de `npm run dev` en background. En Windows/Git Bash, si el PID rastreado no coincide con el proceso real, usar `netstat -ano | grep :3000` para encontrar el PID real y `taskkill //F //PID <pid>`.

---

## Verificación final (gate antes de deploy)

1. `npm run build` en `site/` sin errores (ya cubierto en Task 4).
2. Todos los checks de la Task 5 pasaron.
3. Diff del branch limpio (Task 5, Step 6).
4. Aprobación explícita de Deybis antes de `npx vercel --prod`.

## Deploy y rollback

- Deploy: `npx vercel --prod` desde `site/`, con el token de `CREDENTIALS.md`, solo tras aprobación explícita.
- Verificar producción: `curl -s -o /dev/null -w "%{http_code}\n" https://www.optima-tech.co/` → `200`, y una pasada visual rápida del dropdown en producción (hover, click a `/juridico`, mobile).
- Rollback: Instant Rollback en el dashboard de Vercel. Sin migraciones ni cambios de datos — rollback trivial.

## Backlog (no en este plan)

- Contenido de soluciones futuras (Salud, Financiero, etc.) — se agregan a `site/src/data/solutions.ts` siguiendo `site/docs/landing-satelite-checklist.md`.
- Página índice `/soluciones` — no la pidió el brief.
