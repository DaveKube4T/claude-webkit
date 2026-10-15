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
  const mensaje = typeof body?.mensaje === "string" ? body.mensaje.trim() : "";

  const { data: compra } = await supabaseAdmin
    .from("compras")
    .select("id, persona_id")
    .eq("id", id)
    .maybeSingle();

  if (!compra || compra.persona_id !== sesion.personaId) {
    return NextResponse.json({ error: "Compra no encontrada." }, { status: 404 });
  }

  const { error } = await supabaseAdmin
    .from("compras")
    .update({
      estado: "error_reportado",
      reporte_miembro: mensaje || null,
      actualizada_en: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
