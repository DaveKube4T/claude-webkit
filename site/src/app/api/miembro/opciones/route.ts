import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireSession } from "@/lib/require-session";

export async function GET(req: NextRequest) {
  const { sesion, respuesta } = await requireSession(req, ["miembro"]);
  if (!sesion) return respuesta;

  const { data } = await supabaseAdmin.from("compras").select("paquete, lider");

  const paquetes = Array.from(
    new Set((data ?? []).map((c) => c.paquete).filter(Boolean))
  ).sort();
  const colaboradores = Array.from(
    new Set((data ?? []).map((c) => c.lider).filter(Boolean))
  ).sort();

  return NextResponse.json({ paquetes, colaboradores });
}
