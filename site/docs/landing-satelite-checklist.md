# Landings satélite del socio — checklist de integración

Proceso para publicar una landing que Julián construye standalone (HTML
autocontenido) en un subpath de `optima-tech.co`. Basado en `/juridico`
(2026-07-26) — primera landing de este tipo, sirvió de piloto.

Ya construidas: `/juridico`.
Próximas: `/salud`, `/tesoreria`.

## Por qué este flujo, no GitHub

Se probó fork + PR con Julián como colaborador directo en git. No funcionó:
token de `gh` inválido (keyring), el PR terminó apuntando al repo equivocado
(`Hainrixz/claude-webkit` en vez del fork de Deybis, comportamiento por
defecto de GitHub al comparar desde un fork), y Deybis no tiene permiso de
escritura ahí de todas formas. Julián no necesita estar en git — solo manda
el archivo.

## 0. Antes de que Julián mande el archivo

- [ ] Acordar el **slug exacto** con él antes de que arme el HTML (evita un
      round de correcciones tipo "jurico" → "juridico"). Español, sin tilde,
      todo minúscula: `salud`, `tesoreria`.
- [ ] Confirmar que el HTML es autocontenido: su propio nav/footer/CSS/JS,
      sin dependencias externas rotas.
- [ ] Si tiene videos/imágenes pesadas, pedirle los archivos aparte (no
      embebidos en base64 si pesan varios MB).

## 1. Recepción y copia

- [ ] Guardar el HTML y los assets en `.superpowers/` o una carpeta temporal
      (nunca en `site/public/` todavía sin editar).
- [ ] Copiar a `site/public/<slug>/index.html` + assets en la misma carpeta,
      **conservando el nombre exacto de archivo** (espacios, paréntesis
      incluidos, si el HTML los referencia así).

## 2. Rewrite en `next.config.ts`

Next NO resuelve `public/<slug>/index.html` en `/<slug>` automáticamente
(confirmado empíricamente en `/juridico` — devuelve 404 sin esto). Añadir
una línea explícita por página, no un wildcard genérico — más predecible,
no arriesga interceptar rutas reales de la app:

```ts
{ source: "/<slug>", destination: "/<slug>/index.html" },
```

`/<slug>/` (con slash final) 308-redirige a `/<slug>` por comportamiento
default de Next — no hace falta una regla aparte para eso.

## 3. Rutas de assets — el bug que ya nos mordió una vez

**Buscar todo `data-src=`, `src=`, `url()` relativo en el HTML antes de dar
por buena la landing.** En `/juridico` los dos videos usaban rutas relativas
(`data-src="video.mp4"`). Como la URL servida es `/<slug>` sin slash final,
el navegador las resolvía contra la RAÍZ del sitio, no contra `/<slug>/` →
404 en producción. **`curl` no lo detecta** porque no replica la resolución
de URLs relativas del navegador — el HTML entero respondía 200 igual.
Solo apareció con una prueba de navegador real (Playwright).

- [ ] Grep de rutas relativas a media/imágenes en el HTML.
- [ ] Corregir todas a absolutas: `/<slug>/archivo.ext`.
- [ ] Verificar con navegador real (Playwright), no solo curl — ver sección 5.

## 4. Formulario → HubSpot

Reusar `site/src/app/api/contact/route.ts` (no tocar). Reemplazar el
`action="mailto:..."` del `<form>` por un handler `fetch` propio:

- [ ] Quitar `action`/`method`/`enctype` del `<form>`.
- [ ] Añadir `<p class="form-status" role="status" aria-live="polite">`.
- [ ] Handler `submit` con `event.preventDefault()` + `reportValidity()` +
      `fetch("/api/contact", {method:"POST", body: JSON.stringify(payload)})`.
- [ ] Payload: `{name, email, phone, company, service, message}` — mapear
      los campos del formulario del socio a estos nombres. Cualquier campo
      sin propiedad dedicada en HubSpot (tamaño de firma, etc.) va prefijado
      dentro de `message`.
- [ ] Mostrar éxito/error real en pantalla (no silenciar como
      `ContactForm.tsx` de la home) — en una landing de prospección es peor
      perder el lead en silencio que perder la ilusión de éxito.
- [ ] Cuidado con strings `mailto:` duplicados en el archivo — puede haber
      un enlace de contacto legítimo aparte del `action` del form. No hacer
      find-replace ciego.

## 5. Verificación (no saltarse ninguna)

- [ ] `npm run build` sin errores.
- [ ] Batería de `curl`: página, cada asset, sitemap, canonical/OG.
- [ ] **Navegador real (Playwright)**, no solo curl — es lo único que agarra
      el bug de rutas relativas. Confirmar red (`page.on("response")`) que
      cada asset resuelva 2xx en la ruta correcta.
- [ ] Envío real del formulario contra HubSpot producción, con datos de
      prueba reconocibles (`Prueba Landing <Nombre> ...`) — confirmar
      `HubSpot contact upserted: <id>` en el log del servidor.
- [ ] Confirmar que la home (`/`) sigue intacta.

## 6. SEO

- [ ] `<link rel="canonical" href="https://www.optima-tech.co/<slug>" />`.
- [ ] Tags OG (título/descripción propios del HTML, `og:image` genérica del
      sitio salvo que se pida una específica).
- [ ] Entrada en `site/src/app/sitemap.ts`.

## 7. Deploy

- [ ] Aprobación explícita de Deybis antes de `vercel --prod`.
- [ ] Verificar producción con la misma batería del punto 5 (curl basta para
      re-confirmar producción si ya se probó en local con Playwright).
- [ ] Rollback: Instant Rollback en el dashboard de Vercel.

## Riesgo recurrente: demos/webhooks del socio

Si la landing tiene demos interactivas que llaman a infraestructura del
socio (ej. `n8n-n8n.okdnnd.easypanel.host` en `/juridico`), documentarlo
como riesgo abierto, no bloqueante. Falla del lado de él tumba la demo, no
la página. Migrar a infraestructura propia queda en backlog acumulado por
cada landing nueva — vale la pena revisarlo en bloque cuando haya 2-3
landings con el mismo patrón.
