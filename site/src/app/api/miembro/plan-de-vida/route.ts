import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/require-session";

export async function GET(req: NextRequest) {
  const { sesion, respuesta } = await requireSession(req, ["miembro"]);
  if (!sesion) return respuesta;
  if (!sesion.personaId) {
    return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("planes_vida")
    .select("*")
    .eq("persona_id", sesion.personaId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ plan: data ?? null });
}

export async function PATCH(req: NextRequest) {
  const { sesion, respuesta } = await requireSession(req, ["miembro"]);
  if (!sesion) return respuesta;
  if (!sesion.personaId) {
    return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const { completado } = body as { completado?: boolean };

  const { error } = await supabaseAdmin
    .from("planes_vida")
    .update({ completado: !!completado, actualizado_en: new Date().toISOString() })
    .eq("persona_id", sesion.personaId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
