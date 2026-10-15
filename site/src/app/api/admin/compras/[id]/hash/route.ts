import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/require-session";

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
  const hash = typeof body?.hash === "string" ? body.hash.trim() : "";

  if (!hash) {
    return NextResponse.json({ error: "El hash no puede estar vacío." }, { status: 400 });
  }

  const { data: compra } = await supabaseAdmin
    .from("compras")
    .select("id, hash")
    .eq("id", id)
    .maybeSingle();

  if (!compra) {
    return NextResponse.json({ error: "Compra no encontrada." }, { status: 404 });
  }

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
      creado_por: sesion.usuarioId,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
