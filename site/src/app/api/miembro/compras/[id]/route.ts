import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/require-session";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { sesion, respuesta } = await requireSession(req, ["miembro"]);
  if (!sesion) return respuesta;
  if (!sesion.personaId) {
    return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });
  }

  const { id } = await params;

  const { data: compra, error } = await supabaseAdmin
    .from("compras")
    .select(
      "id, paquete, lider, participaciones, monto, moneda, hash, vouchers, estado, aprobado_por, reporte_miembro, nota_miembro, mensajes_admin, creada_en, persona_id"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !compra || compra.persona_id !== sesion.personaId) {
    return NextResponse.json({ error: "Compra no encontrada." }, { status: 404 });
  }

  const { data: hashesExtra } = await supabaseAdmin
    .from("compra_hashes")
    .select("id, hash, creado_en")
    .eq("compra_id", id)
    .order("creado_en", { ascending: true });

  const { persona_id, ...compraSinPersonaId } = compra;
  void persona_id;

  return NextResponse.json({
    compra: compraSinPersonaId,
    hashesExtra: hashesExtra ?? [],
  });
}
