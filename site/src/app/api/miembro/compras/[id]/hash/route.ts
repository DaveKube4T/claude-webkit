import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/require-session";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { sesion, respuesta } = await requireSession(req, ["miembro"]);
  if (!sesion) return respuesta;
  if (!sesion.personaId) {
    return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const hash = typeof body?.hash === "string" ? body.hash.trim() : "";

  if (!hash) {
    return NextResponse.json({ error: "El hash no puede estar vacío." }, { status: 400 });
  }

  const { data: compra } = await supabaseAdmin
    .from("compras")
    .select("id, persona_id, hash")
    .eq("id", id)
    .maybeSingle();

  if (!compra || compra.persona_id !== sesion.personaId) {
    return NextResponse.json({ error: "Compra no encontrada." }, { status: 404 });
  }

  // Si todavía no hay hash principal, este pasa a serlo. Si ya hay uno,
  // se guarda como adicional en compra_hashes.
  if (!compra.hash) {
    const { error } = await supabaseAdmin
      .from("compras")
      .update({ hash, actualizada_en: new Date().toISOString() })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabaseAdmin.from("compra_hashes").insert({
      compra_id: id,
      hash,
      creado_por: sesion.personaId,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
