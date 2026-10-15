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
    await enviarMensajeTelegram(
      String(chatId),
      `¡Hola ${persona.nombre}! 👋 Bienvenid@ a nuestro bot de verificaciones. Aquí recibirás las actualizaciones de verificación de tus paquetes, cuáles ya están en [resonanciaverificaciones.com](https://resonanciaverificaciones.com) — ingresá y completá tus datos faltantes. También es un medio de comunicación con el equipo de Resonancia: puede que te escribamos cuando necesitemos algo tuyo (por ejemplo, un comprobante).`,
      { removerTeclado: true, markdown: true }
    ).catch(() => null);
    await enviarMensajeTelegram(String(chatId), "Elegí alguna de las siguientes opciones:", { conMenu: true }).catch(() => null);
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

  await enviarMensajeTelegram(
    String(chatId),
    "Para comenzar, apretá /start 🙂"
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
        ? "No te encontramos registrado/a en el sistema de Resonancia. Podés sumarte vos mismo/a acá: [resonanciaverificaciones.com/unite](https://resonanciaverificaciones.com/unite). Si ya hiciste tu aporte y creés que es un error, contactá a tu colaboradora o escribile al equipo."
        : "No te encontramos registrado/a en el sistema de Resonancia, pero tu mensaje ya le llegó al equipo — te van a responder por aquí. Si querés, también podés sumarte directamente acá: [resonanciaverificaciones.com/unite](https://resonanciaverificaciones.com/unite)",
      { markdown: true }
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
    .select("paquete, estado, participaciones")
    .eq("persona_id", personaId)
    .eq("es_mi_equipo", true)
    .order("creada_en", { ascending: false });

  const texto =
    !compras || compras.length === 0
      ? "Todavía no tenés compras registradas."
      : "⚛️ Tus paquetes:\n\n" +
        compras
          .map((c) => {
            const participaciones = c.participaciones ? ` (${c.participaciones} participaciones)` : "";
            return `• ${c.paquete}${participaciones} — ${ESTADO_LABEL[c.estado] ?? c.estado}`;
          })
          .join("\n");

  await enviarMensajeTelegram(chatId, texto).catch(() => null);
}

async function responderMisSolicitudes(chatId: string, personaId: string) {
  const { data: solicitudes } = await supabaseAdmin
    .from("solicitudes_compra")
    .select("paquete, estado")
    .eq("persona_id", personaId)
    .order("creada_en", { ascending: false });

  const texto =
    !solicitudes || solicitudes.length === 0
      ? "Todavía no tenés solicitudes."
      : "🗳️ Tus solicitudes:\n\n" +
        solicitudes.map((s) => `• ${s.paquete} — ${ESTADO_SOLICITUD_LABEL[s.estado] ?? s.estado}`).join("\n");

  await enviarMensajeTelegram(chatId, texto).catch(() => null);
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
