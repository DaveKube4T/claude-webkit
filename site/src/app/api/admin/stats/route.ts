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

  const [personas, compras, pendientes, verificadas, rechazadas, errores] =
    await Promise.all([
      supabaseAdmin.from("personas").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("compras").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("compras")
        .select("id", { count: "exact", head: true })
        .eq("estado", "pendiente"),
      supabaseAdmin
        .from("compras")
        .select("id", { count: "exact", head: true })
        .eq("estado", "verificada"),
      supabaseAdmin
        .from("compras")
        .select("id", { count: "exact", head: true })
        .eq("estado", "rechazada"),
      supabaseAdmin
        .from("compras")
        .select("id", { count: "exact", head: true })
        .eq("estado", "error_reportado"),
    ]);

  return NextResponse.json({
    totalPersonas: personas.count ?? 0,
    totalCompras: compras.count ?? 0,
    pendientes: pendientes.count ?? 0,
    verificadas: verificadas.count ?? 0,
    rechazadas: rechazadas.count ?? 0,
    errores: errores.count ?? 0,
  });
}
