# Portal de Verificación de Resonancia Global — Brief estructural

> Nota: este prompt define la ESTRUCTURA (roles, tablas, lógica, bugs a evitar).
> El VISUAL de referencia se agrega en un mensaje aparte / sección al final de este archivo.

## ⚠️ Aclaración importante (2026-09-27)
El sistema verifica **donaciones/aportes** que la gente hizo para el proyecto, **no
"compras" en sentido comercial**. El prompt técnico original usa "compras/paquetes" en
toda la base de datos y la UI — se mantiene así a nivel técnico por ahora (nombres de
tablas/campos), pero el **copy visible al usuario** (textos de login, landing, mensajes)
debe evitar la palabra "compra" y usar "aporte"/"donación" en su lugar. Revisar esto en
cada pantalla nueva que se construya.

## Login, recuperación y "representantes" (agregado 2026-09-27)

**Dato clave:** para este lote de miembros (importado de JotForm) **no hay DNI** —
solo usuario de Telegram, mail y nombre completo. El mecanismo original de "DNI como
contraseña temporal" no aplica acá.

**Primera vez (sin contraseña):**
1. La persona ingresa su usuario de Telegram (no hace falta que ya haya hablado con
   el bot).
2. Como todavía no tenemos su `telegram_chat_id` (se guarda recién cuando escriben
   `/start`), le mandamos un código de un solo uso **por mail** — al mail de *esa
   cuenta puntual*, identificada por su Telegram (nunca buscando por mail).
3. Con el código entra, y se le **sugiere** (no obliga) elegir una contraseña propia.

**Recuperación de contraseña (ya con contraseña seteada):** código por **Telegram**
(no por mail), asumiendo que ya interactuó con el bot al menos una vez.

**Por qué el mail nunca se usa como clave de búsqueda:** un mismo mail puede
pertenecer a un "representante" que gestiona aportes de varias personas reales
(cada una con su propio Telegram). Si buscáramos cuentas por mail, sería ambiguo
cuál cuenta recuperar. Al identificar siempre por Telegram (único) y usar el mail
solo como canal de entrega, no hay ambigüedad.

**Caso "un solo Telegram para varias personas reales"** (ej: una madre gestiona su
aporte y el de su hijo con su propio Telegram, porque el hijo no tiene uno): **no
hace falta crear una cuenta nueva.** Ya está resuelto por diseño — una misma cuenta
(`persona_id`) puede tener varias filas en `compras`, cada una con su propio
`persona_nombre` (el beneficiario real), distinto del nombre de la cuenta que
gestiona el login. Si esa otra persona algún día quiere login propio, ahí sí se crea
una `persona` nueva con su propio Telegram.

## Resumen
Portal web para gestionar y verificar compras/pagos de miembros de una red/comunidad,
con roles diferenciados (superadmin, verificadoras, miembros) y un bot de Telegram
integrado para notificaciones y auto-servicio.

## Stack técnico
- Frontend/Backend: Next.js 14 (App Router), TypeScript, React
- Base de datos: Supabase (PostgreSQL) con Row Level Security
- Hosting: Vercel
- Bot: Telegram Bot API (webhook)
- Estilos: inline styles (sin librería CSS)
- Paleta: `#7F77DD`, `#3C3489`, `#EEE8FF` (ver sección Diseño visual para paleta completa por estado)

## Jerarquía real de personas (agregado 2026-09-27, CONFIDENCIAL)
- **Superadmin real: solo el usuario dueño del proyecto.** Nadie más sabe que este
  nivel existe — la UI de "admin" (Claudia) nunca menciona ni expone que hay un rol
  por encima del suyo.
- **Claudia = rol "admin"** (nuevo, entre superadmin y verificador): gestiona el
  día a día igual que un superadmin (aprobar/rechazar, editar líder/colaboradora,
  mensajes, personas), **incluyendo** ver "pago de inversión interno" y eliminar
  comprobantes — **excepto** (confirmado 2026-09-28):
  - Crear/borrar cuentas de nivel **admin o superadmin** (no las verificadoras — el
    equipo de verificadoras lo ven y gestionan las DOS admins por igual: alta, baja,
    asignación de `paquetes_asignados`, etc.)
  - Cualquier pantalla o log que revele la existencia del nivel superadmin.
  - **Historial / Actividad, directamente (agregado 2026-09-29, decisión
    final):** Claudia (rol `admin`) NO tiene acceso a ninguna pantalla de
    Historial/Actividad/logs — ni siquiera una versión filtrada o con el rol
    "disfrazado". Se descartó la idea de mostrarle el historial con el
    superadmin etiquetado como "admin" (riesgo: podría notar acciones que
    ella no hizo y sospechar que hay otra cuenta con permisos). Más simple y
    seguro: esa sección del menú ni se muestra para el rol `admin`. En
    `logs` (a nivel de dato) se sigue guardando siempre el rol REAL de quien
    actúa (ver bug #6 más abajo) — la restricción es solo de visibilidad en
    el panel.
  - Configuración general del portal (paquetes, precios, textos, ajustes del
    sistema) — Claudia opera el día a día, pero no reconfigura el portal en sí
- **Verificadoras** = rol "verificador" (el equipo), como ya estaba definido —
  pueden limitarse a `paquetes_asignados`.

## Estructura de roles
- **Superadmin** — acceso total: cambiar líder de compras, ver pagos internos, eliminar
  comprobantes, gestionar usuarios, ver todas las solicitudes.
- **Verificadoras** (rol `verificador`) — aprobar/rechazar compras, cargar personas y
  compras nuevas, chatear con el equipo. Pueden limitarse a un paquete específico
  (`paquetes_asignados` array).
- **Miembros** — entran con usuario de Telegram + DNI (o contraseña personalizada), ven
  sus compras, suben comprobantes, hacen solicitudes de compras faltantes.

## Tablas principales de Supabase

```sql
-- personas: datos de cada miembro
personas (id, nombre, apellidos, telegram, documento, pasaporte, password_hash,
  telegram_chat_id, wallet_trc20,
  calle, numero, ciudad, provincia_estado, pais, zip_code,
  telefono, telefono_alternativo, mail, mail_alternativo,
  codigo_recuperacion, codigo_recuperacion_exp, acepto_disclaimer_en, ...)
-- Nota (2026-09-27): se sacó bancus_usuario/bancus_correo. Se agregó pasaporte y
-- dirección completa desagregada (antes solo existía pais_residencia).

-- compras: cada compra/paquete de un miembro
compras (id, persona_id, persona_nombre, persona_telegram, paquete,
  lider, es_mi_equipo, participaciones, hash, voucher_url,
  vouchers jsonb[], estado, aprobado_por, reporte_miembro,
  condicion_especial, mensajes_admin jsonb[], creada_por, creada_por_rol, ...)

-- solicitudes_compra: cuando un miembro pide agregar una compra que le falta
solicitudes_compra (id, persona_id, persona_nombre, persona_telegram,
  paquete, lider, participaciones, hash, voucher_url, estado,
  revisado_por, revisado_en, ...)

-- compra_hashes: hashes/TxIDs adicionales por compra (más de uno)
compra_hashes (id, compra_id, hash, creado_por, creado_en)

-- usuarios: verificadoras y superadmin
usuarios (id, nombre, usuario, password_hash, rol, paquetes_asignados array)

-- logs: historial de acciones (quién hizo qué)
logs (id, usuario, rol, accion, target_id, detalle, fecha)

-- mensajes_equipo: chat interno del equipo (con destinatario opcional para privados)
mensajes_equipo (id, autor, rol, texto, destinatario, leido_por text[], creado_en)

-- mensajes_telegram: conversaciones de soporte con miembros vía bot
mensajes_telegram (id, persona_id, persona_nombre, persona_telegram,
  paquete, mensajes jsonb, resuelto, estado_conversacion, asunto)

-- sesiones: tokens de sesión (miembro y admin)
sesiones (id, persona_id, usuario_id, rol, token, creada_en, expira_en)
```

**IMPORTANTE:** activar RLS en todas las tablas, pero con una política que permita todo
desde el backend (`FOR ALL USING (true) WITH CHECK (true)`), ya que la autenticación real
se maneja a nivel de aplicación con el `SERVICE_ROLE_KEY` (usar la key JWT clásica `eyJ...`,
no la nueva `sb_secret_`, para evitar problemas de compatibilidad).

## Funcionalidades del panel Admin

### Dashboard (`/admin`)
- Stats en tiempo real (sin caché): total personas, compras, pendientes, verificadas,
  rechazadas, errores.
- Botón manual de "Actualizar".
- Badge de notificación con contador de mensajes sin leer del chat de equipo.

### Compras (`/admin/compras`)
- Lista filtrable por persona/paquete/estado.
- Panel de detalle lateral con:
  - Editar paquete/líder/participaciones (líder solo editable por superadmin).
  - Ver/agregar múltiples comprobantes (array `vouchers`, cada uno con botón eliminar
    solo para superadmin).
  - Ver/editar hash principal + hashes adicionales (tabla `compra_hashes` con botón "+").
  - Aprobar/Rechazar (notifica por Telegram automáticamente).
  - Detección de posibles duplicados (mismo hash en otra compra).
  - Marcar "error reportado" como solucionado (vuelve a pendiente).
  - Mensajes al miembro (chat por compra, notifica por Telegram).
  - Pago de inversión interno (solo superadmin).
- Formulario "+ Nueva compra": buscar persona existente o crear nueva, elegir
  paquete/líder, subir comprobante, múltiples hashes.

### Solicitudes (`/admin/solicitudes`)
- Ver solicitudes de compras que hicieron los miembros desde el portal.
- Aprobar (verifica primero si la persona ya tiene ese paquete para evitar duplicar — si
  existe, actualiza en vez de crear) / Rechazar.
- Notifica por Telegram al aprobar/rechazar.
- Acceso: superadmin + verificadoras designadas, cada una puede estar limitada a ver
  solo cierto paquete.

### Mensajes del equipo (`/admin/mensajes-equipo`)
- Chat grupal con opción de mensaje privado a una persona específica (selector
  "Todo el equipo" o "Solo [nombre]").
- Marca mensajes como leídos automáticamente.
- No hacer scroll automático si el usuario está leyendo mensajes viejos (solo baja si
  está cerca del final).

### Personas (`/admin/personas`)
- CRUD de personas, búsqueda, ver compras asociadas.

### Mensajes Telegram (`/admin/mensajes`)
- Ver conversaciones de soporte de miembros con el bot, mostrar nombre + @telegram
  juntos.

### Otros
- Otros líderes / Mi equipo / Historial / Actividad — vistas de reportes y estadísticas
  por líder/verificadora.

### Exportación (agregado 2026-09-27)
- **Admin:** poder bajar un listado (personas, compras, o ambos combinados) en
  **Excel y/o PDF**.
- **Miembro:** poder bajar **su propio listado de paquetes en PDF** desde `/miembro`.

### Terminología (agregado 2026-09-27)
- **"Líder" → "Colaboradora en registrar compra"** en toda la UI (selector en
  formularios, filtros, textos). El campo técnico en Supabase se mantiene como `lider`
  por ahora — solo cambia la etiqueta visible — salvo que se pida renombrar la columna.

### Pendiente / a futuro (agregado 2026-09-27, actualizado)
- Se sacó el botón "Ingresar con Telegram" del login (era redundante con el campo
  "Usuario o Telegram" y no hacía nada sin backend). Evaluar más adelante si sumar el
  **Telegram Login Widget** oficial (auth real vía Telegram, requiere registrar el bot
  en @BotFather + verificar hash en el backend) una vez que el bot esté construido.
- Sección para que los miembros suban **CIS y NDA** (documentos) — a definir más
  adelante, no bloquea el desarrollo actual.
- Posibles 2 packs adicionales (ver sección Packs/Precios).

### Legal / Privacidad (agregado 2026-09-27, actualizado)
- Disclaimer tipo RGPD: los datos personales se usan solo para verificar aportes, y la
  participación/aporte de datos es **voluntaria**.
- Ubicación:
  - Texto breve fijo en el **footer** de login/hero y del portal miembro.
  - Página `/privacidad` con el texto completo, enlazada desde el footer.
  - **Pantalla/modal de "Acepto" única, al entrar por primera vez** al portal de
    miembro (no antes de cada formulario individual — un solo gate cubre todo).
    Botón "Acepto y continúo"; se guarda `acepto_disclaimer_en` (timestamp) en
    `personas` y no se vuelve a mostrar. Texto:
    > Antes de continuar, confirmá que:
    > - Tus datos personales se tratan de forma confidencial y se usan para
    >   verificar tu aporte y para contactarte.
    > - Tu aporte es completamente voluntario.
    > - Vas a recibir lo ofrecido a cambio en el momento en que el proyecto reciba
    >   sus propios recursos.

## Funcionalidades del portal Miembro (`/miembro`)
- Login con Telegram + DNI (o contraseña si la cambiaron).
- Recuperación de contraseña vía código enviado por Telegram (con expiración de 15 min).
- Ver mis paquetes: tarjetas expandibles con botón "Ver ↓"/"Cerrar ↑", info de
  comprobantes múltiples, hash con opción de agregar más (botón "+").
- Subir múltiples comprobantes (uno por uno, con botón "+ Agregar otro archivo", NO
  input `multiple` porque confunde a usuarios que no saben seleccionar varios).
- Sección "📦 Tengo compras sin registrar" — formulario de solicitud con selector de
  paquete (+ opción "otro" para escribir), selector de líder (sin "Tony" ni "Otro" si
  se quieren reservar esas opciones), campo de comentario libre, hash y comprobante.
- Sección "📋 Mis solicitudes" — ver estado (pendiente/aprobada/rechazada) de todas sus
  solicitudes.
- Sección "Solicitudes pendientes de comprobante" — si envió sin archivo, puede
  completarlo después.
- Editar datos personales (click para editar inline), incluyendo poder BORRAR campos
  sensibles (dejarlos vacíos).
- Reportar error en una compra (cambia estado a "error_reportado").

## Bot de Telegram
- `/start` — bienvenida.
- "📦 Mis paquetes" — lista sus compras (solo `es_mi_equipo = true`).
- "📋 Mis solicitudes" — estado de sus solicitudes.
- Notificaciones automáticas: aprobación/rechazo de compra, solicitud aprobada/rechazada,
  pedido de comprobante, mensaje del equipo, código de recuperación de contraseña.
- Guardar `telegram_chat_id` la primera vez que interactúa (necesario para poder
  enviarle mensajes push).

## Bugs importantes a evitar (aprendidos "a las patadas")
1. NUNCA enviar string vacío `''` a un campo timestamp en Postgres — usar `null`. Esto
   causa un 500/404 silencioso muy difícil de debuggear.
2. IDs de persona determinísticos por hash del telegram (no random) para evitar
   duplicados al crear personas: `sha1('personas:' + telegram.toLowerCase())`.
3. Antes de crear una compra desde una solicitud aprobada, verificar si la persona ya
   tiene ese paquete — si sí, actualizar esa compra en vez de crear una nueva duplicada.
4. Middleware de autenticación por `x-session-token` en TODAS las rutas `/api/*` excepto
   `/api/auth`, `/api/telegram` y `/api/storage` (storage puede ser público porque sube a
   un bucket también público).
5. Al hacer `.update().select().single()` en Supabase, si por timing no devuelve fila,
   hacer un SELECT de fallback en vez de fallar con 404.
6. Loguear el rol REAL del usuario que hace una acción (no hardcodear "superadmin" en
   los logs).
7. Reducir la frecuencia de polling en chats (cada 20-30s, no cada 5-10s) y usar un `Set`
   en un `useRef` para no re-marcar como leídos los mismos mensajes repetidamente — evita
   saturar la conexión.
8. Verificar antes de eliminar una "persona" duplicada si tiene registros vinculados en
   `mensajes_telegram` y `solicitudes_compra` (foreign keys) — hay que actualizar esas
   referencias antes de poder borrar.

## Diseño visual
- Paleta:
  - Fondo lavanda claro: `#EEE8FF`
  - Acentos morados: `#7F77DD` / `#3C3489`
  - Verde (aprobado): `#3B6D11` / `#EAF3DE`
  - Rojo (error): `#A32D2D` / `#FCEBEB`
  - Naranja (pendiente): `#854F0B` / `#FAEEDA`
- Botones de acción importantes en color distintivo y tamaño generoso (evitar textos
  pequeños de 11px para acciones frecuentes como "Ver comprobante").
- Mobile-first, ya que la mayoría de miembros entran desde el celular.

<!-- El usuario va a agregar una referencia visual (screenshot/enlace de un portal ya
     hecho) en un mensaje/sesión posterior. El visual en sí no importa tanto como la
     estructura de arriba, según indicó el usuario. -->

## Referencia visual

> Nota: la paleta de esta sección es SOLO para la identidad visual del login/landing
> (marca "Resonancia Global"). La paleta de estados (verde/rojo/naranja) de la sección
> "Diseño visual" arriba se mantiene sin cambios para el panel admin/miembro — son dos
> sistemas de color distintos, no hay que fusionarlos.

**Imagen de referencia:** mockup de login generado con IA (estilo "Círculo Sagrado"),
pegado directamente en el chat — no se pudo guardar el archivo binario en esta carpeta
porque las imágenes pegadas en el chat no exponen una ruta de archivo a las herramientas.
Si se quiere conservar el archivo, el usuario puede guardarlo manualmente (por ejemplo en
`docs/assets/login-reference-circulo-sagrado.png`) y avisar la ruta.

**Cambios de marca respecto a la imagen original:**
- "CÍRCULO SAGRADO" → **"RESONANCIA GLOBAL"** (nombre + símbolo circular propio, no
  copiar el logo de la referencia).
- Algunos textos del mock se van a ajustar (pendiente de definir cuáles exactamente).
- El login debe incluir un **link/entrada separada para el equipo de verificación**
  (acceso admin/verificadoras), distinto del login de miembro.

### Dirección visual
Traducir el lenguaje visual de la imagen a una interfaz web real, funcional y
responsive — **no** copiar la imagen literalmente ni convertir el sitio en una
ilustración.

Debe sentirse: **luminoso, etéreo, elegante, profundo, confiable, humano, moderno.**

Evitar explícitamente:
- Dashboard SaaS genérico
- Fondo plano
- Tarjetas blancas simples sobre fondo lavanda
- Estética bancaria
- Estética gamer
- Exceso de elementos espirituales/new age

### Fondo atmosférico (no color sólido)
Capas, de atrás hacia adelante:
1. Base marfil cálida
2. Degradado radial azul agua
3. Halo lavanda/violeta
4. Iluminación blanca difusa
5. Puntos de luz de muy baja opacidad
6. Formas circulares grandes y desenfocadas
7. Líneas orbitales muy finas

Desktop: composición más rica. Mobile: menos elementos, misma atmósfera.

### Órbitas y círculos
Líneas finas, elegantes, baja opacidad, rodeando el panel principal. Deben sugerir
conexión / protección / integridad / verificación — no gráficos científicos. Algunos
puntos de luz sobre las órbitas.

### Luz central
Punto de luz suave detrás del panel principal (`radial-gradient` + `blur` + `box-shadow`
o pseudo-elementos). Luz cálida y natural — **no** glow de neón.

### Panel de login (protagonista)
- Centrado, ligeramente elevado sobre el fondo.
- Glassmorphism muy sutil: fondo blanco/marfil translúcido, `backdrop-filter: blur()`,
  borde blanco semitransparente, sombra amplia y suave, `border-radius` elegante,
  iluminación alrededor.
- Debe sentirse como cristal iluminado — **no** completamente transparente, excelente
  legibilidad.

### Logo / identidad
Símbolo circular arriba del panel → **RESONANCIA GLOBAL** → subtítulo pequeño
**PORTAL DE VERIFICACIÓN**. Tratamiento elegante y sobrio, dorado permitido en el
símbolo, logo no gigante.

### Frases inspiradoras rotativas (agregado 2026-09-27)
El título editorial del hero debe rotar entre varias frases inspiradoras (no una fija) —
transición suave, sin ser llamativa. Frases exactas: pendientes de definir por el
usuario.

### Título editorial
Frase emocional/humana en varias líneas (ej. tono de "La verificación también es una
forma de cuidado."), con una palabra en tratamiento lavanda/violeta diferenciado.
Tipografía con presencia editorial, no decorativa en exceso.

### Formulario de login
- "Bienvenido" / "Iniciá sesión para acceder a tu cuenta"
- Campo: Usuario o Telegram
- Campo: Contraseña
- Opciones: Recordarme / ¿Olvidaste tu contraseña?
- Botón principal "Ingresar →" con degradado suave violeta → azul agua, iluminación tenue
- Botón secundario "Ingresar con Telegram"
- **Agregar:** link/entrada para equipo de verificación (admin/verificadoras)

### Elementos laterales (desktop)
Tres conceptos — Seguridad / Transparencia / Comunidad — cada uno con ícono circular +
halo pequeño + título + descripción breve. Deben integrarse con el fondo, no parecer
tarjetas de dashboard.

### Paleta (identidad visual del login/landing)
- `#FAF8F3` — marfil luminoso
- `#263A63` — azul profundo
- `#6FAFC2` — azul agua
- `#DCD8F2` — lavanda
- `#7568A8` — violeta
- `#17233D` — azul noche
- `#C7A968` — dorado suave (solo como acento, evitar grandes superficies violetas)

### Profundidad (crítico)
No debe verse plano. Lograr profundidad con: múltiples capas de fondo, gradientes
radiales, blur, transparencias, sombras suaves, iluminación ambiental, elementos
parcialmente desenfocados, distintas escalas, elementos delante/detrás del panel.

### Microinteracciones
Hover suave, pequeña iluminación en botones, entrada progresiva de elementos, halo
sutil al enfocar inputs, transiciones suaves al abrir/cerrar. Nada llamativo.

### Responsive
Mobile-first. En mobile: login sigue siendo protagonista, menos elementos laterales,
se mantienen halos/profundidad/identidad, fondo no interfiere con la lectura, botones
con tamaño cómodo para tocar.

### Restricciones técnicas
Next.js 14, App Router, TypeScript, React, **inline styles** (arquitectura actual del
proyecto) — CSS puro, gradients, pseudo-elements y estilos React para la atmósfera. No
agregar librería CSS.

### Regla más importante
No interpretar "minimalista" como "plano". **Minimalismo con profundidad.** La imagen de
referencia sirve para entender luz, atmósfera, profundidad, elegancia, composición,
transparencia, círculos y calidez — no para copiar el paisaje literal.

## Dirección de diseño: el paisaje se retira hacia adentro (agregado 2026-09-29)

Idea central (del usuario): el paisaje/atmósfera es protagonista en la puerta de
entrada y se va retirando a medida que el usuario entra más profundo al portal —
"inicio = naturaleza y amplitud → interior = claridad y verificación". Evita que
cada pantalla se sienta como la misma imagen de fondo pegada detrás de todo.

**Implementación: niveles de atmósfera reutilizables** (no diseñar cada pantalla
desde cero — definir 3-4 niveles como componente/token compartido y que cada
pantalla elija el suyo):
1. **Paisaje completo** — login/inicio de miembro. Protagonista total.
2. **Paisaje difuminado** — ej. "Mis compras": mismo universo, fondo mucho más
   limpio y desenfocado, el contenido manda.
3. **Luz tenue** — ej. "Detalle de compra": casi sin paisaje, solo una
   textura/luz muy sutil.
4. **Limpio** — ej. "Perfil/datos", "Mis solicitudes": fondo claro con halos y
   geometría, sin repetir las montañas/paisaje.

**Admin:** tratamiento "profesional y funcional" — misma paleta y luz, pequeños
elementos circulares como detalle, pero **sin** el paisaje completo (nivel más
bajo de la escala, `limpio`, con halos sutiles).

**Mobile-first, siempre** (la mayoría de los miembros entra desde el celular) —
los niveles más bajos ya implican menos capas/blur, lo cual además ayuda al
rendimiento en mobile.

**IMPORTANTE — no tocar:** `site/src/app/page.tsx` (la landing/login de
miembro con la tarjeta flotante sobre el paisaje/piedra) ya está terminada y
aprobada por el usuario — es la referencia del nivel "paisaje completo". No
rediseñar ni refactorizar esa pantalla al construir el sistema de niveles;
el resto de las pantallas se construyen nuevas usando esa como inspiración de
paleta/luz, no copiándole el paisaje.

### Pendiente
- El usuario puede traer código (generado por ChatGPT) en un próximo mensaje para
  incorporar como punto de partida.
- Textos exactos a cambiar del mock: por definir.
