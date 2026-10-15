import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/require-session";

export async function GET(req: NextRequest) {
  const { sesion, respuesta } = await requireSession(req, [
    "superadmin",
    "admin",
    "verificador",
  ]);
  if (!sesion) return respuesta;

  const estado = new URL(req.url).searchParams.get("estado");

  let query = supabaseAdmin
    .from("solicitudes_compra")
    .select(
      "id, persona_id, persona_nombre, persona_telegram, paquete, lider, comentario, participaciones, hash, voucher_url, estado, revisado_por, revisado_en, creada_en"
    )
    .order("creada_en", { ascending: false })
    .limit(200);

  if (estado) query = query.eq("estado", estado);

  if (sesion.rol === "verificador" && sesion.usuarioId) {
    const { data: cuenta } = await supabaseAdmin
      .from("usuarios")
      .select("paquetes_asignados")
      .eq("id", sesion.usuarioId)
      .maybeSingle();
    const asignados: string[] = cuenta?.paquetes_asignados ?? [];
    if (asignados.length > 0) query = query.in("paquete", asignados);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ solicitudes: data ?? [] });
}
