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

## 5. Backlog de accesibilidad (no bloqueante, detectado en code review)

- [ ] El texto `text-[#64748B]` sobre fondo `#0B1220` en el footer (párrafo de
      descripción, junto al bloque de contacto) da ~3.94:1 de contraste —
      por debajo del 4.5:1 que exige WCAG AA para texto de cuerpo. Es un color
      preexistente al sprint SEO, no algo que este sprint introdujo. Vale la
      pena revisarlo en un pase de accesibilidad futuro (subir el color a algo
      como `#94A3B8`, que ya se usa en el bloque `<address>` nuevo y sí pasa
      el contraste).
