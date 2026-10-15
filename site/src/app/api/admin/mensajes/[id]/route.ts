import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/require-session";
import { notificarPersona } from "@/lib/telegram";

export async function PATCH(
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

  const { data: conversacion } = await supabaseAdmin
    .from("mensajes_telegram")
    .select("mensajes, persona_id")
    .eq("id", id)
    .maybeSingle();

  if (!conversacion) {
    return NextResponse.json({ error: "Conversación no encontrada." }, { status: 404 });
  }

  const cambios: Record<string, unknown> = { actualizado_en: new Date().toISOString() };
  let textoRespuesta: string | null = null;

  if (typeof body?.texto === "string" && body.texto.trim()) {
    textoRespuesta = body.texto.trim();
    const mensajesActuales = Array.isArray(conversacion.mensajes) ? conversacion.mensajes : [];
    cambios.mensajes = [
      ...mensajesActuales,
      { autor: "equipo", texto: textoRespuesta, fecha: new Date().toISOString() },
    ];
  }

  if (typeof body?.resuelto === "boolean") {
    cambios.resuelto = body.resuelto;
    cambios.estado_conversacion = body.resuelto ? "resuelta" : "abierta";
  }

  const { error } = await supabaseAdmin
    .from("mensajes_telegram")
    .update(cambios)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (textoRespuesta) {
    notificarPersona(
      conversacion.persona_id,
      `🪶 El equipo de Resonancia te respondió: "${textoRespuesta}"`
    ).catch(() => null);
  }

  return NextResponse.json({ ok: true });
}
