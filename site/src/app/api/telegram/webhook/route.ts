import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { CATEGORIAS_ERROR, enviarMensajeTelegram, notificarEquipo, responderCallbackQuery } from "@/lib/telegram";

const MINUTOS_EXPIRACION_PENDIENTE = 10;

// Telegram reintenta el webhook si no responde 200 rápido, así que esta ruta
// siempre devuelve 200 (incluso ante errores internos) salvo que el secreto
// no coincida — eso es lo único que amerita rechazar la entrega.
export async function POST(req: NextRequest) {
  const secretEsperado = process.env.TELEGRAM_WEBHOOK_SECRET;
  const secretRecibido = req.headers.get("x-telegram-bot-api-secret-token");
  if (secretEsperado && secretRecibido !== secretEsperado) {
    return NextResponse.json({ error: "Secreto inválido." }, { status: 401 });
  }

  const update = await req.json().catch(() => null);

  // Tap en un botón de categoría de "Reportar un error" (teclado inline).
  const callbackQuery = update?.callback_query;
  if (callbackQuery) {
    return manejarCallbackQuery(callbackQuery);
  }

  const mensaje = update?.message;
  const username: string | undefined = mensaje?.from?.username;
  const chatId: number | undefined = mensaje?.chat?.id;

  if (!username || !chatId) {
    return NextResponse.json({ ok: true });
  }

  const { data: persona } = await supabaseAdmin
    .from("personas")
    .select("id, nombre, telegram_chat_id, bot_pendiente")
    .ilike("telegram", username)
    .maybeSingle();

  if (!persona) {
    return manejarMensajeDeUsuarioEquipo(username, chatId, mensaje?.text ?? "");
  }

  const yaRegistrado = persona.telegram_chat_id === String(chatId);

  if (!yaRegistrado) {
    await supabaseAdmin
      .from("personas")
      .update({ telegram_chat_id: String(chatId) })
      .eq("id", persona.id);
  }

  const textoRecibido: string = (mensaje?.text ?? "").trim();
  // Aceptamos CUALQUIER variante que empiece con "/start": el comando solo
  // ("/start"), con el nombre del bot pegado ("/start@NombreDelBot"), o con
  // un parámetro de deep-link ("/start algo" o "/start@NombreDelBot algo").
  const esComandoStart = textoRecibido.toLowerCase().startsWith("/start") || !yaRegistrado;

  if (esComandoStart) {
    // 1. Entregar mensajes pendientes que el admin haya enviado antes de que
    // el miembro iniciara el bot.
    await entregarMensajesPendientesDeCompras(String(chatId), persona.id);

    // 2. Mensaje de bienvenida con directiva de comunicación y botones
    const bienvenida =
      `¡Hola ${persona.nombre}! 👋\nTe damos la bienvenida al bot oficial de Resonancia.\n\n` +
      `Aquí recibirás las actualizaciones de verificación de tus paquetes y avisos del equipo. Podés ingresar al Portal en cualquier momento tocando el botón de abajo.\n\n` +
      `⚠️ CANAL DE COMUNICACIÓN IMPORTANTE: mantengamos todas las consultas y gestiones a través de este Bot o dentro del Portal oficial. De esta manera tus consultas quedan registradas en el sistema y podemos darte una respuesta mucho más rápida, clara y ordenada.\n\n` +
      `Gracias! 🙏`;

    await enviarMensajeTelegram(String(chatId), bienvenida, {
      conMenu: true,
      removerTeclado: true,
    }).catch(() => null);

    await enviarMensajeTelegram(
      String(chatId),
      "Elegí una opción para continuar:",
      { conMenu: true }
    ).catch(() => null);

    return NextResponse.json({ ok: true });
  }

  // ¿Esta persona eligió una categoría de error y ahora está mandando la
  // descripción? Lo chequeamos ANTES del mensaje genérico de abajo.
  const pendiente = persona.bot_pendiente as
    | { tipo: string; categoria_label: string; expira_en: string }
    | null;

  if (
    pendiente?.tipo === "reportar_error" &&
    new Date(pendiente.expira_en).getTime() > Date.now()
  ) {
    await supabaseAdmin.from("mensajes_telegram").insert({
      persona_id: persona.id,
      persona_nombre: persona.nombre,
      persona_telegram: username,
      asunto: pendiente.categoria_label,
      mensajes: [{ autor: "miembro", texto: textoRecibido, fecha: new Date().toISOString() }],
      resuelto: false,
      estado_conversacion: "abierta",
    });

    await supabaseAdmin.from("personas").update({ bot_pendiente: null }).eq("id", persona.id);

    await enviarMensajeTelegram(
      String(chatId),
      "🪶 Gracias, tu reporte ya le llegó al equipo. Te van a responder por aquí."
    ).catch(() => null);

    await notificarEquipo(
      `📍 ${pendiente.categoria_label} — reporte de ${persona.nombre}: "${textoRecibido}"`
    ).catch(() => null);

    return NextResponse.json({ ok: true });
  }

  // Si el miembro escribe un mensaje general por el bot (consulta, dudas, etc.):
  // Lo registramos en mensajes_telegram para que el equipo lo vea y responda en /admin/mensajes,
  // y avisamos al equipo por Telegram.
  const { data: convExistente } = await supabaseAdmin
    .from("mensajes_telegram")
    .select("id, mensajes")
    .eq("persona_id", persona.id)
    .eq("resuelto", false)
    .order("actualizado_en", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nuevoMensaje = { autor: "miembro", texto: textoRecibido, fecha: new Date().toISOString() };

  if (convExistente) {
    const actuales = Array.isArray(convExistente.mensajes) ? convExistente.mensajes : [];
    await supabaseAdmin
      .from("mensajes_telegram")
      .update({
        mensajes: [...actuales, nuevoMensaje],
        actualizado_en: new Date().toISOString(),
      })
      .eq("id", convExistente.id);
  } else {
    await supabaseAdmin.from("mensajes_telegram").insert({
      persona_id: persona.id,
      persona_nombre: persona.nombre,
      persona_telegram: username,
      asunto: "Consulta directa por bot",
      mensajes: [nuevoMensaje],
      resuelto: false,
      estado_conversacion: "abierta",
    });
  }

  await notificarEquipo(
    `💬 Mensaje de ${persona.nombre} (@${username}): "${textoRecibido}"`
  ).catch(() => null);

  await enviarMensajeTelegram(
    String(chatId),
    `🪶 Recibimos tu mensaje:\n"${textoRecibido}"\n\nYa le fue notificado al equipo de Resonancia y te responderán por aquí a la brevedad.\n\nPodés ingresar al portal en cualquier momento tocando el botón de abajo:`,
    { conMenu: true }
  ).catch(() => null);

  return NextResponse.json({ ok: true });
}

// Un username que no está en `personas` puede ser alguien del equipo
// (tabla `usuarios`) activando el bot para recibir avisos — o alguien
// que no está registrado en ningún lado todavía.
async function manejarMensajeDeUsuarioEquipo(username: string, chatId: number, texto: string) {
  const { data: usuario } = await supabaseAdmin
    .from("usuarios")
    .select("id, nombre, telegram_chat_id")
    .ilike("telegram", username)
    .maybeSingle();

  if (!usuario) {
    const textoLimpio = texto.trim();
    const esSoloComando = !textoLimpio || textoLimpio.toLowerCase().startsWith("/start");

    if (!esSoloComando) {
      const { data: existente } = await supabaseAdmin
        .from("mensajes_pendientes_registro")
        .select("id, mensajes")
        .eq("telegram_chat_id", String(chatId))
        .eq("estado_conversacion", "abierta")
        .order("creado_en", { ascending: false })
        .limit(1)
        .maybeSingle();

      const nuevoMensaje = { autor: "visitante", texto: textoLimpio, fecha: new Date().toISOString() };

      if (existente) {
        const actuales = Array.isArray(existente.mensajes) ? existente.mensajes : [];
        await supabaseAdmin
          .from("mensajes_pendientes_registro")
          .update({ mensajes: [...actuales, nuevoMensaje], actualizado_en: new Date().toISOString() })
          .eq("id", existente.id);
      } else {
        await supabaseAdmin.from("mensajes_pendientes_registro").insert({
          telegram: username,
          telegram_chat_id: String(chatId),
          mensajes: [nuevoMensaje],
        });
      }

      await notificarEquipo(`✨ Mensaje de alguien sin registrar (@${username}): "${textoLimpio}"`).catch(() => null);
    }

    await enviarMensajeTelegram(
      String(chatId),
      esSoloComando
        ? "No te encontramos registrado/a en el sistema de Resonancia.\n\n🌐 Podés sumarte en el portal oficial:\nhttps://resonanciaverificaciones.com/unite\n\nSi ya hiciste tu aporte y creés que es un error, por favor escribinos tu consulta por este mismo bot."
        : "No te encontramos registrado/a en el sistema de Resonancia, pero tu mensaje ya le llegó al equipo — te van a responder por aquí.\n\n🌐 También podés registrarte directamente en:\nhttps://resonanciaverificaciones.com/unite",
      {
        inlineKeyboard: [
          [{ texto: "🌐 Ir a Unirse / Registro", url: "https://resonanciaverificaciones.com/unite" }],
        ],
      }
    ).catch(() => null);
    return NextResponse.json({ ok: true });
  }

  const yaRegistrado = usuario.telegram_chat_id === String(chatId);

  if (!yaRegistrado) {
    await supabaseAdmin
      .from("usuarios")
      .update({ telegram_chat_id: String(chatId) })
      .eq("id", usuario.id);

    await enviarMensajeTelegram(
      String(chatId),
      `¡Hola ${usuario.nombre}! 👋 A partir de ahora vas a recibir por aquí los avisos del equipo de Resonancia (nuevas solicitudes, reportes de error y mensajes de ayuda).`
    ).catch(() => null);
  } else {
    await enviarMensajeTelegram(String(chatId), "Ya estás recibiendo los avisos del equipo acá 🙂").catch(() => null);
  }

  return NextResponse.json({ ok: true });
}

async function manejarCallbackQuery(callbackQuery: {
  id: string;
  data?: string;
  from?: { username?: string };
  message?: { chat?: { id?: number } };
}) {
  const clave = callbackQuery.data;
  const username = callbackQuery.from?.username;
  const chatId = callbackQuery.message?.chat?.id;

  await responderCallbackQuery(callbackQuery.id);

  if (!username || !chatId || !clave) {
    return NextResponse.json({ ok: true });
  }

  const { data: persona } = await supabaseAdmin
    .from("personas")
    .select("id, nombre")
    .ilike("telegram", username)
    .maybeSingle();

  if (!persona) {
    return NextResponse.json({ ok: true });
  }

  if (clave === "portal_verificacion") {
    await enviarMensajeTelegram(String(chatId), "🌐 Portal: https://resonanciaverificaciones.com", { conMenu: true }).catch(() => null);
    return NextResponse.json({ ok: true });
  }

  if (clave === "menu_paquetes") {
    await responderMisPaquetes(String(chatId), persona.id);
    return NextResponse.json({ ok: true });
  }

  if (clave === "menu_solicitudes") {
    await responderMisSolicitudes(String(chatId), persona.id);
    return NextResponse.json({ ok: true });
  }

  if (clave === "menu_reportar") {
    await enviarMensajeTelegram(String(chatId), "¿Qué tipo de problema tenés?", {
      inlineKeyboard: Object.entries(CATEGORIAS_ERROR).map(([c, texto]) => [{ texto, data: c }]),
    }).catch(() => null);
    return NextResponse.json({ ok: true });
  }

  const categoriaLabel = CATEGORIAS_ERROR[clave];
  if (!categoriaLabel) {
    return NextResponse.json({ ok: true });
  }

  const expiraEn = new Date(Date.now() + MINUTOS_EXPIRACION_PENDIENTE * 60 * 1000).toISOString();

  await supabaseAdmin
    .from("personas")
    .update({
      bot_pendiente: { tipo: "reportar_error", categoria_label: categoriaLabel, expira_en: expiraEn },
    })
    .eq("id", persona.id);

  await enviarMensajeTelegram(
    String(chatId),
    `${categoriaLabel}\n\nContanos qué pasó, con el mayor detalle posible.`
  ).catch(() => null);

  return NextResponse.json({ ok: true });
}

async function responderMisPaquetes(chatId: string, personaId: string) {
  const { data: compras } = await supabaseAdmin
    .from("compras")
    .select("paquete, estado, participaciones, mensajes_admin")
    .eq("persona_id", personaId)
    .eq("es_mi_equipo", true)
    .order("creada_en", { ascending: false });

  if (!compras || compras.length === 0) {
    await enviarMensajeTelegram(
      chatId,
      "Todavía no tenés paquetes o compras registradas.\n\n🌐 Podés ver más detalles en el portal:\nhttps://resonanciaverificaciones.com",
      { conMenu: true }
    ).catch(() => null);
    return;
  }

  const items = compras.map((c) => {
    const participaciones = c.participaciones ? ` (${c.participaciones} participaciones)` : "";
    const msgs = Array.isArray(c.mensajes_admin) ? c.mensajes_admin : [];
    const ultimoMsg = msgs.length > 0 ? `\n   💬 Mensaje del equipo: "${msgs[msgs.length - 1].texto}"` : "";
    return `• ${c.paquete}${participaciones} — ${ESTADO_LABEL[c.estado] ?? c.estado}${ultimoMsg}`;
  });

  const texto =
    "⚛️ Tus paquetes:\n\n" +
    items.join("\n\n") +
    "\n\n🌐 Ver comprobantes y detalles en el portal:\nhttps://resonanciaverificaciones.com";

  await enviarMensajeTelegram(chatId, texto, { conMenu: true }).catch(() => null);
}

async function responderMisSolicitudes(chatId: string, personaId: string) {
  const { data: solicitudes } = await supabaseAdmin
    .from("solicitudes_compra")
    .select("paquete, estado")
    .eq("persona_id", personaId)
    .order("creada_en", { ascending: false });

  const texto =
    !solicitudes || solicitudes.length === 0
      ? "Todavía no tenés solicitudes registradas.\n\n🌐 Si te falta registrar alguna compra, podés crear una solicitud en el portal:\nhttps://resonanciaverificaciones.com/miembro/solicitudes"
      : "🗳️ Tus solicitudes:\n\n" +
        solicitudes.map((s) => `• ${s.paquete} — ${ESTADO_SOLICITUD_LABEL[s.estado] ?? s.estado}`).join("\n") +
        "\n\n🌐 Gestionar solicitudes en el portal:\nhttps://resonanciaverificaciones.com/miembro/solicitudes";

  await enviarMensajeTelegram(chatId, texto, { conMenu: true }).catch(() => null);
}

// Revisa compras de la persona y entrega mensajes que el admin haya enviado
// antes de que la persona iniciara el bot con /start.
async function entregarMensajesPendientesDeCompras(chatId: string, personaId: string) {
  const { data: compras } = await supabaseAdmin
    .from("compras")
    .select("id, paquete, mensajes_admin")
    .eq("persona_id", personaId);

  if (!compras || compras.length === 0) return;

  for (const compra of compras) {
    const mensajes = Array.isArray(compra.mensajes_admin) ? compra.mensajes_admin : [];
    let hayPendientes = false;

    for (const m of mensajes) {
      if (m.entregado_telegram !== true) {
        const fecha = m.creado_en ? new Date(m.creado_en).toLocaleDateString("es-AR") : "";
        const fechaTexto = fecha ? ` (${fecha})` : "";
        const texto = `📨 Mensaje del equipo sobre tu compra "${compra.paquete}"${fechaTexto}:\n\n"${m.texto}"`;
        await enviarMensajeTelegram(chatId, texto).catch(() => null);
        m.entregado_telegram = true;
        hayPendientes = true;
      }
    }

    if (hayPendientes) {
      await supabaseAdmin
        .from("compras")
        .update({ mensajes_admin: mensajes })
        .eq("id", compra.id);
    }
  }
}

const ESTADO_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  verificada: "Verificada ✅",
  rechazada: "Rechazada ❌",
  error_reportado: "Con un error reportado",
};

const ESTADO_SOLICITUD_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  aprobada: "Aprobada ✅",
  rechazada: "Rechazada ❌",
};
