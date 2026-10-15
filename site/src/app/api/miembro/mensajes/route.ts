import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/require-session";
import { notificarEquipo } from "@/lib/telegram";

export async function GET(req: NextRequest) {
  const { sesion, respuesta } = await requireSession(req, ["miembro"]);
  if (!sesion) return respuesta;
  if (!sesion.personaId) {
    return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });
  }

  const { data } = await supabaseAdmin
    .from("mensajes_telegram")
    .select("id, mensajes, resuelto, estado_conversacion, asunto")
    .eq("persona_id", sesion.personaId)
    .order("creado_en", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ conversacion: data ?? null });
}

export async function POST(req: NextRequest) {
  const { sesion, respuesta } = await requireSession(req, ["miembro"]);
  if (!sesion) return respuesta;
  if (!sesion.personaId) {
    return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const texto = typeof body?.texto === "string" ? body.texto.trim() : "";
  if (!texto) {
    return NextResponse.json({ error: "Escribí un mensaje." }, { status: 400 });
  }

  const { data: persona } = await supabaseAdmin
    .from("personas")
    .select("nombre, telegram")
    .eq("id", sesion.personaId)
    .maybeSingle();

  const nuevoMensaje = {
    autor: "miembro",
    texto,
    fecha: new Date().toISOString(),
  };

  // Reabre la conversación abierta más reciente si existe, o crea una nueva.
  const { data: existente } = await supabaseAdmin
    .from("mensajes_telegram")
    .select("id, mensajes")
    .eq("persona_id", sesion.personaId)
    .eq("estado_conversacion", "abierta")
    .order("creado_en", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existente) {
    const mensajesActuales = Array.isArray(existente.mensajes) ? existente.mensajes : [];
    const { error } = await supabaseAdmin
      .from("mensajes_telegram")
      .update({
        mensajes: [...mensajesActuales, nuevoMensaje],
        resuelto: false,
        actualizado_en: new Date().toISOString(),
      })
      .eq("id", existente.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabaseAdmin.from("mensajes_telegram").insert({
      persona_id: sesion.personaId,
      persona_nombre: persona?.nombre ?? null,
      persona_telegram: persona?.telegram ?? null,
      mensajes: [nuevoMensaje],
      resuelto: false,
      estado_conversacion: "abierta",
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await notificarEquipo(
    `🪶 Nuevo mensaje de ayuda de ${persona?.nombre ?? "un miembro"}: "${texto}"`
  ).catch(() => null);

  return NextResponse.json({ ok: true });
}
