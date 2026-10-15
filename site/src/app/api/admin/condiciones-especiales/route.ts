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

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  let query = supabaseAdmin
    .from("compras")
    .select("id, persona_id, persona_nombre, persona_telegram, paquete, estado, condicion_especial, creada_en")
    .not("condicion_especial", "is", null)
    .neq("condicion_especial", "")
    .order("creada_en", { ascending: false })
    .limit(200);

  if (q) {
    query = query.or(
      `persona_nombre.ilike.%${q}%,persona_telegram.ilike.%${q}%,condicion_especial.ilike.%${q}%`
    );
  }

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

  return NextResponse.json({ compras: data ?? [] });
}
