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

  const { data, error } = await supabaseAdmin
    .from("solicitudes_compra")
    .select("id, paquete, lider, participaciones, hash, voucher_url, estado, creada_en")
    .eq("persona_id", sesion.personaId)
    .order("creada_en", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ solicitudes: data ?? [] });
}

export async function POST(req: NextRequest) {
  const { sesion, respuesta } = await requireSession(req, ["miembro"]);
  if (!sesion) return respuesta;
  if (!sesion.personaId) {
    return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const paquete = typeof body?.paquete === "string" ? body.paquete.trim() : "";
  const lider = typeof body?.lider === "string" ? body.lider.trim() : "";
  const comentario = typeof body?.comentario === "string" ? body.comentario.trim() : "";
  const hash = typeof body?.hash === "string" ? body.hash.trim() : "";

  if (!paquete) {
    return NextResponse.json({ error: "Elegí o escribí un paquete." }, { status: 400 });
  }

  const { data: persona } = await supabaseAdmin
    .from("personas")
    .select("nombre, telegram")
    .eq("id", sesion.personaId)
    .maybeSingle();

  const { data: nueva, error } = await supabaseAdmin
    .from("solicitudes_compra")
    .insert({
      persona_id: sesion.personaId,
      persona_nombre: persona?.nombre ?? null,
      persona_telegram: persona?.telegram ?? null,
      paquete,
      lider: lider || null,
      comentario: comentario || null,
      hash: hash || null,
      estado: "pendiente",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const esAleman = /alem[aá]n/i.test(paquete);
  const textoNotif = esAleman
    ? `🚨 ¡NUEVA SOLICITUD - PAQUETE ALEMÁN!\n👤 Miembro: ${persona?.nombre ?? "Desconeado"}\n💬 Telegram: @${persona?.telegram ?? "N/D"}\n\n👉 ¡Recordar admitir en los grupos privados de Telegram y Signal!`
    : `✨ Nueva solicitud de ${persona?.nombre ?? "un miembro"}: ${paquete}.`;

  await notificarEquipo(textoNotif).catch(() => null);

  return NextResponse.json({ ok: true, id: nueva.id });
}
