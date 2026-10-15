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
    .from("compras")
    .select(
      "id, paquete, lider, participaciones, monto, moneda, hash, vouchers, estado, creada_en"
    )
    .eq("persona_id", sesion.personaId)
    .eq("es_mi_equipo", true)
    .order("creada_en", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ compras: data ?? [] });
}
