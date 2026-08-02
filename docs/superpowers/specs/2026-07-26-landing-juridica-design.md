# Spec: Landing jurídica en optima-tech.co/juridico

**Fecha:** 2026-07-26
**Origen:** Landing construida por el socio de Deybis (Julián Coello) como HTML standalone. Se integra al sitio de producción y se conecta su formulario a HubSpot.
**Alcance del código:** `site/` (Next.js 16.2.4, App Router, Vercel, dominio www.optima-tech.co).
**Fuera de alcance:** portar la landing a React/Next, rediseñar su copy o UI, migrar los workflows n8n de las demos (queda como riesgo documentado), crear una og:image específica del vertical legal.

## Decisiones tomadas

- **Integración:** HTML estático servido desde `site/public/juridico/`, sin portar a React. El archivo conserva su propio nav, footer, CSS y JS — es una página hermana del sitio principal, no comparte layout.
- **URL:** subpath `optima-tech.co/juridico` (no subdominio), para aprovechar la autoridad del dominio ya posicionado.
- **Videos:** los 2 archivos (~21 MB combinados) se commitean en `site/public/juridico/`, junto al HTML. Sin CDN externo.
- **Formulario:** se conecta a HubSpot reutilizando la API route existente `site/src/app/api/contact/route.ts` (misma `HUBSPOT_API_KEY` que ya usa la página principal). No se crea backend nuevo.

## Archivos y responsabilidades

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `site/public/juridico/index.html` | Crear (copia de `landing-abogados.html`) | La landing completa: markup, estilos, demos, formulario |
| `site/public/juridico/0725 (3).mp4` | Crear | Video de fondo de la sección "Centro de Operaciones IA" |
| `site/public/juridico/hf_20260725_054542_e8f4fd77-94c9-46f0-849e-6a6b1b5b8810.mp4` | Crear | Video de fondo del panel CTA |
| `site/src/app/sitemap.ts` | Modificar | Añadir la entrada `/juridico` |
| `.gitignore` (raíz) | Modificar | Ignorar `.superpowers/` (contiene copias de trabajo de 21 MB) |
| `landing-abogados.html` (raíz) | Eliminar | Copia de trabajo; la versión canónica queda en `site/public/juridico/index.html` |

**Nota sobre nombres de archivo:** los dos `.mp4` deben conservar su nombre exacto —incluidos el espacio y los paréntesis de `0725 (3).mp4`— porque el HTML los referencia por ruta relativa en `<source data-src="...">`. Renombrarlos rompe los videos.

## 1. Copia de los archivos estáticos

Copiar el HTML y los dos videos a `site/public/juridico/`. El HTML referencia los videos por ruta relativa, así que al quedar en la misma carpeta resuelven sin cambios en el código.

## 2. Resolución de la URL `/juridico`

Los docs de Next.js 16 (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/public-folder.md`) confirman que `public/x/y.ext` se sirve en `/x/y.ext`, pero **no documentan** si `public/juridico/index.html` resuelve también en `/juridico` (comportamiento de índice de directorio).

**La implementación debe verificarlo empíricamente**, no asumirlo:

1. Con `npm run build && npx next start`, hacer `curl -s -o /dev/null -w "%{http_code}" http://localhost:PORT/juridico`.
2. Si devuelve **200**, no se requiere nada más.
3. Si devuelve **404**, añadir el rewrite explícito en `site/next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/juridico", destination: "/juridico/index.html" },
    ];
  },
};

export default nextConfig;
```

Ambas rutas (`/juridico` y `/juridico/`) deben terminar devolviendo 200 con el HTML de la landing.

## 3. Formulario → HubSpot

### Estado actual
```html
<form class="reveal" id="formulario-contacto" action="mailto:info@optima-tech.co" method="post" enctype="text/plain">
```
Abre el cliente de correo del visitante. No registra nada en el CRM.

### Cambio en la etiqueta `<form>`
```html
<form class="reveal" id="formulario-contacto">
```
Se eliminan `action`, `method` y `enctype`. Se conservan los atributos `required` de los campos para que la validación nativa del navegador siga funcionando.

### Elemento de estado
Añadir dentro del `<form>`, inmediatamente después del `<div class="form-actions">`:

```html
<p class="form-status" id="formStatus" role="status" aria-live="polite"></p>
```

`role="status"` + `aria-live="polite"` hacen que los lectores de pantalla anuncien el resultado del envío sin interrumpir.

### CSS del estado
Añadir junto a las demás reglas de formulario en el `<style>`:

```css
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

### Handler de envío
Añadir al final del `<script>` principal:

```javascript
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
```

### Mapeo de campos

| Campo del formulario | `id` | Propiedad enviada a `/api/contact` | Destino en HubSpot |
|---|---|---|---|
| Nombre completo | `name` | `name` | `firstname` + `lastname` (la ruta parte el string por el primer espacio) |
| Correo corporativo | `email` | `email` | `email` |
| Nombre de la firma | `firm` | `company` | `company` |
| Teléfono / WhatsApp | `phone` | `phone` | `phone` |
| ¿En qué podemos ayudarle? | `interest` | `service` | se antepone al mensaje como `[interés]` |
| ¿Cuántos abogados? | `size` | (dentro de `message`) | prefijo `Tamaño de firma: X` |
| Mensaje libre | `message` | `message` | `message` |

`service` y `size` no tienen propiedad dedicada en HubSpot, por eso se componen dentro de `message` — es el mismo patrón que ya usa la página principal. El valor final queda así:

```
[Automatizar cotizaciones]

Tamaño de firma: 2 a 5 abogados

Necesitamos organizar la atención de nuevos clientes.
```

**No requiere configuración nueva:** `HUBSPOT_API_KEY` ya está en las variables de entorno de producción del proyecto Vercel, y la ruta `/api/contact` ya opera para la landing principal — `site/src/components/ContactForm.tsx` envía exactamente el mismo payload (`name`, `email`, `phone`, `company`, `service`, `message`).

### Diferencia deliberada con el formulario de la home

`ContactForm.tsx` **silencia los errores del CRM** y siempre muestra "¡Mensaje enviado!" (comentario en el código: *"no bloqueamos al usuario por error de CRM"*). Si HubSpot falla, ese lead se pierde sin que nadie se entere.

El formulario de `/juridico` hace lo contrario: si el envío falla, lo dice y ofrece WhatsApp como salida. Es una decisión consciente, no una inconsistencia por descuido — en una landing de prospección es preferible perder la ilusión de éxito que perder el lead en silencio. Unificar el comportamiento del formulario de la home queda como backlog.

## 4. SEO

La landing es HTML plano: **no pasa por el Metadata API de Next.js**, así que su `<title>` y `<meta name="description">` actuales se conservan tal cual (ya están bien redactados y con keyword: *"Empleado Digital para Abogados en Colombia | Optima Technology"*).

### Canonical
Añadir en el `<head>`:
```html
<link rel="canonical" href="https://www.optima-tech.co/juridico" />
```

### Open Graph
La landing hoy no tiene ninguna etiqueta OG. Como WhatsApp es el canal principal de prospección, se añaden en el `<head>` reutilizando la og:image ya existente del sitio:

```html
<meta property="og:title" content="Empleado Digital para Abogados en Colombia | Optima Technology" />
<meta property="og:description" content="Empleados digitales para abogados y firmas jurídicas en Colombia: WhatsApp inteligente, cotizaciones, administración inteligente, monitoreo judicial y documentos automáticos." />
<meta property="og:url" content="https://www.optima-tech.co/juridico" />
<meta property="og:type" content="website" />
<meta property="og:locale" content="es_CO" />
<meta property="og:image" content="https://www.optima-tech.co/opengraph-image" />
<meta name="twitter:card" content="summary_large_image" />
```

La imagen es la genérica de marca ("Automatiza hoy. Escala mañana."). Una og:image específica del vertical legal queda en backlog.

### Sitemap
Añadir la entrada en `site/src/app/sitemap.ts`, entre la raíz y `/privacy-policy`:

```ts
    {
      url: 'https://www.optima-tech.co/juridico',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
```

## 5. Higiene del repositorio

Añadir al `.gitignore` de la raíz:

```
# Brainstorming / previews locales
.superpowers/
```

`.superpowers/` contiene la sesión del companion visual y una carpeta de preview con copias de los dos videos (~21 MB). Sin esta regla se corre el riesgo de commitear los videos por duplicado.

Eliminar además la copia de trabajo `landing-abogados.html` de la raíz del repo una vez copiada a `site/public/juridico/index.html`.

## Verificación (gate antes de deploy)

1. `npm run build` en `site/` sin errores.
2. Con `npx next start`, comprobar:
   - `curl -o /dev/null -w "%{http_code}" /juridico` → **200** (si es 404, aplicar el rewrite de la sección 2 y repetir).
   - `curl -o /dev/null -w "%{http_code}" "/juridico/0725%20(3).mp4"` → **200**, `content-type: video/mp4`.
   - `curl -o /dev/null -w "%{http_code}" "/juridico/hf_20260725_054542_e8f4fd77-94c9-46f0-849e-6a6b1b5b8810.mp4"` → **200**.
   - El HTML servido contiene `rel="canonical"` y `og:url` apuntando a `/juridico`.
   - `/sitemap.xml` incluye la URL `/juridico`.
3. **Prueba real del formulario end-to-end:** enviar el formulario desde el navegador con datos de prueba reconocibles (ej. nombre "Prueba Landing Abogados") y **confirmar en el CRM de HubSpot que el contacto aparece** con firma, teléfono, interés y tamaño de firma dentro del campo mensaje. Verificar también que el mensaje de éxito se muestra en pantalla y el formulario se limpia.
4. Verificación visual: la página carga con ambos videos reproduciéndose, y las 5 demos abren su modal correspondiente.
5. Que la página principal (`/`) siga intacta: `curl /` responde 200 y su `<title>` no cambió.

## Riesgo abierto: dependencia del n8n del socio

Las 3 demos interactivas (Bot de WhatsApp, Generador de Cotizaciones, Monitoreo Jurídico) hacen `fetch` a webhooks alojados en `https://n8n-n8n.okdnnd.easypanel.host`, **infraestructura del socio, no de Deybis**.

Implicación: si ese servidor se cae, cambia de dominio o el socio cierra la cuenta, las demos dejan de funcionar en el dominio de producción de Deybis sin que él pueda intervenir. El código ya maneja el fallo con un mensaje de error en pantalla (no rompe la página), pero la funcionalidad se pierde.

**Acción recomendada, fuera del alcance de este spec:** migrar los 3 workflows al n8n propio de Deybis (Hostinger/Easypanel) y actualizar las 3 URLs de webhook en el HTML. Debe acordarse con el socio antes o poco después de publicar.

## Deploy y rollback

- Branch `landing-juridica`, salida de `update-brand-icon` (la rama de producción). **`main` no sirve como base:** es el template de Claude Web Builder y su `.gitignore` ignora `site/`, así que no contiene el sitio. Commits atómicos, verificación completa antes de desplegar.
- Deploy: `npx vercel --prod` desde `site/`, **con aprobación explícita de Deybis** tras pasar el gate de verificación.
- Rollback: Instant Rollback en el dashboard de Vercel al deployment anterior. No hay migraciones ni cambios destructivos; la página principal no se toca, así que un rollback no arrastra otros cambios.

## Backlog (no en este spec)

- Migrar los workflows n8n de las demos a infraestructura propia.
- og:image específica del vertical legal (hoy usa la genérica de marca).
- JSON-LD propio para `/juridico` (la página no hereda el `ProfessionalService` del layout principal por ser HTML estático).
- Enlace desde la home hacia `/juridico` (hoy la landing queda accesible solo por URL directa y sitemap).
- Unificar el manejo de errores del formulario de la home con el de `/juridico` (hoy la home oculta los fallos del CRM).
