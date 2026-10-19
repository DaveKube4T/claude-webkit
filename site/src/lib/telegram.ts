import { supabaseAdmin } from "./supabase";

const TELEGRAM_API = "https://api.telegram.org";

function botToken() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("Falta TELEGRAM_BOT_TOKEN en .env.local");
  return token;
}

export type BotonTelegram = { texto: string; data?: string; url?: string };

// Menú principal como botones INLINE (pegados debajo del mensaje) — a
// diferencia del teclado de respuesta clásico, estos se ven siempre sin que
// el usuario tenga que tocar ningún ícono extra.
export const MENU_PRINCIPAL: BotonTelegram[][] = [
  [{ texto: "🌐 Abrir Portal de Verificación", url: "https://resonanciaverificaciones.com" }],
  [{ texto: "⚛️ Mis paquetes", data: "menu_paquetes" }],
  [{ texto: "🗳️ Mis solicitudes", data: "menu_solicitudes" }],
  [{ texto: "📍 Reportar un error", data: "menu_reportar" }],
];

// Categorías del "Reportar un error" — texto visible (con su emoji) y una
// clave corta sin espacios para el callback_data del botón.
export const CATEGORIAS_ERROR: Record<string, string> = {
  err_comprobante: "🧐 No me reconoce el comprobante",
  err_hash: "🖱️ El hash/referencia está mal",
  err_monto: "💵 El monto no coincide",
  err_paquete: "💎 Elegí el paquete equivocado",
  err_otro: "📞 Otro problema",
};

export async function enviarMensajeTelegram(
  chatId: string,
  texto: string,
  opciones?: {
    conMenu?: boolean;
    inlineKeyboard?: BotonTelegram[][];
    removerTeclado?: boolean;
    markdown?: boolean;
    html?: boolean;
  }
) {
  const filas = opciones?.conMenu ? MENU_PRINCIPAL : opciones?.inlineKeyboard;
  const replyMarkup = opciones?.removerTeclado
    ? { remove_keyboard: true }
    : filas
    ? {
        reply_keyboard: filas.map((fila) =>
          fila.map((b) => ({ text: b.texto }))
        ),
        resize_keyboard: true,
      }
    : undefined;

  const parseMode = opciones?.html ? "HTML" : opciones?.markdown ? "Markdown" : undefined;

  const res = await fetch(`${TELEGRAM_API}/bot${botToken()}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: texto,
      reply_markup: replyMarkup,
      parse_mode: parseMode,
    }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.ok) {
    throw new Error(data?.description ?? "No se pudo enviar el mensaje por Telegram.");
  }

  return data;
}

// Le dice a Telegram "ya procesamos el tap" para que el botón deje de tildar
// el ícono de carga. Best-effort, no rompe nada si falla.
export async function responderCallbackQuery(callbackQueryId: string) {
  await fetch(`${TELEGRAM_API}/bot${botToken()}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId }),
  }).catch(() => null);
}

// Notificación "best effort": si la persona no tiene chat_id todavía, o si el
// envío falla por cualquier motivo, no rompe la acción principal (aprobar,
// rechazar, etc.) — solo registra el intento en consola.
// Devuelve true si se envió con éxito, false si no.
export async function notificarPersona(personaId: string, texto: string): Promise<boolean> {
  const { data: persona } = await supabaseAdmin
    .from("personas")
    .select("telegram_chat_id")
    .eq("id", personaId)
    .maybeSingle();

  if (!persona?.telegram_chat_id) return false;

  try {
    await enviarMensajeTelegram(persona.telegram_chat_id, texto);
    return true;
  } catch (err) {
    console.error("No se pudo notificar por Telegram a", personaId, err);
    return false;
  }
}

// Avisa a todo el equipo marcado con `recibe_avisos=true` que tenga su
// chat_id activado. Best-effort igual que notificarPersona: nunca rompe la
// acción principal (crear solicitud, reportar error, mandar mensaje).
export async function notificarEquipo(texto: string) {
  const { data: equipo } = await supabaseAdmin
    .from("usuarios")
    .select("telegram_chat_id")
    .eq("recibe_avisos", true)
    .not("telegram_chat_id", "is", null);

  if (!equipo?.length) return;

  await Promise.all(
    equipo.map((u) =>
      enviarMensajeTelegram(u.telegram_chat_id as string, texto).catch((err) =>
        console.error("No se pudo notificar al equipo por Telegram", err)
      )
    )
  );
}
