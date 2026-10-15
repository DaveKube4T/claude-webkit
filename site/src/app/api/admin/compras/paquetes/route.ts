import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/require-session";

// Valores distintos de compras.paquete, para poblar el filtro en /admin/compras.
export async function GET(req: NextRequest) {
  const { sesion, respuesta } = await requireSession(req, [
    "superadmin",
    "admin",
    "verificador",
  ]);
  if (!sesion) return respuesta;

  let query = supabaseAdmin.from("compras").select("paquete, persona_id");

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

  const filas = data ?? [];
  const paquetes = Array.from(new Set(filas.map((c) => c.paquete))).sort();

  const porPaquete = new Map<string, { compras: number; personas: Set<string> }>();
  for (const f of filas) {
    if (!porPaquete.has(f.paquete)) porPaquete.set(f.paquete, { compras: 0, personas: new Set() });
    const entrada = porPaquete.get(f.paquete)!;
    entrada.compras += 1;
    entrada.personas.add(f.persona_id);
  }
  const resumen = paquetes.map((p) => {
    const entrada = porPaquete.get(p)!;
    return { paquete: p, compras: entrada.compras, personas: entrada.personas.size };
  });

  return NextResponse.json({
    paquetes,
    resumen,
    totalCompras: filas.length,
    totalPersonas: new Set(filas.map((f) => f.persona_id)).size,
  });
}
