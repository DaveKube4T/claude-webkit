# Resonancia Portal de Verificación - Proyecto Específico

Este documento contiene las instrucciones específicas para trabajar en el proyecto Resonancia Portal de Verificación. Es un complemento al CLAUDE.md genérico de Web Builder.

## Visión General del Proyecto

Resonancia Portal de Verificación es una plataforma de gestión comunitaria con autenticación basada en Supabase, roles diferenciados (admin, miembro, público), y funcionalidades especializadas en planes de vida, perfiles financieros y gestión de solicitudes. Utiliza Next.js con App Router, TypeScript y Tailwind CSS.

## Características Técnicas Clave

### Migración de Anthropic a Groq

- **Shim en `src/lib/anthropic.ts`**: Implementa compatibilidad con la API de Groq en lugar de Anthropic
- **Variable de entorno**: `GROQ_API_KEY` (no `ANTHROPIC_API_KEY`)
- **ZDR activado**: Zero Data Retention para cumplimiento de privacidad
- Los 4 endpoints de IA utilizan este shim, NO importan `@anthropic-ai/sdk` directamente

### Migración de Supabase Auth Helpers a @supabase/ssr

- Migración completa desde `@supabase/auth-helpers-nextjs` hacia `@supabase/ssr`
- Archivos afectados:
  - `src/lib/supabase.ts` - Cliente admin
  - `src/lib/supabase/client.ts` - Cliente para browser
  - `src/lib/supabase/server.ts` - Cliente para server components
  - `src/middleware.ts` - Manejo de cookies async con `cookies()`
- El middleware原来的 (`middleware.ts.bak`) fue migrado al nuevo formato

## Arquitectura de IA

El proyecto contiene 4 endpoints de IA especializados:

- `/api/miembro/plan-de-vida/route.ts` - Generación y análisis de planes de vida
- `/api/miembro/plan-de-vida/resumen/route.ts` - Resumen de progreso
- `/api/miembro/perfil-financiero/chat/route.ts` - Chat financiero interactivo
- `/api/miembro/perfil-financiero/resumen/route.ts` - Resumen financiero

Características comunes:
- Usan el shim de Groq en `src/lib/anthropic.ts`
- Requieren autenticación de miembro
- Procesan datos sensibles con ZDR activado

## Flujo de Registro de Usuario

### Paso 1: Inicio en `/unite`
- Formulario de ingreso inicial con datos básicos
- Envío a `/api/publico/registro` que:
  - Crea usuario en Supabase Auth
  - Genera registro pendiente en tabla `personas`
  - Envía email de verificación

### Paso 2: Verificación de Email
- Usuario confirma mediante link enviado por email
- Sistema actualiza estado a `verificado_pendiente`

### Paso 3: Completado de Perfil en `/miembro/aceptar`
- Aceptación de términos y condiciones
- Completado de información de perfil obligatoria
- Configuración de preferencias iniciales
- Al completar, estado cambia a `activo` y se redirige al panel miembro

## Estructura de Roles y Permisos

### Definiciones de Roles (`src/lib/auth.ts`)
- `superadmin`: Acceso total al sistema
- `admin`: Gestión de miembros, contenido y configuraciones
- `verificador`: Revisión de solicitudes y documentos
- `miembro`: Usuario estándar con acceso a su panel personal

### Protección de Rutas
- **Público**: Accessible sin autenticación (`/`, `/privacidad`, `/api/publico/*`)
- **Miembro**: Requiere autenticación y rol `miembro` o superior (`/miembro/*`, `/api/miembro/*`)
- **Admin**: Requiere rol `admin` o `superadmin` (`/admin/*`, `/api/admin/*`)

### Manejo de Sesiones
- Sistema personalizado de tokens en tabla `sesiones`
- Tokens de 32 bytes hex almacenados en cookies
- TTL: 7 días (configurable vía `SESSION_TTL_HORAS` en `src/lib/auth.ts`)
- Verificación mediante función `verificarSesion()`

## Datos Sensibles y ZDR

### Designación de Datos Sensibles
Los siguientes datos están marcados como sensibles y sujetos a Zero Data Retention:
- **Planes de Vida**: Objetivos personales, aspiraciones, evaluaciones periódicas
- **Perfiles Financieros**: Información de ingresos, gastos, inversiones, metas económicas
- **Datos de Salud y Bienestar**: Información relacionada con estado físico y mental
- **Historial de Solicitudes**: Detalles de peticiones de apoyo o recursos

### Implementación de ZDR
- Todos los endpoints que manejan estos datos usan el shim de Groq con ZDR activado
- Los resultados de procesamiento de IA no se almacenan permanentemente
- Las tablas tienen políticas de eliminación automática configuradas en Supabase

## Estructura de Rutas

### Páginas Principales
```
/ → Landing page pública
/unite → Registro inicial
/miembro → Panel principal miembro
/admin → Panel administración
/privacidad → Política de privacidad

// Rutas miembro
/miembro/perfil → Edición de perfil
/miembro/aceptar → Flujo de aceptación post-registro
/miembro/contacto → Formulario de contacto
/miembro/solicitudes → Gestión de solicitudes personales
/miembro/plan-de-vida → Planificación de vida
/miembro/perfil-financiero → Gestión financiera

// Rutas admin
/admin/personas → Gestión de usuarios
/admin/compras → Gestión de transacciones
/admin/solicitudes → Gestión global de solicitudes
/admin/colaboradoras → Gestión de voluntarios
/admin/historial → Registro de actividades
```

### Endpoints de API
**Autenticación:**
- `/api/auth/login` - Login estándar
- `/api/auth/member-login/*` - Flujo OTP para miembros
- `/api/auth/me` - Datos de sesión actual
- `/api/auth/logout` - Cierre de sesión

**Registro Público:**
- `/api/publico/registro` - Creación de nuevos usuarios
- `/api/publico/opciones` - Configuración de registro

**Miembro:**
- `/api/miembro/compras` - Transacciones del miembro
- `/api/miembro/perfil` - Gestión de perfil
- `/api/miembro/solicitudes` - Solicitudes personales
- `/api/miembro/plan-de-vida` - Planes de vida (IA)
- `/api/miembro/perfil-financiero` - Información financiera (IA)
- `/api/miembro/mensajes` - Bandeja de entrada

**Admin:**
- `/api/admin/*` - Gestión global del sistema

## Dependencias Clave

- `@supabase/ssr` - Manejo de sesiones y cookies en Edge Runtime
- `@supabase/supabase-js` - Cliente Supabase para operaciones de BD
- `resend` - Envío de emails transaccionales
- `three` + `@types/three` - Visualizaciones 3D
- `motion` - Animaciones de interfaz
- `lucide-react` - Iconos
- `bcryptjs` - Hashing de contraseñas

## Variables de Entorno Críticas

- `NEXT_PUBLIC_SUPABASE_URL` - URL del proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Clave anónima pública
- `SUPABASE_SERVICE_ROLE_KEY` - Clave de servicio para operaciones admin
- `GROQ_API_KEY` - Clave de API de Groq (reemplaza Anthropic)
- `RESEND_API_KEY` - Clave de API de Resend para emails
- `TELEGRAM_BOT_TOKEN` - Token del bot de Telegram
- `TELEGRAM_CHAT_ID` - Chat ID para notificaciones

## Guidelines de Desarrollo

### Código y Estilo
- **Nunca modificar archivos `.bak`** - son backups de seguridad
- **Usar shim de Groq**: Importar desde `src/lib/anthropic.ts` para operaciones de IA
- **Validación de inputs**: Todos los endpoints deben validar datos de entrada
- **Tailwind 4**: Modificar valores en `:root` / `.dark` de `globals.css`, no usar tailwind.config.ts

### Trabajo con Datos Sensibles
- **ZDR siempre activado** para endpoints de planes de vida y perfil financiero
- **Nunca loggear datos sensibles**
- **Limitar exposición de datos**: Solo devolver campos necesarios

### Componentes
- Usar shadcn/ui con flags: `npx shadcn@latest add [component] -y -b radix -p nova`
- Usar exclusivamente Lucide React para iconos

## Notas de Mantenimiento

- El middleware actual está en `src/middleware.ts` (no el `.bak`)
- Ejecutar `npm run build` antes de considerar cambios listos para producción
- Los planes de vida y perfiles financieros requieren revisión especial debido a ZDR

Este CLAUDE.md es la fuente de verdad para el desarrollo de este proyecto.