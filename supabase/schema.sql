-- Esquema inicial del Portal de Verificación de Resonancia Global
-- Ejecutar una sola vez en Supabase → SQL Editor → New query → pegar todo → Run

create extension if not exists pgcrypto;

-- ============================================================
-- personas: datos de cada miembro
-- ============================================================
create table if not exists personas (
  id text primary key, -- sha1('personas:' + telegram.toLowerCase())
  nombre text not null,
  apellidos text,
  telegram text not null unique,
  documento text,
  pasaporte text,
  password_hash text,
  telegram_chat_id text,
  signal text,
  wallet_trc20 text,
  calle text,
  numero text,
  ciudad text,
  provincia_estado text,
  pais text,
  zip_code text,
  telefono text,
  telefono_alternativo text,
  mail text,
  mail_alternativo text,
  codigo_recuperacion text,
  codigo_recuperacion_exp timestamptz,
  acepto_disclaimer_en timestamptz,
  destacado boolean not null default false,
  nota_destacado text,
  bot_pendiente jsonb,
  creada_en timestamptz not null default now()
);

-- ============================================================
-- compras: cada compra/aporte de un miembro
-- ============================================================
create table if not exists compras (
  id uuid primary key default gen_random_uuid(),
  persona_id text not null references personas(id) on delete cascade,
  persona_nombre text,
  persona_telegram text,
  paquete text not null,
  lider text,
  es_mi_equipo boolean not null default true,
  participaciones integer,
  hash text,
  voucher_url text,
  vouchers jsonb not null default '[]',
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'verificada', 'rechazada', 'error_reportado')),
  aprobado_por text,
  reporte_miembro text,
  condicion_especial text,
  nota_miembro text,
  mensajes_admin jsonb not null default '[]',
  posible_duplicado boolean not null default false,
  pago_inversion jsonb not null default '[]',
  comprobante_solicitado_en timestamptz,
  creada_por text,
  creada_por_rol text,
  creada_en timestamptz not null default now(),
  actualizada_en timestamptz not null default now()
);

create index if not exists idx_compras_persona_id on compras(persona_id);
create index if not exists idx_compras_estado on compras(estado);
create index if not exists idx_compras_hash on compras(hash);

-- ============================================================
-- solicitudes_compra: cuando un miembro pide agregar una compra que le falta
-- ============================================================
create table if not exists solicitudes_compra (
  id uuid primary key default gen_random_uuid(),
  persona_id text not null references personas(id) on delete cascade,
  persona_nombre text,
  persona_telegram text,
  paquete text not null,
  lider text,
  participaciones integer,
  hash text,
  voucher_url text,
  comentario text,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'aprobada', 'rechazada')),
  revisado_por text,
  revisado_en timestamptz,
  creada_en timestamptz not null default now()
);

create index if not exists idx_solicitudes_persona_id on solicitudes_compra(persona_id);
create index if not exists idx_solicitudes_estado on solicitudes_compra(estado);

-- ============================================================
-- compra_hashes: hashes/TxIDs adicionales por compra
-- ============================================================
create table if not exists compra_hashes (
  id uuid primary key default gen_random_uuid(),
  compra_id uuid not null references compras(id) on delete cascade,
  hash text not null,
  creado_por text,
  creado_en timestamptz not null default now()
);

create index if not exists idx_compra_hashes_compra_id on compra_hashes(compra_id);

-- ============================================================
-- usuarios: verificadoras, admin y superadmin
-- ============================================================
create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  usuario text not null unique,
  password_hash text not null,
  rol text not null check (rol in ('superadmin', 'admin', 'verificador')),
  paquetes_asignados text[] not null default '{}',
  telegram text,
  telegram_chat_id text,
  recibe_avisos boolean not null default false,
  creado_en timestamptz not null default now()
);

-- ============================================================
-- logs: historial de acciones
-- ============================================================
create table if not exists logs (
  id uuid primary key default gen_random_uuid(),
  usuario text,
  rol text,
  accion text not null,
  target_id text,
  detalle text,
  fecha timestamptz not null default now()
);

create index if not exists idx_logs_fecha on logs(fecha desc);

-- ============================================================
-- mensajes_equipo: chat interno del equipo
-- ============================================================
create table if not exists mensajes_equipo (
  id uuid primary key default gen_random_uuid(),
  autor text not null,
  rol text not null,
  texto text not null,
  destinatario text, -- null = todo el equipo
  leido_por text[] not null default '{}',
  creado_en timestamptz not null default now()
);

create index if not exists idx_mensajes_equipo_creado_en on mensajes_equipo(creado_en desc);

-- ============================================================
-- mensajes_telegram: conversaciones de soporte vía bot
-- ============================================================
create table if not exists mensajes_telegram (
  id uuid primary key default gen_random_uuid(),
  persona_id text not null references personas(id) on delete cascade,
  persona_nombre text,
  persona_telegram text,
  paquete text,
  mensajes jsonb not null default '[]',
  resuelto boolean not null default false,
  estado_conversacion text not null default 'abierta',
  asunto text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists idx_mensajes_telegram_persona_id on mensajes_telegram(persona_id);

-- ============================================================
-- mensajes_pendientes_registro: gente que escribe al bot y todavía
-- no está registrada (no hay persona_id para colgarlo de mensajes_telegram)
-- ============================================================
create table if not exists mensajes_pendientes_registro (
  id uuid primary key default gen_random_uuid(),
  telegram text not null,
  telegram_chat_id text not null,
  mensajes jsonb not null default '[]',
  resuelto boolean not null default false,
  estado_conversacion text not null default 'abierta',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists idx_mensajes_pendientes_registro_telegram on mensajes_pendientes_registro(telegram);

-- ============================================================
-- mensajes_pendientes_registro_compra: mensajes guardados vía admin
-- sobre compras del miembro mientras todavía no activó el bot
-- (/start). Se entregará cuando el miembro active el bot.
-- ============================================================
create table if not exists mensajes_pendientes_registro_compra (
  id uuid primary key default gen_random_uuid(),
  persona_telegram text not null,
  persona_id text references personas(id) on delete set null,
  compra_id uuid references compras(id) on delete set null,
  compra_paquete text,
  mensaje jsonb not null default '[]',
  estado text not null default 'pendiente', -- pendiente|enviado
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists idx_mensajes_pendientes_registro_compra_persona_telegram on mensajes_pendientes_registro_compra(persona_telegram);
create index if not exists idx_mensajes_pendientes_registro_compra_persona_id on mensajes_pendientes_registro_compra(persona_id);
create index if not exists idx_mensajes_pendientes_registro_compra_compra_id on mensajes_pendientes_registro_compra(compra_id);
create index if not exists idx_mensajes_pendientes_registro_compra_estado on mensajes_pendientes_registro_compra(estado);

-- ============================================================
-- sesiones: tokens de sesión (miembro y admin)
-- ============================================================
create table if not exists sesiones (
  id uuid primary key default gen_random_uuid(),
  persona_id text references personas(id) on delete cascade,
  usuario_id uuid references usuarios(id) on delete cascade,
  rol text not null,
  token text not null unique,
  creada_en timestamptz not null default now(),
  expira_en timestamptz not null
);

create index if not exists idx_sesiones_token on sesiones(token);

-- ============================================================
-- planes_vida: respuestas del Plan de Vida (sección narrativa) de cada
-- miembro, una fila por persona, se va llenando por secciones
-- ============================================================
create table if not exists planes_vida (
  id uuid primary key default gen_random_uuid(),
  persona_id text not null unique references personas(id) on delete cascade,
  proposito_valores jsonb,
  vision_fases jsonb,
  familia jsonb,
  amigos jsonb,
  donaciones jsonb,
  empresas jsonb,
  estilo_vida jsonb,
  legado jsonb,
  resumenes jsonb not null default '{}'::jsonb,
  completado boolean not null default false,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists idx_planes_vida_persona_id on planes_vida(persona_id);

-- ============================================================
-- perfiles_financieros: respuestas del Perfil Financiero (estructuras,
-- riesgo, bolsillos, liberación progresiva) de cada miembro
-- ============================================================
create table if not exists perfiles_financieros (
  id uuid primary key default gen_random_uuid(),
  persona_id text not null unique references personas(id) on delete cascade,
  punto_partida jsonb,
  perfil_riesgo jsonb,
  bolsillos jsonb,
  proteccion jsonb,
  estructuras jsonb,
  liberacion_progresiva jsonb,
  presupuesto jsonb,
  resumenes jsonb not null default '{}'::jsonb,
  completado boolean not null default false,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists idx_perfiles_financieros_persona_id on perfiles_financieros(persona_id);

-- ============================================================
-- uso_ia_diario: contador de mensajes a Claude por persona y día,
-- para limitar abuso/costo en los chats de Plan de Vida y Perfil Financiero
-- ============================================================
create table if not exists uso_ia_diario (
  persona_id text not null references personas(id) on delete cascade,
  fecha date not null,
  mensajes integer not null default 0,
  primary key (persona_id, fecha)
);

-- ============================================================
-- RLS: activada en todas las tablas. El acceso real se controla en el
-- backend con la SERVICE_ROLE_KEY (que siempre puede pasar por alto RLS),
-- estas políticas son una capa extra por si alguna vez se usa una key
-- pública contra estas tablas.
-- ============================================================
alter table personas enable row level security;
alter table compras enable row level security;
alter table solicitudes_compra enable row level security;
alter table compra_hashes enable row level security;
alter table usuarios enable row level security;
alter table logs enable row level security;
alter table mensajes_equipo enable row level security;
alter table mensajes_telegram enable row level security;
alter table sesiones enable row level security;
alter table planes_vida enable row level security;
alter table perfiles_financieros enable row level security;
alter table uso_ia_diario enable row level security;

drop policy if exists "backend_full_access" on personas;
create policy "backend_full_access" on personas for all using (true) with check (true);

drop policy if exists "backend_full_access" on compras;
create policy "backend_full_access" on compras for all using (true) with check (true);

drop policy if exists "backend_full_access" on solicitudes_compra;
create policy "backend_full_access" on solicitudes_compra for all using (true) with check (true);

drop policy if exists "backend_full_access" on compra_hashes;
create policy "backend_full_access" on compra_hashes for all using (true) with check (true);

drop policy if exists "backend_full_access" on usuarios;
create policy "backend_full_access" on usuarios for all using (true) with check (true);

drop policy if exists "backend_full_access" on logs;
create policy "backend_full_access" on logs for all using (true) with check (true);

drop policy if exists "backend_full_access" on mensajes_equipo;
create policy "backend_full_access" on mensajes_equipo for all using (true) with check (true);

drop policy if exists "backend_full_access" on mensajes_telegram;
create policy "backend_full_access" on mensajes_telegram for all using (true) with check (true);

drop policy if exists "backend_full_access" on sesiones;
create policy "backend_full_access" on sesiones for all using (true) with check (true);

drop policy if exists "backend_full_access" on planes_vida;
create policy "backend_full_access" on planes_vida for all using (true) with check (true);

drop policy if exists "backend_full_access" on perfiles_financieros;
create policy "backend_full_access" on perfiles_financieros for all using (true) with check (true);

drop policy if exists "backend_full_access" on uso_ia_diario;
create policy "backend_full_access" on uso_ia_diario for all using (true) with check (true);
