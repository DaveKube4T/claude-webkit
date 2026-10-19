import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/require-session";
import { notificarPersona } from "@/lib/telegram";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { sesion, respuesta } = await requireSession(req, [
    "superadmin",
    "admin",
    "verificador",
  ]);
  if (!sesion) return respuesta;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const texto = typeof body?.texto === "string" ? body.texto.trim() : "";
  if (!texto) return NextResponse.json({ error: "El mensaje no puede estar vacío." }, { status: 400 });

  const { data: compra } = await supabaseAdmin
    .from("compras")
    .select("mensajes_admin, persona_id, paquete")
    .eq("id", id)
    .maybeSingle();

  if (!compra) return NextResponse.json({ error: "Compra no encontrada." }, { status: 404 });

  const { data: usuarioFila } = await supabaseAdmin
    .from("usuarios")
    .select("nombre")
    .eq("id", sesion.usuarioId)
    .maybeSingle();

  // Intentamos notificar por Telegram. Si la persona tiene chat_id activado,
  // se le envía en el momento. Si no, notificarPersona devuelve false y el
  // mensaje queda registrado con entregado_telegram=false para entregárselo
  // en cuanto escriba /start al bot.
  const entregadoTelegram = await notificarPersona(
    compra.persona_id,
    `🪶 Nuevo mensaje del equipo sobre tu compra "${compra.paquete}":\n\n${texto}`
  ).catch(() => false);

  const mensajes = Array.isArray(compra.mensajes_admin) ? compra.mensajes_admin : [];
  mensajes.push({
    autor_nombre: usuarioFila?.nombre ?? "Equipo",
    rol: sesion.rol,
    texto,
    creado_en: new Date().toISOString(),
    entregado_telegram: entregadoTelegram,
  });

  const { error } = await supabaseAdmin
    .from("compras")
    .update({ mensajes_admin: mensajes, actualizada_en: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from("logs").insert({
    usuario: sesion.usuarioId,
    rol: sesion.rol,
    accion: "mensaje_al_miembro",
    target_id: id,
    detalle: texto,
  });

  return NextResponse.json({
    ok: true,
    entregado_telegram: entregadoTelegram,
    aviso: entregadoTelegram
      ? undefined
      : "El mensaje quedó guardado en el portal. Como el miembro todavía no activó el bot (/start), se le enviará a su Telegram automáticamente cuando lo inicie.",
  });
}
