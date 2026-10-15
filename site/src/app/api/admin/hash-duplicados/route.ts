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

  let query = supabaseAdmin
    .from("compras")
    .select("id, persona_nombre, persona_telegram, paquete, estado, hash, creada_en")
    .not("hash", "is", null)
    .neq("hash", "")
    .order("creada_en", { ascending: false });

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

  const porHash = new Map<string, typeof data>();
  for (const c of data ?? []) {
    const grupo = porHash.get(c.hash!) ?? [];
    grupo.push(c);
    porHash.set(c.hash!, grupo);
  }

  const grupos = Array.from(porHash.entries())
    .filter(([, compras]) => compras.length > 1)
    .map(([hash, compras]) => ({ hash, compras }))
    .sort((a, b) => b.compras.length - a.compras.length);

  return NextResponse.json({ grupos });
}
