# Análisis visual exhaustivo — referencia "Círculo Sagrado"

> Imagen fuente: `docs/assets/login-reference-circulo-sagrado.png`
> Analizada desde 6 perspectivas profesionales distintas, documentando todo lo
> visualmente observable. Sirve como fuente de verdad para implementar la
> atmósfera del login (geometría luminosa, tokens de diseño, jerarquía).

---

## 1. UI/UX Designer — Jerarquía e información

**Estructura de la pantalla (de afuera hacia adentro):**
1. Header fijo: marca (izq.) + nav de 3 conceptos separados por "·" (der.)
2. Columna editorial (izq.): eyebrow → titular emocional (3 líneas) → copy de apoyo → 3 pilares de confianza con ícono circular numerado/con glifo
3. **Panel central (protagonista absoluto)**: login, flotando sobre la composición
4. Columna de confianza (der.): 3 bloques ícono+texto (Seguridad/Transparencia/Comunidad)
5. Fondo: escena atmosférica de paisaje + geometría luminosa superpuesta

**Jerarquía visual (orden de lectura por peso):** panel de login > titular emocional > sol/geometría > bloques laterales > header > footer/legal (implícito, no visible en este crop).

**Estados del formulario visibles:** input vacío con placeholder gris, ícono leading (persona/candado), toggle de mostrar contraseña (ícono ojo) en el campo de contraseña — dato clave: **el campo contraseña SÍ tiene toggle de visibilidad**, algo que nuestra versión no implementó todavía.

**Affordances:** checkbox "Recordarme" con label clickeable, link de texto para "olvidé contraseña" (no botón), CTA primario ancho completo con flecha direccional (refuerza la acción "hacia adelante"), separador "o" entre método primario y alternativo, botón secundario con ícono + label, micro-copy de ayuda al pie ("¿Necesitás ayuda? Contactate con el equipo") — **esto tampoco lo tenemos implementado**.

**Accesibilidad observable:** buen contraste texto/fondo dentro del panel (fondo casi blanco, texto navy oscuro); contraste MENOR en textos sobre la foto directamente (el titular editorial se apoya en texto oscuro sobre fondo claro-variable, mitigado con la zona de cielo despejada detrás).

---

## 2. Frontend Developer — Anatomía de componentes

**Panel de login:**
- `border-radius`: ~28-32px (esquinas muy redondeadas pero no pill)
- Fondo: blanco semitransparente, `backdrop-filter: blur()` fuerte (glassmorphism real, se ve el paisaje difuminado detrás, no solo tintado)
- Borde: 1px blanco semitransparente muy sutil
- Sombra: doble — una sombra proyectada suave hacia abajo (offset+blur real, no decorativa) + un glow difuso más grande detrás (otro elemento, no el mismo box-shadow)
- El panel tiene **ligera perspectiva/rotación** — no está perfectamente plano de frente, sugiere un sutil `transform: perspective() rotateX()` o es simplemente la luz/sombra la que sugiere profundidad

**Inputs:** fondo blanco casi opaco (más opaco que el panel), `border-radius` ~14-16px, íconos leading en gris-azulado, altura generosa (~48-52px), sin borde visible en reposo (solo el fondo los separa).

**Botón primario:** gradiente diagonal violeta→azul agua, `border-radius` ~16px, texto blanco bold + flecha, sombra de color (glow violeta) debajo — coincide con lo que ya implementamos.

**Botón secundario (Telegram):** fondo blanco translúcido, borde 1px gris muy sutil, ícono a la izquierda, mismo radio que el primario, MISMA altura.

**Ícono central (logo repetido dentro del panel):** círculo con borde dorado fino, fondo con gradiente radial blanco→lavanda, el logo mandala dorado centrado — **más grande que el de nuestra versión actual**, con más aire alrededor.

**Breakpoint implícito:** la composición de 3 columnas (texto/panel/confianza) sugiere un `grid-template-columns` asimétrico similar al que ya usamos, colapsando a 1 columna en mobile (no visible en este crop, pero es el patrón estándar para este tipo de layout).

---

## 3. Art Director — Mood, luz y narrativa

**Paleta dominante:** marfil/crema cálido como base, con washes de lavanda y azul agua en las zonas de cielo, dorado SOLO como acento (línea, brillo, ícono) — nunca como superficie grande. Los violetas/azules son más saturados en el panel (CTA, texto de marca) que en el fondo (donde todo es pastel).

**Dirección de luz:** cenital-frontal, viene de arriba (el sol) y se refleja hacia abajo (agua, plataforma) — crea un eje de simetría vertical muy fuerte en TODA la composición. Todo el diseño está construido alrededor de ese eje central.

**Temperatura:** cálida en las zonas de luz directa (sol, reflejos dorados), fría en las sombras/cielo (azules, lavandas) — contraste cálido/frío intencional, no plano.

**Narrativa visual:** "portal a otra dimensión / templo" — el panel de login literalmente FLOTA sobre un pedestal de piedra, con anillos de energía que lo rodean, como un objeto sagrado en exhibición. La marca "sella" ese propósito con el ícono tipo mandala/flor de la vida.

**Textura:** el fondo tiene grano/textura fotográfica real (nubes, agua, rocas, flores) — el panel es liso/limpio por contraste, reforzando que es un objeto "de otro material" (vidrio/luz) flotando sobre la naturaleza.

**Foco de atención:** el ojo entra por el sol (arriba), baja por el eje central, se detiene en el panel — la composición ESTÁ DISEÑADA para dirigir la mirada así, no es casual.

---

## 4. Web Designer — Grid, tipografía, iconografía

**Grid:** 3 columnas asimétricas, la columna central (login) ligeramente más angosta en proporción pero visualmente dominante por contraste (blanco sobre foto, blur, el único elemento "sólido").

**Tipografía:**
- Display/editorial (titular, "Bienvenido" del panel): serif clásica (tipo Georgia/Playfair), peso regular (no bold), tracking negativo sutil
- UI (labels, inputs, nav, botones): sans-serif geométrica/humanista, varios pesos (regular para body, bold/700 para labels y botones)
- Micro-texto (eyebrow, nav superior): sans-serif con tracking MUY amplio (letter-spacing positivo grande) y todo mayúsculas — patrón consistente en TODOS los textos pequeños de la pieza

**Iconografía:** trazo fino (~1.5px), un solo color por ícono (no multicolor), estilo consistente entre los íconos de los inputs y los íconos de los 3 pilares de confianza — son la MISMA familia de íconos (probablemente Feather/Lucide o similar).

**Espaciado:** ritmo generoso, mucho aire negativo alrededor del panel — el panel ocupa quizás 30% del ancho total pero con muchísimo espacio de "respiro" a los costados antes de las columnas laterales.

---

## 5. Design Systems — Tokens extraíbles

```
color/ivory: #FAF8F3 (aprox, base)
color/lavender: #DCD8F2
color/water: #6FAFC2
color/violet: #7568A8
color/night: #17233D (texto principal)
color/blue: #263A63 (texto secundario/marca)
color/gold: #C7A968 (acento único, nunca superficie)

radius/panel: 28-32px
radius/input: 14-16px
radius/button: 15-16px

elevation/panel: sombra difusa + glow separado (2 capas, no 1)
blur/glass: alto (15-25px backdrop-filter)

type/display: serif, 400, tracking -0.03 a -0.045em
type/label: sans, 700, tracking +0.14 a +0.22em, uppercase
type/body: sans, 400-500, tracking normal

spacing/rhythm: base 8px, saltos generosos entre secciones (24-40px)
```

**Sistema de profundidad (importante, es la clave de "por qué se ve caro"):**
capa 1 = foto de fondo (base) → capa 2 = geometría luminosa (elipses+sol, semi-transparente, ENCIMA de la foto pero DEBAJO del panel) → capa 3 = glow difuso detrás del panel (blur grande) → capa 4 = panel de vidrio (blur+opacidad) → capa 5 = contenido del panel (100% opaco).
Nuestra implementación actual **colapsa las capas 2 y 4** al ponerlas literalmente en la foto — por eso se siente "más plana" que la referencia cuando se compara en detalle.

---

## 6. Conversión / Landing — Patrones de persuasión

**Prueba social / confianza implícita:** los 3 pilares (Seguridad/Transparencia/Comunidad) son un patrón clásico de reducción de fricción — responden objeciones ANTES de que el usuario las piense, sin necesitar testimonios reales.

**Reducción de fricción en el form:** solo 2 campos visibles + 1 alternativa (Telegram) — no pide más de lo necesario para el login.

**Micro-copy de urgencia/calidez, no de urgencia comercial:** "La verificación también es una forma de cuidado" — vende una EMOCIÓN (cuidado, pertenencia), no una feature. Coherente con que esto es una comunidad, no un SaaS.

**Indicador de seguridad explícito:** "Tu información está protegida" con un punto verde — patrón de e-commerce/banking aplicado a un contexto comunitario, genera confianza prestada de esos contextos.

**Salida de ayuda visible:** "¿Necesitás ayuda? Contactate con el equipo" al pie del panel — reduce abandono en el punto de mayor fricción (no poder entrar).

**Jerarquía del CTA:** un solo botón primario, muy grande, imposible de no ver — todo lo demás (Telegram, recordarme, olvidé contraseña) es visualmente secundario. Cero ambigüedad sobre "qué hacer acá".

---

## Hallazgos que cambian la implementación actual

1. ✅ **Geometría luminosa**: son elipses grandes (más anchas que altas), no círculos — nacen a la altura media del panel, convergen arriba (sol) y abajo (plataforma). — Implementado en `site/src/app/page.tsx` (componente `HaloGeometry`, SVG con 3 elipses concéntricas, viewBox 1000x1000, `cx=500 cy=440`, convergen en `(500,80)` sol y `(500,800)` plataforma).
2. ✅ **Falta toggle de mostrar/ocultar contraseña** en nuestro input. — Implementado (ícono de ojo, `EyeIcon`, alterna `type="password"`/`type="text"`).
3. ✅ **Falta el link "¿Necesitás ayuda?"** al pie del panel. — Agregado como texto propio, arriba del link existente "¿Sos parte del equipo de verificación?" (se mantuvieron los dos, con propósitos distintos).
4. ✅ **El glow y la geometría luminosa son capas SEPARADAS** de la foto de fondo. — El `HaloGeometry` es ahora un `<svg>` propio (z-index 2), independiente de la imagen de fondo (`.rp-bg`, z-index 0) y del panel (z-index 3+). La luz viajera se anima con `animateMotion` sobre la MISMA curva de la elipse mayor, así coincide siempre con la geometría dibujada.
5. ✅ **El panel tiene más aire interno**. — Padding del panel aumentado (`clamp(24px, 3.6vw, 34px)`) y logo central agrandado (72px círculo / 54px ícono).

## Estado
Los 5 hallazgos de esta sección están implementados y verificados visualmente
(desktop 1440px y mobile 375px) al 2026-09-27. Pendiente de una revisión visual
del usuario para ajustar proporciones finas si algo no coincide con la
referencia (radios de las elipses, timing de la luz viajera, posición exacta
del punto "sol"/"plataforma").
