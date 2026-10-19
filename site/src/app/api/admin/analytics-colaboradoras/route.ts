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

  let query = supabaseAdmin.from("compras").select("lider, estado");

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

  const porColaboradora = new Map<string, { total: number; verificadas: number }>();
  let sinColaboradora = 0;

  for (const c of data ?? []) {
    if (!c.lider) {
      sinColaboradora++;
      continue;
    }
    const actual = porColaboradora.get(c.lider) ?? { total: 0, verificadas: 0 };
    actual.total++;
    if (c.estado === "verificada") actual.verificadas++;
    porColaboradora.set(c.lider, actual);
  }

  const totalConColaboradora = Array.from(porColaboradora.values()).reduce(
    (acc, v) => acc + v.total,
    0
  );

  const colaboradoras = Array.from(porColaboradora.entries())
    .map(([nombre, v]) => ({
      nombre,
      total: v.total,
      verificadas: v.verificadas,
      porcentaje: totalConColaboradora > 0 ? Math.round((v.total / totalConColaboradora) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return NextResponse.json({ colaboradoras, sinColaboradora, totalConColaboradora });
}
