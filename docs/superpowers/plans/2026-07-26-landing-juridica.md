# Landing jurídica en /juridico — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar la landing jurídica del socio en `https://www.optima-tech.co/juridico` como HTML estático, con su formulario conectado a HubSpot mediante la API route existente.

**Architecture:** El HTML se sirve tal cual desde `site/public/juridico/`, sin portarlo a React. Conserva su propio nav, footer, CSS y JS — es una página hermana de la home, no comparte layout. El único código nuevo es un handler `submit` dentro del propio HTML que hace `fetch("/api/contact")` contra la ruta que ya opera para la home. El sitemap de Next se amplía con la nueva URL.

**Tech Stack:** Next.js 16.2.4 (App Router, Turbopack), HTML/CSS/JS vanilla dentro de `public/`, HubSpot CRM v3 API, Vercel.

**Spec:** `docs/superpowers/specs/2026-07-26-landing-juridica-design.md`

---

## Contexto crítico para quien implementa

**Lee esto antes de tocar nada.**

1. **La rama base correcta es `landing-juridica`**, que sale de `update-brand-icon` (la rama de producción, 12 commits por delante de `main`). `main` es el template de Claude Web Builder y **no contiene el sitio** — su `.gitignore` ignora `site/`. Si `git ls-files site/ | wc -l` no devuelve al menos 56, estás en la rama equivocada; para.

2. **`site/AGENTS.md` dice literalmente: "This is NOT the Next.js you know"**. Antes de escribir cualquier configuración de Next, lee el doc correspondiente en `site/node_modules/next/dist/docs/`. Los dos relevantes ya están verificados para este plan:
   - `01-app/03-api-reference/05-config/01-next-config-js/rewrites.md`
   - `01-app/03-api-reference/06-cli/next.md` (confirma `next start -p <puerto>`)

3. **Este repo no tiene test runner** (no hay jest ni vitest en `site/package.json`). La verificación es por `npm run build`, `curl` contra `next start`, y prueba real en navegador. No inventes un harness de tests.

4. **No hagas deploy.** El último paso es un gate que requiere aprobación explícita de Deybis.

5. **Los dos `.mp4` deben conservar su nombre exacto**, incluidos el espacio y los paréntesis de `0725 (3).mp4`. El HTML los referencia por ruta relativa en `<source data-src="...">`. Renombrarlos rompe los videos. En bash, cita siempre esas rutas.

**Directorio de trabajo:** `c:/Users/deivi/Documents/GitHub/Optima_proyects/projects/claude-webkit`

---

## File Structure

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `site/public/juridico/index.html` | Crear (copia de `landing-abogados.html`, luego editar) | La landing completa: markup, estilos, demos, formulario |
| `site/public/juridico/0725 (3).mp4` | Crear (copia binaria) | Video de fondo de "Centro de Operaciones IA" |
| `site/public/juridico/hf_20260725_054542_e8f4fd77-94c9-46f0-849e-6a6b1b5b8810.mp4` | Crear (copia binaria) | Video de fondo del panel CTA |
| `site/src/app/sitemap.ts` | Modificar | Añadir la entrada `/juridico` |
| `site/next.config.ts` | Modificar **solo si Task 2 lo exige** | Rewrite `/juridico` → `/juridico/index.html` |
| `.gitignore` (raíz) | Modificar | Ignorar `.superpowers/` |
| `landing-abogados.html` (raíz) | Eliminar | Copia de trabajo; la canónica queda en `public/juridico/index.html` |

Todas las ediciones de comportamiento (formulario, SEO) viven dentro de `index.html`. No se crean componentes React ni endpoints nuevos.

---

### Task 1: Copiar los archivos estáticos e ignorar `.superpowers/`

**Files:**
- Create: `site/public/juridico/index.html`
- Create: `site/public/juridico/0725 (3).mp4`
- Create: `site/public/juridico/hf_20260725_054542_e8f4fd77-94c9-46f0-849e-6a6b1b5b8810.mp4`
- Modify: `.gitignore` (raíz)

- [ ] **Step 1: Confirmar que estás en la rama correcta**

```bash
cd "c:/Users/deivi/Documents/GitHub/Optima_proyects/projects/claude-webkit"
git branch --show-current
git ls-files site/ | wc -l
```

Esperado: `landing-juridica` y un número **≥ 56**.
Si `wc -l` devuelve `0`, PARA y reporta BLOCKED — estás sobre `main`, que no contiene el sitio.

- [ ] **Step 2: Crear el directorio y copiar los tres archivos**

```bash
mkdir -p site/public/juridico
cp landing-abogados.html "site/public/juridico/index.html"
cp ".superpowers/landing-preview/0725 (3).mp4" "site/public/juridico/0725 (3).mp4"
cp ".superpowers/landing-preview/hf_20260725_054542_e8f4fd77-94c9-46f0-849e-6a6b1b5b8810.mp4" "site/public/juridico/hf_20260725_054542_e8f4fd77-94c9-46f0-849e-6a6b1b5b8810.mp4"
```

- [ ] **Step 3: Verificar tamaños**

```bash
ls -la site/public/juridico/
```

Esperado, exactamente estos tres archivos con estos tamaños:
- `index.html` → 622028 bytes
- `0725 (3).mp4` → 2644672 bytes
- `hf_20260725_054542_e8f4fd77-94c9-46f0-849e-6a6b1b5b8810.mp4` → 18139024 bytes

Si algún tamaño difiere, la copia falló. No sigas.

- [ ] **Step 4: Añadir `.superpowers/` al `.gitignore` de la raíz**

Añadir al final de `.gitignore`:

```
# Brainstorming / previews locales
.superpowers/
```

- [ ] **Step 5: Verificar que git ve lo correcto y no ve lo incorrecto**

```bash
git status --short
```

Esperado: `.gitignore` como modificado (` M`), `site/public/juridico/` como directorio nuevo (`??`), y **`.superpowers/` ausente de la lista**.
`landing-abogados.html` y `optima-mockup-v2.html` seguirán apareciendo como `??` — es correcto, `landing-abogados.html` se elimina en la Task 6.

- [ ] **Step 6: Commit**

```bash
git add .gitignore "site/public/juridico/index.html" "site/public/juridico/0725 (3).mp4" "site/public/juridico/hf_20260725_054542_e8f4fd77-94c9-46f0-849e-6a6b1b5b8810.mp4"
git commit -m "feat: landing juridica estatica en site/public/juridico"
```

---

### Task 2: Verificar la resolución de `/juridico`

Los docs de Next 16 confirman que `public/x/y.ext` se sirve en `/x/y.ext`, pero **no documentan** si `public/juridico/index.html` resuelve también en `/juridico`. Hay que comprobarlo, no asumirlo.

**Files:**
- Modify (condicional): `site/next.config.ts`

- [ ] **Step 1: Build**

```bash
cd site && npm run build
```

Esperado: termina sin errores. Si falla, reporta BLOCKED con el error completo — no intentes arreglar el sitio existente.

- [ ] **Step 2: Levantar el servidor de producción en background**

```bash
cd site && npx next start -p 3100
```

Lánzalo en background. Espera a ver `Ready` en la salida antes de seguir.

- [ ] **Step 3: Probar las cuatro URLs**

```bash
for u in "/juridico" "/juridico/" "/juridico/index.html" "/"; do
  printf "%s -> " "$u"
  curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3100$u"
done
```

Esperado: `/juridico/index.html` y `/` devuelven **200**. Anota qué devuelven `/juridico` y `/juridico/`.

- [ ] **Step 4: Si `/juridico` devolvió 200, saltar al Step 7**

No hay nada que configurar. Registra en tu reporte que el rewrite no hizo falta.

- [ ] **Step 5: Si `/juridico` devolvió 404, añadir el rewrite**

Reemplazar el contenido completo de `site/next.config.ts`:

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

- [ ] **Step 6: Rebuild, reiniciar y repetir la prueba**

Detén el servidor de background, luego:

```bash
cd site && npm run build
```

Relanza `npx next start -p 3100` en background y repite el bucle del Step 3.

Esperado ahora: `/juridico` → **200** y `/juridico/` → **200**.
Si sigue en 404, PARA y reporta BLOCKED con la salida de los cuatro curls.

- [ ] **Step 7: Verificar que se sirve el HTML correcto, no otra cosa**

```bash
curl -s "http://localhost:3100/juridico" | grep -c "formulario-contacto"
```

Esperado: un número **mayor que 0** (el id aparece varias veces en la página).
Si devuelve `0`, la URL responde 200 pero con contenido equivocado. Reporta BLOCKED.

- [ ] **Step 8: Verificar que los videos se sirven**

```bash
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" "http://localhost:3100/juridico/0725%20(3).mp4"
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" "http://localhost:3100/juridico/hf_20260725_054542_e8f4fd77-94c9-46f0-849e-6a6b1b5b8810.mp4"
```

Esperado en ambos: `200 video/mp4`.

- [ ] **Step 9: Commit (solo si modificaste `next.config.ts`)**

```bash
git add site/next.config.ts
git commit -m "fix: rewrite explicito para servir /juridico desde public"
```

Si no lo modificaste, no hay nada que commitear. Sigue adelante.

---

### Task 3: SEO — canonical, Open Graph y sitemap

**Files:**
- Modify: `site/public/juridico/index.html` (bloque `<head>`, ~línea 10)
- Modify: `site/src/app/sitemap.ts`

- [ ] **Step 1: Añadir canonical y OG en el `<head>`**

En `site/public/juridico/index.html`, localiza este bloque exacto (arranca en la línea 7) y reemplázalo:

Buscar:
```html
  <meta
    name="description"
    content="Empleados digitales para abogados y firmas jurídicas en Colombia: WhatsApp inteligente, cotizaciones, administración inteligente, monitoreo judicial y documentos automáticos."
  />
  <style>
```

Reemplazar por:
```html
  <meta
    name="description"
    content="Empleados digitales para abogados y firmas jurídicas en Colombia: WhatsApp inteligente, cotizaciones, administración inteligente, monitoreo judicial y documentos automáticos."
  />
  <link rel="canonical" href="https://www.optima-tech.co/juridico" />
  <meta property="og:title" content="Empleado Digital para Abogados en Colombia | Optima Technology" />
  <meta property="og:description" content="Empleados digitales para abogados y firmas jurídicas en Colombia: WhatsApp inteligente, cotizaciones, administración inteligente, monitoreo judicial y documentos automáticos." />
  <meta property="og:url" content="https://www.optima-tech.co/juridico" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="es_CO" />
  <meta property="og:image" content="https://www.optima-tech.co/opengraph-image" />
  <meta name="twitter:card" content="summary_large_image" />
  <style>
```

El `<title>` y el `<meta name="description">` se quedan como están: ya están bien redactados y llevan la keyword. La og:image es la genérica de marca; una específica del vertical legal queda en backlog.

- [ ] **Step 2: Añadir la entrada al sitemap**

En `site/src/app/sitemap.ts`, buscar:

```ts
    {
      url: 'https://www.optima-tech.co/privacy-policy',
```

Reemplazar por:

```ts
    {
      url: 'https://www.optima-tech.co/juridico',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://www.optima-tech.co/privacy-policy',
```

El archivo completo debe quedar así:

```ts
import { MetadataRoute } from 'next'

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.optima-tech.co',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://www.optima-tech.co/juridico',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://www.optima-tech.co/privacy-policy',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
```

- [ ] **Step 3: Rebuild y verificar**

Detén el servidor de background, luego:

```bash
cd site && npm run build
```

Relanza `npx next start -p 3100` en background y verifica:

```bash
curl -s "http://localhost:3100/juridico" | grep -c 'rel="canonical" href="https://www.optima-tech.co/juridico"'
curl -s "http://localhost:3100/juridico" | grep -c 'og:url" content="https://www.optima-tech.co/juridico"'
curl -s "http://localhost:3100/sitemap.xml" | grep -c "optima-tech.co/juridico"
```

Esperado: `1`, `1`, `1`.

- [ ] **Step 4: Commit**

```bash
git add "site/public/juridico/index.html" site/src/app/sitemap.ts
git commit -m "seo: canonical, OG y entrada de sitemap para /juridico"
```

---

### Task 4: Conectar el formulario a HubSpot

El formulario hoy tiene `action="mailto:info@optima-tech.co"`: abre el cliente de correo del visitante y no registra nada en el CRM. Se reemplaza por un envío `fetch` a `/api/contact`, la misma ruta que ya usa la home.

**Files:**
- Modify: `site/public/juridico/index.html` (CSS ~línea 1564, `<form>` ~línea 7131, `<script>` final ~línea 9855)

**Contexto del endpoint** (`site/src/app/api/contact/route.ts`, ya existe, no se toca):
acepta `{ name, email, phone, company, service, message }`; exige `name` y `email`; parte `name` por el primer espacio en `firstname`/`lastname`; compone `[service]\n\n{message}`; hace POST a HubSpot y PATCH si responde 409. `HUBSPOT_API_KEY` ya está en producción y en `site/.env.local`.

- [ ] **Step 1: Quitar los atributos de mailto del `<form>`**

Buscar:
```html
        <form class="reveal" id="formulario-contacto" action="mailto:info@optima-tech.co" method="post" enctype="text/plain">
```

Reemplazar por:
```html
        <form class="reveal" id="formulario-contacto">
```

Los `required` de los campos se conservan intactos: la validación nativa del navegador sigue funcionando.

**Cuidado:** `mailto:info@optima-tech.co` aparece **dos veces** en el archivo. La otra (línea ~7120) es `<a href="mailto:info@optima-tech.co">`, un enlace de contacto legítimo que **debe quedarse**. No hagas un find-replace ciego — solo cambia el atributo `action` del `<form>`.

- [ ] **Step 2: Añadir el elemento de estado dentro del `<form>`**

Buscar:
```html
          <div class="form-actions">
            <span class="privacy">Sus datos están protegidos. No compartimos su información.</span>
            <button class="btn btn-primary" type="submit">Enviar solicitud <span aria-hidden="true">→</span></button>
          </div>
        </form>
```

Reemplazar por:
```html
          <div class="form-actions">
            <span class="privacy">Sus datos están protegidos. No compartimos su información.</span>
            <button class="btn btn-primary" type="submit">Enviar solicitud <span aria-hidden="true">→</span></button>
          </div>
          <p class="form-status" id="formStatus" role="status" aria-live="polite"></p>
        </form>
```

`role="status"` + `aria-live="polite"` hacen que los lectores de pantalla anuncien el resultado sin interrumpir la navegación.

- [ ] **Step 3: Añadir el CSS del estado**

Buscar (está entre las reglas de formulario, ~línea 1562):
```css
    #formulario-contacto {
      scroll-margin-top: 110px;
    }
```

Reemplazar por:
```css
    #formulario-contacto {
      scroll-margin-top: 110px;
    }

    .form-status {
      min-height: 20px;
      margin: 14px 0 0;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.5;
    }

    .form-status.success {
      color: #9beabc;
    }

    .form-status.error {
      color: #ff9b87;
    }
```

- [ ] **Step 4: Añadir el handler al final del `<script>` principal**

Es el último `</script>` del archivo (~línea 9855), justo antes de `</body>`.

Buscar:
```html
  </script>
</body>
</html>
```

Reemplazar por:
```html

    const legalContactForm = document.getElementById("formulario-contacto");
    const legalFormStatus = document.getElementById("formStatus");
    const legalFormSubmit = legalContactForm.querySelector('button[type="submit"]');

    // Los <select> arrancan en un placeholder que no debe viajar al CRM.
    const readSelectValue = (element) => {
      const value = element.value.trim();
      return value === "Seleccione una opción" ? "" : value;
    };

    legalContactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!legalContactForm.reportValidity()) return;

      const firmSize = readSelectValue(document.getElementById("size"));
      const freeMessage = document.getElementById("message").value.trim();

      const payload = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        company: document.getElementById("firm").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        service: readSelectValue(document.getElementById("interest")),
        message: [firmSize ? `Tamaño de firma: ${firmSize}` : "", freeMessage]
          .filter(Boolean)
          .join("\n\n")
      };

      legalFormSubmit.disabled = true;
      legalFormStatus.className = "form-status";
      legalFormStatus.textContent = "Enviando solicitud...";

      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`La API respondió con estado ${response.status}`);

        legalFormStatus.className = "form-status success";
        legalFormStatus.textContent = "Solicitud enviada. Le contactaremos muy pronto.";
        legalContactForm.reset();
      } catch (error) {
        console.error("No fue posible enviar la solicitud:", error);
        legalFormStatus.className = "form-status error";
        legalFormStatus.textContent = "No pudimos enviar la solicitud. Escríbanos por WhatsApp o inténtelo nuevamente.";
      } finally {
        legalFormSubmit.disabled = false;
      }
    });
  </script>
</body>
</html>
```

**Nota deliberada sobre el manejo de errores:** `site/src/components/ContactForm.tsx` (la home) silencia los fallos del CRM y siempre muestra éxito. Aquí es al revés: si falla, se dice y se ofrece WhatsApp. Es una decisión consciente del spec, **no la "corrijas" para igualarla a la home**. En una landing de prospección es preferible perder la ilusión de éxito que perder el lead en silencio.

- [ ] **Step 5: Verificar que las tres ediciones están y que el mailto desapareció**

```bash
cd "c:/Users/deivi/Documents/GitHub/Optima_proyects/projects/claude-webkit"
F="site/public/juridico/index.html"
echo -n "action mailto (debe ser 0):   "; grep -c 'action="mailto:' "$F"
echo -n "href mailto (debe ser 1):     "; grep -c 'href="mailto:info@optima-tech.co"' "$F"
echo -n "formStatus (debe ser 1):      "; grep -c 'id="formStatus"' "$F"
echo -n "handler (debe ser 1):         "; grep -c "legalContactForm.addEventListener" "$F"
echo -n "css estado (debe ser 1):      "; grep -c "form-status.success" "$F"
```

Esperado: `0`, `1`, `1`, `1`, `1`.
El `href="mailto:..."` **debe seguir en 1** — si bajó a 0, borraste el enlace de contacto legítimo.

- [ ] **Step 6: Commit**

```bash
git add "site/public/juridico/index.html"
git commit -m "feat: formulario de /juridico envia leads a HubSpot via /api/contact"
```

---

### Task 5: Verificación end-to-end

Aquí se prueba de verdad, contra HubSpot real. No marques nada como hecho sin haberlo visto.

- [ ] **Step 1: Build limpio**

```bash
cd site && npm run build
```

Esperado: sin errores ni warnings nuevos.

- [ ] **Step 2: Levantar el servidor de producción**

`site/.env.local` ya contiene `HUBSPOT_API_KEY`; `next start` la carga. Lanza en background:

```bash
cd site && npx next start -p 3100
```

- [ ] **Step 3: Batería de curls**

```bash
printf "juridico:      "; curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3100/juridico"
printf "video 1:       "; curl -s -o /dev/null -w "%{http_code} %{content_type}\n" "http://localhost:3100/juridico/0725%20(3).mp4"
printf "video 2:       "; curl -s -o /dev/null -w "%{http_code} %{content_type}\n" "http://localhost:3100/juridico/hf_20260725_054542_e8f4fd77-94c9-46f0-849e-6a6b1b5b8810.mp4"
printf "home:          "; curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3100/"
printf "sitemap:       "; curl -s "http://localhost:3100/sitemap.xml" | grep -c "juridico"
printf "canonical:     "; curl -s "http://localhost:3100/juridico" | grep -c 'rel="canonical"'
printf "home title ok: "; curl -s "http://localhost:3100/" | grep -c "Optima Technology"
```

Esperado: `200`, `200 video/mp4`, `200 video/mp4`, `200`, `1`, `1`, y un número > 0.

- [ ] **Step 4: Prueba real del formulario contra HubSpot**

Abrir `http://localhost:3100/juridico` en el navegador, ir al formulario y enviarlo con datos reconocibles:

- Nombre: `Prueba Landing Juridica`
- Correo: `prueba.juridica@optima-tech.co`
- Firma: `Firma de Prueba SAS`
- Teléfono: `3001234567`
- ¿Cuántos abogados?: `2 a 5 abogados`
- ¿En qué podemos ayudarle?: `Automatizar cotizaciones`
- Mensaje: `Prueba de integracion desde /juridico`

Verificar en pantalla:
- Aparece "Enviando solicitud..." y el botón se deshabilita
- Luego "Solicitud enviada. Le contactaremos muy pronto." en verde
- El formulario queda limpio
- La consola del navegador no muestra errores

Verificar en la terminal del servidor: aparece `HubSpot contact upserted: <id>`.

**Verificar en el CRM de HubSpot** que el contacto existe con:
- Nombre `Prueba` / Apellido `Landing Juridica`
- Empresa `Firma de Prueba SAS`, teléfono `3001234567`
- Campo mensaje conteniendo:
  ```
  [Automatizar cotizaciones]

  Tamaño de firma: 2 a 5 abogados

  Prueba de integracion desde /juridico
  ```

Si el contacto no llega al CRM, reporta BLOCKED con el status de la respuesta y el log del servidor. **No sigas al Task 6.**

- [ ] **Step 5: Verificación visual**

En el navegador, sobre `http://localhost:3100/juridico`:
- Los dos videos de fondo cargan y se reproducen (Centro de Operaciones IA y panel CTA)
- Las 5 demos interactivas abren su modal
- La página se ve correcta a 375px, 768px y 1440px de ancho

**Nota:** las demos de Bot de WhatsApp, Generador de Cotizaciones y Monitoreo Jurídico llaman a webhooks en `n8n-n8n.okdnnd.easypanel.host`, infraestructura del socio. Si alguna muestra error de red, **no es un fallo de esta implementación** — anótalo en el reporte. Lo que sí debe cumplirse es que el modal abra y el error se muestre sin romper la página.

- [ ] **Step 6: Confirmar que la home no se rompió**

Abrir `http://localhost:3100/` y comprobar que carga igual que antes: hero, contadores, formulario de contacto, footer.

- [ ] **Step 7: Detener el servidor**

Detén el proceso de background de `next start`.

---

### Task 6: Limpieza del repo

**Files:**
- Delete: `landing-abogados.html` (raíz)

- [ ] **Step 1: Confirmar que la copia canónica existe y es idéntica en tamaño de origen**

```bash
ls -la landing-abogados.html "site/public/juridico/index.html"
```

`index.html` debe ser mayor que 622028 bytes (creció con las ediciones de las Tasks 3 y 4). Si es exactamente igual, las ediciones no se guardaron — para y revisa.

- [ ] **Step 2: Eliminar la copia de trabajo**

`landing-abogados.html` nunca se commiteó (está como `??` en git status), así que basta con borrarlo del disco:

```bash
rm landing-abogados.html
```

- [ ] **Step 3: Verificar el estado del repo**

```bash
git status --short
git log --oneline -6
```

Esperado: sin cambios pendientes salvo `?? optima-mockup-v2.html` (preexistente, no es nuestro). Los commits de las Tasks 1–4 presentes.

- [ ] **Step 4: Revisar el diff completo antes del gate**

```bash
git diff --stat f492ea8..HEAD
```

Esperado: solo los archivos de la tabla de File Structure. Si aparece algo más, explícalo en el reporte.

---

### Task 7: Gate de deploy — REQUIERE APROBACIÓN EXPLÍCITA

**No ejecutes este task por tu cuenta.** Presenta los resultados de la Task 5 a Deybis y espera su aprobación.

- [ ] **Step 1: Reportar y pedir aprobación**

Resumir: resultado de los curls, confirmación del contacto en HubSpot, verificación visual, y si hizo falta el rewrite de la Task 2.

- [ ] **Step 2: Deploy (solo tras el "sí")**

Deybis maneja las credenciales de Vercel; el token está en `C:\Users\deivi\.claude\CREDENTIALS.md`.

```bash
cd site && npx vercel --prod --token <TOKEN>
```

- [ ] **Step 3: Verificar en producción**

```bash
printf "juridico:  "; curl -s -o /dev/null -w "%{http_code}\n" "https://www.optima-tech.co/juridico"
printf "video 1:   "; curl -s -o /dev/null -w "%{http_code} %{content_type}\n" "https://www.optima-tech.co/juridico/0725%20(3).mp4"
printf "video 2:   "; curl -s -o /dev/null -w "%{http_code} %{content_type}\n" "https://www.optima-tech.co/juridico/hf_20260725_054542_e8f4fd77-94c9-46f0-849e-6a6b1b5b8810.mp4"
printf "sitemap:   "; curl -s "https://www.optima-tech.co/sitemap.xml" | grep -c "juridico"
printf "home:      "; curl -s -o /dev/null -w "%{http_code}\n" "https://www.optima-tech.co/"
```

Esperado: `200`, `200 video/mp4`, `200 video/mp4`, `1`, `200`.

Enviar el formulario una vez desde producción y confirmar el contacto en HubSpot.

- [ ] **Step 4: Rollback si algo falla**

Instant Rollback en el dashboard de Vercel al deployment anterior. No hay migraciones ni cambios destructivos; la home no se toca, así que el rollback no arrastra otros cambios.

---

## Fuera de alcance (backlog)

- Migrar los 3 workflows n8n de las demos desde la infraestructura del socio (`n8n-n8n.okdnnd.easypanel.host`) al n8n propio de Deybis, y actualizar las URLs de webhook en el HTML. **Este es el riesgo abierto más relevante**: si ese servidor cae o el socio cierra la cuenta, las demos dejan de funcionar en el dominio de producción de Deybis sin que él pueda intervenir.
- og:image específica del vertical legal (hoy usa la genérica de marca).
- JSON-LD propio para `/juridico` (la página no hereda el `ProfessionalService` del layout principal por ser HTML estático).
- Enlace desde la home hacia `/juridico` (hoy queda accesible solo por URL directa y sitemap).
- Unificar el manejo de errores del formulario de la home con el de `/juridico`.
